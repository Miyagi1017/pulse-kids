// Aperçu rapide : une planche PNG de 7 images par comptine (dev). Usage : npx tsx scripts/comptines/preview.ts <dossier> <motif-id>...
import sharp from 'sharp';
import { COMPTINES } from '../../src/data/comptines';
import { comptineFrame, estimateTiming } from '../../src/comptines/stage';
const [, , outDir, ...ids] = process.argv;
for (const id of ids) {
  const c = COMPTINES.find((x) => x.id.includes(id))!;
  const tm = estimateTiming(c);
  const times = [1.2, tm.lines[0][0] + 1, tm.lines[1][0] + 1, tm.lines[2][0] + 1, tm.lines[3][0] + 1, tm.lines[4][0] + 0.8, tm.duration - 0.5];
  const bufs = await Promise.all(times.map((t, i) => sharp(Buffer.from(comptineFrame(c, tm, t, i % 2 ? 'garcon' : 'fille'))).resize(640, 360).png().toBuffer()));
  const sheet = sharp({ create: { width: 1280, height: 1440, channels: 3, background: '#fff' } }).composite(bufs.map((b, i) => ({ input: b, left: (i % 2) * 640, top: Math.floor(i / 2) * 360 })));
  await sheet.png().toFile(`${outDir}/${c.id}.png`);
  console.log('ok', c.id);
}
