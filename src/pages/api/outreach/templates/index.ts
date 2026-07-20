import type { APIRoute } from 'astro';
import { withUser, withPaidUser, readBody, fail } from '@server/lib/api';
import { json } from '@server/lib/http';
import { listTemplates, createTemplate } from '@server/services/outreachService';

export const prerender = false;

export const GET: APIRoute = (ctx) =>
  withUser(ctx, async (uid) => {
    const q = ctx.url.searchParams;
    return json({ templates: await listTemplates(uid, {
      status: q.get('status') ?? undefined, from: q.get('from') ?? undefined, to: q.get('to') ?? undefined,
    }) });
  });

export const POST: APIRoute = (ctx) =>
  withPaidUser(ctx, async (uid) => {
    const b = await readBody(ctx);
    if (!String(b.title || '').trim()) return json({ error: 'title is required' }, 400);
    try {
      return json({ ok: true, ...(await createTemplate(uid, { title: String(b.title).trim(), prompt: b.prompt, status: b.status })) });
    } catch (e) { return fail(e); }
  });
