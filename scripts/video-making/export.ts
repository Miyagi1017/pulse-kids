/**
 * Prépare le montage Video-Making (~/Video-Making, dans WSL) des films Pulse Kids.
 * Pour chaque vidéo, un dossier de projet : project.json (répliques, sous-titres, sons, rendu, contrôles),
 * index.html (la page de rendu, scripts/video-making/page.ts) et assets/ (la page regroupée).
 * Le minutage vient des prises OpenVoice de Christine (src/videos/filmTimeline.ts) : une réplique par prise ;
 * une phrase avec prénom = deux morceaux de la banque séparés d'un silence où l'app dit le prénom.
 * Ensuite, dans WSL : bash scripts/video-making/render_all.sh <dossier>.
 *
 * Usage (Windows) : npx tsx scripts/video-making/export.ts \\wsl.localhost\Ubuntu\home\intel\pulse-films [filtre]
 */
import { build } from 'esbuild';
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { VIDEOS } from '../../src/data/videos';
import { keyFile, sentenceKey, withoutName } from '../../src/voice/bank';
import { filmTimeline, type VoicePart } from '../../src/videos/filmTimeline';
import { shotFor } from '../../src/videos/pacing';

const ROOT = resolve(import.meta.dirname, '../..');
const dest = process.argv[2];
const filter = process.argv[3] ?? '';
if (!dest) throw new Error('usage : export.ts <dossier des projets> [filtre]');

// Chemin WSL d'un fichier du dépôt (les prises de Christine sont lues depuis /mnt/c).
const wsl = (p: string) => p.replace(/^([A-Za-z]):[\\/]/, (_, d: string) => `/mnt/${d.toLowerCase()}/`).replaceAll('\\', '/');
const dur = (f: string) => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString());
// Apostrophe droite : l'aligneur de Video-Making garde « l'histoire » en un seul mot.
const plain = (s: string) => s.replaceAll('’', "'").trim();

const bundle = join(dest, '_page');
mkdirSync(bundle, { recursive: true });
await build({
  entryPoints: [join(ROOT, 'scripts/video-making/page.ts')],
  bundle: true,
  format: 'iife',
  target: 'es2022',
  outdir: bundle,
  entryNames: 'page',
  loader: { '.woff2': 'dataurl', '.woff': 'dataurl', '.json': 'json' },
  minify: true,
  logLevel: 'warning'
});

const all = VIDEOS.filter((v) => v.id.includes(filter));
for (const v of all) {
  const dir = join(dest, v.id);
  mkdirSync(join(dir, 'assets'), { recursive: true });
  for (const f of ['page.js', 'page.css']) if (existsSync(join(bundle, f))) copyFileSync(join(bundle, f), join(dir, 'assets', f));

  // Les prises, plan par plan : titre, puis chaque phrase (en morceaux autour du prénom si possible).
  const clips: string[] = [],
    lines: string[] = [];
  const take = (file: string, text: string): VoicePart => {
    clips.push(file);
    lines.push(plain(text));
    return { src: file, dur: dur(file) };
  };
  const clip = (i: number) => join(ROOT, `src/assets/voix/${v.id}/${String(i).padStart(2, '0')}.mp3`);
  const bank = (k: string) => join(ROOT, `public/banque/${keyFile(k)}.mp3`);
  const shots: VoicePart[][] = [[take(clip(0), `${v.title} !`)]];
  v.scenes.forEach((text, i) => {
    const pieces = text.split('{p}').map((p) => p.replace(/^\s*[,;:]\s*/, '').trim());
    if (pieces.length > 1 && pieces.every((p) => !sentenceKey(p) || existsSync(bank(sentenceKey(p))))) {
      const parts: VoicePart[] = [];
      pieces.forEach((p, j) => {
        if (j > 0) parts.push({ name: true });
        if (sentenceKey(p)) parts.push(take(bank(sentenceKey(p)), p));
      });
      shots.push(parts);
    } else shots.push([take(clip(i + 1), withoutName(text))]);
  });
  const tl = filmTimeline(shots);

  // Sons sur les actions (règle Video-Making : jamais sur une grille) : un souffle doux à chaque plan,
  // trois « pop » quand les objets arrivent (découverte), un petit impact sur le plan d'action.
  const count = v.scenes.length;
  const at = (s: number) => tl.scenes[s];
  const action = tl.scenes.findIndex((_, s) => shotFor(s, count) === 'action');
  const sfx = [
    ...tl.scenes.slice(1).map((t) => ({ at: +(t + 0.05).toFixed(3), kind: 'swish', gain: 0.03 })),
    ...[0, 1, 2].map((i) => ({
      at: +(at(1) + 0.8 + i * 0.7).toFixed(3),
      kind: 'pop',
      gain: 0.025
    })),
    ...(action > 0 ? [{ at: +(at(action) + 1.6).toFixed(3), kind: 'impact', gain: 0.035 }] : [])
  ];
  const story = { id: v.id, title: v.title, dur: tl.dur, scenes: tl.scenes };
  const project = {
    name: v.id,
    title: v.title,
    width: 1280,
    height: 720,
    fps: 30,
    page: 'index.html',
    lines,
    subtitles: {
      safe_top: 0.81,
      safe_bottom: 0.985,
      safe_side: 0.05,
      font_px: 38
    },
    audio: {
      lufs: -14,
      true_peak: -1.5,
      bed: 'pad',
      bed_level_db: -30,
      pad_root_hz: 131,
      seed: v.id.length,
      sfx
    },
    render: {
      part_frames: 150,
      crf: 24,
      threads: 2,
      small_height: 0,
      hash_dirs: ['assets']
    },
    // Rythme lent pour les 5-8 ans : beaucoup de pauses, donc peu de mots par minute sur l'ensemble du film.
    qc: { max_mb: 8, freeze_s: 1.5, wpm_range: [40, 172] },
    output: `out/${v.id}.mp4`,
    pulse: {
      story,
      names: tl.names.map((x) => +x.toFixed(3)),
      clips: clips.map((c) => wsl(c)),
      offsets: tl.voices.map((x) => +x.at.toFixed(3)),
      shots: tl.scenes.map((x) => +x.toFixed(3)),
      duration: +tl.dur.toFixed(3)
    }
  };
  writeFileSync(join(dir, 'project.json'), `${JSON.stringify(project, null, 2)}\n`);
  writeFileSync(
    join(dir, 'index.html'),
    `<!doctype html>\n<html lang="fr"><head><meta charset="utf-8"><title>${v.title}</title>\n` +
      `<link rel="stylesheet" href="assets/page.css">\n<style>html,body{margin:0;background:#000}canvas{display:block}</style></head>\n` +
      `<body><canvas id="art"></canvas>\n<script>window.STORY=${JSON.stringify(story)};</script>\n<script src="assets/page.js"></script></body></html>\n`
  );
  if (!existsSync(join(dir, 'PROGRESS.md')))
    writeFileSync(join(dir, 'PROGRESS.md'), `# PROGRESS\n\n${v.id} : projet préparé par scripts/video-making/export.ts.\n`);
}
console.log(`${all.length} projet(s) prêts dans ${dest} (page : ${(readFileSync(join(bundle, 'page.js')).length / 1024).toFixed(0)} Ko)`);
