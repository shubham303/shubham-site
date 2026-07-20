import { randomBytes, createHash } from 'node:crypto';

// MCP API keys — the local MCP server sends these to authenticate to our APIs.
// Only the hash is stored.
export const generateApiKey = (): string => 'ti_' + randomBytes(24).toString('base64url');
export const hashApiKey = (key: string): string =>
  createHash('sha256').update(key).digest('hex');
export const keyPrefix = (key: string): string => key.slice(0, 11);
