/**
 * Les 10 styles de Pulse Kids (les plus réussis et les plus dans la tendance, gardés sur 66).
 * 3 matières faites à la main (materials.ts : pop-up, aquarelle, briques) + 7 styles décrits par une fiche
 * (StyleSpec) et rendus par une matière générique. Les 4 autres matières faites main ne servent qu'aux petits films.
 * Fiches et palettes tirées de
 * lemomo-ai/lemo-opuscar et zhgarylu/claude-video (MIT). Chaque style garde sa façon de remplir, de cerner,
 * son fond, son grain et sa police, appliqués à n'importe quelle figure des kits (geom.ts).
 */
import { H, W, clamp, hash } from '../films/engine';
import type { FilmStyle } from '../films/engine';
import { RES, canvas, ctx2d, wrap } from '../films/crayon';
import { bbox, pathPts, shade, type Figure, type Pt } from './geom';
import { MATERIALS, STYLE_LABEL, revealClip, type Material } from './materials';

type Fill = 'points' | 'glass' | 'flat' | 'shade' | 'cel' | 'hatch' | 'dots' | 'stipple' | 'glow' | 'line' | 'facet' | 'gradient' | 'wash' | 'felt' | 'brush' | 'riso';
type Bg = 'circuit' | 'window' | 'memphis' | 'plain' | 'grid' | 'lines' | 'dots' | 'waves' | 'stars' | 'rays' | 'cloth' | 'felt' | 'staff' | 'lead' | 'lightbox' | 'diag';
type Post = 'grain' | 'vignette' | 'flicker' | 'scan' | 'tilt' | 'spot' | 'scratch' | 'fibers' | 'strobe' | 'gate' | 'warm';
type Box = 'halo' | 'band' | 'card';

export interface StyleSpec {
  label: string;
  /** Couleur du papier (ou du ciel du fond) ; paper2 : bas du dégradé. */
  paper: string;
  paper2?: string;
  bg?: Bg;
  bgInk?: string;
  /** Rampe sombre → clair : la couleur de chaque forme est remplacée selon sa clarté (monochromes). */
  ramp?: string[];
  /** Palette restreinte : chaque couleur est remplacée par la plus proche. */
  palette?: string[];
  sat?: number;
  light?: number;
  /** Le décor se fond dans le papier (0 → 1), pour que personnages et objets ressortent. */
  backFade?: number;
  ink: string;
  outline: number;
  /** Contour de la couleur de la forme, assombrie (cel, broderie…). */
  inkFromColor?: boolean;
  dash?: number[];
  wobble?: number;
  fill: Fill;
  shadow?: [number, number, string];
  /** Décalage des passages d'encre (impressions). */
  misreg?: number;
  /** Taille du pixel (styles pixel). */
  pixel?: number;
  post?: Post[];
  font: string;
  fontScale?: number;
  text: string;
  box: Box;
  boxBg?: string;
  boxInk?: string;
  fps: number;
}

const F = {
  hand: '"Patrick Hand", "Fredoka", sans-serif',
  board: '"Architects Daughter", "Fredoka", sans-serif',
  serif: 'italic 600 {s}px "Cormorant Garamond", Georgia, serif',
  period: '"IM Fell English SC", Georgia, serif',
  round: '600 {s}px "Fredoka", sans-serif',
  pixel: '"Press Start 2P", monospace',
  bungee: '"Bungee", "Fredoka", sans-serif',
  deco: '"Poiret One", "Fredoka", sans-serif',
  chalk: '"Fredericka the Great", Georgia, serif',
  roman: '700 {s}px "Cinzel", Georgia, serif',
  shrik: '"Shrikhand", "Fredoka", sans-serif',
  lime: '"Limelight", Georgia, serif'
};

export const SPECS = {
  'cel-anime-80s': { label: 'Dessin animé des années 80', paper: '#f9e9c8', sat: 1.25, ink: '#5a2e2e', inkFromColor: true, outline: 2.2, fill: 'cel', post: ['grain', 'vignette'], font: F.round, text: '#5a2e2e', box: 'band', boxBg: 'rgba(30,14,40,0.78)', boxInk: '#fff0a0', fps: 12 },
  'lowpoly-island': { label: 'Île en facettes', paper: '#9fd3e8', paper2: '#f3dfab', palette: ['#f3dfab', '#e2c68e', '#93c96c', '#7fbd62', '#c99c6e', '#b4b8bd', '#8f949c', '#4a9ad1', '#e86a5a', '#ffffff', '#2e3a4a', '#f2b441', '#b98ad4'], ink: '#2e3a4a', outline: 0, fill: 'facet', font: F.round, text: '#2e3a4a', box: 'card', fps: 24 },
  microgame: { label: 'Mini-jeu vidéo', paper: '#2a0f5c', paper2: '#1a1030', palette: ['#1a1030', '#3d168f', '#ff2e88', '#ffc928', '#e08a00', '#1fd1d1', '#ffffff', '#7cf06a', '#ff7a3c'], ink: '#1a1030', outline: 3, fill: 'flat', shadow: [0, 6, '#1a1030'], font: F.bungee, text: '#ffc928', box: 'band', boxBg: '#1a1030', boxInk: '#ffc928', fps: 12 },
  'pixel-rpg': { label: 'Aventure en pixels', paper: '#3e8948', paper2: '#265c42', palette: ['#be4a2f', '#d77643', '#ead4aa', '#e4a672', '#b86f50', '#733e39', '#3e2731', '#63c74d', '#3e8948', '#0099db', '#f7e26b', '#ffffff', '#b55088'], ink: '#3e2731', outline: 1.8, fill: 'cel', pixel: 4, font: F.pixel, fontScale: 0.5, text: '#ead4aa', box: 'band', boxBg: '#3e2731', boxInk: '#ead4aa', fps: 12 },
  'transit-map': { label: 'Plan de métro', paper: '#F4F0E8', bg: 'grid', bgInk: 'rgba(29,36,51,0.05)', palette: ['#e3342f', '#f6993f', '#ffcd3c', '#38c172', '#3490dc', '#9561e2', '#1D2433', '#F4F0E8', '#5A6170', '#f07ab0'], ink: '#1D2433', outline: 3, fill: 'flat', font: F.round, text: '#1D2433', box: 'card', fps: 24 },
  'isometric-picture-book': { label: 'Livre d’images en relief', paper: '#f6efe0', sat: 1.1, ink: '#3e3355', outline: 1.8, fill: 'gradient', shadow: [10, 8, 'rgba(62,51,85,0.18)'], font: F.round, text: '#3e3355', box: 'card', fps: 12 },
  'memphis-diorama': { label: 'Diorama Memphis', paper: '#FFFCF6', bg: 'memphis', palette: ['#25214A', '#FFD36E', '#9DE8A6', '#6FD889', '#D6E68E', '#A6E3FB', '#ff7aa8', '#FFFCF6', '#ff8a4a', '#a8aab8'], ink: '#25214A', outline: 2.4, fill: 'flat', shadow: [6, 6, '#25214A'], font: F.bungee, text: '#25214A', box: 'card', fps: 12 },
} satisfies Record<string, StyleSpec>;

export type SpecStyle = keyof typeof SPECS;
export type StyleId = FilmStyle | SpecStyle;

/**
 * Les 10 styles gardés, dans un ordre qui alterne les univers (papier, Memphis, aquarelle, pixel…) pour qu'une suite
 * de contenus (les 50 vidéos du jour, les comptines…) change d'univers à chaque fois.
 */
export const STYLE_IDS: StyleId[] = [
  'paper-popup', 'memphis-diorama', 'watercolor', 'pixel-rpg', 'brick-toy', 'cel-anime-80s', 'transit-map', 'lowpoly-island', 'isometric-picture-book', 'microgame'
];

export const isSpecStyle = (id: string): id is SpecStyle => id in SPECS;
export const isStyle = (id: string): id is StyleId => isSpecStyle(id) || id in MATERIALS;

export function styleLabel(id: StyleId): string {
  return isSpecStyle(id) ? SPECS[id].label : STYLE_LABEL[id as FilmStyle];
}

/** Hachage d'une chaîne (FNV-1a) : le même contenu garde le même style. */
export function strHash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Style d'un contenu dans une suite : le n-ième de la liste (décalé par rubrique pour ne pas tout aligner). */
export const styleAt = (i: number, offset = 0): StyleId => STYLE_IDS[(((i + offset) % STYLE_IDS.length) + STYLE_IDS.length) % STYLE_IDS.length];
export const styleForKey = (key: string): StyleId => STYLE_IDS[strHash(key) % STYLE_IDS.length];

/** Fabrique la matière d'un style (faite main ou générique). */
export function materialFor(id: StyleId): Material {
  return isSpecStyle(id) ? specMaterial(id, SPECS[id]) : MATERIALS[id as FilmStyle]();
}

/* ═══════════════ Couleurs ═══════════════ */

type RGB = [number, number, number];

export function hexRgb(c: string): RGB | null {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(c.trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.replace(/./g, (x) => x + x);
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const rgbHex = ([r, g, b]: RGB) => '#' + [r, g, b].map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');
const lum = ([r, g, b]: RGB) => (0.299 * r + 0.587 * g + 0.114 * b) / 255;
const mixRgb = (a: RGB, b: RGB, k: number): RGB => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

function adjust([r, g, b]: RGB, sat: number, light: number): RGB {
  const l = (r + g + b) / 3;
  return [l + (r - l) * sat + light * 255, l + (g - l) * sat + light * 255, l + (b - l) * sat + light * 255];
}

export function colorMapper(spec: StyleSpec) {
  const cache = new Map<string, string>();
  const ramp = spec.ramp?.map((c) => hexRgb(c)!);
  const pal = spec.palette?.map((c) => hexRgb(c)!);
  const paper = hexRgb(spec.paper)!;
  return (c: string, back = false): string => {
    const key = back ? `b${c}` : c;
    const hit = cache.get(key);
    if (hit) return hit;
    let rgb = hexRgb(c);
    if (!rgb) return c;
    if (spec.sat !== undefined || spec.light !== undefined) rgb = adjust(rgb, spec.sat ?? 1, spec.light ?? 0);
    if (ramp) {
      const x = clamp(lum(rgb)) * (ramp.length - 1);
      const i = Math.min(ramp.length - 2, Math.floor(x));
      rgb = mixRgb(ramp[i], ramp[i + 1], x - i);
    } else if (pal) {
      let best = pal[0],
        bd = Infinity;
      for (const p of pal) {
        const d = 2 * (p[0] - rgb[0]) ** 2 + 4 * (p[1] - rgb[1]) ** 2 + 3 * (p[2] - rgb[2]) ** 2;
        if (d < bd) {
          bd = d;
          best = p;
        }
      }
      rgb = best;
    }
    if (back && spec.backFade) rgb = mixRgb(rgb, paper, spec.backFade);
    const out = rgbHex(rgb);
    cache.set(key, out);
    return out;
  };
}

const mixHex = (a: string, b: string, k: number) => {
  const A = hexRgb(a),
    B = hexRgb(b);
  return A && B ? rgbHex(mixRgb(A, B, k)) : a;
};

/* ═══════════════ Matière générique ═══════════════ */

function tile(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  const c = document.createElement('canvas');
  c.width = Math.ceil(w * RES);
  c.height = Math.ceil(h * RES);
  const g = c.getContext('2d')!;
  g.scale(RES, RES);
  draw(g);
  return c;
}

function shapeBox(pts: Pt[]) {
  let x0 = Infinity,
    y0 = Infinity,
    x1 = -Infinity,
    y1 = -Infinity;
  for (const [x, y] of pts) {
    if (x < x0) x0 = x;
    if (y < y0) y0 = y;
    if (x > x1) x1 = x;
    if (y > y1) y1 = y;
  }
  return { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0 };
}

function fontOf(spec: StyleSpec, px: number) {
  const s = Math.round(px * (spec.fontScale ?? 1));
  return spec.font.includes('{s}') ? spec.font.replace('{s}', String(s)) : `${s}px ${spec.font}`;
}

function paintBackground(g: CanvasRenderingContext2D, spec: StyleSpec, id: string) {
  if (spec.paper2) {
    const grd = g.createLinearGradient(0, 0, 0, H);
    grd.addColorStop(0, spec.paper);
    grd.addColorStop(1, spec.paper2);
    g.fillStyle = grd;
  } else g.fillStyle = spec.paper;
  g.fillRect(0, 0, W, H);
  const ink = spec.bgInk ?? 'rgba(0,0,0,0.06)';
  const seed = strHash(id);
  g.save();
  g.strokeStyle = ink;
  g.fillStyle = ink;
  switch (spec.bg) {
    case 'grid':
      g.lineWidth = 1;
      for (let x = 0; x <= W; x += 40) g.strokeRect(x, -1, 0, H + 2);
      for (let y = 0; y <= H; y += 40) g.strokeRect(-1, y, W + 2, 0);
      break;
    case 'lines':
      g.lineWidth = 1.2;
      for (let y = 30; y < H; y += 26) {
        g.beginPath();
        g.moveTo(0, y);
        g.lineTo(W, y);
        g.stroke();
      }
      break;
    case 'dots':
      for (let y = 10; y < H; y += 20) for (let x = (y / 20) % 2 ? 20 : 10; x < W; x += 20) g.fillRect(x - 1.5, y - 1.5, 3, 3);
      break;
    case 'waves':
      g.lineWidth = 2;
      for (let y = 20; y < H + 30; y += 34)
        for (let x = (y / 34) % 2 ? -20 : 0; x < W + 40; x += 40) {
          for (let r = 18; r > 4; r -= 6) {
            g.beginPath();
            g.arc(x, y, r, Math.PI, 0);
            g.stroke();
          }
        }
      break;
    case 'stars':
      for (let i = 0; i < 140; i++) {
        const r = 0.6 + hash(seed, i, 3) * 1.8;
        g.globalAlpha = 0.3 + hash(seed, i, 4) * 0.7;
        g.beginPath();
        g.arc(hash(seed, i, 1) * W, hash(seed, i, 2) * H * 0.85, r, 0, Math.PI * 2);
        g.fill();
      }
      break;
    case 'rays':
      for (let i = 0; i < 24; i += 2) {
        const a0 = (i / 24) * Math.PI * 2,
          a1 = ((i + 1) / 24) * Math.PI * 2;
        g.beginPath();
        g.moveTo(W / 2, H * 0.55);
        g.lineTo(W / 2 + Math.cos(a0) * 1400, H * 0.55 + Math.sin(a0) * 1400);
        g.lineTo(W / 2 + Math.cos(a1) * 1400, H * 0.55 + Math.sin(a1) * 1400);
        g.closePath();
        g.fill();
      }
      break;
    case 'cloth':
      g.lineWidth = 0.8;
      for (let x = 0; x < W; x += 5) g.strokeRect(x, 0, 0, H);
      for (let y = 0; y < H; y += 5) g.strokeRect(0, y, W, 0);
      break;
    case 'felt':
      g.lineWidth = 0.9;
      for (let i = 0; i < 2600; i++) {
        const x = hash(seed, i, 1) * W,
          y = hash(seed, i, 2) * H,
          a = hash(seed, i, 3) * Math.PI;
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x + Math.cos(a) * 6, y + Math.sin(a) * 6);
        g.stroke();
      }
      break;
    case 'staff':
      g.lineWidth = 1.2;
      for (let y0 = 40; y0 < H; y0 += 110)
        for (let k = 0; k < 5; k++) {
          g.beginPath();
          g.moveTo(0, y0 + k * 10);
          g.lineTo(W, y0 + k * 10);
          g.stroke();
        }
      break;
    case 'lead': {
      // Vitrail : panneaux teintés et plombs épais.
      const cols = ['#1d3a9c', '#2f6fb0', '#a8101c', '#dc9a22', '#2f7f36', '#632a63', '#3f9ad1'];
      for (let y = 0; y < H; y += 90)
        for (let x = (y / 90) % 2 ? -60 : 0; x < W; x += 120) {
          g.fillStyle = cols[Math.floor(hash(seed, x, y) * cols.length)];
          g.globalAlpha = 0.55;
          g.fillRect(x, y, 120, 90);
          g.globalAlpha = 1;
          g.strokeStyle = ink;
          g.lineWidth = 6;
          g.strokeRect(x, y, 120, 90);
        }
      break;
    }
    case 'circuit': {
      // Pistes de circuit imprimé : segments à angle droit et pastilles.
      g.lineWidth = 3;
      for (let i = 0; i < 26; i++) {
        let x = hash(seed, i, 1) * W,
          y = hash(seed, i, 2) * H;
        g.beginPath();
        g.moveTo(x, y);
        for (let k = 0; k < 4; k++) {
          if ((i + k) % 2) x += (hash(seed, i, k, 3) - 0.5) * 260;
          else y += (hash(seed, i, k, 4) - 0.5) * 200;
          g.lineTo(x, y);
        }
        g.stroke();
        g.beginPath();
        g.arc(x, y, 6, 0, Math.PI * 2);
        g.fill();
      }
      break;
    }
    case 'window': {
      // Fenêtres d'application : barre de titre, trois pastilles, cadre.
      for (const [x, y, w, h] of [[40, 30, 420, 260], [520, 60, 400, 200], [300, 300, 360, 220]]) {
        g.fillStyle = 'rgba(255,255,255,0.55)';
        g.fillRect(x, y, w, h);
        g.fillStyle = 'rgba(0,0,0,0.07)';
        g.fillRect(x, y, w, 22);
        ['#ff5f57', '#febc2e', '#28c840'].forEach((c, k) => {
          g.fillStyle = c;
          g.beginPath();
          g.arc(x + 14 + k * 16, y + 11, 4.5, 0, Math.PI * 2);
          g.fill();
        });
        g.strokeStyle = 'rgba(0,0,0,0.12)';
        g.lineWidth = 1.5;
        g.strokeRect(x, y, w, h);
      }
      break;
    }
    case 'memphis': {
      // Confettis Memphis : triangles, zigzags, ronds, en couleurs franches.
      const cols = ['#FFD36E', '#9DE8A6', '#A6E3FB', '#ff7aa8', '#25214A'];
      for (let i = 0; i < 40; i++) {
        const x = hash(seed, i, 1) * W,
          y = hash(seed, i, 2) * H * 0.75,
          k = Math.floor(hash(seed, i, 3) * 3);
        g.fillStyle = g.strokeStyle = cols[i % cols.length];
        g.globalAlpha = 0.55;
        g.lineWidth = 3;
        if (k === 0) {
          g.beginPath();
          g.moveTo(x, y - 8);
          g.lineTo(x + 9, y + 7);
          g.lineTo(x - 9, y + 7);
          g.closePath();
          g.fill();
        } else if (k === 1) {
          g.beginPath();
          for (let z = 0; z < 5; z++) g.lineTo(x + z * 7, y + (z % 2 ? -6 : 6));
          g.stroke();
        } else {
          g.beginPath();
          g.arc(x, y, 5, 0, Math.PI * 2);
          g.fill();
        }
      }
      g.globalAlpha = 1;
      break;
    }
    case 'lightbox': {
      const grd = g.createRadialGradient(W / 2, H * 0.45, 40, W / 2, H * 0.45, 620);
      grd.addColorStop(0, 'rgba(255,250,225,0.85)');
      grd.addColorStop(1, 'rgba(255,250,225,0)');
      g.fillStyle = grd;
      g.fillRect(0, 0, W, H);
      break;
    }
    case 'diag':
      g.beginPath();
      g.moveTo(-50, H * 0.9);
      g.lineTo(W * 0.7, -50);
      g.lineTo(W * 0.85, -50);
      g.lineTo(80, H + 50);
      g.closePath();
      g.globalAlpha = 0.35;
      g.fill();
      g.globalAlpha = 0.18;
      g.fillStyle = '#17130f';
      g.beginPath();
      g.arc(W * 0.82, H * 0.3, 120, 0, Math.PI * 2);
      g.fill();
      break;
  }
  g.restore();
  if (spec.post?.includes('fibers')) {
    g.save();
    g.lineWidth = 0.6;
    for (let i = 0; i < 900; i++) {
      const x = hash(seed, i, 7) * W,
        y = hash(seed, i, 8) * H,
        a = hash(seed, i, 9) * Math.PI * 2,
        l = 3 + hash(seed, i, 10) * 10;
      g.strokeStyle = hash(seed, i, 11) > 0.5 ? 'rgba(90,70,40,0.10)' : 'rgba(255,255,255,0.18)';
      g.beginPath();
      g.moveTo(x, y);
      g.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + 2, y + Math.sin(a) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l);
      g.stroke();
    }
    g.restore();
  }
}

export function specMaterial(id: SpecStyle, spec: StyleSpec): Material {
  const buf = canvas(),
    bg = canvas();
  const B = ctx2d(buf);
  paintBackground(ctx2d(bg), spec, id);
  const map = colorMapper(spec);
  const seed0 = strHash(id);
  const post = new Set(spec.post ?? []);
  const patterns = new Map<string, CanvasPattern>();
  let t = 0,
    boil = 0,
    still = false;
  const glow = spec.fill === 'glow';

  // Tuiles de motif (hachures, trames, poussière, fibres), une par couleur.
  const pattern = (kind: 'hatch' | 'dots' | 'stipple' | 'felt', col: string) => {
    const key = kind + col;
    let p = patterns.get(key);
    if (p) return p;
    const dark = shade(col, kind === 'hatch' ? -0.35 : -0.28);
    const c =
      kind === 'hatch'
        ? tile(6, 6, (g) => {
            g.strokeStyle = spec.ramp ? spec.ink : dark;
            g.lineWidth = 1.3;
            g.beginPath();
            g.moveTo(-1, 7);
            g.lineTo(7, -1);
            g.moveTo(-1, 1);
            g.lineTo(1, -1);
            g.moveTo(5, 7);
            g.lineTo(7, 5);
            g.stroke();
          })
        : kind === 'dots'
          ? tile(8, 8, (g) => {
              g.fillStyle = dark;
              for (const [x, y] of [
                [2, 2],
                [6, 6]
              ]) {
                g.beginPath();
                g.arc(x, y, 1.5, 0, Math.PI * 2);
                g.fill();
              }
            })
          : tile(24, 24, (g) => {
              for (let i = 0; i < (kind === 'felt' ? 26 : 34); i++) {
                const x = hash(i, 1, col.length) * 24,
                  y = hash(i, 2, col.charCodeAt(2)) * 24;
                if (kind === 'felt') {
                  g.strokeStyle = i % 2 ? shade(col, 0.18) : shade(col, -0.16);
                  g.lineWidth = 0.7;
                  const a = hash(i, 3) * Math.PI;
                  g.beginPath();
                  g.moveTo(x, y);
                  g.lineTo(x + Math.cos(a) * 4, y + Math.sin(a) * 4);
                  g.stroke();
                } else {
                  g.fillStyle = i % 3 ? dark : shade(col, 0.2);
                  g.fillRect(x, y, 1.3, 1.3);
                }
              }
            });
    p = B.createPattern(c, 'repeat')!;
    p.setTransform?.(new DOMMatrix([1 / RES, 0, 0, 1 / RES, 0, 0]));
    patterns.set(key, p);
    return p;
  };

  // Grain, vignettage et projecteur : précalculés une fois.
  const grain = post.has('grain') || post.has('flicker') ? tile(128, 128, (g) => {
    for (let i = 0; i < 900; i++) {
      g.fillStyle = hash(seed0, i, 5) > 0.5 ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)';
      g.fillRect(hash(seed0, i, 1) * 128, hash(seed0, i, 2) * 128, 0.8, 0.8);
    }
  }) : null;
  const grainP = grain ? B.createPattern(grain, 'repeat') : null;
  const vig = post.has('vignette') || post.has('gate') ? (() => {
    const c = document.createElement('canvas');
    c.width = 480;
    c.height = 270;
    const g = c.getContext('2d')!;
    const grd = g.createRadialGradient(240, 135, 90, 240, 135, 290);
    grd.addColorStop(0, 'rgba(0,0,0,0)');
    grd.addColorStop(1, 'rgba(0,0,0,0.5)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 480, 270);
    return c;
  })() : null;
  const spot = post.has('spot') ? (() => {
    const c = document.createElement('canvas');
    c.width = 960;
    c.height = 540;
    const g = c.getContext('2d')!;
    g.fillStyle = 'rgba(6,4,14,0.72)';
    g.fillRect(0, 0, 960, 540);
    g.globalCompositeOperation = 'destination-out';
    const grd = g.createRadialGradient(480, 270, 30, 480, 270, 150);
    grd.addColorStop(0, 'rgba(0,0,0,1)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 960, 540);
    return c;
  })() : null;
  const small = spec.pixel || post.has('tilt') ? document.createElement('canvas') : null;
  if (small) {
    const px = spec.pixel ?? 6;
    small.width = Math.ceil(W / px);
    small.height = Math.ceil(H / px);
  }
  let jx = 0,
    jy = 0;

  const wob = (pts: Pt[], s: number, k: number) => (k ? pts.map(([x, y], i) => [x + (hash(s, i, boil) - 0.5) * 2 * k, y + (hash(s + 5, i, boil) - 0.5) * 2 * k] as Pt) : pts);

  const fillBody = (pts: Pt[], col: string, s: number, role: string, back: boolean) => {
    const g = B;
    const bx = shapeBox(pts);
    switch (spec.fill) {
      case 'shade': {
        pathPts(g, pts, true);
        const grd = g.createRadialGradient(bx.x0 + bx.w * 0.32, bx.y0 + bx.h * 0.28, 1, bx.x0 + bx.w * 0.5, bx.y0 + bx.h * 0.5, Math.max(bx.w, bx.h) * 0.75 + 1);
        grd.addColorStop(0, shade(col, 0.22));
        grd.addColorStop(0.55, col);
        grd.addColorStop(1, shade(col, -0.22));
        g.fillStyle = role === 'sky' ? col : grd;
        g.fill();
        break;
      }
      case 'gradient': {
        pathPts(g, pts, true);
        const grd = g.createLinearGradient(0, bx.y0, 0, bx.y1 + 1);
        grd.addColorStop(0, shade(col, 0.2));
        grd.addColorStop(1, shade(col, -0.18));
        g.fillStyle = grd;
        g.fill();
        break;
      }
      case 'cel': {
        pathPts(g, pts, true);
        g.fillStyle = col;
        g.fill();
        if (role === 'sky') break;
        g.save();
        pathPts(g, pts, true);
        g.clip();
        g.fillStyle = shade(col, -0.2);
        g.fillRect(bx.x0 - 2, bx.y0 - 2, bx.w + 4, bx.h + 4);
        g.translate(-bx.w * 0.12, -bx.h * 0.14);
        pathPts(g, pts, true);
        g.fillStyle = col;
        g.fill();
        g.restore();
        break;
      }
      case 'hatch':
      case 'dots':
      case 'stipple':
      case 'felt': {
        pathPts(g, pts, true);
        g.fillStyle = spec.fill === 'hatch' && !spec.ramp ? mixHex(col, spec.paper, 0.35) : col;
        g.fill();
        if (role === 'sky' && spec.fill !== 'felt') break;
        // Trame sur les tons moyens et sombres seulement : les blancs restent blancs.
        if (spec.fill !== 'felt' && lum(hexRgb(col) ?? [255, 255, 255]) > 0.86) break;
        g.fillStyle = pattern(spec.fill === 'hatch' ? 'hatch' : spec.fill === 'dots' ? 'dots' : spec.fill === 'felt' ? 'felt' : 'stipple', col);
        g.globalAlpha = spec.fill === 'dots' ? 0.55 : back ? 0.5 : 0.8;
        g.fill();
        g.globalAlpha = 1;
        break;
      }
      case 'glow': {
        pathPts(g, pts, true);
        if (role === 'sky') {
          g.fillStyle = mixHex(col, spec.paper, 0.8);
          g.fill();
          break;
        }
        g.fillStyle = col;
        g.globalAlpha = back ? 0.06 : 0.16;
        g.fill();
        g.globalAlpha = back ? 0.5 : 1;
        g.shadowColor = col;
        g.shadowBlur = back ? 6 : 14;
        g.strokeStyle = col;
        g.lineWidth = back ? 1.6 : 3;
        g.stroke();
        g.shadowBlur = 0;
        g.strokeStyle = mixHex(col, '#ffffff', 0.6);
        g.lineWidth = back ? 0.6 : 1.1;
        g.stroke();
        g.globalAlpha = 1;
        break;
      }
      case 'line': {
        pathPts(g, pts, true);
        g.fillStyle = col;
        g.globalAlpha = role === 'sky' ? 0.5 : 0.35;
        g.fill();
        g.globalAlpha = 1;
        break;
      }
      case 'facet': {
        pathPts(g, pts, true);
        g.fillStyle = col;
        g.fill();
        if (pts.length < 4) break;
        const cx = bx.x0 + bx.w * 0.42,
          cy = bx.y0 + bx.h * 0.4;
        const step = Math.max(2, Math.round(pts.length / 7));
        for (let i = 0; i < pts.length; i += step) {
          const a = pts[i],
            b = pts[(i + step) % pts.length];
          const k = hash(s, i) - 0.5;
          g.fillStyle = k > 0 ? `rgba(255,255,255,${0.08 + k * 0.3})` : `rgba(0,0,0,${0.04 - k * 0.25})`;
          g.beginPath();
          g.moveTo(cx, cy);
          g.lineTo(a[0], a[1]);
          g.lineTo(b[0], b[1]);
          g.closePath();
          g.fill();
        }
        // Arête de la pièce pliée : une forme claire reste lisible sur un fond clair.
        if (!spec.outline && role !== 'sky') {
          pathPts(g, pts, true);
          g.strokeStyle = shade(col, -0.28);
          g.lineWidth = back ? 0.8 : 1.4;
          g.stroke();
        }
        break;
      }
      case 'points': {
        // Nuage de points (scan LiDAR) : la forme n'existe que par ses points lumineux.
        g.save();
        pathPts(g, pts, true);
        g.clip();
        g.fillStyle = col;
        const stepP = role === 'sky' ? 14 : back ? 8 : 6;
        const off = (boil * 2) % stepP;
        for (let y = Math.floor(bx.y0 / stepP) * stepP + off; y <= bx.y1; y += stepP)
          for (let x = Math.floor(bx.x0 / stepP) * stepP + ((y / stepP) % 2) * (stepP / 2); x <= bx.x1; x += stepP) {
            const r = (role === 'sky' ? 1.3 : 2.4) * (0.6 + hash(s, x, y) * 0.6);
            g.globalAlpha = role === 'sky' ? 0.45 : back ? 0.75 : 1;
            g.fillRect(x - r / 2, y - r / 2, r, r);
          }
        g.restore();
        break;
      }
      case 'glass': {
        // Verre : teinte transparente, reflet blanc en haut à gauche, liseré clair.
        pathPts(g, pts, true);
        g.globalAlpha = role === 'sky' ? 0.5 : 0.42;
        g.fillStyle = col;
        g.fill();
        g.globalAlpha = 1;
        if (role !== 'sky') {
          const grd = g.createLinearGradient(bx.x0, bx.y0, bx.x0 + bx.w * 0.6, bx.y0 + bx.h * 0.6);
          grd.addColorStop(0, 'rgba(255,255,255,0.75)');
          grd.addColorStop(0.35, 'rgba(255,255,255,0.08)');
          grd.addColorStop(1, 'rgba(255,255,255,0)');
          g.fillStyle = grd;
          g.fill();
          g.strokeStyle = shade(col, -0.15);
          g.lineWidth = back ? 0.8 : 1.6;
          g.stroke();
        }
        break;
      }
      case 'wash': {
        g.fillStyle = col;
        for (let pass = 0; pass < 2; pass++) {
          g.globalAlpha = role === 'sky' ? 0.5 : 0.62;
          pathPts(g, wob(pts, s + pass * 31, 2.2), true);
          g.fill();
        }
        g.globalAlpha = 1;
        break;
      }
      case 'brush': {
        pathPts(g, pts, true);
        g.fillStyle = col;
        g.fill();
        if (role === 'sky' && bx.w * bx.h > 300000) break;
        g.save();
        pathPts(g, pts, true);
        g.clip();
        g.lineCap = 'round';
        const n = clamp(Math.round((bx.w * bx.h) / 900), 4, 26);
        for (let i = 0; i < n; i++) {
          const x = bx.x0 + hash(s, i, boil, 1) * bx.w,
            y = bx.y0 + hash(s, i, boil, 2) * bx.h,
            a = -0.6 + hash(s, i, 3) * 0.5;
          g.strokeStyle = hash(s, i, 4) > 0.5 ? shade(col, 0.2) : shade(col, -0.16);
          g.lineWidth = 5 + hash(s, i, 5) * 6;
          g.globalAlpha = 0.7;
          g.beginPath();
          g.moveTo(x, y);
          g.lineTo(x + Math.cos(a) * 22, y + Math.sin(a) * 22);
          g.stroke();
        }
        g.restore();
        break;
      }
      case 'riso': {
        const m = spec.misreg ?? 3;
        g.save();
        g.globalCompositeOperation = 'multiply';
        g.globalAlpha = 0.5;
        pathPts(g, pts.map(([x, y]) => [x + m, y + m * 0.6] as Pt), true);
        g.fillStyle = col;
        g.fill();
        g.globalAlpha = 0.88;
        pathPts(g, pts, true);
        g.fill();
        if (role !== 'sky' && lum(hexRgb(col) ?? [255, 255, 255]) < 0.86) {
          g.fillStyle = pattern('dots', col);
          g.globalAlpha = 0.35;
          g.fill();
        }
        g.restore();
        break;
      }
      default: {
        if (spec.misreg && role !== 'sky') {
          g.save();
          g.globalAlpha = 0.45;
          pathPts(g, pts.map(([x, y]) => [x + spec.misreg!, y - spec.misreg! * 0.5] as Pt), true);
          g.fillStyle = shade(col, -0.25);
          g.fill();
          g.restore();
        }
        pathPts(g, pts, true);
        g.fillStyle = col;
        g.fill();
      }
    }
  };

  const textBox = (lines: string[], size: number, yBottom: number) => {
    const lh = size * 1.18;
    const widths = lines.map((l) => B.measureText(l).width);
    const wMax = Math.max(...widths);
    const top = yBottom - lines.length * lh;
    if (spec.box === 'band' || spec.box === 'card') {
      B.save();
      B.fillStyle = spec.box === 'band' ? (spec.boxBg ?? 'rgba(0,0,0,0.7)') : spec.paper2 && lum(hexRgb(spec.paper) ?? [255, 255, 255]) < 0.4 ? '#f4efe4' : spec.paper;
      const pad = 16,
        x0 = 480 - wMax / 2 - pad,
        w = wMax + pad * 2;
      B.beginPath();
      B.roundRect(x0, top - 6, w, lines.length * lh + 14, spec.pixel ? 0 : 14);
      B.fill();
      if (spec.box === 'card') {
        B.strokeStyle = spec.ink;
        B.lineWidth = 2.5;
        B.stroke();
      } else if (spec.boxInk) {
        B.strokeStyle = spec.boxInk;
        B.lineWidth = 1.5;
        B.stroke();
      }
      B.restore();
    }
    lines.forEach((l, i) => {
      const y = top + lh * (i + 0.5) + 2;
      if (spec.box === 'halo') {
        B.lineJoin = 'round';
        B.lineWidth = 8;
        B.strokeStyle = spec.paper;
        B.strokeText(l, 480, y);
      }
      B.fillStyle = spec.box === 'band' ? (spec.boxInk ?? '#fff') : spec.box === 'card' && lum(hexRgb(spec.paper) ?? [255, 255, 255]) < 0.4 ? '#1a1612' : spec.text;
      if (glow) {
        B.shadowColor = spec.text;
        B.shadowBlur = 10;
      }
      B.fillText(l, 480, y);
      B.shadowBlur = 0;
    });
  };

  return {
    id,
    label: spec.label,
    fps: spec.fps,
    begin(f) {
      t = f.t;
      still = !!f.still;
      boil = spec.fps ? Math.floor(f.t * spec.fps) % 3 : 0;
      B.save();
      B.setTransform(1, 0, 0, 1, 0, 0);
      B.globalCompositeOperation = 'source-over';
      B.globalAlpha = 1;
      B.drawImage(bg, 0, 0);
      B.restore();
    },
    draw(fig: Figure, o = {}) {
      const front = fig.layer === 'front';
      const back = !front;
      B.save();
      if ((o.reveal ?? 1) < 1) revealClip(B, fig, o.reveal ?? 1);
      if (o.alpha !== undefined) B.globalAlpha = o.alpha;
      const k = spec.wobble ?? 0;
      if (spec.shadow && front) {
        const [dx, dy, sc] = spec.shadow;
        B.fillStyle = sc;
        for (const s of fig.shapes)
          if (s.closed && s.role !== 'sky' && s.role !== 'dot') {
            pathPts(B, s.pts.map(([x, y]) => [x + dx, y + dy] as Pt), true);
            B.fill();
          }
      }
      fig.shapes.forEach((s, i) => {
        const sd = fig.seed * 11 + i;
        const pts = front ? wob(s.pts, sd, k) : wob(s.pts, sd, k * 0.4);
        const col = map(s.color, back);
        if (s.role === 'line') {
          pathPts(B, pts, false);
          B.strokeStyle = spec.fill === 'line' ? spec.ink : col;
          B.lineWidth = s.width ?? 3;
          B.lineCap = 'round';
          B.lineJoin = 'round';
          if (glow) {
            B.shadowColor = col;
            B.shadowBlur = 10;
          }
          B.stroke();
          B.shadowBlur = 0;
          return;
        }
        if (s.role === 'dot') {
          pathPts(B, pts, true);
          B.fillStyle = glow ? col : spec.fill === 'line' ? spec.ink : spec.ramp ? spec.ink : col === map('#3E3355') ? spec.ink : col;
          B.fill();
          return;
        }
        fillBody(pts, col, sd, s.role, back);
        if (s.role !== 'sky' && spec.outline > 0 && !glow) {
          const w = spec.outline * (s.role === 'body' ? 1 : 0.6) * (back ? 0.6 : 1);
          pathPts(B, pts, true);
          B.strokeStyle = spec.inkFromColor ? shade(col, -0.45) : spec.ink;
          B.lineWidth = w;
          B.lineJoin = 'round';
          if (spec.dash) B.setLineDash(spec.dash);
          B.globalAlpha = (o.alpha ?? 1) * (back && spec.fill !== 'line' ? 0.7 : 1);
          B.stroke();
          B.setLineDash([]);
          B.globalAlpha = o.alpha ?? 1;
        }
      });
      B.restore();
    },
    end() {
      B.save();
      B.setTransform(1, 0, 0, 1, 0, 0);
      const bw = buf.width,
        bh = buf.height;
      if (spec.pixel && small) {
        const s = small.getContext('2d')!;
        s.imageSmoothingEnabled = true;
        s.drawImage(buf, 0, 0, small.width, small.height);
        B.imageSmoothingEnabled = false;
        B.drawImage(small, 0, 0, bw, bh);
        B.imageSmoothingEnabled = true;
      }
      if (post.has('tilt') && small) {
        // Flou haut et bas (maquette miniature) : réduction puis agrandissement, lisse partout.
        const s = small.getContext('2d')!;
        s.imageSmoothingEnabled = true;
        s.drawImage(buf, 0, 0, small.width, small.height);
        for (const [y0, y1, a] of [
          [0, 0.12, 1],
          [0.12, 0.22, 0.6],
          [0.8, 0.88, 0.6],
          [0.88, 1, 1]
        ] as const) {
          B.globalAlpha = a;
          B.drawImage(small, 0, y0 * small.height, small.width, (y1 - y0) * small.height, 0, y0 * bh, bw, (y1 - y0) * bh);
        }
        B.globalAlpha = 1;
      }
      if (post.has('warm')) {
        B.globalCompositeOperation = 'multiply';
        B.fillStyle = '#ffe2bd';
        B.fillRect(0, 0, bw, bh);
        B.globalCompositeOperation = 'source-over';
      }
      if (spot) {
        const cx = 480 + Math.sin(t * 0.6) * 160,
          cy = 280 + Math.sin(t * 0.9) * 30;
        B.drawImage(spot, (cx - 480 - 480) * RES, (cy - 270 - 270) * RES, bw * 2, bh * 2);
      }
      if (post.has('scan')) {
        B.fillStyle = 'rgba(0,0,0,0.16)';
        for (let y = 0; y < bh; y += 3 * RES) B.fillRect(0, y, bw, RES);
      }
      if (post.has('strobe')) {
        B.fillStyle = 'rgba(36,21,9,0.28)';
        const off = (t * 90) % 140;
        for (let x = -140 + off; x < W; x += 140) B.fillRect(x * RES, 0, 18 * RES, bh);
      }
      if (post.has('scratch') && !still) {
        const seg = Math.floor(t * 1.4);
        for (let i = 0; i < Math.floor(hash(seg, 2) * 3); i++) {
          const x = (40 + hash(seg, i, 3) * (W - 80)) * RES;
          B.strokeStyle = 'rgba(255,255,255,0.3)';
          B.lineWidth = RES;
          B.beginPath();
          B.moveTo(x, 0);
          B.lineTo(x + hash(seg, i, 6) * 8, bh);
          B.stroke();
        }
      }
      if (grainP) {
        const f = Math.floor(t * 12);
        B.translate((hash(f, 1) * 128) | 0, (hash(f, 2) * 128) | 0);
        B.fillStyle = grainP;
        B.globalAlpha = 0.09;
        B.fillRect(-128, -128, bw + 256, bh + 256);
        B.setTransform(1, 0, 0, 1, 0, 0);
        B.globalAlpha = 1;
      }
      if (post.has('flicker') && !still) {
        B.fillStyle = `rgba(0,0,0,${hash(Math.floor(t * 18), 4) * 0.07})`;
        B.fillRect(0, 0, bw, bh);
      }
      if (vig) B.drawImage(vig, 0, 0, bw, bh);
      if (post.has('gate')) {
        B.strokeStyle = '#0b0806';
        B.lineWidth = 26 * RES;
        B.beginPath();
        B.roundRect(-10 * RES, -10 * RES, bw + 20 * RES, bh + 20 * RES, 60 * RES);
        B.stroke();
        jx = still ? 0 : (hash(Math.floor(t * 18), 7) - 0.5) * 3;
        jy = still ? 0 : (hash(Math.floor(t * 18), 8) - 0.5) * 3;
      }
      B.restore();
    },
    caption(text) {
      B.save();
      const size = 25;
      B.font = fontOf(spec, size);
      B.textAlign = 'center';
      B.textBaseline = 'middle';
      textBox(wrap(B, text, 760), size * (spec.fontScale ?? 1) + (spec.fontScale ? 8 : 0), 524);
      B.restore();
    },
    title(text, k) {
      if (k <= 0) return;
      B.save();
      B.globalAlpha = clamp(k * 1.5);
      const size = 46;
      B.font = fontOf(spec, size);
      B.textAlign = 'center';
      B.textBaseline = 'middle';
      textBox(wrap(B, text, 820), size * (spec.fontScale ?? 1) + (spec.fontScale ? 10 : 0), 120);
      B.restore();
    },
    badge(text) {
      B.save();
      B.font = fontOf(spec, 26);
      B.textAlign = 'right';
      B.textBaseline = 'middle';
      B.lineWidth = 6;
      B.lineJoin = 'round';
      B.strokeStyle = spec.box === 'band' ? (spec.boxBg ?? '#000') : spec.paper;
      B.strokeText(text, 930, 40);
      B.fillStyle = spec.box === 'band' ? (spec.boxInk ?? '#fff') : spec.text;
      B.fillText(text, 930, 40);
      B.restore();
    },
    present(ctx) {
      ctx.drawImage(buf, 0, 0, buf.width, buf.height, jx, jy, W, H);
    },
    dispose() {
      for (const c of [buf, bg, small, grain]) if (c) (c.width = 0), (c.height = 0);
      patterns.clear();
    }
  };
}

/** Couleurs représentatives d'un style (pastilles, peaux CSS). */
export function swatch(id: StyleId): { paper: string; paper2?: string; ink: string; text: string; accents: string[]; dark: boolean } {
  if (isSpecStyle(id)) {
    const s: StyleSpec = SPECS[id];
    const accents = (s.palette ?? s.ramp ?? [s.ink]).filter((c) => c.toLowerCase() !== s.paper.toLowerCase()).slice(0, 5);
    return { paper: s.paper, paper2: s.paper2, ink: s.ink, text: s.text, accents, dark: lum(hexRgb(s.paper) ?? [255, 255, 255]) < 0.4 };
  }
  const HAND: Record<FilmStyle, { paper: string; ink: string; accents: string[]; dark?: boolean }> = {
    crayon: { paper: '#f6f1e4', ink: '#2e2a6b', accents: ['#e4572e', '#f2b441', '#7fb0e6', '#6fbf6a'] },
    'rubber-hose': { paper: '#f4f1ea', ink: '#141210', accents: ['#141210', '#c9c2b6', '#e4572e', '#f2b441'] },
    'paper-popup': { paper: '#fff6e0', ink: '#4a2e1f', accents: ['#e2574c', '#f2b441', '#57b894', '#4a7bb7'] },
    'shadow-puppet': { paper: '#f4a24a', ink: '#26180f', accents: ['#26180f', '#ffd28a', '#b5591f', '#c9a14a'], dark: true },
    'brick-toy': { paper: '#f2f2ee', ink: '#1b2a34', accents: ['#c91a09', '#0055bf', '#f2cd37', '#237841'] },
    whiteboard: { paper: '#fbfaf6', ink: '#23262c', accents: ['#23262c', '#2a5cb3', '#d93a3a', '#2e8b57'] },
    watercolor: { paper: '#fbf7ee', ink: '#3b2a20', accents: ['#4f8fd6', '#7aa65a', '#e8892d', '#f1c232'] }
  };
  const h = HAND[id as FilmStyle];
  return { paper: h.paper, ink: h.ink, text: h.ink, accents: h.accents, dark: !!h.dark };
}

export { bbox };
