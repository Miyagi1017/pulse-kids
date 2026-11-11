/**
 * Découpe une prise de narration (une phrase par temps fort, séparées par des silences) en un fichier par phrase,
 * rangés dans src/assets/films/<id-du-film>/01.mp3, 02.mp3… Le lecteur les joue à la place de la voix du navigateur.
 *
 *   npm run films:voice -- film-lune ~/Téléchargements/lune.mp3
 *
 * Nécessite ffmpeg. Le nombre de phrases attendu est celui du film ; le seuil de silence s'ajuste tout seul.
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';

const EXPECTED: Record<string, number> = { 'film-lune': 7, 'film-chaussettes': 7, 'film-chateau': 6 };

const [filmId, input] = process.argv.slice(2);
if (!filmId || !input || !(filmId in EXPECTED)) {
  console.error(`Usage : npm run films:voice -- <${Object.keys(EXPECTED).join('|')}> <fichier.mp3>`);
  process.exit(1);
}
const want = EXPECTED[filmId];

function duration(file: string): number {
  const r = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`ffprobe a échoué : ${r.stderr}`);
  return Number(r.stdout.trim());
}

/** Plages de parole entre les silences (silencedetect de ffmpeg). */
function speech(file: string, minSilence: number, noise = -38): [number, number][] {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-i', file, '-af', `silencedetect=noise=${noise}dB:d=${minSilence}`, '-f', 'null', '-'], { encoding: 'utf8' });
  const total = duration(file);
  const starts = [...r.stderr.matchAll(/silence_start: ([\d.]+)/g)].map((m) => Number(m[1]));
  const ends = [...r.stderr.matchAll(/silence_end: ([\d.]+)/g)].map((m) => Number(m[1]));
  const out: [number, number][] = [];
  let cur = 0;
  starts.forEach((s, i) => {
    if (s - cur > 0.25) out.push([cur, s]);
    cur = ends[i] ?? total;
  });
  if (total - cur > 0.25) out.push([cur, total]);
  return out;
}

let segments: [number, number][] = [];
for (const d of [0.9, 0.8, 0.7, 0.6, 1.0, 1.2, 0.5, 1.5]) {
  segments = speech(input, d);
  if (segments.length === want) break;
}
if (segments.length !== want) {
  console.error(`J'ai trouvé ${segments.length} phrases au lieu de ${want}. Vérifie que chaque phrase est séparée par un vrai silence.`);
  console.error(segments.map(([a, b]) => `${a.toFixed(2)}–${b.toFixed(2)}`).join('  '));
  process.exit(1);
}

const dir = path.join('src/assets/films', filmId);
rmSync(dir, { recursive: true, force: true });
mkdirSync(dir, { recursive: true });
segments.forEach(([a, b], i) => {
  const out = path.join(dir, `${String(i + 1).padStart(2, '0')}.mp3`);
  const r = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-ss', String(Math.max(0, a - 0.06)), '-to', String(b + 0.12), '-i', input, '-ac', '1', '-b:a', '64k', out]);
  if (r.status !== 0) throw new Error(`ffmpeg : ${r.stderr}`);
  console.log(`${out}  ${(b - a).toFixed(1)} s`);
});
console.log(`✓ ${want} phrases prêtes pour ${filmId}.`);
