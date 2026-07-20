import type { Database } from '../db/database';

export interface CampaignRow {
  id: string;
  user_id: string;
  template_id: string | null;
  title: string | null;
  prompt: string; // copied from template at creation (frozen)
  status: string; // active | archived
  created_at: string;
  updated_at: string;
}

const COLS = 'id, user_id, template_id, title, prompt, status, created_at, updated_at';

export interface CampaignFilter { status?: string; template_id?: string; from?: string; to?: string }

export class CampaignsRepository {
  constructor(private db: Database) {}

  async createTable(): Promise<void> {
    await this.db.execute(
      `create table if not exists campaigns (
        id varchar primary key,
        user_id varchar not null,
        template_id varchar,
        title varchar,
        prompt varchar not null,
        status varchar not null,
        created_at varchar not null,
        updated_at varchar not null
      )`,
    );
  }

  async insert(r: CampaignRow): Promise<void> {
    await this.db.execute(
      `insert into campaigns (${COLS}) values (?, ?, ?, ?, ?, ?, ?, ?)`,
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
      `select ${COLS} from campaigns where ${where.join(' and ')} order by created_at desc`, params)) as CampaignRow[];
  }

  async getById(userId: string, id: string): Promise<CampaignRow | null> {
    const rows = await this.db.execute(
      `select ${COLS} from campaigns where user_id = ? and id = ?`, [userId, id]);
    return (rows[0] as CampaignRow) ?? null;
  }

  async setStatus(userId: string, id: string, status: string, updatedAt: string): Promise<void> {
    await this.db.execute(
      'update campaigns set status = ?, updated_at = ? where user_id = ? and id = ?', [status, updatedAt, userId, id]);
  }
}
