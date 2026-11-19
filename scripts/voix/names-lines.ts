// Les prénoms que Christine sait dire : les N plus donnés en France aux enfants nés de 2012 à 2023
// (fichier public des prénoms de l'INSEE, prenoms-2023-nat.csv : sexe;preusuel;annais;nombre).
// Sortie : JSON [{ key: "banque/prenom-<nameKey>", text: "Léa" }] pour redo_openvoice.py.
// Usage : npx tsx scripts/voix/names-lines.ts prenoms-2023-nat.csv [2000] > prenoms.json
import { readFileSync } from 'node:fs';
import { nameFile, nameKey } from '../../src/voice/names';

const [csv, n = '2000'] = process.argv.slice(2);
const total = new Map<string, number>();
for (const line of readFileSync(csv, 'utf8').split(/\r?\n/).slice(1)) {
  const [, name, year, count] = line.split(';');
  if (!name || name.startsWith('_') || name.length < 2 || +year < 2012 || +year > 2023) continue;
  total.set(name, (total.get(name) ?? 0) + Number(count));
}
// « LÉA-ROSE » → « Léa-Rose »
const pretty = (s: string) => s.toLowerCase().replace(/(^|[-' ])(\p{L})/gu, (_, a: string, b: string) => a + b.toUpperCase());
// Une seule prise par clé : on additionne les orthographes (Léa, Lea) et on garde la plus donnée.
const best = new Map<string, { text: string; top: number; count: number }>();
for (const [name, count] of total) {
  const k = nameKey(name);
  const b = best.get(k) ?? { text: pretty(name), top: 0, count: 0 };
  if (count > b.top) Object.assign(b, { text: pretty(name), top: count });
  b.count += count;
  best.set(k, b);
}
const out = [...best.values()]
  .sort((a, b) => b.count - a.count)
  .slice(0, Number(n))
  .map((x) => ({ key: `banque/${nameFile(x.text)}`, text: x.text }));
console.error(`${out.length} prénoms (premier : ${out[0]?.text}, dernier : ${out.at(-1)?.text})`);
console.log(JSON.stringify(out));
