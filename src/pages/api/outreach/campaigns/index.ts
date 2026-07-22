import type { APIRoute } from 'astro';
import { withUser, withPro, readBody, fail, json } from '@server/features/identity/service';
import { listCampaigns, setupCampaign } from '@server/features/outreach/service';

export const prerender = false;

export const GET: APIRoute = (ctx) =>
  withUser(ctx, async (u) => {
    const q = ctx.url.searchParams;
    return json({ campaigns: await listCampaigns(u.id, {
      status: q.get('status') ?? undefined, template_id: q.get('template_id') ?? undefined,
      from: q.get('from') ?? undefined, to: q.get('to') ?? undefined,
    }) });
  });

export const POST: APIRoute = (ctx) =>
  withPro(ctx, async (u) => {
    const b = await readBody(ctx);
    if (!String(b.template_id || '')) return json({ error: 'template_id is required' }, 400);
    try {
      return json({ ok: true, ...(await setupCampaign(u.id, { template_id: String(b.template_id), title: b.title })) });
    } catch (e) { return fail(e); }
  });
