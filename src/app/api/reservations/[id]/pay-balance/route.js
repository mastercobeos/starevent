import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { STATUS, canTransition } from '@/lib/reservation-state-machine';
import { squareIdempotencyKey } from '@/lib/idempotency';

export async function POST(request, { params }) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const { id } = await params;

    // Fetch reservation
    const { data: reservation, error: resError } = await supabaseAdmin
      .from('reservations')
      .select('id, status, client_email, first_name, last_name, balance_amount, total, event_date')
      .eq('id', id)
      .single();

    if (resError || !reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    // Validate state
    if (!canTransition(reservation.status, STATUS.PAID_IN_FULL)) {
      return NextResponse.json(
        { error: `Cannot pay balance in status "${reservation.status}"` },
        { status: 409 }
      );
    }

    // Check if balance already paid
    const { data: existingPayment } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('reservation_id', id)
      .eq('type', 'balance')
      .eq('status', 'completed')
      .single();

    if (existingPayment) {
      return NextResponse.json({
        reservation_id: id,
        status: STATUS.PAID_IN_FULL,
        payment_id: existingPayment.id,
        message: 'Balance already paid',
      });
    }

    // Check if invoice already exists and is pending
    const { data: pendingPayment } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('reservation_id', id)
      .eq('type', 'balance')
      .eq('status', 'pending')
      .single();

    if (pendingPayment?.square_invoice_url) {
      return NextResponse.json({
        reservation_id: id,
        invoice_id: pendingPayment.square_invoice_id,
        invoice_url: pendingPayment.square_invoice_url,
        balance_amount: reservation.balance_amount,
        status: 'invoice_already_created',
      });
    }

    // Create Square Invoice for balance via Edge Function
    const idempKey = squareIdempotencyKey(id, 'invoice_balance');
    const balanceCents = Math.round(reservation.balance_amount * 100);

    const invoiceResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-square-invoice`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          reservationId: id,
          type: 'balance',
          amount: balanceCents,
          customerEmail: reservation.client_email,
          customerName: `${reservation.first_name} ${reservation.last_name}`,
          description: `Balance (60%) — Reservation #${id.slice(0, 8)}`,
          dueDate: reservation.event_date,
          idempotencyKey: idempKey,
        }),
      }
    );

    const invoiceData = await invoiceResponse.json();

    if (!invoiceResponse.ok || invoiceData.error) {
      await supabaseAdmin.from('payments').upsert({
        reservation_id: id,
        type: 'balance',
        amount: reservation.balance_amount,
        amount_cents: balanceCents,
        idempotency_key: idempKey,
        status: 'failed',
        error_message: invoiceData.error || 'Invoice creation failed',
      }, { onConflict: 'reservation_id,type' });

      return NextResponse.json(
        { error: invoiceData.error || 'Failed to create balance invoice' },
        { status: 400 }
      );
    }

    // Record payment as pending
    await supabaseAdmin.from('payments').upsert({
      reservation_id: id,
      type: 'balance',
      amount: reservation.balance_amount,
      amount_cents: balanceCents,
      square_invoice_id: invoiceData.invoiceId,
      square_invoice_url: invoiceData.invoiceUrl,
      idempotency_key: idempKey,
      status: 'pending',
    }, { onConflict: 'reservation_id,type' });

    return NextResponse.json({
      reservation_id: id,
      invoice_id: invoiceData.invoiceId,
      invoice_url: invoiceData.invoiceUrl,
      balance_amount: reservation.balance_amount,
      status: 'invoice_created',
    });
  } catch (error) {
    console.error('Pay balance error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process balance' },
      { status: 500 }
    );
  }
}
