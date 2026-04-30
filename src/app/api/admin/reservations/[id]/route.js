import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { verifyAdmin } from '@/lib/auth-middleware';
import { isValidUUID } from '@/lib/security';

export async function GET(request, { params }) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const auth = await verifyAdmin(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Invalid reservation ID' }, { status: 400 });
    }

    const { data: reservation, error } = await supabaseAdmin
      .from('reservations')
      .select(`
        *,
        reservation_items (product_id, quantity, unit_price, products(name, name_es, category)),
        contracts (id, status, contract_html, contract_hash, initials, signed_at, signer_ip),
        payments (id, type, amount, amount_cents, status, square_invoice_id, square_invoice_url, square_payment_id, error_message, created_at),
        stock_holds (id, product_id, quantity, status, expires_at, event_date, return_date),
        reservation_status_log (id, from_status, to_status, changed_by, reason, created_at)
      `)
      .eq('id', id)
      .single();

    if (error || !reservation) {
      console.error('Admin get reservation query error:', error);
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    // Sort status log by created_at
    if (reservation.reservation_status_log) {
      reservation.reservation_status_log.sort((a, b) =>
        new Date(a.created_at) - new Date(b.created_at)
      );
    }

    // For pending reservations, compute which items are currently out of stock
    // for the requested dates so the admin can see at a glance why approval is
    // blocked. Excludes this reservation's own holds from the conflict count.
    if (
      reservation.status === 'pending_out_of_stock' ||
      reservation.status === 'pending'
    ) {
      const unavailable = [];
      const items = reservation.reservation_items || [];

      for (const it of items) {
        const { data: product } = await supabaseAdmin
          .from('products')
          .select('total_stock')
          .eq('id', it.product_id)
          .single();

        const totalStock = Number(product?.total_stock ?? 0);

        const { data: holds } = await supabaseAdmin
          .from('stock_holds')
          .select('quantity')
          .eq('product_id', it.product_id)
          .in('status', ['active', 'confirmed'])
          .neq('reservation_id', id)
          .lte('event_date', reservation.return_date)
          .gte('return_date', reservation.event_date);

        const reserved = (holds || []).reduce(
          (sum, h) => sum + Number(h.quantity || 0),
          0
        );
        const available = Math.max(0, totalStock - reserved);

        if (available < Number(it.quantity)) {
          unavailable.push({
            product_id: it.product_id,
            product_name: it.products?.name || it.product_id,
            requested_qty: Number(it.quantity),
            available_qty: available,
          });
        }
      }

      reservation.unavailable_items = unavailable;
    }

    return NextResponse.json(reservation);
  } catch (error) {
    console.error('Admin get reservation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE → Permanently delete a reservation (must be archived first)
export async function DELETE(request, { params }) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const auth = await verifyAdmin(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Invalid reservation ID' }, { status: 400 });
    }

    // Safety check: only allow deleting archived reservations
    const { data: reservation, error: fetchError } = await supabaseAdmin
      .from('reservations')
      .select('id, archived_at')
      .eq('id', id)
      .single();

    if (fetchError || !reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    if (!reservation.archived_at) {
      return NextResponse.json({ error: 'Reservation must be archived before it can be deleted' }, { status: 409 });
    }

    // Delete reservation — CASCADE will remove items, contracts, payments, holds, logs
    const { error } = await supabaseAdmin
      .from('reservations')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      reservation_id: id,
      message: 'Reservation permanently deleted',
    });
  } catch (error) {
    console.error('Admin delete reservation error:', error);
    return NextResponse.json({ error: 'Failed to delete reservation' }, { status: 500 });
  }
}
