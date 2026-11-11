/**
 * 🏰 « Ouvre la porte du château ! » — style Paper Pop-up Book.
 * Un livre posé sur un vrai bureau, sous une lampe chaude : quand il s'ouvre, le fond se dresse et les décors
 * en papier découpé (bord blanc, tranche grise, ombre portée qui a leur forme) se déplient de l'arrière vers l'avant.
 * Un petit chevalier en carton est bloqué devant le pont-levis : l'enfant tape sur le pont pour le faire descendre.
 */
import { loop, type FilmAudio } from './audio';
import { H, W, back, clamp, easeInOut, easeOut, hash, lerp, span, spring, type Film, type FilmScene, type FrameState } from './engine';
import { RES, blob, canvas, ctx2d, wrap, type Pt } from './crayon';

const INK = '#4a2e1f'; // encre brun foncé, jamais noire
const BORDER = '#f6f0e2';
const EDGE = '#a39a8a';

/** Livre ouvert vu de face, un peu d'en haut. */
const PAGE = { nearY: 500, farY: 318, nearL: 110, nearR: 850, farL: 190, farR: 770 };
const BOARD = { top: 70, l: 204, r: 756 };
const GATE = { x: 520, y: 392, w: 58, h: 64 };
const MOAT_FRONT = 452;
const KNIGHT_Y = 482;

/* ───────────── Cartes en papier découpé ───────────── */

interface Card {
  c: HTMLCanvasElement;
  shadow: HTMLCanvasElement;
  /** Taille logique (bord compris) et point d'ancrage (milieu du bas de l'art). */
  w: number;
  h: number;
  pad: number;
}

/**
 * Finition « papier découpé » : la silhouette de l'art, dilatée, donne une tranche grise un peu décalée vers le bas
 * puis un large bord blanc cassé ; un grain de papier commun par-dessus. L'ombre est la silhouette floutée.
 */
function makeCard(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, border = 5): Card {
  const pad = 12;
  const cw = Math.ceil((w + pad * 2) * RES),
    ch = Math.ceil((h + pad * 2) * RES);
  const art = document.createElement('canvas');
  art.width = cw;
  art.height = ch;
  const ag = art.getContext('2d')!;
  ag.setTransform(RES, 0, 0, RES, pad * RES, pad * RES);
  ag.lineJoin = 'round';
  ag.lineCap = 'round';
  draw(ag);

  const sil = (color: string, r: number) => {
    const c = document.createElement('canvas');
    c.width = cw;
    c.height = ch;
    const g = c.getContext('2d')!;
    for (let ring = 1; ring <= 2; ring++)
      for (let k = 0; k < 16; k++) {
        const a = (k / 16) * Math.PI * 2;
        g.drawImage(art, Math.cos(a) * r * RES * (ring / 2), Math.sin(a) * r * RES * (ring / 2));
      }
    g.drawImage(art, 0, 0);
    g.globalCompositeOperation = 'source-in';
    g.fillStyle = color;
    g.fillRect(0, 0, cw, ch);
    return c;
  };
  const out = document.createElement('canvas');
  out.width = cw;
  out.height = ch;
  const og = out.getContext('2d')!;
  og.drawImage(sil(EDGE, border), 0, 2.5 * RES);
  og.drawImage(sil(BORDER, border), 0, 0);
  og.drawImage(art, 0, 0);
  // Grain du papier, seulement sur la carte.
  og.globalCompositeOperation = 'source-atop';
  for (let i = 0; i < (cw * ch) / 90; i++) {
    og.fillStyle = hash(i, 1) > 0.5 ? 'rgba(255,255,255,0.06)' : 'rgba(60,40,20,0.05)';
    og.fillRect(hash(i, 2) * cw, hash(i, 3) * ch, 2, 2);
  }
  const shadow = document.createElement('canvas');
  shadow.width = cw;
  shadow.height = ch;
  const sg = shadow.getContext('2d')!;
  sg.filter = `blur(${3 * RES}px)`;
  sg.drawImage(sil('rgba(45,28,12,0.32)', border), 0, 0);
  return { c: out, shadow, w: w + pad * 2, h: h + pad * 2, pad };
}

/** Remplissage avec une ombre en croissant dur (on remplit en ombre, puis on repasse la base décalée). */
function crescent(g: CanvasRenderingContext2D, shape: () => void, base: string, shade: string, dx = -4, dy = -4) {
  g.save();
  shape();
  g.fillStyle = shade;
  g.fill();
  g.clip();
  g.translate(dx, dy);
  shape();
  g.fillStyle = base;
  g.fill();
  g.restore();
}

function inked(g: CanvasRenderingContext2D, shape: () => void, width = 3) {
  shape();
  g.strokeStyle = INK;
  g.lineWidth = width;
  g.stroke();
}

function poly(g: CanvasRenderingContext2D, pts: Pt[]) {
  g.beginPath();
  pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
  g.closePath();
}

function blobPath(g: CanvasRenderingContext2D, pts: Pt[]) {
  g.beginPath();
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i],
      b = pts[(i + 1) % pts.length];
    const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    if (i === 0) g.moveTo(m[0], m[1]);
    else g.quadraticCurveTo(a[0], a[1], m[0], m[1]);
  }
  const a = pts[0],
    b = pts[1];
  g.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
  g.closePath();
}

/* Décors (dessinés dans leur propre repère : (0,0) en haut à gauche de l'art). */

function hillsArt(g: CanvasRenderingContext2D) {
  const shape = () => {
    g.beginPath();
    g.moveTo(0, 80);
    for (let x = 0; x <= 540; x += 10) g.lineTo(x, 40 - Math.sin(x / 70) * 22 - Math.sin(x / 23) * 4);
    g.lineTo(540, 80);
    g.closePath();
  };
  crescent(g, shape, '#7cc36b', '#5a9e4f', -3, -5);
  inked(g, shape);
}

function castleArt(g: CanvasRenderingContext2D) {
  const stone = '#c9c3d6',
    shade = '#a49cb8';
  const wall = () => poly(g, [[30, 70], [200, 70], [200, 190], [30, 190]]);
  const tower = (x: number) => () => poly(g, [[x, 40], [x + 46, 40], [x + 46, 190], [x, 190]]);
  const roof = (x: number) => () => poly(g, [[x - 6, 42], [x + 23, -2], [x + 52, 42]]);
  for (const x of [8, 176]) {
    crescent(g, tower(x), stone, shade);
    inked(g, tower(x));
    crescent(g, roof(x), '#e2574c', '#b83d36');
    inked(g, roof(x));
  }
  crescent(g, wall, stone, shade);
  inked(g, wall);
  // Créneaux.
  for (let x = 40; x < 196; x += 26) {
    const m = () => poly(g, [[x, 70], [x + 14, 70], [x + 14, 56], [x, 56]]);
    crescent(g, m, stone, shade, -2, -2);
    inked(g, m, 2.4);
  }
  // Fenêtres et drapeaux.
  g.fillStyle = INK;
  for (const [x, y] of [[31, 90], [199, 90], [80, 104], [150, 104]] as Pt[]) {
    g.beginPath();
    g.roundRect(x - 6, y - 10, 12, 20, [6, 6, 0, 0]);
    g.fill();
  }
  for (const [x, c] of [[31, '#f2c12e'], [199, '#3e8ede']] as [number, string][]) {
    g.strokeStyle = INK;
    g.lineWidth = 2.4;
    g.beginPath();
    g.moveTo(x, -2);
    g.lineTo(x, -26);
    g.stroke();
    g.fillStyle = c;
    poly(g, [[x, -26], [x + 22, -20], [x, -13]]);
    g.fill();
    g.stroke();
  }
  // Porte en arche (sombre) : le pont-levis la ferme.
  const gx = 115 - GATE.w / 2;
  g.fillStyle = '#3a2618';
  g.beginPath();
  g.moveTo(gx, 190);
  g.lineTo(gx, 190 - GATE.h + GATE.w / 2);
  g.arc(115, 190 - GATE.h + GATE.w / 2, GATE.w / 2, Math.PI, 0);
  g.lineTo(gx + GATE.w, 190);
  g.closePath();
  g.fill();
  g.strokeStyle = INK;
  g.lineWidth = 3;
  g.stroke();
}

function treeArt(round: boolean) {
  return (g: CanvasRenderingContext2D) => {
    const trunk = () => poly(g, [[40, 70], [52, 70], [54, 110], [38, 110]]);
    crescent(g, trunk, '#9a6a3f', '#7b522e', -2, 0);
    inked(g, trunk);
    const top = () => (round ? blobPath(g, blob(46, 42, 42, 38, 3, 14, 0.12)) : poly(g, [[46, -4], [90, 76], [2, 76]]));
    crescent(g, top, '#5fb35a', '#43914a');
    inked(g, top);
  };
}

function bushArt(g: CanvasRenderingContext2D) {
  const sh = () => blobPath(g, blob(40, 28, 40, 24, 9, 16, 0.14));
  crescent(g, sh, '#6cc06a', '#4c9a55');
  inked(g, sh);
  g.fillStyle = '#e2574c';
  for (const [x, y] of [[24, 22], [52, 18], [40, 34]] as Pt[]) {
    g.beginPath();
    g.arc(x, y, 3.6, 0, Math.PI * 2);
    g.fill();
  }
}

function cloudArt(g: CanvasRenderingContext2D) {
  const sh = () => blobPath(g, blob(50, 24, 50, 20, 4, 16, 0.18));
  crescent(g, sh, '#ffffff', '#dce7f2', -3, -3);
  inked(g, sh, 2.6);
}

function sunArt(g: CanvasRenderingContext2D) {
  const sh = () => (g.beginPath(), g.arc(34, 34, 30, 0, Math.PI * 2));
  crescent(g, sh, '#ffd34d', '#f2a92e');
  inked(g, sh);
  g.fillStyle = INK;
  g.beginPath();
  g.arc(26, 30, 2.6, 0, Math.PI * 2);
  g.arc(42, 30, 2.6, 0, Math.PI * 2);
  g.fill();
  g.lineWidth = 2.4;
  g.beginPath();
  g.arc(34, 38, 8, 0.3, Math.PI - 0.3);
  g.stroke();
}

function bridgeArt(g: CanvasRenderingContext2D) {
  const sh = () => poly(g, [[0, 0], [GATE.w, 0], [GATE.w, 66], [0, 66]]);
  crescent(g, sh, '#b98552', '#93663a', -3, 0);
  inked(g, sh);
  g.strokeStyle = INK;
  g.lineWidth = 1.8;
  for (let y = 11; y < 66; y += 11) {
    g.beginPath();
    g.moveTo(3, y);
    g.lineTo(GATE.w - 3, y);
    g.stroke();
  }
  g.fillStyle = '#6b6f78';
  for (const x of [8, GATE.w - 8]) {
    g.beginPath();
    g.arc(x, 6, 3.4, 0, Math.PI * 2);
    g.fill();
  }
}

type KnightPose = 'walkA' | 'walkB' | 'stand' | 'sad' | 'wave';

function knightArt(pose: KnightPose) {
  return (g: CanvasRenderingContext2D) => {
    const metal = '#c3c9d4',
      metalShade = '#9aa1b0';
    const sad = pose === 'sad';
    // Jambes.
    const legs: [number, number][] = pose === 'walkA' ? [[-8, 6], [8, -6]] : pose === 'walkB' ? [[-4, -4], [4, 4]] : [[-6, 0], [6, 0]];
    for (const [dx, sw] of legs) {
      const leg = () => poly(g, [[30 + dx - 5, 62], [30 + dx + 5, 62], [30 + dx + 5 + sw, 84], [30 + dx - 5 + sw, 84]]);
      crescent(g, leg, metal, metalShade, -2, 0);
      inked(g, leg, 2.4);
    }
    // Cape rouge.
    const cape = () => poly(g, [[16, 34], [44, 34], [50, 70], [10, 70]]);
    crescent(g, cape, '#e2574c', '#b83d36', -2, -2);
    inked(g, cape, 2.4);
    // Corps (armure).
    const body = () => {
      g.beginPath();
      g.roundRect(17, 32, 26, 34, 8);
    };
    crescent(g, body, metal, metalShade);
    inked(g, body, 2.6);
    // Bras.
    const arm = (side: number, up: boolean) => {
      const sx = 30 + side * 13;
      const ex = sx + side * (up ? 10 : 6),
        ey = up ? 10 : sad ? 62 : 58;
      g.strokeStyle = INK;
      g.lineWidth = 8;
      g.beginPath();
      g.moveTo(sx, 40);
      g.lineTo(ex, ey);
      g.stroke();
      g.strokeStyle = metal;
      g.lineWidth = 4.6;
      g.stroke();
      g.fillStyle = '#f4c39d';
      g.beginPath();
      g.arc(ex, ey, 4.6, 0, Math.PI * 2);
      g.fill();
      g.lineWidth = 2;
      g.strokeStyle = INK;
      g.stroke();
    };
    arm(-1, false);
    arm(1, pose === 'wave');
    // Tête : casque rond, visière, plumet.
    g.save();
    g.translate(30, 22);
    g.rotate(sad ? 0.18 : 0);
    const helm = () => (g.beginPath(), g.arc(0, 0, 15, 0, Math.PI * 2));
    crescent(g, helm, metal, metalShade, -3, -3);
    inked(g, helm, 2.6);
    g.fillStyle = '#f4c39d';
    g.beginPath();
    g.roundRect(-10, -3, 20, 11, 4);
    g.fill();
    g.strokeStyle = INK;
    g.lineWidth = 2;
    g.stroke();
    g.fillStyle = INK;
    g.beginPath();
    g.arc(-4, 2, 1.8, 0, Math.PI * 2);
    g.arc(4, 2, 1.8, 0, Math.PI * 2);
    g.fill();
    if (sad) {
      g.beginPath();
      g.moveTo(-3, 7);
      g.lineTo(3, 7);
      g.stroke();
    }
    const plume = () => {
      g.beginPath();
      g.moveTo(0, -14);
      g.quadraticCurveTo(sad ? 14 : 4, sad ? -16 : -32, sad ? 20 : 14, sad ? -6 : -26);
      g.quadraticCurveTo(sad ? 8 : 6, sad ? -10 : -20, 0, -14);
      g.closePath();
    };
    crescent(g, plume, '#e2574c', '#b83d36', -1, -1);
    inked(g, plume, 2);
    g.restore();
  };
}

/* ───────────── Bureau, livre ───────────── */

function makeDesk() {
  const c = canvas();
  const g = ctx2d(c);
  const wood = g.createLinearGradient(0, 0, 0, H);
  wood.addColorStop(0, '#7a4b2b');
  wood.addColorStop(1, '#a8703f');
  g.fillStyle = wood;
  g.fillRect(0, 0, W, H);
  // Lattes et veines du bois.
  for (let i = 0; i < 9; i++) {
    const y = 20 + i * 64;
    g.strokeStyle = 'rgba(40,20,8,0.35)';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(W, y + 6);
    g.stroke();
    for (let k = 0; k < 6; k++) {
      g.strokeStyle = `rgba(60,30,10,${0.08 + hash(i, k) * 0.08})`;
      g.lineWidth = 1;
      g.beginPath();
      const yy = y + 8 + hash(i, k, 2) * 48;
      g.moveTo(0, yy);
      for (let x = 0; x <= W; x += 40) g.lineTo(x, yy + Math.sin(x / 90 + k) * 3);
      g.stroke();
    }
  }
  // Objets réels flous (profondeur de champ) : un mug et un crayon.
  g.save();
  g.filter = `blur(${7 * RES}px)`;
  g.fillStyle = '#e9e2d4';
  g.beginPath();
  g.ellipse(890, 60, 58, 44, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#4b7fb8';
  g.beginPath();
  g.ellipse(890, 64, 46, 34, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#f2c12e';
  g.save();
  g.translate(40, 470);
  g.rotate(-0.5);
  g.fillRect(-90, -9, 180, 18);
  g.fillStyle = '#e2a07a';
  g.beginPath();
  g.moveTo(90, -9);
  g.lineTo(118, 0);
  g.lineTo(90, 9);
  g.fill();
  g.restore();
  g.restore();
  return c;
}

function makeLight() {
  const c = canvas();
  const g = ctx2d(c);
  const lamp = g.createRadialGradient(200, 40, 40, 300, 160, 700);
  lamp.addColorStop(0, 'rgba(255,214,150,0.30)');
  lamp.addColorStop(1, 'rgba(255,214,150,0)');
  g.fillStyle = lamp;
  g.fillRect(0, 0, W, H);
  const vig = g.createRadialGradient(480, 280, 260, 480, 280, 620);
  vig.addColorStop(0, 'rgba(20,10,4,0)');
  vig.addColorStop(1, 'rgba(20,10,4,0.5)');
  g.fillStyle = vig;
  g.fillRect(0, 0, W, H);
  return c;
}

function drawPage(g: CanvasRenderingContext2D) {
  // Tranche du livre (pages empilées) sous le bord avant.
  for (let i = 4; i >= 0; i--) {
    g.fillStyle = i % 2 ? '#e7dcc6' : '#f3ead7';
    poly(g, [[PAGE.nearL - 4 + i, PAGE.nearY + i * 2], [PAGE.nearR + 4 - i, PAGE.nearY + i * 2], [PAGE.nearR + 4 - i, PAGE.nearY + i * 2 + 4], [PAGE.nearL - 4 + i, PAGE.nearY + i * 2 + 4]]);
    g.fill();
  }
  g.fillStyle = '#7a2f2a';
  poly(g, [[PAGE.nearL - 10, PAGE.nearY + 12], [PAGE.nearR + 10, PAGE.nearY + 12], [PAGE.nearR + 6, PAGE.nearY + 18], [PAGE.nearL - 6, PAGE.nearY + 18]]);
  g.fill();
  const grd = g.createLinearGradient(0, PAGE.farY, 0, PAGE.nearY);
  grd.addColorStop(0, '#d9e8c4');
  grd.addColorStop(1, '#bfdc9e');
  g.fillStyle = grd;
  poly(g, [[PAGE.farL, PAGE.farY], [PAGE.farR, PAGE.farY], [PAGE.nearR, PAGE.nearY], [PAGE.nearL, PAGE.nearY]]);
  g.fill();
  g.strokeStyle = 'rgba(74,46,31,0.35)';
  g.lineWidth = 1.5;
  g.stroke();
  // Pli central (gouttière).
  const sh = g.createLinearGradient(0, PAGE.farY, 0, PAGE.farY + 22);
  sh.addColorStop(0, 'rgba(60,40,20,0.35)');
  sh.addColorStop(1, 'rgba(60,40,20,0)');
  g.fillStyle = sh;
  g.fillRect(PAGE.farL, PAGE.farY, PAGE.farR - PAGE.farL, 22);
}

/** Le fond (ou la couverture) qui pivote autour de la gouttière. open : 0 = fermé à plat, 1 = debout. */
function drawBoard(g: CanvasRenderingContext2D, open: number, art: HTMLCanvasElement) {
  const phi = open * Math.PI * 0.5;
  const lying = PAGE.nearY - PAGE.farY;
  const standing = PAGE.farY - BOARD.top;
  const edgeY = PAGE.farY + lying * Math.cos(phi) - standing * Math.sin(phi);
  if (edgeY >= PAGE.farY) {
    // Couverture encore vers nous : tissu rouge, titre doré.
    const u = (edgeY - PAGE.farY) / lying;
    const l = lerp(PAGE.farL, PAGE.nearL, u) - 8,
      r = lerp(PAGE.farR, PAGE.nearR, u) + 8;
    g.fillStyle = '#9a3a33';
    poly(g, [[PAGE.farL - 8, PAGE.farY], [PAGE.farR + 8, PAGE.farY], [r, edgeY + 8], [l, edgeY + 8]]);
    g.fill();
    g.strokeStyle = '#6e2622';
    g.lineWidth = 3;
    g.stroke();
    if (u > 0.5) {
      g.save();
      g.translate(480, PAGE.farY + (edgeY - PAGE.farY) * 0.5);
      g.scale(1, u);
      g.font = '600 34px "Fredoka", sans-serif';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillStyle = '#e8c56a';
      g.fillText('Le Château', 0, 0);
      g.restore();
    }
    return;
  }
  const u = (PAGE.farY - edgeY) / standing;
  const top = PAGE.farY - standing * u;
  const l = lerp(PAGE.farL + 14, BOARD.l, u),
    r = lerp(PAGE.farR - 14, BOARD.r, u);
  g.save();
  poly(g, [[PAGE.farL + 14, PAGE.farY], [PAGE.farR - 14, PAGE.farY], [r, top], [l, top]]);
  g.clip();
  g.drawImage(art, 0, 0, art.width, art.height, BOARD.l, PAGE.farY - standing * u, BOARD.r - BOARD.l, standing * u);
  g.restore();
  g.strokeStyle = 'rgba(74,46,31,0.4)';
  g.lineWidth = 1.5;
  poly(g, [[PAGE.farL + 14, PAGE.farY], [PAGE.farR - 14, PAGE.farY], [r, top], [l, top]]);
  g.stroke();
}

function makeBoardArt(sun: Card, cloud: Card) {
  const w = BOARD.r - BOARD.l,
    h = PAGE.farY - BOARD.top;
  const c = canvas(Math.ceil(w * RES), Math.ceil(h * RES));
  const g = c.getContext('2d')!;
  g.setTransform(RES, 0, 0, RES, 0, 0);
  const sky = g.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#8cc8f0');
  sky.addColorStop(1, '#d6eefa');
  g.fillStyle = sky;
  g.fillRect(0, 0, w, h);
  const put = (card: Card, x: number, y: number, k = 1) => {
    g.drawImage(card.shadow, x + 4, y + 5, card.w * k, card.h * k);
    g.drawImage(card.c, x, y, card.w * k, card.h * k);
  };
  put(sun, w - 120, 18);
  put(cloud, 40, 30);
  put(cloud, 250, 60, 0.8);
  return c;
}

/* ───────────── Pièces qui se déplient ───────────── */

interface Piece {
  card: Card;
  x: number; // centre
  base: number; // ligne de pied sur la page
  delay: number; // départ du dépliage dans le beat 0
  sway?: number;
  flat?: boolean;
}

/** Une carte debout : pied sur la page, hauteur × pop (avec dépassement), ombre en forme de silhouette. */
function drawStanding(g: CanvasRenderingContext2D, card: Card, x: number, base: number, pop: number, opts: { sway?: number; flip?: boolean; scale?: number; lift?: number } = {}) {
  if (pop <= 0.001) return;
  const k = opts.scale ?? 1;
  const w = card.w * k,
    h = card.h * k;
  const padK = card.pad * k;
  // Ombre portée : couchée vers l'arrière-droite (la lampe est devant, à gauche).
  const sh = Math.max(0, Math.min(1, pop));
  g.save();
  g.translate(x, base);
  g.transform(1, 0, -0.6, 0.32 * sh, 0, 0);
  g.drawImage(card.shadow, -w / 2 + 6, -h + padK, w, h);
  g.restore();
  g.save();
  g.translate(x, base - (opts.lift ?? 0));
  if (opts.sway) g.transform(1, 0, opts.sway, 1, 0, 0);
  g.scale(opts.flip ? -1 : 1, pop);
  g.drawImage(card.c, -w / 2, -h + padK, w, h);
  g.restore();
}

function drawBridge(g: CanvasRenderingContext2D, card: Card, lower: number, pop: number) {
  if (pop <= 0.001) return;
  const phi = lower * Math.PI * 0.5;
  const up = GATE.h * Math.cos(phi) * pop;
  const down = (MOAT_FRONT + 4 - GATE.y) * Math.sin(phi);
  const top = GATE.y - up + down;
  const w = GATE.w * (1 + 0.14 * Math.sin(phi));
  // Chaînes depuis le mur jusqu'au bout du pont.
  g.save();
  g.strokeStyle = '#5b5f68';
  g.lineWidth = 2.2;
  g.setLineDash([4, 3]);
  for (const side of [-1, 1]) {
    g.beginPath();
    g.moveTo(GATE.x + side * (GATE.w / 2 + 6), GATE.y - GATE.h - 6);
    g.lineTo(GATE.x + (side * w) / 2, top);
    g.stroke();
  }
  g.restore();
  const k = card.w / (GATE.w + card.pad * 2);
  g.save();
  g.translate(GATE.x, GATE.y);
  g.scale(w / GATE.w, (top - GATE.y) / (card.h - card.pad * 2) || -0.0001);
  g.drawImage(card.c, (-card.w / 2) * k, -card.pad, card.w, card.h);
  g.restore();
}

function makeConfetti() {
  return Array.from({ length: 26 }, (_, i) => ({
    x: GATE.x + (hash(i, 1) - 0.5) * 120,
    vx: (hash(i, 2) - 0.5) * 160,
    vy: -160 - hash(i, 3) * 160,
    color: ['#e2574c', '#f2c12e', '#3e8ede', '#6cc06a', '#ffffff'][i % 5],
    spin: hash(i, 4) * 10
  }));
}

/* ───────────── Mise en scène ───────────── */

function knightState(s: FrameState) {
  // Entre par la gauche (beat 1), s'arrête devant les douves, traverse le pont (beat 5).
  let x = 150,
    y = KNIGHT_Y,
    pose: KnightPose = 'stand',
    pop = 1,
    hop = 0,
    flip = false,
    scale = 1;
  const walk = (dist: number): KnightPose => (Math.floor(dist / 16) % 2 ? 'walkA' : 'walkB');
  if (s.beat === 0) pop = 0;
  if (s.beat === 1) {
    pop = back(span(s.bt, 0, 0.4));
    const u = easeInOut(span(s.bt, 0.5, 2.8));
    x = lerp(150, 470, u);
    pose = u > 0 && u < 1 ? walk(x) : 'stand';
    if (u > 0 && u < 1) hop = Math.abs(Math.sin(x / 16 * Math.PI)) * 3;
  }
  if (s.beat >= 2) x = 470;
  if (s.beat === 2) {
    hop = s.bt > 0.2 && s.bt < 0.6 ? Math.sin(span(s.bt, 0.2, 0.6) * Math.PI) * 14 : 0;
    pose = s.bt > 0.6 ? 'sad' : 'stand';
  }
  if (s.beat === 3) pose = s.sinceTap !== null && s.sinceTap > 1.1 ? 'wave' : 'sad';
  if (s.beat === 4) {
    const ph = (s.bt * 2.4) % 1;
    hop = Math.sin(ph * Math.PI) * 16;
    pose = 'wave';
  }
  if (s.beat >= 5 || s.end !== null) {
    const bt = s.end !== null ? 99 : s.bt;
    const u1 = easeInOut(span(bt, 0.2, 0.9));
    const u2 = easeInOut(span(bt, 0.9, 2.6));
    x = lerp(470, GATE.x, u1);
    y = lerp(KNIGHT_Y, GATE.y + 6, u2);
    scale = lerp(1, 0.8, u2);
    const moving = (u1 > 0 && u1 < 1) || (u2 > 0 && u2 < 1);
    pose = moving ? walk(x + (KNIGHT_Y - y) * 1.5) : bt > 2.8 ? (Math.floor(bt * 3) % 2 ? 'wave' : 'stand') : 'stand';
    flip = bt > 2.7;
    if (moving) hop = Math.abs(Math.sin(((x + (KNIGHT_Y - y) * 1.5) / 16) * Math.PI)) * 3;
  }
  return { x, y, pose, pop, hop, flip, scale };
}

function create(): FilmScene {
  const desk = makeDesk();
  const light = makeLight();
  const sun = makeCard(68, 68, sunArt);
  const cloud = makeCard(100, 48, cloudArt);
  const boardArt = makeBoardArt(sun, cloud);
  const pieces: Piece[] = [
    { card: makeCard(540, 80, hillsArt), x: 480, base: 344, delay: 1.0 },
    { card: makeCard(230, 190, castleArt), x: GATE.x, base: GATE.y, delay: 1.25 },
    { card: makeCard(92, 110, treeArt(true)), x: 300, base: 424, delay: 1.5, sway: 0.03 },
    { card: makeCard(92, 110, treeArt(false)), x: 742, base: 432, delay: 1.62, sway: 0.03 },
    { card: makeCard(80, 52, bushArt), x: 210, base: 488, delay: 1.95, sway: 0.02 },
    { card: makeCard(80, 52, bushArt), x: 800, base: 492, delay: 2.05, sway: 0.02 }
  ];
  const bridge = makeCard(GATE.w, 66, bridgeArt, 3);
  const knights = Object.fromEntries((['walkA', 'walkB', 'stand', 'sad', 'wave'] as KnightPose[]).map((p) => [p, makeCard(60, 86, knightArt(p))])) as Record<KnightPose, Card>;
  const banner = makeCard(200, 60, (g) => {
    const sh = () => (g.beginPath(), g.roundRect(0, 0, 200, 60, 10));
    crescent(g, sh, '#fff6e0', '#f0dfb8', -3, -3);
    inked(g, sh);
    g.font = '600 38px "Fredoka", sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillStyle = '#e2574c';
    g.fillText('Merci !', 100, 32);
  });
  const confetti = makeConfetti();

  const popOf = (p: Piece, s: FrameState) => (s.beat > 0 || s.end !== null ? 1 : back(span(s.bt, p.delay, p.delay + 0.5)));

  return {
    render(g, s) {
      const t = s.t;
      g.drawImage(desk, 0, 0, W, H);
      // Le livre s'ouvre (beat 0), puis tout se déplie de l'arrière vers l'avant.
      const open = s.beat > 0 || s.end !== null ? 1 : easeInOut(span(s.bt, 0.15, 1.0));
      drawPage(g);
      drawBoard(g, open, boardArt);
      // Douves : du papier bleu posé à plat qui se déroule.
      const moat = s.beat > 0 || s.end !== null ? 1 : easeOut(span(s.bt, 1.7, 2.2));
      if (moat > 0) {
        g.save();
        g.translate(GATE.x, (GATE.y + MOAT_FRONT) / 2);
        g.scale(moat, 1);
        g.fillStyle = BORDER;
        g.beginPath();
        g.ellipse(0, 2, 214, 36, 0, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = '#4fa3e0';
        g.beginPath();
        g.ellipse(0, 0, 206, 30, 0, 0, Math.PI * 2);
        g.fill();
        g.strokeStyle = INK;
        g.lineWidth = 2.6;
        g.stroke();
        g.strokeStyle = 'rgba(255,255,255,0.7)';
        g.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
          const wx = -150 + i * 70 + Math.sin(t * 1.4 + i) * 6;
          g.beginPath();
          g.arc(wx, -6 + (i % 2) * 12, 9, Math.PI * 1.1, Math.PI * 1.9);
          g.stroke();
        }
        g.restore();
      }
      const lower = s.beat === 3 && s.sinceTap !== null ? clamp(spring(span(s.sinceTap, 0, 1.15), 1.4, 4.5), 0, 1.04) : s.beat > 3 || s.end !== null ? 1 : 0;
      const wiggle = s.beat === 3 && s.sinceTap === null && s.waiting ? Math.max(0, Math.sin(t * 3)) * 0.06 : 0;
      for (const p of pieces.slice(0, 2)) drawStanding(g, p.card, p.x, p.base, popOf(p, s));
      drawBridge(g, bridge, Math.min(1, lower) + wiggle, popOf(pieces[1], s));
      for (const p of pieces.slice(2, 4)) drawStanding(g, p.card, p.x, p.base, popOf(p, s), { sway: p.sway ? Math.sin(t * 1.3 + p.x) * p.sway : 0 });

      const k = knightState(s);
      drawStanding(g, knights[k.pose], k.x, k.y, k.pop, { flip: k.flip, scale: k.scale, lift: k.hop });
      for (const p of pieces.slice(4)) drawStanding(g, p.card, p.x, p.base, popOf(p, s), { sway: p.sway ? Math.sin(t * 1.3 + p.x) * p.sway : 0 });

      // Confettis de papier quand le pont se pose.
      if (s.beat === 3 && s.sinceTap !== null && s.sinceTap > 0.9) {
        const ct = s.sinceTap - 0.9;
        confetti.forEach((c, i) => {
          const x = c.x + c.vx * ct,
            y = GATE.y - 40 + c.vy * ct + 260 * ct * ct;
          if (y > PAGE.nearY) return;
          g.save();
          g.translate(x, y);
          g.rotate(c.spin * ct + i);
          g.fillStyle = c.color;
          g.fillRect(-4, -2.5, 8, 5);
          g.restore();
        });
      }

      // Panneau « Merci ! » qui descend sur deux ficelles et se balance.
      const bt5 = s.end !== null ? 99 : s.beat === 5 ? s.bt : -1;
      if (bt5 > 2.9) {
        const u = span(bt5, 2.9, 3.6);
        const y = lerp(-80, 150, back(u, 1.4));
        const swing = Math.sin((bt5 - 2.9) * 3) * 0.08 * Math.exp(-(bt5 - 2.9) * 0.8);
        g.save();
        g.translate(480, y - 70);
        g.rotate(swing);
        g.strokeStyle = '#e8e0cc';
        g.lineWidth = 1.6;
        g.beginPath();
        g.moveTo(-80, -200);
        g.lineTo(-80, 40);
        g.moveTo(80, -200);
        g.lineTo(80, 40);
        g.stroke();
        g.drawImage(banner.shadow, -banner.w / 2 + 6, 40 + 8, banner.w, banner.h);
        g.drawImage(banner.c, -banner.w / 2, 40, banner.w, banner.h);
        g.restore();
      }

      g.drawImage(light, 0, 0, W, H);
      subtitle(g, s.caption);
    },
    cues(s, prev, audio) {
      const cross = (t: number) => prev < t && s.bt >= t;
      const at = audio.now;
      if (s.beat === 0) {
        if (cross(0.15)) audio.paper(at, 0.8);
        if (cross(1.0)) audio.thump(at, 0.4);
        [1.0, 1.25, 1.5, 1.62, 1.7, 1.95, 2.05].forEach((t, i) => cross(t + 0.12) && audio.snap(at, 0.7 + (i % 3) * 0.15));
      }
      if (s.beat === 1) {
        if (cross(0.05)) audio.snap(at);
        for (let i = 0; i < 10; i++) if (cross(0.55 + i * 0.22)) audio.step(at);
      }
      if (s.beat === 2 && cross(0.25)) audio.slideWhistle(at, false, 0.5);
      if (s.beat === 3 && s.sinceTap !== null) {
        const p = prev - (s.bt - s.sinceTap);
        if (p < 0.9 && s.sinceTap >= 0.9) {
          audio.click(at);
          audio.chime(at + 0.1, [79, 84, 88]);
        }
      }
      if (s.beat === 5) {
        for (let i = 0; i < 12; i++) if (cross(0.25 + i * 0.2) && s.bt < 2.6) audio.step(at);
        if (cross(2.7)) audio.paper(at, 0.2);
        if (cross(2.9)) audio.slideWhistle(at, false, 0.5);
        if (cross(3.5)) audio.chime(at);
      }
    },
    onTap(_b, audio) {
      audio.paper(audio.now, 0.5, 1.2);
      audio.tone(320, audio.now, 0.9, { gain: 0.08, to: 180, wave: 'triangle' });
    },
    dispose() {
      [desk, light, boardArt].forEach((c) => {
        c.width = 0;
        c.height = 0;
      });
    }
  };
}

/** Sous-titres : texte crème, épais contour brun, ombre douce, en bas au centre. */
function subtitle(g: CanvasRenderingContext2D, text: string) {
  g.save();
  g.font = '600 24px "Fredoka", sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  const lines = wrap(g, text, 900);
  lines.forEach((l, i) => {
    const y = 516 - (lines.length - 1 - i) * 30;
    g.shadowColor = 'rgba(0,0,0,0.35)';
    g.shadowBlur = 6;
    g.lineJoin = 'round';
    g.lineWidth = 7;
    g.strokeStyle = INK;
    g.strokeText(l, 480, y);
    g.shadowBlur = 0;
    g.fillStyle = '#fff6e0';
    g.fillText(l, 480, y);
  });
  g.restore();
}

/* ───────────── Musique : valse de papier (glockenspiel + pizzicati, originale) ───────────── */

const WALTZ = [
  [67, 0, 71, 0, 74, 0], [72, 0, 71, 0, 69, 0], [67, 0, 69, 71, 72, 0], [74, 0, 0, 0, 0, 0],
  [76, 0, 74, 0, 72, 0], [71, 0, 72, 0, 74, 0], [72, 0, 71, 0, 69, 0], [67, 0, 0, 0, 0, 0]
];
const WALTZ_BASS = [43, 48, 50, 43, 48, 43, 50, 43];

export const popup: Film = {
  id: 'film-chateau',
  title: 'Ouvre la porte du château !',
  emoji: '🏰',
  style: 'paper-popup',
  styleLabel: 'Livre pop-up en papier',
  goal: 'Pointer et taper, se sentir capable d’agir',
  mood: 'defi',
  poster: { beat: 5, bt: 3.9 },
  beats: [
    { text: 'Le livre s’ouvre… et le château pousse, tout en papier !', min: 4.6, hold: 0.4 },
    { text: 'Voici un petit chevalier. Il veut rentrer chez lui.', min: 3.4, hold: 0.4 },
    { text: 'Oh non ! Le pont-levis est relevé.', min: 2.8, hold: 0.5 },
    {
      text: 'Peux-tu aider le chevalier ? Tape sur le pont pour le faire descendre !',
      hold: 1.9,
      tap: {
        hint: 'Tape sur le pont',
        at: () => ({ x: GATE.x, y: GATE.y - GATE.h / 2 }),
        hit: (x, y) => x > GATE.x - 90 && x < GATE.x + 90 && y > GATE.y - GATE.h - 40 && y < MOAT_FRONT + 20
      }
    },
    { text: 'Clic ! Le pont descend. Bravo !', min: 2.6, hold: 0.4 },
    { text: 'Le chevalier traverse… et il te dit merci !', min: 4.4, hold: 1.6 }
  ],
  music(audio) {
    return loop(audio, 60 / 100 / 2, (step, at) => {
      const bar = Math.floor(step / 6) % 8;
      const k = step % 6;
      const n = WALTZ[bar][k];
      if (n) audio.glock(n + 12, at, 0.75);
      if (k === 0) audio.pizz(WALTZ_BASS[bar], at, 1);
      if (k === 2 || k === 4) audio.pizz(WALTZ_BASS[bar] + 16, at, 0.6);
    });
  },
  create
};
