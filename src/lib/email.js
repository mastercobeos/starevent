import { Resend } from 'resend';
import { escapeHtml, formatDate, formatCurrency } from './format';

const BUSINESS_EMAIL = 'info@stareventrentaltx.com';

function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

function buildItemsTable(items) {
  if (!items || items.length === 0) return '';
  return items.map(item => `
    <tr>
      <td style="padding:6px 12px;border-bottom:1px solid #eee;color:#444;">${escapeHtml(item.name || item.product_id)}</td>
      <td style="padding:6px 12px;border-bottom:1px solid #eee;color:#444;text-align:center;">${Number(item.quantity)}</td>
      <td style="padding:6px 12px;border-bottom:1px solid #eee;color:#444;text-align:right;">${formatCurrency(item.unit_price)}</td>
    </tr>
  `).join('');
}

function confirmationEmailHtml(reservation, items, { forBusiness = false } = {}) {
  const clientName = escapeHtml(`${reservation.first_name} ${reservation.last_name}`.trim());

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#fff;">
      <div style="text-align:center;padding:20px 0;border-bottom:3px solid #C9A84C;">
        <h1 style="color:#1a1a1a;margin:0;font-size:22px;">Star Event Rental TX</h1>
        <p style="color:#C9A84C;margin:4px 0 0;font-size:14px;">Reservation Confirmed</p>
      </div>

      <div style="padding:20px 0;">
        <p style="color:#333;font-size:15px;">Hello <strong>${clientName}</strong>,</p>
        <p style="color:#555;font-size:14px;line-height:1.6;">
          Your reservation has been confirmed! We received your deposit payment successfully.
          Below are the details of your reservation.
        </p>
      </div>

      <div style="background:#f9f9f9;border-radius:8px;padding:16px;margin-bottom:16px;">
        <h3 style="color:#1a1a1a;margin:0 0 12px;font-size:15px;border-bottom:1px solid #ddd;padding-bottom:8px;">Reservation Details</h3>
        <table style="width:100%;font-size:13px;">
          <tr>
            <td style="padding:4px 0;color:#777;width:140px;">Client:</td>
            <td style="padding:4px 0;color:#333;font-weight:bold;">${clientName}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;color:#777;">Email:</td>
            <td style="padding:4px 0;color:#333;">${escapeHtml(reservation.client_email)}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;color:#777;">Phone:</td>
            <td style="padding:4px 0;color:#333;">${escapeHtml(reservation.phone_1) || '—'}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;color:#777;">Event Date:</td>
            <td style="padding:4px 0;color:#333;font-weight:bold;">${formatDate(reservation.event_date)}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;color:#777;">Return Date:</td>
            <td style="padding:4px 0;color:#333;">${formatDate(reservation.return_date)}</td>
          </tr>
          ${reservation.rental_days > 1 ? `<tr>
            <td style="padding:4px 0;color:#777;">Rental Days:</td>
            <td style="padding:4px 0;color:#333;">${Number(reservation.rental_days)} days</td>
          </tr>` : ''}
          <tr>
            <td style="padding:4px 0;color:#777;">Address:</td>
            <td style="padding:4px 0;color:#333;">${escapeHtml(reservation.event_address) || '—'}</td>
          </tr>
        </table>
      </div>

      ${items && items.length > 0 ? `
      <div style="margin-bottom:16px;">
        <h3 style="color:#1a1a1a;margin:0 0 8px;font-size:15px;">Items</h3>
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr style="background:#f0f0f0;">
              <th style="padding:8px 12px;text-align:left;color:#555;">Item</th>
              <th style="padding:8px 12px;text-align:center;color:#555;">Qty</th>
              <th style="padding:8px 12px;text-align:right;color:#555;">Price</th>
            </tr>
          </thead>
          <tbody>${buildItemsTable(items)}</tbody>
        </table>
      </div>
      ` : ''}

      <div style="background:#f9f9f9;border-radius:8px;padding:16px;margin-bottom:16px;">
        <h3 style="color:#1a1a1a;margin:0 0 12px;font-size:15px;border-bottom:1px solid #ddd;padding-bottom:8px;">Payment Summary</h3>
        <table style="width:100%;font-size:13px;">
          <tr>
            <td style="padding:4px 0;color:#777;">Subtotal:</td>
            <td style="padding:4px 0;color:#333;text-align:right;">${formatCurrency(reservation.subtotal)}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;color:#777;">Tax:</td>
            <td style="padding:4px 0;color:#333;text-align:right;">${formatCurrency(reservation.tax_amount)}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;color:#777;">Delivery Fee:</td>
            <td style="padding:4px 0;color:#333;text-align:right;">${formatCurrency(reservation.delivery_fee)}</td>
          </tr>
          ${reservation.same_day_pickup ? `<tr>
            <td style="padding:4px 0;color:#777;">Same-Day Pickup Fee:</td>
            <td style="padding:4px 0;color:#333;text-align:right;">${formatCurrency(reservation.same_day_pickup_fee)}</td>
          </tr>` : ''}
          <tr style="border-top:2px solid #C9A84C;">
            <td style="padding:8px 0;color:#1a1a1a;font-weight:bold;font-size:15px;">Total:</td>
            <td style="padding:8px 0;color:#1a1a1a;font-weight:bold;font-size:15px;text-align:right;">${formatCurrency(reservation.total)}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;color:#27ae60;font-weight:bold;">Deposit Paid (40%):</td>
            <td style="padding:4px 0;color:#27ae60;font-weight:bold;text-align:right;">${formatCurrency(reservation.deposit_amount)}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;color:#e67e22;font-weight:bold;">Balance Due (60%):</td>
            <td style="padding:4px 0;color:#e67e22;font-weight:bold;text-align:right;">${formatCurrency(reservation.balance_amount)}</td>
          </tr>
        </table>
      </div>

      <div style="background:#fffbe6;border:1px solid #f0e68c;border-radius:8px;padding:12px;margin-bottom:16px;">
        <p style="color:#856404;font-size:13px;margin:0;line-height:1.5;">
          <strong>Reminder:</strong> The remaining balance of ${formatCurrency(reservation.balance_amount)} is due on the event date before setup.
        </p>
      </div>

      <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
      <p style="color:#999;font-size:11px;text-align:center;">
        Star Event Rental TX &bull; Houston, TX &bull; info@stareventrentaltx.com
      </p>
    </div>
  `;
}

function paymentCompleteEmailHtml(reservation, items) {
  const clientName = escapeHtml(`${reservation.first_name} ${reservation.last_name}`.trim());

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#fff;">
      <div style="text-align:center;padding:20px 0;border-bottom:3px solid #C9A84C;">
        <h1 style="color:#1a1a1a;margin:0;font-size:22px;">Star Event Rental TX</h1>
        <p style="color:#27ae60;margin:4px 0 0;font-size:14px;">Payment Complete — Paid in Full</p>
      </div>

      <div style="padding:20px 0;">
        <p style="color:#333;font-size:15px;">Hello <strong>${clientName}</strong>,</p>
        <p style="color:#555;font-size:14px;line-height:1.6;">
          Your reservation is now fully paid! Thank you for your payment.
          Below are the details of your reservation.
        </p>
      </div>

      <div style="background:#f9f9f9;border-radius:8px;padding:16px;margin-bottom:16px;">
        <h3 style="color:#1a1a1a;margin:0 0 12px;font-size:15px;border-bottom:1px solid #ddd;padding-bottom:8px;">Reservation Details</h3>
        <table style="width:100%;font-size:13px;">
          <tr>
            <td style="padding:4px 0;color:#777;width:140px;">Client:</td>
            <td style="padding:4px 0;color:#333;font-weight:bold;">${clientName}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;color:#777;">Event Date:</td>
            <td style="padding:4px 0;color:#333;font-weight:bold;">${formatDate(reservation.event_date)}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;color:#777;">Address:</td>
            <td style="padding:4px 0;color:#333;">${escapeHtml(reservation.event_address) || '—'}</td>
          </tr>
        </table>
      </div>

      ${items && items.length > 0 ? `
      <div style="margin-bottom:16px;">
        <h3 style="color:#1a1a1a;margin:0 0 8px;font-size:15px;">Items</h3>
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr style="background:#f0f0f0;">
              <th style="padding:8px 12px;text-align:left;color:#555;">Item</th>
              <th style="padding:8px 12px;text-align:center;color:#555;">Qty</th>
              <th style="padding:8px 12px;text-align:right;color:#555;">Price</th>
            </tr>
          </thead>
          <tbody>${buildItemsTable(items)}</tbody>
        </table>
      </div>
      ` : ''}

      <div style="background:#e8f5e9;border-radius:8px;padding:16px;margin-bottom:16px;">
        <table style="width:100%;font-size:13px;">
          <tr>
            <td style="padding:4px 0;color:#777;">Total:</td>
            <td style="padding:4px 0;color:#333;text-align:right;font-weight:bold;">${formatCurrency(reservation.total)}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;color:#27ae60;font-weight:bold;">Deposit (40%):</td>
            <td style="padding:4px 0;color:#27ae60;font-weight:bold;text-align:right;">${formatCurrency(reservation.deposit_amount)}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;color:#27ae60;font-weight:bold;">Balance (60%):</td>
            <td style="padding:4px 0;color:#27ae60;font-weight:bold;text-align:right;">${formatCurrency(reservation.balance_amount)}</td>
          </tr>
          <tr style="border-top:2px solid #27ae60;">
            <td style="padding:8px 0;color:#1a1a1a;font-weight:bold;font-size:15px;">Status:</td>
            <td style="padding:8px 0;color:#27ae60;font-weight:bold;font-size:15px;text-align:right;">PAID IN FULL</td>
          </tr>
        </table>
      </div>

      <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
      <p style="color:#999;font-size:11px;text-align:center;">
        Star Event Rental TX &bull; Houston, TX &bull; info@stareventrentaltx.com
      </p>
    </div>
  `;
}

export async function sendPaymentCompleteEmail(reservation, items) {
  const resend = getResend();
  if (!resend) {
    console.warn('RESEND_API_KEY not configured — skipping payment complete emails');
    return;
  }

  const clientName = `${reservation.first_name} ${reservation.last_name}`.trim();
  const html = paymentCompleteEmailHtml(reservation, items);
  const from = `Star Event Rental <${BUSINESS_EMAIL}>`;

  try {
    await resend.emails.send({
      from,
      to: BUSINESS_EMAIL,
      subject: `Payment Complete - ${clientName} - ${formatDate(reservation.event_date, { weekday: undefined })}`,
      html,
    });

    if (reservation.client_email) {
      await resend.emails.send({
        from,
        to: reservation.client_email,
        subject: 'Payment Complete — Paid in Full - Star Event Rental',
        html,
      });
    }

    console.log(`Payment complete emails sent for reservation ${reservation.id}`);
  } catch (err) {
    console.error('Failed to send payment complete email:', err.message);
  }
}

export async function sendReservationConfirmation(reservation, items) {
  const resend = getResend();
  if (!resend) {
    console.warn('RESEND_API_KEY not configured — skipping confirmation emails');
    return;
  }

  const clientName = `${reservation.first_name} ${reservation.last_name}`.trim();
  const businessHtml = confirmationEmailHtml(reservation, items, { forBusiness: true });
  const clientHtml = confirmationEmailHtml(reservation, items, { forBusiness: false });
  const from = `Star Event Rental <${BUSINESS_EMAIL}>`;

  try {
    // Email to business (includes traffic source)
    await resend.emails.send({
      from,
      to: BUSINESS_EMAIL,
      subject: `New Reservation Confirmed - ${clientName} - ${formatDate(reservation.event_date, { weekday: undefined })}`,
      html: businessHtml,
    });

    // Email to client (no traffic source)
    if (reservation.client_email) {
      await resend.emails.send({
        from,
        to: reservation.client_email,
        subject: 'Your Reservation is Confirmed - Star Event Rental',
        html: clientHtml,
      });
    }

    console.log(`Confirmation emails sent for reservation ${reservation.id}`);
  } catch (err) {
    console.error('Failed to send confirmation email:', err.message);
  }
}
