import assert from 'node:assert/strict';
import { test } from 'node:test';
import { VIDEOS } from '../data/videos';
import { CAPSULES } from './capsules';
import { MIN_SHOT, noName, sceneTiming, shotLength, TAIL, wordStarts } from './timing';

const ALL = [...VIDEOS, ...CAPSULES];
const said = (v: (typeof ALL)[number], i: number) => noName(i === 0 ? `${v.title} !` : v.scenes[i - 1]);

test('chaque prise des 116 dessins animés est minutée mot à mot (alignement forcé, au moins 97 % des mots)', () => {
  let words = 0,
    timed = 0;
  for (const v of ALL)
    for (let i = 0; i <= v.scenes.length; i++) {
      const t = sceneTiming(v.id, i);
      assert.ok(t, `${v.id} scène ${i}`);
      assert.equal(t.w.length, said(v, i).split(/\s+/).length, `${v.id} scène ${i} : un minutage par mot dit`);
      const starts = t.w.filter((w) => w).map((w) => w![0]);
      assert.deepEqual(starts, [...starts].sort((a, b) => a - b), `${v.id} scène ${i} : mots dans l'ordre`);
      assert.ok(starts.every((s) => s >= 0 && s <= t.d), `${v.id} scène ${i} : mots dans la prise`);
      words += t.w.length;
      timed += t.w.filter(Boolean).length;
    }
  assert.ok(timed / words >= 0.97, `${timed}/${words}`);
});

test('un plan dure sa phrase plus une respiration, et jamais moins que son action', () => {
  for (const v of ALL)
    for (let i = 0; i <= v.scenes.length; i++) {
      const L = shotLength(v.id, i);
      assert.ok(L >= MIN_SHOT[i] && L >= sceneTiming(v.id, i)!.d + TAIL - 1e-9, `${v.id} scène ${i}`);
    }
});

test('le prénom affiché, que Christine ne dit pas, s’allume avec le mot qui le précède', () => {
  const v = CAPSULES.find((c) => c.scenes[3].includes('Et toi {p},'))!;
  const raw = v.scenes[3];
  const shown = raw.replace('{p}', 'Léa').split(/\s+/);
  const s = wordStarts(v.id, 4, raw, shown)!;
  const at = shown.indexOf('Léa,');
  assert.equal(s[at], s[at - 1]);
  assert.ok(s[at + 1] > s[at], 'le mot suivant vient après');
});
