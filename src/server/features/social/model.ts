// social tables — templates, campaigns, posts, search_targets, feedback,
// template_changes. Mirrors the outreach feature slice. All user-scoped.
//
// The `social_posts` table is unified across AUTHOR (original content to
// publish) and REPLY (a response to an existing post/thread/article): `kind`
// distinguishes them, and reply posts carry the target_* columns. This
// single-table model keeps the dashboard list simple (filter by kind+platform)
// and powers RULE A dedup (the agent lists prior author posts before drafting).

import type { Database } from '../../db/database';

export async function createTables(db: Database): Promise<void> {
  await db.execute(
    `create table if not exists social_templates (
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
    `create table if not exists social_campaigns (
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
    `create table if not exists social_posts (
      id varchar primary key,
      user_id varchar not null,
      campaign_id varchar not null,
      platform varchar not null,
      kind varchar not null,
      status varchar not null,
      content varchar,
      content_format varchar,
      target_url varchar,
      target_kind varchar,
      target_title varchar,
      target_author varchar,
      notes varchar,
      rejection_reason varchar,
      posted_at varchar,
      created_at varchar not null,
      updated_at varchar not null
    )`,
  );
  await db.execute(
    `create table if not exists social_search_targets (
      id varchar primary key,
      user_id varchar not null,
      campaign_id varchar not null,
      platform varchar not null,
      search_type varchar not null,
      queries varchar,
      scopes varchar,
      recency varchar,
      keywords varchar,
      max_results integer,
      status varchar not null,
      result_count integer,
      created_at varchar not null,
      updated_at varchar not null
    )`,
  );
  await db.execute(
    `create table if not exists social_feedback (
      id varchar primary key,
      user_id varchar not null,
      campaign_id varchar not null,
      post_id varchar,
      kind varchar not null,
      reason varchar,
      note varchar,
      created_at varchar not null
    )`,
  );
  await db.execute(
    `create table if not exists social_template_changes (
      id varchar primary key,
      user_id varchar not null,
      template_id varchar not null,
      change_kind varchar not null,
      rationale varchar,
      proposed_patch varchar,
      source_feedback_ids varchar,
      status varchar not null,
      decision_note varchar,
      created_at varchar not null,
      updated_at varchar not null
    )`,
  );
}
