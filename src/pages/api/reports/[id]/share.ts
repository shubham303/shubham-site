import type { APIRoute } from 'astro';
import { withUser, json } from '@server/features/identity/service';
import { shareReport } from '@server/features/reports/service';

export const prerender = false;

export const POST: APIRoute = (ctx) =>
  withUser(ctx, async (u) => {
    const body = await ctx.request.json().catch(() => ({}));
    const share = body.share === undefined ? true : Boolean(body.share);
    const res = await shareReport(u.id, String(ctx.params.id), share);
    if (!res) return json({ error: 'not_found' }, 404);
    return json({ ok: true, ...res });
  });
