import type { APIRoute } from 'astro';
import { withUser, json } from '@server/features/identity/service';
import { getReport } from '@server/features/reports/service';

export const prerender = false;

export const GET: APIRoute = (ctx) =>
  withUser(ctx, async (u) => {
    const report = await getReport(u.id, String(ctx.params.id));
    if (!report) return json({ error: 'not_found' }, 404);
    return json(report);
  });
