import { createHmac, timingSafeEqual } from 'node:crypto';

const SECRET = process.env.SESSION_SECRET || 'dev-insecure-secret-change-in-prod';
export const SESSION_COOKIE = 'ti_session';

/** Sign a user id into a stateless session token (HMAC, no session table). */
export function signSession(userId: string): string {
  const payload = Buffer.from(userId).toString('base64url');
  const sig = createHmac('sha256', SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifySession(token?: string | null): string | null {
  if (!token) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const expected = createHmac('sha256', SECRET).update(payload).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return Buffer.from(payload, 'base64url').toString();
}
