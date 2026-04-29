export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

export function pushToDataLayer(event, data = {}) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...data });
}

export function trackFormSubmit(data = {}) {
  pushToDataLayer('form_submit', { form_name: 'contact', ...data });
}

export function trackWhatsAppClick(data = {}) {
  pushToDataLayer('whatsapp_click', { channel: 'whatsapp', ...data });
}

export function trackPhoneClick(data = {}) {
  pushToDataLayer('phone_click', { channel: 'phone', ...data });
}
