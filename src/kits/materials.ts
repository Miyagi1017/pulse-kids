/**
 * Les 7 matières des kits de style. Chacune rend n'importe quelle figure (geom.ts) dans son style,
 * d'après les fiches de claude-video / Lemo-Opuscar (MIT) déjà utilisées pour les petits films :
 *  crayon (cire sur papier grainé), rubber-hose (cartoon années 30), paper-popup (papier découpé),
 *  shadow-puppet (théâtre d'ombres), brick-toy (briques), whiteboard (feutre), watercolor (aquarelle).
 * Chaque matière dessine dans son propre tampon (1,5 × le repère 960 × 540), puis le présente.
 */
import { H, W, clamp, hash } from '../films/engine';
import type { FilmStyle } from '../films/engine';
import { RES, canvas, ctx2d, fill as crayonFill, line as crayonLine, makePaper, waxify, wrap, bookText } from '../films/crayon';
import { bbox, grey, pathPts, shade, type Figure, type Pt, type Shape } from './geom';

export interface KitFrame {
  t: number;
  still?: boolean;
}

export interface DrawOpts {
  /** Apparition (0 → 1) : dessin en direct, peinture qui s'étale, carte qui se déplie… */
  reveal?: number;
  alpha?: number;
}

export interface Material {
  /** Identifiant du style (un des 66, voir styles.ts). */
  id: string;
  label: string;
  /** Images par seconde du dessin (12 = « sur les deux »), 0 = continu. */
  fps: number;
  begin(f: KitFrame): void;
  draw(fig: Figure, o?: DrawOpts): void;
  end(): void;
  caption(text: string): void;
  title(text: string, k: number): void;
  /** Petite étiquette (score, compteur) en haut à droite. */
  badge(text: string): void;
  present(ctx: CanvasRenderingContext2D): void;
  dispose(): void;
}

const freeCanvases = (...cs: HTMLCanvasElement[]) =>
  cs.forEach((c) => {
    c.width = 0;
    c.height = 0;
  });

function clearAll(c: HTMLCanvasElement) {
  const g = c.getContext('2d')!;
  g.save();
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(0, 0, c.width, c.height);
  g.restore();
}

/** Révélation d'un polygone fermé : on n'en garde qu'une part du contour (pour les dessins en direct). */
function partial(pts: Pt[], u: number): Pt[] {
  if (u >= 1) return pts;
  const n = Math.max(2, Math.ceil(pts.length * u));
  return pts.slice(0, n);
}

/** Centre et rayon d'une figure (apparition par un cercle qui grandit). */
function centerOf(fig: Figure) {
  const b = bbox(fig);
  return { x: (b.x0 + b.x1) / 2, y: (b.y0 + b.y1) / 2, r: Math.hypot(b.x1 - b.x0, b.y1 - b.y0) / 2 };
}

export function revealClip(g: CanvasRenderingContext2D, fig: Figure, u: number, wavy = 0) {
  if (u >= 1) return;
  const c = centerOf(fig);
  const r = c.r * u + 0.5;
  g.beginPath();
  for (let i = 0; i <= 40; i++) {
    const a = (i / 40) * Math.PI * 2;
    const rr = r * (1 + wavy * Math.sin(a * 5 + fig.seed));
    if (i) g.lineTo(c.x + Math.cos(a) * rr, c.y + Math.sin(a) * rr);
    else g.moveTo(c.x + Math.cos(a) * rr, c.y + Math.sin(a) * rr);
  }
  g.closePath();
  g.clip();
}

/** Dessin « à plat » (sert de base à plusieurs matières : ombre portée, mosaïque de briques…). */
function flat(g: CanvasRenderingContext2D, fig: Figure, colorOf: (s: Shape) => string = (s) => s.color) {
  for (const s of fig.shapes) {
    pathPts(g, s.pts, s.closed);
    if (s.closed) {
      g.fillStyle = colorOf(s);
      g.fill();
    } else {
      g.strokeStyle = colorOf(s);
      g.lineWidth = s.width ?? 3;
      g.lineCap = 'round';
      g.lineJoin = 'round';
      g.stroke();
    }
  }
}

/* ═══════════════ Crayon de cire ═══════════════ */

function crayonMaterial(): Material {
  const P = makePaper();
  const buf = canvas(),
    bgL = canvas(),
    bgF = canvas(),
    frL = canvas(),
    frF = canvas();
  const B = ctx2d(buf);
  const knock: Figure[] = [];
  let boil = 0;
  const INK = '#2e2a6b';
  // Le décor ne change presque jamais : on le compose une fois par dessin (3 dessins qui tournent, comme un
  // livre animé qui « bout »), au lieu de repasser toute la cire à chaque image. Gain ≈ ×3 sur tablette.
  const back: { fig: Figure; o: DrawOpts }[] = [];
  const bgCache = new Map<string, HTMLCanvasElement>();
  const keyOf = () =>
    back
      .map(({ fig, o }) => {
        const p = fig.shapes[0]?.pts[0] ?? [0, 0];
        return `${fig.seed}:${fig.shapes.length}:${Math.round(p[0] / 3)}:${Math.round(p[1] / 3)}:${Math.round((o.reveal ?? 1) * 24)}`;
      })
      .join('|');
  const paint = (fig: Figure, o: DrawOpts, L: CanvasRenderingContext2D, F: CanvasRenderingContext2D, front: boolean, lb: number) => {
    const u = o.reveal ?? 1;
    fig.shapes.forEach((s, i) => {
        const seed = fig.seed * 31 + i;
        if (s.role === 'sky') crayonFill(F, s.pts, { color: s.color, seed, boil: 0, gap: 5, angle: -0.25 + (i % 3) * 0.2, overshoot: 0, progress: u });
        else if (s.role === 'body' || s.role === 'part') {
          crayonFill(F, s.pts, { color: s.color, seed, boil: front ? boil : 0, gap: front ? 3.6 : 4.2, progress: u, cross: s.role === 'body' && !front });
          if (s.role === 'body') crayonLine(L, s.pts, { color: INK, width: front ? 2.6 : 2.2, seed, boil: lb, wobble: 0.8, closed: true, reveal: u });
        } else if (s.role === 'line') crayonLine(L, s.pts, { color: s.color === '#FFFFFF' ? s.color : s.color, width: Math.max(2, (s.width ?? 3) * 0.9), seed, boil: lb, wobble: 0.6, reveal: u });
        else {
          L.fillStyle = s.color;
          pathPts(L, s.pts, true);
          L.fill();
        }
      });
  };
  return {
    id: 'crayon',
    label: 'Crayon de cire',
    fps: 12,
    begin(f) {
      boil = Math.floor(f.t * 12);
      [frL, frF].forEach(clearAll);
      knock.length = 0;
      back.length = 0;
    },
    draw(fig, o = {}) {
      const front = fig.layer === 'front';
      if (!front) {
        back.push({ fig, o });
        return;
      }
      knock.push(fig);
      paint(fig, o, ctx2d(frL), ctx2d(frF), true, boil);
    },
    end() {
      const phase = Math.floor(boil * 0.6) % 3;
      const key = `${phase}#${keyOf()}`;
      let bg = bgCache.get(key);
      if (!bg) {
        [bgL, bgF].forEach(clearAll);
        const L = ctx2d(bgL),
          F = ctx2d(bgF);
        for (const { fig, o } of back) paint(fig, o, L, F, false, phase);
        waxify(bgL, P.toothHeavy);
        waxify(bgF, P.toothLight);
        if (bgCache.size >= 6) {
          const [old, oldC] = bgCache.entries().next().value as [string, HTMLCanvasElement];
          freeCanvases(oldC);
          bgCache.delete(old);
        }
        bg = canvas();
        const g = bg.getContext('2d')!;
        g.drawImage(P.paper, 0, 0);
        g.drawImage(bgF, 0, 0);
        g.drawImage(bgL, 0, 0);
        bgCache.set(key, bg);
      }
      waxify(frL, P.toothHeavy);
      waxify(frF, P.toothLight);
      B.save();
      B.setTransform(1, 0, 0, 1, 0, 0);
      B.drawImage(bg, 0, 0);
      B.restore();
      // Les personnages et objets gardent le papier blanc derrière eux (réserve), puis on les colorie.
      B.save();
      B.fillStyle = P.pattern(B);
      for (const fig of knock)
        for (const s of fig.shapes)
          if (s.role === 'body') {
            pathPts(B, s.pts, true);
            B.fill();
          }
      B.restore();
      B.save();
      B.setTransform(1, 0, 0, 1, 0, 0);
      B.drawImage(frF, 0, 0);
      B.drawImage(frL, 0, 0);
      B.restore();
    },
    caption(text) {
      // Bande de papier déchiré en bas, les mots écrits à la main.
      B.save();
      B.fillStyle = P.pattern(B);
      B.beginPath();
      B.moveTo(60, 474);
      for (let x = 60; x <= 900; x += 20) B.lineTo(x, 470 + hash(x, 3) * 6);
      B.lineTo(900, 530);
      for (let x = 900; x >= 60; x -= 20) B.lineTo(x, 532 + hash(x, 4) * 5);
      B.closePath();
      B.shadowColor = 'rgba(0,0,0,0.18)';
      B.shadowBlur = 6;
      B.fill();
      B.restore();
      bookText(B, text, W / 2, 501, { size: 25, color: INK, boil, appear: 1, maxWidth: 800 });
    },
    title(text, k) {
      if (k <= 0) return;
      B.save();
      B.globalAlpha = clamp(k * 2);
      bookText(B, text, W / 2, 70, { size: 46, color: INK, boil, appear: k, maxWidth: 820 });
      B.restore();
    },
    badge(text) {
      bookText(B, text, 880, 34, { size: 26, color: INK, boil, appear: 1 });
    },
    present(ctx) {
      ctx.drawImage(buf, 0, 0, buf.width, buf.height, 0, 0, W, H);
    },
    dispose() {
      freeCanvases(buf, bgL, bgF, frL, frF, ...bgCache.values());
      bgCache.clear();
    }
  };
}

/* ═══════════════ Cartoon années 30 (rubber hose) ═══════════════ */

function rubberMaterial(): Material {
  const buf = canvas();
  const B = ctx2d(buf);
  const vig = canvas();
  {
    const g = ctx2d(vig);
    const grd = g.createRadialGradient(480, 270, 200, 480, 270, 560);
    grd.addColorStop(0, 'rgba(0,0,0,0)');
    grd.addColorStop(1, 'rgba(0,0,0,0.55)');
    g.fillStyle = grd;
    g.fillRect(0, 0, W, H);
  }
  const INK = '#141210';
  let t = 0,
    boil = 0,
    still = false;
  const jitter = (pts: Pt[], seed: number, k: number) => pts.map(([x, y], i) => [x + (hash(seed, i, boil) - 0.5) * 2 * k, y + (hash(seed + 3, i, boil) - 0.5) * 2 * k] as Pt);
  return {
    id: 'rubber-hose',
    label: 'Dessin animé des années 30',
    fps: 12,
    begin(f) {
      t = f.t;
      still = !!f.still;
      boil = Math.floor(f.t * 12) % 3;
      B.save();
      B.setTransform(1, 0, 0, 1, 0, 0);
      B.fillStyle = '#000';
      B.fillRect(0, 0, buf.width, buf.height);
      B.restore();
    },
    draw(fig, o = {}) {
      const front = fig.layer === 'front';
      B.save();
      if ((o.reveal ?? 1) < 1) revealClip(B, fig, o.reveal ?? 1);
      fig.shapes.forEach((s, i) => {
        const pts = front ? jitter(s.pts, fig.seed * 7 + i, 1.1) : s.pts;
        // Le décor reste en gris peint ; seuls les personnages et les objets gardent leurs couleurs.
        const col = front ? s.color : grey(s.color, s.role === 'sky' ? 0.05 : 0);
        pathPts(B, pts, s.closed);
        if (s.role === 'line') {
          B.strokeStyle = front ? INK : grey(s.color, -0.2);
          B.lineWidth = (s.width ?? 3) * (front ? 1.1 : 1);
          B.lineCap = 'round';
          B.stroke();
        } else if (s.role === 'dot') {
          B.fillStyle = front ? INK : col;
          B.fill();
        } else {
          B.fillStyle = col;
          B.fill();
          if (s.role !== 'sky') {
            B.strokeStyle = front ? INK : '#3f3a35';
            B.lineWidth = front ? (s.role === 'body' ? 3.2 : 2) : 1.4;
            B.lineJoin = 'round';
            B.stroke();
          }
        }
      });
      B.restore();
    },
    end() {
      // Pellicule : vignettage, scintillement, rayures, poussières.
      B.drawImage(vig, 0, 0, W, H);
      const f = Math.floor(t * 24);
      if (!still) {
        B.fillStyle = `rgba(0,0,0,${hash(f, 1) * 0.07})`;
        B.fillRect(0, 0, W, H);
      }
      const seg = Math.floor(t * 1.3);
      for (let i = 0; i < Math.floor(hash(seg, 2) * 3.2); i++) {
        const x = 40 + hash(seg, i, 3) * (W - 80) + Math.sin(t * 3 + i) * 4;
        B.strokeStyle = hash(seg, i, 4) > 0.5 ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)';
        B.lineWidth = 0.8 + hash(seg, i, 5);
        B.beginPath();
        B.moveTo(x, 0);
        B.lineTo(x + hash(seg, i, 6) * 6 - 3, H);
        B.stroke();
      }
      for (let i = 0; i < 3 + Math.floor(hash(f, 7) * 6); i++) {
        B.fillStyle = hash(f, i, 8) > 0.6 ? 'rgba(255,255,255,0.6)' : 'rgba(10,8,6,0.6)';
        B.beginPath();
        B.ellipse(hash(f, i, 9) * W, hash(f, i, 10) * H, 0.6 + hash(f, i, 11) * 2, 0.6 + hash(f, i, 12) * 1.6, 0, 0, Math.PI * 2);
        B.fill();
      }
    },
    caption(text) {
      B.save();
      B.font = '21px "IM Fell English SC", serif';
      const lines = wrap(B, text, 640);
      const w = Math.max(...lines.map((l) => B.measureText(l).width)) + 56;
      const h = lines.length * 26 + 28;
      const x = 480 - w / 2,
        y = 526 - h;
      B.fillStyle = '#16130f';
      B.fillRect(x, y, w, h);
      B.strokeStyle = '#f4f1ea';
      B.lineWidth = 1.6;
      B.strokeRect(x + 5, y + 5, w - 10, h - 10);
      B.lineWidth = 0.8;
      B.strokeRect(x + 9, y + 9, w - 18, h - 18);
      B.fillStyle = '#f4f1ea';
      B.textAlign = 'center';
      B.textBaseline = 'middle';
      lines.forEach((l, i) => B.fillText(l, 480, y + h / 2 + (i - (lines.length - 1) / 2) * 26));
      B.restore();
    },
    title(text, k) {
      if (k <= 0) return;
      B.save();
      B.font = '46px "Shrikhand", serif';
      B.textAlign = 'center';
      B.textBaseline = 'middle';
      const y = 80 - (1 - clamp(k * 1.6)) * 60 - Math.max(0, Math.sin(t * 2 * Math.PI)) * 5;
      B.lineJoin = 'round';
      B.fillStyle = INK;
      B.fillText(text, 484, y + 5);
      B.lineWidth = 7;
      B.strokeStyle = INK;
      B.strokeText(text, 480, y);
      B.fillStyle = '#ffffff';
      B.fillText(text, 480, y);
      B.restore();
    },
    badge(text) {
      B.save();
      B.font = '24px "IM Fell English SC", serif';
      B.textAlign = 'right';
      B.fillStyle = '#16130f';
      const w = B.measureText(text).width + 24;
      B.fillRect(920 - w, 14, w, 36);
      B.fillStyle = '#f4f1ea';
      B.fillText(text, 908, 40);
      B.restore();
    },
    present(ctx) {
      ctx.drawImage(buf, 0, 0, buf.width, buf.height, 0, 0, W, H);
    },
    dispose() {
      freeCanvases(buf, vig);
    }
  };
}

/* ═══════════════ Livre pop-up en papier ═══════════════ */

function popupMaterial(): Material {
  const buf = canvas();
  const B = ctx2d(buf);
  const grain = canvas();
  {
    const g = grain.getContext('2d')!;
    for (let i = 0; i < (grain.width * grain.height) / 60; i++) {
      g.fillStyle = hash(i, 1) > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(60,40,20,0.05)';
      g.fillRect(hash(i, 2) * grain.width, hash(i, 3) * grain.height, 2, 2);
    }
  }
  const INK = '#4a2e1f';
  const BORDER = '#f6f0e2';
  return {
    id: 'paper-popup',
    label: 'Livre pop-up en papier',
    fps: 0,
    begin() {
      B.save();
      B.setTransform(1, 0, 0, 1, 0, 0);
      B.fillStyle = '#efe6d2';
      B.fillRect(0, 0, buf.width, buf.height);
      B.restore();
    },
    draw(fig, o = {}) {
      const front = fig.layer === 'front';
      const u = o.reveal ?? 1;
      B.save();
      // Le décor se déplie depuis sa base (comme une carte qui se lève).
      if (u < 1) {
        const b = bbox(fig);
        const k = Math.max(0.001, u < 1 ? 1 + 2.9 * (u - 1) ** 3 + 1.9 * (u - 1) ** 2 : 1);
        B.translate(0, b.y1);
        B.scale(1, k);
        B.translate(0, -b.y1);
      }
      // Ombre portée : la silhouette, décalée vers la droite et vers le bas.
      if (front || fig.shapes.some((s) => s.role === 'body')) {
        B.save();
        B.translate(front ? 9 : 5, front ? 11 : 6);
        for (const s of fig.shapes) {
          if (s.role === 'sky' || !s.closed) continue;
          pathPts(B, s.pts, true);
          B.fillStyle = 'rgba(45,28,12,0.16)';
          B.fill();
        }
        B.restore();
      }
      fig.shapes.forEach((s) => {
        if (s.role === 'sky') {
          pathPts(B, s.pts, true);
          B.fillStyle = s.color;
          B.fill();
          B.strokeStyle = 'rgba(74,46,31,0.25)';
          B.lineWidth = 1.2;
          B.stroke();
          return;
        }
        if (!s.closed) {
          pathPts(B, s.pts, false);
          B.lineCap = 'round';
          B.lineJoin = 'round';
          B.strokeStyle = BORDER;
          B.lineWidth = (s.width ?? 3) + 5;
          B.stroke();
          B.strokeStyle = s.color === '#FFFFFF' ? '#cfc6b4' : s.color;
          B.lineWidth = s.width ?? 3;
          B.stroke();
          return;
        }
        if (s.role === 'dot') {
          pathPts(B, s.pts, true);
          B.fillStyle = INK;
          B.fill();
          return;
        }
        // Carte : tranche grise, large bord blanc cassé, puis aplat avec ombre en croissant.
        B.lineJoin = 'round';
        if (s.role === 'body') {
          B.save();
          B.translate(0, 2.5);
          pathPts(B, s.pts, true);
          B.strokeStyle = '#a39a8a';
          B.lineWidth = 10;
          B.stroke();
          B.restore();
          pathPts(B, s.pts, true);
          B.strokeStyle = BORDER;
          B.lineWidth = 9;
          B.stroke();
        }
        pathPts(B, s.pts, true);
        B.fillStyle = shade(s.color, -0.16);
        B.fill();
        B.save();
        B.clip();
        B.translate(-3, -3);
        pathPts(B, s.pts, true);
        B.fillStyle = s.color;
        B.fill();
        B.restore();
        if (s.role === 'body') {
          pathPts(B, s.pts, true);
          B.strokeStyle = INK;
          B.lineWidth = 2;
          B.stroke();
        }
      });
      B.restore();
    },
    end() {
      B.save();
      B.setTransform(1, 0, 0, 1, 0, 0);
      B.drawImage(grain, 0, 0);
      B.restore();
      const lamp = B.createRadialGradient(200, 40, 40, 300, 160, 760);
      lamp.addColorStop(0, 'rgba(255,214,150,0.22)');
      lamp.addColorStop(1, 'rgba(255,214,150,0)');
      B.fillStyle = lamp;
      B.fillRect(0, 0, W, H);
      const vg = B.createRadialGradient(480, 280, 300, 480, 280, 620);
      vg.addColorStop(0, 'rgba(20,10,4,0)');
      vg.addColorStop(1, 'rgba(20,10,4,0.4)');
      B.fillStyle = vg;
      B.fillRect(0, 0, W, H);
    },
    caption(text) {
      B.save();
      B.font = '600 24px "Fredoka", sans-serif';
      B.textAlign = 'center';
      B.textBaseline = 'middle';
      wrap(B, text, 880).forEach((l, i, a) => {
        const y = 512 - (a.length - 1 - i) * 30;
        B.shadowColor = 'rgba(0,0,0,0.35)';
        B.shadowBlur = 6;
        B.lineJoin = 'round';
        B.lineWidth = 7;
        B.strokeStyle = INK;
        B.strokeText(l, 480, y);
        B.shadowBlur = 0;
        B.fillStyle = '#fff6e0';
        B.fillText(l, 480, y);
      });
      B.restore();
    },
    title(text, k) {
      if (k <= 0) return;
      B.save();
      const kk = clamp(k * 1.5);
      B.translate(480, 70);
      B.scale(1, 1 + 2.9 * (kk - 1) ** 3 + 1.9 * (kk - 1) ** 2);
      B.font = '600 40px "Fredoka", sans-serif';
      const w = B.measureText(text).width + 50;
      B.fillStyle = 'rgba(45,28,12,0.18)';
      B.beginPath();
      B.roundRect(-w / 2 + 7, -28 + 8, w, 58, 12);
      B.fill();
      B.fillStyle = '#fff6e0';
      B.strokeStyle = BORDER;
      B.lineWidth = 8;
      B.beginPath();
      B.roundRect(-w / 2, -28, w, 58, 12);
      B.stroke();
      B.fill();
      B.strokeStyle = INK;
      B.lineWidth = 2;
      B.stroke();
      B.fillStyle = '#e2574c';
      B.textAlign = 'center';
      B.textBaseline = 'middle';
      B.fillText(text, 0, 2);
      B.restore();
    },
    badge(text) {
      B.save();
      B.font = '600 24px "Fredoka", sans-serif';
      B.textAlign = 'right';
      B.lineWidth = 6;
      B.strokeStyle = INK;
      B.lineJoin = 'round';
      B.strokeText(text, 930, 40);
      B.fillStyle = '#fff6e0';
      B.fillText(text, 930, 40);
      B.restore();
    },
    present(ctx) {
      ctx.drawImage(buf, 0, 0, buf.width, buf.height, 0, 0, W, H);
    },
    dispose() {
      freeCanvases(buf, grain);
    }
  };
}

/* ═══════════════ Théâtre d'ombres ═══════════════ */

/** La bande de sol ciselée passe sous les pieds des personnages (jamais à travers leurs jambes). */
const FEET_LINE = 478;

function shadowMaterial(): Material {
  const buf = canvas(),
    T = canvas(),
    tmp = canvas(),
    lamp = canvas(),
    cloth = canvas();
  const B = ctx2d(buf);
  const HIDE = 'rgba(38, 24, 15, 0.94)';
  {
    const g = ctx2d(lamp);
    const lobe = g.createRadialGradient(480, 230, 30, 480, 250, 600);
    lobe.addColorStop(0, '#ffd28a');
    lobe.addColorStop(0.45, '#f4a24a');
    lobe.addColorStop(1, '#8a3d12');
    g.fillStyle = lobe;
    g.fillRect(0, 0, W, H);
    const hot = g.createRadialGradient(470, 210, 0, 470, 210, 220);
    hot.addColorStop(0, 'rgba(255,240,200,0.5)');
    hot.addColorStop(1, 'rgba(255,240,200,0)');
    g.fillStyle = hot;
    g.fillRect(0, 0, W, H);
    const c = cloth.getContext('2d')!;
    const img = c.createImageData(cloth.width, cloth.height);
    for (let y = 0; y < cloth.height; y++)
      for (let x = 0; x < cloth.width; x++) {
        const weave = 0.5 + 0.5 * Math.sin(x * 1.7) * Math.sin(y * 1.7);
        const blotch = 0.03 * (1 + Math.sin(x * 0.011 + Math.sin(y * 0.007) * 2) * Math.sin(y * 0.013 + 1));
        const v = 255 * (1 - weave * 0.07 - blotch);
        const i = (y * cloth.width + x) * 4;
        img.data[i] = v;
        img.data[i + 1] = v * 0.97;
        img.data[i + 2] = v * 0.92;
        img.data[i + 3] = 255;
      }
    c.putImageData(img, 0, 0);
  }
  let t = 0,
    still = false;
  const G = ctx2d(T);
  return {
    id: 'shadow-puppet',
    label: 'Théâtre d’ombres',
    fps: 0,
    begin(f) {
      t = f.t;
      still = !!f.still;
      G.save();
      G.setTransform(1, 0, 0, 1, 0, 0);
      G.globalCompositeOperation = 'source-over';
      G.fillStyle = '#fff';
      G.fillRect(0, 0, T.width, T.height);
      G.restore();
    },
    draw(fig, o = {}) {
      // Chaque pièce est préparée à part (pour y percer ses trous), puis posée en multiply sur la toile.
      clearAll(tmp);
      const g = ctx2d(tmp);
      // save/restore : la découpe d'apparition ne doit pas rester collée au tampon pour les pièces suivantes.
      g.save();
      const front = fig.layer === 'front';
      const tr = front && !still ? { x: Math.sin(t * 1.7 + fig.seed) * 1.4, y: Math.sin(t * 1.3 + fig.seed * 3) } : { x: 0, y: 0 };
      g.translate(tr.x, tr.y);
      if ((o.reveal ?? 1) < 1) revealClip(g, fig, o.reveal ?? 1);
      for (const s of fig.shapes) {
        pathPts(g, s.pts, s.closed);
        if (s.role === 'sky') {
          // Le fond reste lumineux : juste une teinture très légère ; le sol devient une étroite bande de cuir ciselée.
          const top = Math.min(...s.pts.map(([, y]) => y));
          if (top > 300 && top < 520) {
            g.save();
            g.beginPath();
            g.rect(-50, Math.max(top, FEET_LINE) - 4, W + 100, 34);
            g.clip();
            pathPts(g, s.pts, true);
            g.fillStyle = HIDE;
            g.fill();
            g.restore();
          } else if (top <= 300) {
            g.fillStyle = s.color;
            g.globalAlpha = 0.16;
            g.fill();
            g.globalAlpha = 1;
          }
        } else if (s.role === 'line') {
          g.strokeStyle = HIDE;
          g.lineWidth = Math.max(2, s.width ?? 3);
          g.lineCap = 'round';
          g.stroke();
        } else if (s.role === 'dot') {
          // Les yeux et boutons sont des trous : la lumière passe.
          g.save();
          g.globalCompositeOperation = 'destination-out';
          g.fill();
          g.restore();
        } else if (s.role === 'body') {
          // Les corps sont des silhouettes de cuir : c'est l'ombre qui raconte (le décor un peu plus pâle, plus loin de l'écran).
          g.fillStyle = front ? HIDE : 'rgba(38, 24, 15, 0.7)';
          g.fill();
        } else {
          // Les pièces secondaires (vêtements, pétales, taches) sont teintes : la lampe les traverse en couleur profonde.
          g.fillStyle = front ? shade(s.color, -0.35) : 'rgba(38, 24, 15, 0.55)';
          g.fill();
          g.strokeStyle = HIDE;
          g.lineWidth = 1.6;
          g.stroke();
        }
      }
      g.restore();
      G.save();
      G.setTransform(1, 0, 0, 1, 0, 0);
      G.globalCompositeOperation = 'multiply';
      G.globalAlpha = o.alpha ?? 1;
      G.drawImage(tmp, 0, 0);
      G.restore();
    },
    end() {
      B.save();
      B.setTransform(1, 0, 0, 1, 0, 0);
      B.globalCompositeOperation = 'source-over';
      B.drawImage(lamp, 0, 0);
      B.globalCompositeOperation = 'multiply';
      B.drawImage(T, 0, 0);
      B.drawImage(cloth, 0, 0);
      B.globalCompositeOperation = 'source-over';
      B.restore();
      const flicker = still ? 0 : 0.05 * (0.5 + 0.5 * Math.sin(t * 7.3) * Math.sin(t * 3.1 + 1)) + 0.03 * hash(Math.floor(t * 14));
      B.fillStyle = `rgba(20,6,0,${flicker})`;
      B.fillRect(0, 0, W, H);
      const vg = B.createRadialGradient(480, 240, 240, 480, 240, 580);
      vg.addColorStop(0, 'rgba(60,20,0,0)');
      vg.addColorStop(1, 'rgba(60,20,0,0.55)');
      B.fillStyle = vg;
      B.fillRect(0, 0, W, H);
    },
    caption(text) {
      B.save();
      B.font = '600 24px "Cormorant Garamond", serif';
      const lines = wrap(B, text, 720);
      const w = Math.max(...lines.map((l) => B.measureText(l).width)) + 70;
      const h = lines.length * 26 + 18;
      const x = 480 - w / 2,
        y = 506 - h / 2;
      B.fillStyle = '#1c0b06';
      B.beginPath();
      B.roundRect(x, y, w, h, 6);
      B.fill();
      B.strokeStyle = '#c9a14a';
      B.lineWidth = 1.2;
      B.strokeRect(x + 5, y + 5, w - 10, h - 10);
      B.fillStyle = '#b8342a';
      B.fillRect(x + 12, y + h / 2 - 7, 14, 14);
      B.fillStyle = '#f3e3c3';
      B.textAlign = 'center';
      B.textBaseline = 'middle';
      lines.forEach((l, i) => B.fillText(l, 488, y + h / 2 + (i - (lines.length - 1) / 2) * 26 + 1));
      B.restore();
    },
    title(text, k) {
      if (k <= 0) return;
      // Plaque de cuir sombre, lettres découpées : la lumière passe par les mots.
      B.save();
      B.globalAlpha = clamp(k * 2);
      B.font = '600 44px "Cormorant Garamond", serif';
      const w = B.measureText(text).width + 60;
      B.fillStyle = '#26180f';
      B.beginPath();
      B.roundRect(480 - w / 2, 36, w, 74, 14);
      B.fill();
      B.fillStyle = '#ffd28a';
      B.textAlign = 'center';
      B.textBaseline = 'middle';
      B.fillText(text, 480, 75);
      B.restore();
    },
    badge(text) {
      B.save();
      B.font = '600 26px "Cormorant Garamond", serif';
      B.textAlign = 'right';
      B.fillStyle = '#26180f';
      B.fillText(text, 930, 42);
      B.restore();
    },
    present(ctx) {
      ctx.drawImage(buf, 0, 0, buf.width, buf.height, 0, 0, W, H);
    },
    dispose() {
      freeCanvases(buf, T, tmp, lamp, cloth);
    }
  };
}

/* ═══════════════ Briques ═══════════════ */

const BRICKS = ['#c91a09', '#0055bf', '#f2cd37', '#237841', '#f2f2ee', '#1b2a34', '#a0a5a9', '#6c6e68', '#e4cd9e', '#fe8a18', '#fc97ac', '#9fc3e9', '#583927', '#bbe90b', '#73dca1', '#d9d9d6', '#ffcf9e', '#8e5597', '#5a93db', '#ffd59a', '#c4e3f5', '#f8f1e4', '#fbe696', '#9bd36c', '#e8b48f', '#f7c6d9', '#3a4778', '#2d3a6e', '#8e96a3', '#ff6b5b'];

function nearestBrick(r: number, g: number, b: number) {
  let best = BRICKS[0],
    d = Infinity;
  for (const hex of BRICKS) {
    const n = parseInt(hex.slice(1), 16);
    const dd = (r - (n >> 16)) ** 2 + (g - ((n >> 8) & 255)) ** 2 + (b - (n & 255)) ** 2;
    if (dd < d) {
      d = dd;
      best = hex;
    }
  }
  return best;
}

function brickMaterial(): Material {
  const buf = canvas();
  const B = ctx2d(buf);
  const small = document.createElement('canvas');
  const sg = small.getContext('2d', { willReadFrequently: true })!;
  const set = canvas();
  {
    // Un vrai bureau en bois clair, la lumière du jour, un mur flou derrière.
    const g = ctx2d(set);
    const wall = g.createLinearGradient(0, 0, 0, H);
    wall.addColorStop(0, '#dfe6ea');
    wall.addColorStop(1, '#c8a47a');
    g.fillStyle = wall;
    g.fillRect(0, 0, W, H);
  }
  return {
    id: 'brick-toy',
    label: 'Briques en stop-motion',
    fps: 12,
    begin() {
      B.save();
      B.setTransform(1, 0, 0, 1, 0, 0);
      B.drawImage(set, 0, 0);
      B.restore();
    },
    draw(fig, o = {}) {
      // On pose la figure à plat sur une grille de tenons, puis chaque case devient une petite brique.
      const front = fig.layer === 'front';
      const cell = front ? 10 : 16;
      const b = bbox(fig);
      const x0 = Math.floor(b.x0 / cell) * cell,
        y0 = Math.floor(b.y0 / cell) * cell;
      const cols = Math.min(120, Math.ceil((b.x1 - x0) / cell) + 1),
        rows = Math.min(80, Math.ceil((b.y1 - y0) / cell) + 1);
      if (cols <= 0 || rows <= 0) return;
      small.width = cols;
      small.height = rows;
      sg.setTransform(1 / cell, 0, 0, 1 / cell, -x0 / cell, -y0 / cell);
      sg.clearRect(x0, y0, cols * cell, rows * cell);
      flat(sg, fig);
      const data = sg.getImageData(0, 0, cols, rows).data;
      const u = o.reveal ?? 1;
      const limit = Math.floor(rows * (1 - u));
      for (let r = rows - 1; r >= 0; r--) {
        if (r < limit) break; // Les briques se posent de bas en haut.
        for (let c = 0; c < cols; c++) {
          const i = (r * cols + c) * 4;
          if (data[i + 3] < 110) continue;
          const col = nearestBrick(data[i], data[i + 1], data[i + 2]);
          const x = x0 + c * cell,
            y = y0 + r * cell;
          B.fillStyle = col;
          B.fillRect(x, y, cell, cell);
          B.fillStyle = 'rgba(0,0,0,0.22)';
          B.fillRect(x, y + cell - 1.6, cell, 1.6);
          B.fillRect(x + cell - 1.2, y, 1.2, cell);
          B.fillStyle = 'rgba(255,255,255,0.18)';
          B.fillRect(x, y, cell, 1.2);
          // Tenon.
          B.fillStyle = 'rgba(0,0,0,0.2)';
          B.beginPath();
          B.arc(x + cell / 2 + 0.8, y + cell / 2 + 0.8, cell * 0.3, 0, Math.PI * 2);
          B.fill();
          B.fillStyle = col;
          B.beginPath();
          B.arc(x + cell / 2, y + cell / 2, cell * 0.3, 0, Math.PI * 2);
          B.fill();
          B.fillStyle = 'rgba(255,255,255,0.4)';
          B.beginPath();
          B.arc(x + cell / 2 - cell * 0.1, y + cell / 2 - cell * 0.1, cell * 0.09, 0, Math.PI * 2);
          B.fill();
        }
      }
    },
    end() {},
    caption(text) {
      B.save();
      B.font = '600 22px "Fredoka", sans-serif';
      const lines = wrap(B, text, 720);
      const w = Math.max(...lines.map((l) => B.measureText(l).width)) + 60;
      const h = lines.length * 27 + 18;
      const x = 480 - w / 2,
        y = 528 - h;
      B.fillStyle = 'rgba(27,42,52,0.9)';
      B.beginPath();
      B.roundRect(x, y, w, h, h / 2);
      B.fill();
      B.fillStyle = '#c91a09';
      B.fillRect(x + 16, y + h / 2 - 7, 18, 14);
      B.fillStyle = '#ffffff';
      B.textAlign = 'center';
      B.textBaseline = 'middle';
      lines.forEach((l, i) => B.fillText(l, 480 + 12, y + h / 2 + (i - (lines.length - 1) / 2) * 27 + 1));
      B.restore();
    },
    title(text, k) {
      if (k <= 0) return;
      B.save();
      const kk = clamp(k * 1.4);
      B.translate(480, 70);
      B.scale(kk, kk);
      B.font = '600 44px "Fredoka", sans-serif';
      B.textAlign = 'left';
      B.textBaseline = 'middle';
      const cols = ['#c91a09', '#0055bf', '#f2cd37', '#237841'];
      let x = -B.measureText(text).width / 2;
      [...text].forEach((ch, i) => {
        B.lineWidth = 7;
        B.lineJoin = 'round';
        B.strokeStyle = '#ffffff';
        B.strokeText(ch, x, 0);
        B.fillStyle = cols[i % 4];
        B.fillText(ch, x, 0);
        x += B.measureText(ch).width;
      });
      B.restore();
    },
    badge(text) {
      B.save();
      B.font = '600 22px "Fredoka", sans-serif';
      const w = B.measureText(text).width + 30;
      B.fillStyle = 'rgba(27,42,52,0.9)';
      B.beginPath();
      B.roundRect(930 - w, 16, w, 36, 18);
      B.fill();
      B.fillStyle = '#fff';
      B.textAlign = 'center';
      B.textBaseline = 'middle';
      B.fillText(text, 930 - w / 2, 35);
      B.restore();
    },
    present(ctx) {
      ctx.drawImage(buf, 0, 0, buf.width, buf.height, 0, 0, W, H);
    },
    dispose() {
      freeCanvases(buf, set);
    }
  };
}

/* ═══════════════ Tableau blanc ═══════════════ */

function whiteboardMaterial(): Material {
  const buf = canvas(),
    board = canvas(),
    ink = canvas();
  const B = ctx2d(buf);
  const I = ctx2d(ink);
  {
    const g = ctx2d(board);
    const grd = g.createLinearGradient(0, 0, W, H);
    grd.addColorStop(0, '#fbfaf6');
    grd.addColorStop(1, '#efede6');
    g.fillStyle = grd;
    g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(80,90,110,0.06)';
    g.lineWidth = 5;
    g.lineCap = 'round';
    for (let i = 0; i < 8; i++) {
      g.beginPath();
      g.moveTo(hash(i, 1) * W, hash(i, 2) * H);
      g.lineTo(hash(i, 1) * W + 80, hash(i, 2) * H + (hash(i, 5) - 0.5) * 30);
      g.stroke();
    }
  }
  const INK = '#23262c';
  let t = 0;
  const shadows: Figure[] = [];
  return {
    id: 'whiteboard',
    label: 'Tableau blanc au feutre',
    fps: 0,
    begin(f) {
      t = f.t;
      clearAll(ink);
      shadows.length = 0;
    },
    draw(fig, o = {}) {
      const u = o.reveal ?? 1;
      // Les personnages sont des aimants découpés (seuls objets qui bougent sur un tableau) : ombre portée, couleurs pleines.
      if (fig.character) {
        shadows.push(fig);
        return;
      }
      I.save();
      I.lineCap = 'round';
      I.lineJoin = 'round';
      fig.shapes.forEach((s, i) => {
        if (s.role === 'sky') {
          // Un fond se résume à une ligne d'horizon et un lavis très pâle.
          pathPts(I, s.pts, true);
          I.globalAlpha = 0.12 * u;
          I.fillStyle = s.color;
          I.fill();
          I.globalAlpha = 0.9;
          I.strokeStyle = INK;
          I.lineWidth = 3;
          const top = s.pts.filter(([, y]) => y < 520);
          if (top.length > 1 && top.length < s.pts.length) {
            pathPts(I, partial(top, u), false);
            I.stroke();
          }
          I.globalAlpha = 1;
          return;
        }
        const pts = s.closed ? partial([...s.pts, s.pts[0]], u) : partial(s.pts, u);
        if (s.role === 'line') {
          pathPts(I, pts, false);
          I.strokeStyle = s.color === '#FFFFFF' ? '#9aa6b4' : s.color;
          I.lineWidth = Math.max(3, s.width ?? 3);
          I.globalAlpha = 0.94;
          I.stroke();
        } else if (s.role === 'dot') {
          pathPts(I, s.pts, true);
          I.fillStyle = INK;
          I.globalAlpha = u >= 1 ? 0.94 : 0;
          I.fill();
        } else {
          if (u >= 1) {
            pathPts(I, s.pts, true);
            I.globalAlpha = s.role === 'body' ? 0.32 : 0.4;
            I.fillStyle = s.color;
            I.fill();
          }
          pathPts(I, pts, false);
          I.globalAlpha = 0.94;
          I.strokeStyle = s.role === 'body' ? INK : shade(s.color, -0.35);
          I.lineWidth = s.role === 'body' ? 4 : 2.6;
          I.stroke();
        }
        void i;
      });
      I.restore();
    },
    end() {
      B.save();
      B.setTransform(1, 0, 0, 1, 0, 0);
      B.drawImage(board, 0, 0);
      B.globalCompositeOperation = 'multiply';
      B.drawImage(ink, 0, 0);
      B.restore();
      // Reflet de fenêtre qui glisse.
      const sx = ((t * 18) % (W + 600)) - 300;
      const sh = B.createLinearGradient(sx, 0, sx + 260, 120);
      sh.addColorStop(0, 'rgba(255,255,255,0)');
      sh.addColorStop(0.5, 'rgba(255,255,255,0.13)');
      sh.addColorStop(1, 'rgba(255,255,255,0)');
      B.fillStyle = sh;
      B.fillRect(0, 0, W, H);
      // Les aimants-personnages par-dessus, avec leur ombre portée.
      for (const fig of shadows) {
        B.save();
        B.translate(6, 8);
        flat(B, fig, () => 'rgba(0,0,0,0.14)');
        B.restore();
        flat(B, fig);
        for (const s of fig.shapes)
          if (s.role === 'body') {
            pathPts(B, s.pts, true);
            B.strokeStyle = INK;
            B.lineWidth = 2;
            B.stroke();
          }
      }
    },
    caption(text) {
      B.save();
      B.font = '24px "Architects Daughter", sans-serif';
      const lines = wrap(B, text, 760);
      const w = Math.max(...lines.map((l) => B.measureText(l).width)) + 60;
      const h = lines.length * 28 + 16;
      const x = 480 - w / 2,
        y = 530 - h;
      B.fillStyle = 'rgba(250,249,245,0.94)';
      B.shadowColor = 'rgba(0,0,0,0.12)';
      B.shadowBlur = 8;
      B.beginPath();
      B.roundRect(x, y, w, h, 12);
      B.fill();
      B.shadowBlur = 0;
      B.fillStyle = '#d97757';
      B.fillRect(x + 14, y + h / 2 - 2, 14, 4);
      B.fillStyle = INK;
      B.textAlign = 'center';
      B.textBaseline = 'middle';
      lines.forEach((l, i) => B.fillText(l, 492, y + h / 2 + (i - (lines.length - 1) / 2) * 28 + 1));
      B.restore();
    },
    title(text, k) {
      if (k <= 0) return;
      B.save();
      B.font = '40px "Architects Daughter", sans-serif';
      const w = B.measureText(text).width;
      B.beginPath();
      B.rect(480 - w / 2 - 6, 20, (w + 12) * clamp(k * 1.3), 90);
      B.clip();
      B.fillStyle = INK;
      B.textAlign = 'center';
      B.fillText(text, 480, 76);
      B.fillStyle = '#d97757';
      B.fillRect(480 - w / 2, 90, w, 5);
      B.restore();
    },
    badge(text) {
      B.save();
      B.font = '28px "Architects Daughter", sans-serif';
      B.textAlign = 'right';
      B.fillStyle = '#2a5cb3';
      B.fillText(text, 930, 44);
      B.restore();
    },
    present(ctx) {
      ctx.drawImage(buf, 0, 0, buf.width, buf.height, 0, 0, W, H);
    },
    dispose() {
      freeCanvases(buf, board, ink);
    }
  };
}

/* ═══════════════ Aquarelle ═══════════════ */

function watercolorMaterial(): Material {
  const P = makePaper();
  const buf = canvas();
  const B = ctx2d(buf);
  const INK = '#3b2a20';
  const wash = (pts: Pt[], color: string, alpha: number, seed: number) => {
    B.fillStyle = color;
    for (let pass = 0; pass < 3; pass++) {
      B.globalAlpha = alpha * 0.42;
      B.beginPath();
      pts.forEach(([x, y], i) => {
        const jx = (hash(seed, i, pass) - 0.5) * 4,
          jy = (hash(seed, i, pass, 1) - 0.5) * 4;
        if (i) B.lineTo(x + jx, y + jy);
        else B.moveTo(x + jx, y + jy);
      });
      B.closePath();
      B.fill();
    }
    B.globalAlpha = alpha * 0.25;
    B.strokeStyle = color;
    B.lineWidth = 2;
    B.stroke();
    B.globalAlpha = 1;
  };
  return {
    id: 'watercolor',
    label: 'Aquarelle au pinceau',
    fps: 0,
    begin() {
      B.save();
      B.setTransform(1, 0, 0, 1, 0, 0);
      B.globalCompositeOperation = 'source-over';
      B.drawImage(P.paper, 0, 0);
      B.restore();
    },
    draw(fig, o = {}) {
      const front = fig.layer === 'front';
      B.save();
      if ((o.reveal ?? 1) < 1) revealClip(B, fig, o.reveal ?? 1, 0.07);
      // Pigment transparent pour le décor ; couleur couvrante pour personnages et objets (lisibles pour un enfant).
      B.globalCompositeOperation = front ? 'source-over' : 'multiply';
      fig.shapes.forEach((s, i) => {
        const seed = fig.seed * 13 + i;
        if (s.role === 'line') {
          pathPts(B, s.pts, false);
          B.strokeStyle = s.color === '#FFFFFF' ? '#d8d2c4' : s.color;
          B.globalAlpha = 0.75;
          B.lineWidth = s.width ?? 3;
          B.lineCap = 'round';
          B.stroke();
          B.globalAlpha = 1;
        } else if (s.role === 'dot') {
          pathPts(B, s.pts, true);
          B.fillStyle = INK;
          B.fill();
        } else {
          wash(s.pts, s.color, s.role === 'sky' ? 0.55 : front ? 0.95 : 0.8, seed);
          if (s.role === 'body') {
            pathPts(B, s.pts, true);
            B.strokeStyle = INK;
            B.globalAlpha = front ? 0.6 : 0.3;
            B.lineWidth = front ? 1.6 : 1.2;
            B.stroke();
            B.globalAlpha = 1;
          }
        }
      });
      B.restore();
    },
    end() {},
    caption(text) {
      B.save();
      B.font = 'italic 600 26px "Cormorant Garamond", serif';
      B.textAlign = 'center';
      B.textBaseline = 'middle';
      wrap(B, text, 820).forEach((l, i, a) => {
        const y = 510 - (a.length - 1 - i) * 28;
        B.lineJoin = 'round';
        B.lineWidth = 9;
        B.strokeStyle = 'rgba(244,239,227,0.92)';
        B.strokeText(l, 480, y);
        B.fillStyle = 'rgba(59,42,32,0.88)';
        B.fillText(l, 480, y);
      });
      B.restore();
    },
    title(text, k) {
      if (k <= 0) return;
      B.save();
      B.globalAlpha = clamp(k * 1.5);
      B.font = 'italic 600 48px "Cormorant Garamond", serif';
      B.textAlign = 'center';
      B.lineWidth = 10;
      B.lineJoin = 'round';
      B.strokeStyle = 'rgba(244,239,227,0.9)';
      B.strokeText(text, 480, 80);
      B.fillStyle = INK;
      B.fillText(text, 480, 80);
      B.restore();
    },
    badge(text) {
      B.save();
      B.font = '26px "Patrick Hand", sans-serif';
      B.textAlign = 'right';
      B.fillStyle = INK;
      B.fillText(text, 930, 42);
      B.restore();
    },
    present(ctx) {
      ctx.drawImage(buf, 0, 0, buf.width, buf.height, 0, 0, W, H);
    },
    dispose() {
      freeCanvases(buf);
    }
  };
}

export const MATERIALS: Record<FilmStyle, () => Material> = {
  crayon: crayonMaterial,
  'rubber-hose': rubberMaterial,
  'paper-popup': popupMaterial,
  'shadow-puppet': shadowMaterial,
  'brick-toy': brickMaterial,
  whiteboard: whiteboardMaterial,
  watercolor: watercolorMaterial
};

export const STYLE_LABEL: Record<FilmStyle, string> = {
  crayon: 'Crayon de cire',
  'rubber-hose': 'Dessin animé des années 30',
  'paper-popup': 'Livre pop-up en papier',
  'shadow-puppet': 'Théâtre d’ombres',
  'brick-toy': 'Briques en stop-motion',
  whiteboard: 'Tableau blanc au feutre',
  watercolor: 'Aquarelle au pinceau'
};

export { RES };
