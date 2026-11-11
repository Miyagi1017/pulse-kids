/**
 * 🎵 « La Danse des Chaussettes Rigolotes » — style 1930s Rubber Hose Cartoon.
 * Décor peint en gris dans un cadre 4:3 de vieille pellicule (rayures, poussières, scintillement),
 * personnages encrés aux bras en tuyau et gants blancs, yeux « en part de tarte », tout respire sur le temps.
 * Seules les chaussettes sont en couleur (rouge, bleue, jaune) : on apprend à compter jusqu'à 3 et les couleurs.
 * Quand il manque la troisième chaussette, l'orchestre s'arrête net et tout se fige jusqu'au toucher de l'enfant.
 */
import { loop, type FilmAudio } from './audio';
import { H, W, back, clamp, easeInOut, easeOut, hash, lerp, onTwos, span, spring, type Film, type FilmScene, type FrameState } from './engine';
import { RES, canvas, ctx2d, wrap } from './crayon';

const BPM = 120;
const BEAT = 60 / BPM; // 0,5 s = 12 images à 24 i/s : chaque temps tombe sur un dessin.
const GATE = { x: 120, y: 0, w: 720, h: 540, r: 22 };
const FLOOR = 404;
const INK = '#141210';

/** Rampe de gris chaude (6 marches) ; le blanc et le noir pur sont réservés aux personnages. */
const G = ['#3f3a35', '#5a544d', '#757069', '#8f8a82', '#a8a39a', '#bdb8ae'];

const SOCKS = [
  { color: '#e0383b', shade: '#a81f2a', name: 'rouge' },
  { color: '#3567de', shade: '#2343a3', name: 'bleue' },
  { color: '#f2c12e', shade: '#c08f12', name: 'jaune' }
];
const LINE_X = [360, 520, 680];
const DRESSER = { x: 140, y: 214, w: 156, h: 170 };
const DRAWER = { x: 150, y: 224, w: 136, h: 42 };

/* ───────────── Peinture du décor (une fois) ───────────── */

function painted(g: CanvasRenderingContext2D, draw: () => void, grey: string, seed: number, outline = true) {
  g.save();
  draw();
  g.fillStyle = grey;
  g.fill();
  g.clip();
  // Taches de lavis (±5 %) et bord intérieur un peu plus sombre.
  for (let i = 0; i < 9; i++) {
    const x = hash(seed, i) * W,
      y = hash(seed, i, 2) * H,
      r = 30 + hash(seed, i, 3) * 90;
    const grd = g.createRadialGradient(x, y, 0, x, y, r);
    const light = hash(seed, i, 4) > 0.5;
    grd.addColorStop(0, light ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  g.lineWidth = 8;
  g.strokeStyle = 'rgba(0,0,0,0.12)';
  draw();
  g.stroke();
  g.restore();
  if (outline) {
    g.save();
    draw();
    g.lineWidth = 1.6;
    g.strokeStyle = G[0];
    g.stroke();
    g.restore();
  }
}

function makeBackground() {
  const c = canvas();
  const g = ctx2d(c);
  // Mur à papier peint (losanges), plinthe, sol en damier en perspective.
  painted(g, () => (g.beginPath(), g.rect(GATE.x, 0, GATE.w, FLOOR - 40)), G[3], 1, false);
  g.save();
  g.fillStyle = 'rgba(255,255,255,0.08)';
  for (let y = 20; y < FLOOR - 50; y += 40)
    for (let x = GATE.x + ((y / 40) % 2) * 30; x < GATE.x + GATE.w; x += 60) {
      g.beginPath();
      g.moveTo(x, y - 9);
      g.lineTo(x + 7, y);
      g.lineTo(x, y + 9);
      g.lineTo(x - 7, y);
      g.closePath();
      g.fill();
    }
  g.restore();
  painted(g, () => (g.beginPath(), g.rect(GATE.x, FLOOR - 52, GATE.w, 14)), G[1], 2);
  painted(g, () => (g.beginPath(), g.rect(GATE.x, FLOOR - 38, GATE.w, H - FLOOR + 38)), G[2], 3, false);
  const horizon = { x: 480, y: 120 };
  for (let r = 0; r < 6; r++) {
    const y0 = FLOOR - 38 + (r === 0 ? 0 : 6 * r * r);
    const y1 = FLOOR - 38 + 6 * (r + 1) * (r + 1);
    for (let k = -12; k < 12; k++) {
      if ((k + r) % 2 === 0) continue;
      const px = (y: number, kk: number) => horizon.x + (kk * 70 * (y - horizon.y)) / (FLOOR - horizon.y);
      g.beginPath();
      g.moveTo(px(y0, k), y0);
      g.lineTo(px(y0, k + 1), y0);
      g.lineTo(px(y1, k + 1), y1);
      g.lineTo(px(y1, k), y1);
      g.closePath();
      g.fillStyle = 'rgba(30,26,22,0.32)';
      g.fill();
    }
  }
  // Un cadre au mur et une fenêtre ronde : motifs d'époque.
  painted(g, () => (g.beginPath(), g.rect(470, 200, 130, 96)), G[1], 4);
  painted(g, () => (g.beginPath(), g.rect(482, 212, 106, 72)), G[4], 5);
  g.save();
  g.strokeStyle = G[1];
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(490, 270);
  g.lineTo(522, 236);
  g.lineTo(544, 258);
  g.lineTo(562, 242);
  g.lineTo(582, 270);
  g.stroke();
  g.restore();
  painted(g, () => (g.beginPath(), g.arc(730, 230, 40, 0, Math.PI * 2)), G[1], 6);
  painted(g, () => (g.beginPath(), g.arc(730, 230, 31, 0, Math.PI * 2)), G[5], 7);
  return c;
}

function makeDresser() {
  const pad = 20;
  const c = canvas(Math.ceil((DRESSER.w + pad * 2) * RES), Math.ceil((DRESSER.h + pad * 2 + 60) * RES));
  const g = c.getContext('2d')!;
  g.setTransform(RES, 0, 0, RES, 0, 0);
  g.translate(pad - DRESSER.x, pad + 60 - DRESSER.y);
  const { x, y, w, h } = DRESSER;
  // Pieds, caisse, deux tiroirs du bas (le tiroir du haut est un accessoire animé).
  painted(g, () => (g.beginPath(), g.rect(x + 10, y + h - 4, 14, 22)), G[0], 10);
  painted(g, () => (g.beginPath(), g.rect(x + w - 24, y + h - 4, 14, 22)), G[0], 11);
  painted(g, () => (g.beginPath(), g.roundRect(x, y, w, h, 6)), G[1], 12);
  painted(g, () => (g.beginPath(), g.rect(DRAWER.x, DRAWER.y, DRAWER.w, DRAWER.h)), INK, 13, false);
  for (const yy of [y + 62, y + 114]) {
    painted(g, () => (g.beginPath(), g.roundRect(x + 10, yy, w - 20, 44, 4)), G[2], 14 + yy);
    painted(g, () => (g.beginPath(), g.arc(x + w / 2, yy + 22, 6, 0, Math.PI * 2)), G[5], 15 + yy);
  }
  // Lampe sur la commode.
  painted(g, () => (g.beginPath(), g.rect(x + w / 2 - 4, y - 30, 8, 30)), G[0], 20);
  painted(g, () => (g.beginPath(), g.moveTo(x + w / 2 - 34, y - 30), g.lineTo(x + w / 2 + 34, y - 30), g.lineTo(x + w / 2 + 20, y - 62), g.lineTo(x + w / 2 - 20, y - 62), g.closePath()), G[5], 21);
  return { c, pad };
}

/* ───────────── Personnages ───────────── */

interface SockPose {
  x: number;
  y: number;
  squash: number;
  lean: number;
  armL: [number, number] | null;
  armR: [number, number] | null;
  look: number;
  mouth: 'smile' | 'grin' | 'O';
  blink: boolean;
  scale: number;
}

/** Contour de la chaussette (vue de profil, le pied vers la droite), origine au sol sous le talon. */
const SOCK_PTS: [number, number][] = [
  [-24, -122], [24, -122], [24, -48], [30, -40], [44, -32], [52, -16], [46, -2], [30, 0], [-12, 0], [-24, -10], [-28, -28], [-24, -48]
];

function sockPath(g: CanvasRenderingContext2D, boil: number, seed: number) {
  const P = SOCK_PTS.map(([x, y], i) => [x + (hash(seed, i, boil) - 0.5) * 2.2, y + (hash(seed, i, boil, 1) - 0.5) * 2.2]);
  g.beginPath();
  for (let i = 0; i < P.length; i++) {
    const a = P[i],
      b = P[(i + 1) % P.length];
    const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    if (i === 0) g.moveTo(m[0], m[1]);
    else g.quadraticCurveTo(a[0], a[1], m[0], m[1]);
  }
  const a = P[0],
    b = P[1];
  g.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
  g.closePath();
}

function glove(g: CanvasRenderingContext2D, x: number, y: number, angle: number) {
  g.save();
  g.translate(x, y);
  g.rotate(angle);
  const parts = (fn: (dx: number, dy: number, r: number) => void) => {
    fn(0, 0, 9);
    fn(8, -6, 4.6);
    fn(10, 0, 4.6);
    fn(8, 6, 4.6);
    fn(-2, -9, 4.2);
  };
  // On encre l'union : tout en épais d'abord, puis tout en blanc par-dessus.
  g.fillStyle = INK;
  parts((dx, dy, r) => (g.beginPath(), g.arc(dx, dy, r + 2.6, 0, Math.PI * 2), g.fill()));
  g.fillStyle = '#ffffff';
  parts((dx, dy, r) => (g.beginPath(), g.arc(dx, dy, r, 0, Math.PI * 2), g.fill()));
  g.strokeStyle = INK;
  g.lineWidth = 1.4;
  for (const dy of [-3, 0, 3]) {
    g.beginPath();
    g.moveTo(-5, dy);
    g.lineTo(1, dy);
    g.stroke();
  }
  g.restore();
}

function hose(g: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, sag: number) {
  g.save();
  g.strokeStyle = INK;
  g.lineWidth = 5.5;
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(x0, y0);
  g.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 + sag, x1, y1);
  g.stroke();
  g.restore();
}

function pieEye(g: CanvasRenderingContext2D, x: number, y: number, look: number, blink: boolean) {
  g.save();
  g.fillStyle = '#ffffff';
  g.strokeStyle = INK;
  g.lineWidth = 2.4;
  g.beginPath();
  g.ellipse(x, y, 7.5, 10, 0, 0, Math.PI * 2);
  g.fill();
  g.stroke();
  if (blink) {
    g.beginPath();
    g.moveTo(x - 7, y);
    g.lineTo(x + 7, y);
    g.stroke();
  } else {
    // Pupille noire avec une part de tarte découpée vers le haut à droite.
    const px = x + look * 2.4,
      py = y + 1.5;
    const a = -Math.PI / 4;
    g.fillStyle = INK;
    g.beginPath();
    g.moveTo(px, py);
    g.ellipse(px, py, 4.8, 7.4, 0, a + 0.32, a - 0.32 + Math.PI * 2);
    g.closePath();
    g.fill();
  }
  g.restore();
}

function drawSock(g: CanvasRenderingContext2D, i: number, p: SockPose, boil: number) {
  const sk = SOCKS[i];
  g.save();
  g.translate(p.x, p.y);
  g.scale(p.scale * (1 + p.squash * 0.6), p.scale * (1 - p.squash));
  g.rotate(p.lean);
  const seed = 300 + i * 40;
  // Bras derrière le corps quand ils partent vers l'arrière.
  const shoulder = { l: [-22, -76] as [number, number], r: [22, -76] as [number, number] };
  const arm = (side: 'l' | 'r', target: [number, number] | null) => {
    const [sx, sy] = shoulder[side];
    const [tx, ty] = target ?? (side === 'l' ? [-40, -46] : [40, -46]);
    hose(g, sx, sy, tx, ty, 10);
    glove(g, tx, ty, Math.atan2(ty - sy, tx - sx));
  };
  // Corps : aplat, bande d'ombre dure côté opposé à la lumière (en haut à gauche), encre.
  sockPath(g, boil, seed);
  g.fillStyle = sk.color;
  g.fill();
  g.save();
  sockPath(g, boil, seed);
  g.clip();
  g.fillStyle = sk.shade;
  g.fillRect(12, -130, 60, 140);
  g.fillRect(-40, -12, 120, 20);
  // Revers blanc à rayures.
  g.fillStyle = '#ffffff';
  g.fillRect(-30, -130, 60, 26);
  g.fillStyle = '#c9c4ba';
  g.fillRect(12, -130, 20, 26);
  g.fillStyle = INK;
  g.fillRect(-30, -116, 60, 2.6);
  g.fillRect(-30, -109, 60, 2.6);
  g.restore();
  sockPath(g, boil, seed);
  g.strokeStyle = INK;
  g.lineWidth = 3.4;
  g.stroke();
  // Visage.
  pieEye(g, -8, -84, p.look, p.blink);
  pieEye(g, 10, -84, p.look, p.blink);
  g.strokeStyle = INK;
  g.lineWidth = 2.6;
  g.lineCap = 'round';
  if (p.mouth === 'O') {
    g.fillStyle = INK;
    g.beginPath();
    g.ellipse(1, -60, 5, 7, 0, 0, Math.PI * 2);
    g.fill();
  } else {
    g.beginPath();
    g.arc(1, p.mouth === 'grin' ? -66 : -64, p.mouth === 'grin' ? 11 : 9, 0.25, Math.PI - 0.25);
    if (p.mouth === 'grin') {
      g.closePath();
      g.fillStyle = INK;
      g.fill();
      g.fillStyle = '#e05a6a';
      g.beginPath();
      g.ellipse(1, -58, 5, 3, 0, 0, Math.PI * 2);
      g.fill();
    } else g.stroke();
    // Petites virgules aux coins de la bouche.
    g.beginPath();
    g.moveTo(-10, -62);
    g.lineTo(-12, -66);
    g.moveTo(12, -62);
    g.lineTo(14, -66);
    g.stroke();
  }
  arm('l', p.armL);
  arm('r', p.armR);
  g.restore();
}

/* ───────────── Mise en scène ───────────── */

/** Respiration sur le temps (étirement sur le temps, tassement à contretemps), échantillonnée sur les deux. */
function breath(t: number, frozen: boolean) {
  if (frozen) return 0;
  const beats = onTwos(t) / 12 / BEAT;
  return Math.cos(2 * Math.PI * beats);
}

function hopOnBeat(t: number, amp: number) {
  const ph = (onTwos(t) / 12 / BEAT) % 1;
  return -Math.sin(ph * Math.PI) * amp;
}

function defaultPose(i: number, x: number, y: number, b: number): SockPose {
  return { x, y, squash: b * 0.05, lean: 0, armL: null, armR: null, look: 0, mouth: 'smile', blink: false, scale: 1 };
}

function sockPoses(s: FrameState, frozen: boolean): (SockPose | null)[] {
  const b = breath(s.t, frozen);
  const out: (SockPose | null)[] = [null, null, null];
  const after = (beat: number) => s.beat > beat || s.end !== null;
  const blink = (i: number) => hash(i, Math.floor(s.t * 0.7)) > 0.85 && (s.t * 0.7) % 1 < 0.15;

  // Rouge : sort du tiroir (beat 1).
  if (s.beat === 1) {
    const u = span(s.bt, 0.35, 0.95);
    if (u > 0) {
      const x = lerp(DRAWER.x + DRAWER.w / 2, LINE_X[0], u);
      const y = lerp(DRAWER.y + 10, FLOOR, u) - Math.sin(u * Math.PI) * 110;
      const land = s.bt - 0.95;
      const squash = u < 1 ? -0.12 : 0.28 * Math.exp(-land * 6) * Math.cos(land * 18);
      out[0] = { ...defaultPose(0, x, y, b), squash, mouth: u < 1 ? 'O' : 'grin', armL: u < 1 ? [-34, -120] : null, armR: u < 1 ? [34, -120] : null };
    } else if (s.bt < 0.35) out[0] = null;
  } else if (after(1)) out[0] = defaultPose(0, LINE_X[0], FLOOR, b);

  // Bleue : glisse depuis la droite (beat 2).
  if (s.beat === 2) {
    const u = easeOut(span(s.bt, 0.05, 1.0));
    const stop = s.bt - 1.0;
    out[1] = {
      ...defaultPose(1, lerp(GATE.x + GATE.w + 70, LINE_X[1], u), FLOOR, b),
      lean: u < 1 ? 0.22 : -0.12 * Math.exp(-stop * 5) * Math.cos(stop * 16),
      squash: u < 1 ? 0 : 0.2 * Math.exp(-stop * 6),
      armL: u < 1 ? [-48, -96] : null,
      armR: u < 1 ? [44, -100] : null,
      mouth: u < 1 ? 'O' : 'grin'
    };
  } else if (after(2)) out[1] = defaultPose(1, LINE_X[1], FLOOR, b);

  // Jaune : sort quand l'enfant touche le tiroir (beat 3).
  if (s.beat === 3 && s.sinceTap !== null) {
    const u = span(s.sinceTap, 0.25, 0.95);
    if (u > 0) {
      const x = lerp(DRAWER.x + DRAWER.w / 2, LINE_X[2], u);
      const y = lerp(DRAWER.y + 10, FLOOR, u) - Math.sin(u * Math.PI) * 150;
      const land = s.sinceTap - 0.95;
      out[2] = { ...defaultPose(2, x, y, b), squash: u < 1 ? -0.12 : 0.28 * Math.exp(-land * 6) * Math.cos(land * 18), mouth: u < 1 ? 'O' : 'grin', armL: u < 1 ? [-34, -120] : null, armR: u < 1 ? [34, -120] : null };
    }
  } else if (after(3)) out[2] = defaultPose(2, LINE_X[2], FLOOR, b);

  // Beat 3 : les deux premières regardent le tiroir et le montrent du doigt.
  if (s.beat === 3 && s.sinceTap === null) {
    for (const i of [0, 1]) if (out[i]) out[i] = { ...out[i]!, look: -1, armL: [-58, -96], mouth: 'O' };
  }

  // Beat 4 : la ronde. Un tour complet, puis tout le monde revient en ligne.
  if (s.beat === 4) {
    const ang = 2 * Math.PI * easeInOut(span(s.bt, 0.5, 3.6));
    const a0 = [Math.PI, Math.PI / 2, 0];
    for (let i = 0; i < 3; i++) {
      const a = a0[i] - ang;
      out[i] = {
        ...defaultPose(i, 520 + Math.cos(a) * 160, FLOOR + 26 * (Math.sin(a) - Math.sin(a0[i])), b),
        scale: 0.92 + 0.08 * ((Math.sin(a) + 1) / 2),
        mouth: 'grin',
        squash: b * 0.07 + (span(s.bt, 0.5, 3.6) > 0 && span(s.bt, 0.5, 3.6) < 1 ? hopOnBeat(s.t, 0.06) : 0)
      };
    }
  }

  // Beat 5 : on compte ! Chaque chaussette saute à son numéro.
  if (s.beat === 5) {
    COUNT_AT.forEach((t0, i) => {
      const u = span(s.bt, t0, t0 + 0.55);
      const p = out[i]!;
      const jump = u > 0 && u < 1 ? Math.sin(u * Math.PI) * 60 : 0;
      out[i] = { ...p, y: FLOOR - jump, mouth: u > 0 ? 'grin' : 'smile', armL: u > 0 && u < 1 ? [-34, -126] : p.armL, armR: u > 0 && u < 1 ? [34, -126] : p.armR, squash: u >= 1 && u < 1.2 ? 0.15 : p.squash };
    });
  }

  // Beat 6 et fin : bravo, tout le monde saute en alternance, bras en l'air.
  if (s.beat === 6 || s.end !== null) {
    for (let i = 0; i < 3; i++) {
      const ph = ((onTwos(s.t) / 12 / BEAT + i * 0.33) % 1) * Math.PI;
      out[i] = { ...defaultPose(i, LINE_X[i], FLOOR - Math.sin(ph) * 34, b), mouth: 'grin', armL: [-36, -128], armR: [36, -128] };
    }
  }

  for (let i = 0; i < 3; i++) if (out[i] && !out[i]!.blink) out[i] = { ...out[i]!, blink: blink(i) };
  return out;
}

const COUNT_AT = [0.6, 1.5, 2.4];

/* ───────────── Titres et cartons ───────────── */

function title(g: CanvasRenderingContext2D, s: FrameState) {
  if (s.beat !== 0) return;
  const text = 'La Danse des Chaussettes';
  g.save();
  g.font = '44px "Shrikhand", "Fredoka", serif';
  g.textBaseline = 'alphabetic';
  const total = g.measureText(text).width;
  let x = 480 - total / 2;
  const ph = onTwos(s.t) / 12 / BEAT;
  [...text].forEach((ch, i) => {
    const w = g.measureText(ch).width;
    const appear = span(s.bt, 0.2 + i * 0.04, 0.3 + i * 0.04);
    if (appear > 0) {
      // Les lettres sautent en vague sur le temps.
      const hop = -Math.max(0, Math.sin((ph - i * 0.06) * Math.PI * 2)) * 5;
      const y = 112 + hop + (1 - back(appear)) * 40;
      g.lineJoin = 'round';
      g.fillStyle = INK;
      g.fillText(ch, x + 4, y + 5);
      g.lineWidth = 7;
      g.strokeStyle = INK;
      g.strokeText(ch, x, y);
      g.fillStyle = '#ffffff';
      g.fillText(ch, x, y);
    }
    x += w;
  });
  if (s.bt > 1.4) {
    g.font = '26px "IM Fell English SC", serif';
    g.textAlign = 'center';
    g.lineWidth = 5;
    g.strokeStyle = INK;
    g.strokeText('— rigolotes ! —', 480, 152);
    g.fillStyle = '#ffffff';
    g.fillText('— rigolotes ! —', 480, 152);
  }
  g.restore();
}

/** Sous-titre en carton d'époque : plaque presque noire, double filet blanc, coins ornés. */
function card(g: CanvasRenderingContext2D, text: string, top: boolean) {
  g.save();
  g.font = '21px "IM Fell English SC", serif';
  const lines = wrap(g, text, 520);
  const w = Math.max(...lines.map((l) => g.measureText(l).width)) + 56;
  const h = lines.length * 26 + 28;
  const x = 480 - w / 2;
  const y = top ? 24 : 524 - h;
  g.fillStyle = '#16130f';
  g.fillRect(x, y, w, h);
  g.strokeStyle = '#f4f1ea';
  g.lineWidth = 1.6;
  g.strokeRect(x + 5, y + 5, w - 10, h - 10);
  g.lineWidth = 0.8;
  g.strokeRect(x + 9, y + 9, w - 18, h - 18);
  for (const [cx, cy] of [[x + 9, y + 9], [x + w - 9, y + 9], [x + 9, y + h - 9], [x + w - 9, y + h - 9]]) {
    g.beginPath();
    g.arc(cx, cy, 3.6, 0, Math.PI * 2);
    g.stroke();
    g.fillStyle = '#f4f1ea';
    g.beginPath();
    g.arc(cx, cy, 1.4, 0, Math.PI * 2);
    g.fill();
  }
  g.fillStyle = '#f4f1ea';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  lines.forEach((l, i) => g.fillText(l, 480, y + h / 2 + (i - (lines.length - 1) / 2) * 26));
  g.restore();
}

function bigNumber(g: CanvasRenderingContext2D, n: number, x: number, y: number, u: number) {
  if (u <= 0) return;
  g.save();
  const k = back(clamp(u * 2.2));
  g.translate(x, y);
  g.scale(k, k);
  g.font = '64px "Shrikhand", serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = INK;
  g.fillText(String(n), 4, 5);
  g.lineWidth = 8;
  g.lineJoin = 'round';
  g.strokeStyle = INK;
  g.strokeText(String(n), 0, 0);
  g.fillStyle = SOCKS[n - 1].color;
  g.fillText(String(n), 0, 0);
  g.restore();
}

/* ───────────── Pellicule ───────────── */

function makeVignette() {
  const c = canvas();
  const g = ctx2d(c);
  const grd = g.createRadialGradient(480, 270, 180, 480, 270, 470);
  grd.addColorStop(0, 'rgba(0,0,0,0)');
  grd.addColorStop(1, 'rgba(0,0,0,0.55)');
  g.fillStyle = grd;
  g.fillRect(0, 0, W, H);
  return c;
}

function filmDamage(g: CanvasRenderingContext2D, t: number, vignette: HTMLCanvasElement, still: boolean) {
  const f = Math.floor(t * 24);
  g.save();
  g.drawImage(vignette, 0, 0, W, H);
  if (!still) {
    g.fillStyle = `rgba(0,0,0,${hash(f, 1) * 0.07})`;
    g.fillRect(GATE.x, 0, GATE.w, H);
  }
  // Rayures verticales qui dérivent lentement.
  const seg = Math.floor(t * 1.3);
  const n = Math.floor(hash(seg, 2) * 3.2);
  for (let i = 0; i < n; i++) {
    const x = GATE.x + 40 + hash(seg, i, 3) * (GATE.w - 80) + Math.sin(t * 3 + i) * 4;
    g.strokeStyle = hash(seg, i, 4) > 0.5 ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)';
    g.lineWidth = 0.8 + hash(seg, i, 5);
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x + hash(seg, i, 6) * 6 - 3, H);
    g.stroke();
  }
  // Poussières.
  const dust = 3 + Math.floor(hash(f, 7) * 6);
  for (let i = 0; i < dust; i++) {
    g.fillStyle = hash(f, i, 8) > 0.6 ? 'rgba(255,255,255,0.6)' : 'rgba(10,8,6,0.6)';
    g.beginPath();
    g.ellipse(GATE.x + hash(f, i, 9) * GATE.w, hash(f, i, 10) * H, 0.6 + hash(f, i, 11) * 2, 0.6 + hash(f, i, 12) * 1.6, hash(f, i) * 3, 0, Math.PI * 2);
    g.fill();
  }
  // Un cheveu de temps en temps.
  if (hash(Math.floor(t * 2), 13) > 0.86) {
    const hx = GATE.x + hash(Math.floor(t * 2), 14) * GATE.w,
      hy = hash(Math.floor(t * 2), 15) * H;
    g.strokeStyle = 'rgba(10,8,6,0.55)';
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(hx, hy);
    g.bezierCurveTo(hx + 20, hy - 30, hx + 10, hy + 40, hx + 36, hy + 20);
    g.stroke();
  }
  g.restore();
}

/* ───────────── Scène ───────────── */

function create(): FilmScene {
  const bg = makeBackground();
  const dresser = makeDresser();
  const vignette = makeVignette();

  return {
    render(g, s) {
      const frozen = s.waiting;
      const b = breath(s.t, frozen);
      g.save();
      g.fillStyle = '#000';
      g.fillRect(0, 0, W, H);
      // Fenêtre 4:3 aux coins arrondis, qui ondule un peu (gate weave) et saute à chaque changement de plan.
      const f = Math.floor(s.t * 24);
      const weave = s.still ? [0, 0] : [Math.sin(s.t * 1.7) * 1.2 + (hash(f, 21) > 0.985 ? 3 : 0), Math.cos(s.t * 1.3) * 1.2];
      g.beginPath();
      g.roundRect(GATE.x, GATE.y, GATE.w, GATE.h, GATE.r);
      g.clip();
      g.translate(weave[0], weave[1]);
      // Fond qui se tasse un peu sur la ligne du sol au moment de joie.
      const joy = s.beat === 6 || s.end !== null ? 0.02 * b : 0;
      g.save();
      g.translate(0, FLOOR);
      g.scale(1, 1 + joy);
      g.translate(0, -FLOOR);
      g.drawImage(bg, 0, 0, W, H);
      g.restore();

      // Commode qui respire sur le temps ; le tiroir du haut s'ouvre et tremble.
      g.save();
      g.translate(DRESSER.x + DRESSER.w / 2, DRESSER.y + DRESSER.h);
      g.scale(1 - b * 0.03, 1 + b * 0.05);
      g.translate(-(DRESSER.x + DRESSER.w / 2), -(DRESSER.y + DRESSER.h));
      const sw = dresser.c.width / RES,
        sh = dresser.c.height / RES;
      g.drawImage(dresser.c, DRESSER.x - dresser.pad, DRESSER.y - dresser.pad - 60, sw, sh);
      let open = 0;
      let shake = 0;
      if (s.beat === 1) open = Math.min(easeOut(span(s.bt, 0, 0.3)), 1 - span(s.bt, 1.1, 1.3));
      if (s.beat === 3 && s.sinceTap === null) shake = Math.sin(s.t * 40) * (s.waiting ? 2.4 : 0);
      if (s.beat === 3 && s.sinceTap !== null) open = Math.min(easeOut(span(s.sinceTap, 0, 0.25)), 1 - span(s.sinceTap, 1.1, 1.3));
      const dy = open * 14;
      g.fillStyle = G[2];
      g.strokeStyle = G[0];
      g.lineWidth = 1.6;
      g.beginPath();
      g.roundRect(DRAWER.x - open * 4 + shake, DRAWER.y + dy - open * 6, DRAWER.w + open * 8, DRAWER.h + open * 6, 4);
      g.fill();
      g.stroke();
      g.fillStyle = G[5];
      g.beginPath();
      g.arc(DRAWER.x + DRAWER.w / 2 + shake, DRAWER.y + dy + DRAWER.h / 2 - open * 3, 6 + open * 1.5, 0, Math.PI * 2);
      g.fill();
      g.stroke();
      g.restore();

      // Bras de la ronde (derrière tout le monde), puis chaussettes de l'arrière vers l'avant.
      const poses = sockPoses(s, frozen);
      if (s.beat === 4 && span(s.bt, 0.4, 3.7) > 0 && span(s.bt, 0.4, 3.7) < 1) {
        const ps = poses.filter(Boolean) as SockPose[];
        for (let i = 0; i < ps.length; i++) {
          const a = ps[i],
            c = ps[(i + 1) % ps.length];
          hose(g, a.x + 20, a.y - 76 * a.scale, c.x - 20, c.y - 76 * c.scale, 16);
          glove(g, (a.x + c.x) / 2, (a.y + c.y) / 2 - 64, 0);
        }
      }
      const boil = onTwos(s.t) % 3;
      poses
        .map((p, i) => ({ p, i }))
        .filter((e) => e.p)
        .sort((a, c) => a.p!.y - c.p!.y)
        .forEach(({ p, i }) => drawSock(g, i, p!, frozen ? 0 : boil));

      if (s.beat === 5) COUNT_AT.forEach((t0, i) => bigNumber(g, i + 1, LINE_X[i], FLOOR - 186, span(s.bt, t0, t0 + 0.6)));
      title(g, s);
      card(g, s.caption, false);

      // Iris qui se ferme à la fin.
      if (s.end !== null) {
        const r = lerp(560, 120, easeInOut(span(s.end, 0.6, 2.2)));
        g.fillStyle = '#000';
        g.beginPath();
        g.rect(0, 0, W, H);
        g.arc(520, FLOOR - 70, Math.max(0.1, r), 0, Math.PI * 2);
        g.fill('evenodd');
      }
      filmDamage(g, s.t, vignette, !!s.still);
      g.restore();
    },
    cues(s, prev, audio) {
      const cross = (t: number) => prev < t && s.bt >= t;
      const at = audio.now;
      if (s.beat === 1) {
        if (cross(0.02)) audio.thump(at, 0.5);
        if (cross(0.35)) audio.boing(at);
        if (cross(0.95)) audio.thump(at);
      }
      if (s.beat === 2) {
        if (cross(0.05)) audio.slideWhistle(at, false, 0.9);
        if (cross(1.0)) audio.thump(at);
      }
      if (s.beat === 3 && s.sinceTap !== null) {
        const p = prev - (s.bt - s.sinceTap);
        if (p < 0.95 && s.sinceTap >= 0.95) audio.thump(at);
      }
      if (s.beat === 4 && cross(0.5)) audio.slideWhistle(at, true, 0.5);
      if (s.beat === 5) COUNT_AT.forEach((t0, i) => cross(t0) && audio.glock([72, 76, 79][i], at, 1.2, 'sfx'));
      if (s.beat === 6 && cross(0.1)) audio.chime(at, [72, 76, 79, 84]);
    },
    onTap(_b, audio) {
      audio.thump(audio.now, 0.6);
      audio.boing(audio.now + 0.25);
    },
    dispose() {
      [bg, dresser.c, vignette].forEach((c) => {
        c.width = 0;
        c.height = 0;
      });
    }
  };
}

/* ───────────── Musique : petit orchestre de bal (original) ───────────── */

const CHORDS = [
  [60, 64, 67], [60, 64, 67], [65, 69, 72], [65, 69, 72], [60, 64, 67], [67, 71, 74], [60, 64, 67], [60, 64, 67]
];
const ROOTS = [36, 36, 41, 41, 36, 43, 36, 36];
const MELODY = [
  [72, 0, 76, 79, 0, 76, 0, 72], [0, 74, 76, 0, 72, 0, 0, 0], [77, 0, 81, 77, 0, 76, 0, 74], [72, 0, 0, 69, 72, 0, 0, 0],
  [76, 0, 79, 84, 0, 79, 0, 76], [74, 0, 77, 79, 0, 77, 74, 0], [72, 0, 76, 0, 74, 0, 71, 0], [72, 0, 0, 0, 67, 0, 72, 0]
];

export const chaussettes: Film = {
  id: 'film-chaussettes',
  title: 'La Danse des Chaussettes',
  emoji: '🧦',
  style: 'rubber-hose',
  styleLabel: 'Dessin animé des années 30',
  goal: 'Compter jusqu’à 3, reconnaître les couleurs, le rythme',
  mood: 'rythme',
  freezeOnWait: true,
  poster: { beat: 6, bt: 0.8 },
  beats: [
    { text: 'Voici… la danse des chaussettes rigolotes !', min: 4.2, hold: 0.4 },
    { text: 'Une chaussette !', min: 2.6, hold: 0.5 },
    { text: 'Deux chaussettes !', min: 2.6, hold: 0.5 },
    {
      text: 'Oh ! Il en manque une. Touche le tiroir pour appeler la troisième !',
      hold: 1.8,
      tap: {
        hint: 'Touche le tiroir',
        at: () => ({ x: DRAWER.x + DRAWER.w / 2, y: DRAWER.y + DRAWER.h / 2 }),
        hit: (x, y) => x > DRESSER.x - 30 && x < DRESSER.x + DRESSER.w + 30 && y > DRESSER.y - 70 && y < DRESSER.y + DRESSER.h + 20
      }
    },
    { text: 'Trois chaussettes ! On est les meilleures !', min: 4, hold: 0.3 },
    { text: 'On compte avec elles : un… deux… trois !', say: 'On compte avec elles : un… deux… trois !', min: 3.6, hold: 0.6 },
    { text: 'Bravo ! La rouge, la bleue… et la jaune !', min: 3.4, hold: 1.4 }
  ],
  music(audio) {
    return loop(audio, BEAT / 2, (step, at) => {
      if (audio.hold) return;
      const bar = Math.floor(step / 8) % 8;
      const k = step % 8;
      if (k === 0) audio.tuba(ROOTS[bar], at, 0.32);
      if (k === 4) audio.tuba(ROOTS[bar] + 7, at, 0.32);
      if (k === 2 || k === 6) {
        audio.piano(CHORDS[bar], at, 0.2, 0.9);
        audio.brush(at, 1.2);
      }
      const n = MELODY[bar][k];
      if (n) audio.clarinet(n, at, BEAT * 0.45);
      if (k === 7 && bar % 2 === 1) audio.woodblock(at, 0.35);
    });
  },
  create
};
