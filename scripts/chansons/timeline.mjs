/**
 * Timeline de « Nino range ses jouets » : 24 secondes, 4 plans, une chanson.
 *
 * `frame(t)` renvoie une image SVG complète à l'instant t (secondes).
 * Aucune dépendance : c'est du texte SVG, rendu ensuite par sharp puis encodé par ffmpeg.
 */
import { readFileSync, existsSync } from 'node:fs';
import { C, nino, nina, mila, room, basket, block, ball, duck, sparkle, star, text, clamp, lerp, smooth, easeInOut, easeOut, backOut, seg, bob } from './art.mjs';

export const WIDTH = 1280;
export const HEIGHT = 720;
export const FPS = 30;
export const DURATION = 24;

/** Les paroles ; `start`/`end` sont ajustés par les durées réelles de la voix si timings.json existe. */
export const LYRICS = [
  { at: 0.9, text: 'Range, range, range les jouets,' },
  { at: 4.9, text: 'Un, deux, trois, dans le panier !' },
  { at: 8.9, text: 'Range, range, range les jouets,' },
  { at: 12.9, text: 'La chambre est toute rangée !' },
  { at: 19.3, text: 'Bravo !' }
];

const timingsPath = 'song/audio/timings.json';
const timings = existsSync(timingsPath) ? JSON.parse(readFileSync(timingsPath, 'utf8')) : null;
if (timings) {
  LYRICS.forEach((l, i) => {
    if (timings[i]) {
      l.start = timings[i].start;
      l.end = timings[i].start + timings[i].duration;
    }
  });
}
const lineWindow = (i) => {
  const l = LYRICS[i];
  const start = l.start ?? l.at;
  const end = l.end ?? start + 3.6;
  return { start, end };
};

/** Clignement à des instants précis (0,16 s). */
function blinkAt(t, moments) {
  for (const m of moments) if (t >= m && t <= m + 0.16) return 1 - Math.abs((t - (m + 0.08)) / 0.08);
  return 0;
}

/** Chant : la bouche s'ouvre par intermittence pendant une ligne. */
function singing(t, windows) {
  return windows.some(({ start, end }) => t > start - 0.2 && t < end + 0.2) && Math.sin(t * 15.1) * Math.sin(t * 7.3) > 0.05;
}

/* ------------------------------------------------------------------ */
/* États des objets                                                   */
/* ------------------------------------------------------------------ */

const BLOCKS = [
  { from: { x: 292, y: 652 }, start: 7.0, land: 7.9, color: C.red, symbol: 'star', rot: -12 },
  { from: { x: 374, y: 668 }, start: 8.2, land: 9.1, color: C.yellow, symbol: 'heart', rot: 18 },
  { from: { x: 456, y: 648 }, start: 9.4, land: 10.3, color: C.blue, symbol: 'dot', rot: -30 }
];

function blockAt(i, t) {
  const b = BLOCKS[i];
  if (t < b.start) return { visible: true, x: b.from.x, y: b.from.y + bob(t, 1.2, 2, i), rot: b.rot };
  if (t < b.land) {
    const p = easeInOut(clamp((t - b.start) / (b.land - b.start)));
    return { visible: true, x: lerp(b.from.x, 1000, p), y: lerp(b.from.y, 544, p) - 210 * Math.sin(Math.PI * p), rot: lerp(b.rot, 220, p), s: lerp(1, 0.7, p) };
  }
  return { visible: false };
}

const BALL = { from: { x: 862, y: 662 }, to: { x: 948, y: 650 } };
function ballAt(t) {
  if (t < 12.7) return { visible: true, x: BALL.from.x, y: BALL.from.y, rot: 0, s: 1 };
  if (t < 15.3) {
    const p = easeOut(clamp((t - 12.7) / (15.3 - 12.7)));
    return {
      visible: true,
      x: lerp(BALL.from.x, BALL.to.x, p),
      y: lerp(BALL.from.y, BALL.to.y, p) - 26 * Math.abs(Math.sin(p * Math.PI * 3)) * (1 - p * 0.4),
      rot: p * 540,
      s: 1
    };
  }
  const shrink = 1 - seg(t, 19.7, 20.3, easeInOut);
  return { visible: shrink > 0.02, x: BALL.to.x, y: BALL.to.y, rot: 540, s: shrink };
}

const DUCK = { from: { x: 556, y: 668 }, start: 15.7, land: 17.0 };
function duckAt(t) {
  const squeak = 15.0 <= t && t <= 16.4 ? Math.sin(t * 30) * 8 : 0;
  if (t < DUCK.start) return { visible: true, x: DUCK.from.x, y: DUCK.from.y + squeak * 0.4, rot: squeak, s: 1 };
  if (t < DUCK.land) {
    const p = easeInOut(clamp((t - DUCK.start) / (DUCK.land - DUCK.start)));
    return { visible: true, x: lerp(DUCK.from.x, 1004, p), y: lerp(DUCK.from.y, 546, p) - 190 * Math.sin(Math.PI * p), rot: lerp(squeak, 260, p), s: lerp(1, 0.6, p) };
  }
  return { visible: false };
}

/* ------------------------------------------------------------------ */
/* Caméra                                                             */
/* ------------------------------------------------------------------ */

function camera(t) {
  const shot = t < 6 ? 0 : t < 12 ? 1 : t < 18 ? 2 : 3;
  const focus = [
    { x: 640, y: 515, s: 1.14 },
    { x: 630, y: 520, s: 1.2 },
    { x: 820, y: 545, s: 1.3 },
    { x: 640, y: 515, s: 1.14 }
  ][shot];
  // transition douce de 0,55 s au début de chaque plan
  const prev = shot > 0 ? [{ x: 640, y: 515, s: 1.14 }, { x: 630, y: 520, s: 1.2 }, { x: 820, y: 545, s: 1.3 }][shot - 1] : focus;
  const p = shot > 0 ? easeInOut(clamp((t - [6, 12, 18][shot - 1]) / 0.55)) : 1;
  const s = lerp(prev.s, focus.s, p);
  const cx = lerp(prev.x, focus.x, p);
  const cy = lerp(prev.y, focus.y, p);
  return `translate(${WIDTH / 2} ${HEIGHT / 2}) scale(${s.toFixed(4)}) translate(${-cx} ${-cy})`;
}

/* ------------------------------------------------------------------ */
/* Personnages                                                        */
/* ------------------------------------------------------------------ */

function ninoAt(t) {
  // entrée en marchant (0,6 → 3,2)
  const walkP = clamp((t - 2.4) / 2.2);
  const x = t < 4.6 ? lerp(1320, 430, easeOut(walkP)) : 430;
  const walking = t > 2.4 && t < 4.6 ? 1 : 0;

  let armL = 4;
  let armR = -4;
  let tilt = 0;
  let mouth = 'smile';
  let look = 0;
  let scaleY = 1;

  // il regarde le désordre et soupire
  if (t > 3.4 && t < 4.6) {
    tilt = 5 * smooth((t - 3.4) / 0.4) * (1 - smooth((t - 4.4) / 0.3));
    mouth = t < 4.5 ? 'sad' : 'smile';
    look = -6;
  }

  // il ramasse les deux premiers cubes
  const grabs = [7.0, 8.2];
  for (const g of grabs) {
    if (t > g - 0.35 && t < g + 0.3) {
      const p = Math.sin(((t - (g - 0.35)) / 0.65) * Math.PI);
      armR = -70 * p;
      tilt = 6 * p;
      scaleY = 1 - 0.05 * p;
      look = 8;
    }
  }

  // il rit quand Mila joue
  if (t > 13 && t < 15.6) {
    mouth = 'open';
    tilt = -3;
    armL = 26;
    armR = 18;
  }

  // il attrape le canard
  if (t > 15.3 && t < 17.0) {
    const p = Math.sin(clamp((t - 15.3) / 1.0) * Math.PI);
    armR = -78 * p;
    tilt = 5 * p;
    look = -10;
    mouth = 'smile';
  }

  // applaudissements
  if (t > 17.8 && t < 22) {
    const clap = Math.sin((t - 17.8) * Math.PI * 2 * 1.6);
    armL = 42 + clap * 16;
    armR = -42 - clap * 16;
    mouth = 'open';
    tilt = -2;
  }

  const singingNow = singing(t, [lineWindow(0), lineWindow(1), lineWindow(2), lineWindow(3), lineWindow(4)]);
  if (singingNow && mouth === 'smile') mouth = 'open';

  const blink = blinkAt(t, [2.1, 5.6, 9.9, 12.6, 16.4, 21.3]);
  return nino({ x, y: 642, s: 1, armL, armR, tilt, blink, mouth, look, t, walk: walking, scaleY });
}

function milaAt(t) {
  let tail = 0;
  let jump = 0;
  let tilt = 0;
  let look = 0;

  // elle suit le ballon du regard
  if (t > 12.6 && t < 15.4) look = 10;

  // elle donne un coup de patte (13,0) puis saute de joie
  if (t > 13.0 && t < 13.8) tilt = -8;
  if (t > 14.4 && t < 15.0) jump = 26 * Math.sin(((t - 14.4) / 0.6) * Math.PI);

  // sauts de joie à la fin
  if (t > 18.4 && t < 21.6) {
    const p = ((t - 18.4) % 1.15) / 1.15;
    jump = 34 * Math.abs(Math.sin(p * Math.PI));
    tail = Math.sin(t * 8) * 6;
    tilt = Math.sin(t * 8) * 4;
  }

  const blink = blinkAt(t, [1.6, 6.2, 11.4, 16.8, 20.6]);
  return mila({ x: 780, y: 658, s: 1, tail, blink, tilt, t, jump, look });
}

/** Nina : elle entre par la gauche, prend le troisième cube et le canard, et applaudit à la fin. */
function ninaAt(t) {
  const walkP = clamp((t - 3.0) / 2.0);
  const x = t < 5.0 ? lerp(-90, 610, easeOut(walkP)) : 610;
  const walking = t > 3.0 && t < 5.0 ? 1 : 0;

  let armL = 4;
  let armR = -4;
  let tilt = 0;
  let mouth = 'smile';
  let look = 0;
  let scaleY = 1;

  // elle découvre le désordre
  if (t > 5.0 && t < 6.2) {
    tilt = 6 * smooth((t - 5.0) / 0.4) * (1 - smooth((t - 6.0) / 0.3));
    mouth = t < 6.0 ? 'sad' : 'smile';
    look = 6;
  }

  // elle ramasse le cube bleu (9,4 s)
  if (t > 9.05 && t < 9.75) {
    const p = Math.sin(((t - 9.05) / 0.7) * Math.PI);
    armL = 62 * p;
    tilt = -6 * p;
    look = -8;
    scaleY = 1 - 0.05 * p;
  }

  // elle rit quand Mila joue
  if (t > 13 && t < 15.6) {
    mouth = 'open';
    tilt = 3;
    armL = 22;
    armR = -18;
  }

  // elle attrape le canard
  if (t > 15.4 && t < 17.1) {
    const p = Math.sin(clamp((t - 15.4) / 1.0) * Math.PI);
    armL = 64 * p;
    tilt = -5 * p;
    look = -10;
    mouth = 'smile';
  }

  // applaudissements
  if (t > 17.8 && t < 22) {
    const clap = Math.sin((t - 17.8) * Math.PI * 2 * 1.6);
    armL = 42 + clap * 16;
    armR = -42 - clap * 16;
    mouth = 'open';
    tilt = 2;
  }

  const singingNow = singing(t, [lineWindow(0), lineWindow(1), lineWindow(2), lineWindow(3), lineWindow(4)]);
  if (singingNow && mouth === 'smile') mouth = 'open';

  const blink = blinkAt(t, [2.9, 6.4, 11.2, 14.6, 20.2]);
  return nina({ x, y: 642, s: 1, armL, armR, tilt, blink, mouth, look, t, walk: walking, scaleY });
}

/* ------------------------------------------------------------------ */
/* Habillage écran                                                    */
/* ------------------------------------------------------------------ */

function titleCard(t) {
  const pIn = seg(t, 0.35, 0.9, backOut);
  const pOut = 1 - seg(t, 2.5, 3.0, easeInOut);
  const p = pIn * pOut;
  if (p <= 0.01) return '';
  return `<g opacity="${p.toFixed(3)}" transform="translate(640 210) scale(${lerp(0.9, 1, p).toFixed(3)})">
    <rect x="-330" y="-96" width="660" height="192" rx="44" fill="${C.white}" opacity="0.94" />
    <rect x="-330" y="-96" width="660" height="192" rx="44" fill="none" stroke="${C.cap}" stroke-width="6" opacity="0.35" />
    ${star(-262, -18, 20, C.sun, 8)}
    ${star(262, 6, 16, C.pink, -12)}
    ${text(0, -18, 'Nino et Nina rangent', { size: 50, fill: C.ink, weight: 700 })}
    ${text(0, 44, 'une petite chanson de Pulse Kids', { size: 28, fill: C.inkSoft, weight: 400 })}
  </g>`;
}

function lyricBand(t) {
  const active = LYRICS.findIndex((l, i) => {
    const w = lineWindow(i);
    return t >= w.start && t <= w.end + 0.35;
  });
  if (active < 0) return '';
  const w = lineWindow(active);
  const p = clamp((t - w.start) / Math.max(0.4, w.end - w.start));
  const rise = 1 - seg(t, w.end + 0.05, w.end + 0.35, easeOut);
  const line = LYRICS[active];
  const yy = 650 + 8 * (1 - rise);

  // Karaoké mot par mot (pas de clip : plus robuste d'un moteur SVG à l'autre)
  const size = 44;
  const charW = size * 0.53;
  const space = size * 0.34;
  const raw = line.text.split(' ');
  const words = [];
  for (const wo of raw) {
    if (/^[!?.,;:]+$/.test(wo) && words.length) words[words.length - 1] += `\u00A0${wo}`;
    else words.push(wo);
  }
  const widths = words.map((wo) => Math.max(charW * wo.length, size * 0.9));
  const total = widths.reduce((a, b) => a + b, 0) + space * (words.length - 1);
  const colored = total * p;
  let x = 640 - total / 2;
  let acc = 0;
  const parts = words
    .map((wo, i) => {
      const wd = widths[i];
      const cx = x + wd / 2;
      const sung = acc + wd * 0.55 <= colored;
      const fill = sung ? C.cap : '#B9AECB';
      acc += wd + space;
      x += wd + space;
      return text(cx, yy + 12, wo, { size, fill, weight: 700 });
    })
    .join('');

  return `<g opacity="${rise.toFixed(3)}">
    <rect x="150" y="${yy - 46}" width="980" height="84" rx="42" fill="${C.white}" opacity="0.92" />
    <rect x="150" y="${yy - 46}" width="980" height="84" rx="42" fill="none" stroke="${C.ink}" stroke-width="2" opacity="0.06" />
    ${parts}
  </g>`;
}

function endCard(t) {
  const p = seg(t, 21.0, 21.6, backOut);
  if (p <= 0.01) return '';
  return `<g opacity="${p.toFixed(3)}">
    <rect width="1280" height="720" fill="${C.wall}" opacity="0.55" />
    <g transform="translate(640 340) scale(${lerp(0.9, 1, p).toFixed(3)})">
      <rect x="-330" y="-140" width="660" height="280" rx="48" fill="${C.white}" opacity="0.96" />
      <rect x="-330" y="-140" width="660" height="280" rx="48" fill="none" stroke="${C.green}" stroke-width="6" opacity="0.4" />
      ${star(-250, -70, 22, C.sun, 10)}
      ${star(250, -46, 18, C.pink, -14)}
      ${text(0, -30, 'Bravo !', { size: 88, fill: C.cap, weight: 700 })}
      ${text(0, 40, 'La chambre est toute rangée.', { size: 34, fill: C.ink, weight: 400 })}
      ${text(0, 96, 'Pulse Kids · à chanter à deux', { size: 24, fill: C.inkSoft, weight: 400 })}
    </g>
  </g>`;
}

/* ------------------------------------------------------------------ */
/* Image                                                              */
/* ------------------------------------------------------------------ */

export function frame(t) {
  const b = blockAt(0, t);
  const b2 = blockAt(1, t);
  const b3 = blockAt(2, t);
  const ba = ballAt(t);
  const du = duckAt(t);

  const fill = t >= 10.3 ? 1 : 0;
  const fillCount = (t >= 7.9 ? 1 : 0) + (t >= 9.1 ? 1 : 0) + (t >= 10.3 ? 1 : 0) + (t >= 17.0 ? 1 : 0);

  const tidiness = t < 7 ? 0 : t < 10.3 ? 0.35 : t < 17 ? 0.8 : 1;
  const joy = t > 17.6 ? 1 : 0;

  const toys = [
    b.visible ? block({ x: b.x, y: b.y, s: (b.s ?? 1) * 1.15, rot: b.rot, color: BLOCKS[0].color, symbol: BLOCKS[0].symbol }) : '',
    b2.visible ? block({ x: b2.x, y: b2.y, s: (b2.s ?? 1) * 1.15, rot: b2.rot, color: BLOCKS[1].color, symbol: BLOCKS[1].symbol }) : '',
    b3.visible ? block({ x: b3.x, y: b3.y, s: (b3.s ?? 1) * 1.15, rot: b3.rot, color: BLOCKS[2].color, symbol: BLOCKS[2].symbol }) : '',
    ba.visible ? ball({ x: ba.x, y: ba.y, s: ba.s * 1.15, rot: ba.rot }) : '',
    du.visible ? duck({ x: du.x, y: du.y, s: (du.s ?? 1) * 1.15, rot: du.rot }) : ''
  ].join('');

  const sparkles = [
    t > 7.6 ? sparkle(1000, 500, 1.2, Math.max(0, Math.sin((t - 7.6) * 6)) * 0.9) : '',
    t > 17.4 ? sparkle(520, 360, 1.3, Math.max(0, Math.sin((t - 17.4) * 5)) * 0.9) : '',
    t > 18.4 ? sparkle(880, 430, 1, Math.max(0, Math.sin((t - 18.4) * 4.2)) * 0.8) : '',
    t > 19 ? sparkle(300, 450, 0.9, Math.max(0, Math.sin((t - 19) * 3.6)) * 0.7) : ''
  ].join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
    <g transform="${camera(t)}">
      ${room({ tidy: tidiness, t })}
      ${basket({ x: 1000, y: 622, s: 1.05, fill: fillCount, wobble: t > 7.9 && t < 8.4 ? Math.sin((t - 7.9) * 30) * 2 : 0 })}
      ${toys}
      ${milaAt(t)}
      ${ninoAt(t)}
      ${ninaAt(t)}
      ${sparkles}
    </g>
    ${titleCard(t)}
    ${endCard(t)}
    <text x="26" y="36" font-family="'Segoe UI', sans-serif" font-size="15" fill="${C.inkSoft}" text-anchor="start" opacity="0.5">Pulse Kids</text>
  </svg>`;
}
