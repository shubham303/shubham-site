// social business logic: templates, campaigns, posts (author + reply),
// search targets, feedback, and template-change proposals.
//
// Mirrors outreach/service.ts. Key behaviours:
//  - setupCampaign FREEZES the template prompt into the campaign.
//  - addPost stores a unified author/reply row (status 'draft').
//  - deletePost optionally captures a rejection reason as feedback (so the
//    agent can learn) before removing the post.
//  - applyTemplateChange applies an APPROVED proposal to the template
//    (append/replace/add_rule). No silent mutation — proposals must be
//    approved first.

import { newId, nowIso } from '../../lib/ids';
import {
  socialTemplatesRepository,
  socialCampaignsRepository,
  socialPostsRepository,
  socialSearchTargetsRepository,
  socialFeedbackRepository,
  socialTemplateChangesRepository,
} from './repository';

const parse = (s: string | null) => { try { return s ? JSON.parse(s) : null; } catch { return s; } };
const str = (v: unknown) => (v === undefined || v === null ? null : typeof v === 'string' ? v : JSON.stringify(v));

// ---- templates ------------------------------------------------------------ //

export async function createTemplate(userId: string, opts: { title: string; prompt?: string; status?: string }) {
  const id = newId(); const now = nowIso();
  await socialTemplatesRepository.insert({
    id, user_id: userId, title: opts.title, prompt: opts.prompt ?? '',
    status: opts.status === 'inactive' ? 'inactive' : 'active', created_at: now, updated_at: now,
  });
  return { id, title: opts.title };
}

export async function listTemplates(userId: string, filter: { status?: string; from?: string; to?: string } = {}) {
  return socialTemplatesRepository.list(userId, filter);
}

export async function getTemplate(userId: string, id: string) {
  return socialTemplatesRepository.getById(userId, id);
}

export async function updateTemplate(userId: string, id: string, fields: { title?: string; prompt?: string; status?: string }) {
  const t = await socialTemplatesRepository.getById(userId, id);
  if (!t) throw new Error('template_not_found');
  await socialTemplatesRepository.update(userId, id, fields, nowIso());
  return { ok: true };
}

export async function deleteTemplate(userId: string, id: string) {
  await socialTemplatesRepository.remove(userId, id);
  return { ok: true };
}

// ---- campaigns ------------------------------------------------------------ //

export async function setupCampaign(userId: string, opts: { template_id: string; title?: string }) {
  const tpl = await socialTemplatesRepository.getById(userId, opts.template_id);
  if (!tpl) throw new Error('template_not_found');
  const id = newId(); const now = nowIso();
  await socialCampaignsRepository.insert({
    id, user_id: userId, template_id: tpl.id,
    title: opts.title ?? `${tpl.title} — ${new Date().toISOString().slice(0, 10)}`,
    prompt: tpl.prompt, // frozen copy
    status: 'active', created_at: now, updated_at: now,
  });
  return { id, title: opts.title ?? tpl.title, prompt: tpl.prompt };
}

export async function listCampaigns(userId: string, filter: { status?: string; template_id?: string; from?: string; to?: string } = {}) {
  const rows = await socialCampaignsRepository.list(userId, filter);
  // attach a light post count per campaign (mirrors outreach's email_count)
  return Promise.all(rows.map(async (c) => {
    const posts = await socialPostsRepository.listByCampaign(userId, c.id);
    return {
      ...c,
      post_count: posts.length,
      posted_count: posts.filter((p) => p.status === 'posted').length,
    };
  }));
}

export async function getCampaign(userId: string, id: string) {
  const c = await socialCampaignsRepository.getById(userId, id);
  if (!c) return null;
  return c;
}

// ---- posts (unified author + reply) -------------------------------------- //

export async function addPost(userId: string, opts: {
  campaign_id: string; platform: string; kind: string;
  content?: string; content_format?: string;
  target_url?: string; target_kind?: string; target_title?: string; target_author?: string;
  notes?: string;
}) {
  const campaign = await socialCampaignsRepository.getById(userId, opts.campaign_id);
  if (!campaign) throw new Error('campaign_not_found');
  const id = newId(); const now = nowIso();
  await socialPostsRepository.insert({
    id, user_id: userId, campaign_id: opts.campaign_id,
    platform: opts.platform, kind: opts.kind, status: 'draft',
    content: opts.content ?? null, content_format: opts.content_format ?? 'text',
    target_url: opts.target_url ?? null, target_kind: opts.target_kind ?? null,
    target_title: opts.target_title ?? null, target_author: opts.target_author ?? null,
    notes: opts.notes ?? null, rejection_reason: null, posted_at: null,
    created_at: now, updated_at: now,
  });
  return { id };
}

export async function listPosts(userId: string, campaignId: string, filter: { status?: string; platform?: string; kind?: string } = {}) {
  const posts = await socialPostsRepository.listByCampaign(userId, campaignId, filter);
  return posts.map((p) => ({
    ...p,
    // expose the JSON-list fields parsed (queries/scopes/keywords live on
    // search targets, not posts, but keep the parse helper available for notes)
  }));
}

export async function getPost(userId: string, id: string) {
  return socialPostsRepository.getById(userId, id);
}

const POST_EDITABLE = new Set([
  'content', 'content_format', 'status', 'posted_at', 'notes', 'rejection_reason',
]);

export async function updatePost(userId: string, id: string, patch: Record<string, unknown>) {
  const p = await socialPostsRepository.getById(userId, id);
  if (!p) throw new Error('post_not_found');
  const fields: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(patch)) {
    if (POST_EDITABLE.has(k)) fields[k] = v;
  }
  // setting status -> posted stamps posted_at if not supplied
  if (fields.status === 'posted' && !fields.posted_at) fields.posted_at = nowIso();
  // setting a rejection_reason captures the why on the post itself
  fields.updated_at = nowIso();
  await socialPostsRepository.updateFields(userId, id, fields);
  return { ok: true };
}

/** Delete/reject a post. If a reason is supplied it is recorded as feedback
 * (kind='rejection', linked to the post) BEFORE the post is removed, so the
 * agent can learn from the rejection on the next run. */
export async function deletePost(userId: string, id: string, reason?: string) {
  const p = await socialPostsRepository.getById(userId, id);
  if (!p) return { ok: true }; // idempotent
  if (reason) {
    const fid = newId();
    await socialFeedbackRepository.insert({
      id: fid, user_id: userId, campaign_id: p.campaign_id, post_id: id,
      kind: 'rejection', reason, note: null, created_at: nowIso(),
    });
  }
  await socialPostsRepository.remove(userId, id);
  return { ok: true };
}

// ---- search targets (structured search specs the harness runs) ----------- //

export async function addSearchTarget(userId: string, opts: {
  campaign_id: string; platform: string; search_type: string;
  queries?: unknown; scopes?: unknown; recency?: string;
  keywords?: unknown; max_results?: number;
}) {
  const campaign = await socialCampaignsRepository.getById(userId, opts.campaign_id);
  if (!campaign) throw new Error('campaign_not_found');
  const id = newId(); const now = nowIso();
  await socialSearchTargetsRepository.insert({
    id, user_id: userId, campaign_id: opts.campaign_id,
    platform: opts.platform, search_type: opts.search_type,
    queries: str(opts.queries), scopes: str(opts.scopes),
    recency: opts.recency ?? '7d', keywords: str(opts.keywords),
    max_results: opts.max_results ?? 15, status: 'open', result_count: null,
    created_at: now, updated_at: now,
  });
  return { id };
}

export async function listSearchTargets(userId: string, campaignId: string, platform?: string, status?: string) {
  const rows = await socialSearchTargetsRepository.listByCampaign(userId, campaignId, platform, status);
  return rows.map((r) => ({
    ...r,
    queries: parse(r.queries), scopes: parse(r.scopes), keywords: parse(r.keywords),
  }));
}

export async function updateSearchTarget(userId: string, id: string, patch: Record<string, unknown>) {
  const t = await socialSearchTargetsRepository.getById(userId, id);
  if (!t) throw new Error('search_target_not_found');
  const fields: Record<string, unknown> = {};
  for (const k of ['status', 'result_count']) {
    if (patch[k] !== undefined) fields[k] = patch[k];
  }
  fields.updated_at = nowIso();
  await socialSearchTargetsRepository.updateFields(userId, id, fields);
  return { ok: true };
}

export async function deleteSearchTarget(userId: string, id: string) {
  await socialSearchTargetsRepository.remove(userId, id);
  return { ok: true };
}

// ---- feedback (rejections + notes; the agent reads before each run) ------ //

export async function addFeedback(userId: string, opts: {
  campaign_id: string; kind: string; reason?: string; note?: string; post_id?: string;
}) {
  const id = newId();
  await socialFeedbackRepository.insert({
    id, user_id: userId, campaign_id: opts.campaign_id, post_id: opts.post_id ?? null,
    kind: opts.kind, reason: opts.reason ?? null, note: opts.note ?? null, created_at: nowIso(),
  });
  return { id };
}

export async function listFeedback(userId: string, campaignId?: string, kind?: string) {
  return socialFeedbackRepository.list(userId, campaignId, kind);
}

export async function deleteFeedback(userId: string, id: string) {
  await socialFeedbackRepository.remove(userId, id);
  return { ok: true };
}

// ---- template-change proposals (propose -> approve -> apply) ------------- //

export async function proposeTemplateChange(userId: string, opts: {
  template_id: string; change_kind: string; rationale?: string;
  proposed_patch?: string; source_feedback_ids?: unknown;
}) {
  const tpl = await socialTemplatesRepository.getById(userId, opts.template_id);
  if (!tpl) throw new Error('template_not_found');
  const id = newId(); const now = nowIso();
  await socialTemplateChangesRepository.insert({
    id, user_id: userId, template_id: opts.template_id, change_kind: opts.change_kind,
    rationale: opts.rationale ?? null, proposed_patch: opts.proposed_patch ?? null,
    source_feedback_ids: str(opts.source_feedback_ids), status: 'proposed',
    decision_note: null, created_at: now, updated_at: now,
  });
  return { id };
}

export async function listTemplateChanges(userId: string, templateId?: string, status?: string) {
  const rows = await socialTemplateChangesRepository.list(userId, templateId, status);
  return rows.map((r) => ({ ...r, source_feedback_ids: parse(r.source_feedback_ids) }));
}

export async function updateTemplateChange(userId: string, id: string, opts: { status: string; decision_note?: string }) {
  const c = await socialTemplateChangesRepository.getById(userId, id);
  if (!c) throw new Error('change_not_found');
  if (!['approved', 'rejected'].includes(opts.status)) throw new Error('invalid_status');
  await socialTemplateChangesRepository.updateFields(userId, id, {
    status: opts.status, decision_note: opts.decision_note ?? null,
  }, nowIso());
  return { ok: true };
}

/** Apply an APPROVED proposal to its template. Only `change_kind: 'append'`
 * and `'add_rule'` append `proposed_patch` to the template prompt; `'replace'`
 * replaces the whole prompt with `proposed_patch`. Marks the proposal
 * 'applied'. Throws if the proposal isn't approved. */
export async function applyTemplateChange(userId: string, id: string) {
  const c = await socialTemplateChangesRepository.getById(userId, id);
  if (!c) throw new Error('change_not_found');
  if (c.status !== 'approved') throw new Error('not_approved');
  const tpl = await socialTemplatesRepository.getById(userId, c.template_id);
  if (!tpl) throw new Error('template_not_found');
  const patch = c.proposed_patch ?? '';
  let nextPrompt: string;
  if (c.change_kind === 'replace') {
    nextPrompt = patch;
  } else {
    // append / add_rule — append as a new line/block to the existing prompt
    const sep = tpl.prompt && !tpl.prompt.endsWith('\n') ? '\n\n' : '';
    nextPrompt = `${tpl.prompt}${sep}${patch}`;
  }
  await socialTemplatesRepository.update(userId, c.template_id, { prompt: nextPrompt }, nowIso());
  await socialTemplateChangesRepository.updateFields(userId, id, { status: 'applied' }, nowIso());
  const updated = await socialTemplatesRepository.getById(userId, c.template_id);
  return { ok: true, template: updated };
}
