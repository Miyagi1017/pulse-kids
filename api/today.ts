import { getToday } from '../server/daily.js';
import { hasDatabase } from '../server/db.js';
import { clientIp, json, route } from '../server/http.js';
import { rateLimit } from '../server/rateLimit.js';

/**
 * La vidéo du jour : scènes narrées construites à partir de la date, la saison, la météo,
 * la photo NASA et le thème IA. Publique, sans donnée personnelle, cache CDN 15 min.
 */
export const GET = route(async (req) => {
  if (hasDatabase()) await rateLimit(`today:${clientIp(req)}`, 30, 60);
  const today = await getToday();
  return json(
    { today },
    { headers: { 'Cache-Control': 'public, max-age=0, s-maxage=900, stale-while-revalidate=3600' } }
  );
});
