import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { verifyAdmin } from '@/lib/auth-middleware';
import { isValidUUID } from '@/lib/security';

// PUT → Archive reservation
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

    const { error } = await supabaseAdmin
      .from('reservations')
      .update({ archived_at: new Date().toISOString() })
      .eq('id', id)
      .is('archived_at', null);

    if (error) throw error;

    return NextResponse.json({
      reservation_id: id,
      message: 'Reservation archived',
    });
  } catch (error) {
    console.error('Admin archive error:', error);
    return NextResponse.json({ error: 'Failed to archive reservation' }, { status: 500 });
  }
}

// DELETE → Unarchive reservation
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

    const { error } = await supabaseAdmin
      .from('reservations')
      .update({ archived_at: null })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      reservation_id: id,
      message: 'Reservation unarchived',
    });
  } catch (error) {
    console.error('Admin unarchive error:', error);
    return NextResponse.json({ error: 'Failed to unarchive reservation' }, { status: 500 });
  }
}
