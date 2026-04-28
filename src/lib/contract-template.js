// Contract template renderer with merge fields
import { DEPOSIT_PERCENTAGE, BALANCE_PERCENTAGE } from './reservation-state-machine';
import { escapeHtml, formatDate, formatCurrency } from './format';

// Render the contract HTML with reservation data
export function renderContract(reservation, items, language = 'en') {
  const {
    first_name, last_name, client_email, phone_1, phone_2,
    event_date, return_date, event_start_time, event_end_time,
    event_address, property_type, installation_required, installation_details,
    special_notes, subtotal, rental_days, delivery_fee, same_day_pickup, same_day_pickup_fee, tax_amount, total, deposit_amount, balance_amount,
  } = reservation;

  const clientName = escapeHtml(`${first_name} ${last_name}`.trim());
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/Chicago',
  });

  const itemsRows = items.map((item) => `
    <tr>
      <td style="padding:6px 10px;border-bottom:1px solid #e5e5e5;">${escapeHtml(item.product_name || item.product_id)}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #e5e5e5;text-align:center;">${Number(item.quantity)}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #e5e5e5;text-align:right;">${formatCurrency(item.unit_price)}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #e5e5e5;text-align:right;">${formatCurrency(item.quantity * item.unit_price)}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:700px;margin:0 auto;color:#222;line-height:1.6;padding:20px;">
      <div style="text-align:center;padding:20px 0;border-bottom:2px solid #c8a87c;">
        <h1 style="margin:0;font-size:22px;color:#1a1a1a;">STAR EVENT RENTAL, LLC</h1>
        <p style="margin:8px 0 0;font-size:15px;color:#333;font-weight:bold;">Furniture Rental Agreement</p>
      </div>

      <div style="padding:20px 0;">
        <p style="font-size:13px;color:#444;line-height:1.7;">
          This Furniture Rental Agreement (the "Agreement") is entered into in the city of Houston, Texas, on <strong>${today}</strong>, between:
        </p>
        <p style="font-size:13px;color:#444;line-height:1.7;">
          <strong>STAR EVENT RENTAL, LLC</strong>, hereinafter "THE LESSOR", with registered address in Houston, TX 77082, and
        </p>
        <p style="font-size:13px;color:#444;line-height:1.7;">
          <strong>${clientName}</strong> (${escapeHtml(client_email) || '—'}), hereinafter "THE CLIENT".
        </p>
        <p style="font-size:13px;color:#444;">Both parties agree to the following:</p>

        <!-- CLIENT INFO -->
        <h2 style="font-size:15px;color:#1a1a1a;border-bottom:1px solid #ddd;padding-bottom:6px;margin-top:20px;">Client Information</h2>
        <table style="width:100%;font-size:13px;margin-bottom:16px;">
          <tr><td style="padding:3px 0;color:#666;width:140px;">Name:</td><td><strong>${clientName}</strong></td></tr>
          <tr><td style="padding:3px 0;color:#666;">Email:</td><td>${escapeHtml(client_email) || '—'}</td></tr>
          <tr><td style="padding:3px 0;color:#666;">Phone:</td><td>${escapeHtml(phone_1)}${phone_2 ? ` / ${escapeHtml(phone_2)}` : ''}</td></tr>
          <tr><td style="padding:3px 0;color:#666;">Address:</td><td>${escapeHtml(event_address)}</td></tr>
        </table>

        <!-- 1. PURPOSE -->
        <h2 style="font-size:15px;color:#1a1a1a;border-bottom:1px solid #ddd;padding-bottom:6px;">1. Purpose of the Agreement</h2>
        <p style="font-size:13px;color:#444;">
          THE LESSOR agrees to rent to THE CLIENT the furniture (chairs, tables, linens, tents, or other accessories) described below, for the CLIENT's exclusive use at the CLIENT's event.
        </p>

        <!-- 2. EVENT DATE AND LOCATION -->
        <h2 style="font-size:15px;color:#1a1a1a;border-bottom:1px solid #ddd;padding-bottom:6px;">2. Event Date and Location</h2>
        <table style="width:100%;font-size:13px;margin-bottom:16px;">
          <tr><td style="padding:3px 0;color:#666;width:140px;">Event Date:</td><td><strong>${formatDate(event_date)}</strong></td></tr>
          <tr><td style="padding:3px 0;color:#666;">Return Date:</td><td>${formatDate(return_date)}</td></tr>
          ${event_start_time ? `<tr><td style="padding:3px 0;color:#666;">Event Time:</td><td>${escapeHtml(event_start_time)}${event_end_time ? ` — ${escapeHtml(event_end_time)}` : ''}</td></tr>` : ''}
          <tr><td style="padding:3px 0;color:#666;">Event Address:</td><td>${escapeHtml(event_address)}</td></tr>
          ${installation_required ? `<tr><td style="padding:3px 0;color:#666;">Installation:</td><td>Required${installation_details ? ` — ${escapeHtml(installation_details)}` : ''}</td></tr>` : ''}
          ${special_notes ? `<tr><td style="padding:3px 0;color:#666;">Notes:</td><td>${escapeHtml(special_notes)}</td></tr>` : ''}
        </table>

        <!-- RENTAL ITEMS -->
        <h2 style="font-size:15px;color:#1a1a1a;border-bottom:1px solid #ddd;padding-bottom:6px;">Rental Items</h2>
        <table style="width:100%;font-size:13px;border-collapse:collapse;margin-bottom:16px;">
          <thead>
            <tr style="background:#f5f5f5;">
              <th style="padding:8px 10px;text-align:left;border-bottom:2px solid #ddd;">Item</th>
              <th style="padding:8px 10px;text-align:center;border-bottom:2px solid #ddd;">Qty</th>
              <th style="padding:8px 10px;text-align:right;border-bottom:2px solid #ddd;">Unit Price</th>
              <th style="padding:8px 10px;text-align:right;border-bottom:2px solid #ddd;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <div style="text-align:right;font-size:13px;margin-bottom:20px;">
          <div style="padding:3px 0;">Subtotal${(rental_days || 1) > 1 ? ` (${rental_days} days)` : ''}: <strong>${formatCurrency(subtotal)}</strong></div>
          <div style="padding:3px 0;">Sales Tax (8.25%): <strong>${formatCurrency(tax_amount || 0)}</strong></div>
          <div style="padding:3px 0;">Delivery Fee (tax-free): <strong>${formatCurrency(delivery_fee || 0)}</strong></div>
          ${same_day_pickup ? `<div style="padding:3px 0;">Same-Day Pickup Fee: <strong>${formatCurrency(same_day_pickup_fee || 0)}</strong></div>` : ''}
          <div style="padding:6px 0;font-size:15px;border-top:2px solid #1a1a1a;margin-top:4px;">
            <strong>Total: ${formatCurrency(total)}</strong>
          </div>
        </div>

        <!-- 3. PRICE AND PAYMENT METHOD -->
        <h2 style="font-size:15px;color:#1a1a1a;border-bottom:1px solid #ddd;padding-bottom:6px;">3. Price and Payment Method</h2>
        <ul style="font-size:13px;color:#444;padding-left:20px;margin-bottom:16px;">
          <li style="margin-bottom:6px;">The total rental price is <strong>${formatCurrency(total)}</strong>.</li>
          <li style="margin-bottom:6px;">To guarantee the reservation, the CLIENT must pay a <strong>${Math.round(DEPOSIT_PERCENTAGE * 100)}% deposit (${formatCurrency(deposit_amount)})</strong> upon signing.</li>
          <li style="margin-bottom:6px;color:#c0392b;font-weight:bold;">The remaining balance of <strong>${formatCurrency(balance_amount)}</strong> must be paid <strong>at least 48 hours before the event date</strong>. Failure to complete this payment 48 hours prior may result in cancellation of the reservation.</li>
          <li style="margin-bottom:6px;">Payments can be made in cash, Zelle, or by card. All totals will be automatically subject to <strong>8.25% sales tax</strong>, as provided by Texas state law. The only exception is non-profit organizations with a state-issued exemption letter.</li>
        </ul>

        <!-- 4. SECURITY DEPOSIT AND CANCELLATIONS -->
        <h2 style="font-size:15px;color:#1a1a1a;border-bottom:1px solid #ddd;padding-bottom:6px;">4. Security Deposit and Cancellations</h2>
        <ul style="font-size:13px;color:#444;padding-left:20px;margin-bottom:16px;">
          <li style="margin-bottom:6px;">The CLIENT must pay a security deposit of <strong>${formatCurrency(deposit_amount)} (${Math.round(DEPOSIT_PERCENTAGE * 100)}%)</strong>. This deposit is <strong>non-refundable</strong> unless the lessor cancels the order.</li>
          <li style="margin-bottom:6px;">The CLIENT may cancel their order only in the event of a natural disaster or national emergency, and their deposit will be transferred to a new date, subject to availability.</li>
          <li style="margin-bottom:6px;">The lessor may only cancel the order due to unforeseen weather conditions; otherwise, the deposit must be refunded in full.</li>
        </ul>

        <!-- 5. DELIVERY AND PICKUP -->
        <h2 style="font-size:15px;color:#1a1a1a;border-bottom:1px solid #ddd;padding-bottom:6px;">5. Delivery and Pickup</h2>
        <ul style="font-size:13px;color:#444;padding-left:20px;margin-bottom:16px;">
          <li style="margin-bottom:6px;">The lessor agrees to deliver the furniture on the agreed date and at the agreed location, and to pick it up within 24 hours of the event's start.</li>
          <li style="margin-bottom:6px;">The CLIENT is responsible for allowing access to the venue for delivery and pickup during the agreed-upon time.</li>
          <li style="margin-bottom:6px;">Delivery includes only the furniture; it does not include assembly or decoration, unless otherwise agreed upon in writing with an additional charge on the invoice.</li>
          <li style="margin-bottom:6px;">Home delivery: if you require delivery to your backyard, please inquire about the fee.</li>
          <li style="margin-bottom:6px;">The client is responsible for informing the Star Event Rental team of the location of any water pipes or connections in the ground during tent setup. The client is responsible for measuring the space for tent setup before the event.</li>
        </ul>

        <!-- TENT RULES -->
        <div style="font-size:13px;color:#444;background:#fffbe6;border:1px solid #e6d57e;border-radius:6px;padding:12px 16px;margin-bottom:16px;">
          <p style="font-weight:bold;margin-bottom:6px;">If your invoice details tent rental, you must follow these instructions:</p>
          <ul style="padding-left:20px;margin:0;">
            <li style="margin-bottom:6px;">Do not place any type of fire inside the tent, campfires or other similar items.</li>
            <li style="margin-bottom:6px;">Do not place more than one heater per 20 feet. Consult the team about where you can place it (do not do so without prior consultation).</li>
            <li style="margin-bottom:6px;">The tent and its walls cannot be moved after installation. (The Star Event Rental team will consult with you during installation about where and which walls you need.) If any pole is bent or a wall is damaged due to being moved, you must pay for any damaged parts or the entire tent.</li>
            <li style="margin-bottom:6px;">If your tent includes draping, it CANNOT BE MOVED without prior notice.</li>
          </ul>
        </div>

        <ul style="font-size:13px;color:#444;padding-left:20px;margin-bottom:16px;">
          <li style="margin-bottom:6px;">If the event takes place in a venue, the client must pay a deposit of 20% of the total invoice, which will be refunded upon equipment collection. Star Event Rental staff must verify that all equipment is in the same condition as when it was delivered. The refund will be issued within 24 hours.</li>
          <li style="margin-bottom:6px;">If the client is not available to receive the equipment at the agreed-upon time, the Star Event Rental team will assign a new time with a <strong>$40.00 charge</strong>.</li>
          <li style="margin-bottom:6px;">If the client needs the equipment picked up the same day after 9:00 PM, a <strong>$40.00 same-day night pickup fee</strong> will be charged.</li>
        </ul>

        <!-- 6. CLIENT RESPONSIBILITIES -->
        <h2 style="font-size:15px;color:#1a1a1a;border-bottom:1px solid #ddd;padding-bottom:6px;">6. Client Responsibilities</h2>
        <ul style="font-size:13px;color:#444;padding-left:20px;margin-bottom:16px;">
          <li style="margin-bottom:6px;">The CLIENT is responsible for the proper use of the furniture.</li>
          <li style="margin-bottom:6px;">The furniture may not be sublet or moved to a location other than the one agreed upon.</li>
          <li style="margin-bottom:6px;">The client is responsible for verifying that the order is complete and in optimal condition before making the final payment upon delivery.</li>
          <li style="margin-bottom:6px;">In case of damage, loss, or theft, the CLIENT agrees to pay the replacement value.</li>
        </ul>

        <!-- REPLACEMENT VALUES -->
        <div style="font-size:13px;color:#444;background:#f5f5f5;border-radius:6px;padding:12px 16px;margin-bottom:16px;">
          <p style="font-weight:bold;margin-bottom:6px;">Replacement Values:</p>
          <table style="width:100%;font-size:12px;">
            <tr><td style="padding:2px 0;">White garden chair</td><td style="text-align:right;">$32.00 each</td></tr>
            <tr><td style="padding:2px 0;">1.83 m table (6ft)</td><td style="text-align:right;">$78.00 each</td></tr>
            <tr><td style="padding:2px 0;">Round table (60")</td><td style="text-align:right;">$160.00 each</td></tr>
            <tr><td style="padding:2px 0;">Rectangular table 2.44 m (8ft)</td><td style="text-align:right;">$140.00 each</td></tr>
            <tr><td style="padding:2px 0;">Cocktail Table</td><td style="text-align:right;">$75.00 each</td></tr>
            <tr><td style="padding:2px 0;">Tent 20x20</td><td style="text-align:right;">$550.00</td></tr>
            <tr><td style="padding:2px 0;">Tent 20x40</td><td style="text-align:right;">$1,500.00</td></tr>
            <tr><td style="padding:2px 0;">Tent 20x60</td><td style="text-align:right;">$1,200.00</td></tr>
            <tr><td style="padding:2px 0;">Heaters</td><td style="text-align:right;">$180.00</td></tr>
            <tr><td style="padding:2px 0;">Coolers</td><td style="text-align:right;">$500.00</td></tr>
            <tr><td style="padding:2px 0;">Dance Floor</td><td style="text-align:right;">$3,500.00</td></tr>
          </table>
        </div>

        <!-- 7. LIMITATION OF LIABILITY -->
        <h2 style="font-size:15px;color:#1a1a1a;border-bottom:1px solid #ddd;padding-bottom:6px;">7. Limitation of Liability</h2>
        <ul style="font-size:13px;color:#444;padding-left:20px;margin-bottom:16px;">
          <li style="margin-bottom:6px;">THE LESSOR is not responsible for accidents, injuries, or damages caused to persons or property during the use of the rented furniture.</li>
          <li style="margin-bottom:6px;">THE CLIENT assumes full responsibility for the safe use of the rented furniture.</li>
        </ul>

        <!-- 8. JURISDICTION -->
        <h2 style="font-size:15px;color:#1a1a1a;border-bottom:1px solid #ddd;padding-bottom:6px;">8. Jurisdiction</h2>
        <p style="font-size:13px;color:#444;">
          This Agreement shall be governed by and construed in accordance with the laws of the State of Texas. Any dispute shall be submitted to the competent courts of Harris County, Texas.
        </p>

        <!-- 9. ACCEPTANCE -->
        <h2 style="font-size:15px;color:#1a1a1a;border-bottom:1px solid #ddd;padding-bottom:6px;">9. Acceptance</h2>
        <p style="font-size:13px;color:#444;margin-bottom:20px;">
          By signing this Agreement, both parties declare that they have read and understood all its terms, clauses and accept the terms set forth herein.
        </p>
        <p style="font-size:13px;color:#444;font-weight:bold;">
          STAR EVENT RENTAL LLC — THE CLIENT AGREES TO PAY THE SECURITY DEPOSIT.
        </p>

        <!-- SIGNATURE -->
        <div style="margin-top:30px;padding-top:20px;border-top:2px solid #ddd;">
          <p style="font-size:13px;color:#666;margin-bottom:20px;">
            By signing below with your initials, you acknowledge that you have read and agree to all the terms of this Furniture Rental Agreement.
          </p>
          <div style="display:flex;justify-content:space-between;align-items:end;margin-top:30px;">
            <div>
              <div style="border-bottom:1px solid #999;width:200px;height:40px;display:flex;align-items:end;justify-content:center;">
                <span id="contract-initials" style="font-size:24px;font-weight:bold;color:#1a1a1a;font-style:italic;"></span>
              </div>
              <p style="font-size:11px;color:#666;margin-top:4px;">Client Initials</p>
            </div>
            <div>
              <div style="border-bottom:1px solid #999;width:200px;height:30px;display:flex;align-items:end;justify-content:center;">
                <span style="font-size:12px;color:#666;">${today}</span>
              </div>
              <p style="font-size:11px;color:#666;margin-top:4px;">Date</p>
            </div>
          </div>
        </div>
      </div>

      <div style="text-align:center;padding:15px 0;border-top:1px solid #ddd;font-size:11px;color:#999;">
        Star Event Rental — Houston, TX 77082 — (281) 636-0615 — stareventrentaltx.com
      </div>
    </div>
  `;

  return html;
}

// Inject initials into signed contract HTML
export function injectInitials(contractHtml, initials) {
  return contractHtml.replace(
    /<span id="contract-initials"([^>]*)><\/span>/,
    `<span id="contract-initials"$1>${escapeHtml(initials)}</span>`
  );
}

// Generate SHA-256 hash of contract HTML
export async function hashContract(html) {
  const encoder = new TextEncoder();
  const data = encoder.encode(html);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate suggested initials from name
export function getInitials(firstName, lastName) {
  const first = (firstName || '').trim().charAt(0).toUpperCase();
  const last = (lastName || '').trim().charAt(0).toUpperCase();
  return `${first}${last}`;
}
