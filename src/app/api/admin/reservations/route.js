import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    // TODO: Verify admin auth from Authorization header

    const { data, error } = await supabaseAdmin
      .from('reservations')
      .select(`
        *,
        reservation_items (product_id, quantity, unit_price, products(name, name_es)),
        contracts (id, status, signed_at),
        payments (id, type, amount, status, square_invoice_url)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Admin list reservations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
