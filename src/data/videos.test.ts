import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { VIDEOS, VIDEO_THEMES, videoOfTheDay } from './videos';

const credits = JSON.parse(readFileSync(new URL('./videoCredits.json', import.meta.url), 'utf8')) as Record<string, { license: string; creator: string; source: string }>;
// « sang » est autorisé ici : la vidéo sur le cœur explique la circulation (vocabulaire du corps).
const FORBIDDEN = /<[^>]+>|https?:\/\/|\bmort|tuer|guerre|\barme\b/i;

test('au moins 50 mini-vidéos, ids uniques, 4 scènes courtes et sûres', () => {
  assert.ok(VIDEOS.length >= 50, `${VIDEOS.length} vidéos`);
  assert.equal(new Set(VIDEOS.map((v) => v.id)).size, VIDEOS.length);
  for (const v of VIDEOS) {
    assert.equal(v.scenes.length, 4, v.id);
    for (const s of v.scenes) {
      assert.ok(s.length <= 160, `${v.id} : scène trop longue`);
      assert.ok(!FORBIDDEN.test(s), `${v.id} : contenu interdit`);
    }
    assert.ok(VIDEO_THEMES[v.theme], v.id);
  }
});

test('la suite de vidéos alterne les thèmes', () => {
  for (let i = 2; i < VIDEOS.length; i++) {
    const t = [VIDEOS[i - 2], VIDEOS[i - 1], VIDEOS[i]].map((v) => v.theme);
    assert.ok(!(t[0] === t[1] && t[1] === t[2]), `trois « ${t[2]} » d’affilée`);
  }
});

test('chaque photo publiée existe et a un crédit avec licence libre', () => {
  const ids = Object.keys(credits);
  assert.ok(ids.length >= 45, `${ids.length} photos créditées`);
  for (const id of ids) {
    assert.ok(VIDEOS.some((v) => v.id === id), `crédit orphelin : ${id}`);
    assert.ok(existsSync(new URL(`../assets/video-images/${id}.webp`, import.meta.url)), `photo manquante : ${id}`);
    assert.match(credits[id].license, /^(CC0|CC BY|Domaine public)/, id);
    assert.ok(credits[id].creator.length > 0, id);
  }
});

test('une vidéo du jour différente chaque jour', () => {
  assert.notEqual(videoOfTheDay('2026-11-07').id, videoOfTheDay('2026-11-08').id);
});
