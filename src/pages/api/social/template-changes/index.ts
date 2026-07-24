import type { APIRoute } from 'astro';
import { withUser, withPro, readBody, fail, json } from '@server/features/identity/service';
import { listTemplateChanges, proposeTemplateChange } from '@server/features/social/service';

export const prerender = false;

// GET /api/social/template-changes?template_id=&status=
export const GET: APIRoute = (ctx) =>
  withUser(ctx, async (u) => {
    const q = ctx.url.searchParams;
    return json({ template_changes: await listTemplateChanges(u.id,
      q.get('template_id') ?? undefined, q.get('status') ?? undefined) });
  });

// POST — propose a change to a template (status 'proposed')
export const POST: APIRoute = (ctx) =>
  withPro(ctx, async (u) => {
    const b = await readBody(ctx);
    if (!String(b.template_id || '')) return json({ error: 'template_id is required' }, 400);
    if (!String(b.change_kind || '')) return json({ error: 'change_kind is required' }, 400);
    try {
      return json({ ok: true, ...(await proposeTemplateChange(u.id, {
        template_id: String(b.template_id), change_kind: String(b.change_kind),
        rationale: b.rationale, proposed_patch: b.proposed_patch,
        source_feedback_ids: b.source_feedback_ids,
      })) });
    } catch (e) { return fail(e); }
  });
