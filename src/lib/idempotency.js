// Idempotency key management for preventing duplicate operations

import { supabaseAdmin } from './supabase-server';

// Check if an operation has already been completed
export async function checkIdempotencyKey(key) {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('idempotency_keys')
    .select('*')
    .eq('key', key)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
  if (!data) return null;

  // If processing for over 60 seconds, treat as failed (allow retry)
  if (data.status === 'processing') {
    const createdAt = new Date(data.created_at);
    const now = new Date();
    if (now - createdAt > 60000) {
      await supabaseAdmin
        .from('idempotency_keys')
        .update({ status: 'failed' })
        .eq('key', key);
      return null;
    }
  }

  return data;
}

// Create a new idempotency key (marks as processing)
export async function createIdempotencyKey(key, operation, reservationId = null) {
  if (!supabaseAdmin) throw new Error('Supabase admin not configured');

  const { error } = await supabaseAdmin
    .from('idempotency_keys')
    .insert({
      key,
      operation,
      reservation_id: reservationId,
      status: 'processing',
    });

  if (error) {
    // If key already exists (unique violation), check it
    if (error.code === '23505') {
      return checkIdempotencyKey(key);
    }
    throw error;
  }

  return null; // Successfully created, proceed with operation
}

// Complete an idempotency key with response data
export async function completeIdempotencyKey(key, responseData) {
  if (!supabaseAdmin) return;

  await supabaseAdmin
    .from('idempotency_keys')
    .update({
      status: 'completed',
      response_data: responseData,
    })
    .eq('key', key);
}

// Mark an idempotency key as failed
export async function failIdempotencyKey(key) {
  if (!supabaseAdmin) return;

  await supabaseAdmin
    .from('idempotency_keys')
    .update({ status: 'failed' })
    .eq('key', key);
}

// Generate an idempotency key for Square API calls
export function squareIdempotencyKey(reservationId, type) {
  return `${reservationId}_${type}`;
}
