import type { APIRoute } from 'astro';
import { withUser, withPaidUser, readBody, fail } from '@server/lib/api';
import { json } from '@server/lib/http';
import { listReceived, saveReceived } from '@server/services/outreachService';

export const prerender = false;

export const GET: APIRoute = (ctx) =>
  withUser(ctx, async (uid) => json({ received: await listReceived(uid) }));

export const POST: APIRoute = (ctx) =>
  withPaidUser(ctx, async (uid) => {
    const b = await readBody(ctx);
    try {
      return json({ ok: true, ...(await saveReceived(uid, { sender: b.sender, subject: b.subject, body: b.body, received_at: b.received_at })) });
    } catch (e) { return fail(e); }
  });
