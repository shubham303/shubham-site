import { randomBytes } from 'node:crypto';
import { getProvider } from '../db/factory';
import { newId, nowIso } from '../lib/ids';

export async function createFolder(userId: string, name: string) {
  const id = newId();
  await getProvider().folders.insert({ id, user_id: userId, name, created_at: nowIso() });
  return { id, name };
}

export async function listFolders(userId: string) {
  const rows = await getProvider().folders.listByUser(userId);
  return rows.map((f) => ({ id: f.id, name: f.name, created_at: f.created_at }));
}

export async function saveReport(
  userId: string,
  opts: { title: string; content: string; format?: string; folderId?: string | null; metadata?: unknown },
) {
  const p = getProvider();
  if (opts.folderId) {
    const folder = await p.folders.getById(userId, opts.folderId);
    if (!folder) throw new Error('folder_not_found');
  }
  const id = newId();
  await p.reports.insert({
    id,
    user_id: userId,
    folder_id: opts.folderId ?? null,
    title: opts.title,
    content: opts.content,
    format: opts.format ?? 'markdown',
    metadata: opts.metadata ? JSON.stringify(opts.metadata) : null,
    share_token: null,
    created_at: nowIso(),
  });
  return { id, title: opts.title };
}

export async function listReports(userId: string, folderId?: string | null) {
  const rows = await getProvider().reports.listByUser(userId, folderId);
  return rows.map((r) => ({
    id: r.id, title: r.title, folder_id: r.folder_id, format: r.format,
    shared: !!r.share_token, created_at: r.created_at,
  }));
}

export async function getReport(userId: string, id: string) {
  const r = await getProvider().reports.getById(userId, id);
  if (!r) return null;
  return {
    id: r.id, title: r.title, content: r.content, format: r.format, folder_id: r.folder_id,
    metadata: r.metadata ? JSON.parse(r.metadata) : null,
    shared: !!r.share_token, share_token: r.share_token, created_at: r.created_at,
  };
}

export async function shareReport(userId: string, id: string, share: boolean) {
  const p = getProvider();
  const r = await p.reports.getById(userId, id);
  if (!r) return null;
  const token = share ? r.share_token ?? randomBytes(12).toString('base64url') : null;
  await p.reports.setShareToken(userId, id, token);
  return { shared: share, share_token: token };
}

export async function getSharedReport(token: string) {
  const r = await getProvider().reports.getByShareToken(token);
  if (!r) return null;
  return { title: r.title, content: r.content, format: r.format, created_at: r.created_at };
}
