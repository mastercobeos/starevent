import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { checkRateLimit, getClientIp, verifyReservationToken, isValidUUID, getAccessToken } from '@/lib/security';
import { createBalanceInvoice } from '@/lib/create-balance-invoice';

export async function POST(request, { params }) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    // Rate limit: 10 payment attempts per hour per IP
    const ip = getClientIp(request);
    const rl = checkRateLimit(`pay_balance:${ip}`, 10, 60 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many payment attempts' }, { status: 429 });
    }

    const { id } = await params;
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Invalid reservation ID' }, { status: 400 });
    }

    // SECURITY: Verify reservation access token
    const token = getAccessToken(request);
    if (!verifyReservationToken(id, token)) {
      return NextResponse.json({ error: 'Invalid or missing access token' }, { status: 403 });
    }

    const result = await createBalanceInvoice(id);
    return NextResponse.json(result.data, { status: result.ok ? 200 : result.status });
  } catch (error) {
    console.error('Pay balance error:', error);
    return NextResponse.json(
      { error: 'Failed to process balance' },
      { status: 500 }
    );
  }
}
