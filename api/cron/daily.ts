import { timingSafeEqual } from 'node:crypto';
import { getToday } from '../../server/daily.js';
import { db, hasDatabase } from '../../server/db.js';
import { HttpError, json, route } from '../../server/http.js';

/**
 * Tâche planifiée Vercel (vercel.json → crons) : prépare chaque matin la vidéo du jour
 * (photo NASA + thème IA mis en cache), pour que le premier enfant n'attende pas.
 */
function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  // Sans secret : la route ne fait que préchauffer le cache du jour (1 génération max/jour),
  // donc l'appeler n'a pas d'effet nuisible. Dès que CRON_SECRET existe, il est exigé.
  if (!secret) return true;
  const got = Buffer.from(req.headers.get('authorization') ?? '');
  const want = Buffer.from(`Bearer ${secret}`);
  return got.length === want.length && timingSafeEqual(got, want);
}

export const GET = route(async (req) => {
  if (!authorized(req)) throw new HttpError(401, 'Non autorisé.');
  const today = await getToday();
  if (hasDatabase()) {
    // Ménage : compteurs expirés et contenus de plus de 30 jours.
    const sql = db();
    await sql`delete from rate_limits where window_start < now() - interval '1 day'`;
    await sql`delete from daily_cache where created_at < now() - interval '30 days'`;
  }
  return json({ ok: true, scenes: today.scenes.length, sources: today.sources });
});
