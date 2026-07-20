import type { APIRoute } from 'astro';
import { withUser, withPaidUser, readBody, fail } from '@server/lib/api';
import { json } from '@server/lib/http';
import { addEmail, listEmails } from '@server/services/outreachService';

export const prerender = false;

// GET /api/outreach/emails?campaign_id=...&status=draft
export const GET: APIRoute = (ctx) =>
  withUser(ctx, async (uid) => {
    const q = ctx.url.searchParams;
    const campaignId = q.get('campaign_id');
    if (!campaignId) return json({ error: 'campaign_id is required' }, 400);
    return json({ emails: await listEmails(uid, campaignId, { status: q.get('status') ?? undefined, from: q.get('from') ?? undefined, to: q.get('to') ?? undefined }) });
  });

// POST — add a found prospect + drafted email to a campaign
export const POST: APIRoute = (ctx) =>
  withPaidUser(ctx, async (uid) => {
    const b = await readBody(ctx);
    if (!String(b.campaign_id || '')) return json({ error: 'campaign_id is required' }, 400);
    try {
      return json({ ok: true, ...(await addEmail(uid, {
        campaign_id: String(b.campaign_id), details: b.details, email_ids: b.email_ids,
        recipients: b.recipients, subject: b.subject, body: b.body,
      })) });
    } catch (e) { return fail(e); }
  });
