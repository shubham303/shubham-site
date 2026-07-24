import type { APIRoute } from 'astro';
import { withPro, fail, json } from '@server/features/identity/service';
import { applyTemplateChange } from '@server/features/social/service';

export const prerender = false;

// POST — apply an APPROVED proposal to its template. Returns the updated template.
export const POST: APIRoute = (ctx) =>
  withPro(ctx, async (u) => {
    try {
      return json({ ...(await applyTemplateChange(u.id, String(ctx.params.id))) });
    } catch (e) { return fail(e); }
  });
