import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { verifyAdmin } from '@/lib/auth-middleware';
import { isValidUUID } from '@/lib/security';
import { STATUS } from '@/lib/reservation-state-machine';
import { createBalanceInvoice } from '@/lib/create-balance-invoice';

// Admin-only endpoint to (re)create the balance invoice in Square for a
// reservation. Used to recover reservations that paid the deposit but never
// got a balance invoice (e.g. older bookings created before the auto-creation
// fix in pay-deposit was deployed) and to resend the invoice when needed.
export async function POST(request, { params }) {
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

    const { data: reservation, error: resError } = await supabaseAdmin
      .from('reservations')
      .select('id, status')
      .eq('id', id)
      .single();

    if (resError || !reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    // Allow on deposit_paid OR balance_due. createBalanceInvoice itself only
    // accepts balance_due (canTransition to paid_in_full), so for deposit_paid
    // we transition it forward first.
    if (reservation.status === STATUS.DEPOSIT_PAID) {
      const { error: updateError } = await supabaseAdmin
        .from('reservations')
        .update({ status: STATUS.BALANCE_DUE })
        .eq('id', id);

      if (updateError) {
        console.error('Status transition error:', updateError);
        return NextResponse.json(
          { error: 'Failed to transition reservation to balance_due' },
          { status: 500 }
        );
      }
    } else if (reservation.status !== STATUS.BALANCE_DUE) {
      return NextResponse.json(
        {
          error: `Cannot create balance invoice for reservation in status "${reservation.status}". Only deposit_paid or balance_due reservations are supported.`,
        },
        { status: 409 }
      );
    }

    const result = await createBalanceInvoice(id);
    return NextResponse.json(result.data, { status: result.ok ? 200 : result.status });
  } catch (error) {
    console.error('Admin create balance invoice error:', error);
    return NextResponse.json(
      { error: 'Failed to create balance invoice' },
      { status: 500 }
    );
  }
}
