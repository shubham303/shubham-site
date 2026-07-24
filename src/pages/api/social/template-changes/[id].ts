import type { APIRoute } from 'astro';
import { withPro, readBody, fail, json } from '@server/features/identity/service';
import { updateTemplateChange } from '@server/features/social/service';

export const prerender = false;

// PATCH — approve or reject a proposal (status 'approved' | 'rejected')
export const PATCH: APIRoute = (ctx) =>
  withPro(ctx, async (u) => {
    const b = await readBody(ctx);
    if (!String(b.status || '')) return json({ error: 'status is required' }, 400);
    try {
      return json({ ...(await updateTemplateChange(u.id, String(ctx.params.id),
        { status: String(b.status), decision_note: b.decision_note })) });
    } catch (e) { return fail(e); }
  });
