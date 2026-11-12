/**
 * 💧 « Le Voyage de la Petite Goutte » — style Whiteboard Explainer.
 * Un seul tableau blanc : tout ce qu'on apprend est dessiné au feutre devant nous, trait par trait, dans l'ordre du geste.
 * Trois couleurs avec un sens fixe : noir pour les choses, bleu pour l'eau (le processus), orange pour ce qui compte (soleil, fleur).
 * Le seul objet qui bouge est un aimant : la petite goutte, qui suit le cycle de l'eau. L'enfant touche le nuage pour faire pleuvoir.
 */
import { loop, type FilmAudio } from './audio';
import { H, W, clamp, easeInOut, easeOut, hash, lerp, span, type Film, type FilmScene, type FrameState } from './engine';
import { RES, canvas, ctx2d, wrap, type Pt } from './crayon';

const INK = '#23262c';
const BLUE = '#2a5cb3';
const ORANGE = '#d97757';
const SEA_Y = 410;
const CLOUD = { x: 400, y: 172 };
const FLOWER = { x: 735, y: 440 };
const SUN = { x: 150, y: 118 };

/** Courbe de main : lente, rapide, lente. */
const hand = (u: number) => clamp(u - (Math.sin(2 * Math.PI * u) / (2 * Math.PI)) * 0.8);

type Item =
  | { kind: 'stroke'; beat: number; at: number; dur: number; tap?: boolean; color: string; width: number; pts: Pt[]; dash?: number }
  | { kind: 'wash'; beat: number; at: number; dur: number; tap?: boolean; color: string; pts: Pt[] }
  | { kind: 'text'; beat: number; at: number; dur: number; tap?: boolean; color: string; size: number; x: number; y: number; text: string; rot?: number };

/* ───────────── Formes ───────────── */

function circlePts(cx: number, cy: number, r: number, n = 40, a0 = -Math.PI / 2, turns = 1.06): Pt[] {
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + (i / n) * Math.PI * 2 * turns;
    const rr = r * (1 + Math.sin(i * 0.7) * 0.012);
    return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr] as Pt;
  });
}

function wave(x0: number, x1: number, y: number, amp: number, n = 5): Pt[] {
  const pts: Pt[] = [];
  for (let x = x0; x <= x1; x += 8) pts.push([x, y + Math.sin(((x - x0) / (x1 - x0)) * Math.PI * 2 * n) * amp]);
  return pts;
}

/** Nuage festonné : un ovale dont le dessus fait des bosses (un seul contour, sans boucles). */
function cloudPts(cx: number, cy: number): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i <= 72; i++) {
    const a = (i / 72) * Math.PI * 2;
    const top = Math.sin(a) < 0;
    const bump = top ? 26 * Math.abs(Math.sin(a * 2.5)) : 3 * Math.abs(Math.sin(a * 6));
    pts.push([cx + Math.cos(a) * 128, cy + Math.sin(a) * 42 - (top ? bump : -bump)]);
  }
  return pts;
}

function arrow(x0: number, y0: number, x1: number, y1: number, bend = 0): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i <= 12; i++) {
    const u = i / 12;
    pts.push([lerp(x0, x1, u) + Math.sin(u * Math.PI) * bend, lerp(y0, y1, u)]);
  }
  return pts;
}

function head(x: number, y: number, dx: number, dy: number, s = 14): Pt[] {
  const a = Math.atan2(dy, dx);
  return [
    [x + Math.cos(a + 2.6) * s, y + Math.sin(a + 2.6) * s],
    [x, y],
    [x + Math.cos(a - 2.6) * s, y + Math.sin(a - 2.6) * s]
  ];
}

/* ───────────── Le tableau, dans l'ordre du geste ───────────── */

const ITEMS: Item[] = [];
const add = (it: Item) => ITEMS.push(it);

// Beat 0 : titre, puis la mer (trois vagues) et son aquarelle bleue.
add({ kind: 'text', beat: 0, at: 0.1, dur: 1.6, color: INK, size: 34, x: 745, y: 58, text: 'Le voyage de la goutte', rot: -0.02 });
add({ kind: 'stroke', beat: 0, at: 1.7, dur: 0.18, color: ORANGE, width: 5, pts: [[585, 82], [905, 78]] });
add({ kind: 'wash', beat: 0, at: 2.9, dur: 0.9, color: BLUE, pts: [...wave(50, 560, SEA_Y, 7, 6), [560, 470], [50, 470]] });
[0, 1, 2].forEach((k) => add({ kind: 'stroke', beat: 0, at: 1.9 + k * 0.38, dur: 0.42, color: k ? BLUE : INK, width: k ? 5 : 7, pts: wave(50 + k * 20, 560 - k * 30, SEA_Y + k * 22, 7 - k, 6 - k) }));

// Beat 1 : le soleil (accent orange), ses rayons, son sourire ; le sol et une petite pousse.
add({ kind: 'stroke', beat: 1, at: 0.2, dur: 0.8, color: ORANGE, width: 7, pts: circlePts(SUN.x, SUN.y, 46) });
add({ kind: 'wash', beat: 1, at: 1.0, dur: 0.6, color: ORANGE, pts: circlePts(SUN.x, SUN.y, 44, 30, 0, 1) });
for (let i = 0; i < 8; i++) {
  const a = (i / 8) * Math.PI * 2;
  add({ kind: 'stroke', beat: 1, at: 1.0 + i * 0.1, dur: 0.12, color: ORANGE, width: 6, pts: [[SUN.x + Math.cos(a) * 60, SUN.y + Math.sin(a) * 60], [SUN.x + Math.cos(a) * 82, SUN.y + Math.sin(a) * 82]] });
}
add({ kind: 'stroke', beat: 1, at: 1.9, dur: 0.1, color: INK, width: 6, pts: [[SUN.x - 14, SUN.y - 8], [SUN.x - 13, SUN.y - 3]] });
add({ kind: 'stroke', beat: 1, at: 2.0, dur: 0.1, color: INK, width: 6, pts: [[SUN.x + 14, SUN.y - 8], [SUN.x + 15, SUN.y - 3]] });
add({ kind: 'stroke', beat: 1, at: 2.1, dur: 0.25, color: INK, width: 5, pts: circlePts(SUN.x, SUN.y + 4, 16, 10, 0.4, 0.3) });
// Le soleil chauffe : de petites vagues de chaleur vers la mer.
[0, 1].forEach((k) => add({ kind: 'stroke', beat: 1, at: 2.4 + k * 0.25, dur: 0.3, color: ORANGE, width: 4, pts: arrow(190 + k * 40, 190, 230 + k * 40, 330, 10) }));
add({ kind: 'stroke', beat: 1, at: 3.0, dur: 0.5, color: INK, width: 6, pts: [[600, FLOWER.y], [900, FLOWER.y + 2]] });
add({ kind: 'stroke', beat: 1, at: 3.5, dur: 0.25, color: INK, width: 5, pts: [[FLOWER.x, FLOWER.y], [FLOWER.x - 2, FLOWER.y - 34]] });
add({ kind: 'stroke', beat: 1, at: 3.75, dur: 0.2, color: INK, width: 5, pts: circlePts(FLOWER.x - 2, FLOWER.y - 42, 8, 12) });

// Beat 2 : la vapeur monte (flèches bleues en pointillé) et on l'écrit.
[0, 1, 2].forEach((k) => {
  const x = 250 + k * 70;
  add({ kind: 'stroke', beat: 2, at: 0.2 + k * 0.35, dur: 0.45, color: BLUE, width: 5, dash: 12, pts: arrow(x, 380, x + 40, 230, 14) });
  add({ kind: 'stroke', beat: 2, at: 0.6 + k * 0.35, dur: 0.1, color: BLUE, width: 5, pts: head(x + 40, 230, 0.2, -1) });
});
add({ kind: 'text', beat: 2, at: 1.5, dur: 0.7, color: BLUE, size: 28, x: 195, y: 296, text: 'vapeur', rot: -0.12 });

// Beat 3 : il fait froid en haut, le nuage se dessine et se remplit.
add({ kind: 'stroke', beat: 3, at: 0.3, dur: 1.4, color: INK, width: 7, pts: cloudPts(CLOUD.x, CLOUD.y) });
add({ kind: 'wash', beat: 3, at: 1.7, dur: 0.8, color: '#7d8fb0', pts: cloudPts(CLOUD.x, CLOUD.y) });
add({ kind: 'text', beat: 3, at: 2.4, dur: 0.6, color: INK, size: 28, x: 590, y: 150, text: 'nuage', rot: 0.05 });
// Petits traits de froid.
[0, 1, 2].forEach((k) => add({ kind: 'stroke', beat: 3, at: 2.9 + k * 0.1, dur: 0.12, color: BLUE, width: 4, pts: [[300 - k * 14, 96 + k * 20], [282 - k * 14, 100 + k * 20]] }));

// Beat 4 (au toucher) : la pluie tombe en tirets bleus vers la fleur.
for (let i = 0; i < 7; i++) {
  const x = 420 + i * 40;
  add({ kind: 'stroke', beat: 4, tap: true, at: 0.1 + i * 0.12, dur: 0.18, color: BLUE, width: 5, pts: [[x, 210 + (i % 2) * 18], [x + 22, 262 + (i % 2) * 18]] });
  add({ kind: 'stroke', beat: 4, tap: true, at: 0.55 + i * 0.12, dur: 0.18, color: BLUE, width: 5, pts: [[x + 40, 300 + (i % 2) * 16], [x + 62, 352 + (i % 2) * 16]] });
}
add({ kind: 'text', beat: 4, tap: true, at: 1.4, dur: 0.6, color: BLUE, size: 28, x: 820, y: 250, text: 'pluie', rot: 0.08 });

// Beat 5 : la fleur boit, sourit et grandit (on prolonge la tige, feuilles, pétales en accent orange).
add({ kind: 'stroke', beat: 5, at: 0.2, dur: 0.5, color: INK, width: 5, pts: [[FLOWER.x - 2, FLOWER.y - 50], [FLOWER.x + 4, FLOWER.y - 130]] });
add({ kind: 'stroke', beat: 5, at: 0.7, dur: 0.3, color: INK, width: 5, pts: circlePts(FLOWER.x - 15, FLOWER.y - 74, 14, 14, 0, 1).map(([x, y]) => [x, FLOWER.y - 74 + (y - (FLOWER.y - 74)) * 0.5] as Pt) });
add({ kind: 'stroke', beat: 5, at: 1.0, dur: 0.3, color: INK, width: 5, pts: circlePts(FLOWER.x + 18, FLOWER.y - 100, 14, 14, 0, 1).map(([x, y]) => [x, FLOWER.y - 100 + (y - (FLOWER.y - 100)) * 0.5] as Pt) });
for (let i = 0; i < 6; i++) {
  const a = (i / 6) * Math.PI * 2;
  const px = FLOWER.x + 4 + Math.cos(a) * 34,
    py = FLOWER.y - 160 + Math.sin(a) * 34;
  add({ kind: 'stroke', beat: 5, at: 1.3 + i * 0.16, dur: 0.18, color: ORANGE, width: 6, pts: circlePts(px, py, 17, 14) });
  add({ kind: 'wash', beat: 5, at: 1.5 + i * 0.16, dur: 0.3, color: ORANGE, pts: circlePts(px, py, 16, 14, 0, 1) });
}
add({ kind: 'stroke', beat: 5, at: 2.4, dur: 0.4, color: INK, width: 6, pts: circlePts(FLOWER.x + 4, FLOWER.y - 160, 24, 24) });
add({ kind: 'stroke', beat: 5, at: 2.8, dur: 0.08, color: INK, width: 6, pts: [[FLOWER.x - 5, FLOWER.y - 166], [FLOWER.x - 5, FLOWER.y - 162]] });
add({ kind: 'stroke', beat: 5, at: 2.9, dur: 0.08, color: INK, width: 6, pts: [[FLOWER.x + 13, FLOWER.y - 166], [FLOWER.x + 13, FLOWER.y - 162]] });
add({ kind: 'stroke', beat: 5, at: 3.0, dur: 0.25, color: INK, width: 5, pts: circlePts(FLOWER.x + 4, FLOWER.y - 158, 11, 10, 0.4, 0.3) });

// Beat 6 : la grande flèche du cycle ramène la goutte à la mer.
const CYCLE: Pt[] = Array.from({ length: 26 }, (_, i) => {
  const u = i / 25;
  return [lerp(FLOWER.x - 40, 470, u), FLOWER.y + 10 + Math.sin(u * Math.PI) * 26 - u * 10] as Pt;
});
add({ kind: 'stroke', beat: 6, at: 0.3, dur: 1.2, color: BLUE, width: 6, pts: CYCLE });
add({ kind: 'stroke', beat: 6, at: 1.5, dur: 0.12, color: BLUE, width: 6, pts: head(470, FLOWER.y, -1, -0.3) });

/* ───────────── Progrès d'un élément ───────────── */

function progress(it: Item, s: FrameState) {
  if (s.end !== null || s.beat > it.beat) return 1;
  if (s.beat < it.beat) return 0;
  const base = it.tap ? s.sinceTap : s.bt;
  if (base === null) return 0;
  return hand(span(base, it.at, it.at + it.dur));
}

/* ───────────── Encre ───────────── */

function strokeTo(g: CanvasRenderingContext2D, pts: Pt[], u: number, width: number, seed: number, dash?: number): Pt | null {
  if (u <= 0) return null;
  const L: number[] = [0];
  for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const until = L[L.length - 1] * u;
  let tip: Pt = pts[0];
  g.lineWidth = width;
  if (dash) g.setLineDash([dash, dash * 0.8]);
  g.beginPath();
  for (let i = 0; i < pts.length; i++) {
    // Tremblé de main à basse fréquence le long du trait.
    let [x, y] = pts[i];
    x += Math.sin(i * 0.5 + seed) * 0.9;
    y += Math.cos(i * 0.4 + seed) * 0.9;
    if (L[i] > until) {
      const f = (until - L[i - 1]) / (L[i] - L[i - 1] || 1);
      x = lerp(pts[i - 1][0], x, f);
      y = lerp(pts[i - 1][1], y, f);
      g.lineTo(x, y);
      tip = [x, y];
      break;
    }
    if (i) g.lineTo(x, y);
    else g.moveTo(x, y);
    tip = [x, y];
  }
  g.stroke();
  g.setLineDash([]);
  // Petite flaque d'encre où la pointe s'est posée.
  g.beginPath();
  g.arc(pts[0][0], pts[0][1], width * 0.62, 0, Math.PI * 2);
  g.fill();
  return u < 1 ? tip : null;
}

function makeBoard() {
  const c = canvas();
  const g = ctx2d(c);
  const grd = g.createLinearGradient(0, 0, W, H);
  grd.addColorStop(0, '#fbfaf6');
  grd.addColorStop(1, '#efede6');
  g.fillStyle = grd;
  g.fillRect(0, 0, W, H);
  // Fantômes d'anciennes leçons, à 5–10 %.
  g.strokeStyle = 'rgba(80,90,110,0.07)';
  g.lineWidth = 5;
  g.lineCap = 'round';
  for (let i = 0; i < 9; i++) {
    const x = hash(i, 1) * W,
      y = hash(i, 2) * H * 0.85;
    g.beginPath();
    if (i % 3 === 0) g.arc(x, y, 20 + hash(i, 3) * 40, 0, Math.PI * 1.7);
    else {
      g.moveTo(x, y);
      g.lineTo(x + 60 + hash(i, 4) * 80, y + (hash(i, 5) - 0.5) * 30);
    }
    g.stroke();
  }
  g.font = '30px "Architects Daughter", sans-serif';
  g.fillStyle = 'rgba(80,100,150,0.06)';
  g.fillText('2 + 3 = 5', 720, 380);
  g.fillText('lundi', 90, 300);
  // Rayures fines.
  for (let i = 0; i < 300; i++) {
    g.strokeStyle = 'rgba(0,0,0,0.025)';
    g.lineWidth = 0.6;
    const x = hash(i, 7) * W,
      y = hash(i, 8) * H;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + 10 + hash(i, 9) * 20, y + (hash(i, 10) - 0.5) * 4);
    g.stroke();
  }
  return c;
}

function makeSpeckle() {
  const c = canvas();
  const g = c.getContext('2d')!;
  for (let i = 0; i < (c.width * c.height) / 40; i++) {
    g.fillStyle = `rgba(0,0,0,${0.25 + hash(i, 1) * 0.4})`;
    g.fillRect(hash(i, 2) * c.width, hash(i, 3) * c.height, 1.5 + hash(i, 4) * 2, 1);
  }
  return c;
}

/** Le feutre qui flotte (pas de main) : corps blanc, bague et capuchon de la couleur, ombre portée. */
function marker(g: CanvasRenderingContext2D, x: number, y: number, color: string) {
  g.save();
  g.fillStyle = 'rgba(0,0,0,0.16)';
  g.translate(x + 14, y + 16);
  g.rotate(-0.75);
  g.beginPath();
  g.roundRect(0, -9, 110, 18, 6);
  g.fill();
  g.restore();
  g.save();
  g.translate(x, y);
  g.rotate(-0.75);
  g.fillStyle = INK;
  g.beginPath();
  g.moveTo(0, 0);
  g.lineTo(14, -5);
  g.lineTo(14, 5);
  g.closePath();
  g.fill();
  g.fillStyle = '#f4f4f2';
  g.beginPath();
  g.roundRect(14, -9, 92, 18, 5);
  g.fill();
  g.strokeStyle = 'rgba(0,0,0,0.25)';
  g.lineWidth = 1;
  g.stroke();
  g.fillStyle = color;
  g.fillRect(70, -9, 12, 18);
  g.beginPath();
  g.roundRect(96, -9, 14, 18, 4);
  g.fill();
  g.fillStyle = 'rgba(255,255,255,0.6)';
  g.fillRect(20, -6, 44, 3);
  g.restore();
}

/** La goutte-aimant : seul objet qui bouge sur le tableau (glisse, se soulève, se pose). */
function dropMagnet(g: CanvasRenderingContext2D, x: number, y: number, lift: number, shiver: number, t: number) {
  const sx = shiver ? Math.sin(t * 40) * shiver : 0;
  g.save();
  g.fillStyle = `rgba(0,0,0,${0.22 - lift * 0.1})`;
  g.beginPath();
  g.ellipse(x + 6 + lift * 10, y + 22 + lift * 8, 18 + lift * 4, 7, 0, 0, Math.PI * 2);
  g.filter = 'none';
  g.fill();
  g.translate(x + sx, y - lift * 6);
  const shape = () => {
    g.beginPath();
    g.moveTo(0, -30);
    g.bezierCurveTo(10, -14, 22, 0, 22, 10);
    g.arc(0, 10, 22, 0, Math.PI);
    g.bezierCurveTo(-22, 0, -10, -14, 0, -30);
    g.closePath();
  };
  const grd = g.createRadialGradient(-6, -2, 2, 0, 8, 30);
  grd.addColorStop(0, '#6fa2f0');
  grd.addColorStop(1, '#1f4ea8');
  g.fillStyle = grd;
  shape();
  g.fill();
  g.strokeStyle = '#173b80';
  g.lineWidth = 2;
  g.stroke();
  g.fillStyle = 'rgba(255,255,255,0.75)';
  g.beginPath();
  g.ellipse(-8, -2, 4, 8, 0.4, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#0f1c33';
  g.beginPath();
  g.arc(-6, 10, 2.6, 0, Math.PI * 2);
  g.arc(6, 10, 2.6, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = '#0f1c33';
  g.lineWidth = 2;
  g.beginPath();
  if (shiver) {
    g.moveTo(-6, 20);
    g.lineTo(-2, 18);
    g.lineTo(2, 20);
    g.lineTo(6, 18);
  } else g.arc(0, 15, 6, 0.3, Math.PI - 0.3);
  g.stroke();
  g.restore();
}

/** Où est la goutte : posée sur la mer, monte avec la vapeur, frissonne dans le nuage, tombe avec la pluie, revient. */
function dropAt(s: FrameState) {
  const end = s.end !== null;
  const sea = { x: 200, y: 420 };
  const cloud = { x: CLOUD.x + 10, y: CLOUD.y + 6 };
  const flower = { x: FLOWER.x - 54, y: FLOWER.y - 22 };
  let x = sea.x,
    y = sea.y,
    lift = 0,
    shiver = 0,
    show = true;
  if (s.beat === 0) {
    const u = span(s.bt, 3.4, 3.8);
    show = s.bt > 3.4;
    lift = 1 - easeOut(u);
  }
  if (s.beat === 2) {
    const u = easeInOut(span(s.bt, 1.0, 3.0));
    x = lerp(sea.x, 360, u) + Math.sin(u * 10) * 10;
    y = lerp(sea.y, 236, u);
    lift = u > 0 && u < 1 ? 0.7 : 0;
  }
  if (s.beat === 3) {
    const u = easeInOut(span(s.bt, 0.6, 1.6));
    x = lerp(360, cloud.x, u);
    y = lerp(236, cloud.y, u);
    lift = u > 0 && u < 1 ? 0.7 : 0;
    shiver = s.bt > 2.0 ? 1.6 : 0;
  }
  if (s.beat === 4) {
    x = cloud.x;
    y = cloud.y;
    shiver = s.sinceTap === null ? 1.4 : 0;
    if (s.sinceTap !== null) {
      const u = easeInOut(span(s.sinceTap, 0.4, 1.6));
      x = lerp(cloud.x, flower.x, u);
      y = lerp(cloud.y, flower.y, u);
      lift = u > 0 && u < 1 ? 0.8 : 0;
    }
  }
  if (s.beat === 5) {
    x = flower.x;
    y = flower.y;
  }
  if (s.beat >= 6 || end) {
    const u = end ? 1 : easeInOut(span(s.bt, 0.4, 1.8));
    const k = Math.min(CYCLE.length - 1, Math.floor(u * (CYCLE.length - 1)));
    x = u >= 1 ? sea.x : CYCLE[k][0];
    y = u >= 1 ? sea.y : CYCLE[k][1] - 20;
    if (u >= 1 && !end) {
      x = lerp(470, sea.x, easeInOut(span(s.bt, 1.8, 2.4)));
      y = sea.y;
    }
    lift = u > 0 && u < 1 ? 0.7 : 0;
  }
  return { x, y, lift, shiver, show };
}

/* ───────────── Scène ───────────── */

function create(): FilmScene {
  const board = makeBoard();
  const speckle = makeSpeckle();
  const ink = canvas();
  const buf = canvas();

  return {
    render(ctx, s) {
      const I = ctx2d(ink);
      I.save();
      I.setTransform(1, 0, 0, 1, 0, 0);
      I.clearRect(0, 0, ink.width, ink.height);
      I.restore();
      let tip: { x: number; y: number; color: string } | null = null;
      ITEMS.forEach((it, idx) => {
        const u = progress(it, s);
        if (u <= 0) return;
        if (it.kind === 'wash') {
          // L'aquarelle apparaît « comme par magie » : un cercle qui grandit depuis le centre de la forme.
          const xs = it.pts.map((p) => p[0]),
            ys = it.pts.map((p) => p[1]);
          const cx = (Math.min(...xs) + Math.max(...xs)) / 2,
            cy = (Math.min(...ys) + Math.max(...ys)) / 2;
          const R = Math.hypot(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) / 2;
          I.save();
          I.beginPath();
          I.arc(cx, cy, R * easeOut(u) + 1, 0, Math.PI * 2);
          I.clip();
          I.globalAlpha = 0.28;
          I.fillStyle = it.color;
          I.beginPath();
          it.pts.forEach(([x, y], i) => (i ? I.lineTo(x, y) : I.moveTo(x, y)));
          I.closePath();
          I.fill();
          I.globalAlpha = 0.12;
          I.lineWidth = 5;
          I.strokeStyle = it.color;
          I.stroke();
          I.restore();
        } else if (it.kind === 'stroke') {
          I.save();
          I.globalAlpha = 0.94;
          I.strokeStyle = it.color;
          I.fillStyle = it.color;
          I.lineCap = 'round';
          I.lineJoin = 'round';
          const p = strokeTo(I, it.pts, u, it.width, idx, it.dash);
          if (p) tip = { x: p[0], y: p[1], color: it.color };
          I.restore();
        } else {
          // Écriture de gauche à droite (révélée par une découpe), chaque lettre un peu de travers.
          I.save();
          I.font = `${it.size}px "Architects Daughter", sans-serif`;
          const w = I.measureText(it.text).width;
          I.translate(it.x, it.y);
          I.rotate(it.rot ?? 0);
          I.beginPath();
          I.rect(-w / 2 - 4, -it.size, (w + 8) * u, it.size * 2);
          I.clip();
          I.fillStyle = it.color;
          I.globalAlpha = 0.94;
          I.textBaseline = 'middle';
          let x = -w / 2;
          [...it.text].forEach((ch, i) => {
            I.save();
            I.translate(x, (hash(idx, i) - 0.5) * 2.4);
            I.rotate((hash(idx, i, 2) - 0.5) * 0.08);
            I.fillText(ch, 0, 0);
            I.restore();
            x += I.measureText(ch).width;
          });
          I.restore();
          if (u < 1) tip = { x: it.x - w / 2 + w * u, y: it.y, color: it.color };
        }
      });
      // Texture de feutre sec : on retire un peu d'encre en mouchetures (fixées au tableau).
      I.save();
      I.setTransform(1, 0, 0, 1, 0, 0);
      I.globalCompositeOperation = 'destination-out';
      I.globalAlpha = 0.35;
      I.drawImage(speckle, 0, 0);
      I.restore();

      const B = ctx2d(buf);
      B.save();
      B.setTransform(1, 0, 0, 1, 0, 0);
      B.globalCompositeOperation = 'source-over';
      B.drawImage(board, 0, 0);
      B.globalCompositeOperation = 'multiply';
      B.drawImage(ink, 0, 0);
      B.globalCompositeOperation = 'source-over';
      B.restore();
      // Reflet de fenêtre en diagonale qui glisse lentement.
      const sx = ((s.t * 18) % (W + 600)) - 300;
      const sh = B.createLinearGradient(sx, 0, sx + 260, 120);
      sh.addColorStop(0, 'rgba(255,255,255,0)');
      sh.addColorStop(0.5, 'rgba(255,255,255,0.13)');
      sh.addColorStop(1, 'rgba(255,255,255,0)');
      B.fillStyle = sh;
      B.fillRect(0, 0, W, H);
      const d = dropAt(s);
      if (d.show) dropMagnet(B, d.x, d.y, d.lift, d.shiver, s.t);
      if (tip) marker(B, (tip as { x: number }).x, (tip as { y: number }).y, (tip as { color: string }).color);
      label(B, s.caption);
      ctx.drawImage(buf, 0, 0, buf.width, buf.height, 0, 0, W, H);
    },
    cues(s, prev, audio) {
      const at = audio.now;
      for (const it of ITEMS) {
        if (it.beat !== s.beat || it.kind === 'wash') continue;
        const base = it.tap ? s.sinceTap : s.bt;
        if (base === null) continue;
        const p = it.tap ? prev - (s.bt - base) : prev;
        if (p < it.at && base >= it.at) audio.marker(at, it.dur * 0.95, it.kind === 'text' ? 0.8 : 1);
      }
      const cross = (t: number) => prev < t && s.bt >= t;
      if (s.beat === 0 && cross(3.7)) audio.click(at);
      if (s.beat === 1 && cross(1.0)) audio.sparkle(at);
      if (s.beat === 3 && cross(2.0)) audio.tone(1200, at, 0.6, { gain: 0.04, to: 1500, wave: 'triangle' });
      if (s.beat === 5 && cross(2.4)) audio.slideWhistle(at, true, 0.6);
      if (s.beat === 6 && cross(2.4)) audio.click(at);
    },
    onTap(_b, audio) {
      audio.drops(audio.now + 0.1, 12);
    },
    dispose() {
      [board, speckle, ink, buf].forEach((c) => {
        c.width = 0;
        c.height = 0;
      });
    }
  };
}

/** Sous-titre incrusté : étiquette blanc cassé arrondie, écriture de tableau, petit trait d'accent. */
function label(g: CanvasRenderingContext2D, text: string) {
  g.save();
  g.font = '24px "Architects Daughter", sans-serif';
  const lines = wrap(g, text, 760);
  const w = Math.max(...lines.map((l) => g.measureText(l).width)) + 60;
  const h = lines.length * 28 + 16;
  const x = 480 - w / 2,
    y = 530 - h;
  g.fillStyle = 'rgba(250,249,245,0.92)';
  g.shadowColor = 'rgba(0,0,0,0.12)';
  g.shadowBlur = 8;
  g.beginPath();
  g.roundRect(x, y, w, h, 12);
  g.fill();
  g.shadowBlur = 0;
  g.fillStyle = ORANGE;
  g.fillRect(x + 14, y + h / 2 - 2, 14, 4);
  g.fillStyle = INK;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  lines.forEach((l, i) => g.fillText(l, 480 + 12, y + h / 2 + (i - (lines.length - 1) / 2) * 28 + 1));
  g.restore();
}

/* Minimalisme d'horlogerie : marimba (pizz), glockenspiel, woodblock (original), 100 bpm. */
const ARP = [60, 64, 67, 72, 67, 64, 62, 65, 69, 74, 69, 65, 64, 67, 71, 76, 71, 67, 60, 64, 67, 72, 76, 72];

export const goutte: Film = {
  id: 'film-goutte',
  title: 'Le Voyage de la Petite Goutte',
  emoji: '💧',
  style: 'whiteboard',
  styleLabel: 'Tableau blanc au feutre',
  goal: 'Le cycle de l’eau, la cause et l’effet',
  mood: 'defi',
  poster: { beat: 5, bt: 3.6 },
  beats: [
    { text: 'Le marqueur dessine la mer.', min: 4.1, hold: 0.3 },
    { text: 'Le soleil chauffe l’eau.', min: 4.1, hold: 0.3 },
    { text: 'Hop ! La petite goutte monte dans le ciel : c’est la vapeur.', min: 3.4, hold: 0.3 },
    { text: 'Brrr, il fait froid en haut ! Les gouttes se serrent et font un nuage.', min: 3.4, hold: 0.3 },
    {
      text: 'Le nuage est tout lourd… Touche le nuage pour faire pleuvoir !',
      hold: 2.3,
      tap: {
        hint: 'Touche le nuage',
        at: () => ({ x: CLOUD.x, y: CLOUD.y }),
        hit: (x, y) => Math.abs(x - CLOUD.x) < 150 && Math.abs(y - CLOUD.y) < 90
      }
    },
    { text: 'La pluie arrose la fleur… qui sourit et grandit !', min: 3.6, hold: 0.4 },
    { text: 'Et la petite goutte recommence son voyage !', min: 2.8, hold: 1.6 }
  ],
  music(audio) {
    return loop(audio, 60 / 100 / 2, (step, at) => {
      audio.pizz(ARP[step % ARP.length], at, 0.55);
      if (step % 8 === 0) audio.glock(ARP[step % ARP.length] + 12, at, 0.4);
      if (step % 4 === 2) audio.woodblock(at, 0.15);
    });
  },
  create
};
