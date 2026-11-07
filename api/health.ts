import { db, hasDatabase } from '../server/db.js';
import { json, route } from '../server/http.js';

export const GET = route(async () => {
  let database: 'absent' | 'ok' | 'erreur' = 'absent';
  if (hasDatabase()) {
    try {
      await db()`select 1`;
      database = 'ok';
    } catch {
      database = 'erreur';
    }
  }
  return json({ status: 'ok', database, ai: Boolean(process.env.GEMINI_API_KEY) });
});
