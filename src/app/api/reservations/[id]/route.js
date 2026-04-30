import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { verifyReservationToken, checkRateLimit, getClientIp, isValidUUID, getAccessToken } from '@/lib/security';
import { renderContract, hashContract } from '@/lib/contract-template';
import { STATUS } from '@/lib/reservation-state-machine';

export async function GET(request, { params }) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const { id } = await params;
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Invalid reservation ID' }, { status: 400 });
    }

    // Rate limit: 30 requests per hour per IP
    const ip = getClientIp(request);
    const rl = checkRateLimit(`reservation_get:${ip}`, 30, 60 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // Verify HMAC token for client-facing access
    const token = getAccessToken(request);
    if (!token || !verifyReservationToken(id, token)) {
      return NextResponse.json({ error: 'Invalid or missing access token' }, { status: 403 });
    }

    // Fetch reservation with related data
    const { data: reservation, error } = await supabaseAdmin
      .from('reservations')
      .select(`
        *,
        reservation_items (product_id, quantity, unit_price, products(name, name_es)),
        contracts (id, status, contract_html, contract_hash, initials, signed_at),
        payments (id, type, amount, status, square_invoice_id, square_invoice_url)
      `)
      .eq('id', id)
      .single();

    if (error || !reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    // Self-heal: if the reservation is approved but the contract row is missing
    // (silent insert failure on creation/approval), regenerate it on the fly so
    // the client can sign without admin intervention.
    const needsContract =
      reservation.status === STATUS.APPROVED_WAITING_CONTRACT &&
      (!reservation.contracts || reservation.contracts.length === 0);

    if (needsContract) {
      try {
        const contractItems = (reservation.reservation_items || []).map((ri) => ({
          product_id: ri.product_id,
          product_name: ri.products?.name || ri.product_id,
          quantity: ri.quantity,
          unit_price: ri.unit_price,
        }));

        const contractHtml = renderContract(
          reservation,
          contractItems,
          reservation.language || 'en'
        );
        const contractHash = await hashContract(contractHtml);

        const { data: inserted, error: insertError } = await supabaseAdmin
          .from('contracts')
          .insert({
            reservation_id: id,
            contract_html: contractHtml,
            contract_hash: contractHash,
            status: 'pending',
          })
          .select('id, status, contract_html, contract_hash, initials, signed_at')
          .single();

        if (insertError) {
          console.error('Contract auto-recovery failed:', insertError);
        } else if (inserted) {
          reservation.contracts = [inserted];
        }
      } catch (recoveryErr) {
        console.error('Contract auto-recovery threw:', recoveryErr);
      }
    }

    return NextResponse.json(reservation);
  } catch (error) {
    console.error('Fetch reservation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
