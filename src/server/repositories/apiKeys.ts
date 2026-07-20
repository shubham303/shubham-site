import type { Database } from '../db/database';

export interface ApiKeyRow {
  id: string;
  user_id: string;
  name: string | null;
  key_hash: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
}

// Public view (never exposes the hash).
export interface ApiKeyPublic {
  id: string;
  name: string | null;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
}

export class ApiKeysRepository {
  constructor(private db: Database) {}

  async createTable(): Promise<void> {
    await this.db.execute(
      `create table if not exists api_keys (
        id varchar primary key,
        user_id varchar not null,
        name varchar,
        key_hash varchar unique not null,
        key_prefix varchar not null,
        created_at varchar not null,
        last_used_at varchar
      )`,
    );
  }

  async getByHash(keyHash: string): Promise<ApiKeyRow | null> {
    const rows = await this.db.execute(
      'select id, user_id, name, key_hash, key_prefix, created_at, last_used_at from api_keys where key_hash = ?',
      [keyHash],
    );
    return (rows[0] as ApiKeyRow) ?? null;
  }

  async listByUser(userId: string): Promise<ApiKeyPublic[]> {
    return (await this.db.execute(
      'select id, name, key_prefix, created_at, last_used_at from api_keys where user_id = ? order by created_at desc',
      [userId],
    )) as ApiKeyPublic[];
  }

  async countByUser(userId: string): Promise<number> {
    const rows = await this.db.execute('select count(*) as n from api_keys where user_id = ?', [userId]);
    return Number((rows[0] as { n: number })?.n ?? 0);
  }

  async insert(k: { id: string; user_id: string; name?: string | null; key_hash: string; key_prefix: string; created_at: string }): Promise<void> {
    await this.db.execute(
      'insert into api_keys (id, user_id, name, key_hash, key_prefix, created_at, last_used_at) values (?, ?, ?, ?, ?, ?, ?)',
      [k.id, k.user_id, k.name ?? null, k.key_hash, k.key_prefix, k.created_at, null],
    );
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.db.execute('delete from api_keys where user_id = ? and id = ?', [userId, id]);
  }
}
