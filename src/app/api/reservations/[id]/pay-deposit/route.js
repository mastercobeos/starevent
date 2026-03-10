import { NextResponse } from 'next/server';
import { SquareClient, SquareEnvironment } from 'square';
import { supabaseAdmin } from '@/lib/supabase-server';
import { STATUS, canTransition } from '@/lib/reservation-state-machine';
import { squareIdempotencyKey } from '@/lib/idempotency';
import { checkRateLimit, getClientIp, verifyReservationToken } from '@/lib/security';
import { sendReservationConfirmation } from '@/lib/email';

const squareClient = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN,
  environment: process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT === 'production'
    ? SquareEnvironment.Production
    : SquareEnvironment.Sandbox,
});

export async function POST(request, { params }) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    // Rate limit: 10 payment attempts per hour per IP
    const ip = getClientIp(request);
    const rl = checkRateLimit(`pay_deposit:${ip}`, 10, 60 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many payment attempts' }, { status: 429 });
    }

    if (!process.env.SQUARE_ACCESS_TOKEN) {
      return NextResponse.json({ error: 'Payment system not configured' }, { status: 500 });
    }

    const { id } = await params;

    // SECURITY: Verify reservation access token
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    if (!verifyReservationToken(id, token)) {
      return NextResponse.json({ error: 'Invalid or missing access token' }, { status: 403 });
    }

    const { sourceId } = await request.json();

    if (!sourceId) {
      return NextResponse.json({ error: 'Payment token is required' }, { status: 400 });
    }

    // Fetch reservation
    const { data: reservation, error: resError } = await supabaseAdmin
      .from('reservations')
      .select('id, status, client_email, first_name, last_name, deposit_amount, total')
      .eq('id', id)
      .single();

    if (resError || !reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    // Validate state
    if (!canTransition(reservation.status, STATUS.DEPOSIT_PAID)) {
      return NextResponse.json(
        { error: `Cannot pay deposit in status "${reservation.status}"` },
        { status: 409 }
      );
    }

    // Check if deposit already paid (idempotency)
    const { data: existingPayment } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('reservation_id', id)
      .eq('type', 'deposit')
      .eq('status', 'completed')
      .single();

    if (existingPayment) {
      return NextResponse.json({
        reservation_id: id,
        status: STATUS.DEPOSIT_PAID,
        payment_id: existingPayment.id,
        message: 'Deposit already paid',
      });
    }

    const idempKey = squareIdempotencyKey(id, 'pay_deposit');
    const depositCents = Math.round(reservation.deposit_amount * 100);

    // Process payment directly via Square Payments API
    const payment = await squareClient.payments.create({
      sourceId,
      idempotencyKey: idempKey,
      amountMoney: {
        amount: BigInt(depositCents),
        currency: 'USD',
      },
      locationId: process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID,
      note: `Deposit 40% #${id.slice(0, 8)}`,
      buyerEmailAddress: reservation.client_email,
    });

    const isCompleted = payment.status === 'COMPLETED';

    // Record payment
    await supabaseAdmin.from('payments').upsert({
      reservation_id: id,
      type: 'deposit',
      amount: reservation.deposit_amount,
      amount_cents: depositCents,
      square_payment_id: payment.id,
      idempotency_key: idempKey,
      status: isCompleted ? 'completed' : 'pending',
    }, { onConflict: 'reservation_id,type' });

    // Update reservation status if payment completed
    if (isCompleted) {
      await supabaseAdmin
        .from('reservations')
        .update({ status: STATUS.DEPOSIT_PAID })
        .eq('id', id);

      // Send confirmation emails (fire-and-forget)
      supabaseAdmin
        .from('reservations')
        .select('*, reservation_items(product_id, quantity, unit_price, products(name))')
        .eq('id', id)
        .single()
        .then(({ data: fullRes }) => {
          if (!fullRes) return;
          const items = (fullRes.reservation_items || []).map(ri => ({
            name: ri.products?.name || ri.product_id,
            quantity: ri.quantity,
            unit_price: ri.unit_price,
          }));
          sendReservationConfirmation(fullRes, items);
        })
        .catch(err => console.error('Email fetch error:', err.message));
    }

    return NextResponse.json({
      reservation_id: id,
      payment_id: payment.id,
      payment_status: payment.status,
      status: isCompleted ? STATUS.DEPOSIT_PAID : 'payment_pending',
    });
  } catch (error) {
    console.error('Pay deposit error:', error);

    // Handle Square API errors — log details for debugging
    const squareErrors = error?.errors;
    if (squareErrors) {
      console.error('Square API errors:', JSON.stringify(squareErrors, null, 2));
      const detail = squareErrors[0]?.detail || 'Payment was declined';
      return NextResponse.json({ error: `Payment was declined: ${detail}` }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
}
