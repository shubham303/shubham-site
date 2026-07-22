import type { APIRoute } from 'astro';
import { withUser, withPro, readBody, fail, json } from '@server/features/identity/service';
import { getTemplate, updateTemplate, deleteTemplate } from '@server/features/outreach/service';

export const prerender = false;

export const GET: APIRoute = (ctx) =>
  withUser(ctx, async (u) => {
    const t = await getTemplate(u.id, String(ctx.params.id));
    return t ? json({ template: t }) : json({ error: 'not_found' }, 404);
  });

export const PATCH: APIRoute = (ctx) =>
  withPro(ctx, async (u) => {
    const b = await readBody(ctx);
    try {
      return json({ ...(await updateTemplate(u.id, String(ctx.params.id), { title: b.title, prompt: b.prompt, status: b.status })) });
    } catch (e) { return fail(e); }
  });

export const DELETE: APIRoute = (ctx) =>
  withUser(ctx, async (u) => json(await deleteTemplate(u.id, String(ctx.params.id))));
