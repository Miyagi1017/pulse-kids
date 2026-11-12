/**
 * 🧱 « La Tour des Couleurs » — style Brick Toy (stop-motion de briques sur un vrai bureau).
 * Plastique brillant aux reflets rectangulaires, tenons sur chaque face du dessus, ombre de contact,
 * objets réels flous derrière. Les briques et le bonhomme avancent par poses à 12 images/s ;
 * chaque brique arrive en arc et s'emboîte avec un petit dépassement et un « clic ».
 * Aucune marque ni silhouette de figurine connue : le bonhomme est construit avec des briques.
 */
import { loop, type FilmAudio } from './audio';
import { H, W, back, clamp, easeInOut, easeOut, hash, lerp, span, type Film, type FilmScene, type FrameState } from './engine';
import { RES, canvas, ctx2d, wrap } from './crayon';

const P = 30; // pas d'un tenon
const BH = 36; // hauteur d'une brique
const D = { x: 13, y: -9 }; // profondeur d'un tenon (projection oblique)
const PLATE = { x: 200, w: 420, y: 404, depth: 4 };
/** Caméra un peu rapprochée (macro) : le monde est dessiné puis agrandi autour de ce point. */
const CAM = { x: 500, y: 320, k: 1.15 };
const toScreen = (x: number, y: number) => ({ x: CAM.x + (x - CAM.x) * CAM.k, y: CAM.y + (y - CAM.y) * CAM.k });
const toWorld = (x: number, y: number) => ({ x: CAM.x + (x - CAM.x) / CAM.k, y: CAM.y + (y - CAM.y) / CAM.k });
const C = {
  red: '#c91a09',
  blue: '#0055bf',
  yellow: '#f2cd37',
  green: '#237841',
  white: '#f2f2ee',
  black: '#1b2a34',
  plate: '#4f9a52'
};

/** La tour en escalier : chaque brique décalée de 2 tenons, pour que le bonhomme puisse grimper. */
const TOWER = [
  { color: C.red, x: 330, name: 'rouge' },
  { color: C.blue, x: 390, name: 'bleue' },
  { color: C.yellow, x: 450, name: 'jaune' }
];
const LOOSE: Record<string, { x: number; y: number; color: string }> = {
  blue: { x: 640, y: 438, color: C.blue },
  yellow: { x: 722, y: 450, color: C.yellow },
  green: { x: 660, y: 464, color: C.green }
};
const STAR = { x: 470, y: 160 };

/* ───────────── Rendu d'une brique ───────────── */

function shade(hex: string, k: number) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => Math.round(clamp(k > 0 ? c + (255 - c) * k : c * (1 + k), 0, 255));
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
}

/**
 * Brique vue de face, un peu de haut : face avant, dessus (avec tenons), côté droit plus sombre.
 * (x, y) = coin avant-gauche du bas. Les reflets sont des rectangles nets (les boîtes à lumière du studio).
 */
function brick(g: CanvasRenderingContext2D, x: number, y: number, studsW: number, color: string, o: { depth?: number; h?: number; studs?: boolean; matte?: boolean } = {}) {
  const depth = o.depth ?? 2;
  const h = o.h ?? BH;
  const w = studsW * P;
  const dx = D.x * depth,
    dy = D.y * depth;
  // Côté droit.
  g.fillStyle = shade(color, -0.32);
  g.beginPath();
  g.moveTo(x + w, y);
  g.lineTo(x + w + dx, y + dy);
  g.lineTo(x + w + dx, y + dy - h);
  g.lineTo(x + w, y - h);
  g.closePath();
  g.fill();
  // Dessus.
  g.fillStyle = shade(color, 0.16);
  g.beginPath();
  g.moveTo(x, y - h);
  g.lineTo(x + w, y - h);
  g.lineTo(x + w + dx, y - h + dy);
  g.lineTo(x + dx, y - h + dy);
  g.closePath();
  g.fill();
  // Face avant, avec un léger dégradé de lumière (clé en haut à gauche).
  const grd = g.createLinearGradient(x, y - h, x + w, y);
  grd.addColorStop(0, shade(color, 0.08));
  grd.addColorStop(1, shade(color, -0.1));
  g.fillStyle = grd;
  g.beginPath();
  g.roundRect(x, y - h, w, h, 2);
  g.fill();
  if (!o.matte) {
    // Reflets rectangulaires des boîtes à lumière + biseau qui accroche la lumière.
    g.fillStyle = 'rgba(255,255,255,0.32)';
    g.fillRect(x + 6, y - h + 5, Math.min(w * 0.35, 40), 4);
    g.fillStyle = 'rgba(255,255,255,0.12)';
    g.fillRect(x + w - 14, y - h + 6, 6, h - 12);
    g.strokeStyle = 'rgba(255,255,255,0.45)';
    g.lineWidth = 1.2;
    g.beginPath();
    g.moveTo(x + 2, y - h + 0.6);
    g.lineTo(x + w - 2, y - h + 0.6);
    g.stroke();
  }
  // Jointures assombries (occlusion ambiante).
  g.strokeStyle = 'rgba(0,0,0,0.28)';
  g.lineWidth = 1.2;
  g.strokeRect(x, y - h, w, h);
  if (o.studs !== false) for (let j = depth - 1; j >= 0; j--) for (let i = 0; i < studsW; i++) stud(g, x + (i + 0.5) * P + (j + 0.5) * D.x, y - h + (j + 0.5) * D.y, color, !!o.matte);
}

function stud(g: CanvasRenderingContext2D, cx: number, cy: number, color: string, matte: boolean) {
  const rx = 9,
    ry = 5.4,
    hh = 6;
  g.fillStyle = 'rgba(0,0,0,0.22)';
  g.beginPath();
  g.ellipse(cx + 1.5, cy + 1, rx + 1, ry + 0.6, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = shade(color, -0.12);
  g.beginPath();
  g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI);
  g.lineTo(cx - rx, cy - hh);
  g.ellipse(cx, cy - hh, rx, ry, 0, Math.PI, 0, true);
  g.closePath();
  g.fill();
  g.fillStyle = shade(color, 0.22);
  g.beginPath();
  g.ellipse(cx, cy - hh, rx, ry, 0, 0, Math.PI * 2);
  g.fill();
  if (!matte) {
    g.fillStyle = 'rgba(255,255,255,0.5)';
    g.beginPath();
    g.ellipse(cx - 3, cy - hh - 1.2, 3, 1.4, -0.3, 0, Math.PI * 2);
    g.fill();
  }
}

/** Ombre portée douce sur la surface (la clé est en haut à gauche : l'ombre part vers la droite). */
function contact(g: CanvasRenderingContext2D, x: number, y: number, w: number, k = 1) {
  g.save();
  const grd = g.createLinearGradient(0, y - 6, 0, y + 10);
  grd.addColorStop(0, `rgba(20,14,8,${0.35 * k})`);
  grd.addColorStop(1, 'rgba(20,14,8,0)');
  g.fillStyle = grd;
  g.beginPath();
  g.moveTo(x + 4, y);
  g.lineTo(x + w + 30, y + 2);
  g.lineTo(x + w + 40, y + 10);
  g.lineTo(x + 10, y + 8);
  g.closePath();
  g.fill();
  g.restore();
}

/* ───────────── Le bonhomme en briques ───────────── */

type Pose = 'stand' | 'look' | 'proud' | 'crouch' | 'jump' | 'reach';

/** (x, y) = milieu du bas des pieds. Jambes : deux colonnes 1×1 ; torse : brique 2×2 ; tête : brique ronde. */
function buddy(g: CanvasRenderingContext2D, x: number, y: number, pose: Pose, holdStar: boolean) {
  const crouch = pose === 'crouch' ? 10 : 0;
  const legH = 38 - crouch;
  const torsoY = y - legH - 6;
  // Jambes.
  brick(g, x - 27, y, 0.85, C.blue, { depth: 1, h: legH, studs: false });
  brick(g, x + 1.5, y, 0.85, C.blue, { depth: 1, h: legH, studs: false });
  brick(g, x - 30, y - legH, 2, C.black, { depth: 1.4, h: 6, studs: false });
  // Bras : briques rondes, angle selon la pose (grandes poses lisibles).
  const armA: Record<Pose, [number, number]> = {
    stand: [0.25, -0.25],
    look: [0.4, -0.4],
    proud: [2.3, -2.3],
    crouch: [0.6, -0.6],
    jump: [2.6, -2.6],
    reach: [2.9, -2.9]
  };
  const [aL, aR] = armA[pose];
  const arm = (side: number, a: number) => {
    g.save();
    g.translate(x + side * 33, torsoY - 34);
    g.rotate(-side * a);
    g.fillStyle = shade(C.yellow, -0.1);
    g.beginPath();
    g.roundRect(-8, 0, 16, 38, 8);
    g.fill();
    g.fillStyle = 'rgba(255,255,255,0.35)';
    g.fillRect(-4, 4, 3, 26);
    g.fillStyle = C.white;
    g.beginPath();
    g.arc(0, 40, 8, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = 'rgba(0,0,0,0.25)';
    g.stroke();
    g.restore();
  };
  arm(-1, aL);
  // Torse.
  brick(g, x - 30, torsoY, 2, C.yellow, { depth: 1.4, h: 40, studs: false });
  arm(1, aR);
  // Tête : brique ronde blanche (cylindre), un visage imprimé (deux points, un sourire).
  const hy = torsoY - 40;
  const tilt = pose === 'look' || pose === 'reach' ? -6 : 0;
  g.fillStyle = shade(C.white, -0.12);
  g.beginPath();
  g.ellipse(x + 4, hy, 26, 9, 0, 0, Math.PI);
  g.lineTo(x - 22, hy - 34);
  g.ellipse(x + 4, hy - 34, 26, 9, 0, Math.PI, 0, true);
  g.closePath();
  g.fill();
  g.fillStyle = C.white;
  g.beginPath();
  g.ellipse(x + 4, hy - 34, 26, 9, 0, 0, Math.PI * 2);
  g.fill();
  stud(g, x + 4, hy - 34, C.white, false);
  g.fillStyle = 'rgba(255,255,255,0.6)';
  g.fillRect(x - 14, hy - 28, 4, 22);
  g.fillStyle = C.black;
  for (const ex of [-6, 12]) {
    g.beginPath();
    g.ellipse(x + ex, hy - 18 + tilt, 3, 4, 0, 0, Math.PI * 2);
    g.fill();
  }
  g.strokeStyle = C.black;
  g.lineWidth = 2.4;
  g.lineCap = 'round';
  g.beginPath();
  g.arc(x + 3, hy - 12 + tilt, pose === 'proud' || holdStar ? 8 : 6, 0.3, Math.PI - 0.3);
  g.stroke();
}

/** L'étoile : pièces translucides jaunes (les effets de lumière sont des briques translucides). */
function star(g: CanvasRenderingContext2D, x: number, y: number, glow: number, t: number) {
  g.save();
  if (glow > 0) {
    const grd = g.createRadialGradient(x, y, 0, x, y, 90);
    grd.addColorStop(0, `rgba(255,230,120,${0.5 * glow})`);
    grd.addColorStop(1, 'rgba(255,230,120,0)');
    g.fillStyle = grd;
    g.fillRect(x - 90, y - 90, 180, 180);
  }
  g.translate(x, y);
  g.rotate(Math.sin(t * 1.5) * 0.06);
  const path = (r1: number, r2: number) => {
    g.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const r = i % 2 ? r2 : r1;
      g.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    g.closePath();
  };
  g.fillStyle = 'rgba(214,160,20,0.95)';
  g.translate(5, 4);
  path(40, 18);
  g.fill();
  g.translate(-5, -4);
  g.fillStyle = 'rgba(255,214,60,0.88)';
  path(40, 18);
  g.fill();
  g.fillStyle = 'rgba(255,255,255,0.55)';
  g.fillRect(-18, -10, 12, 3);
  stud(g, 0, -2, '#f8d64a', false);
  g.restore();
}

/* ───────────── Bureau, décor flou ───────────── */

function makeSet() {
  const c = canvas();
  const g = ctx2d(c);
  // Mur et fenêtre (lumière du jour neutre), plante et mug flous à l'arrière.
  const wall = g.createLinearGradient(0, 0, 0, 300);
  wall.addColorStop(0, '#dfe6ea');
  wall.addColorStop(1, '#cfd6d8');
  g.fillStyle = wall;
  g.fillRect(0, 0, W, 330);
  g.save();
  g.filter = `blur(${9 * RES}px)`;
  g.fillStyle = '#f7fbff';
  g.fillRect(80, 30, 260, 210);
  g.fillStyle = '#c9a77a';
  g.fillRect(720, 170, 90, 120);
  g.fillStyle = '#4f8f53';
  for (let i = 0; i < 7; i++) {
    g.beginPath();
    g.ellipse(765 + Math.cos(i) * 50, 150 - i * 6 + Math.sin(i * 2) * 20, 46, 20, i * 0.6, 0, Math.PI * 2);
    g.fill();
  }
  g.fillStyle = '#e8e3da';
  g.beginPath();
  g.roundRect(130, 220, 80, 90, 10);
  g.fill();
  g.restore();
  // Plateau du bureau en bois clair (net au premier plan).
  const wood = g.createLinearGradient(0, 300, 0, H);
  wood.addColorStop(0, '#c8a47a');
  wood.addColorStop(1, '#a87e52');
  g.fillStyle = wood;
  g.fillRect(0, 300, W, H - 300);
  for (let i = 0; i < 14; i++) {
    g.strokeStyle = `rgba(90,55,25,${0.08 + hash(i) * 0.08})`;
    g.lineWidth = 1;
    g.beginPath();
    const y = 310 + i * 17 + hash(i, 2) * 8;
    g.moveTo(0, y);
    for (let x = 0; x <= W; x += 30) g.lineTo(x, y + Math.sin(x / 80 + i) * 2);
    g.stroke();
  }
  g.strokeStyle = 'rgba(60,35,15,0.4)';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(0, 301);
  g.lineTo(W, 301);
  g.stroke();
  // Plaque de base verte, mate (pas de reflets de boîtes à lumière).
  contact(g, PLATE.x, PLATE.y, PLATE.w, 1);
  const studs = Math.round(PLATE.w / P);
  g.fillStyle = shade(C.plate, -0.3);
  g.fillRect(PLATE.x, PLATE.y - 8, PLATE.w, 8);
  g.fillStyle = shade(C.plate, 0.05);
  g.beginPath();
  g.moveTo(PLATE.x, PLATE.y - 8);
  g.lineTo(PLATE.x + PLATE.w, PLATE.y - 8);
  g.lineTo(PLATE.x + PLATE.w + D.x * PLATE.depth, PLATE.y - 8 + D.y * PLATE.depth);
  g.lineTo(PLATE.x + D.x * PLATE.depth, PLATE.y - 8 + D.y * PLATE.depth);
  g.closePath();
  g.fill();
  for (let j = PLATE.depth - 1; j >= 0; j--) for (let i = 0; i < studs; i++) stud(g, PLATE.x + (i + 0.5) * P + (j + 0.5) * D.x, PLATE.y - 8 + (j + 0.5) * D.y, C.plate, true);
  // Une tige transparente qui tient l'étoile (posée sur la plaque).
  g.strokeStyle = 'rgba(255,255,255,0.55)';
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(STAR.x + 90, STAR.y - 60);
  g.lineTo(STAR.x + 90, 70);
  g.stroke();
  return c;
}

/* ───────────── Mise en scène ───────────── */

/** Temps « sur les deux » : la pose change 12 fois par seconde (stop-motion). */
const q12 = (t: number) => Math.floor(t * 12) / 12;

/** Une brique qui vole en arc puis s'emboîte avec un petit dépassement. */
function flight(from: { x: number; y: number }, to: { x: number; y: number }, t: number, dur = 0.7) {
  const u = clamp(t / dur);
  const x = lerp(from.x, to.x, easeInOut(u));
  const y = lerp(from.y, to.y, easeInOut(u)) - Math.sin(u * Math.PI) * 120;
  const settle = t > dur ? -3 * Math.max(0, 1 - (t - dur) / (4 / 12)) : 0;
  return { x, y: y + settle, done: u >= 1 };
}

function towerY(i: number) {
  return PLATE.y - 8 - i * BH;
}

interface Placed {
  i: number;
  x: number;
  y: number;
}

function staging(s: FrameState) {
  const bt = q12(s.bt);
  const placed: Placed[] = [];
  const flying: { color: string; x: number; y: number }[] = [];
  const loose: string[] = [];
  let pose: Pose = 'look';
  let fx = 270,
    fy = PLATE.y - 8,
    holdStar = false,
    starGlow = 0,
    titleK = 0;
  const end = s.end !== null;

  if (s.beat === 0) titleK = back(span(bt, 0.2, 0.7));
  // Rouge (beat 1) : vole de la droite et s'emboîte sur la plaque.
  if (s.beat === 1) {
    const f = flight({ x: 980, y: 120 }, { x: TOWER[0].x, y: towerY(0) }, bt - 0.2, 0.75);
    if (bt >= 0.2) (f.done ? placed.push({ i: 0, x: TOWER[0].x, y: f.y }) : flying.push({ color: C.red, x: f.x, y: f.y }));
    pose = bt > 1.0 ? 'proud' : 'look';
  } else if (s.beat > 1 || end) placed.push({ i: 0, x: TOWER[0].x, y: towerY(0) });

  // Les briques en vrac arrivent sur le bureau (beat 2) ; la bleue part au toucher.
  if (s.beat === 2) {
    for (const [k, b] of Object.entries(LOOSE)) if (bt > 0.1 + Object.keys(LOOSE).indexOf(k) * 0.2) loose.push(k);
    if (s.sinceTap !== null) {
      const tq = q12(s.sinceTap);
      const f = flight(LOOSE.blue, { x: TOWER[1].x, y: towerY(1) }, tq - 0.1, 0.7);
      const i = loose.indexOf('blue');
      if (i >= 0) loose.splice(i, 1);
      if (f.done) placed.push({ i: 1, x: TOWER[1].x, y: f.y });
      else flying.push({ color: C.blue, x: f.x, y: f.y });
      pose = f.done ? 'proud' : 'look';
    }
  } else if (s.beat > 2 || end) placed.push({ i: 1, x: TOWER[1].x, y: towerY(1) });
  if (s.beat === 3) {
    loose.push('green');
    const f = flight(LOOSE.yellow, { x: TOWER[2].x, y: towerY(2) }, bt - 1.2, 0.7);
    if (bt < 1.2) loose.push('yellow');
    else if (f.done) placed.push({ i: 2, x: TOWER[2].x, y: f.y });
    else flying.push({ color: C.yellow, x: f.x, y: f.y });
    pose = bt > 2.0 ? 'proud' : 'look';
  } else if (s.beat > 3 || end) {
    placed.push({ i: 2, x: TOWER[2].x, y: towerY(2) });
    loose.push('green');
  }

  // Beat 4 : il grimpe l'escalier, hop, hop, hop (accroupi → saut → posé, sur les deux).
  if (s.beat === 4) {
    const steps = [
      { x: 270, y: PLATE.y - 8 },
      { x: TOWER[0].x + 30, y: towerY(1) },
      { x: TOWER[1].x + 30, y: towerY(2) },
      { x: TOWER[2].x + 60, y: towerY(3) }
    ];
    const per = 0.85;
    const k = Math.min(2, Math.floor(Math.max(0, bt - 0.3) / per));
    const local = Math.max(0, bt - 0.3) - k * per;
    const a = steps[k],
      b = steps[k + 1];
    if (bt < 0.3 + 3 * per) {
      if (local < 0.2) {
        fx = a.x;
        fy = a.y;
        pose = 'crouch';
      } else if (local < 0.6) {
        const u = (local - 0.2) / 0.4;
        fx = lerp(a.x, b.x, u);
        fy = lerp(a.y, b.y, u) - Math.sin(u * Math.PI) * 50;
        pose = 'jump';
      } else {
        fx = b.x;
        fy = b.y;
        pose = 'proud';
      }
    } else {
      fx = steps[3].x;
      fy = steps[3].y;
      pose = 'reach';
    }
  }
  if (s.beat >= 5 || end) {
    fx = TOWER[2].x + 60;
    fy = towerY(3);
    pose = 'reach';
    holdStar = bt > 0.4 || end;
    starGlow = holdStar ? 0.6 + 0.4 * Math.sin(s.t * 3) : 0;
  }
  return { placed, flying, loose, pose, fx, fy, holdStar, starGlow, titleK };
}

function create(): FilmScene {
  const set = makeSet();
  return {
    render(g, s) {
      const st = staging(s);
      g.save();
      g.translate(CAM.x, CAM.y);
      g.scale(CAM.k, CAM.k);
      g.translate(-CAM.x, -CAM.y);
      g.drawImage(set, -40, -30, W + 80, H + 60);
      // Briques de la tour, de bas en haut (chacune projette son ombre sur celle d'en dessous).
      st.placed
        .sort((a, b) => a.i - b.i)
        .forEach((p) => {
          contact(g, p.x, p.y, 4 * P, 0.7);
          brick(g, p.x, p.y, 4, TOWER[p.i].color);
        });
      // Briques en vrac sur le bureau.
      for (const k of st.loose) {
        const b = LOOSE[k];
        contact(g, b.x, b.y, 4 * P, 0.9);
        brick(g, b.x, b.y, 4, b.color);
      }
      // Le bonhomme (l'étoile au-dessus de sa tête quand il l'a attrapée).
      contact(g, st.fx - 30, st.fy, 60, 0.6);
      buddy(g, st.fx, st.fy, st.pose, st.holdStar);
      const sx = st.holdStar ? st.fx + 4 : STAR.x + 90;
      const sy = st.holdStar ? st.fy - 178 : STAR.y - 60;
      if (!st.holdStar) {
        g.strokeStyle = 'rgba(255,255,255,0.55)';
        g.lineWidth = 3;
      }
      star(g, sx, sy, st.starGlow || (s.beat === 0 ? 0.3 + 0.3 * Math.sin(s.t * 4) : 0.15), s.t);
      for (const f of st.flying) brick(g, f.x, f.y, 4, f.color);
      // Confettis en petites plaques au moment de la victoire.
      if (s.beat === 5 || s.end !== null) {
        const ct = s.end !== null ? 3 + s.end : q12(s.bt);
        for (let i = 0; i < 30; i++) {
          const x = 120 + hash(i, 1) * 720 + Math.sin(ct * 2 + i) * 10;
          const y = -20 + ((ct * (90 + hash(i, 2) * 80) + hash(i, 3) * 500) % 600);
          if (y > PLATE.y + 40) continue;
          g.fillStyle = [C.red, C.blue, C.yellow, C.green, C.white][i % 5];
          g.fillRect(x, y, 12, 5);
        }
      }
      g.restore();
      if (st.titleK > 0 && s.beat === 0) {
        g.save();
        g.translate(480, 74);
        g.scale(st.titleK, st.titleK);
        g.font = '600 46px "Fredoka", sans-serif';
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        const words = 'La Tour des Couleurs';
        const cols = [C.red, C.blue, C.yellow, C.green];
        let x = -g.measureText(words).width / 2;
        g.textAlign = 'left';
        [...words].forEach((ch, i) => {
          g.lineWidth = 7;
          g.strokeStyle = '#ffffff';
          g.lineJoin = 'round';
          g.strokeText(ch, x, 0);
          g.fillStyle = cols[i % 4];
          g.fillText(ch, x, 0);
          x += g.measureText(ch).width;
        });
        g.restore();
      }
      pill(g, s.caption);
    },
    cues(s, prev, audio) {
      const cross = (t: number) => prev < t && s.bt >= t;
      const at = audio.now;
      if (s.beat === 0 && cross(0.2)) audio.brickClick(at, 0.8);
      if (s.beat === 1) {
        if (cross(0.2)) audio.noise(at, 0.5, { freq: 900, to: 2400, q: 0.7, gain: 0.05 });
        if (cross(0.97)) audio.brickClick(at, 1.2);
        if (cross(1.05)) audio.glock(72, at, 1, 'sfx');
      }
      if (s.beat === 2) [0.1, 0.3, 0.5].forEach((t) => cross(t) && audio.thump(at, 0.3));
      if (s.beat === 2 && s.sinceTap !== null) {
        const p = prev - (s.bt - s.sinceTap);
        if (p < 0.82 && s.sinceTap >= 0.82) {
          audio.brickClick(at, 1.2);
          audio.glock(76, at, 1, 'sfx');
        }
      }
      if (s.beat === 3 && cross(1.92)) {
        audio.brickClick(at, 1.2);
        audio.glock(79, at, 1, 'sfx');
      }
      if (s.beat === 4) for (let k = 0; k < 3; k++) {
        if (cross(0.5 + k * 0.85)) audio.slideWhistle(at, true, 0.3);
        if (cross(0.9 + k * 0.85)) audio.brickClick(at, 0.7);
      }
      if (s.beat === 5 && cross(0.4)) audio.chime(at, [72, 76, 79, 84, 88]);
    },
    onTap(_b, audio) {
      audio.noise(audio.now, 0.4, { freq: 900, to: 2600, q: 0.7, gain: 0.05 });
    },
    dispose() {
      set.width = 0;
      set.height = 0;
    }
  };
}

/** Sous-titre sur un élément de jouet : pilule sombre arrondie avec une petite brique à côté du texte. */
function pill(g: CanvasRenderingContext2D, text: string) {
  g.save();
  g.font = '600 22px "Fredoka", sans-serif';
  const lines = wrap(g, text, 700);
  const w = Math.max(...lines.map((l) => g.measureText(l).width)) + 76;
  const h = lines.length * 27 + 18;
  const x = 480 - w / 2,
    y = 528 - h;
  g.fillStyle = 'rgba(27,42,52,0.88)';
  g.beginPath();
  g.roundRect(x, y, w, h, h / 2);
  g.fill();
  brick(g, x + 16, y + h / 2 + 9, 1, C.red, { depth: 1, h: 14 });
  g.fillStyle = '#ffffff';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  lines.forEach((l, i) => g.fillText(l, 480 + 16, y + h / 2 + (i - (lines.length - 1) / 2) * 27 + 1));
  g.restore();
}

/* Petit air de piano-jouet et pizzicati (original), 112 bpm. */
const TUNE = [72, 0, 76, 79, 0, 76, 72, 0, 74, 0, 77, 81, 0, 77, 74, 0, 76, 0, 79, 84, 0, 79, 76, 0, 79, 77, 76, 74, 72, 0, 0, 0];
const BASS = [48, 50, 52, 43];

export const tour: Film = {
  id: 'film-tour',
  title: 'La Tour des Couleurs',
  emoji: '🧱',
  style: 'brick-toy',
  styleLabel: 'Briques en stop-motion',
  goal: 'Nommer les couleurs, dessus / dessous',
  mood: 'defi',
  poster: { beat: 5, bt: 1.2 },
  beats: [
    { text: 'Un petit bonhomme en briques veut attraper l’étoile, tout là-haut !', min: 4.2, hold: 0.4 },
    { text: 'Il construit une tour. Voici la première brique : elle est ROUGE !', say: 'Il construit une tour. Voici la première brique : elle est rouge !', min: 3.2, hold: 0.4 },
    {
      text: 'Maintenant, il faut la brique BLEUE. Touche la brique bleue !',
      say: 'Maintenant, il faut la brique bleue. Touche la brique bleue !',
      hold: 1.6,
      tap: {
        hint: 'Touche la brique bleue',
        at: () => toScreen(LOOSE.blue.x + 60, LOOSE.blue.y - 22),
        hit: (sx, sy) => {
          const { x, y } = toWorld(sx, sy);
          return x > LOOSE.blue.x - 8 && x < LOOSE.blue.x + 4 * P + 30 && y > LOOSE.blue.y - BH - 26 && y < LOOSE.blue.y + 6;
        }
      }
    },
    { text: 'Bravo ! Le bleu se pose sur le rouge. Et maintenant… la JAUNE !', say: 'Bravo ! Le bleu se pose sur le rouge. Et maintenant… la jaune !', min: 3, hold: 0.4 },
    { text: 'Hop, hop, hop ! Le bonhomme grimpe en haut de la tour.', min: 3.4, hold: 0.4 },
    { text: 'Il attrape l’étoile ! Rouge, bleu, jaune… Bravo !', min: 3, hold: 1.8 }
  ],
  music(audio) {
    return loop(audio, 60 / 112 / 2, (step, at) => {
      const n = TUNE[step % TUNE.length];
      if (n) audio.glock(n, at, 0.6);
      if (step % 4 === 0) audio.pizz(BASS[Math.floor(step / 8) % 4], at, 0.9);
      if (step % 4 === 2) audio.pizz(BASS[Math.floor(step / 8) % 4] + 7, at, 0.5);
    });
  },
  create
};
