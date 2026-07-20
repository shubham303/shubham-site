import type { Database } from '../db/database';

export interface TemplateRow {
  id: string;
  user_id: string;
  title: string;
  prompt: string;
  status: string; // active | inactive
  created_at: string;
  updated_at: string;
}

const COLS = 'id, user_id, title, prompt, status, created_at, updated_at';

export interface TemplateFilter { status?: string; from?: string; to?: string }

export class OutreachTemplatesRepository {
  constructor(private db: Database) {}

  async createTable(): Promise<void> {
    await this.db.execute(
      `create table if not exists outreach_templates (
        id varchar primary key,
        user_id varchar not null,
        title varchar not null,
        prompt varchar not null,
        status varchar not null,
        created_at varchar not null,
        updated_at varchar not null
      )`,
    );
  }

  async insert(r: TemplateRow): Promise<void> {
    await this.db.execute(
      `insert into outreach_templates (${COLS}) values (?, ?, ?, ?, ?, ?, ?)`,
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
      `select ${COLS} from outreach_templates where ${where.join(' and ')} order by created_at desc`,
      params,
    )) as TemplateRow[];
  }

  async getById(userId: string, id: string): Promise<TemplateRow | null> {
    const rows = await this.db.execute(
      `select ${COLS} from outreach_templates where user_id = ? and id = ?`, [userId, id]);
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
