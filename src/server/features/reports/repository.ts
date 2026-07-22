// folders + reports repositories. Pure table access; business logic (sharing,
// folder validation) lives in ./service.ts.

import type { Database } from '../../db/database';
import { getDb } from '../../db';

export interface FolderRow {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

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

const REPORT_COLS =
  'id, user_id, folder_id, title, content, format, metadata, share_token, created_at';
const REPORT_LIST_COLS = 'id, user_id, folder_id, title, format, share_token, created_at';

export class FoldersRepository {
  constructor(private db: Database = getDb()) {}

  async insert(f: FolderRow): Promise<void> {
    await this.db.execute(
      'insert into folders (id, user_id, name, created_at) values (?, ?, ?, ?)',
      [f.id, f.user_id, f.name, f.created_at],
    );
  }

  async listByUser(userId: string): Promise<FolderRow[]> {
    return (await this.db.execute(
      'select id, user_id, name, created_at from folders where user_id = ? order by created_at',
      [userId],
    )) as FolderRow[];
  }

  async getById(userId: string, id: string): Promise<FolderRow | null> {
    const rows = await this.db.execute(
      'select id, user_id, name, created_at from folders where user_id = ? and id = ?',
      [userId, id],
    );
    return (rows[0] as FolderRow) ?? null;
  }
}

export class ReportsRepository {
  constructor(private db: Database = getDb()) {}

  async insert(r: ReportRow): Promise<void> {
    await this.db.execute(
      `insert into reports (${REPORT_COLS}) values (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [r.id, r.user_id, r.folder_id, r.title, r.content, r.format, r.metadata,
       r.share_token, r.created_at],
    );
  }

  async listByUser(userId: string, folderId?: string | null): Promise<ReportRow[]> {
    if (folderId) {
      return (await this.db.execute(
        `select ${REPORT_LIST_COLS} from reports where user_id = ? and folder_id = ? order by created_at desc`,
        [userId, folderId],
      )) as ReportRow[];
    }
    return (await this.db.execute(
      `select ${REPORT_LIST_COLS} from reports where user_id = ? order by created_at desc`,
      [userId],
    )) as ReportRow[];
  }

  async getById(userId: string, id: string): Promise<ReportRow | null> {
    const rows = await this.db.execute(
      `select ${REPORT_COLS} from reports where user_id = ? and id = ?`,
      [userId, id],
    );
    return (rows[0] as ReportRow) ?? null;
  }

  async getByShareToken(token: string): Promise<ReportRow | null> {
    const rows = await this.db.execute(
      `select ${REPORT_COLS} from reports where share_token = ?`,
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

export const foldersRepository = new FoldersRepository();
export const reportsRepository = new ReportsRepository();
