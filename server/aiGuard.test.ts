import test from 'node:test';
import assert from 'node:assert/strict';
import { getAiTheme, AI_GLOBAL_CAP } from './daily';
import { failureGet, failureSet, resetFailures, FAILURE_TTL_SECONDS } from './cache';
import { globalCap, resetGlobalCaps } from './rateLimit';
import { seasonFor } from '../shared/dailyContent';
import { GET as cronGet, authorized } from '../api/cron/daily';
import { GET as todayGet } from '../api/today';
import vercel from '../vercel.json' with { type: 'json' };

delete process.env.DATABASE_URL;
const season = seasonFor('2026-11-09');

test('thème IA : un échec est mémorisé, les requêtes suivantes ne rappellent pas l’IA', async () => {
  resetFailures();
  resetGlobalCaps();
  let calls = 0;
  const failing = async () => (calls++, null);
  assert.equal(await getAiTheme('2026-11-09', season, null, failing as never), null);
  assert.equal(await getAiTheme('2026-11-09', season, null, failing as never), null);
  assert.equal(await getAiTheme('2026-11-09', season, null, failing as never), null);
  assert.equal(calls, 1);
});

test('cache d’échec : expire après 15 minutes', async () => {
  resetFailures();
  const t0 = 1_000_000;
  await failureSet('theme-fail:x', t0);
  assert.equal(await failureGet('theme-fail:x', t0 + (FAILURE_TTL_SECONDS - 1) * 1000), true);
  assert.equal(await failureGet('theme-fail:x', t0 + (FAILURE_TTL_SECONDS + 1) * 1000), false);
});

test('plafond global : refuse au-delà de la limite puis repart avec la fenêtre', async () => {
  resetGlobalCaps();
  const t0 = 5_000;
  for (let i = 0; i < 3; i++) await globalCap('ai:test', 3, 3600, t0 + i);
  await assert.rejects(() => globalCap('ai:test', 3, 3600, t0 + 10), { status: 429 });
  await globalCap('ai:test', 3, 3600, t0 + 3600 * 1000 + 1);
});

test('plafond global : le thème IA n’est plus généré au-delà de 20 par heure', async () => {
  resetFailures();
  resetGlobalCaps();
  let calls = 0;
  const gen = async () => (calls++, null);
  // Jours différents pour contourner le cache d’échec : seul le plafond global limite.
  for (let i = 1; i <= AI_GLOBAL_CAP.limit; i++) await getAiTheme(`2026-12-${String(i).padStart(2, '0')}`, season, null, gen as never);
  await assert.rejects(() => getAiTheme('2027-01-01', season, null, gen as never), { status: 429 });
  assert.equal(calls, AI_GLOBAL_CAP.limit);
});

test('vercel.json : maxDuration défini pour les routes api', () => {
  const fns = (vercel as { functions?: Record<string, { maxDuration?: number }> }).functions ?? {};
  for (const f of ['api/today.ts', 'api/cron/daily.ts']) assert.ok((fns[f]?.maxDuration ?? 0) > 0, f);
});

test('/api/today : la query string est ignorée (redirection vers l’URL canonique)', async () => {
  const res = await todayGet(new Request('https://pulse.test/api/today?x=abc123'));
  assert.equal(res.status, 308);
  assert.equal(res.headers.get('location'), '/api/today');
});

test('cron : refusé sans CRON_SECRET, même avec un en-tête', async () => {
  const saved = process.env.CRON_SECRET;
  try {
    delete process.env.CRON_SECRET;
    assert.equal(authorized(new Request('https://pulse.test/api/cron/daily')), false);
    const res = await cronGet(new Request('https://pulse.test/api/cron/daily', { headers: { authorization: 'Bearer ' } }));
    assert.equal(res.status, 401);
    process.env.CRON_SECRET = 's3cret';
    assert.equal(authorized(new Request('https://pulse.test/api/cron/daily', { headers: { authorization: 'Bearer s3cret' } })), true);
    assert.equal(authorized(new Request('https://pulse.test/api/cron/daily', { headers: { authorization: 'Bearer nope' } })), false);
  } finally {
    if (saved === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = saved;
  }
});
