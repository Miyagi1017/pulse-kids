/**
 * Génère une illustration par conte avec un modèle open source de Hugging Face
 * (par défaut FLUX.1-schnell, licence Apache 2.0), puis la compresse en WebP.
 *
 *   npm run illustrations              → génère les images manquantes
 *   npm run illustrations -- --force   → régénère tout
 *   npm run illustrations -- conte-07  → une seule image
 *
 * Nécessite HF_TOKEN (jeton gratuit « Read » : https://huggingface.co/settings/tokens)
 * dans .env.local. Les images sont ensuite embarquées dans l'app : aucun appel à
 * Hugging Face n'a lieu pendant l'utilisation par l'enfant.
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { CONTES } from '../src/data/contes.ts';
import { CONTES_DU_SOIR } from '../src/data/contesDuSoir.ts';
import type { Tale } from '../src/data/format.ts';

for (const f of ['.env.local', '.env']) if (existsSync(f)) process.loadEnvFile(f);

const TOKEN = process.env.HF_TOKEN;
const MODEL = process.env.HF_IMAGE_MODEL || 'black-forest-labs/FLUX.1-schnell';
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

export function promptFor(t: Tale): string {
  const scene = t.pages[0].replaceAll('{p}', 'a little child');
  return `${STYLE}. ${t.kind === 'soir' ? NIGHT : DAY}. Story: « ${t.title.replaceAll('{p}', 'the child')} ». Scene: ${scene}`;
}

async function generate(t: Tale, attempt = 1): Promise<Buffer> {
  const res = await fetch(`https://router.huggingface.co/hf-inference/models/${MODEL}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json', Accept: 'image/png' },
    body: JSON.stringify({ inputs: promptFor(t), parameters: { width: 768, height: 576, num_inference_steps: 4 } }),
    signal: AbortSignal.timeout(120_000)
  });
  if (res.ok) return Buffer.from(await res.arrayBuffer());

  const detail = (await res.text()).slice(0, 200);
  // 503 = modèle en cours de chargement, 429 = quota : on patiente et on réessaie.
  if ((res.status === 503 || res.status === 429 || res.status >= 500) && attempt < 5) {
    const wait = 10_000 * attempt;
    console.warn(`   ⏳ ${t.id} : HTTP ${res.status}, nouvel essai dans ${wait / 1000} s`);
    await new Promise((r) => setTimeout(r, wait));
    return generate(t, attempt + 1);
  }
  throw new Error(`HTTP ${res.status} ${detail}`);
}

mkdirSync(OUT, { recursive: true });
const tales = [...CONTES, ...CONTES_DU_SOIR].filter((t) => !only.length || only.includes(t.id));
let made = 0;
let failed = 0;

for (const t of tales) {
  const file = path.join(OUT, `${t.id}.webp`);
  if (existsSync(file) && !force) continue;
  try {
    const png = await generate(t);
    // 640×480 WebP ≈ 30-60 Ko : léger pour les tablettes et le mode hors ligne.
    const webp = await sharp(png).resize(640, 480, { fit: 'cover' }).webp({ quality: 72 }).toBuffer();
    writeFileSync(file, webp);
    made++;
    console.log(`✅ ${t.id}  ${t.title}  (${Math.round(webp.length / 1024)} Ko)`);
  } catch (err) {
    failed++;
    console.error(`❌ ${t.id} : ${err instanceof Error ? err.message : err}`);
  }
}

console.log(`\n${made} image(s) générée(s), ${failed} échec(s), modèle ${MODEL}.`);
if (failed) process.exitCode = 1;
