import crypto from 'crypto';

// ============================================
// HMAC Token for client reservation access
// ============================================

// SECURITY: HMAC_SECRET must be explicitly configured — never fall back to service role key
const HMAC_SECRET = process.env.HMAC_SECRET;
if (!HMAC_SECRET) {
  console.error('CRITICAL: HMAC_SECRET environment variable is not set. Reservation token verification will fail.');
}

// Generate an HMAC token for a reservation ID
export function generateReservationToken(reservationId) {
  if (!HMAC_SECRET) throw new Error('HMAC_SECRET is not configured');
  return crypto.createHmac('sha256', HMAC_SECRET)
    .update(reservationId)
    .digest('hex')
    .slice(0, 32); // 32-char hex token (128-bit)
}

// Verify an HMAC token matches the reservation
export function verifyReservationToken(reservationId, token) {
  if (!HMAC_SECRET || !token || !reservationId) return false;
  // SECURITY: Reject tokens that aren't exactly 32 hex chars — no padding
  if (token.length !== 32 || !/^[0-9a-f]{32}$/i.test(token)) return false;
  const expected = generateReservationToken(reservationId);
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, 'hex'),
      Buffer.from(token.toLowerCase(), 'hex')
    );
  } catch {
    return false;
  }
}

// ============================================
// Square Webhook Signature Verification
// ============================================

export function verifySquareWebhookSignature(request, body, signatureKey) {
  const signature = request.headers.get('x-square-hmacsha256-signature');
  if (!signature || !signatureKey) return false;

  const notificationUrl = process.env.SQUARE_WEBHOOK_URL || '';
  // Square computes HMAC-SHA256 of: notificationUrl + raw body
  const payload = notificationUrl + body;
  const expected = crypto.createHmac('sha256', signatureKey)
    .update(payload)
    .digest('base64');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'base64'),
      Buffer.from(expected, 'base64')
    );
  } catch {
    return false;
  }
}

// ============================================
// Rate Limiting (in-memory, per-IP)
// ============================================

const rateLimitStore = new Map();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore) {
    if (now - entry.windowStart > entry.windowMs * 2) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Check rate limit for a given identifier (usually IP + endpoint)
 * @param {string} identifier - Unique key (e.g. "ip:endpoint")
 * @param {number} maxRequests - Max requests per window
 * @param {number} windowMs - Window size in ms (default: 60 minutes)
 * @returns {{ allowed: boolean, remaining: number, retryAfterMs: number }}
 */
export function checkRateLimit(identifier, maxRequests, windowMs = 60 * 60 * 1000) {
  const now = Date.now();
  let entry = rateLimitStore.get(identifier);

  if (!entry || now - entry.windowStart > windowMs) {
    entry = { count: 0, windowStart: now, windowMs };
    rateLimitStore.set(identifier, entry);
  }

  entry.count++;

  if (entry.count > maxRequests) {
    const retryAfterMs = windowMs - (now - entry.windowStart);
    return { allowed: false, remaining: 0, retryAfterMs };
  }

  return { allowed: true, remaining: maxRequests - entry.count, retryAfterMs: 0 };
}

// Get client IP from request
export function getClientIp(request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
}

// ============================================
// Input Sanitization
// ============================================

// Escape HTML special characters to prevent XSS
export function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// Validate and sanitize a string field with length limit
export function sanitizeField(value, maxLength = 255) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

// Basic email format validation
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

// Basic phone format validation (allows common formats)
export function isValidPhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = phone.replace(/[\s\-\(\)\.\+]/g, '');
  return /^\d{7,15}$/.test(cleaned);
}
