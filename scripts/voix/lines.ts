// Liste de toutes les phrases à enregistrer (films sans prise, 50 vidéos, 66 dessins animés).
import { FILMS } from '../../src/films/index';
import { VIDEOS } from '../../src/data/videos';
import { CAPSULES } from '../../src/videos/capsules';
import { existsSync } from 'node:fs';
import { noName } from '../../src/videos/timing';
const out: { key: string; text: string }[] = [];
// Le prénom n'est pas enregistré : « Et toi {p}, tu… » devient « Et toi, tu… » (src/videos/timing.ts).
for (const f of FILMS) {
  if (existsSync(`src/assets/films/${f.id}/01.mp3`)) continue;
  f.beats.forEach((b, i) => b.text && out.push({ key: `films/${f.id}/${String(i + 1).padStart(2, '0')}`, text: noName(b.text) }));
}
for (const v of [...VIDEOS, ...CAPSULES]) {
  [`${v.title} !`, ...v.scenes].forEach((t, i) => out.push({ key: `voix/${v.id}/${String(i).padStart(2, '0')}`, text: noName(t) }));
}
console.log(JSON.stringify(out));
