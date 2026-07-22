import type { APIRoute } from 'astro';
import { withUser, withPro, readBody, fail, json } from '@server/features/identity/service';
import { listReceived, saveReceived } from '@server/features/outreach/service';

export const prerender = false;

export const GET: APIRoute = (ctx) =>
  withUser(ctx, async (u) => json({ received: await listReceived(u.id) }));

export const POST: APIRoute = (ctx) =>
  withPro(ctx, async (u) => {
    const b = await readBody(ctx);
    try {
      return json({ ok: true, ...(await saveReceived(u.id, { sender: b.sender, subject: b.subject, body: b.body, received_at: b.received_at })) });
    } catch (e) { return fail(e); }
  });
