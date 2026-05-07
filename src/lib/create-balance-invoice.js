import { supabaseAdmin } from '@/lib/supabase-server';
import { STATUS, canTransition } from '@/lib/reservation-state-machine';
import { squareIdempotencyKey } from '@/lib/idempotency';

function subtractDaysISO(isoDate, days) {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().split('T')[0];
}

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

function addDaysISO(isoDate, days) {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split('T')[0];
}

// Returns the balance invoice due date, clamped so it's never in the past.
// Default rule: 48h before the event. If that's already past, give the client
// at least 1 day to pay from today.
function balanceDueDate(eventDate) {
  const ideal = subtractDaysISO(eventDate, 2);
  const minimum = addDaysISO(todayISO(), 1);
  return ideal > minimum ? ideal : minimum;
}

/**
 * Creates a Square balance invoice for a reservation.
 * Shared by the pay-balance API route and the Square webhook handler.
 *
 * Returns { ok, data } where data contains the result or error info.
 */
export async function createBalanceInvoice(reservationId) {
  // Fetch reservation with items for itemized invoice
  const { data: reservation, error: resError } = await supabaseAdmin
    .from('reservations')
    .select(`
      id, status, client_email, first_name, last_name,
      balance_amount, deposit_amount, total, event_date,
      subtotal, delivery_fee, delivery_miles, same_day_pickup_fee, same_day_pickup,
      tax_amount, rental_days,
      reservation_items (product_id, quantity, unit_price, products(name))
    `)
    .eq('id', reservationId)
    .single();

  if (resError || !reservation) {
    return { ok: false, status: 404, data: { error: 'Reservation not found' } };
  }

  // Validate state
  if (!canTransition(reservation.status, STATUS.PAID_IN_FULL)) {
    return {
      ok: false,
      status: 409,
      data: { error: `Cannot pay balance in status "${reservation.status}"` },
    };
  }

  // Check if balance already paid
  const { data: existingPayment } = await supabaseAdmin
    .from('payments')
    .select('*')
    .eq('reservation_id', reservationId)
    .eq('type', 'balance')
    .eq('status', 'completed')
    .single();

  if (existingPayment) {
    return {
      ok: true,
      data: {
        reservation_id: reservationId,
        status: STATUS.PAID_IN_FULL,
        payment_id: existingPayment.id,
        message: 'Balance already paid',
      },
    };
  }

  // Check if invoice already exists and is pending
  const { data: pendingPayment } = await supabaseAdmin
    .from('payments')
    .select('*')
    .eq('reservation_id', reservationId)
    .eq('type', 'balance')
    .eq('status', 'pending')
    .single();

  if (pendingPayment?.square_invoice_url) {
    return {
      ok: true,
      data: {
        reservation_id: reservationId,
        invoice_id: pendingPayment.square_invoice_id,
        invoice_url: pendingPayment.square_invoice_url,
        balance_amount: reservation.balance_amount,
        status: 'invoice_already_created',
      },
    };
  }

  // Create Square Invoice for balance via Edge Function
  const idempKey = squareIdempotencyKey(reservationId, 'invoice_balance');
  const balanceCents = Math.round(reservation.balance_amount * 100);
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
        type: 'balance',
        amount: balanceCents,
        customerEmail: reservation.client_email,
        customerName: `${reservation.first_name} ${reservation.last_name}`,
        description: `Balance (60%) — Reservation #${reservationId.slice(0, 8)}`,
        dueDate: balanceDueDate(reservation.event_date),
        idempotencyKey: idempKey,
        lineItems,
        deliveryFeeCents: Math.round(Number(reservation.delivery_fee || 0) * 100),
        deliveryMiles: reservation.delivery_miles || null,
        sameDayPickupFeeCents: Math.round(Number(reservation.same_day_pickup_fee || 0) * 100),
        taxAmountCents: Math.round(Number(reservation.tax_amount || 0) * 100),
        depositPaidCents: depositCents,
        rentalDays,
      }),
    }
  );

  const invoiceData = await invoiceResponse.json();

  if (!invoiceResponse.ok || invoiceData.error) {
    await supabaseAdmin.from('payments').upsert({
      reservation_id: reservationId,
      type: 'balance',
      amount: reservation.balance_amount,
      amount_cents: balanceCents,
      idempotency_key: idempKey,
      status: 'failed',
      error_message: invoiceData.error || 'Invoice creation failed',
    }, { onConflict: 'reservation_id,type' });

    return {
      ok: false,
      status: 400,
      data: { error: invoiceData.error || 'Failed to create balance invoice' },
    };
  }

  // Record payment as pending
  await supabaseAdmin.from('payments').upsert({
    reservation_id: reservationId,
    type: 'balance',
    amount: reservation.balance_amount,
    amount_cents: balanceCents,
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
      balance_amount: reservation.balance_amount,
      status: 'invoice_created',
    },
  };
}
