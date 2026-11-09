/**
 * Copie les vidéos rendues (video/out) dans l'app (public/videos) et met à jour la liste publiée.
 * Le bouton « Regarder la vidéo » apparaît alors pour ces activités.
 */
import { copyFileSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

const OUT = process.env.RENDER_OUT ?? 'out';
const DEST = '../public/videos';
mkdirSync(DEST, { recursive: true });

const files = readdirSync(OUT).filter((f) => /^sport-[\w-]+\.mp4$/.test(f)).sort();
let bytes = 0;
for (const f of files) {
  copyFileSync(join(OUT, f), join(DEST, f));
  bytes += statSync(join(OUT, f)).size;
}
writeFileSync('../src/data/sportVideos.json', `${JSON.stringify(files.map((f) => basename(f, '.mp4')), null, 2)}\n`);
console.log(`${files.length} vidéo(s) publiée(s), ${(bytes / 1024 / 1024).toFixed(1)} Mo`);
