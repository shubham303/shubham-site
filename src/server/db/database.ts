// DB facade — the ONLY code that knows a concrete driver. Use `?` placeholders
// everywhere; the Postgres impl rewrites them to `$1,$2,...`. DuckDB for local
// dev, Postgres/Neon in production (chosen by the factory from env).

export interface Database {
  execute(sql: string, params?: unknown[]): Promise<any[]>;
  close(): Promise<void>;
}

const isRead = (sql: string): boolean =>
  /^\s*(select|with)/i.test(sql) || /returning/i.test(sql);

export class DuckDBDatabase implements Database {
  private conP: Promise<any> | null = null;

  constructor(private path: string) {}

  private con(): Promise<any> {
    if (!this.conP) {
      this.conP = (async () => {
        const { DuckDBInstance } = await import('@duckdb/node-api');
        const instance = await DuckDBInstance.create(this.path);
        return instance.connect();
      })();
    }
    return this.conP;
  }

  async execute(sql: string, params: unknown[] = []): Promise<any[]> {
    const con = await this.con();
    if (isRead(sql)) {
      const reader = await con.runAndReadAll(sql, params);
      return reader.getRowObjects();
    }
    await con.run(sql, params);
    return [];
  }

  async close(): Promise<void> {
    /* keep the process-lifetime connection open */
  }
}

export class PostgresDatabase implements Database {
  private sql: any;

  constructor(url: string) {
    // lazy require so the local/DuckDB path never loads it
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const postgres = require('postgres');
    this.sql = postgres(url, { max: 5 });
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
