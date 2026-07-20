import type { Database } from '../db/database';

export interface ApiKeyRow {
  id: string;
  user_id: string;
  key_hash: string;
  key_prefix: string;
  created_at: string;
}

export class ApiKeysRepository {
  constructor(private db: Database) {}

  async createTable(): Promise<void> {
    await this.db.execute(
      `create table if not exists api_keys (
        id varchar primary key,
        user_id varchar not null,
        key_hash varchar unique not null,
        key_prefix varchar not null,
        created_at varchar not null
      )`,
    );
  }

  async getByHash(keyHash: string): Promise<ApiKeyRow | null> {
    const rows = await this.db.execute(
      'select id, user_id, key_hash, key_prefix, created_at from api_keys where key_hash = ?',
      [keyHash],
    );
    return (rows[0] as ApiKeyRow) ?? null;
  }

  async listByUser(userId: string): Promise<ApiKeyRow[]> {
    return (await this.db.execute(
      'select id, user_id, key_hash, key_prefix, created_at from api_keys where user_id = ?',
      [userId],
    )) as ApiKeyRow[];
  }

  async insert(k: ApiKeyRow): Promise<void> {
    await this.db.execute(
      'insert into api_keys (id, user_id, key_hash, key_prefix, created_at) values (?, ?, ?, ?, ?)',
      [k.id, k.user_id, k.key_hash, k.key_prefix, k.created_at],
    );
  }
}
