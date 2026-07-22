// status: 'trialing' | 'active' | 'canceled'
import type { Database } from '../../db/database';
import { getDb } from '../../db';

export interface SubscriptionRow {
  id: string;
  user_id: string;
  status: string;
  plan: string | null;
  trial_ends_at: string | null;
  current_period_end: string | null;
  razorpay_subscription_id: string | null;
  created_at: string;
  updated_at: string;
}

export class SubscriptionsRepository {
  constructor(private db: Database = getDb()) {}

  async getByUser(userId: string): Promise<SubscriptionRow | null> {
    const rows = await this.db.execute(
      `select id, user_id, status, plan, trial_ends_at, current_period_end,
              razorpay_subscription_id, created_at, updated_at
         from subscriptions where user_id = ?`,
      [userId],
    );
    return (rows[0] as SubscriptionRow) ?? null;
  }

  async insert(s: SubscriptionRow): Promise<void> {
    await this.db.execute(
      `insert into subscriptions
        (id, user_id, status, plan, trial_ends_at, current_period_end,
         razorpay_subscription_id, created_at, updated_at)
       values (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [s.id, s.user_id, s.status, s.plan, s.trial_ends_at, s.current_period_end,
       s.razorpay_subscription_id, s.created_at, s.updated_at],
    );
  }

  async update(
    userId: string,
    fields: Partial<Pick<SubscriptionRow,
      'status' | 'plan' | 'trial_ends_at' | 'current_period_end' | 'razorpay_subscription_id'>>,
    updatedAt: string,
  ): Promise<void> {
    const cols = Object.keys(fields);
    if (cols.length === 0) return;
    const set = cols.map((c) => `${c} = ?`).join(', ');
    const vals = cols.map((c) => (fields as Record<string, unknown>)[c]);
    await this.db.execute(
      `update subscriptions set ${set}, updated_at = ? where user_id = ?`,
      [...vals, updatedAt, userId],
    );
  }
}

export const subscriptionsRepository = new SubscriptionsRepository();
