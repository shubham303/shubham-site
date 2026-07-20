import { randomUUID } from 'node:crypto';

export const newId = (): string => randomUUID().replace(/-/g, '');
export const nowIso = (): string => new Date().toISOString();
export const isoInDays = (days: number): string =>
  new Date(Date.now() + days * 86400_000).toISOString();
