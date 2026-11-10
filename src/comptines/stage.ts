/**
 * La mise en scène des comptines : une image SVG complète pour chaque instant `t`.
 *
 * Même principe que la chanson vidéo (scripts/chansons/timeline.mjs), mais générique :
 *  - 0 → 2,6 s : carte de titre, Nino et Nina entrent en marchant, Mila attend ;
 *  - chaque ligne chantée : les deux enfants font le geste de la ligne, les objets apparaissent ;
 *  - le cri final : tout le monde fait la fête (étoiles, objets qui dansent) ;
 *  - la fin : carte « Bravo ! ».
 * Le temps vient de l'audio (voix + musique), donc l'image reste synchronisée avec le chant.
 */
import { C, applyPalette, backOut, bob, clamp, easeInOut, easeOut, lerp, mila, nina, nino, seg, smooth, sparkle, star, text, type KidOptions } from '../../scripts/chansons/art.mjs';
import type { Comptine, Geste } from '../data/comptines';
import { decor, objet } from './decor';

export const WIDTH = 1280;
export const HEIGHT = 720;

/** Fenêtres de chant (s) : 4 lignes + le cri final, et la durée totale. */
export interface ComptineTiming {
  duration: number;
  lines: [number, number][];
}

/** Petit hasard stable (même comptine → même mise en scène). */
function seeded(id: string) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return (n: number) => {
    h = Math.imul(h ^ (h >>> 15), 2246822507) ^ n;
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

/** Horaires estimés quand l'audio n'est pas encore fabriqué (≈ débit de la voix). */
export function estimateTiming(c: Comptine): ComptineTiming {
  const lines: [number, number][] = [];
  let cursor = 2.8;
  [...c.lines, c.shout].forEach((l, i) => {
    if (i === 4) cursor += 0.6;
    const d = Math.max(1.1, l.length * 0.075);
    lines.push([cursor, cursor + d]);
    cursor += d + 0.45;
  });
  return { duration: cursor + 3, lines };
}

const blinkAt = (t: number, every: number, phase: number) => {
  const m = (t + phase) % every;
  return m < 0.16 ? 1 - Math.abs((m - 0.08) / 0.08) : 0;
};

type Pose = Pick<KidOptions, 'armL' | 'armR' | 'tilt' | 'mouth' | 'look' | 'walk' | 'scaleY' | 'blink'> & { jump?: number; spin?: number; zzz?: boolean };

/** Le geste d'une ligne, à l'intensité `k` (0 → 1 : entrée et sortie en douceur). */
function gesture(g: Geste, t: number, k: number, side: 1 | -1): Pose {
  const w = Math.sin(t * Math.PI * 2 * 1.6);
  switch (g) {
    case 'tape':
      return { armL: k * (42 + w * 16), armR: -k * (42 + w * 16), tilt: -2 * side * k };
    case 'coucou':
      return side > 0 ? { armR: -k * (150 + Math.sin(t * 11) * 18), armL: 6, tilt: -4 * k } : { armL: k * (150 + Math.sin(t * 11) * 18), armR: -6, tilt: 4 * k };
    case 'bras':
      return { armL: k * (165 + w * 6), armR: -k * (165 + w * 6), scaleY: 1 + 0.03 * k };
    case 'saute': {
      const p = ((t * 1.25) % 1 + 1) % 1;
      return { jump: k * 46 * Math.abs(Math.sin(p * Math.PI)), armL: k * 40, armR: -k * 40, scaleY: 1 - 0.04 * k * (1 - Math.abs(Math.sin(p * Math.PI))) };
    }
    case 'balance':
      return { tilt: k * 10 * Math.sin(t * 3.4), armL: k * (24 + 10 * Math.sin(t * 3.4)), armR: -k * (24 - 10 * Math.sin(t * 3.4)), look: 6 * Math.sin(t * 3.4) };
    case 'montre':
      return side > 0 ? { armR: -k * (96 + Math.sin(t * 5) * 6), look: 10 * k, tilt: -3 * k } : { armL: k * (96 + Math.sin(t * 5) * 6), look: -10 * k, tilt: 3 * k };
    case 'tourne':
      return { spin: k, armL: k * 60, armR: -k * 60 };
    case 'marche':
      return { walk: k, armL: k * 18 * Math.sin(t * 9), armR: k * 18 * Math.sin(t * 9 + Math.PI), tilt: k * 2 * Math.sin(t * 9) };
    case 'etire':
      return { armL: k * (172 + Math.sin(t * 2) * 6), armR: -k * (172 + Math.sin(t * 2) * 6), scaleY: 1 + 0.06 * k * (0.5 + 0.5 * Math.sin(t * 2)), tilt: k * 4 * Math.sin(t * 1.4) };
    case 'dort':
      return { tilt: k * 12 * side, blink: k > 0.5 ? 1 : 0, armL: k * 8, armR: -k * 8, mouth: 'smile', zzz: k > 0.5 };
  }
}

function lineWindow(timing: ComptineTiming, i: number) {
  const [start, end] = timing.lines[i];
  return { start, end };
}

/** Le chant ouvre la bouche par intermittence pendant une ligne. */
function singing(t: number, timing: ComptineTiming) {
  return timing.lines.some(([s, e]) => t > s - 0.15 && t < e + 0.15) && Math.sin(t * 15.1) * Math.sin(t * 7.3) > 0.05;
}

function kidAt(which: 'nino' | 'nina', c: Comptine, timing: ComptineTiming, t: number, homeX: number, enterFrom: number, rand: (n: number) => number) {
  const enter = clamp((t - 0.5) / 2);
  const x = t < 2.5 ? lerp(enterFrom, homeX, easeOut(enter)) : homeX;
  const walking = t > 0.5 && t < 2.5 ? 1 : 0;
  const side: 1 | -1 = homeX > 640 ? 1 : -1;

  let pose: Pose = { armL: 4, armR: -4, tilt: 0, mouth: 'smile', look: 0 };
  // Pendant chaque ligne : le geste de la ligne (montée et descente douces).
  const windows = [...timing.lines.slice(0, 4)];
  windows.forEach(([s, e], i) => {
    const k = seg(t, s - 0.35, s + 0.15) * (1 - seg(t, e + 0.25, e + 0.7));
    if (k > 0.001) pose = { ...pose, ...gesture(c.gestes[i], t, k, side) };
  });
  // Le cri final et la fin : on applaudit et on saute de joie.
  const [fs] = timing.lines[4];
  if (t > fs - 0.3) {
    const k = seg(t, fs - 0.3, fs + 0.1);
    const clap = gesture('tape', t, k, side);
    const hop = Math.abs(Math.sin(((t - fs) * 1.4 + (which === 'nina' ? 0.3 : 0)) * Math.PI)) * 22 * k;
    pose = { ...pose, ...clap, jump: hop, mouth: 'open', blink: 0, zzz: false, spin: 0, walk: 0 };
  }
  if (singing(t, timing) && pose.mouth !== 'sad' && !pose.zzz) pose.mouth = 'open';

  const blink = Math.max(pose.blink ?? 0, blinkAt(t, 3.7 + rand(which === 'nino' ? 1 : 2) * 1.5, which === 'nino' ? 0.4 : 1.9));
  const draw = (which === 'nino' ? nino : nina)({
    x: 0,
    y: 0,
    s: 1,
    armL: pose.armL,
    armR: pose.armR,
    tilt: pose.tilt,
    blink,
    mouth: pose.mouth,
    look: pose.look,
    t: t + (which === 'nina' ? 0.7 : 0),
    walk: walking || pose.walk || 0,
    scaleY: pose.scaleY ?? 1
  });
  const spin = pose.spin ? Math.cos(t * 4.2) : 1;
  const sx = pose.spin ? Math.sign(spin || 1) * Math.max(0.18, Math.abs(spin)) : 1;
  const zzz = pose.zzz
    ? [0, 1, 2].map((i) => {
        const p = ((t * 0.6 + i / 3) % 1 + 1) % 1;
        return text(side * 40 + side * p * 50, -280 - p * 80, 'z', { size: 26 + i * 6, fill: C.inkSoft, opacity: Math.sin(p * Math.PI) });
      }).join('')
    : '';
  return `<g transform="translate(${x.toFixed(1)} ${(642 - (pose.jump ?? 0)).toFixed(1)}) scale(${sx.toFixed(3)} 1)">${draw}</g><g transform="translate(${x.toFixed(1)} 642)">${zzz}</g>`;
}

function milaAt(timing: ComptineTiming, t: number, homeX: number) {
  const [fs] = timing.lines[4];
  let jump = 0;
  let tail = 0;
  let tilt = 0;
  if (t > fs) {
    const p = ((t - fs) % 1.1) / 1.1;
    jump = 30 * Math.abs(Math.sin(p * Math.PI));
    tail = Math.sin(t * 8) * 6;
    tilt = Math.sin(t * 8) * 4;
  } else {
    // elle se balance doucement au rythme de la chanson
    tilt = Math.sin(t * 2.4) * 3;
  }
  return mila({ x: homeX, y: 658, s: 0.95, tail, blink: blinkAt(t, 4.3, 2.2), tilt, t, jump, look: Math.sin(t * 0.7) * 10 });
}

/** Les objets de la ligne en cours : 3 exemplaires qui surgissent et flottent au-dessus des enfants. */
function objetsAt(c: Comptine, timing: ComptineTiming, t: number, rand: (n: number) => number) {
  const out: string[] = [];
  const spots = [
    [220, 300],
    [640, 230],
    [1060, 300],
    [400, 370],
    [880, 370]
  ];
  for (let i = 0; i < 4; i++) {
    const [s, e] = timing.lines[i];
    const name = c.objets[i % c.objets.length];
    const next = i < 3 ? timing.lines[i + 1][0] : timing.lines[4][0];
    for (let k = 0; k < 3; k++) {
      const appear = s + k * 0.3;
      const pIn = seg(t, appear, appear + 0.45, backOut);
      const pOut = 1 - seg(t, next - 0.2, next + 0.25, easeInOut);
      const p = pIn * pOut;
      if (p <= 0.01) continue;
      const [sx, sy] = spots[(i * 2 + k) % spots.length];
      const x = sx + bob(t, 10, 1.3, i + k) + (rand(i * 10 + k) - 0.5) * 60;
      const y = sy + bob(t, 12, 1.9, k * 2.1 + i);
      out.push(objet(name, x, y, 1.15 * p, Math.sin(t * 2 + k) * 10, t));
      void e;
    }
  }
  // Le cri final : tous les objets font la ronde.
  const [fs] = timing.lines[4];
  if (t > fs - 0.2) {
    const p = seg(t, fs - 0.2, fs + 0.5, backOut);
    const n = 8;
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2 + (t - fs) * 0.9;
      const x = 640 + Math.cos(a) * 470;
      const y = 300 + Math.sin(a) * 150;
      out.push(objet(c.objets[k % c.objets.length], x, y, 0.95 * p, Math.sin(t * 3 + k) * 14, t));
    }
    out.push(sparkle(640, 200, 1.4, Math.max(0, Math.sin((t - fs) * 5)) * 0.9));
    out.push(sparkle(360, 380, 1.1, Math.max(0, Math.sin((t - fs) * 4 + 1)) * 0.8));
    out.push(sparkle(940, 360, 1.2, Math.max(0, Math.sin((t - fs) * 4.4 + 2)) * 0.8));
  }
  return out.join('');
}

function camera(timing: ComptineTiming, t: number) {
  const shots = [
    { x: 640, y: 470, s: 1.0 },
    { x: 560, y: 480, s: 1.1 },
    { x: 720, y: 480, s: 1.1 },
    { x: 640, y: 500, s: 1.18 },
    { x: 640, y: 470, s: 1.04 },
    { x: 640, y: 470, s: 1.0 }
  ];
  const cuts = [0, ...timing.lines.map(([s]) => s - 0.2)];
  let idx = 0;
  for (let i = 0; i < cuts.length; i++) if (t >= cuts[i]) idx = i;
  const cur = shots[Math.min(idx, shots.length - 1)];
  const prev = shots[Math.max(0, Math.min(idx - 1, shots.length - 1))];
  const p = idx > 0 ? easeInOut(clamp((t - cuts[idx]) / 0.8)) : 1;
  const s = lerp(prev.s, cur.s, p);
  const cx = lerp(prev.x, cur.x, p);
  const cy = lerp(prev.y, cur.y, p);
  return `translate(${WIDTH / 2} ${HEIGHT / 2}) scale(${s.toFixed(4)}) translate(${(-cx).toFixed(1)} ${(-cy).toFixed(1)})`;
}

function titleCard(c: Comptine, t: number) {
  const p = seg(t, 0.2, 0.75, backOut) * (1 - seg(t, 2.3, 2.8, easeInOut));
  if (p <= 0.01) return '';
  const size = c.title.length > 26 ? 40 : 50;
  return `<g opacity="${p.toFixed(3)}" transform="translate(640 200) scale(${lerp(0.9, 1, p).toFixed(3)})">
    <rect x="-380" y="-100" width="760" height="200" rx="46" fill="${C.white}" opacity="0.95" />
    <rect x="-380" y="-100" width="760" height="200" rx="46" fill="none" stroke="${C.cap}" stroke-width="6" opacity="0.35" />
    ${star(-322, -40, 20, C.sun, 8)}${star(322, 30, 16, C.pink, -12)}
    ${text(0, -26, c.emoji, { size: 54, family: "'Segoe UI Emoji','Apple Color Emoji','Noto Color Emoji',sans-serif" })}
    ${text(0, 38, c.title.replace(/&/g, '&amp;'), { size, fill: C.ink, weight: 700 })}
    ${text(0, 80, 'une comptine de Pulse Kids', { size: 24, fill: C.inkSoft, weight: 400 })}
  </g>`;
}

function lyricBand(c: Comptine, timing: ComptineTiming, t: number) {
  const all = [...c.lines, c.shout];
  const active = timing.lines.findIndex(([s, e]) => t >= s && t <= e + 0.35);
  if (active < 0) return '';
  const { start, end } = lineWindow(timing, active);
  const p = clamp((t - start) / Math.max(0.4, end - start));
  const rise = 1 - seg(t, end + 0.05, end + 0.35, easeOut);
  const yy = 676 + 8 * (1 - rise);
  const size = 38;
  const charW = size * 0.53;
  const space = size * 0.34;
  const words: string[] = [];
  for (const w of all[active].split(' ')) {
    if (/^[!?.,;:»]+$/.test(w) && words.length) words[words.length - 1] += ` ${w}`;
    else words.push(w);
  }
  const widths = words.map((w) => Math.max(charW * w.length, size * 0.9));
  const total = widths.reduce((a, b) => a + b, 0) + space * (words.length - 1);
  const scale = total > 1080 ? 1080 / total : 1;
  let x = 640 - (total * scale) / 2;
  let acc = 0;
  const colored = total * p;
  const parts = words
    .map((w, i) => {
      const wd = widths[i];
      const cx = x + (wd * scale) / 2;
      const sung = acc + wd * 0.55 <= colored;
      acc += wd + space;
      x += (wd + space) * scale;
      return text(cx, yy + 11, w.replace(/&/g, '&amp;').replace(/</g, '&lt;'), { size: size * scale, fill: sung ? C.cap : '#B9AECB', weight: 700 });
    })
    .join('');
  return `<g opacity="${rise.toFixed(3)}">
    <rect x="80" y="${yy - 40}" width="1120" height="72" rx="36" fill="${C.white}" opacity="0.93" />
    ${parts}
  </g>`;
}

function endCard(c: Comptine, timing: ComptineTiming, t: number) {
  const [, fe] = timing.lines[4];
  const p = seg(t, fe + 0.6, fe + 1.2, backOut);
  if (p <= 0.01) return '';
  return `<g opacity="${clamp(p).toFixed(3)}">
    <rect width="1280" height="720" fill="${C.white}" opacity="0.35" />
    <g transform="translate(640 330) scale(${lerp(0.9, 1, clamp(p)).toFixed(3)})">
      <rect x="-340" y="-130" width="680" height="260" rx="48" fill="${C.white}" opacity="0.96" />
      <rect x="-340" y="-130" width="680" height="260" rx="48" fill="none" stroke="${C.green}" stroke-width="6" opacity="0.4" />
      ${star(-262, -62, 22, C.sun, 10)}${star(262, -40, 18, C.pink, -14)}
      ${text(0, -22, 'Bravo !', { size: 84, fill: C.cap, weight: 700 })}
      ${text(0, 44, c.title.replace(/&/g, '&amp;'), { size: 32, fill: C.ink, weight: 400 })}
      ${text(0, 92, 'Pulse Kids · à rechanter avec les gestes', { size: 22, fill: C.inkSoft, weight: 400 })}
    </g>
  </g>`;
}

/** L'image complète de la comptine à l'instant `t`, dans les couleurs du thème. */
export function comptineFrame(c: Comptine, timing: ComptineTiming, t: number, palette: 'fille' | 'garcon' = 'fille'): string {
  applyPalette(palette);
  const rand = seeded(c.id);
  const ninoLeft = rand(3) > 0.5;
  const ninoX = ninoLeft ? 430 : 660;
  const ninaX = ninoLeft ? 660 : 430;
  const milaX = rand(4) > 0.5 ? 880 : 220;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" preserveAspectRatio="xMidYMid slice">
    <g transform="${camera(timing, t)}">
      ${decor(c.decor, t)}
      ${milaAt(timing, t, milaX)}
      ${kidAt('nino', c, timing, t, ninoX, ninoLeft ? -120 : 1400, rand)}
      ${kidAt('nina', c, timing, t, ninaX, ninoLeft ? 1400 : -120, rand)}
      ${objetsAt(c, timing, t, rand)}
    </g>
    ${titleCard(c, t)}
    ${lyricBand(c, timing, t)}
    ${endCard(c, timing, t)}
  </svg>`;
}

