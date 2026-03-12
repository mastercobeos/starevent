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
 * Format a date string for display.
 * Appends T00:00:00 to avoid UTC midnight timezone shift.
 *
 * @param {string} dateStr - ISO date string (YYYY-MM-DD)
 * @param {object} [opts] - Intl.DateTimeFormat options override
 * @returns {string} Formatted date or '—'
 */
export function formatDate(dateStr, opts) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Chicago',
    ...opts,
  });
}

/**
 * Format a number as USD currency.
 */
export function formatCurrency(amount) {
  return `$${Number(amount || 0).toFixed(2)}`;
}
