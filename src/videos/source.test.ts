import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { mp4Url, nameAt, pickSource, sceneAt } from './source';

test('pickSource : le film MP4 seulement en ligne et s’il existe', () => {
  assert.equal(pickSource('a', true, ['a']), 'mp4');
  assert.equal(pickSource('a', false, ['a']), 'code');
  assert.equal(pickSource('b', true, ['a']), 'code');
  assert.equal(mp4Url('video-animaux-01'), '/films-mp4/video-animaux-01.mp4');
});

test('sceneAt : la scène en cours d’après le temps du film (pour reprendre en code au même endroit)', () => {
  const times = [0, 3.5, 9, 15];
  assert.equal(sceneAt(times, 0), 0);
  assert.equal(sceneAt(times, 3.49), 0);
  assert.equal(sceneAt(times, 3.5), 1);
  assert.equal(sceneAt(times, 100), 3);
  assert.equal(sceneAt([], 5), 0);
});

test('nameAt : le prénom à dire entre deux images du film', () => {
  assert.deepEqual(nameAt([4, 20], 3.9, 4.05), [4]);
  assert.deepEqual(nameAt([4, 20], 4.05, 4.2), []);
  assert.deepEqual(nameAt([4, 20], 0, 30), [4, 20]);
});

test('le service worker ne garde jamais les films MP4 en cache', () => {
  const sw = readFileSync(new URL('../../public/sw.js', import.meta.url), 'utf8');
  assert.match(sw, /films-mp4/);
});
