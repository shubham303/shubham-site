import type { APIRoute } from 'astro';
import { ensureInit } from '@server/db/factory';
import { sendProspect } from '@server/services/emailService';
import { tierForUser } from '@server/services/entitlementService';
import { json, userFromRequest } from '@server/lib/http';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, params }) => {
  await ensureInit();
  const userId = await userFromRequest(request, cookies);
  if (!userId) return json({ error: 'not_authenticated' }, 401);

  const tier = await tierForUser(userId);
  if (tier !== 'paid' && tier !== 'trial') {
    return json({ error: 'paid_feature', message: 'Sending needs an active trial or premium.' }, 402);
  }
  const res = await sendProspect(userId, String(params.id));
  return json(res, res.ok ? 200 : 400);
};
