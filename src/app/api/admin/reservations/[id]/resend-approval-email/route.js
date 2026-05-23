import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { STATUS } from '@/lib/reservation-state-machine';
import { verifyAdmin } from '@/lib/auth-middleware';
import { isValidUUID, generateReservationToken } from '@/lib/security';
import { sendApprovalEmail } from '@/lib/email';

// POST → Re-send the approval email (with the sign-contract link) without
// touching the reservation status, stock holds, or the existing contract.
// Useful when the client lost the original email, it landed in spam, or the
// Resend send failed silently on the original approval.
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

    // Fetch reservation
    const { data: reservation, error: resError } = await supabaseAdmin
      .from('reservations')
      .select('*')
      .eq('id', id)
      .single();

    if (resError || !reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    // Only allow resend for states where the client still needs to sign.
    // After signing the email is irrelevant (they have other notifications).
    if (reservation.status !== STATUS.APPROVED_WAITING_CONTRACT) {
      return NextResponse.json(
        { error: `Cannot resend approval email when status is "${reservation.status}". Email is only relevant before the contract is signed.` },
        { status: 409 }
      );
    }

    // Verify a contract row exists; if not, the admin should re-approve to generate one.
    const { data: contract } = await supabaseAdmin
      .from('contracts')
      .select('id')
      .eq('reservation_id', id)
      .maybeSingle();

    if (!contract) {
      return NextResponse.json(
        { error: 'No contract found for this reservation. Re-approve the reservation to regenerate it.' },
        { status: 409 }
      );
    }

    // Build the same URL the original approval email used
    const token = generateReservationToken(id);
    const lang = reservation.language || 'en';
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://stareventrentaltx.com';
    const contractUrl = `${baseUrl}/reservation/${id}/contract?token=${token}&lang=${lang}`;

    // Send the email — surface failures so the admin knows if it didn't go out
    try {
      await sendApprovalEmail(reservation, contractUrl);
    } catch (mailErr) {
      console.error('Resend approval email failed:', mailErr);
      return NextResponse.json(
        { error: `Failed to send email: ${mailErr.message || 'Unknown email error'}` },
        { status: 502 }
      );
    }

    return NextResponse.json({
      reservation_id: id,
      message: 'Approval email re-sent to client.',
      recipient: reservation.client_email,
    });
  } catch (error) {
    console.error('Resend approval email error:', error);
    return NextResponse.json(
      { error: 'Failed to resend approval email' },
      { status: 500 }
    );
  }
}
