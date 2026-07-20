import type { APIRoute } from 'astro';
import { ensureInit } from '@server/db/factory';
import { getProspect, updateProspect, deleteProspect } from '@server/services/outreachService';
import { tierForUser } from '@server/services/entitlementService';
import { json, userFromRequest } from '@server/lib/http';

export const prerender = false;

export const GET: APIRoute = async ({ request, cookies, params }) => {
  await ensureInit();
  const userId = await userFromRequest(request, cookies);
  if (!userId) return json({ error: 'not_authenticated' }, 401);
  const prospect = await getProspect(userId, String(params.id));
  if (!prospect) return json({ error: 'not_found' }, 404);
  return json({ prospect });
};

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
    return json({ ok: true, ...(await updateProspect(userId, String(params.id), body)) });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'update_failed' }, 400);
  }
};

export const DELETE: APIRoute = async ({ request, cookies, params }) => {
  await ensureInit();
  const userId = await userFromRequest(request, cookies);
  if (!userId) return json({ error: 'not_authenticated' }, 401);
  return json(await deleteProspect(userId, String(params.id)));
};
