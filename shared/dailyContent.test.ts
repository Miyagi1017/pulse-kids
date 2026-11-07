import test from 'node:test';
import assert from 'node:assert/strict';
import { FACTS, factFor, frenchDate, seasonFor } from './dailyContent';
import { aiThemeSchema, todaySchema } from './schemas';

test('saisons de l’hémisphère nord', () => {
  assert.equal(seasonFor('2026-01-15').name, 'hiver');
  assert.equal(seasonFor('2026-04-10').name, 'printemps');
  assert.equal(seasonFor('2026-07-14').name, 'été');
  assert.equal(seasonFor('2026-11-07').name, 'automne');
  assert.equal(seasonFor('2026-12-25').name, 'hiver');
});

test('date en français', () => {
  assert.equal(frenchDate('2026-11-07'), 'samedi 7 novembre');
});

test('une anecdote par jour, qui change le lendemain', () => {
  assert.ok(FACTS.length >= 30);
  assert.notDeepEqual(factFor('2026-11-07'), factFor('2026-11-08'));
});

test('le thème IA est filtré (HTML, liens, longueur)', () => {
  const ok = { theme: 'Les feuilles', emoji: '🍂', scenes: [{ emoji: '🍁', text: 'Les feuilles tombent.' }, { emoji: '🌳', text: 'Et toi {p} ?' }] };
  assert.equal(aiThemeSchema.safeParse(ok).success, true);
  assert.equal(aiThemeSchema.safeParse({ ...ok, theme: '<b>x</b>' }).success, false);
  assert.equal(aiThemeSchema.safeParse({ ...ok, scenes: [{ emoji: '🍁', text: 'Va sur https://exemple.com' }, ok.scenes[1]] }).success, false);
});

test('une scène vidéo au fond inconnu reprend un fond par défaut', () => {
  const r = todaySchema.parse({ date: '2026-11-07', title: 'Test', emoji: '🍂', sources: [], scenes: [{ emoji: '👋', text: 'Bonjour', bg: 'inconnu' }, { emoji: '🌙', text: 'Fin', bg: 'nuit' }] });
  assert.equal(r.scenes[0].bg, 'ciel');
});
