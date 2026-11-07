import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import { HttpError } from './http.js';

let client: NeonQueryFunction<false, false> | null = null;

export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/** Client SQL (requêtes paramétrées uniquement — jamais de concaténation). */
export function db(): NeonQueryFunction<false, false> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new HttpError(503, "La synchronisation en ligne n'est pas encore activée. L'app fonctionne en mode invité.");
  }
  client ??= neon(url);
  return client;
}
