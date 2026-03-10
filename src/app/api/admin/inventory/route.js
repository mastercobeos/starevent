import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { verifyAdmin } from '@/lib/auth-middleware';

export async function GET(request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const auth = await verifyAdmin(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    // Fetch physical products (exclude virtual packages)
    const { data: products, error: prodError } = await supabaseAdmin
      .from('products')
      .select('id, name, name_es, category, total_stock')
      .neq('category', 'packages')
      .order('category')
      .order('name');

    if (prodError) throw prodError;

    // Fetch active/confirmed stock holds using service_role (bypasses RLS)
    const { data: activeHolds, error: holdError } = await supabaseAdmin
      .from('stock_holds')
      .select('product_id, quantity, reservation_id')
      .in('status', ['active', 'confirmed'])
      .lte('event_date', date)
      .gte('return_date', date);

    if (holdError) throw holdError;

    const reservedMap = {};
    const holdsByProduct = {};
    for (const hold of activeHolds || []) {
      reservedMap[hold.product_id] = (reservedMap[hold.product_id] || 0) + hold.quantity;
      if (!holdsByProduct[hold.product_id]) {
        holdsByProduct[hold.product_id] = [];
      }
      holdsByProduct[hold.product_id].push({
        reservation_id: hold.reservation_id,
        quantity: hold.quantity,
      });
    }

    const result = products.map((p) => ({
      ...p,
      reserved: reservedMap[p.id] || 0,
      available: p.total_stock - (reservedMap[p.id] || 0),
      holds: holdsByProduct[p.id] || [],
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Admin inventory error:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}
