import { db } from './db.js';
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
