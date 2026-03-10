import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export async function checkAvailability(requestedItems, eventDate, returnDate) {
  const productIds = requestedItems.map((item) => item.id);
  const { data: products, error: prodError } = await supabase
    .from('products')
    .select('id, name, total_stock')
    .in('id', productIds);

  if (prodError) throw prodError;

  const { data: overlapping, error: resError } = await supabase
    .from('reservations')
    .select('id, event_date, return_date, reservation_items(product_id, quantity)')
    .in('status', ['pending', 'confirmed'])
    .lte('event_date', returnDate)
    .gte('return_date', eventDate);

  if (resError) throw resError;

  const reservedMap = {};
  for (const res of overlapping || []) {
    for (const ri of res.reservation_items || []) {
      reservedMap[ri.product_id] = (reservedMap[ri.product_id] || 0) + ri.quantity;
    }
  }

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

export async function createReservation(data) {
  const { items, status = 'pending', ...reservationData } = data;

  const { data: reservation, error: resError } = await supabase
    .from('reservations')
    .insert({ ...reservationData, status })
    .select('id')
    .single();

  if (resError) throw resError;

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

export async function fetchAllReservations() {
  const { data, error } = await supabase
    .from('reservations')
    .select(`*, reservation_items (product_id, quantity, unit_price, subtotal)`)
    .order('event_date', { ascending: false });

  if (error) throw error;
  return data;
}

export async function fetchReservation(id) {
  const { data, error } = await supabase
    .from('reservations')
    .select(`*, reservation_items (product_id, quantity, unit_price, subtotal, products (name, name_es, category))`)
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

export async function fetchInventorySummary(targetDate = null) {
  // Fetch only physical products (exclude virtual packages)
  const { data: products, error: prodError } = await supabase
    .from('products')
    .select('id, name, name_es, category, total_stock')
    .neq('category', 'packages')
    .order('category')
    .order('name');

  if (prodError) throw prodError;

  const date = targetDate || new Date().toISOString().split('T')[0];

  // Use stock_holds instead of reservation_items because holds contain
  // expanded package components (individual chairs, tables, tents, etc.)
  const { data: activeHolds, error: holdError } = await supabase
    .from('stock_holds')
    .select('product_id, quantity, reservation_id')
    .in('status', ['active', 'confirmed'])
    .lte('event_date', date)
    .gte('return_date', date);

  if (holdError) throw holdError;

  const reservedMap = {};
  const holdsByProduct = {};
  for (const hold of activeHolds || []) {
    reservedMap[hold.product_id] = (reservedMap[hold.product_id] || 0) + hold.quantity;
    if (!holdsByProduct[hold.product_id]) {
      holdsByProduct[hold.product_id] = [];
    }
    holdsByProduct[hold.product_id].push({
      reservation_id: hold.reservation_id,
      quantity: hold.quantity,
    });
  }

  return products.map((p) => ({
    ...p,
    reserved: reservedMap[p.id] || 0,
    available: p.total_stock - (reservedMap[p.id] || 0),
    holds: holdsByProduct[p.id] || [],
  }));
}
