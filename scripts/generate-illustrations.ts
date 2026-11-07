/**
 * Illustrations des contes — 100 % open source (modèle FLUX.1-schnell, Apache 2.0).
 *
 * Deux sources :
 *   hf            Space officiel Hugging Face (GPU gratuits, client Gradio). Quota quotidien limité.
 *                 Prioritaire : remplace en premier les images Pollinations.
 *   pollinations  Pollinations.ai (projet open source, gratuit, sans compte) — petit logo sur l'image.
 *
 * Rien n'arrive dans l'app sans relecture :
 *   npm run illustrations                        → génère (source hf) dans illustrations-pending/
 *   npm run illustrations -- --source=pollinations
 *   npm run illustrations:review                 → planche-contact des images en attente
 *   npm run illustrations:publish                → publie toutes les images en attente
 *   npm run illustrations:publish -- --reject=conte-05,soir-12   → publie sauf celles-ci (supprimées)
 *
 * Options : --force (régénère même si déjà publiée), --limit=N, ou des ids (conte-07 soir-03…).
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { CONTES } from '../src/data/contes.ts';
import { CONTES_DU_SOIR } from '../src/data/contesDuSoir.ts';
import type { Tale } from '../src/data/format.ts';
import { promptFor, seedFor } from './illustration-prompts.ts';

for (const f of ['.env.local', '.env']) if (existsSync(f)) process.loadEnvFile(f);

type Source = 'hf' | 'pollinations';
const LIVE = path.resolve('src/assets/illustrations');
const PENDING = path.resolve('src/assets/illustrations-pending');
const SOURCES = path.join(LIVE, 'sources.json');
const W = 576;
const H = 432;

const argv = process.argv.slice(2);
const command = argv[0] === 'review' || argv[0] === 'publish' ? argv[0] : 'generate';
const opt = (name: string) => argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1];
const ids = argv.filter((a) => !a.startsWith('--') && a !== command);
const ALL: Tale[] = [...CONTES, ...CONTES_DU_SOIR];

const readSources = (): Record<string, Source> => (existsSync(SOURCES) ? JSON.parse(readFileSync(SOURCES, 'utf8')) : {});
const writeSources = (s: Record<string, Source>) =>
  writeFileSync(SOURCES, JSON.stringify(Object.fromEntries(Object.entries(s).sort()), null, 2) + '\n');

// ---------------------------------------------------------------- générateurs

class QuotaError extends Error {}

async function fromHuggingFace(): Promise<(t: Tale) => Promise<Buffer>> {
  const token = process.env.HF_TOKEN as `hf_${string}` | undefined;
  if (!token) throw new Error('HF_TOKEN manquant dans .env.local (jeton « Read » : https://huggingface.co/settings/tokens)');
  const { Client } = await import('@gradio/client');
  const app = await Client.connect(process.env.HF_IMAGE_SPACE || 'black-forest-labs/FLUX.1-schnell', { token });
  return async (t) => {
    try {
      const r = (await app.predict('/infer', { prompt: promptFor(t), seed: seedFor(t.id), randomize_seed: false, width: W, height: H, num_inference_steps: 4 })) as {
        data: [{ url: string }];
      };
      const res = await fetch(r.data[0].url, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(60_000) });
      if (!res.ok) throw new Error(`téléchargement HTTP ${res.status}`);
      return Buffer.from(await res.arrayBuffer());
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/quota|exceeded/i.test(msg)) throw new QuotaError(msg.slice(0, 160));
      throw err;
    }
  };
}

async function fromPollinations(): Promise<(t: Tale) => Promise<Buffer>> {
  return async (t) => {
    const url =
      `https://image.pollinations.ai/prompt/${encodeURIComponent(promptFor(t))}` +
      `?width=${W}&height=${H}&model=flux&seed=${seedFor(t.id)}&safe=true&nologo=true`;
    for (let attempt = 1; ; attempt++) {
      const res = await fetch(url, { signal: AbortSignal.timeout(120_000) });
      if (res.ok && (res.headers.get('content-type') ?? '').startsWith('image/')) return Buffer.from(await res.arrayBuffer());
      if (attempt >= 4) throw new Error(`HTTP ${res.status}`);
      await new Promise((r) => setTimeout(r, 15_000 * attempt)); // limite de débit anonyme
    }
  };
}

async function generate() {
  const source: Source = opt('source') === 'pollinations' ? 'pollinations' : 'hf';
  const force = argv.includes('--force');
  const limit = Number(opt('limit') ?? Infinity);
  const sources = readSources();
  mkdirSync(PENDING, { recursive: true });

  const live = (id: string) => existsSync(path.join(LIVE, `${id}.webp`));
  const pending = (id: string) => existsSync(path.join(PENDING, `${id}.webp`));
  let todo = ALL.filter((t) => (!ids.length || ids.includes(t.id)) && !pending(t.id));
  if (!force && !ids.length) {
    // HF : d'abord les contes sans image, puis le remplacement des images Pollinations.
    todo = todo.filter((t) => !live(t.id) || (source === 'hf' && sources[t.id] === 'pollinations'));
    todo.sort((a, b) => Number(live(a.id)) - Number(live(b.id)));
  }
  todo = todo.slice(0, limit);
  if (!todo.length) return console.log('Rien à générer : tout est déjà illustré (ou en attente de relecture).');

  const make = source === 'hf' ? await fromHuggingFace() : await fromPollinations();
  let made = 0;
  for (const t of todo) {
    try {
      const raw = await make(t);
      const webp = await sharp(raw).resize(W, H, { fit: 'cover' }).webp({ quality: 74 }).toBuffer();
      writeFileSync(path.join(PENDING, `${t.id}.webp`), webp);
      writeFileSync(path.join(PENDING, `${t.id}.source`), source);
      made++;
      console.log(`✅ ${t.id}  ${t.title}  (${Math.round(webp.length / 1024)} Ko)`);
    } catch (err) {
      if (err instanceof QuotaError) {
        console.log(`⏸️  Quota gratuit Hugging Face atteint pour aujourd’hui — on reprendra demain.`);
        break;
      }
      console.error(`❌ ${t.id} : ${err instanceof Error ? err.message : err}`);
    }
  }
  console.log(`\n${made} image(s) en attente de relecture (source ${source}). Ensuite : npm run illustrations:review`);
}

// ---------------------------------------------------------------- relecture

async function review() {
  const files = existsSync(PENDING) ? readdirSync(PENDING).filter((f) => f.endsWith('.webp')).sort() : [];
  if (!files.length) return console.log('Aucune image en attente.');
  const cols = 5;
  const tw = 288;
  const th = 216;
  const label = 26;
  const out = path.resolve(opt('out') ?? 'illustrations-review.jpg');
  const tiles = await Promise.all(
    files.map(async (f, i) => {
      const id = f.replace('.webp', '');
      const svg = Buffer.from(
        `<svg width="${tw}" height="${label}"><rect width="100%" height="100%" fill="#2b2350"/><text x="8" y="18" font-family="Arial" font-size="15" fill="#fff">${id}</text></svg>`
      );
      const tile = await sharp({ create: { width: tw, height: th + label, channels: 3, background: '#fff' } })
        .composite([
          { input: await sharp(path.join(PENDING, f)).resize(tw, th).toBuffer(), top: 0, left: 0 },
          { input: svg, top: th, left: 0 }
        ])
        .png()
        .toBuffer();
      return { input: tile, left: (i % cols) * tw, top: Math.floor(i / cols) * (th + label) };
    })
  );
  await sharp({ create: { width: tw * cols, height: (th + label) * Math.ceil(files.length / cols), channels: 3, background: '#fff' } })
    .composite(tiles)
    .jpeg({ quality: 78 })
    .toFile(out);
  console.log(`🖼️  ${files.length} image(s) à relire → ${out}`);
}

// ---------------------------------------------------------------- publication

function publish() {
  const reject = new Set((opt('reject') ?? '').split(',').filter(Boolean));
  const sources = readSources();
  const files = existsSync(PENDING) ? readdirSync(PENDING).filter((f) => f.endsWith('.webp')) : [];
  let ok = 0;
  for (const f of files) {
    const id = f.replace('.webp', '');
    const srcFile = path.join(PENDING, `${id}.source`);
    const source = (existsSync(srcFile) ? readFileSync(srcFile, 'utf8').trim() : 'hf') as Source;
    if (reject.has(id)) {
      console.log(`🗑️  ${id} rejetée`);
    } else {
      renameSync(path.join(PENDING, f), path.join(LIVE, f));
      sources[id] = source;
      ok++;
    }
    rmSync(path.join(PENDING, f), { force: true });
    rmSync(srcFile, { force: true });
  }
  writeSources(sources);
  const counts = Object.values(sources).reduce<Record<string, number>>((c, s) => ((c[s] = (c[s] ?? 0) + 1), c), {});
  console.log(`📚 ${ok} publiée(s). Total : ${Object.keys(sources).length}/${ALL.length} contes illustrés ${JSON.stringify(counts)}`);
}

if (command === 'review') await review();
else if (command === 'publish') publish();
else await generate();
