import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { escapeHtml } from '@/lib/format';
import {
  sanitizeField,
  isValidEmail,
  isValidPhone,
  checkRateLimit,
  getClientIp,
} from '@/lib/security';

const BUSINESS_EMAIL = 'info@stareventrentaltx.com';
const FROM_ADDRESS = `Star Event Rental <${BUSINESS_EMAIL}>`;

const ITEM_LABELS = {
  'round-table':  { en: 'Round Table 60"',        es: 'Mesa Redonda 60"' },
  'rect-table':   { en: 'Rectangular Table 6ft',  es: 'Mesa Rectangular 6ft' },
  'chiavari':     { en: 'Chiavari Chair',         es: 'Silla Chiavari' },
  'garden':       { en: 'Garden Chair',           es: 'Silla Garden' },
  'resin':        { en: 'White Resin Chair',      es: 'Silla Resina Blanca' },
  'dance-floor':  { en: 'Dance Floor 12×12',      es: 'Pista de Baile 12×12' },
};

function countItems(items) {
  const counts = {};
  for (const it of items) counts[it.type] = (counts[it.type] || 0) + 1;
  return counts;
}

function buildCountsRows(counts, lang) {
  return Object.entries(counts)
    .map(([type, qty]) => {
      const label = ITEM_LABELS[type]?.[lang] || type;
      return `
        <tr>
          <td style="padding:6px 12px;border-bottom:1px solid #eee;color:#444;">${escapeHtml(label)}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #eee;color:#444;text-align:right;font-weight:bold;">${qty}</td>
        </tr>`;
    })
    .join('');
}

function businessEmailHtml({ name, email, phone, eventDate, address, notes, tent, counts, lang }) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:20px;background:#fff;">
      <div style="text-align:center;padding:20px 0;border-bottom:3px solid #C9A84C;">
        <h1 style="color:#1a1a1a;margin:0;font-size:22px;">Star Event Rental TX</h1>
        <p style="color:#C9A84C;margin:4px 0 0;font-size:14px;">New 3D Designer Quote Request</p>
      </div>

      <div style="padding:20px 0;">
        <p style="color:#555;font-size:14px;line-height:1.6;">
          A customer just submitted a layout request from the 3D designer. Full details below.
        </p>
      </div>

      <div style="background:#f9f9f9;border-radius:8px;padding:16px;margin-bottom:16px;">
        <h3 style="color:#1a1a1a;margin:0 0 12px;font-size:15px;border-bottom:1px solid #ddd;padding-bottom:8px;">Client</h3>
        <table style="width:100%;font-size:13px;">
          <tr><td style="padding:4px 0;color:#777;width:120px;">Name:</td><td style="padding:4px 0;color:#333;font-weight:bold;">${escapeHtml(name)}</td></tr>
          <tr><td style="padding:4px 0;color:#777;">Email:</td><td style="padding:4px 0;color:#333;"><a href="mailto:${escapeHtml(email)}" style="color:#C9A84C;">${escapeHtml(email)}</a></td></tr>
          <tr><td style="padding:4px 0;color:#777;">Phone:</td><td style="padding:4px 0;color:#333;"><a href="tel:${escapeHtml(phone)}" style="color:#C9A84C;">${escapeHtml(phone)}</a></td></tr>
          <tr><td style="padding:4px 0;color:#777;">Event Date:</td><td style="padding:4px 0;color:#333;font-weight:bold;">${escapeHtml(eventDate)}</td></tr>
          ${address ? `<tr><td style="padding:4px 0;color:#777;">Address:</td><td style="padding:4px 0;color:#333;">${escapeHtml(address)}</td></tr>` : ''}
          <tr><td style="padding:4px 0;color:#777;">Language:</td><td style="padding:4px 0;color:#333;">${lang === 'es' ? 'Español' : 'English'}</td></tr>
        </table>
      </div>

      <div style="background:#f9f9f9;border-radius:8px;padding:16px;margin-bottom:16px;">
        <h3 style="color:#1a1a1a;margin:0 0 12px;font-size:15px;border-bottom:1px solid #ddd;padding-bottom:8px;">Layout</h3>
        <table style="width:100%;font-size:13px;margin-bottom:12px;">
          <tr><td style="padding:4px 0;color:#777;width:120px;">Tent:</td><td style="padding:4px 0;color:#333;font-weight:bold;">${escapeHtml(tent.labelEn || `${tent.width}×${tent.length} ft`)}</td></tr>
          <tr><td style="padding:4px 0;color:#777;">Dimensions:</td><td style="padding:4px 0;color:#333;">${tent.width} × ${tent.length} ft (${tent.width * tent.length} sq ft)</td></tr>
        </table>
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr style="background:#f0f0f0;">
              <th style="padding:8px 12px;text-align:left;color:#555;">Item</th>
              <th style="padding:8px 12px;text-align:right;color:#555;">Qty</th>
            </tr>
          </thead>
          <tbody>${buildCountsRows(counts, 'en')}</tbody>
        </table>
      </div>

      ${notes ? `
      <div style="margin-bottom:16px;">
        <h3 style="color:#1a1a1a;margin:0 0 8px;font-size:15px;">Client Notes</h3>
        <p style="background:#f5f5f5;padding:12px;border-radius:8px;color:#555;line-height:1.6;font-size:13px;white-space:pre-wrap;">${escapeHtml(notes)}</p>
      </div>
      ` : ''}

      <div style="background:#fffbe6;border:1px solid #f0e68c;border-radius:8px;padding:12px;margin-bottom:16px;">
        <p style="color:#856404;font-size:13px;margin:0;line-height:1.5;">
          <strong>3D layout snapshot</strong> attached as <code>layout-3d.png</code>.
        </p>
      </div>

      <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
      <p style="color:#999;font-size:11px;text-align:center;">
        Sent from stareventrentaltx.com/designer
      </p>
    </div>`;
}

function clientEmailHtml({ name, eventDate, tent, counts, lang }) {
  const isEs = lang === 'es';
  const title = isEs ? 'Solicitud recibida' : 'Quote Request Received';
  const greeting = isEs ? 'Hola' : 'Hello';
  const body = isEs
    ? 'Recibimos tu diseño y solicitud de cotización. Nuestro equipo revisará tu layout y te contactará en menos de 24 horas con un presupuesto detallado.'
    : 'We received your layout and quote request. Our team will review your design and get back to you within 24 hours with a detailed quote.';
  const layoutTitle = isEs ? 'Tu diseño' : 'Your Layout';
  const tentLabel = isEs ? 'Carpa' : 'Tent';
  const dateLabel = isEs ? 'Fecha del evento' : 'Event Date';
  const attachmentNote = isEs
    ? 'Adjuntamos una copia de tu diseño 3D para tu referencia.'
    : 'We have attached a copy of your 3D design for your reference.';

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#fff;">
      <div style="text-align:center;padding:20px 0;border-bottom:3px solid #C9A84C;">
        <h1 style="color:#1a1a1a;margin:0;font-size:22px;">Star Event Rental TX</h1>
        <p style="color:#C9A84C;margin:4px 0 0;font-size:14px;">${title}</p>
      </div>

      <div style="padding:20px 0;">
        <p style="color:#333;font-size:15px;">${greeting} <strong>${escapeHtml(name)}</strong>,</p>
        <p style="color:#555;font-size:14px;line-height:1.6;">${body}</p>
      </div>

      <div style="background:#f9f9f9;border-radius:8px;padding:16px;margin-bottom:16px;">
        <h3 style="color:#1a1a1a;margin:0 0 12px;font-size:15px;border-bottom:1px solid #ddd;padding-bottom:8px;">${layoutTitle}</h3>
        <table style="width:100%;font-size:13px;margin-bottom:12px;">
          <tr><td style="padding:4px 0;color:#777;width:120px;">${tentLabel}:</td><td style="padding:4px 0;color:#333;font-weight:bold;">${tent.width} × ${tent.length} ft</td></tr>
          <tr><td style="padding:4px 0;color:#777;">${dateLabel}:</td><td style="padding:4px 0;color:#333;font-weight:bold;">${escapeHtml(eventDate)}</td></tr>
        </table>
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <tbody>${buildCountsRows(counts, isEs ? 'es' : 'en')}</tbody>
        </table>
      </div>

      <div style="background:#fffbe6;border:1px solid #f0e68c;border-radius:8px;padding:12px;margin-bottom:16px;">
        <p style="color:#856404;font-size:13px;margin:0;line-height:1.5;">${attachmentNote}</p>
      </div>

      <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
      <p style="color:#999;font-size:11px;text-align:center;">
        Star Event Rental TX &bull; Houston, TX &bull; info@stareventrentaltx.com &bull; 281-636-0615
      </p>
    </div>`;
}

function decodeLayoutImage(layoutImage) {
  if (typeof layoutImage !== 'string') return null;
  const match = layoutImage.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/);
  if (!match) return null;
  try {
    const buf = Buffer.from(match[2], 'base64');
    if (buf.length < 1000 || buf.length > 8 * 1024 * 1024) return null;
    return { buffer: buf, ext: match[1] === 'jpg' ? 'jpeg' : match[1] };
  } catch {
    return null;
  }
}

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const rl = checkRateLimit(`designer-quote:${ip}`, 5, 60 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const body = await request.json();

    const name = sanitizeField(body.name, 100);
    const email = sanitizeField(body.email, 254);
    const phone = sanitizeField(body.phone, 25);
    const eventDate = sanitizeField(body.eventDate, 30);
    const address = sanitizeField(body.address, 200);
    const notes = sanitizeField(body.notes, 1000);
    const lang = body.language === 'es' ? 'es' : 'en';

    if (!name || !email || !phone || !eventDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }
    if (!isValidPhone(phone)) {
      return NextResponse.json({ error: 'Invalid phone format' }, { status: 400 });
    }

    const tent = body.tent && typeof body.tent === 'object' ? body.tent : null;
    if (!tent || typeof tent.width !== 'number' || typeof tent.length !== 'number') {
      return NextResponse.json({ error: 'Invalid tent data' }, { status: 400 });
    }

    const items = Array.isArray(body.items) ? body.items.slice(0, 500) : [];
    const counts = countItems(items);

    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured for designer quote');
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const attachment = decodeLayoutImage(body.layoutImage);
    const attachments = attachment
      ? [{ filename: `layout-3d.${attachment.ext}`, content: attachment.buffer }]
      : [];

    await resend.emails.send({
      from: FROM_ADDRESS,
      to: BUSINESS_EMAIL,
      replyTo: email,
      subject: `3D Designer Quote - ${name} - ${eventDate}`,
      html: businessEmailHtml({ name, email, phone, eventDate, address, notes, tent, counts, lang }),
      attachments,
    });

    try {
      await resend.emails.send({
        from: FROM_ADDRESS,
        to: email,
        subject: lang === 'es'
          ? 'Recibimos tu solicitud - Star Event Rental'
          : 'We Received Your Layout Request - Star Event Rental',
        html: clientEmailHtml({ name, eventDate, tent, counts, lang }),
        attachments,
      });
    } catch (clientErr) {
      console.warn('Client confirmation email failed (business email sent):', clientErr.message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Designer quote error:', error);
    return NextResponse.json({ error: 'Failed to send quote request' }, { status: 500 });
  }
}
