import type { APIRoute } from 'astro';
import { withUser, withPaidUser, readBody, fail } from '@server/lib/api';
import { json } from '@server/lib/http';
import { listCampaigns, setupCampaign } from '@server/services/outreachService';

export const prerender = false;

export const GET: APIRoute = (ctx) =>
  withUser(ctx, async (uid) => {
    const q = ctx.url.searchParams;
    return json({ campaigns: await listCampaigns(uid, {
      status: q.get('status') ?? undefined, template_id: q.get('template_id') ?? undefined,
      from: q.get('from') ?? undefined, to: q.get('to') ?? undefined,
    }) });
  });

export const POST: APIRoute = (ctx) =>
  withPaidUser(ctx, async (uid) => {
    const b = await readBody(ctx);
    if (!String(b.template_id || '')) return json({ error: 'template_id is required' }, 400);
    try {
      return json({ ok: true, ...(await setupCampaign(uid, { template_id: String(b.template_id), title: b.title })) });
    } catch (e) { return fail(e); }
  });
