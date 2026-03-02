import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { STATUS, canTransition } from '@/lib/reservation-state-machine';
import { renderContract, hashContract } from '@/lib/contract-template';

export async function PUT(request, { params }) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const { id } = await params;

    // Fetch reservation
    const { data: reservation, error: resError } = await supabaseAdmin
      .from('reservations')
      .select('*')
      .eq('id', id)
      .single();

    if (resError || !reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    // Validate transition
    if (!canTransition(reservation.status, STATUS.APPROVED_WAITING_CONTRACT)) {
      return NextResponse.json(
        { error: `Cannot approve reservation in status "${reservation.status}"` },
        { status: 409 }
      );
    }

    // Create stock holds (admin override — bypasses availability check)
    const { data: items } = await supabaseAdmin
      .from('reservation_items')
      .select('product_id, quantity, unit_price, products(name, name_es)')
      .eq('reservation_id', id);

    for (const item of items || []) {
      await supabaseAdmin.from('stock_holds').insert({
        reservation_id: id,
        product_id: item.product_id,
        quantity: item.quantity,
        event_date: reservation.event_date,
        return_date: reservation.return_date,
        status: 'active',
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min hold
      });
    }

    // Generate contract
    const contractItems = (items || []).map((ri) => ({
      product_id: ri.product_id,
      product_name: ri.products?.name || ri.product_id,
      quantity: ri.quantity,
      unit_price: ri.unit_price,
    }));

    const contractHtml = renderContract(reservation, contractItems, reservation.language || 'en');
    const contractHash = await hashContract(contractHtml);

    // Check if contract already exists
    const { data: existingContract } = await supabaseAdmin
      .from('contracts')
      .select('id')
      .eq('reservation_id', id)
      .single();

    if (existingContract) {
      await supabaseAdmin
        .from('contracts')
        .update({
          contract_html: contractHtml,
          contract_hash: contractHash,
          status: 'pending',
        })
        .eq('id', existingContract.id);
    } else {
      await supabaseAdmin.from('contracts').insert({
        reservation_id: id,
        contract_html: contractHtml,
        contract_hash: contractHash,
        status: 'pending',
      });
    }

    // Update reservation status
    await supabaseAdmin
      .from('reservations')
      .update({ status: STATUS.APPROVED_WAITING_CONTRACT })
      .eq('id', id);

    // TODO: Send notification to client (email + SMS)
    // "Your reservation has been approved! Please review and sign your contract."
    // Include link: /reservation/{id}/contract?token={hmac_token}

    return NextResponse.json({
      reservation_id: id,
      status: STATUS.APPROVED_WAITING_CONTRACT,
      message: 'Reservation approved. Contract generated.',
    });
  } catch (error) {
    console.error('Admin approve error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to approve reservation' },
      { status: 500 }
    );
  }
}
