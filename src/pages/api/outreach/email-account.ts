import type { APIRoute } from 'astro';
import { ensureInit } from '@server/db/factory';
import { connectEmail, getEmailAccount } from '@server/services/emailService';
import { tierForUser } from '@server/services/entitlementService';
import { json, userFromRequest } from '@server/lib/http';

export const prerender = false;

export const GET: APIRoute = async ({ request, cookies }) => {
  await ensureInit();
  const userId = await userFromRequest(request, cookies);
  if (!userId) return json({ error: 'not_authenticated' }, 401);
  return json(await getEmailAccount(userId));
};

export const PUT: APIRoute = async ({ request, cookies }) => {
  await ensureInit();
  const userId = await userFromRequest(request, cookies);
  if (!userId) return json({ error: 'not_authenticated' }, 401);

  const tier = await tierForUser(userId);
  if (tier !== 'paid' && tier !== 'trial') {
    return json({ error: 'paid_feature', message: 'Connecting email needs an active trial or premium.' }, 402);
  }
  const body = await request.json().catch(() => ({}));
  const apiKey = String(body.api_key || '').trim();
  const fromEmail = String(body.from_email || '').trim();
  if (!apiKey || !fromEmail) {
    return json({ error: 'api_key and from_email are required' }, 400);
  }
  return json({
    ok: true,
    ...(await connectEmail(userId, {
      provider: body.provider ? String(body.provider) : 'resend',
      api_key: apiKey,
      from_email: fromEmail,
      from_name: body.from_name ? String(body.from_name) : undefined,
    })),
  });
};
