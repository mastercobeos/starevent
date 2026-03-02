import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { STATUS, canTransition } from '@/lib/reservation-state-machine';

// Square webhook handler for invoice payment events
export async function POST(request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const body = await request.json();

    // TODO: Verify Square webhook signature
    // const signature = request.headers.get('x-square-hmacsha256-signature');
    // Verify against SQUARE_WEBHOOK_SIGNATURE_KEY

    const eventType = body.type;
    const eventData = body.data?.object;

    if (!eventType || !eventData) {
      return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
    }

    // Handle invoice payment events
    if (eventType === 'invoice.payment_made' || eventType === 'invoice.paid') {
      const invoice = eventData.invoice || eventData;
      const invoiceId = invoice.id;
      const paymentStatus = invoice.status; // PAID, PARTIALLY_PAID, etc.

      if (paymentStatus !== 'PAID') {
        // Not fully paid yet, acknowledge but don't process
        return NextResponse.json({ received: true, processed: false });
      }

      // Find our payment record by square_invoice_id
      const { data: payment, error: paymentError } = await supabaseAdmin
        .from('payments')
        .select('*, reservations(id, status)')
        .eq('square_invoice_id', invoiceId)
        .single();

      if (paymentError || !payment) {
        console.error('Webhook: payment not found for invoice', invoiceId);
        return NextResponse.json({ received: true, processed: false });
      }

      // Already completed? (idempotent)
      if (payment.status === 'completed') {
        return NextResponse.json({ received: true, processed: true, duplicate: true });
      }

      // Extract Square payment ID from invoice payments
      const squarePaymentId = invoice.payment_requests?.[0]?.computed_amount_money
        ? invoiceId // Use invoice ID as reference
        : invoiceId;

      // Update payment record
      await supabaseAdmin
        .from('payments')
        .update({
          status: 'completed',
          square_payment_id: squarePaymentId,
        })
        .eq('id', payment.id);

      // Update reservation status based on payment type
      const reservation = payment.reservations;
      if (payment.type === 'deposit') {
        // Deposit paid → deposit_paid → balance_due
        if (canTransition(reservation.status, STATUS.DEPOSIT_PAID)) {
          await supabaseAdmin
            .from('reservations')
            .update({ status: STATUS.DEPOSIT_PAID })
            .eq('id', reservation.id);

          // Immediately transition to balance_due
          await supabaseAdmin
            .from('reservations')
            .update({ status: STATUS.BALANCE_DUE })
            .eq('id', reservation.id);

          // Create balance invoice automatically
          try {
            const res = await fetch(
              `${process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || 'http://localhost:3000'}/api/reservations/${reservation.id}/pay-balance`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
              }
            );
            if (!res.ok) {
              console.error('Failed to auto-create balance invoice');
            }
          } catch (e) {
            console.error('Auto-create balance invoice error:', e);
          }

          // TODO: Send deposit confirmation notification
        }
      } else if (payment.type === 'balance') {
        // Balance paid → paid_in_full
        if (canTransition(reservation.status, STATUS.PAID_IN_FULL)) {
          await supabaseAdmin
            .from('reservations')
            .update({ status: STATUS.PAID_IN_FULL })
            .eq('id', reservation.id);

          // TODO: Send final confirmation notification
        }
      }

      return NextResponse.json({ received: true, processed: true });
    }

    // Acknowledge other event types
    return NextResponse.json({ received: true, processed: false });
  } catch (error) {
    console.error('Square webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
