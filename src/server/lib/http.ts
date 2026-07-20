import type { AstroCookies } from 'astro';
import { verifySession, SESSION_COOKIE } from './session';
import { userIdForKey } from '../services/entitlementService';

export const json = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });

/** Resolve the user from a browser session cookie OR a Bearer API key (MCP). */
export async function userFromRequest(
  request: Request,
  cookies: AstroCookies,
): Promise<string | null> {
  const token = cookies.get(SESSION_COOKIE)?.value;
  const uid = verifySession(token);
  if (uid) return uid;
  const auth = request.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) return userIdForKey(auth.slice(7).trim());
  return null;
}
