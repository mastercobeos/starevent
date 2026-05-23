import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { verifyAdmin } from '@/lib/auth-middleware';

export async function GET(request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    // Verify admin authentication
    const auth = await verifyAdmin(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // Filter archived reservations unless ?archived=true is passed
    const { searchParams } = new URL(request.url);
    const showArchived = searchParams.get('archived') === 'true';

    let query = supabaseAdmin
      .from('reservations')
      .select(`
        *,
        reservation_items (product_id, quantity, unit_price, products(name, name_es)),
        contracts (id, status, signed_at),
        payments (id, type, amount, status, square_invoice_url)
      `)
      .order('created_at', { ascending: false });

    if (!showArchived) {
      query = query.is('archived_at', null);
    }

    const { data, error } = await query;

    if (error) throw error;

    // PostgREST embeds 1-to-1 relations (contracts has UNIQUE reservation_id)
    // as a single object. Normalize to array for frontend consistency.
    const normalized = (data || []).map((r) => {
      if (r.contracts && !Array.isArray(r.contracts)) r.contracts = [r.contracts];
      else if (!r.contracts) r.contracts = [];
      return r;
    });

    return NextResponse.json(normalized);
  } catch (error) {
    console.error('Admin list reservations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
