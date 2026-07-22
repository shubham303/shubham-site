import type { APIRoute } from 'astro';
import { withUser, withPro, readBody, fail, json } from '@server/features/identity/service';
import { getEmail, updateEmail, deleteEmail } from '@server/features/outreach/service';

export const prerender = false;

export const GET: APIRoute = (ctx) =>
  withUser(ctx, async (u) => {
    const e = await getEmail(u.id, String(ctx.params.id));
    return e ? json({ email: e }) : json({ error: 'not_found' }, 404);
  });

export const PATCH: APIRoute = (ctx) =>
  withPro(ctx, async (u) => {
    const b = await readBody(ctx);
    try { return json({ ...(await updateEmail(u.id, String(ctx.params.id), b)) }); }
    catch (e) { return fail(e); }
  });

export const DELETE: APIRoute = (ctx) =>
  withUser(ctx, async (u) => json(await deleteEmail(u.id, String(ctx.params.id))));
