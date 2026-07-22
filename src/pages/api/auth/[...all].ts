// BetterAuth catch-all. All auth routes (sign-up, sign-in, sign-out,
// get-session, sign-up, api-key/*) flow through here. BetterAuth's handler
// returns a standard Response — we hand it the request and return as-is.

import type { APIRoute } from 'astro';
import { auth } from '@server/features/identity/auth';
import { ensureInit } from '@server/db';

export const prerender = false;

export const ALL: APIRoute = async ({ request }) => {
  await ensureInit();
  return auth.handler(request);
};
