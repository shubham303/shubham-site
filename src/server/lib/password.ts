import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';

// scrypt via node:crypto — no native dependency.
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, derived] = stored.split(':');
  if (!salt || !derived) return false;
  const test = scryptSync(password, salt, 64);
  const orig = Buffer.from(derived, 'hex');
  return test.length === orig.length && timingSafeEqual(test, orig);
}
