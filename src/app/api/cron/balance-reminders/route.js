import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { escapeHtml, formatCurrency } from '@/lib/format';
import { Resend } from 'resend';

const BUSINESS_EMAIL = 'info@stareventrentaltx.com';
const CRON_SECRET = process.env.CRON_SECRET;

// Vercel Cron: runs every 15 minutes to send balance reminders.
// Policy: 40% deposit on booking, 60% balance must be paid before the event.
// Three reminders, all fire at 9 AM Houston (America/Chicago):
//   T-7  (1 week before)  — balance_reminder_1: friendly heads-up
//   T-3  (72 hours before) — balance_reminder_2: please complete the transfer
//   T-2  (48 hours before) — balance_reminder_3: final notice
// Language is read from reservations.language (en | es).

function addDaysISO(isoDate, days) {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split('T')[0];
}

const REMINDER_SCHEDULE = [
  { offsetDays: 7, type: 'balance_reminder_1', tone: 'friendly' },
  { offsetDays: 3, type: 'balance_reminder_2', tone: 'urgent' },
  { offsetDays: 2, type: 'balance_reminder_3', tone: 'final' },
];

export async function GET(request) {
  try {
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

    // 9 AM window — only fire reminders during the 9:00–9:14 cron tick
    const inSendWindow = chicagoHour === 9 && chicagoMinute < 15;
    if (!inSendWindow) {
      return NextResponse.json({
        sent: 0,
        skipped: true,
        reason: 'outside-9am-window',
        time: `${chicagoHour}:${String(chicagoMinute).padStart(2, '0')}`,
      });
    }

    const targetDates = REMINDER_SCHEDULE.map(r => ({
      ...r,
      eventDate: addDaysISO(chicagoDate, r.offsetDays),
    }));

    const { data: reservations, error } = await supabaseAdmin
      .from('reservations')
      .select(`
        id, first_name, last_name, client_email, phone_1, event_date, language,
        event_start_time, balance_amount,
        payments (id, type, status, square_invoice_url)
      `)
      .eq('status', 'balance_due')
      .in('event_date', targetDates.map(t => t.eventDate));

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
      const reminder = targetDates.find(t => t.eventDate === res.event_date);
      if (!reminder) continue;

      const balancePayment = (res.payments || []).find(
        p => p.type === 'balance' && p.status === 'pending'
      );
      const invoiceUrl = balancePayment?.square_invoice_url || '';

      // Anti-duplicate: did we already send this reminder type for this reservation?
      const { data: alreadySent } = await supabaseAdmin
        .from('notifications')
        .select('id')
        .eq('reservation_id', res.id)
        .eq('type', reminder.type)
        .eq('status', 'sent')
        .limit(1);

      if (alreadySent && alreadySent.length > 0) continue;

      const lang = res.language === 'es' ? 'es' : 'en';
      const clientName = `${res.first_name} ${res.last_name}`.trim();
      const { subject, html } = buildReminderEmail({
        lang,
        tone: reminder.tone,
        clientName,
        eventDate: res.event_date,
        balanceAmount: res.balance_amount,
        invoiceUrl,
      });

      const emailResult = await sendReminderEmail(resend, { to: res.client_email, subject, html });

      await logNotification(supabaseAdmin, {
        reservationId: res.id,
        type: reminder.type,
        channel: 'email',
        recipient: res.client_email,
        success: emailResult.success,
        error: emailResult.error,
        subject,
      });

      if (emailResult.success) sentCount++;
      results.push({ reservation: res.id, type: reminder.type, lang, ...emailResult });
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

const COPY = {
  en: {
    friendly: {
      subject: (date) => `Friendly reminder: 60% balance due before your event (${date})`,
      header: 'Your event is approaching',
      headerColor: '#3498db',
      greeting: (name) => `Hi <strong>${name}</strong>,`,
      body: (date) => `Your event is scheduled for <strong>${date}</strong>. Just a friendly reminder that the remaining <strong>60% balance</strong> is due 48 hours before the event. You can pay any time using the link below — paying early avoids last-minute issues.`,
      balanceLabel: 'Balance pending (60%):',
      cta: 'Pay now',
      footerNote: 'The remaining 60% balance is due 48 hours before the event date. If payment is not received in time, Star Event Rental reserves the right to cancel the reservation, retain the deposit, and release the reserved inventory to other clients without further notice.',
      footerNoteLabel: 'Important:',
    },
    urgent: {
      subject: (date) => `Reminder: please complete the remaining transfer to finalize your reservation — Event ${date}`,
      header: 'Please complete the remaining transfer',
      headerColor: '#e67e22',
      greeting: (name) => `Hi <strong>${name}</strong>,`,
      body: (date) => `Your event is scheduled for <strong>${date}</strong>, in 72 hours. <strong>Please complete the remaining transfer to finalize your reservation.</strong> The 60% balance is due 48 hours before the event.`,
      balanceLabel: 'Balance pending (60%):',
      cta: 'Pay now',
      footerNote: 'If payment is not received before the deadline, Star Event Rental reserves the right to cancel the reservation, retain the deposit, and release the reserved inventory to other clients without further notice.',
      footerNoteLabel: 'Important:',
    },
    final: {
      subject: (date) => `FINAL NOTICE: please complete the transfer so we can validate your reservation — Event ${date}`,
      header: 'FINAL NOTICE — last message',
      headerColor: '#e74c3c',
      greeting: (name) => `Hi <strong>${name}</strong>,`,
      body: (date) => `<strong>This is the last message.</strong> Your event is on <strong>${date}</strong>, in 48 hours. Please complete the transfer so we can validate your reservation. If payment is not received immediately, Star Event Rental reserves the right to cancel the reservation, retain the deposit, and release the reserved inventory.`,
      balanceLabel: 'Balance pending (60%):',
      cta: 'Pay now',
      footerNote: 'If payment is not received immediately, Star Event Rental reserves the right to cancel the reservation, retain the deposit, and release the reserved inventory to other clients without further notice.',
      footerNoteLabel: 'Important:',
    },
  },
  es: {
    friendly: {
      subject: (date) => `Recordatorio: saldo (60%) pendiente antes de tu evento (${date})`,
      header: 'Tu evento se acerca',
      headerColor: '#3498db',
      greeting: (name) => `Hola <strong>${name}</strong>,`,
      body: (date) => `Tu evento está programado para <strong>${date}</strong>. Te recordamos amablemente que el <strong>saldo restante (60%)</strong> vence 48 horas antes del evento. Puedes pagar en cualquier momento usando el enlace abajo — adelantar el pago evita contratiempos de última hora.`,
      balanceLabel: 'Balance pendiente (60%):',
      cta: 'Pagar ahora',
      footerNote: 'El saldo restante (60%) vence 48 horas antes de la fecha del evento. Si el pago no se recibe a tiempo, Star Event Rental se reserva el derecho de cancelar la reservación, retener el anticipo y poner el inventario reservado a disposición de otros clientes sin previo aviso.',
      footerNoteLabel: 'Importante:',
    },
    urgent: {
      subject: (date) => `Recordatorio: por favor realiza la transferencia restante para finalizar la reserva — Evento ${date}`,
      header: 'Por favor realiza la transferencia restante',
      headerColor: '#e67e22',
      greeting: (name) => `Hola <strong>${name}</strong>,`,
      body: (date) => `Tu evento está programado para <strong>${date}</strong>, en 72 horas. <strong>Por favor realiza la transferencia restante para finalizar la reserva.</strong> El saldo (60%) vence 48 horas antes del evento.`,
      balanceLabel: 'Balance pendiente (60%):',
      cta: 'Pagar ahora',
      footerNote: 'Si el pago no se recibe antes del plazo, Star Event Rental se reserva el derecho de cancelar la reservación, retener el anticipo y poner el inventario reservado a disposición de otros clientes sin previo aviso.',
      footerNoteLabel: 'Importante:',
    },
    final: {
      subject: (date) => `ÚLTIMO AVISO: por favor realiza la transferencia para validar tu reserva — Evento ${date}`,
      header: 'ÚLTIMO AVISO — último mensaje',
      headerColor: '#e74c3c',
      greeting: (name) => `Hola <strong>${name}</strong>,`,
      body: (date) => `<strong>Este es el último mensaje.</strong> Tu evento es el <strong>${date}</strong>, en 48 horas. Por favor realiza la transferencia para que podamos validar tu reserva. Si el pago no se recibe de inmediato, Star Event Rental se reserva el derecho de cancelar la reservación, retener el anticipo y poner el inventario reservado a disposición de otros clientes.`,
      balanceLabel: 'Balance pendiente (60%):',
      cta: 'Pagar ahora',
      footerNote: 'Si el pago no se recibe de inmediato, Star Event Rental se reserva el derecho de cancelar la reservación, retener el anticipo y poner el inventario reservado a disposición de otros clientes sin previo aviso.',
      footerNoteLabel: 'Importante:',
    },
  },
};

function buildReminderEmail({ lang, tone, clientName, eventDate, balanceAmount, invoiceUrl }) {
  const t = COPY[lang][tone];
  const safeName = escapeHtml(clientName);
  const safeDate = escapeHtml(eventDate);

  const subject = t.subject(eventDate);

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#fff;">
      <div style="text-align:center;padding:20px 0;border-bottom:3px solid #C9A84C;">
        <h1 style="color:#1a1a1a;margin:0;font-size:22px;">Star Event Rental TX</h1>
        <p style="color:${t.headerColor};margin:4px 0 0;font-size:14px;">${t.header}</p>
      </div>

      <div style="padding:20px 0;">
        <p style="color:#333;font-size:15px;">${t.greeting(safeName)}</p>
        <p style="color:#555;font-size:14px;line-height:1.6;">${t.body(safeDate)}</p>
      </div>

      <div style="background:#fff3e0;border:1px solid #ffcc02;border-radius:8px;padding:16px;margin-bottom:16px;">
        <table style="width:100%;font-size:14px;">
          <tr>
            <td style="padding:4px 0;color:${t.headerColor};font-weight:bold;">${t.balanceLabel}</td>
            <td style="padding:4px 0;color:${t.headerColor};font-weight:bold;text-align:right;font-size:18px;">${formatCurrency(balanceAmount)}</td>
          </tr>
        </table>
      </div>

      ${invoiceUrl ? `
      <div style="text-align:center;margin:20px 0;">
        <a href="${escapeHtml(invoiceUrl)}" style="display:inline-block;background:#C9A84C;color:#fff;font-weight:bold;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:15px;">
          ${t.cta}
        </a>
      </div>` : ''}

      <div style="background:#fffbe6;border:1px solid #f0e68c;border-radius:8px;padding:12px;margin-bottom:16px;">
        <p style="color:#856404;font-size:13px;margin:0;line-height:1.5;">
          <strong>${t.footerNoteLabel}</strong> ${t.footerNote}
        </p>
      </div>

      <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
      <p style="color:#999;font-size:11px;text-align:center;">
        Star Event Rental TX &bull; Houston, TX &bull; info@stareventrentaltx.com
      </p>
    </div>
  `;

  return { subject, html };
}
