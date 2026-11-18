// Toutes les phrases de l'app à redire avec OpenVoice (redo_openvoice.py), dans l'ordre de génération :
// contes et histoires (banque, priorité 3), films et vidéos, puis le reste de la banque (priorités 1 et 2).
// La Grosse Fraise Rouge garde sa prise ElevenLabs d'origine : c'est la référence du timbre de Christine.
// Usage : npx tsx scripts/voix/bank-lines.ts > bank.json && npx tsx scripts/voix/all-lines.ts bank.json [skip.json] > lines.json
import { readFileSync } from 'node:fs';
import { FILMS } from '../../src/films/index';
import { VIDEOS } from '../../src/data/videos';
import { withoutName } from '../../src/voice/bank';

type Line = { key: string; text: string };
const bank: { file: string; text: string; prio: number }[] = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const skip = new Set<string>(process.argv[3] ? JSON.parse(readFileSync(process.argv[3], 'utf8')).map((l: Line) => l.key) : []);
const fromBank = (p: number): Line[] => bank.filter((b) => b.prio === p).map((b) => ({ key: `banque/${b.file}`, text: b.text }));

const media: Line[] = [];
for (const f of FILMS) {
  if (f.id === 'film-fraise') continue;
  f.beats.forEach((b, i) => b.text && media.push({ key: `films/${f.id}/${String(i + 1).padStart(2, '0')}`, text: withoutName(b.text) }));
}
for (const v of VIDEOS) {
  [`${v.title} !`, ...v.scenes].forEach((t, i) => media.push({ key: `voix/${v.id}/${String(i).padStart(2, '0')}`, text: withoutName(t) }));
}

const out = [...fromBank(3), ...media, ...fromBank(1), ...fromBank(2)].filter((l) => !skip.has(l.key) && l.text.trim());
console.error(`${out.length} phrases (${skip.size} déjà refaites ignorées)`);
console.log(JSON.stringify(out));
