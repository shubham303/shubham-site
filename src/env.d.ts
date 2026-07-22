/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

import type { Role } from './server/features/identity/service';

declare global {
  namespace App {
    interface Locals {
      /** Resolved by src/middleware.ts. null if not authenticated. */
      user: { id: string; email: string; role: Role } | null;
    }
  }
}

export {};
