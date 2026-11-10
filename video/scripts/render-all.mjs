/**
 * Rend les vidéos en MP4 dans video/out/, en sautant celles qui existent déjà.
 *   npm run render:all                 → les 85 activités
 *   npm run render:all -- physique     → seulement les ids qui contiennent « physique »
 * Une activité dure environ 1 minute de vidéo : le rendu complet peut prendre plusieurs heures.
 */
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, renameSync, rmSync } from 'node:fs';

// Machine chargée : Node 26 abandonne trop vite les connexions locales vers le navigateur de rendu.
const env = { ...process.env, NODE_OPTIONS: `${process.env.NODE_OPTIONS ?? ''} --network-family-autoselection-attempt-timeout=5000`.trim() };
const ATTEMPTS = 3;
const OUT = process.env.RENDER_OUT ?? 'out'; // un autre dossier garde l'ancienne série intacte

const filter = process.argv[2] ?? '';
const output = execSync('npx remotion compositions src/index.ts --quiet', { encoding: 'utf8', env });
const ids = output.split(/\s+/).filter((id) => /^sport-[\w-]+$/.test(id) && id.includes(filter));

mkdirSync(OUT, { recursive: true });
console.log(`${ids.length} vidéo(s) à traiter`);

const failed = [];
for (const [i, id] of ids.entries()) {
  const file = `${OUT}/${id}.mp4`;
  if (existsSync(file)) continue;
  // On écrit dans un fichier temporaire : une vidéo interrompue n'est jamais prise pour une vidéo finie.
  const partial = `${OUT}/${id}.partial.mp4`;
  let done = false;
  for (let attempt = 1; attempt <= ATTEMPTS && !done; attempt++) {
    console.log(`[${i + 1}/${ids.length}] ${id} (essai ${attempt})`);
    try {
      execSync(`npx remotion render src/index.ts ${id} ${partial}`, { stdio: 'inherit', env });
      renameSync(partial, file);
      done = true;
    } catch {
      rmSync(partial, { force: true });
    }
  }
  if (!done) failed.push(id);
}
console.log(failed.length ? `Échec : ${failed.join(', ')}` : 'Terminé');
process.exit(failed.length ? 1 : 0);
