import type { APIRoute } from 'astro';
import { withUser, withPro, readBody, fail, json } from '@server/features/identity/service';
import { updateSearchTarget, deleteSearchTarget } from '@server/features/social/service';

export const prerender = false;

// PATCH — e.g. mark status 'done' / attach result_count after the harness ran it
export const PATCH: APIRoute = (ctx) =>
  withPro(ctx, async (u) => {
    const b = await readBody(ctx);
    try {
      return json({ ...(await updateSearchTarget(u.id, String(ctx.params.id), b)) });
    } catch (e) { return fail(e); }
  });

export const DELETE: APIRoute = (ctx) =>
  withUser(ctx, async (u) => json({ ...(await deleteSearchTarget(u.id, String(ctx.params.id))) }));
