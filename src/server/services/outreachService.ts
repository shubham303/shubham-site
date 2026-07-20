import { getProvider } from '../db/factory';
import { newId, nowIso } from '../lib/ids';
import type { ProspectRow, ProspectStatus } from '../repositories/prospects';

// ---- prompts --------------------------------------------------------------- #

export async function createPrompt(userId: string, name: string, body: string) {
  const id = newId();
  const now = nowIso();
  await getProvider().outreachPrompts.insert({
    id, user_id: userId, name, body, created_at: now, updated_at: now,
  });
  return { id, name };
}

export async function listPrompts(userId: string) {
  const rows = await getProvider().outreachPrompts.listByUser(userId);
  return rows.map((p) => ({
    id: p.id, name: p.name, body: p.body,
    created_at: p.created_at, updated_at: p.updated_at,
  }));
}

export async function updatePrompt(userId: string, id: string, name: string, body: string) {
  const p = getProvider();
  const existing = await p.outreachPrompts.getById(userId, id);
  if (!existing) throw new Error('prompt_not_found');
  await p.outreachPrompts.update(userId, id, name, body, nowIso());
  return { id, name };
}

export async function deletePrompt(userId: string, id: string) {
  await getProvider().outreachPrompts.remove(userId, id);
  return { ok: true };
}

// ---- prospects ------------------------------------------------------------- #

export interface ProspectInput {
  name?: string | null;
  email?: string | null;
  company?: string | null;
  research?: string | null;
  draft_subject?: string | null;
  draft_body?: string | null;
  prompt_id?: string | null;
  status?: ProspectStatus;
}

export async function createProspect(userId: string, input: ProspectInput) {
  const id = newId();
  const now = nowIso();
  const status: ProspectStatus =
    input.status ?? (input.draft_body ? 'drafted' : 'new');
  await getProvider().prospects.insert({
    id,
    user_id: userId,
    prompt_id: input.prompt_id ?? null,
    name: input.name ?? null,
    email: input.email ?? null,
    company: input.company ?? null,
    research: input.research ?? null,
    draft_subject: input.draft_subject ?? null,
    draft_body: input.draft_body ?? null,
    status,
    reply_text: null,
    sent_at: null,
    created_at: now,
    updated_at: now,
  });
  return { id, status };
}

export async function listProspects(userId: string, status?: string) {
  const rows = await getProvider().prospects.listByUser(userId, status);
  return rows.map((r) => ({
    id: r.id, name: r.name, email: r.email, company: r.company,
    status: r.status, prompt_id: r.prompt_id, sent_at: r.sent_at,
    created_at: r.created_at, updated_at: r.updated_at,
  }));
}

export async function getProspect(userId: string, id: string) {
  const r = await getProvider().prospects.getById(userId, id);
  if (!r) return null;
  return { ...r, verified: undefined };
}

const EDITABLE = new Set([
  'name', 'email', 'company', 'research', 'draft_subject', 'draft_body',
  'status', 'reply_text', 'prompt_id',
]);

export async function updateProspect(userId: string, id: string, patch: Record<string, unknown>) {
  const p = getProvider();
  const existing = await p.prospects.getById(userId, id);
  if (!existing) throw new Error('prospect_not_found');
  const fields: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(patch)) {
    if (EDITABLE.has(k)) fields[k] = v;
  }
  fields.updated_at = nowIso();
  await p.prospects.updateFields(userId, id, fields as Partial<ProspectRow>);
  return { ok: true };
}

export async function deleteProspect(userId: string, id: string) {
  await getProvider().prospects.remove(userId, id);
  return { ok: true };
}
