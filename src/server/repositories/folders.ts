import type { Database } from '../db/database';

export interface FolderRow {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export class FoldersRepository {
  constructor(private db: Database) {}

  async createTable(): Promise<void> {
    await this.db.execute(
      `create table if not exists folders (
        id varchar primary key,
        user_id varchar not null,
        name varchar not null,
        created_at varchar not null
      )`,
    );
  }

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
