import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import type { Database } from './database';
import { DuckDBDatabase, PostgresDatabase } from './database';
import { UsersRepository } from '../repositories/users';
import { ApiKeysRepository } from '../repositories/apiKeys';
import { SubscriptionsRepository } from '../repositories/subscriptions';
import { FoldersRepository } from '../repositories/folders';
import { ReportsRepository } from '../repositories/reports';
import { OutreachPromptsRepository } from '../repositories/outreachPrompts';
import { ProspectsRepository } from '../repositories/prospects';
import { EmailAccountsRepository } from '../repositories/emailAccounts';

let db: Database | null = null;

function createDatabase(): Database {
  const url = process.env.DATABASE_URL?.trim();
  if (url && /^postgres/i.test(url)) return new PostgresDatabase(url);
  const path = process.env.TABINT_CONTROL_DB?.trim() || './.data/control.duckdb';
  try {
    mkdirSync(dirname(path), { recursive: true });
  } catch {
    /* ignore */
  }
  return new DuckDBDatabase(path);
}

/** Facade over the repositories; services take this and stay DB-agnostic. */
export class RepositoryProvider {
  constructor(private database: Database) {}
  get users() {
    return new UsersRepository(this.database);
  }
  get apiKeys() {
    return new ApiKeysRepository(this.database);
  }
  get subscriptions() {
    return new SubscriptionsRepository(this.database);
  }
  get folders() {
    return new FoldersRepository(this.database);
  }
  get reports() {
    return new ReportsRepository(this.database);
  }
  get outreachPrompts() {
    return new OutreachPromptsRepository(this.database);
  }
  get prospects() {
    return new ProspectsRepository(this.database);
  }
  get emailAccounts() {
    return new EmailAccountsRepository(this.database);
  }
}

let provider: RepositoryProvider | null = null;

export function getProvider(): RepositoryProvider {
  if (!db) db = createDatabase();
  if (!provider) provider = new RepositoryProvider(db);
  return provider;
}

let initialized: Promise<void> | null = null;

/** Create all tables once per process. Endpoints await this first. */
export function ensureInit(): Promise<void> {
  if (!initialized) {
    initialized = (async () => {
      const p = getProvider();
      await p.users.createTable();
      await p.apiKeys.createTable();
      await p.subscriptions.createTable();
      await p.folders.createTable();
      await p.reports.createTable();
      await p.outreachPrompts.createTable();
      await p.prospects.createTable();
      await p.emailAccounts.createTable();
    })();
  }
  return initialized;
}
