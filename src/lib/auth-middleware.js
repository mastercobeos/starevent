import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Verify that the request comes from an authenticated admin user
export async function verifyAdmin(request) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return { error: 'Missing authorization token', status: 401 };
  }

  const token = authHeader.slice(7);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return { error: 'Server not configured', status: 500 };
  }

  // Create a Supabase client with the user's JWT to verify their identity
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return { error: 'Invalid or expired token', status: 401 };
  }

  // Check admin role via app_metadata (server-controlled only) or allowed email list
  // SECURITY: Never check user_metadata — users can modify it themselves via supabase.auth.updateUser()
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
  const isAdmin = user.app_metadata?.role === 'admin'
    || adminEmails.includes(user.email?.toLowerCase());

  if (!isAdmin) {
    return { error: 'Insufficient permissions', status: 403 };
  }

  return { user };
}

// Helper to wrap admin route handlers with auth check
export function withAdminAuth(handler) {
  return async function (request, context) {
    const auth = await verifyAdmin(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    return handler(request, context, auth.user);
  };
}
