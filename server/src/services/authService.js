import crypto from 'node:crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'sword_jwt_secret_render_production_key_2026_super_secure';
export const JWT_COOKIE_NAME = 'sword_jwt_token';
export const JWT_EXPIRES_IN_SECONDS = 7 * 24 * 60 * 60; // 7 days in seconds

/**
 * Formats a Date object into strict DD:MM:YYYY format
 * Example: 14:10:2026
 */
export function formatDateDDMMYYYY(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}:${month}:${year}`;
}

/**
 * Hashes a plaintext password using crypto.scrypt
 */
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `scrypt:${salt}:${derivedKey.toString('hex')}`;
}

/**
 * Verifies a plaintext password against a stored scrypt hash
 */
export function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.startsWith('scrypt:')) {
    return false;
  }
  const parts = storedHash.split(':');
  if (parts.length !== 3) return false;

  const [, salt, originalHash] = parts;
  const keyToVerify = crypto.scryptSync(password, salt, 64);
  const keyToVerifyHex = keyToVerify.toString('hex');

  // Constant-time buffer comparison to prevent timing attacks
  const bufOriginal = Buffer.from(originalHash, 'hex');
  const bufVerify = Buffer.from(keyToVerifyHex, 'hex');

  if (bufOriginal.length !== bufVerify.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufOriginal, bufVerify);
}

/**
 * Helper to encode Base64URL
 */
function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/**
 * Helper to decode Base64URL
 */
function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf-8');
}

/**
 * Signs a standard JWT with 7-day expiration (RFC 7519)
 */
export function generateToken(user) {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + JWT_EXPIRES_IN_SECONDS; // 7 days

  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const payload = {
    sub: user.id,
    login: user.login,
    email: user.email,
    iat: now,
    exp: exp,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const message = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(message)
    .digest('base64url');

  return `${message}.${signature}`;
}

/**
 * Verifies a JWT token signature and expiration
 */
export function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, signature] = parts;
  const message = `${encodedHeader}.${encodedPayload}`;

  const expectedSignature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(message)
    .digest('base64url');

  const bufSig = Buffer.from(signature);
  const bufExpected = Buffer.from(expectedSignature);

  if (bufSig.length !== bufExpected.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(bufSig, bufExpected)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    const now = Math.floor(Date.now() / 1000);

    // Check expiration (7 days)
    if (payload.exp && payload.exp < now) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
