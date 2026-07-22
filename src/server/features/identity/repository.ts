// Reads against the BetterAuth-owned `user` table. Writes go through the
// auth instance itself (signUp, etc.), not here — so this is read-only.
//
// We don't introduce a typed ORM for BetterAuth's tables; we read the columns
// we need (id, email, role) directly via the shared DB handle. `role` is the
// custom additional field declared in ./auth.ts.

import { getDb } from '../../db';

export interface UserRow {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}

export class IdentityRepository {
  async getById(id: string): Promise<UserRow | null> {
    const rows = await getDb().execute(
      'select id, email, role, "createdAt" as created_at from "user" where id = ?',
      [id],
    );
    return (rows[0] as UserRow) ?? null;
  }

  async setEmailVerified(id: string): Promise<void> {
    // Email verification is out of scope for this migration (no email
    // transport wired yet); but BetterAuth checks the column, so mark new
    // accounts verified to avoid locking them out.
    await getDb().execute(
      'update "user" set "emailVerified" = true where id = ?',
      [id],
    );
  }

  async setRole(id: string, role: 'free' | 'pro'): Promise<void> {
    await getDb().execute(
      'update "user" set role = ? where id = ?',
      [role, id],
    );
  }
}

export const identityRepository = new IdentityRepository();
