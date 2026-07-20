import type { APIRoute } from 'astro';
import { ensureInit } from '@server/db/factory';
import { listReports, saveReport } from '@server/services/reportService';
import { tierForUser } from '@server/services/entitlementService';
import { json, userFromRequest } from '@server/lib/http';

export const prerender = false;

export const GET: APIRoute = async ({ request, cookies, url }) => {
  await ensureInit();
  const userId = await userFromRequest(request, cookies);
  if (!userId) return json({ error: 'not_authenticated' }, 401);
  const folderId = url.searchParams.get('folder');
  return json({ reports: await listReports(userId, folderId) });
};

export const POST: APIRoute = async ({ request, cookies }) => {
  await ensureInit();
  const userId = await userFromRequest(request, cookies);
  if (!userId) return json({ error: 'not_authenticated' }, 401);

  const tier = await tierForUser(userId);
  if (tier !== 'paid' && tier !== 'trial') {
    return json(
      { error: 'paid_feature', message: 'Saving reports needs an active trial or premium.' },
      402,
    );
  }
  const body = await request.json().catch(() => ({}));
  const title = String(body.title || '').trim();
  const content = String(body.content || '');
  if (!title || !content) return json({ error: 'title and content are required' }, 400);
  try {
    const res = await saveReport(userId, {
      title,
      content,
      format: body.format ? String(body.format) : undefined,
      folderId: body.folder_id ? String(body.folder_id) : null,
      metadata: body.metadata,
    });
    return json({ ok: true, ...res });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'save_failed';
    return json({ error: msg }, 400);
  }
};
