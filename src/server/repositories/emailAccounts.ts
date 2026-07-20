import type { Database } from '../db/database';

// BYO sending credentials (the user's own Resend key). One per user. Stored as
// plaintext in this version (encryption deferred); never returned to the
// browser after save — only the send path reads api_key server-side.
export interface EmailAccountRow {
  id: string;
  user_id: string;
  provider: string;
  api_key: string | null;
  from_email: string;
  from_name: string | null;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

const COLS =
  'id, user_id, provider, api_key, from_email, from_name, verified, created_at, updated_at';
// public view: everything EXCEPT the secret api_key
const SAFE_COLS = 'id, user_id, provider, from_email, from_name, verified, created_at, updated_at';

export class EmailAccountsRepository {
  constructor(private db: Database) {}

  async createTable(): Promise<void> {
    await this.db.execute(
      `create table if not exists email_accounts (
        id varchar primary key,
        user_id varchar not null,
        provider varchar not null,
        api_key varchar,
        from_email varchar not null,
        from_name varchar,
        verified boolean not null,
        created_at varchar not null,
        updated_at varchar not null
      )`,
    );
  }

  /** The account minus the secret — safe to serialise to the client. */
  async getSafeByUser(userId: string): Promise<Omit<EmailAccountRow, 'api_key'> | null> {
    const rows = await this.db.execute(
      `select ${SAFE_COLS} from email_accounts where user_id = ?`,
      [userId],
    );
    return (rows[0] as Omit<EmailAccountRow, 'api_key'>) ?? null;
  }

  /** Full row incl. api_key — server-side send path only, never serialise. */
  async getByUser(userId: string): Promise<EmailAccountRow | null> {
    const rows = await this.db.execute(
      `select ${COLS} from email_accounts where user_id = ?`,
      [userId],
    );
    return (rows[0] as EmailAccountRow) ?? null;
  }

  async upsert(r: EmailAccountRow): Promise<void> {
    const existing = await this.getByUser(r.user_id);
    if (existing) {
      await this.db.execute(
        `update email_accounts
           set provider = ?, api_key = ?, from_email = ?, from_name = ?, verified = ?, updated_at = ?
         where user_id = ?`,
        [r.provider, r.api_key, r.from_email, r.from_name, r.verified, r.updated_at, r.user_id],
      );
      return;
    }
    await this.db.execute(
      `insert into email_accounts (${COLS}) values (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [r.id, r.user_id, r.provider, r.api_key, r.from_email, r.from_name,
       r.verified, r.created_at, r.updated_at],
    );
  }
}
