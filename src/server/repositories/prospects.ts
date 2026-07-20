import type { Database } from '../db/database';

// A prospective client found by the agent for a campaign. details/email_ids are
// JSON stored as text (facade works on DuckDB + Postgres identically).
export interface ProspectRow {
  id: string;
  user_id: string;
  campaign_id: string;
  details: string | null;   // JSON: company metadata
  email_ids: string | null; // JSON: [{name, email}]
  created_at: string;
  updated_at: string;
}

const COLS = 'id, user_id, campaign_id, details, email_ids, created_at, updated_at';

export class ProspectsRepository {
  constructor(private db: Database) {}

  async createTable(): Promise<void> {
    await this.db.execute(
      `create table if not exists prospects (
        id varchar primary key,
        user_id varchar not null,
        campaign_id varchar not null,
        details varchar,
        email_ids varchar,
        created_at varchar not null,
        updated_at varchar not null
      )`,
    );
  }

  async insert(r: ProspectRow): Promise<void> {
    await this.db.execute(
      `insert into prospects (${COLS}) values (?, ?, ?, ?, ?, ?, ?)`,
      [r.id, r.user_id, r.campaign_id, r.details, r.email_ids, r.created_at, r.updated_at],
    );
  }

  async listByCampaign(userId: string, campaignId: string): Promise<ProspectRow[]> {
    return (await this.db.execute(
      `select ${COLS} from prospects where user_id = ? and campaign_id = ? order by created_at asc`,
      [userId, campaignId])) as ProspectRow[];
  }

  async getById(userId: string, id: string): Promise<ProspectRow | null> {
    const rows = await this.db.execute(
      `select ${COLS} from prospects where user_id = ? and id = ?`, [userId, id]);
    return (rows[0] as ProspectRow) ?? null;
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.db.execute('delete from prospects where user_id = ? and id = ?', [userId, id]);
  }
}
