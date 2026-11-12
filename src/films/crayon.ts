/**
 * Boîte à outils « Crayon Picture Book » (d'après styles/crayon-book/STYLE.md de claude-video).
 * Règle centrale : la cire n'accroche que sur les bosses du grain du papier. On dessine chaque couche
 * en couleur pleine, puis on la découpe avec un masque de grain (destination-in) : trait appuyé = masque dense,
 * coloriage léger = masque clairsemé. Le lavis d'aquarelle est repoussé par la cire (destination-out).
 * Tout ce qui est dessiné « bout » : il est redessiné 12 fois par seconde avec un tremblé différent.
 */
import { H, W, clamp, hash } from './engine';

/** Résolution interne : 1,5 × le repère logique, pour un grain fin sans coûter trop cher. */
export const RES = 1.5;
const PW = Math.round(W * RES);
const PH = Math.round(H * RES);

export function canvas(w = PW, h = PH) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

export function ctx2d(c: HTMLCanvasElement) {
  const g = c.getContext('2d')!;
  g.setTransform(RES, 0, 0, RES, 0, 0);
  g.lineCap = 'round';
  g.lineJoin = 'round';
  return g;
}

function smooth(a: number, b: number, v: number) {
  const u = clamp((v - a) / (b - a));
  return u * u * (3 - 2 * u);
}

/** Bruit de valeur lissé (grille entière), pour le grain du papier. */
function valueNoise(x: number, y: number, s: number) {
  const xi = Math.floor(x),
    yi = Math.floor(y);
  const fx = x - xi,
    fy = y - yi;
  const ux = fx * fx * (3 - 2 * fx),
    uy = fy * fy * (3 - 2 * fy);
  const a = hash(xi, yi, s),
    b = hash(xi + 1, yi, s),
    c = hash(xi, yi + 1, s),
    d = hash(xi + 1, yi + 1, s);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

export interface Paper {
  paper: HTMLCanvasElement;
  toothHeavy: HTMLCanvasElement;
  toothLight: HTMLCanvasElement;
  pattern: (g: CanvasRenderingContext2D) => CanvasPattern;
}

let cachedPaper: Paper | null = null;

/** Papier crème grainé + deux masques de grain (cire appuyée / légère). Calculé une fois. */
export function makePaper(): Paper {
  if (cachedPaper) return cachedPaper;
  const paper = canvas();
  const heavy = canvas();
  const light = canvas();
  const pi = paper.getContext('2d')!.createImageData(PW, PH);
  const hi = heavy.getContext('2d')!.createImageData(PW, PH);
  const li = light.getContext('2d')!.createImageData(PW, PH);
  for (let y = 0; y < PH; y++) {
    for (let x = 0; x < PW; x++) {
      // Trois octaves de grain + une fibre horizontale.
      const n = 0.5 * valueNoise(x / 1.6, y / 1.6, 1) + 0.3 * valueNoise(x / 4, y / 4, 2) + 0.2 * valueNoise(x / 11, y / 3.5, 3);
      const fibre = 0.06 * Math.sin(y * 0.9 + valueNoise(x / 40, y / 6, 4) * 6);
      const tooth = n + fibre;
      const mott = valueNoise(x / 90, y / 90, 5) - 0.5;
      const dx = x / PW - 0.5,
        dy = y / PH - 0.5;
      const vig = 1 - 0.16 * (dx * dx + dy * dy) * 2.2;
      const shade = (1 + mott * 0.04 + (tooth - 0.5) * 0.05) * vig;
      const i = (y * PW + x) * 4;
      pi.data[i] = 244 * shade;
      pi.data[i + 1] = 239 * shade;
      pi.data[i + 2] = 227 * shade;
      pi.data[i + 3] = 255;
      hi.data[i + 3] = 255 * smooth(0.28, 0.42, tooth);
      li.data[i + 3] = 255 * smooth(0.46, 0.6, tooth);
    }
  }
  paper.getContext('2d')!.putImageData(pi, 0, 0);
  heavy.getContext('2d')!.putImageData(hi, 0, 0);
  light.getContext('2d')!.putImageData(li, 0, 0);
  const pattern = (g: CanvasRenderingContext2D) => {
    const p = g.createPattern(paper, 'no-repeat')!;
    p.setTransform(new DOMMatrix([1 / RES, 0, 0, 1 / RES, 0, 0]));
    return p;
  };
  cachedPaper = { paper, toothHeavy: heavy, toothLight: light, pattern };
  return cachedPaper;
}

/** Applique le grain à une couche de cire (et la remet en mode normal). */
export function waxify(layer: HTMLCanvasElement, tooth: HTMLCanvasElement) {
  const g = layer.getContext('2d')!;
  g.save();
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = 'destination-in';
  g.drawImage(tooth, 0, 0);
  g.restore();
}

export function clear(c: HTMLCanvasElement) {
  const g = c.getContext('2d')!;
  g.save();
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(0, 0, c.width, c.height);
  g.restore();
}

export type Pt = [number, number];

export interface LineOpts {
  color: string;
  width: number;
  /** Graine du trait : le même trait garde la même main. */
  seed: number;
  /** Pas de « bouillonnement » (change 12 fois par seconde). */
  boil: number;
  /** Amplitude du tremblé en px (≈ 1). */
  wobble?: number;
  /** Part du trait déjà tracé (0 → 1), pour le dessin en direct. */
  reveal?: number;
  closed?: boolean;
}

/** Trait de crayon : ruban effilé, main qui tremble, deux fines stries. */
export function line(g: CanvasRenderingContext2D, pts: Pt[], o: LineOpts) {
  if (pts.length < 2) return;
  const P = o.closed ? [...pts, pts[0]] : pts;
  const wob = o.wobble ?? 1;
  const jit = P.map(([x, y], i) => {
    const k = o.closed && i === P.length - 1 ? 0 : i;
    return [x + (hash(o.seed, k, o.boil) - 0.5) * 2 * wob, y + (hash(o.seed + 7, k, o.boil) - 0.5) * 2 * wob] as Pt;
  });
  // Longueur cumulée, pour la révélation et l'effilé.
  const L: number[] = [0];
  for (let i = 1; i < jit.length; i++) L.push(L[i - 1] + Math.hypot(jit[i][0] - jit[i - 1][0], jit[i][1] - jit[i - 1][1]));
  const total = L[L.length - 1] || 1;
  const until = (o.reveal ?? 1) * total;
  g.strokeStyle = o.color;
  for (let i = 1; i < jit.length; i++) {
    if (L[i - 1] > until) break;
    const u = L[i] / total;
    const taper = o.closed ? 1 : Math.min(1, u * 6, (1 - u) * 6 + 0.25);
    g.lineWidth = o.width * (0.85 + 0.3 * hash(o.seed, i, 3)) * Math.max(0.35, taper);
    const [x0, y0] = jit[i - 1];
    let [x1, y1] = jit[i];
    if (L[i] > until) {
      const f = (until - L[i - 1]) / (L[i] - L[i - 1]);
      x1 = x0 + (x1 - x0) * f;
      y1 = y0 + (y1 - y0) * f;
    }
    g.beginPath();
    g.moveTo(x0, y0);
    g.lineTo(x1, y1);
    g.stroke();
  }
  // Stries : la cire plus dense au cœur du trait.
  g.save();
  g.globalAlpha = 0.5;
  g.lineWidth = Math.max(0.6, o.width * 0.25);
  g.beginPath();
  for (let i = 0; i < jit.length && L[i] <= until; i++) {
    const [x, y] = jit[i];
    const d = (hash(o.seed, 11) - 0.5) * o.width * 0.5;
    if (i === 0) g.moveTo(x + d, y + d);
    else g.lineTo(x + d, y + d);
  }
  g.stroke();
  g.restore();
}

/** Points d'une courbe fermée « à la main » (cercle ou ovale un peu bosselé). */
export function blob(cx: number, cy: number, rx: number, ry: number, seed: number, n = 28, bump = 0.04): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r = 1 + (valueNoise(i * 0.6, seed, 9) - 0.5) * 2 * bump;
    pts.push([cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r]);
  }
  return pts;
}

/** Arc ouvert (sourire, paupière, pétale…). */
export function arc(cx: number, cy: number, r: number, a0: number, a1: number, n = 10): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return pts;
}

export function path(g: CanvasRenderingContext2D, pts: Pt[]) {
  g.beginPath();
  pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
  g.closePath();
}

export interface FillOpts {
  color: string;
  seed: number;
  /** Les coloriages de fond ne bougent pas (on passe 0). */
  boil: number;
  angle?: number;
  gap?: number;
  /** Part du coloriage déjà faite (lignes de haut en bas). */
  progress?: number;
  /** Débordement hors du contour, en px. */
  overshoot?: number;
  /** Seconde passe croisée, plus légère. */
  cross?: boolean;
}

/**
 * Coloriage en zigzag aller-retour avec un petit jour entre les passes, qui déborde un peu du contour
 * (on agrandit la zone de découpe autour de son centre).
 */
export function fill(g: CanvasRenderingContext2D, pts: Pt[], o: FillOpts) {
  const xs = pts.map((p) => p[0]),
    ys = pts.map((p) => p[1]);
  const x0 = Math.min(...xs),
    x1 = Math.max(...xs),
    y0 = Math.min(...ys),
    y1 = Math.max(...ys);
  const cx = (x0 + x1) / 2,
    cy = (y0 + y1) / 2;
  const over = o.overshoot ?? 2.5;
  const sx = 1 + (over * 2) / Math.max(8, x1 - x0),
    sy = 1 + (over * 2) / Math.max(8, y1 - y0);
  const gap = o.gap ?? 4.2;
  const pass = (angle: number, alpha: number, seedOff: number) => {
    g.save();
    g.beginPath();
    pts.forEach(([x, y], i) => {
      const X = cx + (x - cx) * sx,
        Y = cy + (y - cy) * sy;
      if (i) g.lineTo(X, Y);
      else g.moveTo(X, Y);
    });
    g.closePath();
    g.clip();
    g.translate(cx, cy);
    g.rotate(angle);
    const R = Math.hypot(x1 - x0, y1 - y0) / 2 + 6;
    const rows = Math.ceil((2 * R) / gap);
    const done = Math.floor(rows * (o.progress ?? 1));
    g.strokeStyle = o.color;
    g.globalAlpha = alpha;
    g.lineWidth = gap * 1.25;
    g.beginPath();
    for (let r = 0; r < done; r++) {
      const y = -R + r * gap + (hash(o.seed + seedOff, r, o.boil) - 0.5) * 1.2;
      const a = -R + (hash(o.seed, r, 1) - 0.5) * 6,
        b = R + (hash(o.seed, r, 2) - 0.5) * 6;
      if (r % 2) {
        g.moveTo(b, y);
        g.lineTo(a, y + gap * 0.5);
      } else {
        g.moveTo(a, y);
        g.lineTo(b, y + gap * 0.5);
      }
    }
    g.stroke();
    g.restore();
  };
  pass(o.angle ?? -0.35, 1, 0);
  if (o.cross) pass((o.angle ?? -0.35) + 1.1, 0.45, 50);
}

/**
 * Mots « imprimés » du livre : police manuscrite, chaque lettre un peu penchée et décalée,
 * écrite de gauche à droite (0,35 s pour la ligne), qui bout sur les deux.
 */
export function bookText(g: CanvasRenderingContext2D, text: string, cx: number, cy: number, o: { size: number; color: string; boil: number; appear: number; maxWidth?: number }) {
  g.save();
  g.font = `${o.size}px "Patrick Hand", "Fredoka", sans-serif`;
  g.fillStyle = o.color;
  g.textBaseline = 'middle';
  const lines = wrap(g, text, o.maxWidth ?? W - 140);
  const lh = o.size * 1.15;
  const total = text.length;
  let shown = Math.floor(clamp(o.appear) * total + 0.001);
  lines.forEach((ln, li) => {
    const wdt = g.measureText(ln).width;
    let x = cx - wdt / 2;
    const y = cy + (li - (lines.length - 1) / 2) * lh;
    for (let i = 0; i < ln.length; i++) {
      const ch = ln[i];
      const cw = g.measureText(ch).width;
      if (shown-- > 0) {
        g.save();
        g.translate(x + cw / 2 + (hash(i, li, o.boil) - 0.5) * 0.8, y + (hash(i, li, 7, o.boil) - 0.5) * 1.6);
        g.rotate((hash(i, li, 3) - 0.5) * 0.12);
        g.fillText(ch, -cw / 2, 0);
        g.restore();
      }
      x += cw;
    }
    shown--; // l'espace de fin de ligne
  });
  g.restore();
}

export function wrap(g: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const out: string[] = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (g.measureText(test).width > maxWidth && cur) {
      out.push(cur);
      cur = w;
    } else cur = test;
  }
  if (cur) out.push(cur);
  return out;
}
