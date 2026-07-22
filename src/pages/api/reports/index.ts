import type { APIRoute } from 'astro';
import { withUser, withPro, json, fail } from '@server/features/identity/service';
import { listReports, saveReport } from '@server/features/reports/service';

export const prerender = false;

export const GET: APIRoute = (ctx) =>
  withUser(ctx, async (u) => {
    const folderId = ctx.url.searchParams.get('folder');
    return json({ reports: await listReports(u.id, folderId) });
  });

export const POST: APIRoute = (ctx) =>
  withPro(ctx, async (u) => {
    const body = await ctx.request.json().catch(() => ({}));
    const title = String(body.title || '').trim();
    const content = String(body.content || '');
    if (!title || !content) return json({ error: 'title and content are required' }, 400);
    try {
      const res = await saveReport(u.id, {
        title,
        content,
        format: body.format ? String(body.format) : undefined,
        folderId: body.folder_id ? String(body.folder_id) : null,
        metadata: body.metadata,
      });
      return json({ ok: true, ...res });
    } catch (e) { return fail(e); }
  });
