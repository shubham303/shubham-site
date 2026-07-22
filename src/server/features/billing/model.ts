// subscriptions table — the source of truth for what a user has paid for.
// `role` lives on the BetterAuth `user` row (free/pro), and the identity
// service consults this table to decide whether a `pro` role is still in
// effect (active paid sub, or unexpired trial).

import type { Database } from '../../db/database';

export async function createTables(db: Database): Promise<void> {
  await db.execute(
    `create table if not exists subscriptions (
      id varchar primary key,
      user_id varchar unique not null,
      status varchar not null,
      plan varchar,
      trial_ends_at varchar,
      current_period_end varchar,
      razorpay_subscription_id varchar,
      created_at varchar not null,
      updated_at varchar not null
    )`,
  );
}
