import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { STATUS, canTransition } from '@/lib/reservation-state-machine';
import { renderContract, hashContract } from '@/lib/contract-template';
import { verifyAdmin } from '@/lib/auth-middleware';
import { isValidUUID, generateReservationToken } from '@/lib/security';
import { sendApprovalEmail } from '@/lib/email';

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

    // Expand packages into component items before creating holds
    const expandedHolds = [];
    for (const item of items || []) {
      const { data: components } = await supabaseAdmin
        .from('package_items')
        .select('component_id, quantity')
        .eq('package_id', item.product_id);

      if (components && components.length > 0) {
        // Package: create holds for each component
        for (const comp of components) {
          expandedHolds.push({
            reservation_id: id,
            product_id: comp.component_id,
            quantity: comp.quantity * item.quantity,
            event_date: reservation.event_date,
            return_date: reservation.return_date,
            status: 'active',
            expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          });
        }
      } else {
        // Regular product: hold as-is
        expandedHolds.push({
          reservation_id: id,
          product_id: item.product_id,
          quantity: item.quantity,
          event_date: reservation.event_date,
          return_date: reservation.return_date,
          status: 'active',
          expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        });
      }
    }

    // Aggregate holds for same component (package + individual overlap)
    const aggregated = {};
    for (const hold of expandedHolds) {
      if (aggregated[hold.product_id]) {
        aggregated[hold.product_id].quantity += hold.quantity;
      } else {
        aggregated[hold.product_id] = { ...hold };
      }
    }

    for (const hold of Object.values(aggregated)) {
      await supabaseAdmin.from('stock_holds').insert(hold);
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

    // Send approval email with contract link
    const token = generateReservationToken(id);
    const lang = reservation.language || 'en';
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://stareventrentaltx.com';
    const contractUrl = `${baseUrl}/reservation/${id}/contract?token=${token}&lang=${lang}`;
    await sendApprovalEmail(reservation, contractUrl).catch((err) =>
      console.error('Approval email failed (non-blocking):', err.message)
    );

    return NextResponse.json({
      reservation_id: id,
      status: STATUS.APPROVED_WAITING_CONTRACT,
      message: 'Reservation approved. Contract generated.',
    });
  } catch (error) {
    console.error('Admin approve error:', error);
    return NextResponse.json(
      { error: 'Failed to approve reservation' },
      { status: 500 }
    );
  }
}
