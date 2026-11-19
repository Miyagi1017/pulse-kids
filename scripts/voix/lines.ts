// Liste de toutes les phrases à enregistrer (films sans prise, 50 vidéos, 66 dessins animés).
import { FILMS } from '../../src/films/index';
import { VIDEOS } from '../../src/data/videos';
import { existsSync } from 'node:fs';
const out: { key: string; text: string }[] = [];
// Le prénom n'est pas enregistré : « Et toi {p}, tu… » devient « Et toi, tu… ».
const noName = (s: string) => s.replace(/\s*\{p\}\s*([,!?.])/g, '$1').replace(/\{p\}/g, '').replace(/\s+([,!?.])/g, '$1').replace(/,\s*,/g, ',').replace(/,\s*([!?.])/g, '$1').trim();
for (const f of FILMS) {
  if (existsSync(`src/assets/films/${f.id}/01.mp3`)) continue;
  f.beats.forEach((b, i) => b.text && out.push({ key: `films/${f.id}/${String(i + 1).padStart(2, '0')}`, text: noName(b.text) }));
}
for (const v of VIDEOS) {
  [`${v.title} !`, ...v.scenes].forEach((t, i) => out.push({ key: `voix/${v.id}/${String(i).padStart(2, '0')}`, text: noName(t) }));
}
console.log(JSON.stringify(out));
