import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { verifyAdmin } from '@/lib/auth-middleware';

const PAID_STATUSES = ['deposit_paid', 'balance_due', 'paid_in_full', 'completed'];

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
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const groupBy = searchParams.get('groupBy') || 'event_date';

    if (!from || !to) {
      return NextResponse.json({ error: 'from and to dates are required' }, { status: 400 });
    }

    const dateColumn = groupBy === 'created_at' ? 'created_at' : 'event_date';

    let query = supabaseAdmin
      .from('reservations')
      .select('id, client_name, event_date, created_at, status, subtotal, delivery_fee, same_day_pickup_fee, tax_amount, total, deposit_amount, balance_amount')
      .in('status', PAID_STATUSES)
      .is('archived_at', null)
      .order(dateColumn, { ascending: false });

    if (dateColumn === 'event_date') {
      query = query.gte('event_date', from).lte('event_date', to);
    } else {
      query = query.gte('created_at', `${from}T00:00:00`).lte('created_at', `${to}T23:59:59`);
    }

    const { data, error } = await query;
    if (error) throw error;

    const reservations = data || [];

    let totalSubtotal = 0;
    let totalDelivery = 0;
    let totalPickup = 0;
    let totalTax = 0;
    let totalRevenue = 0;
    const byMonth = {};

    for (const r of reservations) {
      const sub = Number(r.subtotal) || 0;
      const del = Number(r.delivery_fee) || 0;
      const pick = Number(r.same_day_pickup_fee) || 0;
      const tax = Number(r.tax_amount) || 0;
      const tot = Number(r.total) || 0;

      totalSubtotal += sub;
      totalDelivery += del;
      totalPickup += pick;
      totalTax += tax;
      totalRevenue += tot;

      const monthKey = (r[dateColumn] || '').slice(0, 7);
      if (!byMonth[monthKey]) {
        byMonth[monthKey] = { month: monthKey, count: 0, subtotal: 0, delivery: 0, pickup: 0, tax: 0, revenue: 0 };
      }
      byMonth[monthKey].count += 1;
      byMonth[monthKey].subtotal += sub;
      byMonth[monthKey].delivery += del;
      byMonth[monthKey].pickup += pick;
      byMonth[monthKey].tax += tax;
      byMonth[monthKey].revenue += tot;
    }

    const round2 = (n) => Math.round(n * 100) / 100;
    const roundObj = (o) => ({
      ...o,
      subtotal: round2(o.subtotal),
      delivery: round2(o.delivery),
      pickup: round2(o.pickup),
      tax: round2(o.tax),
      revenue: round2(o.revenue),
    });

    return NextResponse.json({
      from,
      to,
      groupBy: dateColumn,
      totals: {
        count: reservations.length,
        subtotal: round2(totalSubtotal),
        delivery: round2(totalDelivery),
        pickup: round2(totalPickup),
        tax: round2(totalTax),
        revenue: round2(totalRevenue),
      },
      byMonth: Object.values(byMonth).map(roundObj).sort((a, b) => b.month.localeCompare(a.month)),
      reservations,
    });
  } catch (error) {
    console.error('Tax report error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
