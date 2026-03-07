import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { STATUS } from '@/lib/reservation-state-machine';
import { verifyAdmin } from '@/lib/auth-middleware';

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
    const body = await request.json().catch(() => ({}));
    const reason = body.reason || 'Rejected by admin';

    // Fetch reservation
    const { data: reservation, error: resError } = await supabaseAdmin
      .from('reservations')
      .select('id, status')
      .eq('id', id)
      .single();

    if (resError || !reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    if (reservation.status === STATUS.CANCELLED) {
      return NextResponse.json({
        reservation_id: id,
        status: STATUS.CANCELLED,
        message: 'Already cancelled',
      });
    }

    // Release any stock holds
    await supabaseAdmin.rpc('release_holds', { p_reservation_id: id });

    // Void contract if exists
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

    // TODO: Send notification to client about rejection

    return NextResponse.json({
      reservation_id: id,
      status: STATUS.CANCELLED,
      message: 'Reservation rejected',
    });
  } catch (error) {
    console.error('Admin reject error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reject reservation' },
      { status: 500 }
    );
  }
}
