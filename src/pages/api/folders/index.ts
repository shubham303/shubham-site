import type { APIRoute } from 'astro';
import { ensureInit } from '@server/db/factory';
import { listFolders, createFolder } from '@server/services/reportService';
import { json, userFromRequest } from '@server/lib/http';

export const prerender = false;

export const GET: APIRoute = async ({ request, cookies }) => {
  await ensureInit();
  const userId = await userFromRequest(request, cookies);
  if (!userId) return json({ error: 'not_authenticated' }, 401);
  return json({ folders: await listFolders(userId) });
};

export const POST: APIRoute = async ({ request, cookies }) => {
  await ensureInit();
  const userId = await userFromRequest(request, cookies);
  if (!userId) return json({ error: 'not_authenticated' }, 401);
  const body = await request.json().catch(() => ({}));
  const name = String(body.name || '').trim();
  if (!name) return json({ error: 'name required' }, 400);
  return json({ ok: true, ...(await createFolder(userId, name)) });
};
