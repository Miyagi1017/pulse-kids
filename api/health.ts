import { availableProviders } from '../server/ai.js';
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
  // On expose le type de fournisseur IA, jamais les clés.
  const ai = availableProviders().map((p) => p.name.split(':')[0]);
  return json({ status: 'ok', database, ai: ai.length ? ai : false, nasa: process.env.NASA_API_KEY ? 'clé perso' : 'DEMO_KEY' });
});
