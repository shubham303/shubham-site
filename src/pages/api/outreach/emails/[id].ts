import type { APIRoute } from 'astro';
import { withUser, withPaidUser, readBody, fail } from '@server/lib/api';
import { json } from '@server/lib/http';
import { getEmail, updateEmail, deleteEmail } from '@server/services/outreachService';

export const prerender = false;

export const GET: APIRoute = (ctx) =>
  withUser(ctx, async (uid) => {
    const e = await getEmail(uid, String(ctx.params.id));
    return e ? json({ email: e }) : json({ error: 'not_found' }, 404);
  });

export const PATCH: APIRoute = (ctx) =>
  withPaidUser(ctx, async (uid) => {
    const b = await readBody(ctx);
    try { return json({ ...(await updateEmail(uid, String(ctx.params.id), b)) }); }
    catch (e) { return fail(e); }
  });

export const DELETE: APIRoute = (ctx) =>
  withUser(ctx, async (uid) => json(await deleteEmail(uid, String(ctx.params.id))));
