/**
 * 🖍️ « Léo et la Lune qui bâillait » — style Crayon Picture Book.
 * Une page de livre qui se dessine sous nos yeux : la maison et la Lune au crayon de cire,
 * puis la nuit tombe en un lavis bleu qui fait apparaître les étoiles dessinées à la craie blanche
 * (réserve à la cire). L'enfant touche la Lune pour la bercer ; elle s'endort en fin croissant.
 */
import { loop, type FilmAudio } from './audio';
import { H, W, clamp, easeInOut, easeOut, hash, lerp, onTwos, span, spring, type Film, type FilmScene, type FrameState } from './engine';
import { RES, arc, blob, bookText, canvas, clear, ctx2d, fill, line, makePaper, path, waxify, type Pt } from './crayon';

/* Boîte de crayons (une douzaine, jamais plus) — trait indigo, jamais noir. */
const C = {
  ink: '#2e2a6b',
  moon: '#f1cf5e',
  moonDeep: '#e3a93c',
  pyjama: '#7fb0e6',
  skin: '#f4c39d',
  cheek: '#ef7f98',
  hair: '#7a4a2a',
  roof: '#c8553d',
  wall: '#eab06a',
  lemon: '#f7e070',
  door: '#8a5a3c',
  grass: '#5d9e4f',
  doudou: '#e6c9a0',
  white: '#ffffff'
};

const MOON = { x: 300, y: 150, r: 62 };
const GROUND = 438;

/** État de l'action à partir du temps (un seul endroit pour toutes les courbes). */
function story(s: FrameState) {
  const at = (b: number, t0: number, t1: number) => (s.beat > b ? 1 : s.beat < b ? 0 : span(s.bt, t0, t1));
  const inBeat = (b: number) => s.beat === b;
  const yawn = inBeat(1) ? Math.min(easeOut(span(s.bt, 0.2, 1.1)), 1 - easeInOut(span(s.bt, 2.4, 3.2))) : 0;
  const climb = at(2, 0.3, 3.4);
  const sing = s.beat === 3 || (s.beat === 4 && s.sinceTap !== null);
  const rock = s.beat === 4 ? (s.sinceTap !== null ? Math.sin(s.sinceTap * 4.2) * 0.2 * Math.exp(-s.sinceTap * 0.7) : Math.sin(s.t * 2) * 0.03) : 0;
  const lidL = s.beat > 5 ? 1 : inBeat(5) ? Math.max(0.45, easeOut(span(s.bt, 0.4, 0.9))) : s.beat === 4 && s.sinceTap !== null ? 0.45 * span(s.sinceTap, 0.6, 1.4) : 0;
  const lidR = s.beat > 5 ? 1 : inBeat(5) ? Math.max(0.45 * (s.beat === 5 ? 1 : 0), easeOut(span(s.bt, 1.6, 2.1))) : s.beat === 4 && s.sinceTap !== null ? 0.45 * span(s.sinceTap, 0.6, 1.4) : 0;
  const crescent = s.beat > 6 || s.end !== null ? 1 : inBeat(6) ? easeInOut(span(s.bt, 0.3, 3)) : 0;
  return {
    house: at(0, 0.3, 2.4),
    houseFill: at(0, 1.6, 3.2),
    moonLine: at(0, 1.0, 2.0),
    moonFill: at(0, 2.0, 3.0),
    wash: at(0, 2.6, 5.4),
    yawn,
    climb,
    sing,
    rock,
    lidL: Math.min(1, lidL),
    lidR: Math.min(1, lidR),
    crescent,
    calm: s.beat >= 5 ? 0.5 : 1
  };
}

/* ───────────── Décor ───────────── */

const HILLS: Pt[] = Array.from({ length: 25 }, (_, i) => {
  const x = -10 + i * 41;
  return [x, GROUND - 18 - Math.sin(i * 0.55) * 14 - Math.sin(i * 1.7) * 4];
});
const STARS: Pt[] = Array.from({ length: 22 }, (_, i) => [40 + hash(i, 1) * 880, 30 + hash(i, 2) * 260] as Pt).filter(([x, y]) => Math.hypot(x - MOON.x, y - MOON.y) > MOON.r + 30 && !(x > 520 && y > 220));

const FRONT: Pt[] = [
  [540, 332],
  [700, 332],
  [700, GROUND - 4],
  [540, GROUND - 4]
];
const GABLE: Pt[] = [
  [530, 336],
  [620, 252],
  [710, 336]
];
const SIDE: Pt[] = [
  [700, 332],
  [800, 314],
  [800, GROUND - 22],
  [700, GROUND - 4]
];
const SIDE_ROOF: Pt[] = [
  [620, 252],
  [722, 232],
  [812, 316],
  [710, 336]
];
const WINDOW: Pt[] = [
  [565, 352],
  [612, 352],
  [612, 392],
  [565, 392]
];
const DOOR: Pt[] = [
  [640, 370],
  [680, 370],
  [680, GROUND - 4],
  [640, GROUND - 4]
];
const LADDER_L: Pt[] = [
  [497, GROUND],
  [548, 300]
];
const LADDER_R: Pt[] = [
  [520, GROUND + 4],
  [570, 305]
];

function drawDecor(L: CanvasRenderingContext2D, F: CanvasRenderingContext2D, st: ReturnType<typeof story>, boil: number) {
  const lb = boil; // bouillonnement des traits du fond (≈ 0,6)
  // Collines et herbe (coloriage fixe, jamais de bouillonnement dans les fonds).
  if (st.houseFill > 0) {
    fill(F, [...HILLS, [W + 10, GROUND + 14], [-10, GROUND + 14]], { color: C.grass, seed: 3, boil: 0, progress: st.houseFill, angle: -0.2 });
    fill(F, FRONT, { color: C.wall, seed: 4, boil: 0, progress: st.houseFill, cross: true });
    fill(F, SIDE, { color: C.wall, seed: 5, boil: 0, progress: st.houseFill, angle: 0.6 });
    fill(F, GABLE, { color: C.roof, seed: 6, boil: 0, progress: st.houseFill });
    fill(F, SIDE_ROOF, { color: C.roof, seed: 7, boil: 0, progress: st.houseFill, cross: true });
    fill(F, WINDOW, { color: C.lemon, seed: 8, boil: 0, progress: st.houseFill, overshoot: 1.5 });
    fill(F, DOOR, { color: C.door, seed: 9, boil: 0, progress: st.houseFill });
  }
  const w = 0.6;
  line(L, HILLS, { color: C.grass, width: 3.2, seed: 20, boil: lb, wobble: w, reveal: st.house });
  line(L, FRONT, { color: C.ink, width: 3.4, seed: 21, boil: lb, wobble: w, reveal: st.house, closed: true });
  line(L, GABLE, { color: C.ink, width: 3.4, seed: 22, boil: lb, wobble: w, reveal: st.house });
  line(L, SIDE, { color: C.ink, width: 3.2, seed: 23, boil: lb, wobble: w, reveal: st.house, closed: true });
  line(L, SIDE_ROOF, { color: C.ink, width: 3.2, seed: 24, boil: lb, wobble: w, reveal: st.house, closed: true });
  line(L, WINDOW, { color: C.ink, width: 2.6, seed: 25, boil: lb, wobble: w, reveal: st.house, closed: true });
  line(L, [[588, 352], [588, 392]], { color: C.ink, width: 2, seed: 26, boil: lb, wobble: w, reveal: st.house });
  line(L, DOOR, { color: C.ink, width: 2.6, seed: 27, boil: lb, wobble: w, reveal: st.house });
  // Échelle (Léo y monte).
  line(L, LADDER_L, { color: C.door, width: 3, seed: 28, boil: lb, wobble: w, reveal: st.house });
  line(L, LADDER_R, { color: C.door, width: 3, seed: 29, boil: lb, wobble: w, reveal: st.house });
  for (let i = 1; i < 6; i++) {
    const u = i / 6;
    const a: Pt = [lerp(LADDER_L[0][0], LADDER_L[1][0], u), lerp(LADDER_L[0][1], LADDER_L[1][1], u)];
    const b: Pt = [lerp(LADDER_R[0][0], LADDER_R[1][0], u), lerp(LADDER_R[0][1], LADDER_R[1][1], u)];
    line(L, [a, b], { color: C.door, width: 2.4, seed: 30 + i, boil: lb, wobble: w, reveal: clamp(st.house * 1.4 - u * 0.4) });
  }
  // Étoiles à la craie blanche : invisibles sur le papier, révélées par le lavis (réserve à la cire).
  STARS.forEach(([x, y], i) => {
    const r = 4 + hash(i, 5) * 4;
    line(L, [[x - r, y], [x + r, y]], { color: C.white, width: 3.2, seed: 60 + i, boil: lb, wobble: 0.4 });
    line(L, [[x, y - r], [x, y + r]], { color: C.white, width: 3.2, seed: 90 + i, boil: lb, wobble: 0.4 });
  });
}

/* ───────────── Personnages ───────────── */

/** Découpe de la Lune : disque, moins le disque d'ombre qui avance pour faire le croissant. */
function moonClip(g: CanvasRenderingContext2D, crescent: number, grow = 0) {
  const { x, y, r } = MOON;
  g.beginPath();
  g.arc(x, y, r + grow, 0, Math.PI * 2);
  g.clip();
  if (crescent > 0) {
    const d = lerp(r * 2.2, r * 0.5, crescent);
    g.beginPath();
    g.rect(0, 0, W, H);
    g.arc(x + d, y - d * 0.32, r * 0.98, 0, Math.PI * 2);
    g.clip('evenodd');
  }
}

function withMoon(g: CanvasRenderingContext2D, rock: number, fn: () => void) {
  g.save();
  g.translate(MOON.x, MOON.y);
  g.rotate(rock);
  g.translate(-MOON.x, -MOON.y);
  fn();
  g.restore();
}

function drawMoon(L: CanvasRenderingContext2D, F: CanvasRenderingContext2D, st: ReturnType<typeof story>, boil: number) {
  const { x, y, r } = MOON;
  const wob = st.calm;
  const stretch = 1 + st.yawn * 0.06;
  const outline = blob(x, y, r, r * stretch, 5, 32, 0.02);
  withMoon(F, st.rock, () => {
    F.save();
    moonClip(F, st.crescent, 3);
    fill(F, outline, { color: C.moon, seed: 40, boil: 0, progress: st.moonFill, cross: true, gap: 4 });
    // Un peu de jaune plus profond en bas : la valeur vient de la pression, pas d'une autre teinte.
    fill(F, blob(x - 6, y + 22, r * 0.7, r * 0.42, 6), { color: C.moonDeep, seed: 41, boil: 0, progress: st.moonFill, gap: 6 });
    F.restore();
    F.save();
    moonClip(F, st.crescent);
    if (st.crescent < 0.35) {
      // Joues roses.
      fill(F, blob(x - 32, y + 14, 9, 6, 7), { color: C.cheek, seed: 42, boil, progress: st.moonFill });
      fill(F, blob(x + 30, y + 14, 9, 6, 8), { color: C.cheek, seed: 43, boil, progress: st.moonFill });
      if (st.yawn > 0.05) fill(F, blob(x, y + 26, 10 * st.yawn + 2, 13 * st.yawn + 2, 9), { color: '#7b3b5a', seed: 44, boil, progress: 1 });
    } else fill(F, blob(x - r * 0.62, y + 16, 7, 5, 7), { color: C.cheek, seed: 45, boil, progress: 1 });
    F.restore();
  });
  withMoon(L, st.rock, () => {
    L.save();
    moonClip(L, st.crescent, 4);
    line(L, outline, { color: C.ink, width: 3.6, seed: 46, boil, wobble: wob, reveal: st.moonLine, closed: true });
    if (st.crescent > 0) {
      const d = lerp(r * 2.2, r * 0.5, st.crescent);
      line(L, blob(x + d, y - d * 0.32, r * 0.98, r * 0.98, 11, 40, 0.01), { color: C.ink, width: 3.2, seed: 47, boil, wobble: wob, closed: true });
    }
    L.restore();
    if (st.moonLine < 1) return;
    L.save();
    moonClip(L, st.crescent);
    if (st.crescent < 0.35) {
      eye(L, x - 22, y - 8, st.lidL, boil, wob, 48, s_look(boil));
      eye(L, x + 20, y - 8, st.lidR, boil, wob, 49, s_look(boil));
      if (st.yawn > 0.05) line(L, blob(x, y + 26, 10 * st.yawn + 2, 13 * st.yawn + 2, 9), { color: C.ink, width: 2.6, seed: 50, boil, wobble: wob, closed: true });
      else line(L, arc(x, y + 14, 14, 0.35, Math.PI - 0.35), { color: C.ink, width: 2.6, seed: 51, boil, wobble: wob });
    } else {
      // Profil endormi sur le croissant : un œil fermé et un petit sourire.
      eye(L, x - r * 0.55, y - 6, 1, boil, wob, 52, 0);
      line(L, arc(x - r * 0.58, y + 18, 9, 0.4, Math.PI - 0.6), { color: C.ink, width: 2.4, seed: 53, boil, wobble: wob });
    }
    L.restore();
  });
}

/** La Lune qui n'arrive pas à dormir regarde à droite, à gauche… (sur les deux). */
function s_look(boil: number) {
  return Math.round(Math.sin(boil * 0.35)) * 3;
}

function eye(L: CanvasRenderingContext2D, x: number, y: number, lid: number, boil: number, wob: number, seed: number, look: number) {
  if (lid >= 0.95) {
    line(L, arc(x, y - 2, 8, 0.25, Math.PI - 0.25), { color: C.ink, width: 2.8, seed, boil, wobble: wob });
    return;
  }
  const r = 4.6;
  L.fillStyle = C.ink;
  L.beginPath();
  L.ellipse(x + look, y + lid * 3, r, r * (1 - lid * 0.6), 0, 0, Math.PI * 2);
  L.fill();
  L.fillStyle = C.white;
  L.beginPath();
  L.arc(x + look + 1.6, y - 1.6 + lid * 3, 1.5, 0, Math.PI * 2);
  L.fill();
  if (lid > 0.1) line(L, [[x - 7, y - 4 + lid * 4], [x + 7, y - 4 + lid * 4]], { color: C.ink, width: 2.6, seed: seed + 3, boil, wobble: wob });
}

type Pose = 'stand' | 'climb1' | 'climb2' | 'roof' | 'sit';

/** Où est Léo et dans quelle pose : une nouvelle pose par temps, un dessin d'enfant ne s'intercale pas. */
function leoAt(climb: number, beat: number): { x: number; y: number; pose: Pose } {
  if (beat < 2) return { x: 470, y: GROUND, pose: 'stand' };
  const keys: { x: number; y: number; pose: Pose }[] = [
    { x: 470, y: GROUND, pose: 'stand' },
    { x: 515, y: 392, pose: 'climb1' },
    { x: 532, y: 352, pose: 'climb2' },
    { x: 560, y: 310, pose: 'climb1' },
    { x: 610, y: 268, pose: 'roof' },
    { x: 668, y: 258, pose: 'sit' }
  ];
  return keys[Math.min(keys.length - 1, Math.floor(climb * (keys.length - 0.01)))];
}

function leoShape(x: number, y: number, pose: Pose) {
  const sit = pose === 'sit';
  const head: Pt = sit ? [x, y - 44] : [x, y - 56];
  const torsoTop = sit ? y - 30 : y - 42;
  const torsoBot = sit ? y - 6 : y - 16;
  const torso: Pt[] = [
    [x - 11, torsoTop],
    [x + 11, torsoTop],
    [x + 13, torsoBot],
    [x - 13, torsoBot]
  ];
  let legs: [Pt, Pt][];
  let arms: [Pt, Pt][];
  if (sit) {
    legs = [
      [[x - 6, torsoBot], [x + 14, y + 4]],
      [[x + 5, torsoBot], [x + 24, y + 2]]
    ];
    arms = [
      [[x - 10, torsoTop + 5], [x - 18, torsoTop + 20]],
      [[x + 10, torsoTop + 5], [x + 20, torsoTop + 16]]
    ];
  } else if (pose === 'climb1' || pose === 'climb2') {
    const up = pose === 'climb1' ? 1 : -1;
    legs = [
      [[x - 6, torsoBot], [x - 9, y - 4 * up]],
      [[x + 6, torsoBot], [x + 8, y + 4 * up]]
    ];
    arms = [
      [[x - 10, torsoTop + 4], [x - 12 + 6, torsoTop - 18 - 6 * up]],
      [[x + 10, torsoTop + 4], [x + 14, torsoTop - 16 + 6 * up]]
    ];
  } else {
    legs = [
      [[x - 6, torsoBot], [x - 7, y]],
      [[x + 6, torsoBot], [x + 7, y]]
    ];
    arms = [
      [[x - 11, torsoTop + 4], [x - 18, torsoTop + 22]],
      [[x + 11, torsoTop + 4], [x + 19, torsoTop + 20]]
    ];
  }
  return { head, torso, legs, arms, doudouAt: (sit ? [x - 20, torsoTop + 20] : arms[0][1]) as Pt };
}

/** Léo est dessiné un peu plus grand que nature : chez un enfant, les gens sont plus grands que les portes. */
const LEO_SCALE = 1.3;

function scaled(g: CanvasRenderingContext2D, x: number, y: number, fn: () => void) {
  g.save();
  g.translate(x, y);
  g.scale(LEO_SCALE, LEO_SCALE);
  g.translate(-x, -y);
  fn();
  g.restore();
}

function drawLeo(L: CanvasRenderingContext2D, F: CanvasRenderingContext2D, x: number, y: number, pose: Pose, boil: number, mouthOpen: boolean, wob: number) {
  scaled(L, x, y, () => scaled(F, x, y, () => drawLeoAt(L, F, x, y, pose, boil, mouthOpen, wob)));
}

function drawLeoAt(L: CanvasRenderingContext2D, F: CanvasRenderingContext2D, x: number, y: number, pose: Pose, boil: number, mouthOpen: boolean, wob: number) {
  const sh = leoShape(x, y, pose);
  const [hx, hy] = sh.head;
  // Coloriage (débordement, jamais parfaitement dans les traits).
  fill(F, sh.torso, { color: C.pyjama, seed: 70, boil, gap: 3.6 });
  for (const [a, b] of [...sh.legs, ...sh.arms]) line(F, [a, b], { color: C.pyjama, width: 7, seed: 71, boil, wobble: wob * 0.6 });
  fill(F, blob(hx, hy, 15, 15, 12), { color: C.skin, seed: 72, boil, gap: 3.4 });
  fill(F, [...arc(hx, hy - 2, 16, Math.PI * 1.02, Math.PI * 1.98, 8), [hx + 14, hy - 10], [hx - 14, hy - 10]], { color: C.hair, seed: 73, boil, gap: 3 });
  fill(F, blob(hx - 8, hy + 6, 3.6, 2.6, 13), { color: C.cheek, seed: 74, boil, overshoot: 1 });
  fill(F, blob(hx + 8, hy + 6, 3.6, 2.6, 14), { color: C.cheek, seed: 75, boil, overshoot: 1 });
  // Doudou lapin.
  const [dx, dy] = sh.doudouAt;
  fill(F, blob(dx, dy, 7, 6, 15), { color: C.doudou, seed: 76, boil, gap: 3 });
  fill(F, blob(dx - 3, dy - 10, 2.4, 6, 16), { color: C.doudou, seed: 77, boil, gap: 2.5 });
  fill(F, blob(dx + 3, dy - 10, 2.4, 6, 17), { color: C.doudou, seed: 78, boil, gap: 2.5 });
  // Rayures du pyjama à la craie blanche.
  for (let i = 0; i < 3; i++) {
    const yy = lerp(sh.torso[0][1] + 6, sh.torso[2][1] - 4, i / 2);
    line(F, [[x - 10, yy], [x + 10, yy]], { color: C.white, width: 2, seed: 79 + i, boil, wobble: wob * 0.5 });
  }
  // Traits : le personnage a le contour le plus appuyé.
  line(L, sh.torso, { color: C.ink, width: 2.8, seed: 80, boil, wobble: wob, closed: true });
  for (const [i, [a, b]] of [...sh.legs, ...sh.arms].entries()) {
    line(L, [a, b], { color: C.ink, width: 2.4, seed: 81 + i, boil, wobble: wob });
    L.fillStyle = C.ink;
    L.beginPath();
    L.arc(b[0], b[1], 3.2, 0, Math.PI * 2);
    L.fill();
  }
  line(L, blob(hx, hy, 15, 15, 12), { color: C.ink, width: 2.8, seed: 86, boil, wobble: wob, closed: true });
  // Cheveux : contour seulement sur le bord extérieur (sinon on dirait un bandeau).
  line(L, arc(hx, hy - 2, 16, Math.PI * 1.05, Math.PI * 1.95, 8), { color: C.hair, width: 3, seed: 87, boil, wobble: wob });
  L.fillStyle = C.ink;
  for (const ex of [hx - 5.5, hx + 5.5]) {
    L.beginPath();
    L.arc(ex, hy, 2.2, 0, Math.PI * 2);
    L.fill();
  }
  if (mouthOpen) line(L, blob(hx, hy + 8, 3, 3.6, 18, 10), { color: C.ink, width: 2.2, seed: 88, boil, wobble: wob * 0.5, closed: true });
  else line(L, arc(hx, hy + 5, 5, 0.4, Math.PI - 0.4, 6), { color: C.ink, width: 2.2, seed: 89, boil, wobble: wob * 0.5 });
  line(L, blob(dx, dy, 7, 6, 15), { color: C.door, width: 2, seed: 90, boil, wobble: wob, closed: true });
}

/** Notes de musique qui montent de Léo jusqu'à la Lune. */
function drawNotes(L: CanvasRenderingContext2D, F: CanvasRenderingContext2D, s: FrameState, boil: number) {
  const from: Pt = [660, 205];
  const to: Pt = [MOON.x + 50, MOON.y + 10];
  const local = s.beat === 3 ? s.bt : s.sinceTap !== null ? s.sinceTap * 1.6 + 0.5 : -1;
  if (local < 0) return;
  const count = s.beat === 4 ? 6 : 4;
  for (let i = 0; i < count; i++) {
    const u = (local * 0.32 - i * 0.22) % 1.2;
    if (u < 0 || u > 1) continue;
    const x = lerp(from[0], to[0], u) + (s.beat === 4 ? (i - 2.5) * 18 * u : 0);
    const y = lerp(from[1], to[1], u) - Math.sin(u * Math.PI) * 60 + Math.sin(u * 9 + i) * 6;
    const col = [C.roof, C.pyjama, C.grass, C.cheek][i % 4];
    fill(F, blob(x, y, 9, 7, 30 + i), { color: col, seed: 91 + i, boil, gap: 3 });
    line(L, blob(x, y, 9, 7, 30 + i), { color: C.ink, width: 2.6, seed: 95 + i, boil, closed: true });
    line(L, [[x + 8, y], [x + 8, y - 30]], { color: C.ink, width: 2.8, seed: 99 + i, boil });
    line(L, [[x + 8, y - 30], [x + 20, y - 21]], { color: C.ink, width: 2.8, seed: 103 + i, boil });
  }
}

function drawZzz(L: CanvasRenderingContext2D, s: FrameState) {
  const t = s.end !== null ? s.end + 3 : s.beat === 6 ? s.bt : -1;
  if (t < 1.8) return;
  L.save();
  L.fillStyle = C.ink;
  for (let i = 0; i < 3; i++) {
    const u = ((t - 1.8) * 0.35 + i * 0.33) % 1;
    L.globalAlpha = 1;
    L.font = `${18 + i * 6}px "Patrick Hand", sans-serif`;
    L.fillText('z', MOON.x - 10 + u * 40 + i * 12, MOON.y - MOON.r - 4 - u * 60);
  }
  L.restore();
}

/* ───────────── Lavis de nuit ───────────── */

const edgeX = (edge: number, y: number, step: number) => edge + Math.sin(y * 0.09 + step * 0.3) * 3 + Math.sin(y * 0.031 + 1) * 7 + Math.sin(y * 0.23) * 1.2;

function drawWash(g: CanvasRenderingContext2D, progress: number, step: number) {
  if (progress <= 0) return;
  const edge = lerp(-80, W + 80, progress);
  g.save();
  g.fillStyle = 'rgba(46, 66, 170, 0.82)';
  g.beginPath();
  g.moveTo(-20, -20);
  // Bord d'attaque mouillé : petite ondulation douce (pas de dents ni de grosses vagues = collines).
  for (let y = -20; y <= GROUND + 10; y += 4) g.lineTo(edgeX(edge, y, step), y);
  g.lineTo(-20, GROUND + 10);
  g.closePath();
  g.fill();
  // Le pigment s'accumule sur le bord.
  if (progress < 1) {
    g.strokeStyle = 'rgba(30, 40, 130, 0.45)';
    g.lineWidth = 10;
    g.beginPath();
    for (let y = -20; y <= GROUND + 10; y += 4) {
      const x = edgeX(edge, y, step) - 4;
      if (y === -20) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.stroke();
  }
  g.restore();
}

/* ───────────── Scène ───────────── */

function create(): FilmScene {
  const P = makePaper();
  const buf = canvas();
  const bgL = canvas(),
    bgF = canvas(),
    chL = canvas(),
    chF = canvas(),
    wash = canvas();
  const B = ctx2d(buf);
  let lastKey = '';

  return {
    render(ctx, s) {
      const step = onTwos(s.t);
      const key = `${step}|${s.beat}|${s.sinceTap !== null}|${s.caption}`;
      if (key !== lastKey) {
        lastKey = key;
        const st = story(s);
        const bgBoil = Math.floor(step * st.calm);
        [bgL, bgF, chL, chF, wash].forEach(clear);
        drawDecor(ctx2d(bgL), ctx2d(bgF), st, bgBoil);
        waxify(bgL, P.toothHeavy);
        waxify(bgF, P.toothLight);

        const leo = leoAt(st.climb, s.beat);
        const sing = st.sing && step % 4 < 2;
        const L = ctx2d(chL),
          F = ctx2d(chF);
        drawMoon(L, F, st, step);
        drawLeo(L, F, leo.x, leo.y, leo.pose, step, sing, st.calm);
        drawNotes(L, F, s, step);
        drawZzz(L, s);
        waxify(chL, P.toothHeavy);
        waxify(chF, P.toothLight);

        const Wg = ctx2d(wash);
        drawWash(Wg, st.wash, step);
        if (st.wash > 0) {
          Wg.save();
          Wg.setTransform(1, 0, 0, 1, 0, 0);
          // Granulation dans les creux du papier, puis réserve : la cire repousse l'eau.
          Wg.globalCompositeOperation = 'destination-out';
          Wg.globalAlpha = 0.18;
          Wg.drawImage(P.toothLight, 0, 0);
          Wg.globalAlpha = 0.9;
          Wg.drawImage(bgL, 0, 0);
          Wg.drawImage(bgF, 0, 0);
          Wg.restore();
        }

        B.save();
        B.setTransform(1, 0, 0, 1, 0, 0);
        B.globalCompositeOperation = 'source-over';
        B.drawImage(P.paper, 0, 0);
        B.drawImage(bgF, 0, 0);
        B.drawImage(bgL, 0, 0);
        B.globalCompositeOperation = 'multiply';
        B.drawImage(wash, 0, 0);
        B.restore();
        // Les personnages « gardent le papier blanc » derrière eux (réserve), puis on les colorie.
        B.save();
        B.fillStyle = P.pattern(B);
        withMoon(B, st.rock, () => {
          B.save();
          moonClip(B, st.crescent, 2);
          B.fillRect(0, 0, W, H);
          B.restore();
        });
        const sh = leoShape(leo.x, leo.y, leo.pose);
        scaled(B, leo.x, leo.y, () => {
          path(B, blob(sh.head[0], sh.head[1], 17, 17, 12));
          B.fill();
          path(B, sh.torso.map(([x, y]) => [x + (x < leo.x ? -2 : 2), y] as Pt));
          B.fill();
        });
        B.restore();
        B.save();
        B.setTransform(1, 0, 0, 1, 0, 0);
        B.drawImage(chF, 0, 0);
        B.drawImage(chL, 0, 0);
        B.restore();
        // Quelques étoiles scintillent une fois la nuit tombée.
        if (st.wash >= 1) {
          STARS.forEach(([x, y], i) => {
            const tw = Math.sin(s.t * 2.2 + i * 1.7);
            if (tw > 0.6) {
              B.fillStyle = `rgba(255,252,230,${(tw - 0.6) * 1.6})`;
              B.beginPath();
              B.arc(x, y, 2.2, 0, Math.PI * 2);
              B.fill();
            }
          });
        }
        // Les mots imprimés du livre, sur le papier nu du bas de la page.
        const appear = s.beat === 0 && !s.still ? span(s.bt, 0.1, 0.1 + 0.35 + s.caption.length * 0.02) : 1;
        bookText(B, s.caption, W / 2, 496, { size: 27, color: C.ink, boil: step, appear });
      }
      ctx.drawImage(buf, 0, 0, buf.width, buf.height, 0, 0, W, H);
    },
    cues(s, prev, audio) {
      const cross = (t: number) => prev < t && s.bt >= t;
      const at = audio.now;
      if (s.beat === 0) {
        [0.3, 0.9, 1.5, 2.0].forEach((t, i) => cross(t) && audio.crayon(at, 0.45, 0.8 + i * 0.1));
        if (cross(2.6)) audio.noise(at, 2.6, { type: 'lowpass', freq: 900, gain: 0.05, attack: 0.3 });
      }
      if (s.beat === 2) [0.3, 0.95, 1.55, 2.2, 2.8].forEach((t) => cross(t) && audio.woodblock(at, 0.4));
      if (s.beat === 6 && cross(2.8)) audio.sparkle(at);
    },
    onTap(_b, audio) {
      audio.chime(audio.now, [79, 83, 86, 91]);
    },
    dispose() {
      [buf, bgL, bgF, chL, chF, wash].forEach((c) => {
        c.width = 0;
        c.height = 0;
      });
    }
  };
}

/** Berceuse originale pour boîte à musique, 3/4 lent. Une mesure = 6 demi-temps. */
const LULLABY = [
  [72, 0, 76, 0, 79, 0], [77, 0, 76, 0, 72, 0], [74, 0, 76, 77, 76, 0], [72, 0, 0, 0, 0, 0],
  [72, 0, 76, 0, 79, 0], [81, 0, 79, 0, 77, 0], [76, 0, 74, 0, 72, 0], [72, 0, 0, 0, 0, 0]
].flat();
const LULLABY_BASS = [48, 53, 55, 48, 48, 53, 55, 48];

export const lune: Film = {
  id: 'film-lune',
  title: 'Léo et la Lune qui bâillait',
  emoji: '🌙',
  style: 'crayon',
  styleLabel: 'Livre au crayon de cire',
  goal: 'Se calmer avant de dormir, le rituel du coucher',
  mood: 'calme',
  poster: { beat: 3, bt: 1.4 },
  beats: [
    { text: 'Ce soir, la Lune est toute ronde… mais elle n’arrive pas à dormir.', min: 5.8, hold: 0.6 },
    { text: 'Elle bâille… Aaaah !', say: 'Elle bâille… Aaaaaah !', min: 3.4, hold: 0.4 },
    { text: 'Léo met son pyjama, prend son doudou et monte tout doucement sur le toit.', min: 3.8, hold: 0.5 },
    { text: 'Il ne dit rien. Il chante : « Chut, chut, dodo la Lune. »', say: 'Il ne dit rien. Il chante : chut, chut, dodo la Lune.', min: 4.5, hold: 0.8 },
    {
      text: 'Aide Léo ! Touche la Lune pour la bercer.',
      hold: 2.6,
      tap: {
        hint: 'Touche la Lune',
        at: () => ({ x: MOON.x, y: MOON.y }),
        hit: (x, y) => Math.hypot(x - MOON.x, y - MOON.y) < MOON.r + 40
      }
    },
    { text: 'La Lune ferme un œil… puis l’autre.', min: 3, hold: 0.6 },
    { text: 'Elle s’endort, toute fine, en petit croissant. Bonne nuit, la Lune.', min: 4.2, hold: 2 }
  ],
  music(audio) {
    return loop(audio, 60 / 76 / 2, (step, at) => {
      const n = LULLABY[step % LULLABY.length];
      if (n) audio.musicBox(n, at, 0.9);
      if (step % 6 === 0) audio.musicBox(LULLABY_BASS[Math.floor(step / 6) % 8], at, 0.55);
      if (step % 6 === 3) audio.musicBox(LULLABY_BASS[Math.floor(step / 6) % 8] + 7, at, 0.35);
    });
  },
  create
};

export const __test = { story, leoAt, RES };
