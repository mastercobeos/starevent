import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { STATUS, canTransition } from '@/lib/reservation-state-machine';
import { verifySquareWebhookSignature } from '@/lib/security';
import { sendReservationConfirmation, sendPaymentCompleteEmail } from '@/lib/email';

// Square webhook handler for invoice payment events
export async function POST(request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    // Read raw body for signature verification
    const rawBody = await request.text();

    // SECURITY: Verify Square webhook signature (HMAC-SHA256) — mandatory
    const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
    if (!signatureKey) {
      console.error('CRITICAL: SQUARE_WEBHOOK_SIGNATURE_KEY not configured — rejecting webhook');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
    }

    const isValid = verifySquareWebhookSignature(request, rawBody, signatureKey);
    if (!isValid) {
      console.error('Square webhook: invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    const body = JSON.parse(rawBody);
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
            const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
              || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
            const res = await fetch(
              `${baseUrl}/api/reservations/${reservation.id}/pay-balance`,
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

          // Send deposit confirmation email to client + business
          try {
            const { data: fullRes } = await supabaseAdmin
              .from('reservations')
              .select('*, reservation_items(product_id, quantity, unit_price, products(name))')
              .eq('id', reservation.id)
              .single();

            if (fullRes) {
              const items = (fullRes.reservation_items || []).map(ri => ({
                name: ri.products?.name || ri.product_id,
                quantity: ri.quantity,
                unit_price: ri.unit_price,
              }));
              await sendReservationConfirmation(fullRes, items);
            }
          } catch (emailErr) {
            console.error('Deposit confirmation email error:', emailErr.message);
          }
        }
      } else if (payment.type === 'balance') {
        // Balance paid → paid_in_full
        if (canTransition(reservation.status, STATUS.PAID_IN_FULL)) {
          await supabaseAdmin
            .from('reservations')
            .update({ status: STATUS.PAID_IN_FULL })
            .eq('id', reservation.id);

          // Send payment complete email to client + business
          try {
            const { data: fullRes } = await supabaseAdmin
              .from('reservations')
              .select('*, reservation_items(product_id, quantity, unit_price, products(name))')
              .eq('id', reservation.id)
              .single();

            if (fullRes) {
              const items = (fullRes.reservation_items || []).map(ri => ({
                name: ri.products?.name || ri.product_id,
                quantity: ri.quantity,
                unit_price: ri.unit_price,
              }));
              await sendPaymentCompleteEmail(fullRes, items);
            }
          } catch (emailErr) {
            console.error('Payment complete email error:', emailErr.message);
          }
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
