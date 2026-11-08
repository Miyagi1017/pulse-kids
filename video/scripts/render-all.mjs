/**
 * Rend les vidéos en MP4 dans video/out/, en sautant celles qui existent déjà.
 *   npm run render:all                 → les 85 activités
 *   npm run render:all -- physique     → seulement les ids qui contiennent « physique »
 * Une activité dure environ 1 minute de vidéo : le rendu complet peut prendre plusieurs heures.
 */
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';

const filter = process.argv[2] ?? '';
const output = execSync('npx remotion compositions src/index.ts --quiet', { encoding: 'utf8' });
const ids = output.split(/\s+/).filter((id) => /^sport-[\w-]+$/.test(id) && id.includes(filter));

mkdirSync('out', { recursive: true });
console.log(`${ids.length} vidéo(s) à traiter`);
let failed = 0;
for (const [i, id] of ids.entries()) {
  const file = `out/${id}.mp4`;
  if (existsSync(file)) continue;
  console.log(`[${i + 1}/${ids.length}] ${id}`);
  try {
    execSync(`npx remotion render src/index.ts ${id} ${file}`, { stdio: 'inherit' });
  } catch {
    failed++;
  }
}
console.log(failed ? `${failed} rendu(s) en échec` : 'Terminé');
process.exit(failed ? 1 : 0);
