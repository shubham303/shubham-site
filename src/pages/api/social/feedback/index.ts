import type { APIRoute } from 'astro';
import { withUser, withPro, readBody, fail, json } from '@server/features/identity/service';
import { listFeedback, addFeedback } from '@server/features/social/service';

export const prerender = false;

// GET /api/social/feedback?campaign_id=&kind=
export const GET: APIRoute = (ctx) =>
  withUser(ctx, async (u) => {
    const q = ctx.url.searchParams;
    return json({ feedback: await listFeedback(u.id,
      q.get('campaign_id') ?? undefined, q.get('kind') ?? undefined) });
  });

// POST — capture a rejection or a free-text note
export const POST: APIRoute = (ctx) =>
  withPro(ctx, async (u) => {
    const b = await readBody(ctx);
    if (!String(b.campaign_id || '')) return json({ error: 'campaign_id is required' }, 400);
    if (!String(b.kind || '')) return json({ error: 'kind is required' }, 400);
    try {
      return json({ ok: true, ...(await addFeedback(u.id, {
        campaign_id: String(b.campaign_id), kind: String(b.kind),
        reason: b.reason, note: b.note, post_id: b.post_id,
      })) });
    } catch (e) { return fail(e); }
  });
