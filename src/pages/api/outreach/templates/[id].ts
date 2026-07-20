import type { APIRoute } from 'astro';
import { withUser, withPaidUser, readBody, fail } from '@server/lib/api';
import { json } from '@server/lib/http';
import { getTemplate, updateTemplate, deleteTemplate } from '@server/services/outreachService';

export const prerender = false;

export const GET: APIRoute = (ctx) =>
  withUser(ctx, async (uid) => {
    const t = await getTemplate(uid, String(ctx.params.id));
    return t ? json({ template: t }) : json({ error: 'not_found' }, 404);
  });

export const PATCH: APIRoute = (ctx) =>
  withPaidUser(ctx, async (uid) => {
    const b = await readBody(ctx);
    try {
      return json({ ...(await updateTemplate(uid, String(ctx.params.id), { title: b.title, prompt: b.prompt, status: b.status })) });
    } catch (e) { return fail(e); }
  });

export const DELETE: APIRoute = (ctx) =>
  withUser(ctx, async (uid) => json(await deleteTemplate(uid, String(ctx.params.id))));
