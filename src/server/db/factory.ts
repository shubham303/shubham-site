import type { Database } from './database';
import { PostgresDatabase } from './database';
import { UsersRepository } from '../repositories/users';
import { ApiKeysRepository } from '../repositories/apiKeys';
import { SubscriptionsRepository } from '../repositories/subscriptions';
import { FoldersRepository } from '../repositories/folders';
import { ReportsRepository } from '../repositories/reports';
import { OutreachTemplatesRepository } from '../repositories/outreachTemplates';
import { CampaignsRepository } from '../repositories/campaigns';
import { ProspectsRepository } from '../repositories/prospects';
import { SentEmailsRepository } from '../repositories/sentEmails';
import { ReceivedEmailsRepository } from '../repositories/receivedEmails';

let db: Database | null = null;

function createDatabase(): Database {
  const url = process.env.DATABASE_URL?.trim();
  if (!url || !/^postgres/i.test(url)) {
    throw new Error(
      'DATABASE_URL is not set (or is not a postgres:// URL). Set it to your ' +
      'Neon connection string in .env (local, dev branch) and in the Vercel project ' +
      '(prod, main branch). See NEON.md.',
    );
  }
  return new PostgresDatabase(url);
}

/** Facade over the repositories; services take this and stay DB-agnostic. */
export class RepositoryProvider {
  constructor(private database: Database) {}
  get users() { return new UsersRepository(this.database); }
  get apiKeys() { return new ApiKeysRepository(this.database); }
  get subscriptions() { return new SubscriptionsRepository(this.database); }
  get folders() { return new FoldersRepository(this.database); }
  get reports() { return new ReportsRepository(this.database); }
  get templates() { return new OutreachTemplatesRepository(this.database); }
  get campaigns() { return new CampaignsRepository(this.database); }
  get prospects() { return new ProspectsRepository(this.database); }
  get sentEmails() { return new SentEmailsRepository(this.database); }
  get receivedEmails() { return new ReceivedEmailsRepository(this.database); }
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
      await p.templates.createTable();
      await p.campaigns.createTable();
      await p.prospects.createTable();
      await p.sentEmails.createTable();
      await p.receivedEmails.createTable();
    })();
  }
  return initialized;
}
