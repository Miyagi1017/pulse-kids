import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { test } from 'node:test';
import { VIDEOS } from '../data/videos';
import { FILMS } from '../films/index';

const here = new URL('../assets/', import.meta.url);

test('chaque scène des 10 dessins animés a sa prise de voix', () => {
  for (const v of VIDEOS)
    for (let i = 0; i <= v.scenes.length; i++) assert.ok(existsSync(new URL(`voix/${v.id}/${String(i).padStart(2, '0')}.mp3`, here)), `${v.id} scène ${i}`);
});

test('chaque phrase des films a sa prise de voix', () => {
  for (const f of FILMS) f.beats.forEach((b, i) => b.text && assert.ok(existsSync(new URL(`films/${f.id}/${String(i + 1).padStart(2, '0')}.mp3`, here)), `${f.id} phrase ${i + 1}`));
});
