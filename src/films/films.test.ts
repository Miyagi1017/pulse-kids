import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { FILMS, nextFilm } from './index';
import { hash, mulberry, readingSeconds, type FrameState } from './engine';

const state = (beat: number): FrameState => ({ t: 0, beat, bt: 0, waiting: true, sinceTap: null, end: null, caption: '' });

test('chaque film a un id unique, des beats et exactement une pause interactive', () => {
  assert.equal(new Set(FILMS.map((f) => f.id)).size, FILMS.length);
  for (const f of FILMS) {
    assert.ok(f.beats.length >= 5, f.id);
    assert.equal(f.beats.filter((b) => b.tap).length, 1, `${f.id} : une seule pause active`);
    assert.ok(f.poster.beat < f.beats.length, `${f.id} : affiche dans le film`);
    for (const b of f.beats) assert.ok(b.text.length > 3 && b.text.length < 110, `${f.id} : phrase courte`);
  }
});

test('la cible de chaque pause est touchable à l’endroit où la petite main la montre', () => {
  for (const f of FILMS) {
    const i = f.beats.findIndex((b) => b.tap);
    const tap = f.beats[i].tap!;
    const p = tap.at(state(i));
    assert.ok(tap.hit(p.x, p.y, state(i)), `${f.id} : la main montre la cible`);
    assert.ok(!tap.hit(5, 5, state(i)), `${f.id} : un coin de l’écran ne compte pas`);
  }
});

test('le script de découpage des voix connaît le bon nombre de phrases', () => {
  const script = readFileSync(new URL('../../scripts/split-film-voice.ts', import.meta.url), 'utf8');
  for (const f of FILMS) assert.match(script, new RegExp(`'${f.id}': ${f.beats.length}\\b`), f.id);
});

test('film suivant : on fait le tour de la liste', () => {
  assert.equal(nextFilm(FILMS[FILMS.length - 1].id).id, FILMS[0].id);
});

test('aléatoire reproductible et temps de lecture raisonnable', () => {
  assert.equal(hash(1, 2, 3), hash(1, 2, 3));
  const a = mulberry(7),
    b = mulberry(7);
  assert.equal(a(), b());
  assert.ok(readingSeconds('Une chaussette !') >= 1.8);
});
