import type { APIRoute } from 'astro';
import { SESSION_COOKIE } from '@server/lib/session';
import { json } from '@server/lib/http';

export const prerender = false;

export const POST: APIRoute = async ({ cookies }) => {
  cookies.delete(SESSION_COOKIE, { path: '/' });
  return json({ ok: true });
};
