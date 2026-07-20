import type { APIRoute } from 'astro';
import { ensureInit } from '@server/db/factory';
import { updatePrompt, deletePrompt } from '@server/services/outreachService';
import { tierForUser } from '@server/services/entitlementService';
import { json, userFromRequest } from '@server/lib/http';

export const prerender = false;

export const PATCH: APIRoute = async ({ request, cookies, params }) => {
  await ensureInit();
  const userId = await userFromRequest(request, cookies);
  if (!userId) return json({ error: 'not_authenticated' }, 401);
  const tier = await tierForUser(userId);
  if (tier !== 'paid' && tier !== 'trial') {
    return json({ error: 'paid_feature', message: 'Outreach needs an active trial or premium.' }, 402);
  }
  const body = await request.json().catch(() => ({}));
  try {
    const res = await updatePrompt(userId, String(params.id), String(body.name || '').trim(), String(body.body || ''));
    return json({ ok: true, ...res });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'update_failed' }, 400);
  }
};

export const DELETE: APIRoute = async ({ request, cookies, params }) => {
  await ensureInit();
  const userId = await userFromRequest(request, cookies);
  if (!userId) return json({ error: 'not_authenticated' }, 401);
  return json(await deletePrompt(userId, String(params.id)));
};
