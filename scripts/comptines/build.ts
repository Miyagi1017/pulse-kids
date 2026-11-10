/**
 * Fabrique la bande-son des 100 comptines — 100 % local, sans service en ligne.
 *
 *  1. voix : chaque ligne lue par la voix SAPI française « Hortense » (voices.ps1) ;
 *  2. conversion : 44,1 kHz, timbre un peu plus clair (ffmpeg, comme la chanson vidéo) ;
 *  3. musique : boîte à musique / marimba / ukulélé procéduraux, tempo, tonalité et accords
 *     différents pour chaque comptine (graine = son identifiant) ;
 *  4. mixage voix + musique, puis encodage AAC léger → public/comptines/<id>.m4a ;
 *  5. horaires réels de chaque ligne → src/data/comptinesTimings.json (karaoké et animation).
 *
 * Usage : npx tsx scripts/comptines/build.ts [motif-d-id]   (prérequis : Windows + ffmpeg)
 * Les voix déjà fabriquées sont gardées (cache dans song/comptines/).
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { COMPTINES, type Comptine } from '../../src/data/comptines';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const WORK = join(ROOT, 'song', 'comptines');
const OUT = join(ROOT, 'public', 'comptines');
const TIMINGS = join(ROOT, 'src', 'data', 'comptinesTimings.json');
const SR = 44100;

const only = process.argv[2];
const list = only ? COMPTINES.filter((c) => c.id.includes(only)) : COMPTINES;
const calm = (c: Comptine) => c.decor === 'nuit' || c.gestes.filter((g) => g === 'dort').length >= 2;

/* ------------------------------------------------------------------ */
/* 1–2. Voix                                                          */
/* ------------------------------------------------------------------ */

mkdirSync(WORK, { recursive: true });
mkdirSync(OUT, { recursive: true });
const rawPath = (c: Comptine, i: number) => join(WORK, 'raw', `${c.id}-${i}.wav`);
const voicePath = (c: Comptine, i: number) => join(WORK, 'voice', `${c.id}-${i}.wav`);

const items = list.flatMap((c) =>
  [...c.lines, c.shout].map((text, i) => ({ file: rawPath(c, i), text, rate: i === 4 ? '+0%' : calm(c) ? '-14%' : '-6%' }))
);
writeFileSync(join(WORK, 'lines.json'), JSON.stringify(items), 'utf8');
console.log(`1/4 — voix (${items.length} lignes)`);
console.log(execFileSync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', join(ROOT, 'scripts', 'comptines', 'voices.ps1'), join(WORK, 'lines.json')], { encoding: 'utf8' }).trim());

console.log('2/4 — conversion des voix');
mkdirSync(join(WORK, 'voice'), { recursive: true });
for (const c of list)
  for (let i = 0; i < 5; i++) {
    const out = voicePath(c, i);
    if (existsSync(out)) continue;
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', rawPath(c, i), '-af', 'asetrate=22050*1.10,atempo=0.90909,aresample=44100,silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse', '-ac', '1', '-sample_fmt', 's16', out]);
  }

function readWav(path: string): Float32Array {
  const buf = readFileSync(path);
  let p = 12;
  let data: Buffer | null = null;
  while (p < buf.length) {
    const id = buf.toString('ascii', p, p + 4);
    const size = buf.readUInt32LE(p + 4);
    if (id === 'data') data = buf.subarray(p + 8, p + 8 + size);
    p += 8 + size + (size % 2);
  }
  if (!data) throw new Error(`WAV sans données : ${path}`);
  const out = new Float32Array(data.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = data.readInt16LE(i * 2) / 32768;
  return out;
}

function writeWav(path: string, l: Float32Array, r: Float32Array) {
  const n = l.length;
  const buf = Buffer.alloc(44 + n * 4);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + n * 4, 4);
  buf.write('WAVEfmt ', 8);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 4, 28);
  buf.writeUInt16LE(4, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, l[i])) * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, r[i])) * 32767), 46 + i * 4);
  }
  writeFileSync(path, buf);
}

/* ------------------------------------------------------------------ */
/* 3. Musique procédurale                                              */
/* ------------------------------------------------------------------ */

function rng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h += 0x6d2b79f5;
    let x = Math.imul(h ^ (h >>> 15), 1 | h);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = <T,>(r: () => number, xs: T[]) => xs[Math.floor(r() * xs.length)];
const midi = (m: number) => 440 * 2 ** ((m - 69) / 12);

type Voice = 'boite' | 'marimba' | 'ukulele';

/** Une note (signal mono) selon le timbre choisi. */
function note(kind: Voice, f: number, dur: number, amp: number, r: () => number): Float32Array {
  const n = Math.floor(dur * SR);
  const out = new Float32Array(n);
  if (kind === 'ukulele') {
    // Karplus-Strong : corde pincée
    const period = Math.max(2, Math.round(SR / f));
    const ring = new Float32Array(period);
    for (let i = 0; i < period; i++) ring[i] = r() * 2 - 1;
    let idx = 0;
    for (let i = 0; i < n; i++) {
      const next = (idx + 1) % period;
      const v = 0.5 * (ring[idx] + ring[next]) * 0.994;
      out[i] = ring[idx] * amp * 0.9;
      ring[idx] = v;
      idx = next;
    }
    return out;
  }
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const att = Math.min(1, t / 0.004);
    if (kind === 'boite') {
      const env = Math.exp(-t * 3.6) * att;
      out[i] = amp * env * (Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(2 * Math.PI * 2.01 * f * t) * Math.exp(-t * 2) + 0.09 * Math.sin(2 * Math.PI * 3.03 * f * t) * Math.exp(-t * 3.2));
    } else {
      const env = Math.exp(-t * 6.5) * att;
      out[i] = amp * env * (Math.sin(2 * Math.PI * f * t) + 0.42 * Math.sin(2 * Math.PI * 4 * f * t) * Math.exp(-t * 18) + 0.12 * Math.sin(2 * Math.PI * 9.8 * f * t) * Math.exp(-t * 30));
    }
  }
  return out;
}

function bass(f: number, dur: number, amp: number): Float32Array {
  const n = Math.floor(dur * SR);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    out[i] = amp * Math.exp(-t * 2.4) * Math.min(1, t / 0.012) * (Math.sin(2 * Math.PI * f * t) + 0.18 * Math.sin(4 * Math.PI * f * t));
  }
  return out;
}

function shaker(r: () => number, amp = 0.06): Float32Array {
  const n = Math.floor(0.09 * SR);
  const out = new Float32Array(n);
  let prev = 0;
  for (let i = 0; i < n; i++) {
    const w = r() * 2 - 1;
    out[i] = amp * (w - prev) * Math.exp((-i / n) * 7);
    prev = w;
  }
  return out;
}

function add(L: Float32Array, R: Float32Array, sig: Float32Array, start: number, pan = 0) {
  const i0 = Math.floor(start * SR);
  const gl = Math.sqrt((1 - pan) / 2) * 1.41;
  const gr = Math.sqrt((1 + pan) / 2) * 1.41;
  for (let i = 0; i < sig.length && i0 + i < L.length; i++) {
    if (i0 + i < 0) continue;
    L[i0 + i] += sig[i] * gl;
    R[i0 + i] += sig[i] * gr;
  }
}

const PROGRESSIONS = [
  [0, 5, 3, 4], // I vi IV V
  [0, 3, 4, 0], // I IV V I
  [0, 4, 5, 3], // I V vi IV
  [5, 3, 0, 4], // vi IV I V
  [0, 3, 5, 4] // I IV vi V
];
/** Accords de la gamme majeure (degrés 0 → 6) : fondamentale (demi-tons) + triade. */
const DEGREES = [
  [0, [0, 4, 7]],
  [2, [2, 5, 9]],
  [4, [4, 7, 11]],
  [5, [5, 9, 12]],
  [7, [7, 11, 14]],
  [9, [9, 12, 16]],
  [11, [11, 14, 17]]
] as const;
const PATTERNS = [
  [0, 1, 2, 3, 2, 1, 2, 1],
  [0, 2, 1, 2, 3, 2, 1, 2],
  [0, 1, 2, 1, 3, 1, 2, 1],
  [2, 1, 0, 1, 2, 3, 2, 1]
];

function music(c: Comptine, duration: number) {
  const r = rng(c.id);
  const slow = calm(c);
  const bpm = slow ? pick(r, [80, 84, 88]) : pick(r, [96, 100, 104, 108, 112]);
  const key = 60 + pick(r, [-3, -2, 0, 2, 3, 5]);
  const prog = pick(r, PROGRESSIONS);
  const pattern = pick(r, PATTERNS);
  const kind: Voice = slow ? 'boite' : pick(r, ['boite', 'marimba', 'ukulele', 'marimba'] as Voice[]);
  const N = Math.ceil(duration * SR);
  const L = new Float32Array(N);
  const R = new Float32Array(N);
  const beat = 60 / bpm;
  const bar = 4 * beat;
  const bars = Math.ceil(duration / bar);
  for (let b = 0; b < bars; b++) {
    const t0 = b * bar;
    const last = t0 + bar >= duration - 2.6;
    const [root, triad] = DEGREES[last ? 0 : prog[b % prog.length]];
    const chord = triad.map((x) => key + x);
    add(L, R, bass(midi(key + root - 24), 1.1, slow ? 0.36 : 0.5), t0);
    if (!slow) add(L, R, bass(midi(key + root - 24), 1, 0.3), t0 + 2 * beat);
    const steps = slow ? 4 : 8;
    for (let k = 0; k < steps; k++) {
      const start = t0 + k * (bar / steps);
      if (start >= duration - 2.2) break;
      const pat = pattern[(k * (8 / steps)) % 8];
      let m = chord[pat % 3] + (pat === 3 ? 12 : 0);
      if (kind !== 'ukulele') m += 12;
      let amp = (k % 4 === 0 ? 0.24 : 0.18) * (kind === 'ukulele' ? 0.75 : 1) * (slow ? 0.8 : 1);
      if (b === 0 && k < 4) amp *= 0.55;
      add(L, R, note(kind, midi(m), kind === 'ukulele' ? 1.2 : 1.5, amp, r), start, k % 2 ? 0.25 : -0.25);
    }
    if (!slow) for (let k = 0; k < 2; k++) add(L, R, shaker(r), t0 + beat * (1.5 + k * 2), k ? 0.35 : -0.35);
  }
  // fin : accord tenu, puis fondu
  const end = duration - 2.6;
  [0, 4, 7, 12].forEach((x, k) => add(L, R, note('boite', midi(key + 12 + x), 3, 0.18, r), end + k * 0.06, (k - 1.5) * 0.15));
  const fade = Math.floor((duration - 1.2) * SR);
  for (let i = fade; i < N; i++) {
    const g = 1 - (i - fade) / (N - fade);
    L[i] *= g;
    R[i] *= g;
  }
  // petite réverbération (3 échos adoucis)
  const wetL = new Float32Array(L);
  const wetR = new Float32Array(R);
  for (const [delay, gain] of [
    [0.11, 0.3],
    [0.19, 0.2],
    [0.29, 0.13]
  ] as const) {
    const d = Math.floor(delay * SR);
    for (let i = d; i < N; i++) {
      wetL[i] += gain * L[i - d];
      wetR[i] += gain * R[i - d];
    }
  }
  return { L: wetL, R: wetR, beat, bpm, kind };
}

/* ------------------------------------------------------------------ */
/* 4–5. Placement des lignes, mixage, encodage                        */
/* ------------------------------------------------------------------ */

const timings: Record<string, { duration: number; lines: [number, number][] }> = existsSync(TIMINGS) ? JSON.parse(readFileSync(TIMINGS, 'utf8')) : {};
console.log(`3/4 — musique et mixage (${list.length} comptines)`);
mkdirSync(join(WORK, 'mix'), { recursive: true });

for (const c of list) {
  const voices = [0, 1, 2, 3, 4].map((i) => readWav(voicePath(c, i)));
  // On cale les lignes sur les temps de la musique : départ après la carte de titre.
  const probe = rng(c.id);
  const bpm = calm(c) ? pick(probe, [80, 84, 88]) : pick(probe, [96, 100, 104, 108, 112]);
  const beat = 60 / bpm;
  const lines: [number, number][] = [];
  let cursor = 2.7;
  voices.forEach((v, i) => {
    const gap = i === 4 ? 2 * beat : 0.3;
    const start = Math.ceil((cursor + (i ? gap : 0)) / beat) * beat;
    const d = v.length / SR;
    lines.push([+start.toFixed(3), +(start + d).toFixed(3)]);
    cursor = start + d;
  });
  const duration = +(lines[4][1] + 3.4).toFixed(2);
  const m = music(c, duration);
  if (m.bpm !== bpm) throw new Error('tempo incohérent');
  const N = m.L.length;
  const L = new Float32Array(N);
  const R = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    L[i] = m.L[i] * (calm(c) ? 0.3 : 0.34);
    R[i] = m.R[i] * (calm(c) ? 0.3 : 0.34);
  }
  voices.forEach((v, i) => add(L, R, v.map((x) => x * 0.95) as Float32Array, lines[i][0], 0));
  // limiteur doux + normalisation
  let peak = 0;
  for (let i = 0; i < N; i++) {
    L[i] = Math.tanh(L[i] * 1.05);
    R[i] = Math.tanh(R[i] * 1.05);
    peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  }
  if (peak > 0.92)
    for (let i = 0; i < N; i++) {
      L[i] *= 0.92 / peak;
      R[i] *= 0.92 / peak;
    }
  const wav = join(WORK, 'mix', `${c.id}.wav`);
  writeWav(wav, L, R);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', wav, '-c:a', 'aac', '-b:a', '56k', '-ac', '1', '-movflags', '+faststart', join(OUT, `${c.id}.m4a`)]);
  timings[c.id] = { duration, lines };
  console.log(`  ${c.id} : ${duration.toFixed(1)} s, ${m.bpm} BPM, ${m.kind}`);
}

console.log('4/4 — horaires');
const sorted = Object.fromEntries(COMPTINES.filter((c) => timings[c.id]).map((c) => [c.id, timings[c.id]]));
writeFileSync(TIMINGS, JSON.stringify(sorted) + '\n', 'utf8');
console.log(`Terminé : ${Object.keys(sorted).length} comptines dans public/comptines/`);
