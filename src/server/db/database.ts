// DB facade. The app talks to one Postgres database (Neon) via DATABASE_URL,
// for both local dev and production. Use `?` placeholders everywhere; they're
// rewritten to `$1,$2,...` for Postgres.

import postgres from 'postgres';

export interface Database {
  execute(sql: string, params?: unknown[]): Promise<any[]>;
  close(): Promise<void>;
}

export class PostgresDatabase implements Database {
  private sql: any;

  constructor(url: string) {
    // Neon requires SSL; `prepare: false` is needed for pooled
    // (pgBouncer transaction-mode) connections used on serverless.
    this.sql = postgres(url, { max: 5, prepare: false, ssl: 'require' });
  }

  async execute(sql: string, params: unknown[] = []): Promise<any[]> {
    let i = 0;
    const query = sql.replace(/\?/g, () => `$${++i}`);
    const rows = await this.sql.unsafe(query, params);
    return rows as any[];
  }

  async close(): Promise<void> {
    await this.sql.end({ timeout: 5 });
  }
}
