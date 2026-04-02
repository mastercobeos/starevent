import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { escapeHtml, formatCurrency } from '@/lib/format';
import { Resend } from 'resend';

const BUSINESS_EMAIL = 'info@stareventrentaltx.com';
const CRON_SECRET = process.env.CRON_SECRET;

// Vercel Cron: runs every 15 minutes to send balance reminders on event day
// Timezone: America/Chicago (Houston, TX)

export async function GET(request) {
  try {
    // Verify cron secret to prevent unauthorized calls
    const authHeader = request.headers.get('authorization');
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Get current date/time in Houston timezone
    const now = new Date();
    const chicagoFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Chicago',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const parts = chicagoFormatter.formatToParts(now);
    const chicagoDate = `${parts.find(p => p.type === 'year').value}-${parts.find(p => p.type === 'month').value}-${parts.find(p => p.type === 'day').value}`;
    const chicagoHour = parseInt(parts.find(p => p.type === 'hour').value);
    const chicagoMinute = parseInt(parts.find(p => p.type === 'minute').value);

    // Find reservations with balance_due status and event_date = today
    const { data: reservations, error } = await supabaseAdmin
      .from('reservations')
      .select(`
        id, first_name, last_name, client_email, phone_1, event_date,
        event_start_time, balance_amount,
        payments (id, type, status, square_invoice_url)
      `)
      .eq('status', 'balance_due')
      .eq('event_date', chicagoDate);

    if (error) {
      console.error('Error fetching reminders:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!reservations || reservations.length === 0) {
      return NextResponse.json({ sent: 0, message: 'No reminders needed today' });
    }

    let sentCount = 0;
    const results = [];

    for (const res of reservations) {
      // Get the balance invoice URL
      const balancePayment = (res.payments || []).find(
        p => p.type === 'balance' && p.status === 'pending'
      );
      const invoiceUrl = balancePayment?.square_invoice_url || '';

      // Check if we already sent reminders today
      const { data: sentNotifications } = await supabaseAdmin
        .from('notifications')
        .select('id, type')
        .eq('reservation_id', res.id)
        .in('type', ['balance_reminder_1', 'balance_reminder_2'])
        .eq('status', 'sent')
        .gte('sent_at', `${chicagoDate}T00:00:00`);

      const sentTypes = (sentNotifications || []).map(n => n.type);
      const clientName = `${res.first_name} ${res.last_name}`.trim();

      // Reminder #1: at 9:00 AM Houston time (window: 9:00–9:14)
      if (chicagoHour === 9 && chicagoMinute < 15 && !sentTypes.includes('balance_reminder_1')) {
        const html = buildReminderHtml({
          clientName,
          eventDate: res.event_date,
          balanceAmount: res.balance_amount,
          invoiceUrl,
          reminderType: 'first',
        });

        const emailResult = await sendReminderEmail(resend, {
          to: res.client_email,
          subject: `Recordatorio de pago (60%) — Evento hoy ${res.event_date}`,
          html,
        });

        // Log notification
        await logNotification(supabaseAdmin, {
          reservationId: res.id,
          type: 'balance_reminder_1',
          channel: 'email',
          recipient: res.client_email,
          success: emailResult.success,
          error: emailResult.error,
          subject: `Recordatorio de pago (60%) — Evento hoy ${res.event_date}`,
        });

        if (emailResult.success) sentCount++;
        results.push({ reservation: res.id, reminder: 1, ...emailResult });
      }

      // Reminder #2: 2 hours before event_start_time, or 12:00 PM if no start time
      let reminder2Hour = 12;
      if (res.event_start_time) {
        const startHour = parseInt(res.event_start_time.split(':')[0]);
        reminder2Hour = Math.max(startHour - 2, 10); // At least 10 AM
      }

      if (chicagoHour === reminder2Hour && chicagoMinute < 15 && !sentTypes.includes('balance_reminder_2')) {
        const html = buildReminderHtml({
          clientName,
          eventDate: res.event_date,
          balanceAmount: res.balance_amount,
          invoiceUrl,
          reminderType: 'final',
        });

        const emailResult = await sendReminderEmail(resend, {
          to: res.client_email,
          subject: 'Recordatorio final — Pago 60% antes del set-up',
          html,
        });

        await logNotification(supabaseAdmin, {
          reservationId: res.id,
          type: 'balance_reminder_2',
          channel: 'email',
          recipient: res.client_email,
          success: emailResult.success,
          error: emailResult.error,
          subject: 'Recordatorio final — Pago 60% antes del set-up',
        });

        if (emailResult.success) sentCount++;
        results.push({ reservation: res.id, reminder: 2, ...emailResult });
      }
    }

    return NextResponse.json({
      sent: sentCount,
      checked: reservations.length,
      date: chicagoDate,
      time: `${chicagoHour}:${String(chicagoMinute).padStart(2, '0')}`,
      results,
    });
  } catch (err) {
    console.error('Balance reminders cron error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// --- Helpers ---

async function sendReminderEmail(resend, { to, subject, html }) {
  if (!to) return { success: false, error: 'No recipient email' };

  try {
    const { error } = await resend.emails.send({
      from: `Star Event Rental <${BUSINESS_EMAIL}>`,
      to,
      subject,
      html,
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    console.error('Reminder email failed:', err.message);
    return { success: false, error: err.message };
  }
}

async function logNotification(supabase, { reservationId, type, channel, recipient, success, error, subject }) {
  try {
    await supabase.from('notifications').insert({
      reservation_id: reservationId,
      type,
      channel,
      recipient,
      status: success ? 'sent' : 'failed',
      payload: { subject },
      sent_at: success ? new Date().toISOString() : null,
      error_message: error || null,
    });
  } catch (err) {
    console.error('Failed to log notification:', err.message);
  }
}

function buildReminderHtml({ clientName, eventDate, balanceAmount, invoiceUrl, reminderType }) {
  const isFirst = reminderType === 'first';
  const safeClientName = escapeHtml(clientName);

  const headerText = isFirst
    ? 'Recordatorio de Pago — Balance Pendiente (60%)'
    : 'Recordatorio Final — Pago antes del Set-Up';

  const headerColor = isFirst ? '#e67e22' : '#e74c3c';

  const bodyText = isFirst
    ? `Tu evento es hoy <strong>(${escapeHtml(eventDate)})</strong>. El pago del 60% restante se debe realizar
       <strong>al momento de la entrega del mobiliario</strong>, antes de iniciar el set-up.`
    : `Este es un recordatorio final. Necesitamos recibir el pago del 60% restante
       <strong>antes de iniciar el set-up</strong> de tu evento hoy.`;

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#fff;">
      <div style="text-align:center;padding:20px 0;border-bottom:3px solid #C9A84C;">
        <h1 style="color:#1a1a1a;margin:0;font-size:22px;">Star Event Rental TX</h1>
        <p style="color:${headerColor};margin:4px 0 0;font-size:14px;">${headerText}</p>
      </div>

      <div style="padding:20px 0;">
        <p style="color:#333;font-size:15px;">Hola <strong>${safeClientName}</strong>,</p>
        <p style="color:#555;font-size:14px;line-height:1.6;">${bodyText}</p>
      </div>

      <div style="background:#fff3e0;border:1px solid #ffcc02;border-radius:8px;padding:16px;margin-bottom:16px;">
        <table style="width:100%;font-size:14px;">
          <tr>
            <td style="padding:4px 0;color:${headerColor};font-weight:bold;">Balance pendiente (60%):</td>
            <td style="padding:4px 0;color:${headerColor};font-weight:bold;text-align:right;font-size:18px;">${formatCurrency(balanceAmount)}</td>
          </tr>
        </table>
      </div>

      ${invoiceUrl ? `
      <div style="text-align:center;margin:20px 0;">
        <a href="${escapeHtml(invoiceUrl)}" style="display:inline-block;background:#C9A84C;color:#fff;font-weight:bold;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:15px;">
          Pagar ahora
        </a>
      </div>` : ''}

      <div style="background:#fffbe6;border:1px solid #f0e68c;border-radius:8px;padding:12px;margin-bottom:16px;">
        <p style="color:#856404;font-size:13px;margin:0;line-height:1.5;">
          <strong>Importante:</strong> El pago debe completarse al momento de la entrega del mobiliario para poder iniciar el set-up de su evento.
        </p>
      </div>

      <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
      <p style="color:#999;font-size:11px;text-align:center;">
        Star Event Rental TX &bull; Houston, TX &bull; info@stareventrentaltx.com
      </p>
    </div>
  `;
}
