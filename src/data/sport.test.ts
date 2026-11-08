import test from 'node:test';
import assert from 'node:assert/strict';
import { SPORT_TIPS, sportOfTheDay } from './sport';

const FORBIDDEN = /<[^>]+>|https?:\/\/|mort|tuer|sang|guerre|arme/i;

test('sport du jour : 15 défis essentiels, ids et titres uniques, 3 mouvements sûrs', () => {
  assert.equal(SPORT_TIPS.length, 15);
  assert.equal(new Set(SPORT_TIPS.map((t) => t.id)).size, SPORT_TIPS.length);
  assert.equal(new Set(SPORT_TIPS.map((t) => t.title)).size, SPORT_TIPS.length, 'titres uniques');
  for (const t of SPORT_TIPS) {
    assert.ok(t.tip.length > 0 && t.tip.length <= 120, `${t.id} : conseil`);
    assert.equal(t.moves.length, 3, t.id);
    for (const m of t.moves) {
      assert.ok(m.text && m.text.length <= 70, `${t.id} : consigne trop longue`);
      assert.ok(m.seconds >= 10 && m.seconds <= 30, `${t.id} : durée ${m.seconds}`);
      assert.ok(!FORBIDDEN.test(m.text + t.tip), `${t.id} : contenu interdit`);
    }
  }
});

test('un défi différent chaque jour', () => {
  assert.notEqual(sportOfTheDay('2026-11-07').id, sportOfTheDay('2026-11-08').id);
});

import { ESSENTIELS, HABITUDES, isEssential } from './programmes';

test('l’essentiel pour grandir : 5 routines courtes et 5 habitudes', () => {
  assert.deepEqual(ESSENTIELS.map((e) => e.besoin), ['Sauter et courir', 'L’équilibre', 'Des muscles forts', 'La souplesse', 'Le calme']);
  for (const e of ESSENTIELS) {
    assert.ok(isEssential(e.id));
    assert.equal(e.moves.length, 3, e.id);
    const total = e.moves.reduce((t, m) => t + m.seconds, 0);
    assert.ok(total >= 40 && total <= 75, `${e.id} : environ une minute (${total} s)`);
    for (const m of e.moves) assert.ok(!FORBIDDEN.test(m.text), e.id);
  }
  assert.equal(HABITUDES.length, 5);
  assert.ok(HABITUDES.some((h) => /dormir/i.test(h.title)) && HABITUDES.some((h) => /écran/i.test(h.title)));
});

import { MINI_DEFIS, MINI_FAMILLES } from './miniDefis';

test('160 mini-défis à choisir : 6 familles équilibrées, ids uniques, environ 30 secondes, sûrs', () => {
  assert.equal(MINI_DEFIS.length, 160);
  assert.equal(new Set(MINI_DEFIS.map((d) => d.id)).size, 160);
  for (const f of Object.keys(MINI_FAMILLES)) {
    const n = MINI_DEFIS.filter((d) => d.famille === f).length;
    assert.ok(n >= 25 && n <= 28, `${f} : ${n} mini-défis`);
  }
  for (const d of MINI_DEFIS) {
    const total = d.moves.reduce((t, m) => t + m.seconds, 0);
    assert.ok(total >= 10 && total <= 40, `${d.id} : ${total} s`);
    for (const m of d.moves) {
      assert.ok(m.text.length <= 75, `${d.id} : consigne trop longue`);
      assert.ok(!FORBIDDEN.test(m.text), `${d.id} : contenu interdit`);
    }
  }
});

import { CONSEILS, conseilDuJour } from './programmes';

test('conseil du jour : 30 conseils courts, sûrs, différents d’un jour à l’autre', () => {
  assert.equal(CONSEILS.length, 30);
  assert.equal(new Set(CONSEILS.map((c) => c.text)).size, 30);
  for (const c of CONSEILS) assert.ok(c.text.length <= 100 && !FORBIDDEN.test(c.text), c.text);
  assert.notEqual(conseilDuJour('2026-11-07').text, conseilDuJour('2026-11-08').text);
});
