import type { Database } from '../db/database';

// Received emails — global to the user (not campaign-specific in v1). The agent
// saves these now and then via CRUD; threading/linking is a future version.
export interface ReceivedEmailRow {
  id: string;
  user_id: string;
  sender: string | null;
  subject: string | null;
  body: string | null;
  received_at: string | null;
  created_at: string;
}

const COLS = 'id, user_id, sender, subject, body, received_at, created_at';

export class ReceivedEmailsRepository {
  constructor(private db: Database) {}

  async createTable(): Promise<void> {
    await this.db.execute(
      `create table if not exists received_emails (
        id varchar primary key,
        user_id varchar not null,
        sender varchar,
        subject varchar,
        body varchar,
        received_at varchar,
        created_at varchar not null
      )`,
    );
  }

  async insert(r: ReceivedEmailRow): Promise<void> {
    await this.db.execute(
      `insert into received_emails (${COLS}) values (?, ?, ?, ?, ?, ?, ?)`,
      [r.id, r.user_id, r.sender, r.subject, r.body, r.received_at, r.created_at],
    );
  }

  async listByUser(userId: string): Promise<ReceivedEmailRow[]> {
    return (await this.db.execute(
      `select ${COLS} from received_emails where user_id = ? order by received_at desc, created_at desc`,
      [userId])) as ReceivedEmailRow[];
  }

  async getById(userId: string, id: string): Promise<ReceivedEmailRow | null> {
    const rows = await this.db.execute(`select ${COLS} from received_emails where user_id = ? and id = ?`, [userId, id]);
    return (rows[0] as ReceivedEmailRow) ?? null;
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.db.execute('delete from received_emails where user_id = ? and id = ?', [userId, id]);
  }
}
