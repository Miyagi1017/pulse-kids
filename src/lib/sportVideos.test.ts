import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import PUBLISHED from '../data/sportVideos.json';
import { PHYSIQUES } from '../data/physiques';
import { ESSENTIELS } from '../data/programmes';
import { SPORT_TIPS } from '../data/sport';
import { WUSHU } from '../data/wushu';
import { compositionId, sportVideoUrl } from './sportVideos';

test('pas de vidéo publiée : pas de lien', () => {
  assert.equal(compositionId('physique-01'), 'sport-physique-01');
  assert.equal(sportVideoUrl('activite-inconnue'), null);
});

test('chaque vidéo publiée correspond à une activité et son fichier existe', () => {
  const known = new Set([...PHYSIQUES, ...WUSHU, ...ESSENTIELS, ...SPORT_TIPS].map((a) => compositionId(a.id)));
  for (const id of PUBLISHED) {
    assert.ok(known.has(id), `${id} : activité inconnue`);
    assert.ok(existsSync(`public/videos/${id}.mp4`), `${id} : fichier absent`);
  }
});
