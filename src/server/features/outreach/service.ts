// outreach business logic: templates, campaigns, prospects + drafted emails,
// and received emails. Moved verbatim from the old services/outreachService.ts
// with imports updated to the new feature-scoped repositories.

import { newId, nowIso } from '../../lib/ids';
import {
  templatesRepository,
  campaignsRepository,
  prospectsRepository,
  sentEmailsRepository,
  receivedEmailsRepository,
} from './repository';

const parse = (s: string | null) => { try { return s ? JSON.parse(s) : null; } catch { return s; } };
const str = (v: unknown) => (v === undefined || v === null ? null : typeof v === 'string' ? v : JSON.stringify(v));

// ---- templates ------------------------------------------------------------ #

export async function createTemplate(userId: string, opts: { title: string; prompt?: string; status?: string }) {
  const id = newId(); const now = nowIso();
  await templatesRepository.insert({
    id, user_id: userId, title: opts.title, prompt: opts.prompt ?? '',
    status: opts.status === 'inactive' ? 'inactive' : 'active', created_at: now, updated_at: now,
  });
  return { id, title: opts.title };
}

export async function listTemplates(userId: string, filter: { status?: string; from?: string; to?: string } = {}) {
  return templatesRepository.list(userId, filter);
}

export async function getTemplate(userId: string, id: string) {
  return templatesRepository.getById(userId, id);
}

export async function updateTemplate(userId: string, id: string, fields: { title?: string; prompt?: string; status?: string }) {
  const t = await templatesRepository.getById(userId, id);
  if (!t) throw new Error('template_not_found');
  await templatesRepository.update(userId, id, fields, nowIso());
  return { ok: true };
}

export async function deleteTemplate(userId: string, id: string) {
  await templatesRepository.remove(userId, id);
  return { ok: true };
}

// ---- campaigns ------------------------------------------------------------ #

export async function setupCampaign(userId: string, opts: { template_id: string; title?: string }) {
  const tpl = await templatesRepository.getById(userId, opts.template_id);
  if (!tpl) throw new Error('template_not_found');
  const id = newId(); const now = nowIso();
  await campaignsRepository.insert({
    id, user_id: userId, template_id: tpl.id,
    title: opts.title ?? `${tpl.title} — ${new Date().toISOString().slice(0, 10)}`,
    prompt: tpl.prompt, // frozen copy
    status: 'active', created_at: now, updated_at: now,
  });
  return { id, title: opts.title ?? tpl.title, prompt: tpl.prompt };
}

export async function listCampaigns(userId: string, filter: { status?: string; template_id?: string; from?: string; to?: string } = {}) {
  const rows = await campaignsRepository.list(userId, filter);
  // attach a light email count per campaign
  return Promise.all(rows.map(async (c) => {
    const emails = await sentEmailsRepository.listByCampaign(userId, c.id);
    return {
      ...c,
      email_count: emails.length,
      sent_count: emails.filter((e) => e.status === 'sent').length,
    };
  }));
}

export async function getCampaign(userId: string, id: string) {
  const c = await campaignsRepository.getById(userId, id);
  if (!c) return null;
  const emails = await listEmails(userId, id);
  return { ...c, emails };
}

// ---- prospects + emails --------------------------------------------------- #

/** Add a found prospect and its drafted email to a campaign (email = 'draft'). */
export async function addEmail(userId: string, opts: {
  campaign_id: string; details?: unknown; email_ids?: unknown;
  recipients?: unknown; subject?: string; body?: string;
}) {
  const campaign = await campaignsRepository.getById(userId, opts.campaign_id);
  if (!campaign) throw new Error('campaign_not_found');
  const now = nowIso();
  const prospectId = newId();
  await prospectsRepository.insert({
    id: prospectId, user_id: userId, campaign_id: opts.campaign_id,
    details: str(opts.details), email_ids: str(opts.email_ids), created_at: now, updated_at: now,
  });
  const emailId = newId();
  await sentEmailsRepository.insert({
    id: emailId, user_id: userId, campaign_id: opts.campaign_id, prospect_id: prospectId,
    recipients: str(opts.recipients), subject: opts.subject ?? null, body: opts.body ?? null,
    status: 'draft', sent_at: null, created_at: now, updated_at: now,
  });
  return { email_id: emailId, prospect_id: prospectId };
}

const EMAIL_EDITABLE = new Set(['recipients', 'subject', 'body', 'status', 'sent_at']);

export async function updateEmail(userId: string, id: string, patch: Record<string, unknown>) {
  const e = await sentEmailsRepository.getById(userId, id);
  if (!e) throw new Error('email_not_found');
  const fields: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(patch)) {
    if (EMAIL_EDITABLE.has(k)) fields[k] = k === 'recipients' ? str(v) : v;
  }
  if (fields.status === 'sent' && !fields.sent_at) fields.sent_at = nowIso();
  fields.updated_at = nowIso();
  await sentEmailsRepository.updateFields(userId, id, fields);
  return { ok: true };
}

/** Delete/disapprove an email (and its prospect) so the agent won't send it. */
export async function deleteEmail(userId: string, id: string) {
  const e = await sentEmailsRepository.getById(userId, id);
  if (e?.prospect_id) await prospectsRepository.remove(userId, e.prospect_id);
  await sentEmailsRepository.remove(userId, id);
  return { ok: true };
}

export async function listEmails(userId: string, campaignId: string, filter: { status?: string; from?: string; to?: string } = {}) {
  const [emails, prospects] = await Promise.all([
    sentEmailsRepository.listByCampaign(userId, campaignId, filter),
    prospectsRepository.listByCampaign(userId, campaignId),
  ]);
  const byId = new Map(prospects.map((p) => [p.id, p]));
  return emails.map((e) => {
    const p = e.prospect_id ? byId.get(e.prospect_id) : null;
    return {
      id: e.id, campaign_id: e.campaign_id, prospect_id: e.prospect_id,
      recipients: parse(e.recipients), subject: e.subject, body: e.body,
      status: e.status, sent_at: e.sent_at, created_at: e.created_at, updated_at: e.updated_at,
      details: p ? parse(p.details) : null, email_ids: p ? parse(p.email_ids) : null,
    };
  });
}

export async function getEmail(userId: string, id: string) {
  const e = await sentEmailsRepository.getById(userId, id);
  if (!e) return null;
  const p = e.prospect_id ? await prospectsRepository.getById(userId, e.prospect_id) : null;
  return {
    id: e.id, campaign_id: e.campaign_id, prospect_id: e.prospect_id,
    recipients: parse(e.recipients), subject: e.subject, body: e.body,
    status: e.status, sent_at: e.sent_at, created_at: e.created_at, updated_at: e.updated_at,
    details: p ? parse(p.details) : null, email_ids: p ? parse(p.email_ids) : null,
  };
}

// ---- received emails (global, not campaign-scoped) ------------------------ #

export async function saveReceived(userId: string, opts: { sender?: string; subject?: string; body?: string; received_at?: string }) {
  const id = newId();
  await receivedEmailsRepository.insert({
    id, user_id: userId, sender: opts.sender ?? null, subject: opts.subject ?? null,
    body: opts.body ?? null, received_at: opts.received_at ?? nowIso(), created_at: nowIso(),
  });
  return { id };
}

export async function listReceived(userId: string) {
  return receivedEmailsRepository.listByUser(userId);
}

export async function deleteReceived(userId: string, id: string) {
  await receivedEmailsRepository.remove(userId, id);
  return { ok: true };
}
