import { hasDatabase } from '../../server/db.js';
import { clientIp, json, route } from '../../server/http.js';
import { rateLimit } from '../../server/rateLimit.js';
import { getSpacePhoto } from '../../server/space.js';

/** Photo de l'espace du jour (NASA, domaine public). Publique, cache CDN 1 h. */
export const GET = route(async (req) => {
  if (hasDatabase()) await rateLimit(`space:${clientIp(req)}`, 30, 60);
  const photo = await getSpacePhoto();
  if (!photo) return json({ photo: null });
  return json(
    { photo },
    { headers: { 'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400' } }
  );
});
