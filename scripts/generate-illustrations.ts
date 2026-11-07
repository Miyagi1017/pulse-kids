/**
 * Génère une illustration par conte avec FLUX.1-schnell (open source, Apache 2.0),
 * via le Space officiel Hugging Face (GPU gratuits, client open source Gradio),
 * puis la compresse en WebP. Les images sont embarquées dans l'app : aucun appel
 * à Hugging Face n'a lieu pendant l'utilisation par l'enfant.
 *
 *   npm run illustrations              → génère les images manquantes
 *   npm run illustrations -- --force   → régénère tout
 *   npm run illustrations -- conte-07  → une seule image
 *
 * Nécessite HF_TOKEN (jeton gratuit « Read » : https://huggingface.co/settings/tokens) dans .env.local.
 * Le Space a un quota GPU quotidien : si on l'atteint, relancer plus tard complète les images manquantes.
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { Client } from '@gradio/client';
import { CONTES } from '../src/data/contes.ts';
import { CONTES_DU_SOIR } from '../src/data/contesDuSoir.ts';
import type { Tale } from '../src/data/format.ts';

for (const f of ['.env.local', '.env']) if (existsSync(f)) process.loadEnvFile(f);

const TOKEN = process.env.HF_TOKEN as `hf_${string}` | undefined;
const SPACE = process.env.HF_IMAGE_SPACE || 'black-forest-labs/FLUX.1-schnell';
const OUT = path.resolve('src/assets/illustrations');
const args = process.argv.slice(2);
const force = args.includes('--force');
const only = args.filter((a) => !a.startsWith('--'));

if (!TOKEN) {
  console.error('❌ HF_TOKEN manquant. Crée un jeton gratuit (type « Read ») sur https://huggingface.co/settings/tokens');
  console.error('   puis ajoute la ligne  HF_TOKEN=hf_xxx  dans .env.local');
  process.exit(1);
}

const STYLE =
  'Children’s picture book illustration, soft watercolor and gouache, rounded cute characters, ' +
  'gentle and friendly, simple composition, centered subject, warm cheerful pastel palette, ' +
  'safe for 5-year-old children, no text, no letters, no words, no watermark';
const NIGHT = 'calm bedtime scene at night, deep blue sky, soft moonlight, twinkling stars, cozy and sleepy atmosphere';
const DAY = 'bright sunny daytime scene, joyful colors';

/** Personnage principal en anglais (d'après l'emoji du conte) : évite les confusions du modèle. */
const SUBJECT: Record<string, string> = {
  '🦊': 'a cute little fox', '🐢': 'a cute turtle', '🐘': 'a cute baby elephant', '🌻': 'a little child planting a sunflower',
  '🐧': 'a cute penguin', '🐉': 'a friendly little dragon', '🐝': 'a cute bee', '🚂': 'a small smiling toy train',
  '🐻': 'a cute bear cub', '🦄': 'a cute unicorn', '🐌': 'a cute snail', '🎈': 'a red balloon and a little child',
  '🐸': 'a cute frog', '🦁': 'a cute lion cub', '🌈': 'a rainbow with sun and rain clouds', '🐙': 'a cute octopus',
  '🚀': 'a cardboard rocket and a little child', '🐿️': 'a cute squirrel', '🦋': 'a caterpillar and a butterfly', '🐳': 'a friendly blue whale and a small fish',
  '🧸': 'a teddy bear', '🐓': 'a cute rooster', '🌙': 'a smiling moon', '🦔': 'a cute hedgehog', '⛄': 'a snowman',
  '🐕': 'a cute puppy with a ball', '🌳': 'a big old oak tree with birds', '🎨': 'a little child painting', '🐭': 'a cute mouse with cheese',
  '⭐': 'a little star', '🦒': 'a cute giraffe', '🚒': 'a small red fire truck', '🐰': 'a cute bunny with a carrot',
  '🏰': 'a sandcastle on the beach', '🦉': 'a cute owl', '🍎': 'a red apple', '🐞': 'a cute ladybug', '🌊': 'a small wave on a beach',
  '🦜': 'a cute parrot', '🐑': 'a cute sheep', '🌋': 'a smiling volcano', '🎵': 'music notes and a little child', '🐄': 'a cute cow',
  '🛶': 'a beaver, a duck and a frog in a small boat', '🌰': 'an acorn and an oak tree', '🐼': 'a cute panda eating bamboo', '🎪': 'a circus tent with friendly animals',
  '🌸': 'a cherry tree in bloom', '🦀': 'a cute crab', '🏆': 'children running a race',
  '🕯️': 'a soft night light in a cozy bedroom', '🌌': 'a starry sky and a little bed flying', '🌧️': 'soft rain on a cozy house roof', '☁️': 'a soft fluffy cloud',
  '🐈': 'a sleeping cat on a bed', '🎐': 'a wind chime by a window', '🏔️': 'a snowy mountain at night', '🍵': 'a cup of warm milk',
  '🌠': 'a shooting star', '🛏️': 'a cozy child bed', '🌾': 'a wheat field under the moon', '🐠': 'colorful fish in a lagoon',
  '🎶': 'a music box with a tiny dancer', '🌛': 'a crescent moon', '🏡': 'a cozy house at night', '🌬️': 'a gentle breeze moving curtains',
  '🐐': 'a cute little goat', '🌷': 'a night garden with flowers', '🦢': 'a white swan on a lake', '🪐': 'a dreamy planet',
  '🌄': 'a sunrise over hills', '🐨': 'a cute koala in a tree', '🌺': 'a beautiful flower', '🦭': 'a cute seal on ice',
  '📖': 'an open storybook', '🌑': 'a peaceful night sky', '🐥': 'a chick under a hen wing', '💤': 'a sleeping child in bed',
  '🌲': 'a forest falling asleep', '🐟': 'fish'
};

export function promptFor(t: Tale): string {
  const scene = t.pages[0].replaceAll('{p}', 'a little child');
  const subject = SUBJECT[t.emoji] ? `Main character: ${SUBJECT[t.emoji]}. ` : '';
  return `${STYLE}. ${t.kind === 'soir' ? NIGHT : DAY}. ${subject}Story title (French): « ${t.title.replaceAll('{p}', 'the child')} ». Scene (French): ${scene}`;
}

/** Graine stable par conte : relancer le script redonne la même image. */
const seedFor = (id: string) => [...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % 2_000_000_000;

class QuotaError extends Error {}

const app = await Client.connect(SPACE, { token: TOKEN });

async function generate(t: Tale, attempt = 1): Promise<Buffer> {
  try {
    const result = (await app.predict('/infer', {
      prompt: promptFor(t),
      seed: seedFor(t.id),
      randomize_seed: false,
      width: 576,
      height: 432,
      num_inference_steps: 4
    })) as { data: [{ url: string }, number] };
    const url = result.data[0]?.url;
    if (!url) throw new Error('réponse sans image');
    const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` }, signal: AbortSignal.timeout(60_000) });
    if (!res.ok) throw new Error(`téléchargement HTTP ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/quota|exceeded|GPU.*(limit|time)/i.test(msg)) throw new QuotaError(msg.slice(0, 200));
    if (attempt < 3) {
      console.warn(`   ⏳ ${t.id} : ${msg.slice(0, 120)} — nouvel essai`);
      await new Promise((r) => setTimeout(r, 6000 * attempt));
      return generate(t, attempt + 1);
    }
    throw err;
  }
}

mkdirSync(OUT, { recursive: true });
const tales = [...CONTES, ...CONTES_DU_SOIR].filter((t) => !only.length || only.includes(t.id));
let made = 0;
let failed = 0;

for (const t of tales) {
  const file = path.join(OUT, `${t.id}.webp`);
  if (existsSync(file) && !force) continue;
  try {
    const img = await generate(t);
    // WebP 576×432 ≈ 30-50 Ko : léger pour les tablettes et le mode hors ligne.
    const webp = await sharp(img).resize(576, 432, { fit: 'cover' }).webp({ quality: 74 }).toBuffer();
    writeFileSync(file, webp);
    made++;
    console.log(`✅ ${t.id}  ${t.title}  (${Math.round(webp.length / 1024)} Ko)`);
  } catch (err) {
    failed++;
    if (err instanceof QuotaError) {
      console.error(`⏸️  Quota GPU gratuit du Space atteint (${err.message}).`);
      console.error('   Relance « npm run illustrations » plus tard : seules les images manquantes seront générées.');
      break;
    }
    console.error(`❌ ${t.id} : ${err instanceof Error ? err.message : err}`);
  }
}

console.log(`\n${made} image(s) générée(s), ${failed} échec(s) — Space ${SPACE}.`);
process.exit(failed ? 1 : 0);
