import type { Database } from '../db/database';

// Editable outreach playbooks — the user can keep several (one per campaign
// style) and select which drives a given draft. The real IP the user owns.
export interface OutreachPromptRow {
  id: string;
  user_id: string;
  name: string;
  body: string;
  created_at: string;
  updated_at: string;
}

const COLS = 'id, user_id, name, body, created_at, updated_at';

export class OutreachPromptsRepository {
  constructor(private db: Database) {}

  async createTable(): Promise<void> {
    await this.db.execute(
      `create table if not exists outreach_prompts (
        id varchar primary key,
        user_id varchar not null,
        name varchar not null,
        body varchar not null,
        created_at varchar not null,
        updated_at varchar not null
      )`,
    );
  }

  async insert(r: OutreachPromptRow): Promise<void> {
    await this.db.execute(
      `insert into outreach_prompts (${COLS}) values (?, ?, ?, ?, ?, ?)`,
      [r.id, r.user_id, r.name, r.body, r.created_at, r.updated_at],
    );
  }

  async listByUser(userId: string): Promise<OutreachPromptRow[]> {
    return (await this.db.execute(
      `select ${COLS} from outreach_prompts where user_id = ? order by created_at desc`,
      [userId],
    )) as OutreachPromptRow[];
  }

  async getById(userId: string, id: string): Promise<OutreachPromptRow | null> {
    const rows = await this.db.execute(
      `select ${COLS} from outreach_prompts where user_id = ? and id = ?`,
      [userId, id],
    );
    return (rows[0] as OutreachPromptRow) ?? null;
  }

  async update(userId: string, id: string, name: string, body: string, updatedAt: string): Promise<void> {
    await this.db.execute(
      'update outreach_prompts set name = ?, body = ?, updated_at = ? where user_id = ? and id = ?',
      [name, body, updatedAt, userId, id],
    );
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.db.execute(
      'delete from outreach_prompts where user_id = ? and id = ?',
      [userId, id],
    );
  }
}
