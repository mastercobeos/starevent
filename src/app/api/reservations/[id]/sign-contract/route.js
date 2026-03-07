import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { STATUS, canTransition } from '@/lib/reservation-state-machine';
import { verifyReservationToken, getClientIp, checkRateLimit } from '@/lib/security';
import { injectInitials } from '@/lib/contract-template';

export async function POST(request, { params }) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const { id } = await params;

    // SECURITY: Verify reservation access token
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    if (!verifyReservationToken(id, token)) {
      return NextResponse.json({ error: 'Invalid or missing access token' }, { status: 403 });
    }

    // Rate limiting
    const ip = getClientIp(request);
    const rl = checkRateLimit(`sign_contract:${ip}`, 10, 60 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    const { initials, contract_hash } = body;

    if (!initials?.trim() || initials.trim().length < 2) {
      return NextResponse.json({ error: 'Initials are required (at least 2 characters)' }, { status: 400 });
    }
    if (!contract_hash) {
      return NextResponse.json({ error: 'Contract hash is required' }, { status: 400 });
    }

    // Fetch reservation + contract
    const { data: reservation, error: resError } = await supabaseAdmin
      .from('reservations')
      .select('id, status')
      .eq('id', id)
      .single();

    if (resError || !reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    // Validate state transition
    if (!canTransition(reservation.status, STATUS.CONTRACT_SIGNED)) {
      return NextResponse.json(
        { error: `Cannot sign contract in status "${reservation.status}"` },
        { status: 409 }
      );
    }

    // Fetch contract
    const { data: contract, error: conError } = await supabaseAdmin
      .from('contracts')
      .select('*')
      .eq('reservation_id', id)
      .single();

    if (conError || !contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    // Already signed? Return success (idempotent)
    if (contract.status === 'signed') {
      return NextResponse.json({
        reservation_id: id,
        status: STATUS.CONTRACT_SIGNED,
        message: 'Contract already signed',
      });
    }

    // Verify contract hash matches
    if (contract.contract_hash !== contract_hash) {
      return NextResponse.json(
        { error: 'Contract hash mismatch — contract may have been modified' },
        { status: 409 }
      );
    }

    // Collect signature evidence
    const signerIp = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const signedAt = new Date().toISOString();

    // Inject initials into contract HTML so admin sees signed version
    const signedInitials = initials.trim().toUpperCase();
    const signedHtml = contract.contract_html
      ? injectInitials(contract.contract_html, signedInitials)
      : contract.contract_html;

    // Update contract
    const { error: updateConError } = await supabaseAdmin
      .from('contracts')
      .update({
        status: 'signed',
        initials: signedInitials,
        signed_at: signedAt,
        signer_ip: signerIp,
        signer_user_agent: userAgent,
        signed_contract_hash: contract_hash,
        contract_html: signedHtml,
      })
      .eq('id', contract.id);

    if (updateConError) throw updateConError;

    // Confirm stock holds (remove expiration)
    await supabaseAdmin.rpc('confirm_holds', { p_reservation_id: id });

    // Update reservation status
    const { error: updateResError } = await supabaseAdmin
      .from('reservations')
      .update({ status: STATUS.CONTRACT_SIGNED })
      .eq('id', id);

    if (updateResError) throw updateResError;

    return NextResponse.json({
      reservation_id: id,
      status: STATUS.CONTRACT_SIGNED,
      signed_at: signedAt,
    });
  } catch (error) {
    console.error('Sign contract error:', error);
    return NextResponse.json(
      { error: 'Failed to sign contract' },
      { status: 500 }
    );
  }
}
