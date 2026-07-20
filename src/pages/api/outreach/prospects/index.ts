import type { APIRoute } from 'astro';
import { ensureInit } from '@server/db/factory';
import { createProspect, listProspects } from '@server/services/outreachService';
import { tierForUser } from '@server/services/entitlementService';
import { json, userFromRequest } from '@server/lib/http';

export const prerender = false;

export const GET: APIRoute = async ({ request, cookies, url }) => {
  await ensureInit();
  const userId = await userFromRequest(request, cookies);
  if (!userId) return json({ error: 'not_authenticated' }, 401);
  const status = url.searchParams.get('status') ?? undefined;
  return json({ prospects: await listProspects(userId, status) });
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
  // Accept a single prospect or a batch under `prospects`.
  const items = Array.isArray(body.prospects) ? body.prospects : [body];
  const created = [];
  for (const item of items) {
    if (!item || (!item.email && !item.name)) continue;
    created.push(await createProspect(userId, {
      name: item.name ?? null,
      email: item.email ?? null,
      company: item.company ?? null,
      research: item.research ?? null,
      draft_subject: item.draft_subject ?? null,
      draft_body: item.draft_body ?? null,
      prompt_id: item.prompt_id ?? null,
      status: item.status,
    }));
  }
  return json({ ok: true, created: created.length, ids: created.map((c) => c.id) });
};
