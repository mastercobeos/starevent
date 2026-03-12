import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { STATUS, calculateSplit } from '@/lib/reservation-state-machine';
import { renderContract, hashContract } from '@/lib/contract-template';
import { checkIdempotencyKey, createIdempotencyKey, completeIdempotencyKey, failIdempotencyKey } from '@/lib/idempotency';
import { generateReservationToken, checkRateLimit, getClientIp, isValidEmail, isValidPhone } from '@/lib/security';

// --- Server-side pricing constants (source of truth) ---
const TAX_RATE = 0.0825;
const SAME_DAY_PICKUP_FEE = 40;
const DELIVERY_TIERS = [
  { maxMiles: 20, fee: 35 },
  { maxMiles: 40, fee: 60 },
  { maxMiles: 60, fee: 120 },
];
const MAX_DELIVERY_MILES = 60;

function computeDeliveryFee(miles) {
  if (miles == null || miles <= 0) return 0;
  if (miles > MAX_DELIVERY_MILES) return 0;
  for (const tier of DELIVERY_TIERS) {
    if (miles <= tier.maxMiles) return tier.fee;
  }
  return 0;
}

export async function POST(request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    // Rate limit: 5 reservations per hour per IP
    const ip = getClientIp(request);
    const rl = checkRateLimit(`create_reservation:${ip}`, 5, 60 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const body = await request.json();
    const {
      idempotency_key,
      first_name, last_name, client_email, phone_1, phone_2,
      address, property_type, installation_required, installation_details,
      event_date, return_date, event_start_time, event_end_time,
      items, special_notes, language,
      delivery_miles, same_day_pickup,
    } = body;

    // --- Validation ---
    if (!first_name?.trim() || !last_name?.trim()) {
      return NextResponse.json({ error: 'First name and last name are required' }, { status: 400 });
    }
    if (!client_email?.trim() || !isValidEmail(client_email)) {
      return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
    }
    if (!phone_1?.trim() || !isValidPhone(phone_1)) {
      return NextResponse.json({ error: 'A valid phone number is required' }, { status: 400 });
    }
    if (!event_date || !return_date) {
      return NextResponse.json({ error: 'Event date and return date are required' }, { status: 400 });
    }
    if (!items || items.length === 0 || items.length > 50) {
      return NextResponse.json({ error: 'Between 1 and 50 items are required' }, { status: 400 });
    }
    if (!address?.trim()) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    // --- Server-side price verification ---
    const productIds = items.map((i) => i.product_id);
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select('id, price')
      .in('id', productIds);

    if (productsError) throw productsError;

    const priceMap = {};
    for (const p of products) {
      priceMap[p.id] = Number(p.price);
    }

    // Validate every item references a real product with correct price
    for (const item of items) {
      if (priceMap[item.product_id] == null) {
        return NextResponse.json(
          { error: `Product not found: ${item.product_id}` },
          { status: 400 }
        );
      }
      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        return NextResponse.json(
          { error: `Invalid quantity for product ${item.product_id}` },
          { status: 400 }
        );
      }
    }

    // Compute rental days from dates (minimum 1)
    const startDate = new Date(event_date);
    const endDate = new Date(return_date);
    const diffMs = endDate - startDate;
    const computedRentalDays = Math.max(1, Math.round(diffMs / 86400000));

    // Compute subtotal from DB prices
    const computedSubtotal = items.reduce(
      (sum, item) => sum + priceMap[item.product_id] * item.quantity * computedRentalDays,
      0
    );

    // Compute fees and tax
    const computedDeliveryFee = computeDeliveryFee(delivery_miles);
    const computedSameDayPickupFee = same_day_pickup ? SAME_DAY_PICKUP_FEE : 0;
    const computedTaxAmount = Math.round(computedSubtotal * TAX_RATE * 100) / 100;
    const computedTotal = Math.round(
      (computedSubtotal + computedTaxAmount + computedDeliveryFee + computedSameDayPickupFee) * 100
    ) / 100;

    // --- Idempotency check ---
    if (idempotency_key) {
      const existing = await checkIdempotencyKey(idempotency_key);
      if (existing && existing.status === 'completed') {
        return NextResponse.json(existing.response_data);
      }
      const duplicate = await createIdempotencyKey(idempotency_key, 'create_reservation');
      if (duplicate && duplicate.status === 'completed') {
        return NextResponse.json(duplicate.response_data);
      }
    }

    // --- Create reservation with server-computed prices ---
    const { deposit, balance } = calculateSplit(computedTotal);

    const { data: reservation, error: resError } = await supabaseAdmin
      .from('reservations')
      .insert({
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        client_name: `${first_name.trim()} ${last_name.trim()}`,
        client_email: client_email.trim(),
        client_phone: phone_1.trim(),
        phone_1: phone_1.trim(),
        phone_2: phone_2?.trim() || null,
        event_date,
        return_date,
        event_address: address.trim(),
        event_start_time: event_start_time || null,
        event_end_time: event_end_time || null,
        property_type: property_type || null,
        installation_required: installation_required || false,
        installation_details: installation_details?.trim() || null,
        special_notes: special_notes?.trim() || null,
        language: language || 'en',
        subtotal: computedSubtotal,
        rental_days: computedRentalDays,
        delivery_fee: computedDeliveryFee,
        delivery_miles: delivery_miles || null,
        same_day_pickup: same_day_pickup || false,
        same_day_pickup_fee: computedSameDayPickupFee,
        tax_amount: computedTaxAmount,
        total: computedTotal,
        deposit_amount: deposit,
        balance_amount: balance,
        balance_due_date: event_date,

        status: 'pending', // Temporary — will update after stock check
      })
      .select('id')
      .single();

    if (resError) {
      if (idempotency_key) await failIdempotencyKey(idempotency_key);
      throw resError;
    }

    // --- Insert reservation items (with DB-verified prices) ---
    const reservationItems = items.map((item) => ({
      reservation_id: reservation.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: priceMap[item.product_id],
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('reservation_items')
      .insert(reservationItems);

    if (itemsError) {
      if (idempotency_key) await failIdempotencyKey(idempotency_key);
      throw itemsError;
    }

    // --- Check stock via RPC (pessimistic locking) ---
    const stockItems = items.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
    }));

    const { data: stockResult, error: stockError } = await supabaseAdmin
      .rpc('hold_stock', {
        p_reservation_id: reservation.id,
        p_items: stockItems,
        p_event_date: event_date,
        p_return_date: return_date,
        p_hold_minutes: 30,
      });

    if (stockError) {
      if (idempotency_key) await failIdempotencyKey(idempotency_key);
      throw stockError;
    }

    // --- Route based on stock availability ---
    if (!stockResult.all_available) {
      // NO STOCK → pending_out_of_stock
      await supabaseAdmin
        .from('reservations')
        .update({ status: STATUS.PENDING_OUT_OF_STOCK })
        .eq('id', reservation.id);

      const unavailableItems = stockResult.items.filter((i) => !i.available);

      const response = {
        reservation_id: reservation.id,
        access_token: generateReservationToken(reservation.id),
        status: STATUS.PENDING_OUT_OF_STOCK,
        unavailable_items: unavailableItems,
        message: 'out_of_stock',
      };

      if (idempotency_key) await completeIdempotencyKey(idempotency_key, response);

      // TODO: Trigger notification to admin (WhatsApp/SMS)

      return NextResponse.json(response);
    }

    // --- STOCK AVAILABLE → generate contract ---
    await supabaseAdmin
      .from('reservations')
      .update({ status: STATUS.APPROVED_WAITING_CONTRACT })
      .eq('id', reservation.id);

    // Fetch items with product names for contract
    const { data: itemsWithNames } = await supabaseAdmin
      .from('reservation_items')
      .select('product_id, quantity, unit_price, products(name, name_es)')
      .eq('reservation_id', reservation.id);

    const contractItems = (itemsWithNames || []).map((ri) => ({
      product_id: ri.product_id,
      product_name: ri.products?.name || ri.product_id,
      quantity: ri.quantity,
      unit_price: ri.unit_price,
    }));

    const reservationData = {
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      client_email: client_email.trim(),
      phone_1: phone_1.trim(),
      phone_2: phone_2?.trim() || null,
      event_date,
      return_date,
      event_start_time,
      event_end_time,
      event_address: address.trim(),
      property_type,
      installation_required,
      installation_details,
      special_notes,
      subtotal: computedSubtotal,
      delivery_fee: computedDeliveryFee,
      tax_amount: computedTaxAmount,
      total: computedTotal,
      deposit_amount: deposit,
      balance_amount: balance,
    };

    const contractHtml = renderContract(reservationData, contractItems, language || 'en');
    const contractHash = await hashContract(contractHtml);

    // Save contract
    const { error: contractError } = await supabaseAdmin
      .from('contracts')
      .insert({
        reservation_id: reservation.id,
        contract_html: contractHtml,
        contract_hash: contractHash,
        status: 'pending',
      });

    if (contractError) {
      if (idempotency_key) await failIdempotencyKey(idempotency_key);
      throw contractError;
    }

    const response = {
      reservation_id: reservation.id,
      access_token: generateReservationToken(reservation.id),
      status: STATUS.APPROVED_WAITING_CONTRACT,
      contract_html: contractHtml,
      contract_hash: contractHash,
      deposit_amount: deposit,
      balance_amount: balance,
      total: computedTotal,
    };

    if (idempotency_key) await completeIdempotencyKey(idempotency_key, response);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Create reservation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create reservation' },
      { status: 500 }
    );
  }
}
