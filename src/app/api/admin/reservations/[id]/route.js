import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(request, { params }) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const { id } = await params;

    const { data: reservation, error } = await supabaseAdmin
      .from('reservations')
      .select(`
        *,
        reservation_items (product_id, quantity, unit_price, products(name, name_es, category)),
        contracts (id, status, contract_html, contract_hash, initials, signed_at, signer_ip),
        payments (id, type, amount, amount_cents, status, square_invoice_id, square_invoice_url, square_payment_id, error_message, created_at),
        stock_holds (id, product_id, quantity, status, expires_at),
        reservation_status_log (id, from_status, to_status, changed_by, reason, created_at)
      `)
      .eq('id', id)
      .single();

    if (error || !reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    // Sort status log by created_at
    if (reservation.reservation_status_log) {
      reservation.reservation_status_log.sort((a, b) =>
        new Date(a.created_at) - new Date(b.created_at)
      );
    }

    return NextResponse.json(reservation);
  } catch (error) {
    console.error('Admin get reservation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
