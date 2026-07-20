import type { Database } from '../db/database';

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
}

export class UsersRepository {
  constructor(private db: Database) {}

  async createTable(): Promise<void> {
    await this.db.execute(
      `create table if not exists users (
        id varchar primary key,
        email varchar unique not null,
        password_hash varchar not null,
        created_at varchar not null
      )`,
    );
  }

  async getByEmail(email: string): Promise<UserRow | null> {
    const rows = await this.db.execute(
      'select id, email, password_hash, created_at from users where email = ?',
      [email],
    );
    return (rows[0] as UserRow) ?? null;
  }

  async getById(id: string): Promise<UserRow | null> {
    const rows = await this.db.execute(
      'select id, email, password_hash, created_at from users where id = ?',
      [id],
    );
    return (rows[0] as UserRow) ?? null;
  }

  async insert(u: UserRow): Promise<void> {
    await this.db.execute(
      'insert into users (id, email, password_hash, created_at) values (?, ?, ?, ?)',
      [u.id, u.email, u.password_hash, u.created_at],
    );
  }
}
