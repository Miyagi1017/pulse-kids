/**
 * Prépare les 116 dessins animés pour le pipeline de Video-Making (~/Video-Making, dans WSL).
 * Pour chaque vidéo, un dossier de projet : project.json (phrases, plans, sous-titres, sons), index.html
 * (la page de rendu, scripts/video-making/page.ts) et assets/ (la page compilée).
 * Ensuite, dans WSL : bash scripts/video-making/render_all.sh <dossier>.
 *
 * Usage (Windows) : npx tsx scripts/video-making/export.ts \\wsl.localhost\Ubuntu\home\intel\pulse-kids-mp4 [filtre]
 */
import { build } from 'esbuild';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { VIDEOS } from '../../src/data/videos';
import { CAPSULES } from '../../src/videos/capsules';
import { keyWordStart, noName, shotLength } from '../../src/videos/timing';

const ROOT = resolve(import.meta.dirname, '../..');
const dest = process.argv[2];
const filter = process.argv[3] ?? '';
if (!dest) throw new Error('usage : export.ts <dossier des projets> [filtre]');

// Chemin WSL d'un fichier du dépôt (les prises de Christine sont lues depuis /mnt/c).
const wsl = (p: string) => p.replace(/^([A-Za-z]):\\/, (_, d: string) => `/mnt/${d.toLowerCase()}/`).replaceAll('\\', '/');

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

const all = [...VIDEOS, ...CAPSULES].filter((v) => v.id.includes(filter));
for (const v of all) {
  const dir = join(dest, v.id);
  mkdirSync(join(dir, 'assets'), { recursive: true });
  for (const f of ['page.js', 'page.css']) if (existsSync(join(bundle, f))) copyFileSync(join(bundle, f), join(dir, 'assets', f));
  // Apostrophe droite : l'aligneur de Video-Making garde alors « l'histoire » en un seul mot (avec ’ il le coupe en deux,
  // et le petit « l » s'allume trop peu de temps pour le contrôle des sous-titres).
  const texts = [`${v.title} !`, ...v.scenes].map((s) => noName(s).replaceAll('’', "'"));
  const L = texts.map((_, s) => shotLength(v.id, s));
  const at = L.map((_, i) => L.slice(0, i).reduce((a, b) => a + b, 0));
  // Sons sur les actions (Video-Making : jamais sur une grille) : un souffle à chaque changement de plan,
  // un petit « pop » quand chaque objet arrive, un impact quand le zoom tombe sur le héros.
  const land = keyWordStart(v.id, 2, v.scenes[1]);
  const sfx = [
    ...[1, 2, 3, 4].map((s) => ({ at: +(at[s] + 0.05).toFixed(3), kind: 'swish', gain: 0.045 })),
    ...[0, 1, 2].map((i) => ({ at: +(at[1] + 0.45 + i * 0.35).toFixed(3), kind: 'pop', gain: 0.035 })),
    { at: +(at[2] + Math.max(0.45, (land ?? 0.85) - 0.1)).toFixed(3), kind: 'impact', gain: 0.05 }
  ];
  const project = {
    name: v.id,
    title: v.title,
    width: 1280,
    height: 720,
    fps: 30,
    page: 'index.html',
    lines: texts,
    subtitles: { safe_top: 0.81, safe_bottom: 0.985, safe_side: 0.05, font_px: 38 },
    audio: { lufs: -14, true_peak: -1.5, bed: 'pad', bed_level_db: -32, pad_root_hz: 131, seed: v.id.length, sfx },
    render: { part_frames: 150, crf: 18, threads: 2, small_height: 0, hash_dirs: ['assets'] },
    // Voix d'enfant : Christine parle lentement pour les 5-8 ans ; le rythme est vérifié, pas imposé (vidéos < 15 s).
    qc: { max_mb: 40, freeze_s: 0.75, wpm_range: [80, 172] },
    output: `out/${v.id}.mp4`,
    pulse: {
      clips: texts.map((_, s) => wsl(join(ROOT, 'src/assets/voix', v.id, `${String(s).padStart(2, '0')}.mp3`))),
      offsets: at.map((x) => +x.toFixed(3)),
      shots: L.map((x) => +x.toFixed(3)),
      duration: +L.reduce((a, b) => a + b, 0).toFixed(3)
    }
  };
  writeFileSync(join(dir, 'project.json'), `${JSON.stringify(project, null, 2)}\n`);
  writeFileSync(
    join(dir, 'index.html'),
    `<!doctype html>\n<html lang="fr"><head><meta charset="utf-8"><title>${v.title}</title>\n` +
      `<link rel="stylesheet" href="assets/page.css">\n<style>html,body{margin:0;background:#000}canvas{display:block}</style></head>\n` +
      `<body><canvas id="art"></canvas>\n<script>window.VIDEO_ID=${JSON.stringify(v.id)};</script>\n<script src="assets/page.js"></script></body></html>\n`
  );
  if (!existsSync(join(dir, 'PROGRESS.md'))) writeFileSync(join(dir, 'PROGRESS.md'), `# PROGRESS\n\n${v.id} : projet préparé par scripts/video-making/export.ts.\n`);
}
console.log(`${all.length} projet(s) prêts dans ${dest} (page : ${(readFileSync(join(bundle, 'page.js')).length / 1024).toFixed(0)} Ko)`);
