import { hasDatabase } from '../../server/db.js';
import { clientIp, json, route } from '../../server/http.js';
import { rateLimit } from '../../server/rateLimit.js';
import { getDailyStory } from '../../server/story.js';

/**
 * Édition du jour. Publique (pas de compte requis), mise en cache CDN 10 min.
 * Gemini n'est appelé qu'une fois par jour au maximum ; le reste vient du cache.
 */
export const GET = route(async (req) => {
  if (hasDatabase()) await rateLimit(`news:${clientIp(req)}`, 30, 60);
  const { story } = await getDailyStory();
  if (!story) return json({ story: null, fallback: true });
  return json(
    { story },
    { headers: { 'Cache-Control': 'public, max-age=0, s-maxage=600, stale-while-revalidate=3600' } }
  );
});
