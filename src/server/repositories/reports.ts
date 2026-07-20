import type { Database } from '../db/database';

export interface ReportRow {
  id: string;
  user_id: string;
  folder_id: string | null;
  title: string;
  content: string;
  format: string;
  metadata: string | null;
  share_token: string | null;
  created_at: string;
}

const COLS =
  'id, user_id, folder_id, title, content, format, metadata, share_token, created_at';
const LIST_COLS = 'id, user_id, folder_id, title, format, share_token, created_at';

export class ReportsRepository {
  constructor(private db: Database) {}

  async createTable(): Promise<void> {
    await this.db.execute(
      `create table if not exists reports (
        id varchar primary key,
        user_id varchar not null,
        folder_id varchar,
        title varchar not null,
        content varchar not null,
        format varchar not null,
        metadata varchar,
        share_token varchar,
        created_at varchar not null
      )`,
    );
  }

  async insert(r: ReportRow): Promise<void> {
    await this.db.execute(
      `insert into reports (${COLS}) values (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [r.id, r.user_id, r.folder_id, r.title, r.content, r.format, r.metadata,
       r.share_token, r.created_at],
    );
  }

  async listByUser(userId: string, folderId?: string | null): Promise<ReportRow[]> {
    if (folderId) {
      return (await this.db.execute(
        `select ${LIST_COLS} from reports where user_id = ? and folder_id = ? order by created_at desc`,
        [userId, folderId],
      )) as ReportRow[];
    }
    return (await this.db.execute(
      `select ${LIST_COLS} from reports where user_id = ? order by created_at desc`,
      [userId],
    )) as ReportRow[];
  }

  async getById(userId: string, id: string): Promise<ReportRow | null> {
    const rows = await this.db.execute(
      `select ${COLS} from reports where user_id = ? and id = ?`,
      [userId, id],
    );
    return (rows[0] as ReportRow) ?? null;
  }

  async getByShareToken(token: string): Promise<ReportRow | null> {
    const rows = await this.db.execute(
      `select ${COLS} from reports where share_token = ?`,
      [token],
    );
    return (rows[0] as ReportRow) ?? null;
  }

  async setShareToken(userId: string, id: string, token: string | null): Promise<void> {
    await this.db.execute(
      'update reports set share_token = ? where user_id = ? and id = ?',
      [token, userId, id],
    );
  }
}
