import type { APIRoute } from 'astro';
import { ensureInit } from '@server/db/factory';
import { login } from '@server/services/authService';
import { signSession, SESSION_COOKIE } from '@server/lib/session';
import { json } from '@server/lib/http';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  await ensureInit();
  const body = await request.json().catch(() => ({}));
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  const userId = await login(email, password);
  if (!userId) return json({ error: 'Invalid email or password.' }, 401);
  cookies.set(SESSION_COOKIE, signSession(userId), {
    path: '/', httpOnly: true, sameSite: 'lax', secure: import.meta.env.PROD,
    maxAge: 60 * 60 * 24 * 30,
  });
  return json({ ok: true });
};
