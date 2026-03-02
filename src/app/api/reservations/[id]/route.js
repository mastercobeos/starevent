import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(request, { params }) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const { id } = await params;

    // Optional token verification for client access
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    // TODO: Verify HMAC token for client-facing access

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

    return NextResponse.json(reservation);
  } catch (error) {
    console.error('Fetch reservation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
