// Shared formatting and escaping utilities — single source of truth

/**
 * Escape HTML special characters to prevent XSS.
 * Accepts any type — converts to string first.
 */
export function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Format a YYYY-MM-DD calendar date for display.
 * Treats the input as a pure calendar date (no time-of-day, no timezone),
 * so the displayed day is identical to what the user typed in the form
 * regardless of where the server runs (UTC on Vercel, local on dev).
 *
 * @param {string} dateStr - ISO date string (YYYY-MM-DD)
 * @param {object} [opts] - Intl.DateTimeFormat options override
 * @returns {string} Formatted date or '—'
 */
export function formatDate(dateStr, opts) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00Z');
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
    ...opts,
  });
}

/**
 * Format a number as USD currency.
 */
export function formatCurrency(amount) {
  return `$${Number(amount || 0).toFixed(2)}`;
}
