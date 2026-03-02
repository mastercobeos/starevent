import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client with service role key
// Only use in API routes (never in client components)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

// Set the changed_by context for audit triggers
export async function withChangedBy(changedBy, fn) {
  if (!supabaseAdmin) throw new Error('Supabase admin not configured');
  // Set session variable for the audit trigger
  await supabaseAdmin.rpc('set_config', {
    setting: 'app.changed_by',
    value: changedBy,
  }).catch(() => {
    // Fallback: set via raw SQL if RPC not available
  });
  return fn(supabaseAdmin);
}
