import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { STATUS, isTerminal } from '@/lib/reservation-state-machine';
import { verifyAdmin } from '@/lib/auth-middleware';
import { isValidUUID } from '@/lib/security';

export async function PUT(request, { params }) {
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
    const body = await request.json().catch(() => ({}));
    const reason = body.reason || 'Cancelled by admin';

    // Fetch reservation
    const { data: reservation, error: resError } = await supabaseAdmin
      .from('reservations')
      .select('id, status')
      .eq('id', id)
      .single();

    if (resError || !reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    if (isTerminal(reservation.status)) {
      return NextResponse.json(
        { error: `Cannot cancel reservation in terminal status "${reservation.status}"` },
        { status: 409 }
      );
    }

    // Release stock holds
    await supabaseAdmin.rpc('release_holds', { p_reservation_id: id });

    // Void contract
    await supabaseAdmin
      .from('contracts')
      .update({ status: 'voided' })
      .eq('reservation_id', id);

    // Cancel reservation
    const { error } = await supabaseAdmin
      .from('reservations')
      .update({ status: STATUS.CANCELLED })
      .eq('id', id);

    if (error) throw error;

    // TODO: Send cancellation notification to client
    // TODO: If deposit was paid, flag for refund review

    return NextResponse.json({
      reservation_id: id,
      status: STATUS.CANCELLED,
      message: 'Reservation cancelled',
    });
  } catch (error) {
    console.error('Admin cancel error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel reservation' },
      { status: 500 }
    );
  }
}
