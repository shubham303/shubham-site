import type { APIRoute } from 'astro';
import { withUser, withPro, readBody, fail, json } from '@server/features/identity/service';
import { listPosts, addPost } from '@server/features/social/service';

export const prerender = false;

// GET /api/social/posts?campaign_id=...&status=draft&platform=reddit&kind=author
// (campaign_id required; status/platform/kind optional filters)
export const GET: APIRoute = (ctx) =>
  withUser(ctx, async (u) => {
    const q = ctx.url.searchParams;
    const campaignId = q.get('campaign_id');
    if (!campaignId) return json({ error: 'campaign_id is required' }, 400);
    return json({ posts: await listPosts(u.id, campaignId, {
      status: q.get('status') ?? undefined, platform: q.get('platform') ?? undefined,
      kind: q.get('kind') ?? undefined,
    }) });
  });

// POST — add a drafted post (status 'draft')
export const POST: APIRoute = (ctx) =>
  withPro(ctx, async (u) => {
    const b = await readBody(ctx);
    if (!String(b.campaign_id || '')) return json({ error: 'campaign_id is required' }, 400);
    if (!String(b.platform || '')) return json({ error: 'platform is required' }, 400);
    if (!String(b.kind || '')) return json({ error: 'kind is required' }, 400);
    try {
      return json({ ok: true, ...(await addPost(u.id, {
        campaign_id: String(b.campaign_id), platform: String(b.platform), kind: String(b.kind),
        content: b.content, content_format: b.content_format,
        target_url: b.target_url, target_kind: b.target_kind,
        target_title: b.target_title, target_author: b.target_author, notes: b.notes,
      })) });
    } catch (e) { return fail(e); }
  });
