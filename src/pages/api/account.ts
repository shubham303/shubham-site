// GET /api/account — who am I + what can I do? Resolves from the session
// cookie (browser) or x-api-key (MCP) via the identity service.

import type { APIRoute } from 'astro';
import { ensureInit } from '@server/db';
import { json } from '@server/lib/http';
import { userFromRequest, roleForUser } from '@server/features/identity/service';
import { listApiKeys } from '@server/features/identity/apiKeyService';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  await ensureInit();
  const user = await userFromRequest(request);
  if (!user) return json({ error: 'not_authenticated' }, 401);
  const role = await roleForUser(user.id);
  const keys = await listApiKeys(request);
  return json({
    email: user.email,
    role,
    api_keys: keys.map((k) => k.key_prefix),
  });
};
