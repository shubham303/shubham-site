import type { APIRoute } from 'astro';
import { withUser, withPro, readBody, fail, json } from '@server/features/identity/service';
import { listSearchTargets, addSearchTarget } from '@server/features/social/service';

export const prerender = false;

// GET /api/social/search-targets?campaign_id=...&platform=&status=
export const GET: APIRoute = (ctx) =>
  withUser(ctx, async (u) => {
    const q = ctx.url.searchParams;
    const campaignId = q.get('campaign_id');
    if (!campaignId) return json({ error: 'campaign_id is required' }, 400);
    return json({ search_targets: await listSearchTargets(u.id, campaignId,
      q.get('platform') ?? undefined, q.get('status') ?? undefined) });
  });

// POST — add a search spec (the harness runs these reads; the agent does not scrape)
export const POST: APIRoute = (ctx) =>
  withPro(ctx, async (u) => {
    const b = await readBody(ctx);
    if (!String(b.campaign_id || '')) return json({ error: 'campaign_id is required' }, 400);
    if (!String(b.platform || '')) return json({ error: 'platform is required' }, 400);
    if (!String(b.search_type || '')) return json({ error: 'search_type is required' }, 400);
    try {
      return json({ ok: true, ...(await addSearchTarget(u.id, {
        campaign_id: String(b.campaign_id), platform: String(b.platform),
        search_type: String(b.search_type), queries: b.queries, scopes: b.scopes,
        recency: b.recency, keywords: b.keywords, max_results: b.max_results,
      })) });
    } catch (e) { return fail(e); }
  });
