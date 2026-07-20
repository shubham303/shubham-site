import type { APIRoute } from 'astro';
import { ensureInit } from '@server/db/factory';
import { createPrompt, listPrompts } from '@server/services/outreachService';
import { tierForUser } from '@server/services/entitlementService';
import { json, userFromRequest } from '@server/lib/http';

export const prerender = false;

export const GET: APIRoute = async ({ request, cookies }) => {
  await ensureInit();
  const userId = await userFromRequest(request, cookies);
  if (!userId) return json({ error: 'not_authenticated' }, 401);
  return json({ prompts: await listPrompts(userId) });
};

export const POST: APIRoute = async ({ request, cookies }) => {
  await ensureInit();
  const userId = await userFromRequest(request, cookies);
  if (!userId) return json({ error: 'not_authenticated' }, 401);

  const tier = await tierForUser(userId);
  if (tier !== 'paid' && tier !== 'trial') {
    return json({ error: 'paid_feature', message: 'Outreach needs an active trial or premium.' }, 402);
  }
  const body = await request.json().catch(() => ({}));
  const name = String(body.name || '').trim();
  const promptBody = String(body.body || '');
  if (!name) return json({ error: 'name is required' }, 400);
  return json({ ok: true, ...(await createPrompt(userId, name, promptBody)) });
};
