import type { APIRoute } from 'astro';
import { ensureInit } from '@server/db/factory';
import { shareReport } from '@server/services/reportService';
import { json, userFromRequest } from '@server/lib/http';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, params }) => {
  await ensureInit();
  const userId = await userFromRequest(request, cookies);
  if (!userId) return json({ error: 'not_authenticated' }, 401);
  const body = await request.json().catch(() => ({}));
  const share = body.share === undefined ? true : Boolean(body.share);
  const res = await shareReport(userId, String(params.id), share);
  if (!res) return json({ error: 'not_found' }, 404);
  return json({ ok: true, ...res });
};
