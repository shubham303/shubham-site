import { getProvider } from '../db/factory';
import { newId, nowIso } from '../lib/ids';

// BYO email: the user connects their own Resend key; we send on their behalf
// from their own verified domain. The secret is stored server-side and never
// returned to the client (see emailAccounts repo SAFE_COLS).

export async function connectEmail(
  userId: string,
  opts: { provider?: string; api_key: string; from_email: string; from_name?: string },
) {
  const now = nowIso();
  await getProvider().emailAccounts.upsert({
    id: newId(),
    user_id: userId,
    provider: opts.provider || 'resend',
    api_key: opts.api_key,
    from_email: opts.from_email,
    from_name: opts.from_name ?? null,
    verified: false,
    created_at: now,
    updated_at: now,
  });
  return { ok: true, from_email: opts.from_email };
}

export async function getEmailAccount(userId: string) {
  const acct = await getProvider().emailAccounts.getSafeByUser(userId);
  return acct
    ? {
        provider: acct.provider,
        from_email: acct.from_email,
        from_name: acct.from_name,
        connected: true,
      }
    : { connected: false };
}

/** Send one prospect's drafted email via the user's connected Resend account. */
export async function sendProspect(userId: string, prospectId: string) {
  const p = getProvider();
  const acct = await p.emailAccounts.getByUser(userId);
  if (!acct || !acct.api_key) {
    return { ok: false, error: 'no_email_account', message: 'Connect a sending email account first.' };
  }
  const prospect = await p.prospects.getById(userId, prospectId);
  if (!prospect) return { ok: false, error: 'prospect_not_found' };
  if (!prospect.email) return { ok: false, error: 'no_recipient', message: 'Prospect has no email.' };
  if (!prospect.draft_subject || !prospect.draft_body) {
    return { ok: false, error: 'no_draft', message: 'Draft a subject and body before sending.' };
  }

  if (acct.provider !== 'resend') {
    return { ok: false, error: 'unsupported_provider', message: `Sending via ${acct.provider} is not wired yet.` };
  }

  const from = acct.from_name ? `${acct.from_name} <${acct.from_email}>` : acct.from_email;
  let messageId: string | null = null;
  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${acct.api_key}`,
      },
      body: JSON.stringify({
        from,
        to: [prospect.email],
        subject: prospect.draft_subject,
        text: prospect.draft_body,
      }),
    });
    const data = (await resp.json().catch(() => ({}))) as { id?: string; message?: string };
    if (!resp.ok) {
      return { ok: false, error: 'send_failed', message: data.message || `HTTP ${resp.status}` };
    }
    messageId = data.id ?? null;
  } catch (e) {
    return { ok: false, error: 'send_failed', message: e instanceof Error ? e.message : 'network error' };
  }

  await p.prospects.updateFields(userId, prospectId, {
    status: 'sent',
    sent_at: nowIso(),
    updated_at: nowIso(),
  });
  return { ok: true, prospect_id: prospectId, message_id: messageId, status: 'sent' };
}
