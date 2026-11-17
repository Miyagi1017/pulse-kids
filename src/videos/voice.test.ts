import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { test } from 'node:test';
import { VIDEOS } from '../data/videos';
import { FILMS } from '../films/index';
import { CAPSULES } from './capsules';

const here = new URL('../assets/', import.meta.url);

test('chaque scène des vidéos et des 66 dessins animés a sa prise de voix', () => {
  for (const v of [...VIDEOS, ...CAPSULES])
    for (let i = 0; i <= v.scenes.length; i++) assert.ok(existsSync(new URL(`voix/${v.id}/${String(i).padStart(2, '0')}.mp3`, here)), `${v.id} scène ${i}`);
});

test('chaque phrase des films a sa prise de voix', () => {
  for (const f of FILMS) f.beats.forEach((b, i) => b.text && assert.ok(existsSync(new URL(`films/${f.id}/${String(i + 1).padStart(2, '0')}.mp3`, here)), `${f.id} phrase ${i + 1}`));
});

test('aucune prise orpheline : exactement une prise par scène (titre compris)', async () => {
  const { readdirSync } = await import('node:fs');
  const dir = new URL('voix/', here);
  const ids = new Set([...VIDEOS, ...CAPSULES].map((v) => v.id));
  for (const d of readdirSync(dir)) assert.ok(ids.has(d), `dossier voix/${d} sans vidéo`);
  for (const v of [...VIDEOS, ...CAPSULES]) {
    const files = readdirSync(new URL(`${v.id}/`, dir)).filter((f) => f.endsWith('.mp3'));
    assert.equal(files.length, v.scenes.length + 1, `${v.id} : ${files.length} prises pour ${v.scenes.length + 1} scènes`);
  }
});

test('Christine peut dire le prénom : chaque morceau autour de {p} est dans la banque', async () => {
  const { readFileSync } = await import('node:fs');
  const { keyFile } = await import('../voice/bank');
  const { templateSegments } = await import('../voice/names');
  const index = new Set(JSON.parse(readFileSync(new URL('../../public/banque/index.json', import.meta.url), 'utf8')) as string[]);
  for (const v of [...VIDEOS, ...CAPSULES])
    for (const s of v.scenes) for (const k of templateSegments(s)) assert.ok(index.has(keyFile(k)), `${v.id} : morceau « ${k} » sans prise`);
  const names = [...index].filter((f) => f.startsWith('prenom-'));
  assert.ok(names.length >= 1500, `${names.length} prénoms dans la banque`);
  for (const n of ['prenom-lea', 'prenom-gabriel', 'prenom-emma', 'prenom-louis']) assert.ok(index.has(n), n);
});
