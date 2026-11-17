// Prépare le dossier de film Lemo-Opuscar d'une vidéo : copie le gabarit (video/lemo/pulse-film), les prises de
// Christine (titre + une par phrase ; une phrase avec prénom = les deux morceaux de la banque autour du prénom),
// mesure leurs durées et écrit story.json (chronologie : src/videos/filmTimeline.ts) et cues.json (pour l'app).
// Usage : npx tsx scripts/lemo/make_story.ts <id> <dossier du film>
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { VIDEOS } from '../../src/data/videos';
import { CAPSULES } from '../../src/videos/capsules';
import { keyFile, sentenceKey } from '../../src/voice/bank';
import { filmTimeline, type VoicePart } from '../../src/videos/filmTimeline';
import { storybookStyleFor } from '../../src/videos/pacing';

const [id, dir] = process.argv.slice(2);
const video = [...VIDEOS, ...CAPSULES].find((v) => v.id === id);
if (!video || !dir) throw new Error('usage : make_story.ts <id> <dossier>');
const ROOT = path.resolve(import.meta.dirname, '../..');
const TPL = path.join(ROOT, 'video/lemo/pulse-film');
mkdirSync(path.join(dir, 'voices'), { recursive: true });
for (const f of ['index.html', 'film.js', 'film.css', 'score.py', 'mix.py']) copyFileSync(path.join(TPL, f), path.join(dir, f));
for (const f of ['film.js', 'film.css']) if (!existsSync(path.join(TPL, f))) throw new Error(`gabarit non regroupé : ${f} (lancer render.sh)`);

const dur = (f: string) => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString());
let n = 0;
const take = (src: string): VoicePart => {
  const name = `voices/v${String(n++).padStart(2, '0')}.mp3`;
  copyFileSync(src, path.join(dir, name));
  return { src: name, dur: dur(src) };
};
const clip = (i: number) => path.join(ROOT, `src/assets/voix/${id}/${String(i).padStart(2, '0')}.mp3`);
const bank = (key: string) => path.join(ROOT, `public/banque/${keyFile(key)}.mp3`);

const shots: VoicePart[][] = [[take(clip(0))]];
video.scenes.forEach((text, i) => {
  // Avec prénom : morceau, silence (le prénom est dit par l'app), morceau — si toutes les prises existent.
  const pieces = text.split('{p}').map((p) => sentenceKey(p));
  if (pieces.length > 1 && pieces.every((k) => !k || existsSync(bank(k)))) {
    const parts: VoicePart[] = [];
    pieces.forEach((k, j) => {
      if (j > 0) parts.push({ name: true });
      if (k) parts.push(take(bank(k)));
    });
    shots.push(parts);
  } else shots.push([take(clip(i + 1))]);
});

const tl = filmTimeline(shots);
const story = { id, title: video.title, style: storybookStyleFor(id), dur: tl.dur, scenes: tl.scenes, names: tl.names, voices: tl.voices.map((v) => ({ file: v.src, at: v.at })) };
writeFileSync(path.join(dir, 'story.json'), JSON.stringify(story, null, 1));
writeFileSync(path.join(dir, 'cues.json'), JSON.stringify({ scenes: tl.scenes.map((t) => +t.toFixed(3)), names: tl.names.map((t) => +t.toFixed(3)) }));
console.log(`${id} : ${shots.length} plans, ${tl.dur.toFixed(1)} s, ${tl.names.length} prénom(s)`);
