import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { verifyAdmin } from '@/lib/auth-middleware';

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

    const { data: reservation, error } = await supabaseAdmin
      .from('reservations')
      .select(`
        *,
        reservation_items (product_id, quantity, unit_price, products(name, name_es, category)),
        contracts (id, status, contract_html, contract_hash, initials, signed_at, signer_ip),
        payments (id, type, amount, amount_cents, status, square_invoice_id, square_invoice_url, square_payment_id, error_message, created_at),
        stock_holds (id, product_id, quantity, status, expires_at, event_date, return_date, products(name, name_es, total_stock)),
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
