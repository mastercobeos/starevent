// Contract template renderer with merge fields
// The user will provide their actual contract text.
// This is a generic template that can be replaced.

import { DEPOSIT_PERCENTAGE, BALANCE_PERCENTAGE } from './reservation-state-machine';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    timeZone: 'America/Chicago',
  });
}

function formatCurrency(amount) {
  return `$${Number(amount).toFixed(2)}`;
}

// Render the contract HTML with reservation data
export function renderContract(reservation, items, language = 'en') {
  const {
    first_name, last_name, client_email, phone_1, phone_2,
    event_date, return_date, event_start_time, event_end_time,
    event_address, property_type, installation_required, installation_details,
    special_notes, subtotal, delivery_fee, total, deposit_amount, balance_amount,
  } = reservation;

  const clientName = `${first_name} ${last_name}`.trim();
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/Chicago',
  });

  const propertyLabel = property_type === 'residential_backyard'
    ? (language === 'en' ? 'Residential Backyard' : 'Patio Residencial')
    : (language === 'en' ? 'Event Hall / Venue' : 'Salón de Eventos');

  const itemsRows = items.map((item) => `
    <tr>
      <td style="padding:6px 10px;border-bottom:1px solid #e5e5e5;">${item.product_name || item.product_id}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #e5e5e5;text-align:center;">${item.quantity}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #e5e5e5;text-align:right;">${formatCurrency(item.unit_price)}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #e5e5e5;text-align:right;">${formatCurrency(item.quantity * item.unit_price)}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:700px;margin:0 auto;color:#222;line-height:1.6;">
      <div style="text-align:center;padding:20px 0;border-bottom:2px solid #c8a87c;">
        <h1 style="margin:0;font-size:22px;color:#1a1a1a;">STAR EVENT RENTAL</h1>
        <p style="margin:4px 0 0;font-size:13px;color:#666;">
          ${language === 'en' ? 'Equipment Rental Agreement' : 'Contrato de Renta de Equipo'}
        </p>
      </div>

      <div style="padding:20px 0;">
        <p style="font-size:13px;color:#666;">
          ${language === 'en' ? 'Date' : 'Fecha'}: <strong>${today}</strong>
        </p>

        <h2 style="font-size:16px;color:#1a1a1a;border-bottom:1px solid #ddd;padding-bottom:6px;margin-top:20px;">
          ${language === 'en' ? 'Client Information' : 'Información del Cliente'}
        </h2>
        <table style="width:100%;font-size:13px;margin-bottom:16px;">
          <tr><td style="padding:3px 0;color:#666;width:140px;">${language === 'en' ? 'Name' : 'Nombre'}:</td><td><strong>${clientName}</strong></td></tr>
          <tr><td style="padding:3px 0;color:#666;">${language === 'en' ? 'Email' : 'Correo'}:</td><td>${client_email || '—'}</td></tr>
          <tr><td style="padding:3px 0;color:#666;">${language === 'en' ? 'Phone' : 'Teléfono'}:</td><td>${phone_1}${phone_2 ? ` / ${phone_2}` : ''}</td></tr>
          <tr><td style="padding:3px 0;color:#666;">${language === 'en' ? 'Address' : 'Dirección'}:</td><td>${event_address}</td></tr>
          <tr><td style="padding:3px 0;color:#666;">${language === 'en' ? 'Property Type' : 'Tipo de Propiedad'}:</td><td>${propertyLabel}</td></tr>
        </table>

        <h2 style="font-size:16px;color:#1a1a1a;border-bottom:1px solid #ddd;padding-bottom:6px;">
          ${language === 'en' ? 'Event Details' : 'Detalles del Evento'}
        </h2>
        <table style="width:100%;font-size:13px;margin-bottom:16px;">
          <tr><td style="padding:3px 0;color:#666;width:140px;">${language === 'en' ? 'Event Date' : 'Fecha del Evento'}:</td><td><strong>${formatDate(event_date)}</strong></td></tr>
          <tr><td style="padding:3px 0;color:#666;">${language === 'en' ? 'Return Date' : 'Fecha de Devolución'}:</td><td>${formatDate(return_date)}</td></tr>
          ${event_start_time ? `<tr><td style="padding:3px 0;color:#666;">${language === 'en' ? 'Start Time' : 'Hora Inicio'}:</td><td>${event_start_time}</td></tr>` : ''}
          ${event_end_time ? `<tr><td style="padding:3px 0;color:#666;">${language === 'en' ? 'End Time' : 'Hora Fin'}:</td><td>${event_end_time}</td></tr>` : ''}
          ${installation_required ? `<tr><td style="padding:3px 0;color:#666;">${language === 'en' ? 'Installation' : 'Instalación'}:</td><td>${language === 'en' ? 'Required' : 'Requerida'}${installation_details ? ` — ${installation_details}` : ''}</td></tr>` : ''}
          ${special_notes ? `<tr><td style="padding:3px 0;color:#666;">${language === 'en' ? 'Notes' : 'Notas'}:</td><td>${special_notes}</td></tr>` : ''}
        </table>

        <h2 style="font-size:16px;color:#1a1a1a;border-bottom:1px solid #ddd;padding-bottom:6px;">
          ${language === 'en' ? 'Rental Items' : 'Artículos Rentados'}
        </h2>
        <table style="width:100%;font-size:13px;border-collapse:collapse;margin-bottom:16px;">
          <thead>
            <tr style="background:#f5f5f5;">
              <th style="padding:8px 10px;text-align:left;border-bottom:2px solid #ddd;">${language === 'en' ? 'Item' : 'Artículo'}</th>
              <th style="padding:8px 10px;text-align:center;border-bottom:2px solid #ddd;">${language === 'en' ? 'Qty' : 'Cant'}</th>
              <th style="padding:8px 10px;text-align:right;border-bottom:2px solid #ddd;">${language === 'en' ? 'Unit Price' : 'Precio Unit.'}</th>
              <th style="padding:8px 10px;text-align:right;border-bottom:2px solid #ddd;">${language === 'en' ? 'Subtotal' : 'Subtotal'}</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <div style="text-align:right;font-size:13px;margin-bottom:20px;">
          <div style="padding:3px 0;">Subtotal: <strong>${formatCurrency(subtotal)}</strong></div>
          <div style="padding:3px 0;">${language === 'en' ? 'Delivery Fee' : 'Envío'}: <strong>${formatCurrency(delivery_fee || 0)}</strong></div>
          <div style="padding:6px 0;font-size:15px;border-top:2px solid #1a1a1a;margin-top:4px;">
            <strong>Total: ${formatCurrency(total)}</strong>
          </div>
        </div>

        <h2 style="font-size:16px;color:#1a1a1a;border-bottom:1px solid #ddd;padding-bottom:6px;">
          ${language === 'en' ? 'Payment Terms' : 'Términos de Pago'}
        </h2>
        <div style="font-size:13px;margin-bottom:20px;">
          <p><strong>${language === 'en' ? 'Deposit' : 'Anticipo'} (${Math.round(DEPOSIT_PERCENTAGE * 100)}%):</strong> ${formatCurrency(deposit_amount)} — ${language === 'en' ? 'due upon signing this agreement' : 'pagadero al firmar este contrato'}.</p>
          <p><strong>${language === 'en' ? 'Balance' : 'Saldo'} (${Math.round(BALANCE_PERCENTAGE * 100)}%):</strong> ${formatCurrency(balance_amount)} — ${language === 'en' ? 'due on the event date, before setup begins' : 'pagadero el día del evento, antes de iniciar montaje'}.</p>
        </div>

        <h2 style="font-size:16px;color:#1a1a1a;border-bottom:1px solid #ddd;padding-bottom:6px;">
          ${language === 'en' ? 'Terms and Conditions' : 'Términos y Condiciones'}
        </h2>
        <ol style="font-size:12px;color:#444;padding-left:20px;margin-bottom:20px;">
          <li style="margin-bottom:6px;">${language === 'en'
            ? 'The Client agrees to rent the equipment listed above for the specified dates.'
            : 'El Cliente acepta rentar el equipo listado arriba para las fechas especificadas.'}</li>
          <li style="margin-bottom:6px;">${language === 'en'
            ? 'The Client is responsible for all rented items from delivery to pickup. Any damaged, lost, or stolen items will be charged at full replacement cost.'
            : 'El Cliente es responsable de todos los artículos rentados desde la entrega hasta la recolección. Cualquier artículo dañado, perdido o robado será cobrado a costo total de reposición.'}</li>
          <li style="margin-bottom:6px;">${language === 'en'
            ? 'Cancellations made more than 7 days before the event date will receive a full refund of the deposit. Cancellations within 7 days are non-refundable.'
            : 'Cancelaciones realizadas más de 7 días antes del evento recibirán reembolso total del anticipo. Cancelaciones dentro de 7 días no son reembolsables.'}</li>
          <li style="margin-bottom:6px;">${language === 'en'
            ? 'Star Event Rental reserves the right to substitute equivalent items if the originally reserved items become unavailable.'
            : 'Star Event Rental se reserva el derecho de sustituir artículos equivalentes si los originalmente reservados no están disponibles.'}</li>
          <li style="margin-bottom:6px;">${language === 'en'
            ? 'Setup and teardown are included for applicable items. The Client must provide adequate access to the event location.'
            : 'Montaje y desmontaje están incluidos para artículos aplicables. El Cliente debe proveer acceso adecuado a la ubicación del evento.'}</li>
          <li style="margin-bottom:6px;">${language === 'en'
            ? 'The balance payment (60%) must be completed before setup begins on the event date.'
            : 'El pago del saldo (60%) debe completarse antes de que inicie el montaje el día del evento.'}</li>
        </ol>

        <div style="margin-top:30px;padding-top:20px;border-top:2px solid #ddd;">
          <p style="font-size:13px;color:#666;margin-bottom:20px;">
            ${language === 'en'
              ? 'By signing below with your initials, you acknowledge that you have read and agree to the terms of this rental agreement.'
              : 'Al firmar con sus iniciales a continuación, usted reconoce que ha leído y acepta los términos de este contrato de renta.'}
          </p>
          <div style="display:flex;justify-content:space-between;align-items:end;margin-top:30px;">
            <div>
              <div style="border-bottom:1px solid #999;width:200px;height:40px;display:flex;align-items:end;justify-content:center;">
                <span id="contract-initials" style="font-size:24px;font-weight:bold;color:#1a1a1a;"></span>
              </div>
              <p style="font-size:11px;color:#666;margin-top:4px;">${language === 'en' ? 'Client Initials' : 'Iniciales del Cliente'}</p>
            </div>
            <div>
              <div style="border-bottom:1px solid #999;width:200px;height:30px;display:flex;align-items:end;justify-content:center;">
                <span style="font-size:12px;color:#666;">${today}</span>
              </div>
              <p style="font-size:11px;color:#666;margin-top:4px;">${language === 'en' ? 'Date' : 'Fecha'}</p>
            </div>
          </div>
        </div>
      </div>

      <div style="text-align:center;padding:15px 0;border-top:1px solid #ddd;font-size:11px;color:#999;">
        Star Event Rental — Houston, TX — (281) 636-0615 — stareventrentaltx.com
      </div>
    </div>
  `;

  return html;
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
