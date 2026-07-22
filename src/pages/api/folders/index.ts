import type { APIRoute } from 'astro';
import { withUser, json } from '@server/features/identity/service';
import { listFolders, createFolder } from '@server/features/reports/service';

export const prerender = false;

export const GET: APIRoute = (ctx) =>
  withUser(ctx, async (u) => json({ folders: await listFolders(u.id) }));

export const POST: APIRoute = (ctx) =>
  withUser(ctx, async (u) => {
    const body = await ctx.request.json().catch(() => ({}));
    const name = String(body.name || '').trim();
    if (!name) return json({ error: 'name required' }, 400);
    return json({ ok: true, ...(await createFolder(u.id, name)) });
  });
