import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Check availability for a list of products during a date range.
 * Returns an array with availability info per product.
 */
export async function checkAvailability(requestedItems, eventDate, returnDate) {
  // 1. Get total stock for each requested product
  const productIds = requestedItems.map((item) => item.id);
  const { data: products, error: prodError } = await supabase
    .from('products')
    .select('id, name, total_stock')
    .in('id', productIds);

  if (prodError) throw prodError;

  // 2. Get all active reservations that overlap with the requested date range
  //    Overlap: existing.event_date <= returnDate AND existing.return_date >= eventDate
  const { data: overlapping, error: resError } = await supabase
    .from('reservations')
    .select('id, event_date, return_date, reservation_items(product_id, quantity)')
    .in('status', ['pending', 'confirmed'])
    .lte('event_date', returnDate)
    .gte('return_date', eventDate);

  if (resError) throw resError;

  // 3. Calculate reserved quantities per product
  const reservedMap = {};
  for (const res of overlapping || []) {
    for (const ri of res.reservation_items || []) {
      reservedMap[ri.product_id] = (reservedMap[ri.product_id] || 0) + ri.quantity;
    }
  }

  // 4. Determine availability for each requested item
  return requestedItems.map((item) => {
    const product = products.find((p) => p.id === item.id);
    if (!product) {
      return { id: item.id, name: item.id, available: false, availableStock: 0 };
    }
    const reserved = reservedMap[item.id] || 0;
    const availableStock = product.total_stock - reserved;
    return {
      id: item.id,
      name: product.name,
      available: availableStock >= item.quantity,
      availableStock: Math.max(0, availableStock),
    };
  });
}

/**
 * Create a reservation with its items.
 */
export async function createReservation(data) {
  const { items, status = 'pending', ...reservationData } = data;

  // 1. Insert the reservation
  const { data: reservation, error: resError } = await supabase
    .from('reservations')
    .insert({
      ...reservationData,
      status,
    })
    .select('id')
    .single();

  if (resError) throw resError;

  // 2. Insert reservation items
  const reservationItems = items.map((item) => ({
    reservation_id: reservation.id,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
  }));

  const { error: itemsError } = await supabase
    .from('reservation_items')
    .insert(reservationItems);

  if (itemsError) throw itemsError;

  return reservation;
}

// ---- ADMIN FUNCTIONS ----

export async function fetchAllReservations() {
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      *,
      reservation_items (
        product_id,
        quantity,
        unit_price,
        subtotal
      )
    `)
    .order('event_date', { ascending: false });

  if (error) throw error;
  return data;
}

export async function fetchReservation(id) {
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      *,
      reservation_items (
        product_id,
        quantity,
        unit_price,
        subtotal,
        products (
          name,
          name_es,
          category
        )
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function updateReservationStatus(id, status) {
  const { data, error } = await supabase
    .from('reservations')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchInventorySummary() {
  const { data: products, error: prodError } = await supabase
    .from('products')
    .select('id, name, name_es, category, total_stock')
    .order('category')
    .order('name');

  if (prodError) throw prodError;

  const today = new Date().toISOString().split('T')[0];
  const { data: activeReservations, error: resError } = await supabase
    .from('reservations')
    .select('id, reservation_items(product_id, quantity)')
    .in('status', ['pending', 'confirmed'])
    .lte('event_date', today)
    .gte('return_date', today);

  if (resError) throw resError;

  const reservedMap = {};
  for (const res of activeReservations || []) {
    for (const ri of res.reservation_items || []) {
      reservedMap[ri.product_id] = (reservedMap[ri.product_id] || 0) + ri.quantity;
    }
  }

  return products.map((p) => ({
    ...p,
    reserved: reservedMap[p.id] || 0,
    available: p.total_stock - (reservedMap[p.id] || 0),
  }));
}
