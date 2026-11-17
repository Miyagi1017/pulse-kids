import test from 'node:test';
import assert from 'node:assert/strict';
import { VIDEOS } from '../data/videos';
import { CAPSULES } from './capsules';
import { isStyle } from '../kits/styles';
import { PACE, SLOW_TRANSITIONS, STORYBOOK_STYLES, nextIndex, shotFor, storybookStyleFor } from './pacing';

test('shotFor : titre, découverte, une seule action, question à la fin', () => {
  assert.equal(shotFor(0, 8), 'titre');
  assert.equal(shotFor(8, 8), 'question');
  assert.equal(shotFor(1, 8), 'decouverte');
  for (let count = 6; count <= 8; count++) {
    const shots = Array.from({ length: count + 1 }, (_, i) => shotFor(i, count));
    assert.equal(shots.filter((s) => s === 'action').length, 1, `count ${count} : ${shots}`);
    assert.equal(shots[count], 'question');
    for (const s of shots.slice(2, -1)) assert.ok(['action', 'detail', 'calme'].includes(s), s);
  }
});

test('rythme lent : pas de whip, plans ≥ 3 s, pause de 0,8 à 1,2 s', () => {
  assert.ok(!(SLOW_TRANSITIONS as readonly string[]).includes('whip'));
  assert.ok(PACE.minShot >= 3);
  assert.ok(PACE.pauseAfterLine >= 0.8 && PACE.pauseAfterLine <= 1.2);
});

test('styles livre d’enfant : valides, et un style par famille de sujets', () => {
  assert.equal(STORYBOOK_STYLES.length, 8);
  for (const s of STORYBOOK_STYLES) assert.ok(isStyle(s), s);
  for (const v of [...VIDEOS, ...CAPSULES]) assert.ok(STORYBOOK_STYLES.includes(storybookStyleFor(v.id)), v.id);
  const byTheme = new Map<string, Set<string>>();
  for (const v of VIDEOS) byTheme.set(v.theme, (byTheme.get(v.theme) ?? new Set()).add(storybookStyleFor(v.id)));
  for (const [theme, styles] of byTheme) assert.equal(styles.size, 1, theme);
});

test('nextIndex : un appui pendant la pause avance d’une seule phrase', () => {
  assert.equal(nextIndex(2, 8, true), 3);
  assert.equal(nextIndex(2, 8, false), 3);
  assert.equal(nextIndex(8, 8, false), 8);
  assert.equal(nextIndex(8, 8, true), 8);
});
