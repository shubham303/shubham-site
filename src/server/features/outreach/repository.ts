// outreach repositories — five tables in one module. Each is pure table
// access; business logic (joining emails to prospects, status transitions)
// lives in ./service.ts.

import type { Database } from '../../db/database';
import { getDb } from '../../db';

// ---- shared row types ---------------------------------------------------- #

export interface TemplateRow {
  id: string; user_id: string; title: string; prompt: string;
  status: string; created_at: string; updated_at: string;
}
export interface CampaignRow {
  id: string; user_id: string; template_id: string | null; title: string | null;
  prompt: string; status: string; created_at: string; updated_at: string;
}
export interface ProspectRow {
  id: string; user_id: string; campaign_id: string;
  details: string | null; email_ids: string | null;
  created_at: string; updated_at: string;
}
export interface SentEmailRow {
  id: string; user_id: string; campaign_id: string; prospect_id: string | null;
  recipients: string | null; subject: string | null; body: string | null;
  status: string; sent_at: string | null; created_at: string; updated_at: string;
}
export interface ReceivedEmailRow {
  id: string; user_id: string; sender: string | null; subject: string | null;
  body: string | null; received_at: string | null; created_at: string;
}

export interface TemplateFilter { status?: string; from?: string; to?: string }
export interface CampaignFilter { status?: string; template_id?: string; from?: string; to?: string }
export interface EmailFilter { status?: string; from?: string; to?: string }

// ---- templates ------------------------------------------------------------ #

const TPL_COLS = 'id, user_id, title, prompt, status, created_at, updated_at';

export class OutreachTemplatesRepository {
  constructor(private db: Database = getDb()) {}

  async insert(r: TemplateRow): Promise<void> {
    await this.db.execute(
      `insert into outreach_templates (${TPL_COLS}) values (?, ?, ?, ?, ?, ?, ?)`,
      [r.id, r.user_id, r.title, r.prompt, r.status, r.created_at, r.updated_at],
    );
  }

  async list(userId: string, f: TemplateFilter = {}): Promise<TemplateRow[]> {
    const where = ['user_id = ?'];
    const params: unknown[] = [userId];
    if (f.status) { where.push('status = ?'); params.push(f.status); }
    if (f.from) { where.push('created_at >= ?'); params.push(f.from); }
    if (f.to) { where.push('created_at <= ?'); params.push(f.to); }
    return (await this.db.execute(
      `select ${TPL_COLS} from outreach_templates where ${where.join(' and ')} order by created_at desc`,
      params,
    )) as TemplateRow[];
  }

  async getById(userId: string, id: string): Promise<TemplateRow | null> {
    const rows = await this.db.execute(
      `select ${TPL_COLS} from outreach_templates where user_id = ? and id = ?`, [userId, id]);
    return (rows[0] as TemplateRow) ?? null;
  }

  async update(userId: string, id: string, fields: Partial<Pick<TemplateRow, 'title' | 'prompt' | 'status'>>, updatedAt: string): Promise<void> {
    const set: string[] = [];
    const params: unknown[] = [];
    for (const k of ['title', 'prompt', 'status'] as const) {
      if (fields[k] !== undefined) { set.push(`${k} = ?`); params.push(fields[k]); }
    }
    if (set.length === 0) return;
    set.push('updated_at = ?'); params.push(updatedAt);
    await this.db.execute(
      `update outreach_templates set ${set.join(', ')} where user_id = ? and id = ?`, [...params, userId, id]);
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.db.execute('delete from outreach_templates where user_id = ? and id = ?', [userId, id]);
  }
}

// ---- campaigns ------------------------------------------------------------ #

const CMP_COLS = 'id, user_id, template_id, title, prompt, status, created_at, updated_at';

export class CampaignsRepository {
  constructor(private db: Database = getDb()) {}

  async insert(r: CampaignRow): Promise<void> {
    await this.db.execute(
      `insert into campaigns (${CMP_COLS}) values (?, ?, ?, ?, ?, ?, ?, ?)`,
      [r.id, r.user_id, r.template_id, r.title, r.prompt, r.status, r.created_at, r.updated_at],
    );
  }

  async list(userId: string, f: CampaignFilter = {}): Promise<CampaignRow[]> {
    const where = ['user_id = ?'];
    const params: unknown[] = [userId];
    if (f.status) { where.push('status = ?'); params.push(f.status); }
    if (f.template_id) { where.push('template_id = ?'); params.push(f.template_id); }
    if (f.from) { where.push('created_at >= ?'); params.push(f.from); }
    if (f.to) { where.push('created_at <= ?'); params.push(f.to); }
    return (await this.db.execute(
      `select ${CMP_COLS} from campaigns where ${where.join(' and ')} order by created_at desc`, params)) as CampaignRow[];
  }

  async getById(userId: string, id: string): Promise<CampaignRow | null> {
    const rows = await this.db.execute(
      `select ${CMP_COLS} from campaigns where user_id = ? and id = ?`, [userId, id]);
    return (rows[0] as CampaignRow) ?? null;
  }

  async setStatus(userId: string, id: string, status: string, updatedAt: string): Promise<void> {
    await this.db.execute(
      'update campaigns set status = ?, updated_at = ? where user_id = ? and id = ?', [status, updatedAt, userId, id]);
  }
}

// ---- prospects ------------------------------------------------------------ #

const PROSPECT_COLS = 'id, user_id, campaign_id, details, email_ids, created_at, updated_at';

export class ProspectsRepository {
  constructor(private db: Database = getDb()) {}

  async insert(r: ProspectRow): Promise<void> {
    await this.db.execute(
      `insert into prospects (${PROSPECT_COLS}) values (?, ?, ?, ?, ?, ?, ?)`,
      [r.id, r.user_id, r.campaign_id, r.details, r.email_ids, r.created_at, r.updated_at],
    );
  }

  async listByCampaign(userId: string, campaignId: string): Promise<ProspectRow[]> {
    return (await this.db.execute(
      `select ${PROSPECT_COLS} from prospects where user_id = ? and campaign_id = ? order by created_at asc`,
      [userId, campaignId])) as ProspectRow[];
  }

  async getById(userId: string, id: string): Promise<ProspectRow | null> {
    const rows = await this.db.execute(
      `select ${PROSPECT_COLS} from prospects where user_id = ? and id = ?`, [userId, id]);
    return (rows[0] as ProspectRow) ?? null;
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.db.execute('delete from prospects where user_id = ? and id = ?', [userId, id]);
  }
}

// ---- sent emails ---------------------------------------------------------- #

const EMAIL_COLS = 'id, user_id, campaign_id, prospect_id, recipients, subject, body, status, sent_at, created_at, updated_at';

export class SentEmailsRepository {
  constructor(private db: Database = getDb()) {}

  async insert(r: SentEmailRow): Promise<void> {
    await this.db.execute(
      `insert into sent_emails (${EMAIL_COLS}) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [r.id, r.user_id, r.campaign_id, r.prospect_id, r.recipients, r.subject, r.body, r.status, r.sent_at, r.created_at, r.updated_at],
    );
  }

  async listByCampaign(userId: string, campaignId: string, f: EmailFilter = {}): Promise<SentEmailRow[]> {
    const where = ['user_id = ?', 'campaign_id = ?'];
    const params: unknown[] = [userId, campaignId];
    if (f.status) { where.push('status = ?'); params.push(f.status); }
    if (f.from) { where.push('created_at >= ?'); params.push(f.from); }
    if (f.to) { where.push('created_at <= ?'); params.push(f.to); }
    return (await this.db.execute(
      `select ${EMAIL_COLS} from sent_emails where ${where.join(' and ')} order by created_at asc`, params)) as SentEmailRow[];
  }

  async getById(userId: string, id: string): Promise<SentEmailRow | null> {
    const rows = await this.db.execute(
      `select ${EMAIL_COLS} from sent_emails where user_id = ? and id = ?`, [userId, id]);
    return (rows[0] as SentEmailRow) ?? null;
  }

  async updateFields(userId: string, id: string, fields: Partial<Omit<SentEmailRow, 'id' | 'user_id' | 'campaign_id' | 'created_at'>>): Promise<void> {
    const keys = Object.keys(fields);
    if (keys.length === 0) return;
    const set = keys.map((k) => `${k} = ?`).join(', ');
    const values = keys.map((k) => (fields as Record<string, unknown>)[k]);
    await this.db.execute(`update sent_emails set ${set} where user_id = ? and id = ?`, [...values, userId, id]);
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.db.execute('delete from sent_emails where user_id = ? and id = ?', [userId, id]);
  }
}

// ---- received emails ------------------------------------------------------ #

const RCVD_COLS = 'id, user_id, sender, subject, body, received_at, created_at';

export class ReceivedEmailsRepository {
  constructor(private db: Database = getDb()) {}

  async insert(r: ReceivedEmailRow): Promise<void> {
    await this.db.execute(
      `insert into received_emails (${RCVD_COLS}) values (?, ?, ?, ?, ?, ?, ?)`,
      [r.id, r.user_id, r.sender, r.subject, r.body, r.received_at, r.created_at],
    );
  }

  async listByUser(userId: string): Promise<ReceivedEmailRow[]> {
    return (await this.db.execute(
      `select ${RCVD_COLS} from received_emails where user_id = ? order by received_at desc, created_at desc`,
      [userId])) as ReceivedEmailRow[];
  }

  async getById(userId: string, id: string): Promise<ReceivedEmailRow | null> {
    const rows = await this.db.execute(`select ${RCVD_COLS} from received_emails where user_id = ? and id = ?`, [userId, id]);
    return (rows[0] as ReceivedEmailRow) ?? null;
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.db.execute('delete from received_emails where user_id = ? and id = ?', [userId, id]);
  }
}

// ---- shared singletons ---------------------------------------------------- #

export const templatesRepository = new OutreachTemplatesRepository();
export const campaignsRepository = new CampaignsRepository();
export const prospectsRepository = new ProspectsRepository();
export const sentEmailsRepository = new SentEmailsRepository();
export const receivedEmailsRepository = new ReceivedEmailsRepository();
