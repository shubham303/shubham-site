// social repositories — six tables in one module. Pure table access; business
// logic (freezing the prompt, JSON parse/stringify, applying approved template
// changes) lives in ./service.ts. Mirrors outreach/repository.ts.

import type { Database } from '../../db/database';
import { getDb } from '../../db';

// ---- shared row types ---------------------------------------------------- //

export interface SocialTemplateRow {
  id: string; user_id: string; title: string; prompt: string;
  status: string; created_at: string; updated_at: string;
}
export interface SocialCampaignRow {
  id: string; user_id: string; template_id: string | null; title: string | null;
  prompt: string; status: string; created_at: string; updated_at: string;
}
export interface SocialPostRow {
  id: string; user_id: string; campaign_id: string; platform: string;
  kind: string; status: string; content: string | null; content_format: string | null;
  target_url: string | null; target_kind: string | null;
  target_title: string | null; target_author: string | null;
  notes: string | null; rejection_reason: string | null; posted_at: string | null;
  created_at: string; updated_at: string;
}
export interface SocialSearchTargetRow {
  id: string; user_id: string; campaign_id: string; platform: string;
  search_type: string; queries: string | null; scopes: string | null;
  recency: string | null; keywords: string | null; max_results: number | null;
  status: string; result_count: number | null;
  created_at: string; updated_at: string;
}
export interface SocialFeedbackRow {
  id: string; user_id: string; campaign_id: string; post_id: string | null;
  kind: string; reason: string | null; note: string | null; created_at: string;
}
export interface SocialTemplateChangeRow {
  id: string; user_id: string; template_id: string; change_kind: string;
  rationale: string | null; proposed_patch: string | null;
  source_feedback_ids: string | null; status: string; decision_note: string | null;
  created_at: string; updated_at: string;
}

export interface SocialTemplateFilter { status?: string; from?: string; to?: string }
export interface SocialCampaignFilter { status?: string; template_id?: string; from?: string; to?: string }
export interface SocialPostFilter { status?: string; platform?: string; kind?: string }

// ---- templates ------------------------------------------------------------ //

const TPL_COLS = 'id, user_id, title, prompt, status, created_at, updated_at';

export class SocialTemplatesRepository {
  constructor(private db: Database = getDb()) {}

  async insert(r: SocialTemplateRow): Promise<void> {
    await this.db.execute(
      `insert into social_templates (${TPL_COLS}) values (?, ?, ?, ?, ?, ?, ?)`,
      [r.id, r.user_id, r.title, r.prompt, r.status, r.created_at, r.updated_at],
    );
  }

  async list(userId: string, f: SocialTemplateFilter = {}): Promise<SocialTemplateRow[]> {
    const where = ['user_id = ?'];
    const params: unknown[] = [userId];
    if (f.status) { where.push('status = ?'); params.push(f.status); }
    if (f.from) { where.push('created_at >= ?'); params.push(f.from); }
    if (f.to) { where.push('created_at <= ?'); params.push(f.to); }
    return (await this.db.execute(
      `select ${TPL_COLS} from social_templates where ${where.join(' and ')} order by created_at desc`,
      params,
    )) as SocialTemplateRow[];
  }

  async getById(userId: string, id: string): Promise<SocialTemplateRow | null> {
    const rows = await this.db.execute(
      `select ${TPL_COLS} from social_templates where user_id = ? and id = ?`, [userId, id]);
    return (rows[0] as SocialTemplateRow) ?? null;
  }

  async update(userId: string, id: string, fields: Partial<Pick<SocialTemplateRow, 'title' | 'prompt' | 'status'>>, updatedAt: string): Promise<void> {
    const set: string[] = [];
    const params: unknown[] = [];
    for (const k of ['title', 'prompt', 'status'] as const) {
      if (fields[k] !== undefined) { set.push(`${k} = ?`); params.push(fields[k]); }
    }
    if (set.length === 0) return;
    set.push('updated_at = ?'); params.push(updatedAt);
    await this.db.execute(
      `update social_templates set ${set.join(', ')} where user_id = ? and id = ?`, [...params, userId, id]);
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.db.execute('delete from social_templates where user_id = ? and id = ?', [userId, id]);
  }
}

// ---- campaigns ------------------------------------------------------------ //

const CMP_COLS = 'id, user_id, template_id, title, prompt, status, created_at, updated_at';

export class SocialCampaignsRepository {
  constructor(private db: Database = getDb()) {}

  async insert(r: SocialCampaignRow): Promise<void> {
    await this.db.execute(
      `insert into social_campaigns (${CMP_COLS}) values (?, ?, ?, ?, ?, ?, ?, ?)`,
      [r.id, r.user_id, r.template_id, r.title, r.prompt, r.status, r.created_at, r.updated_at],
    );
  }

  async list(userId: string, f: SocialCampaignFilter = {}): Promise<SocialCampaignRow[]> {
    const where = ['user_id = ?'];
    const params: unknown[] = [userId];
    if (f.status) { where.push('status = ?'); params.push(f.status); }
    if (f.template_id) { where.push('template_id = ?'); params.push(f.template_id); }
    if (f.from) { where.push('created_at >= ?'); params.push(f.from); }
    if (f.to) { where.push('created_at <= ?'); params.push(f.to); }
    return (await this.db.execute(
      `select ${CMP_COLS} from social_campaigns where ${where.join(' and ')} order by created_at desc`, params)) as SocialCampaignRow[];
  }

  async getById(userId: string, id: string): Promise<SocialCampaignRow | null> {
    const rows = await this.db.execute(
      `select ${CMP_COLS} from social_campaigns where user_id = ? and id = ?`, [userId, id]);
    return (rows[0] as SocialCampaignRow) ?? null;
  }
}

// ---- posts (unified author + reply) -------------------------------------- //

const POST_COLS = [
  'id', 'user_id', 'campaign_id', 'platform', 'kind', 'status', 'content',
  'content_format', 'target_url', 'target_kind', 'target_title', 'target_author',
  'notes', 'rejection_reason', 'posted_at', 'created_at', 'updated_at',
].join(', ');

export class SocialPostsRepository {
  constructor(private db: Database = getDb()) {}

  async insert(r: SocialPostRow): Promise<void> {
    const ph = Array(17).fill('?').join(', ');
    await this.db.execute(
      `insert into social_posts (${POST_COLS}) values (${ph})`,
      [r.id, r.user_id, r.campaign_id, r.platform, r.kind, r.status, r.content,
       r.content_format, r.target_url, r.target_kind, r.target_title,
       r.target_author, r.notes, r.rejection_reason, r.posted_at,
       r.created_at, r.updated_at],
    );
  }

  async listByCampaign(userId: string, campaignId: string, f: SocialPostFilter = {}): Promise<SocialPostRow[]> {
    const where = ['user_id = ?', 'campaign_id = ?'];
    const params: unknown[] = [userId, campaignId];
    if (f.status) { where.push('status = ?'); params.push(f.status); }
    if (f.platform) { where.push('platform = ?'); params.push(f.platform); }
    if (f.kind) { where.push('kind = ?'); params.push(f.kind); }
    return (await this.db.execute(
      `select ${POST_COLS} from social_posts where ${where.join(' and ')} order by created_at asc`, params)) as SocialPostRow[];
  }

  async getById(userId: string, id: string): Promise<SocialPostRow | null> {
    const rows = await this.db.execute(
      `select ${POST_COLS} from social_posts where user_id = ? and id = ?`, [userId, id]);
    return (rows[0] as SocialPostRow) ?? null;
  }

  async updateFields(userId: string, id: string, fields: Partial<Omit<SocialPostRow, 'id' | 'user_id' | 'campaign_id' | 'platform' | 'kind' | 'created_at'>>): Promise<void> {
    const keys = Object.keys(fields);
    if (keys.length === 0) return;
    const set = keys.map((k) => `${k} = ?`).join(', ');
    const values = keys.map((k) => (fields as Record<string, unknown>)[k]);
    await this.db.execute(`update social_posts set ${set} where user_id = ? and id = ?`, [...values, userId, id]);
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.db.execute('delete from social_posts where user_id = ? and id = ?', [userId, id]);
  }
}

// ---- search targets ------------------------------------------------------ //

const ST_COLS = 'id, user_id, campaign_id, platform, search_type, queries, scopes, recency, keywords, max_results, status, result_count, created_at, updated_at';

export class SocialSearchTargetsRepository {
  constructor(private db: Database = getDb()) {}

  async insert(r: SocialSearchTargetRow): Promise<void> {
    await this.db.execute(
      `insert into social_search_targets (${ST_COLS}) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [r.id, r.user_id, r.campaign_id, r.platform, r.search_type, r.queries, r.scopes,
       r.recency, r.keywords, r.max_results, r.status, r.result_count, r.created_at, r.updated_at],
    );
  }

  async listByCampaign(userId: string, campaignId: string, platform?: string, status?: string): Promise<SocialSearchTargetRow[]> {
    const where = ['user_id = ?', 'campaign_id = ?'];
    const params: unknown[] = [userId, campaignId];
    if (platform) { where.push('platform = ?'); params.push(platform); }
    if (status) { where.push('status = ?'); params.push(status); }
    return (await this.db.execute(
      `select ${ST_COLS} from social_search_targets where ${where.join(' and ')} order by created_at asc`, params)) as SocialSearchTargetRow[];
  }

  async getById(userId: string, id: string): Promise<SocialSearchTargetRow | null> {
    const rows = await this.db.execute(
      `select ${ST_COLS} from social_search_targets where user_id = ? and id = ?`, [userId, id]);
    return (rows[0] as SocialSearchTargetRow) ?? null;
  }

  async updateFields(userId: string, id: string, fields: Partial<Omit<SocialSearchTargetRow, 'id' | 'user_id' | 'campaign_id' | 'platform' | 'search_type' | 'created_at'>>): Promise<void> {
    const keys = Object.keys(fields);
    if (keys.length === 0) return;
    const set = keys.map((k) => `${k} = ?`).join(', ');
    const values = keys.map((k) => (fields as Record<string, unknown>)[k]);
    await this.db.execute(`update social_search_targets set ${set} where user_id = ? and id = ?`, [...values, userId, id]);
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.db.execute('delete from social_search_targets where user_id = ? and id = ?', [userId, id]);
  }
}

// ---- feedback ------------------------------------------------------------ //

const FB_COLS = 'id, user_id, campaign_id, post_id, kind, reason, note, created_at';

export class SocialFeedbackRepository {
  constructor(private db: Database = getDb()) {}

  async insert(r: SocialFeedbackRow): Promise<void> {
    await this.db.execute(
      `insert into social_feedback (${FB_COLS}) values (?, ?, ?, ?, ?, ?, ?, ?)`,
      [r.id, r.user_id, r.campaign_id, r.post_id, r.kind, r.reason, r.note, r.created_at],
    );
  }

  async list(userId: string, campaignId?: string, kind?: string): Promise<SocialFeedbackRow[]> {
    const where = ['user_id = ?'];
    const params: unknown[] = [userId];
    if (campaignId) { where.push('campaign_id = ?'); params.push(campaignId); }
    if (kind) { where.push('kind = ?'); params.push(kind); }
    return (await this.db.execute(
      `select ${FB_COLS} from social_feedback where ${where.join(' and ')} order by created_at desc`, params)) as SocialFeedbackRow[];
  }

  async getById(userId: string, id: string): Promise<SocialFeedbackRow | null> {
    const rows = await this.db.execute(
      `select ${FB_COLS} from social_feedback where user_id = ? and id = ?`, [userId, id]);
    return (rows[0] as SocialFeedbackRow) ?? null;
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.db.execute('delete from social_feedback where user_id = ? and id = ?', [userId, id]);
  }
}

// ---- template-change proposals ------------------------------------------ //

const TC_COLS = 'id, user_id, template_id, change_kind, rationale, proposed_patch, source_feedback_ids, status, decision_note, created_at, updated_at';

export class SocialTemplateChangesRepository {
  constructor(private db: Database = getDb()) {}

  async insert(r: SocialTemplateChangeRow): Promise<void> {
    await this.db.execute(
      `insert into social_template_changes (${TC_COLS}) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [r.id, r.user_id, r.template_id, r.change_kind, r.rationale, r.proposed_patch,
       r.source_feedback_ids, r.status, r.decision_note, r.created_at, r.updated_at],
    );
  }

  async list(userId: string, templateId?: string, status?: string): Promise<SocialTemplateChangeRow[]> {
    const where = ['user_id = ?'];
    const params: unknown[] = [userId];
    if (templateId) { where.push('template_id = ?'); params.push(templateId); }
    if (status) { where.push('status = ?'); params.push(status); }
    return (await this.db.execute(
      `select ${TC_COLS} from social_template_changes where ${where.join(' and ')} order by created_at desc`, params)) as SocialTemplateChangeRow[];
  }

  async getById(userId: string, id: string): Promise<SocialTemplateChangeRow | null> {
    const rows = await this.db.execute(
      `select ${TC_COLS} from social_template_changes where user_id = ? and id = ?`, [userId, id]);
    return (rows[0] as SocialTemplateChangeRow) ?? null;
  }

  async updateFields(userId: string, id: string, fields: Partial<Pick<SocialTemplateChangeRow, 'status' | 'decision_note'>>, updatedAt: string): Promise<void> {
    const set: string[] = [];
    const params: unknown[] = [];
    for (const k of ['status', 'decision_note'] as const) {
      if (fields[k] !== undefined) { set.push(`${k} = ?`); params.push(fields[k]); }
    }
    if (set.length === 0) return;
    set.push('updated_at = ?'); params.push(updatedAt);
    await this.db.execute(`update social_template_changes set ${set.join(', ')} where user_id = ? and id = ?`, [...params, userId, id]);
  }
}

// ---- shared singletons --------------------------------------------------- //

export const socialTemplatesRepository = new SocialTemplatesRepository();
export const socialCampaignsRepository = new SocialCampaignsRepository();
export const socialPostsRepository = new SocialPostsRepository();
export const socialSearchTargetsRepository = new SocialSearchTargetsRepository();
export const socialFeedbackRepository = new SocialFeedbackRepository();
export const socialTemplateChangesRepository = new SocialTemplateChangesRepository();
