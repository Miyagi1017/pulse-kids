import { db, hasDatabase } from './db.js';

/**
 * Cache du jour à deux niveaux : mémoire de l'instance, puis Postgres (partagé entre instances).
 * Les clés sont du type `story:2026-11-07` ou `space:2026-11-07`.
 */
const memory = new Map<string, unknown>();

export async function cacheGet<T>(key: string, validate: (raw: unknown) => T | null): Promise<T | null> {
  if (memory.has(key)) return memory.get(key) as T;
  if (!hasDatabase()) return null;
  const rows = (await db()`select data from daily_cache where key = ${key}`) as { data: unknown }[];
  const value = rows[0] ? validate(rows[0].data) : null;
  if (value !== null) memory.set(key, value);
  return value;
}

export async function cacheSet(key: string, value: unknown): Promise<void> {
  memory.set(key, value);
  if (!hasDatabase()) return;
  await db()`
    insert into daily_cache (key, data) values (${key}, ${JSON.stringify(value)}::jsonb)
    on conflict (key) do update set data = excluded.data, created_at = now()
  `;
}

/** Évite que deux requêtes simultanées génèrent deux fois le même contenu (même instance). */
const inflight = new Map<string, Promise<unknown>>();
export function once<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const running = inflight.get(key) as Promise<T> | undefined;
  if (running) return running;
  const p = fn().finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
}
