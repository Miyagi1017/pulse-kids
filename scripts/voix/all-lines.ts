// Toutes les phrases de l'app à redire avec OpenVoice (redo_openvoice.py), dans l'ordre de génération :
// contes et histoires (banque, priorité 3), films et vidéos, puis le reste de la banque (priorités 1 et 2).
// La Grosse Fraise Rouge garde sa prise ElevenLabs d'origine : c'est la référence du timbre de Christine.
// Usage : npx tsx scripts/voix/bank-lines.ts > bank.json && npx tsx scripts/voix/all-lines.ts bank.json [skip.json] [--media] [--missing] > lines.json
//   --media   : films et vidéos seulement (plus les morceaux autour du prénom des vidéos) ;
//   --missing : seulement les prises de banque absentes de public/banque/index.json (les prises des vidéos sont toujours refaites).
import { readFileSync } from 'node:fs';
import { FILMS } from '../../src/films/index';
import { VIDEOS } from '../../src/data/videos';
import { keyFile, sentenceKey, withoutName } from '../../src/voice/bank';
import { splitAtName } from '../../src/voice/names';

type Line = { key: string; text: string };
const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const flags = new Set(process.argv.slice(2).filter((a) => a.startsWith('--')));
const bank: { file: string; text: string; prio: number }[] = JSON.parse(readFileSync(args[0], 'utf8'));
const skip = new Set<string>(args[1] ? JSON.parse(readFileSync(args[1], 'utf8')).map((l: Line) => l.key) : []);
const fromBank = (p: number): Line[] => bank.filter((b) => b.prio === p).map((b) => ({ key: `banque/${b.file}`, text: b.text }));

const media: Line[] = [];
for (const f of FILMS) {
  if (f.id === 'film-fraise') continue;
  f.beats.forEach((b, i) => b.text && media.push({ key: `films/${f.id}/${String(i + 1).padStart(2, '0')}`, text: withoutName(b.text) }));
}
for (const v of VIDEOS) {
  [`${v.title} !`, ...v.scenes].forEach((t, i) => media.push({ key: `voix/${v.id}/${String(i).padStart(2, '0')}`, text: withoutName(t) }));
  // Morceaux autour du prénom (toute la scène est un seul texte) : Christine dit le prénom.
  for (const t of v.scenes) if (t.includes('{p}')) for (const seg of splitAtName(t)) media.push({ key: `banque/${keyFile(sentenceKey(seg))}`, text: seg });
}

const have = new Set<string>(flags.has('--missing') ? JSON.parse(readFileSync('public/banque/index.json', 'utf8')) : []);
const seen = new Set<string>();
const out = (flags.has('--media') ? media : [...fromBank(3), ...media, ...fromBank(1), ...fromBank(2)])
  .filter((l) => !skip.has(l.key) && l.text.trim())
  .filter((l) => !(l.key.startsWith('banque/') && have.has(l.key.slice(7))))
  .filter((l) => !seen.has(l.key) && seen.add(l.key));
console.error(`${out.length} phrases (${skip.size} déjà refaites ignorées)`);
console.log(JSON.stringify(out));
