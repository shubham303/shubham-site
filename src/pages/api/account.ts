import type { APIRoute } from 'astro';
import { ensureInit, getProvider } from '@server/db/factory';
import { tierForUser } from '@server/services/entitlementService';
import { json, userFromRequest } from '@server/lib/http';

export const prerender = false;

export const GET: APIRoute = async ({ request, cookies }) => {
  await ensureInit();
  const userId = await userFromRequest(request, cookies);
  if (!userId) return json({ error: 'not_authenticated' }, 401);
  const p = getProvider();
  const user = await p.users.getById(userId);
  const tier = await tierForUser(userId);
  const keys = await p.apiKeys.listByUser(userId);
  return json({
    email: user?.email,
    tier,
    api_keys: keys.map((k) => k.key_prefix),
  });
};
