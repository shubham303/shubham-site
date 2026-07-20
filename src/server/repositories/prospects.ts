import type { Database } from '../db/database';

// One row per outreach target: research, the drafted email, and send status.
// The agent (via the MCP) creates and drafts these; the user views/edits them
// in the dashboard; sending flips status to 'sent' and later 'replied' etc.
export type ProspectStatus =
  | 'new' | 'drafted' | 'sent' | 'delivered' | 'bounced' | 'replied' | 'skipped';

export interface ProspectRow {
  id: string;
  user_id: string;
  prompt_id: string | null;
  name: string | null;
  email: string | null;
  company: string | null;
  research: string | null;
  draft_subject: string | null;
  draft_body: string | null;
  status: ProspectStatus;
  reply_text: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

const COLS =
  'id, user_id, prompt_id, name, email, company, research, draft_subject, ' +
  'draft_body, status, reply_text, sent_at, created_at, updated_at';
const LIST_COLS =
  'id, user_id, prompt_id, name, email, company, status, sent_at, created_at, updated_at';

export class ProspectsRepository {
  constructor(private db: Database) {}

  async createTable(): Promise<void> {
    await this.db.execute(
      `create table if not exists prospects (
        id varchar primary key,
        user_id varchar not null,
        prompt_id varchar,
        name varchar,
        email varchar,
        company varchar,
        research varchar,
        draft_subject varchar,
        draft_body varchar,
        status varchar not null,
        reply_text varchar,
        sent_at varchar,
        created_at varchar not null,
        updated_at varchar not null
      )`,
    );
  }

  async insert(r: ProspectRow): Promise<void> {
    await this.db.execute(
      `insert into prospects (${COLS}) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [r.id, r.user_id, r.prompt_id, r.name, r.email, r.company, r.research,
       r.draft_subject, r.draft_body, r.status, r.reply_text, r.sent_at,
       r.created_at, r.updated_at],
    );
  }

  async listByUser(userId: string, status?: string): Promise<ProspectRow[]> {
    if (status) {
      return (await this.db.execute(
        `select ${LIST_COLS} from prospects where user_id = ? and status = ? order by created_at desc`,
        [userId, status],
      )) as ProspectRow[];
    }
    return (await this.db.execute(
      `select ${LIST_COLS} from prospects where user_id = ? order by created_at desc`,
      [userId],
    )) as ProspectRow[];
  }

  async getById(userId: string, id: string): Promise<ProspectRow | null> {
    const rows = await this.db.execute(
      `select ${COLS} from prospects where user_id = ? and id = ?`,
      [userId, id],
    );
    return (rows[0] as ProspectRow) ?? null;
  }

  /** Partial update from a whitelist of columns; caller passes only real columns. */
  async updateFields(
    userId: string,
    id: string,
    fields: Partial<Omit<ProspectRow, 'id' | 'user_id' | 'created_at'>>,
  ): Promise<void> {
    const keys = Object.keys(fields);
    if (keys.length === 0) return;
    const set = keys.map((k) => `${k} = ?`).join(', ');
    const values = keys.map((k) => (fields as Record<string, unknown>)[k]);
    await this.db.execute(
      `update prospects set ${set} where user_id = ? and id = ?`,
      [...values, userId, id],
    );
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.db.execute('delete from prospects where user_id = ? and id = ?', [userId, id]);
  }
}
