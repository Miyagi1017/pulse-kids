/**
 * Photos des mini-vidéos — images sous licence libre trouvées via Openverse
 * (moteur open source de la fondation WordPress : CC0, domaine public, CC BY, CC BY-SA ;
 * contenu adulte filtré). Les photos sont téléchargées une fois, compressées, relues,
 * puis embarquées avec leurs crédits : l'app n'appelle jamais Openverse.
 *
 *   npm run video-images                     → récupère les photos manquantes (file d'attente)
 *   npm run video-images -- review           → planche-contact à relire
 *   npm run video-images -- publish          → publie les photos en attente
 *   npm run video-images -- publish --reject=video-animaux-03   → rejette ; la suivante sera proposée
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { VIDEOS, type MiniVideo } from '../src/data/videos.ts';

const LIVE = path.resolve('src/assets/video-images');
const PENDING = path.resolve('src/assets/video-images-pending');
const CREDITS = path.resolve('src/data/videoCredits.json');
const REJECTS = path.resolve('scripts/video-image-rejects.json');
const W = 576;
const H = 432;
const UA = 'PulseKids/2.0 (educational app for children; https://github.com/Miyagi1017/pulse-kids)';

const argv = process.argv.slice(2);
const command = argv[0] === 'review' || argv[0] === 'publish' ? argv[0] : 'fetch';
const opt = (n: string) => argv.find((a) => a.startsWith(`--${n}=`))?.split('=')[1];

export interface Credit {
  title: string;
  creator: string;
  license: string;
  licenseUrl: string;
  source: string;
}

const readJson = <T>(file: string, fallback: T): T => (existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : fallback);
const writeJson = (file: string, data: unknown) => writeFileSync(file, JSON.stringify(data, null, 2) + '\n');

interface OvImage {
  id: string;
  title?: string;
  creator?: string;
  license: string;
  license_version?: string;
  license_url?: string;
  foreign_landing_url?: string;
  url: string;
  thumbnail?: string;
  width?: number;
  height?: number;
  mature?: boolean;
}

/** Mots à écarter des titres (sécurité / pertinence pour un enfant). */
const BLOCK = /\b(dead|death|kill|blood|hunt|meat|cage|zoo sign|logo|poster|text|drawing|cartoon|toy|statue|costume|nude|war|gun|weapon)\b/i;

/** « nasa:… » : photo du domaine public tirée de la NASA Image Library (sans clé). */
async function nasaCandidates(q: string): Promise<OvImage[]> {
  const res = await fetch(`https://images-api.nasa.gov/search?q=${encodeURIComponent(q)}&media_type=image&page_size=20`, { signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`NASA HTTP ${res.status}`);
  const items = ((await res.json()) as { collection: { items: { data: { nasa_id: string; title: string; center?: string }[]; links?: { href: string }[] }[] } }).collection.items;
  return items
    .filter((i) => i.links?.[0]?.href && !BLOCK.test(i.data[0].title))
    .map((i) => ({
      id: `nasa-${i.data[0].nasa_id}`,
      title: i.data[0].title,
      creator: `NASA${i.data[0].center ? ' / ' + i.data[0].center : ''}`,
      license: 'pdm',
      license_url: 'https://www.nasa.gov/nasa-brand-center/images-and-media/',
      foreign_landing_url: `https://images.nasa.gov/details/${encodeURIComponent(i.data[0].nasa_id)}`,
      url: i.links![0].href.replace(/~(thumb|small)\.jpg$/i, '~medium.jpg'),
      thumbnail: i.links![0].href,
      width: 1000
    }));
}

async function candidates(v: MiniVideo): Promise<OvImage[]> {
  if (v.query.startsWith('nasa:')) return nasaCandidates(v.query.slice(5));
  if (v.query === 'none') return [];
  const url =
    `https://api.openverse.org/v1/images/?q=${encodeURIComponent(v.query)}` +
    '&license=cc0,pdm,by,by-sa&category=photograph&mature=false&aspect_ratio=wide&size=large,medium&page_size=20';
  const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`Openverse HTTP ${res.status}`);
  const body = (await res.json()) as { results: OvImage[] };
  return body.results.filter((r) => !r.mature && !BLOCK.test(r.title ?? '') && (r.width ?? 0) >= 500);
}

async function download(img: OvImage): Promise<Buffer> {
  // L'image d'origine d'abord (meilleure qualité), sinon la vignette servie par Openverse.
  for (const src of [img.url, img.thumbnail ?? `https://api.openverse.org/v1/images/${img.id}/thumb/`]) {
    try {
      const res = await fetch(src, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(30_000) });
      if (res.ok && (res.headers.get('content-type') ?? '').startsWith('image/')) return Buffer.from(await res.arrayBuffer());
    } catch {
      /* source suivante */
    }
  }
  throw new Error('téléchargement impossible');
}

async function fetchAll() {
  mkdirSync(PENDING, { recursive: true });
  const rejects = readJson<Record<string, string[]>>(REJECTS, {});
  const todo = VIDEOS.filter((v) => !existsSync(path.join(LIVE, `${v.id}.webp`)) && !existsSync(path.join(PENDING, `${v.id}.webp`)));
  let ok = 0;
  for (const v of todo) {
    try {
      const list = (await candidates(v)).filter((c) => !(rejects[v.id] ?? []).includes(c.id));
      let done = false;
      for (const c of list.slice(0, 5)) {
        try {
          const webp = await sharp(await download(c)).rotate().resize(W, H, { fit: 'cover', position: 'attention' }).webp({ quality: 74 }).toBuffer();
          writeFileSync(path.join(PENDING, `${v.id}.webp`), webp);
          const credit: Credit & { openverseId: string } = {
            openverseId: c.id,
            title: (c.title ?? 'Photo').slice(0, 120),
            creator: (c.creator ?? 'auteur inconnu').slice(0, 80),
            license: `CC ${c.license.toUpperCase()}${c.license_version ? ' ' + c.license_version : ''}`.replace('CC CC0', 'CC0').replace('CC PDM', 'Domaine public'),
            licenseUrl: c.license_url ?? '',
            source: c.foreign_landing_url ?? ''
          };
          writeJson(path.join(PENDING, `${v.id}.json`), credit);
          console.log(`✅ ${v.id}  ${v.title} ← « ${credit.title} » (${credit.license})`);
          ok++;
          done = true;
          break;
        } catch {
          /* candidat suivant */
        }
      }
      if (!done) console.error(`❌ ${v.id} : aucune photo utilisable`);
      await new Promise((r) => setTimeout(r, 800)); // politesse envers l'API
    } catch (err) {
      console.error(`❌ ${v.id} : ${err instanceof Error ? err.message : err}`);
    }
  }
  console.log(`\n${ok} photo(s) en attente de relecture → npm run video-images -- review`);
}

async function review() {
  const files = existsSync(PENDING) ? readdirSync(PENDING).filter((f) => f.endsWith('.webp')).sort() : [];
  if (!files.length) return console.log('Aucune photo en attente.');
  const cols = 5, tw = 288, th = 216, lh = 26;
  const out = path.resolve(opt('out') ?? 'video-images-review.jpg');
  const tiles = await Promise.all(
    files.map(async (f, i) => {
      const id = f.replace('.webp', '').replace('video-', '');
      const svg = Buffer.from(`<svg width="${tw}" height="${lh}"><rect width="100%" height="100%" fill="#2b2350"/><text x="8" y="18" font-family="Arial" font-size="15" fill="#fff">${id}</text></svg>`);
      const tile = await sharp({ create: { width: tw, height: th + lh, channels: 3, background: '#fff' } })
        .composite([{ input: await sharp(path.join(PENDING, f)).resize(tw, th).toBuffer(), top: 0, left: 0 }, { input: svg, top: th, left: 0 }])
        .png()
        .toBuffer();
      return { input: tile, left: (i % cols) * tw, top: Math.floor(i / cols) * (th + lh) };
    })
  );
  await sharp({ create: { width: tw * cols, height: (th + lh) * Math.ceil(files.length / cols), channels: 3, background: '#fff' } })
    .composite(tiles)
    .jpeg({ quality: 76 })
    .toFile(out);
  console.log(`🖼️  ${files.length} photo(s) à relire → ${out}`);
}

function publish() {
  const reject = new Set((opt('reject') ?? '').split(',').filter(Boolean));
  const credits = readJson<Record<string, Credit>>(CREDITS, {});
  const rejects = readJson<Record<string, string[]>>(REJECTS, {});
  mkdirSync(LIVE, { recursive: true });
  let ok = 0;
  for (const f of existsSync(PENDING) ? readdirSync(PENDING).filter((x) => x.endsWith('.webp')) : []) {
    const id = f.replace('.webp', '');
    const meta = readJson<Credit & { openverseId: string }>(path.join(PENDING, `${id}.json`), null as never);
    if (reject.has(id)) {
      rejects[id] = [...(rejects[id] ?? []), meta.openverseId];
      console.log(`🗑️  ${id} rejetée (une autre photo sera proposée)`);
    } else {
      renameSync(path.join(PENDING, f), path.join(LIVE, f));
      const { openverseId: _ignored, ...credit } = meta;
      credits[id] = credit;
      ok++;
    }
    rmSync(path.join(PENDING, f), { force: true });
    rmSync(path.join(PENDING, `${id}.json`), { force: true });
  }
  writeJson(CREDITS, Object.fromEntries(Object.entries(credits).sort()));
  writeJson(REJECTS, rejects);
  console.log(`📚 ${ok} publiée(s) — ${Object.keys(credits).length}/${VIDEOS.length} vidéos ont leur photo.`);
}

if (command === 'review') await review();
else if (command === 'publish') publish();
else await fetchAll();
