import type { Database } from '../db/database';

// The drafted / sent email for a prospect in a campaign.
export interface SentEmailRow {
  id: string;
  user_id: string;
  campaign_id: string;
  prospect_id: string | null;
  recipients: string | null; // comma-separated or JSON text
  subject: string | null;
  body: string | null;
  status: string; // draft | sent | failed
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

const COLS = 'id, user_id, campaign_id, prospect_id, recipients, subject, body, status, sent_at, created_at, updated_at';

export interface EmailFilter { status?: string; from?: string; to?: string }

export class SentEmailsRepository {
  constructor(private db: Database) {}

  async createTable(): Promise<void> {
    await this.db.execute(
      `create table if not exists sent_emails (
        id varchar primary key,
        user_id varchar not null,
        campaign_id varchar not null,
        prospect_id varchar,
        recipients varchar,
        subject varchar,
        body varchar,
        status varchar not null,
        sent_at varchar,
        created_at varchar not null,
        updated_at varchar not null
      )`,
    );
  }

  async insert(r: SentEmailRow): Promise<void> {
    await this.db.execute(
      `insert into sent_emails (${COLS}) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      `select ${COLS} from sent_emails where ${where.join(' and ')} order by created_at asc`, params)) as SentEmailRow[];
  }

  async getById(userId: string, id: string): Promise<SentEmailRow | null> {
    const rows = await this.db.execute(
      `select ${COLS} from sent_emails where user_id = ? and id = ?`, [userId, id]);
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
