// outreach tables — templates, campaigns, prospects, sent_emails,
// received_emails. All user-scoped.

import type { Database } from '../../db/database';

export async function createTables(db: Database): Promise<void> {
  await db.execute(
    `create table if not exists outreach_templates (
      id varchar primary key,
      user_id varchar not null,
      title varchar not null,
      prompt varchar not null,
      status varchar not null,
      created_at varchar not null,
      updated_at varchar not null
    )`,
  );
  await db.execute(
    `create table if not exists campaigns (
      id varchar primary key,
      user_id varchar not null,
      template_id varchar,
      title varchar,
      prompt varchar not null,
      status varchar not null,
      created_at varchar not null,
      updated_at varchar not null
    )`,
  );
  await db.execute(
    `create table if not exists prospects (
      id varchar primary key,
      user_id varchar not null,
      campaign_id varchar not null,
      details varchar,
      email_ids varchar,
      created_at varchar not null,
      updated_at varchar not null
    )`,
  );
  await db.execute(
    `create table if not exists sent_emails (
      id varchar primary key,
      user_id varchar not null,
      campaign_id varchar not null,
      prospect_id varchar,
      recipients varchar,
      subject varchar,
      body varchar,
      status varchar not null,
      sent_at varchar,
      created_at varchar not null,
      updated_at varchar not null
    )`,
  );
  await db.execute(
    `create table if not exists received_emails (
      id varchar primary key,
      user_id varchar not null,
      sender varchar,
      subject varchar,
      body varchar,
      received_at varchar,
      created_at varchar not null
    )`,
  );
}
