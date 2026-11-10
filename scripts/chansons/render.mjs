/**
 * Rend l'épisode image par image (SVG → PNG avec sharp), puis ffmpeg assemble le MP4.
 * Usage : node scripts/chansons/render.mjs [--poster]
 */
import sharp from 'sharp';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { frame, WIDTH, HEIGHT, FPS, DURATION, LYRICS } from './timeline.mjs';
import { applyPalette } from './art.mjs';

/** Thème de couleurs : « fille » (rose) ou « garcon » (bleu). */
const themeArg = process.argv.find((a) => a.startsWith('--theme='));
const theme = themeArg ? themeArg.split('=')[1] : 'fille';
applyPalette(theme);

const OUT = `song/frames-${theme}`;
const posterOnly = process.argv.includes('--poster');

/** Sous-titres pour YouTube (les paroles ne sont pas incrustées dans l'image). */
function srtTime(s) {
  const ms = Math.round(s * 1000);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`;
}

function writeSrt() {
  const body = LYRICS.map((l, i) => {
    const start = l.start ?? l.at;
    const end = l.end ?? start + 3.2;
    return `${i + 1}\n${srtTime(start)} --> ${srtTime(end)}\n${l.text}\n`;
  }).join('\n');
  writeFileSync('song/nino-nina.srt', body, 'utf8');
  console.log('sous-titres : song/nino-nina.srt');
}

async function main() {
  if (posterOnly) {
    await sharp(Buffer.from(frame(18.2))).jpeg({ quality: 88 }).toFile(`song/poster-${theme}.jpg`);
    console.log(`poster : song/poster-${theme}.jpg`);
    return;
  }

  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });

  const total = Math.round(DURATION * FPS);
  const started = Date.now();
  for (let i = 0; i < total; i++) {
    const t = i / FPS;
    const svg = frame(t);
    await sharp(Buffer.from(svg)).png({ compressionLevel: 3 }).toFile(`${OUT}/f${String(i).padStart(5, '0')}.png`);
    if (i % 120 === 0) console.log(`  ${i}/${total} images (${((Date.now() - started) / 1000).toFixed(0)} s)`);
  }
  await sharp(Buffer.from(frame(18.2))).jpeg({ quality: 88 }).toFile(`song/poster-${theme}.jpg`);
  writeSrt();
  console.log(`frames : ${total} en ${((Date.now() - started) / 1000).toFixed(1)} s → ${WIDTH}×${HEIGHT} @${FPS} i/s (thème ${theme})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
