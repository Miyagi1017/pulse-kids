import { getToday } from '../server/daily.js';
import { hasDatabase } from '../server/db.js';
import { clientIp, json, route } from '../server/http.js';
import { rateLimit } from '../server/rateLimit.js';

/**
 * La vidéo du jour : scènes narrées construites à partir de la date, la saison, la météo,
 * la photo NASA et le thème IA. Publique, sans donnée personnelle, cache CDN 15 min.
 */
export const GET = route(async (req) => {
  // La query string ne change rien au contenu : on la retire (redirection vers l'URL canonique, mise en cache par le CDN)
  // pour qu'un « ?x=aléatoire » ne contourne pas le cache.
  const url = new URL(req.url);
  if (url.search) {
    return new Response(null, { status: 308, headers: { Location: url.pathname, 'Cache-Control': 'public, max-age=0, s-maxage=900' } });
  }
  if (hasDatabase()) await rateLimit(`today:${clientIp(req)}`, 30, 60);
  const today = await getToday();
  return json(
    { today },
    { headers: { 'Cache-Control': 'public, max-age=0, s-maxage=900, stale-while-revalidate=3600' } }
  );
});
