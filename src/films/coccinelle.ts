/**
 * 🐞 « La Promenade de la Coccinelle » — style Watercolor Brush.
 * Une seule feuille de papier chaud : chaque chose se peint sous nos yeux, la structure avant le détail.
 * Une tache verte s'étale et devient une feuille, une tache rouge devient une coccinelle, une fleur jaune se peint,
 * une abeille arrive. Lavis transparents (trois passes décalées : les bords foncent là où elles ne s'accordent pas),
 * encre brun chaud pour les traits, le papier est le blanc. À la fin, une brume couleur papier efface la page.
 */
import { loop, type FilmAudio } from './audio';
import { H, W, back, clamp, easeInOut, easeOut, hash, lerp, span, type Film, type FilmScene, type FrameState } from './engine';
import { RES, canvas, ctx2d, makePaper, wrap, type Pt } from './crayon';

const C = {
  leaf: '#7aa65a',
  leafDeep: '#4e7d3c',
  red: '#d8452f',
  yellow: '#f1c232',
  orange: '#e8892d',
  ink: '#3b2a20',
  brown: '#7a5638',
  wing: '#a9c8dc',
  sky: '#c9dcea'
};

/** La feuille : un axe de A vers B (la coccinelle s'y promène). */
const A: Pt = [170, 430];
const B: Pt = [590, 236];
const FLOWER = { x: 770, y: 300 };
const BEE = { x: 872, y: 168 };
const onLeaf = (u: number): Pt => [lerp(A[0], B[0], u), lerp(A[1], B[1], u)];
const LEAF_ANGLE = Math.atan2(B[1] - A[1], B[0] - A[0]);

/* ───────────── Pinceau ───────────── */

/** Bord mouillé qui s'étale : un cercle ondulé dont le rayon grandit. */
function wetClip(g: CanvasRenderingContext2D, cx: number, cy: number, r: number, seed: number) {
  g.beginPath();
  for (let i = 0; i <= 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    const rr = r * (1 + 0.07 * Math.sin(a * 5 + seed) + 0.04 * Math.sin(a * 11 + seed * 2));
    const x = cx + Math.cos(a) * rr,
      y = cy + Math.sin(a) * rr;
    if (i) g.lineTo(x, y);
    else g.moveTo(x, y);
  }
  g.closePath();
  g.clip();
}

/** Lavis : la même forme en trois passes aux sommets décalés, chacune transparente (les bords foncent). */
function wash(g: CanvasRenderingContext2D, pts: Pt[], color: string, alpha: number, seed: number) {
  g.save();
  g.fillStyle = color;
  for (let pass = 0; pass < 3; pass++) {
    g.globalAlpha = alpha * 0.42;
    g.beginPath();
    pts.forEach(([x, y], i) => {
      const jx = (hash(seed, i, pass) - 0.5) * 5,
        jy = (hash(seed, i, pass, 1) - 0.5) * 5;
      if (i) g.lineTo(x + jx, y + jy);
      else g.moveTo(x + jx, y + jy);
    });
    g.closePath();
    g.fill();
  }
  g.globalAlpha = alpha * 0.25;
  g.strokeStyle = color;
  g.lineWidth = 2.2;
  g.stroke();
  g.restore();
}

/** Coup de pinceau : ruban de largeur variable + quelques soies qui se cassent en tirets (blanc volant). */
function brush(g: CanvasRenderingContext2D, pts: Pt[], color: string, width: number, seed: number, reveal = 1, alpha = 0.7) {
  if (reveal <= 0) return;
  const n = Math.max(2, Math.ceil(pts.length * reveal));
  const P = pts.slice(0, n);
  const left: Pt[] = [],
    right: Pt[] = [];
  P.forEach((p, i) => {
    const q = P[Math.min(i + 1, P.length - 1)],
      o = P[Math.max(i - 1, 0)];
    const dx = q[0] - o[0],
      dy = q[1] - o[1];
    const len = Math.hypot(dx, dy) || 1;
    const u = i / (pts.length - 1);
    const w = (width / 2) * Math.sin(Math.min(1, u * 1.4 + 0.08) * Math.PI) ** 0.6 * (1 + (hash(seed, i) - 0.5) * 0.44);
    left.push([p[0] - (dy / len) * w, p[1] + (dx / len) * w]);
    right.push([p[0] + (dy / len) * w, p[1] - (dx / len) * w]);
  });
  g.save();
  g.globalAlpha = alpha * 0.8;
  g.fillStyle = color;
  g.beginPath();
  [...left, ...right.reverse()].forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
  g.closePath();
  g.fill();
  g.strokeStyle = color;
  g.lineWidth = 1;
  for (let k = 0; k < 4; k++) {
    const off = (k / 3 - 0.5) * width * 0.7;
    g.globalAlpha = alpha * 0.55;
    g.setLineDash([10 + hash(seed, k) * 20, 4 + hash(seed, k, 2) * 8]);
    g.beginPath();
    P.forEach(([x, y], i) => (i ? g.lineTo(x + off * 0.3, y + off) : g.moveTo(x + off * 0.3, y + off)));
    g.stroke();
  }
  g.restore();
}

function ellipsePts(cx: number, cy: number, rx: number, ry: number, rot = 0, n = 28): Pt[] {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const x = Math.cos(a) * rx,
      y = Math.sin(a) * ry;
    return [cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)] as Pt;
  });
}

function leafPts(): Pt[] {
  const left: Pt[] = [],
    right: Pt[] = [];
  const nx = -Math.sin(LEAF_ANGLE),
    ny = Math.cos(LEAF_ANGLE);
  for (let i = 0; i <= 30; i++) {
    const u = i / 30;
    const [x, y] = onLeaf(u);
    const w = 92 * Math.sin(Math.PI * u) ** 0.75 * (1 - u * 0.25);
    left.push([x + nx * w, y + ny * w]);
    right.push([x - nx * w, y - ny * w]);
  }
  return [...left, ...right.reverse()];
}

/* ───────────── Personnages ───────────── */

/** La coccinelle (vue de dessus) au point (x, y), tournée selon a. paint : 0 → 1 (tache, puis détails à l'encre). */
function ladybug(g: CanvasRenderingContext2D, x: number, y: number, a: number, paint: number, o: { walk?: number; fly?: number; wave?: number } = {}) {
  if (paint <= 0) return;
  g.save();
  g.translate(x, y);
  g.rotate(a);
  const blob = easeOut(span(paint, 0, 0.45));
  // Ailes transparentes quand elle vole.
  if (o.fly) {
    const flap = 0.6 + 0.4 * Math.abs(Math.sin(o.fly * 30));
    for (const side of [-1, 1]) wash(g, ellipsePts(-6, side * 26 * flap, 30, 14 * flap, side * 0.5), C.wing, 0.6, 31 + side);
  }
  // Pattes et antennes à l'encre (détail, après la tache).
  const detail = span(paint, 0.45, 1);
  if (detail > 0) {
    g.strokeStyle = C.ink;
    g.lineWidth = 2;
    g.lineCap = 'round';
    g.globalAlpha = detail;
    for (let i = 0; i < 3; i++)
      for (const side of [-1, 1]) {
        const sw = Math.sin((o.walk ?? 0) + i * 2 + (side > 0 ? Math.PI : 0)) * 5;
        g.beginPath();
        g.moveTo(-14 + i * 14, side * 18);
        g.lineTo(-18 + i * 14 + sw, side * 31);
        g.stroke();
      }
    const wave = o.wave ? Math.sin(o.wave * 8) * 0.4 : 0;
    for (const side of [-1, 1]) {
      g.beginPath();
      g.moveTo(34, side * 6);
      g.quadraticCurveTo(46, side * 10, 50 + wave * 10, side * 20 + (side > 0 ? wave * 14 : 0));
      g.stroke();
    }
    g.globalAlpha = 1;
  }
  // La tache rouge qui s'étale, puis devient un corps.
  g.save();
  wetClip(g, 0, 0, 34 * blob + 0.1, 3);
  wash(g, ellipsePts(0, 0, 32, 26), C.red, 0.95, 40);
  g.restore();
  if (detail > 0) {
    g.globalAlpha = detail;
    wash(g, ellipsePts(34, 0, 13, 14), C.ink, 0.9, 41);
    // Yeux : on laisse le papier (deux petites réserves).
    g.fillStyle = '#f4efe3';
    g.beginPath();
    g.arc(39, -5, 3, 0, Math.PI * 2);
    g.arc(39, 5, 3, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = C.ink;
    for (const [sx, sy, r] of [[-14, -10, 5.5], [-14, 10, 5.5], [6, -14, 5], [6, 14, 5], [-2, 0, 4.4]] as [number, number, number][]) {
      g.beginPath();
      g.arc(sx, sy, r, 0, Math.PI * 2);
      g.fill();
    }
    g.strokeStyle = C.ink;
    g.lineWidth = 1.8;
    g.beginPath();
    g.moveTo(22, 0);
    g.lineTo(-30, 0);
    g.stroke();
    g.globalAlpha = 1;
  }
  g.restore();
}

function bee(g: CanvasRenderingContext2D, x: number, y: number, paint: number, t: number) {
  if (paint <= 0) return;
  g.save();
  g.translate(x, y + Math.sin(t * 2.2) * 6);
  const body = easeOut(span(paint, 0, 0.4));
  const flap = 0.5 + 0.5 * Math.abs(Math.sin(t * 26));
  if (paint > 0.5) for (const k of [-1, 1]) wash(g, ellipsePts(6 + k * 10, -24, 15, 22 * flap, k * 0.4), C.wing, 0.55, 60 + k);
  g.save();
  wetClip(g, 0, 0, 36 * body + 0.1, 7);
  wash(g, ellipsePts(0, 0, 32, 22), C.yellow, 0.95, 61);
  g.restore();
  const d = span(paint, 0.4, 1);
  if (d > 0) {
    g.globalAlpha = d;
    g.strokeStyle = C.brown;
    g.lineWidth = 6;
    g.lineCap = 'round';
    for (const sx of [-4, 10, 22]) {
      g.beginPath();
      g.arc(sx - 40, 0, 40, -0.42, 0.42);
      g.stroke();
    }
    wash(g, ellipsePts(-34, 0, 14, 14), C.ink, 0.9, 62);
    g.fillStyle = '#f4efe3';
    g.beginPath();
    g.arc(-38, -4, 3.2, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = C.ink;
    g.lineWidth = 2;
    g.beginPath();
    g.arc(-36, 4, 5, 0.2, Math.PI - 0.6);
    g.stroke();
    g.beginPath();
    g.moveTo(32, 0);
    g.lineTo(42, 2);
    g.stroke();
    g.globalAlpha = 1;
  }
  g.restore();
}

/** Note manuscrite de naturaliste, avec un trait de rappel qui pousse vers le spécimen. */
function note(g: CanvasRenderingContext2D, text: string, x: number, y: number, to: Pt, u: number) {
  if (u <= 0) return;
  g.save();
  g.strokeStyle = C.brown;
  g.lineWidth = 1.4;
  g.globalAlpha = 0.85;
  const lu = clamp(u * 1.6);
  g.beginPath();
  g.moveTo(x, y + 6);
  g.lineTo(lerp(x, to[0], lu), lerp(y + 6, to[1], lu));
  g.stroke();
  g.font = '24px "Patrick Hand", sans-serif';
  const w = g.measureText(text).width;
  g.beginPath();
  g.rect(x - w / 2 - 4, y - 24, (w + 8) * clamp(u * 1.3), 40);
  g.clip();
  g.fillStyle = C.ink;
  g.textAlign = 'center';
  g.fillText(text, x, y);
  g.restore();
}

/* ───────────── Mise en scène ───────────── */

function story(s: FrameState) {
  const end = s.end !== null;
  const at = (b: number, t0: number, t1: number) => (end || s.beat > b ? 1 : s.beat < b ? 0 : span(s.bt, t0, t1));
  const leafBlob = at(0, 0.3, 1.3);
  const leafShape = at(0, 1.0, 2.6);
  const veins = at(0, 2.4, 3.6);
  const bug = at(1, 0.2, 2.4);
  const bugNote = at(1, 2.4, 3.2);
  const stem = at(2, 1.6, 2.4);
  const petals = at(2, 2.2, 3.6);
  let bugU = 0.32,
    walk = 0,
    fly = 0,
    bx: number,
    by: number,
    ba = LEAF_ANGLE;
  if (s.beat === 2) {
    const u = easeInOut(span(s.bt, 0.2, 2.6));
    bugU = lerp(0.32, 0.78, u);
    walk = u > 0 && u < 1 ? s.bt * 9 : 0;
  }
  if (s.beat >= 3 || end) bugU = 0.78;
  [bx, by] = onLeaf(bugU);
  // Au toucher, elle s'envole vers la fleur.
  const flyU = s.beat === 3 ? (s.sinceTap !== null ? easeInOut(span(s.sinceTap, 0.2, 1.6)) : 0) : s.beat > 3 || end ? 1 : 0;
  if (flyU > 0) {
    const [sx, sy] = onLeaf(0.78);
    const tx = FLOWER.x - 6,
      ty = FLOWER.y - 6;
    bx = lerp(sx, tx, flyU);
    by = lerp(sy, ty, flyU) - Math.sin(flyU * Math.PI) * 110;
    ba = lerp(LEAF_ANGLE, -Math.PI / 2 + 0.3, flyU);
    fly = flyU < 1 ? s.t : 0;
  }
  const beeP = at(4, 0.2, 2.0);
  const beeNote = at(4, 2.0, 2.8);
  const wave = s.beat === 4 && s.bt > 2.2 ? s.bt : 0;
  const mixR = at(5, 0.3, 1.6);
  const mixY = at(5, 0.6, 1.9);
  const mix = at(5, 1.6, 2.8);
  const mixNote = at(5, 2.6, 3.6);
  const mist = end ? easeInOut(span(s.end!, 0.6, 2.6)) : 0;
  const hop = s.beat === 3 && s.sinceTap === null && s.waiting ? Math.abs(Math.sin(s.t * 3)) * 6 : 0;
  return { leafBlob, leafShape, veins, bug, bugNote, stem, petals, bx, by: by - hop, ba, walk, fly, beeP, beeNote, wave, mixR, mixY, mix, mixNote, mist };
}

function create(): FilmScene {
  const P = makePaper();
  const buf = canvas();
  const leaf = leafPts();

  return {
    render(ctx, s) {
      const st = story(s);
      const g = ctx2d(buf);
      g.save();
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.globalCompositeOperation = 'source-over';
      g.drawImage(P.paper, 0, 0);
      g.restore();
      // Pigment transparent : les couches se multiplient comme l'aquarelle.
      g.globalCompositeOperation = 'multiply';


      // La feuille : tache ronde qui s'étale, puis forme de feuille, puis nervures à l'encre (avec un léger balancement).
      const [cx, cy] = onLeaf(0.42);
      g.save();
      const sway = Math.sin(s.t * 1.15) * 0.006 + 0.4 * Math.sin(s.t * 2.7) * 0.006;
      g.translate(A[0], A[1]);
      g.transform(1, 0, st.veins >= 1 ? sway : 0, 1, 0, 0);
      g.translate(-A[0], -A[1]);
      if (st.leafBlob > 0) {
        g.save();
        wetClip(g, cx, cy, lerp(10, 95, easeOut(st.leafBlob)) + easeOut(st.leafShape) * 260, 1);
        if (st.leafShape < 1) wash(g, ellipsePts(cx, cy, 95, 80), C.leaf, 0.85 * (1 - st.leafShape), 3);
        if (st.leafShape > 0) {
          wash(g, leaf, C.leaf, 0.9 * Math.max(0.35, st.leafShape), 4);
          wash(g, leaf.slice(0, 31), C.leafDeep, 0.25 * st.leafShape, 5);
        }
        g.restore();
      }
      if (st.veins > 0) {
        g.save();
        g.beginPath();
        leaf.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
        g.closePath();
        g.clip();
        const mid = Array.from({ length: 24 }, (_, i) => onLeaf(0.02 + (i / 23) * 0.95));
        brush(g, mid, C.leafDeep, 6, 6, st.veins, 0.8);
        g.globalCompositeOperation = 'source-over';
        g.strokeStyle = C.brown;
        g.lineWidth = 1.6;
        g.globalAlpha = 0.7;
        g.beginPath();
        mid.slice(0, Math.ceil(mid.length * st.veins)).forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
        g.stroke();
        for (let k = 1; k < 6; k++) {
          const u = k / 6;
          if (u > st.veins) break;
          const [vx, vy] = onLeaf(u);
          for (const side of [-1, 1]) {
            g.beginPath();
            g.moveTo(vx, vy);
            g.quadraticCurveTo(vx + 30, vy + side * 40 - 10, vx + 44, vy + side * 60 - 20);
            g.stroke();
          }
        }
        g.globalAlpha = 1;
        g.restore();
        g.globalCompositeOperation = 'multiply';
        brush(g, [A, [A[0] - 40, A[1] + 30], [A[0] - 70, A[1] + 40]], C.leafDeep, 7, 8, st.veins, 0.8);
      }
      g.restore();

      // La fleur jaune : tige au pinceau, puis pétales un par un, cœur brun ; elle se balance une fois finie.
      g.save();
      g.translate(FLOWER.x + 20, 470);
      g.rotate(st.petals >= 1 ? Math.sin(s.t * 1.15 + 1) * 0.02 : 0);
      g.translate(-(FLOWER.x + 20), -470);
      brush(g, Array.from({ length: 14 }, (_, i) => [FLOWER.x + 20 - Math.sin((i / 13) * 1.4) * 22, 470 - (i / 13) * (470 - FLOWER.y - 10)] as Pt), C.leafDeep, 9, 9, st.stem, 0.8);
      for (let i = 0; i < 7; i++) {
        const u = span(st.petals, i / 8, i / 8 + 0.25);
        if (u <= 0) continue;
        const a = (i / 7) * Math.PI * 2;
        const px = FLOWER.x + Math.cos(a) * 34,
          py = FLOWER.y + Math.sin(a) * 34;
        g.save();
        wetClip(g, px, py, 34 * easeOut(u), i + 20);
        wash(g, ellipsePts(px, py, 30, 17, a), C.yellow, 0.95, 70 + i);
        g.restore();
      }
      if (st.petals > 0.85) wash(g, ellipsePts(FLOWER.x, FLOWER.y, 17, 17), C.brown, 0.85 * span(st.petals, 0.85, 1), 80);
      g.restore();

      // La coccinelle (peinte au beat 1), qui se promène puis s'envole sur la fleur.
      // Les deux petites bêtes sont peintes en couleur couvrante : un rouge sur du vert doit rester rouge pour un enfant.
      g.globalCompositeOperation = 'source-over';
      ladybug(g, st.bx, st.by, st.ba, st.bug, { walk: st.walk, fly: st.fly, wave: st.wave });
      bee(g, BEE.x, BEE.y, st.beeP, s.t);
      g.globalCompositeOperation = 'multiply';

      // Le mélange des couleurs (beat 5) : deux taches qui s'étalent ; là où elles se touchent, c'est orange.
      const R = { x: 420, y: 112 },
        Y = { x: 500, y: 112 };
      if (st.mixR > 0) {
        g.save();
        wetClip(g, R.x, R.y, 64 * easeOut(st.mixR), 11);
        wash(g, ellipsePts(R.x, R.y, 62, 54), C.red, 0.75, 90);
        g.restore();
      }
      if (st.mixY > 0) {
        g.save();
        wetClip(g, Y.x, Y.y, 64 * easeOut(st.mixY), 12);
        wash(g, ellipsePts(Y.x, Y.y, 62, 54), C.yellow, 0.9, 91);
        g.restore();
      }
      if (st.mix > 0) {
        g.save();
        g.globalCompositeOperation = 'source-over';
        g.beginPath();
        g.ellipse(R.x, R.y, 62, 54, 0, 0, Math.PI * 2);
        g.clip();
        g.beginPath();
        g.ellipse(Y.x, Y.y, 62, 54, 0, 0, Math.PI * 2);
        g.clip();
        g.globalAlpha = 0.95 * easeOut(st.mix);
        wetClip(g, (R.x + Y.x) / 2, R.y, 70 * easeOut(st.mix), 13);
        wash(g, ellipsePts((R.x + Y.x) / 2, R.y, 50, 60), C.orange, 1, 92);
        g.restore();
      }

      g.globalCompositeOperation = 'source-over';
      note(g, 'coccinelle', 300, 210, [st.bx - 10, st.by - 26], st.bugNote * (s.beat >= 3 ? 0 : 1));
      note(g, 'abeille', 870, 82, [BEE.x - 6, BEE.y - 28], st.beeNote);
      note(g, 'rouge + jaune = orange', 460, 214, [460, 172], st.mixNote);

      // Brume couleur papier qui monte et efface la page.
      if (st.mist > 0) {
        const top = H - (H + 80) * st.mist;
        g.save();
        g.beginPath();
        g.moveTo(0, H);
        for (let x = 0; x <= W; x += 20) g.lineTo(x, top + Math.sin(x * 0.02 + s.t) * 14);
        g.lineTo(W, H);
        g.closePath();
        g.clip();
        g.setTransform(1, 0, 0, 1, 0, 0);
        g.drawImage(P.paper, 0, 0);
        g.restore();
      }
      subtitle(g, s.caption);
      ctx.drawImage(buf, 0, 0, buf.width, buf.height, 0, 0, W, H);
    },
    cues(s, prev, audio) {
      const cross = (t: number) => prev < t && s.bt >= t;
      const at = audio.now;
      if (s.beat === 0) [0.3, 1.0, 2.4].forEach((t) => cross(t) && audio.brushStroke(at, 1.0));
      if (s.beat === 1) {
        if (cross(0.2)) audio.brushStroke(at, 0.8);
        if (cross(1.2)) audio.crayon(at, 0.4, 0.5);
      }
      if (s.beat === 2) {
        for (let i = 0; i < 8; i++) if (cross(0.3 + i * 0.28)) audio.step(at);
        if (cross(1.6)) audio.brushStroke(at, 0.8);
        if (cross(2.2)) audio.brushStroke(at, 1.2);
      }
      if (s.beat === 3 && s.sinceTap !== null) {
        const p = prev - (s.bt - s.sinceTap);
        if (p < 1.6 && s.sinceTap >= 1.6) audio.chime(at, [76, 79, 84]);
      }
      if (s.beat === 4) {
        if (cross(0.2)) audio.buzz(at, 2.6);
        if (cross(2.3)) audio.glock(84, at, 0.8, 'sfx');
      }
      if (s.beat === 5) {
        [0.3, 0.6].forEach((t) => cross(t) && audio.brushStroke(at, 1.2));
        if (cross(1.7)) audio.sparkle(at);
      }
    },
    onTap(_b, audio) {
      audio.tone(600, audio.now, 0.5, { gain: 0.05, to: 1200, wave: 'triangle' });
    },
    dispose() {
      buf.width = 0;
      buf.height = 0;
    }
  };
}

/** Sous-titres posés sur le papier (pas de boîte) : serif italique, encre à ~78 % sur un halo couleur papier. */
function subtitle(g: CanvasRenderingContext2D, text: string) {
  g.save();
  g.font = 'italic 600 26px "Cormorant Garamond", serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  const lines = wrap(g, text, 800);
  lines.forEach((l, i) => {
    const y = 510 - (lines.length - 1 - i) * 28;
    g.lineJoin = 'round';
    g.lineWidth = 8;
    g.strokeStyle = 'rgba(244,239,227,0.9)';
    g.strokeText(l, 480, y);
    g.fillStyle = 'rgba(59,42,32,0.85)';
    g.fillText(l, 480, y);
  });
  g.restore();
}

/* Piano feutré et glockenspiel (original), 72 bpm. */
const PIANO = [67, 71, 74, 79, 74, 71, 69, 72, 76, 81, 76, 72, 71, 74, 79, 83, 79, 74, 67, 71, 74, 78, 79, 0];

export const coccinelle: Film = {
  id: 'film-coccinelle',
  title: 'La Promenade de la Coccinelle',
  emoji: '🐞',
  style: 'watercolor',
  styleLabel: 'Aquarelle au pinceau',
  goal: 'Observer la nature, les couleurs qui se mélangent',
  mood: 'calme',
  poster: { beat: 4, bt: 2.6 },
  beats: [
    { text: 'Une tache verte s’étale… et devient une feuille !', min: 4, hold: 0.4 },
    { text: 'Une tache rouge apparaît… c’est une coccinelle !', min: 3.4, hold: 0.4 },
    { text: 'Elle marche tout doucement sur la feuille. Et là-bas, une fleur jaune se peint.', min: 3.8, hold: 0.4 },
    {
      text: 'Touche la fleur jaune pour que la coccinelle y monte !',
      hold: 2.0,
      tap: {
        hint: 'Touche la fleur',
        at: () => ({ x: FLOWER.x, y: FLOWER.y }),
        hit: (x, y) => Math.hypot(x - FLOWER.x, y - FLOWER.y) < 90
      }
    },
    { text: 'Elle dit bonjour à l’abeille !', min: 3.2, hold: 0.4 },
    { text: 'Le rouge et le jaune se mélangent… et font de l’orange !', min: 3.8, hold: 1.8 }
  ],
  music(audio) {
    return loop(audio, 60 / 72 / 2, (step, at) => {
      const n = PIANO[step % PIANO.length];
      if (n) audio.tone(440 * 2 ** ((n - 69) / 12), at, 1.4, { wave: 'triangle', gain: 0.06, bus: 'music', attack: 0.01, lp: 1800 });
      if (step % 6 === 0) audio.tone(440 * 2 ** ((n - 81) / 12 || 0), at, 2, { wave: 'sine', gain: 0.05, bus: 'music', attack: 0.02 });
      if (step % 12 === 4) audio.glock(n + 12 || 91, at, 0.3);
    });
  },
  create
};
