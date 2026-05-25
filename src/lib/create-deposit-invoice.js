import { supabaseAdmin } from '@/lib/supabase-server';
import { STATUS, canTransition } from '@/lib/reservation-state-machine';
import { squareIdempotencyKey } from '@/lib/idempotency';

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

function addDaysISO(isoDate, days) {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split('T')[0];
}

// Deposit must be paid promptly to lock the reservation. Default: 2 days from today.
function depositDueDate() {
  return addDaysISO(todayISO(), 2);
}

/**
 * Creates a Square hosted invoice for the deposit (40%) of a reservation.
 * Used by pay-deposit route when the client cannot supply a Square Web Payments
 * SDK sourceId (e.g. after admin approval, when they sign via the email link).
 *
 * Mirrors createBalanceInvoice: the customer receives the invoice by email and
 * pays on Square-hosted URL. Webhook handles state transition on payment.
 *
 * Returns { ok, data } where data contains the result or error info.
 */
export async function createDepositInvoice(reservationId) {
  const { data: reservation, error: resError } = await supabaseAdmin
    .from('reservations')
    .select(`
      id, status, client_email, first_name, last_name,
      deposit_amount, balance_amount, total, event_date,
      subtotal, delivery_fee, delivery_miles, same_day_pickup_fee, same_day_pickup,
      tax_amount, rental_days,
      reservation_items (product_id, quantity, unit_price, products(name))
    `)
    .eq('id', reservationId)
    .single();

  if (resError || !reservation) {
    return { ok: false, status: 404, data: { error: 'Reservation not found' } };
  }

  if (!canTransition(reservation.status, STATUS.DEPOSIT_PAID)) {
    return {
      ok: false,
      status: 409,
      data: { error: `Cannot create deposit invoice in status "${reservation.status}"` },
    };
  }

  // If a deposit payment is already completed, short-circuit.
  const { data: existingCompleted } = await supabaseAdmin
    .from('payments')
    .select('*')
    .eq('reservation_id', reservationId)
    .eq('type', 'deposit')
    .eq('status', 'completed')
    .maybeSingle();

  if (existingCompleted) {
    return {
      ok: true,
      data: {
        reservation_id: reservationId,
        status: STATUS.DEPOSIT_PAID,
        payment_id: existingCompleted.id,
        message: 'Deposit already paid',
      },
    };
  }

  // If a pending invoice already exists, return its URL (idempotent re-call).
  const { data: pendingPayment } = await supabaseAdmin
    .from('payments')
    .select('*')
    .eq('reservation_id', reservationId)
    .eq('type', 'deposit')
    .eq('status', 'pending')
    .maybeSingle();

  if (pendingPayment?.square_invoice_url) {
    return {
      ok: true,
      data: {
        reservation_id: reservationId,
        invoice_id: pendingPayment.square_invoice_id,
        invoice_url: pendingPayment.square_invoice_url,
        deposit_amount: reservation.deposit_amount,
        status: 'invoice_already_created',
      },
    };
  }

  const idempKey = squareIdempotencyKey(reservationId, 'invoice_deposit');
  const depositCents = Math.round(reservation.deposit_amount * 100);
  const rentalDays = Number(reservation.rental_days) || 1;

  const lineItems = (reservation.reservation_items || []).map((ri) => ({
    name: ri.products?.name || ri.product_id,
    quantity: ri.quantity,
    unitPriceCents: Math.round(Number(ri.unit_price) * 100),
    rentalDays,
  }));

  const invoiceResponse = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-square-invoice`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        reservationId,
        type: 'deposit',
        amount: depositCents,
        customerEmail: reservation.client_email,
        customerName: `${reservation.first_name} ${reservation.last_name}`,
        description: `Deposit (40%) — Reservation #${reservationId.slice(0, 8)}`,
        dueDate: depositDueDate(),
        idempotencyKey: idempKey,
        lineItems,
        deliveryFeeCents: Math.round(Number(reservation.delivery_fee || 0) * 100),
        deliveryMiles: reservation.delivery_miles || null,
        sameDayPickupFeeCents: Math.round(Number(reservation.same_day_pickup_fee || 0) * 100),
        taxAmountCents: Math.round(Number(reservation.tax_amount || 0) * 100),
        depositPaidCents: 0,
        rentalDays,
      }),
    }
  );

  const invoiceData = await invoiceResponse.json();

  if (!invoiceResponse.ok || invoiceData.error) {
    await supabaseAdmin.from('payments').upsert({
      reservation_id: reservationId,
      type: 'deposit',
      amount: reservation.deposit_amount,
      amount_cents: depositCents,
      idempotency_key: idempKey,
      status: 'failed',
      error_message: invoiceData.error || 'Invoice creation failed',
    }, { onConflict: 'reservation_id,type' });

    return {
      ok: false,
      status: 400,
      data: { error: invoiceData.error || 'Failed to create deposit invoice' },
    };
  }

  await supabaseAdmin.from('payments').upsert({
    reservation_id: reservationId,
    type: 'deposit',
    amount: reservation.deposit_amount,
    amount_cents: depositCents,
    square_invoice_id: invoiceData.invoiceId,
    square_invoice_url: invoiceData.invoiceUrl,
    idempotency_key: idempKey,
    status: 'pending',
  }, { onConflict: 'reservation_id,type' });

  return {
    ok: true,
    data: {
      reservation_id: reservationId,
      invoice_id: invoiceData.invoiceId,
      invoice_url: invoiceData.invoiceUrl,
      deposit_amount: reservation.deposit_amount,
      status: 'invoice_created',
    },
  };
}
