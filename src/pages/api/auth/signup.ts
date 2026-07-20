import type { APIRoute } from 'astro';
import { ensureInit } from '@server/db/factory';
import { signup } from '@server/services/authService';
import { signSession, SESSION_COOKIE } from '@server/lib/session';
import { json } from '@server/lib/http';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  await ensureInit();
  const body = await request.json().catch(() => ({}));
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  if (!email || password.length < 6) {
    return json({ error: 'Email and a password of at least 6 characters are required.' }, 400);
  }
  const res = await signup(email, password);
  if ('error' in res) return json({ error: 'That email is already registered.' }, 409);
  cookies.set(SESSION_COOKIE, signSession(res.userId), {
    path: '/', httpOnly: true, sameSite: 'lax', secure: import.meta.env.PROD,
    maxAge: 60 * 60 * 24 * 30,
  });
  // No API key is minted at signup — the user generates one from their
  // account page. The client redirects there next.
  return json({ ok: true });
};
