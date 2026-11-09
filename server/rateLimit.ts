import { db, hasDatabase } from './db.js';
import { HttpError } from './http.js';

/**
 * Limitation de débit par fenêtre fixe, stockée en base (fonctionne entre instances serverless).
 * Un seul aller-retour SQL grâce à l'upsert atomique.
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<void> {
  const sql = db();
  const rows = (await sql`
    insert into rate_limits (key, count, window_start)
    values (${key}, 1, now())
    on conflict (key) do update set
      count = case when rate_limits.window_start < now() - make_interval(secs => ${windowSeconds})
                   then 1 else rate_limits.count + 1 end,
      window_start = case when rate_limits.window_start < now() - make_interval(secs => ${windowSeconds})
                   then now() else rate_limits.window_start end
    returning count, extract(epoch from (window_start + make_interval(secs => ${windowSeconds}) - now()))::int as retry_after
  `) as { count: number; retry_after: number }[];

  const row = rows[0];
  if (row && row.count > limit) {
    const retry = Math.max(1, row.retry_after);
    throw new HttpError(429, `Trop de tentatives. Réessaie dans ${retry} secondes.`, {
      'Retry-After': String(retry)
    });
  }
}

const memoryWindows = new Map<string, { count: number; start: number }>();

/**
 * Plafond global (toutes IP confondues). En base si elle existe ; sinon compteur de l'instance,
 * pour qu'il y ait toujours une limite même sans DATABASE_URL.
 */
export async function globalCap(key: string, limit: number, windowSeconds: number, now = Date.now()): Promise<void> {
  if (hasDatabase()) return rateLimit(key, limit, windowSeconds);
  const w = memoryWindows.get(key);
  if (!w || now - w.start >= windowSeconds * 1000) {
    memoryWindows.set(key, { count: 1, start: now });
    return;
  }
  w.count += 1;
  if (w.count > limit) {
    const retry = Math.max(1, Math.ceil((w.start + windowSeconds * 1000 - now) / 1000));
    throw new HttpError(429, `Trop de demandes. Réessaie dans ${retry} secondes.`, { 'Retry-After': String(retry) });
  }
}

export function resetGlobalCaps() {
  memoryWindows.clear();
}
