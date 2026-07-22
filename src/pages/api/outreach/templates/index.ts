import type { APIRoute } from 'astro';
import { withUser, withPro, readBody, fail, json } from '@server/features/identity/service';
import { listTemplates, createTemplate } from '@server/features/outreach/service';

export const prerender = false;

export const GET: APIRoute = (ctx) =>
  withUser(ctx, async (u) => {
    const q = ctx.url.searchParams;
    return json({ templates: await listTemplates(u.id, {
      status: q.get('status') ?? undefined, from: q.get('from') ?? undefined, to: q.get('to') ?? undefined,
    }) });
  });

export const POST: APIRoute = (ctx) =>
  withPro(ctx, async (u) => {
    const b = await readBody(ctx);
    if (!String(b.title || '').trim()) return json({ error: 'title is required' }, 400);
    try {
      return json({ ok: true, ...(await createTemplate(u.id, { title: String(b.title).trim(), prompt: b.prompt, status: b.status })) });
    } catch (e) { return fail(e); }
  });
