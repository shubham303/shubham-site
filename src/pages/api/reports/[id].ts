import type { APIRoute } from 'astro';
import { ensureInit } from '@server/db/factory';
import { getReport } from '@server/services/reportService';
import { json, userFromRequest } from '@server/lib/http';

export const prerender = false;

export const GET: APIRoute = async ({ request, cookies, params }) => {
  await ensureInit();
  const userId = await userFromRequest(request, cookies);
  if (!userId) return json({ error: 'not_authenticated' }, 401);
  const report = await getReport(userId, String(params.id));
  if (!report) return json({ error: 'not_found' }, 404);
  return json(report);
};
