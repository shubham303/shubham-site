// folders + reports tables. User-scoped artifacts saved from the analytics
// MCP server.

import type { Database } from '../../db/database';

export async function createTables(db: Database): Promise<void> {
  await db.execute(
    `create table if not exists folders (
      id varchar primary key,
      user_id varchar not null,
      name varchar not null,
      created_at varchar not null
    )`,
  );
  await db.execute(
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
