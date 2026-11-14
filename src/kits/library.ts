/**
 * Bibliothèque de formes des kits : les objets des comptines, les 8 décors, Nino, Nina et Mila.
 * Repris des dessins SVG d'origine (src/comptines/decor.ts, scripts/chansons/art.mjs), en polygones.
 * Repère de scène : 960 × 540 ; le sol est vers y = 420, les pieds des enfants vers y = 480.
 */
import type { Decor, Objet } from '../data/comptines';
import { arc, body, circle, cubic, dot, ellipse, line, move, part, quad, ribbon, rotate, rrect, sky, star, type Figure, type Pt, type Shape } from './geom';

export const K = {
  wall: '#FDF3E6',
  floor: '#EFD9BE',
  rug: '#F7C6D9',
  ink: '#3E3355',
  skin: '#FFE0C4',
  skinShade: '#F5C7A6',
  cap: '#E4572E',
  capDark: '#C4451F',
  hair: '#5B3A29',
  sweater: '#F2B441',
  sweaterDark: '#D99A2B',
  overall: '#4A7BB7',
  overallDark: '#3B6395',
  cat: '#FFF4E2',
  catPatch: '#F0A868',
  dress: '#F27DA8',
  dressDark: '#D9618C',
  legging: '#F6D7E4',
  girlHair: '#6B4A2F',
  bow: '#F2B441',
  pink: '#FFB3C7',
  red: '#E4572E',
  yellow: '#F2B441',
  sun: '#FFC93C',
  blue: '#4A7BB7',
  green: '#57B894',
  leaf: '#6FBF6A',
  sky: '#BFE3F7',
  white: '#FFFFFF',
  grass: '#A8D98A',
  brown: '#7A5236'
};

export const GROUND = 420;
export const FEET = 481;

const fig = (shapes: Shape[], seed: number, layer: Figure['layer'] = 'front'): Figure => ({ shapes, seed, layer });

/* ───────────── Objets (taille de base ≈ 64 px, centrés sur 0) ───────────── */

export function cloudShape(cx: number, cy: number, s: number, color = K.white): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i <= 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    const top = Math.sin(a) < 0;
    const bump = top ? 18 * Math.abs(Math.sin(a * 2.5)) : 2;
    pts.push([cx + Math.cos(a) * 62 * s, cy + (Math.sin(a) * 24 - (top ? bump : -bump)) * s]);
  }
  void color;
  return pts;
}

export function objet(name: Objet, t = 0, seed = 1): Figure {
  const S: Shape[] = [];
  switch (name) {
    case 'etoile':
      S.push(body(star(0, 0, 32, 14), K.sun), part(star(0, 0, 13, 6, 0.3), '#FFE89A'));
      break;
    case 'coeur':
      S.push(body([...cubic([0, 26], [-40, 0], [-34, -28], [-14, -28], 10), ...cubic([-14, -28], [-4, -28], [0, -18], [0, -14], 4).slice(1), ...cubic([0, -14], [0, -18], [4, -28], [14, -28], 4).slice(1), ...cubic([14, -28], [34, -28], [40, 0], [0, 26], 10).slice(1)], '#F2668B'), part(ellipse(-14, -14, 6, 4), '#FFD1DE'));
      break;
    case 'soleil':
      for (let i = 0; i < 8; i++) S.push(line(rotate([[0, -27], [0, -40]], (i * Math.PI) / 4 + t * 0.5), K.sun, 7));
      S.push(body(circle(0, 0, 22), K.sun), dot(circle(-7, -3, 2.6, 8), K.ink), dot(circle(7, -3, 2.6, 8), K.ink), line(arc(0, 4, 8, 0.3, Math.PI - 0.3, 6), K.ink, 2.4));
      break;
    case 'lune':
      // Croissant : le bord extérieur par la gauche, puis le bord intérieur (un cercle décalé) par la gauche aussi.
      S.push(body([...arc(10, 0, 32, -Math.PI * 0.42, -Math.PI * 1.58, 18), ...arc(26, 0, 26, Math.PI * 0.62, Math.PI * 1.38, 12)], '#FFE58A'), dot(circle(-10, -4, 2.6, 8), K.ink));
      break;
    case 'nuage':
      S.push(body(cloudShape(0, 0, 0.6), K.white));
      break;
    case 'goutte':
      S.push(body([...quad([0, -30], [22, 0], [18, 12], 8), ...arc(0, 12, 18, 0, Math.PI, 10).slice(1), ...quad([-18, 12], [-22, 0], [0, -30], 8).slice(1)], '#6BB8F2'), part(ellipse(-6, 6, 4, 7), '#D8EEFF'));
      break;
    case 'fleur':
      for (let i = 0; i < 6; i++) S.push(part(rotate(ellipse(0, -18, 10, 16), (i * Math.PI) / 3), '#F59BBE'));
      S.push(body(circle(0, 0, 12), K.sun));
      break;
    case 'pomme':
      S.push(body([...arc(-11, 4, 20, Math.PI * 0.4, Math.PI * 1.75, 14), ...arc(11, 4, 20, -Math.PI * 0.75, Math.PI * 0.6, 14)], K.red), line([[0, -16], [0, -30]], K.brown, 4), part(rotate(ellipse(10, -24, 10, 5), -0.35, 10, -24), K.leaf));
      break;
    case 'poisson':
      S.push(part([[24, 0], [44, -16], [44, 16]], '#F29A4A'), body(ellipse(0, 0, 30, 20), '#F7B451'), dot(circle(-14, -4, 4, 8), K.ink), line(quad([-2, -10], [6, 0], [-2, 10], 6), '#E48A3A', 3));
      break;
    case 'ballon':
      S.push(line([...quad([0, 22], [-8, 36], [0, 50], 6), ...quad([0, 50], [8, 62], [0, 74], 6).slice(1)], K.ink, 2), body(ellipse(0, -8, 24, 30), K.blue), part(ellipse(-9, -18, 6, 9), '#A9C9EE'));
      break;
    case 'balle':
      S.push(body(circle(0, 0, 26), K.red), part([...arc(0, 0, 26, -Math.PI * 0.35, Math.PI * 0.35, 8), ...arc(0, 0, 26, Math.PI * 0.35, -Math.PI * 0.35, 8).map(([x, y]) => [x * 0.2, y] as Pt)], K.yellow), part([...arc(0, 0, 26, Math.PI * 0.65, Math.PI * 1.35, 8), ...arc(0, 0, 26, Math.PI * 1.35, Math.PI * 0.65, 8).map(([x, y]) => [x * 0.2, y] as Pt)], K.blue));
      break;
    case 'canard':
      S.push(body(ellipse(0, 6, 30, 20), K.yellow), body(circle(18, -16, 15), K.yellow), part([[30, -18], [44, -14], [30, -10]], '#F08A3C'), dot(circle(22, -20, 3, 8), K.ink), part(ellipse(-6, 4, 14, 8, -0.3), '#E8A52E'));
      break;
    case 'cube':
      S.push(body(rrect(-26, -26, 52, 52, 8), [K.red, K.blue, K.green, K.yellow][seed % 4]), part(star(0, 0, 13, 6), K.white));
      break;
    case 'feuille':
      S.push(body([...quad([0, -32], [30, -10], [0, 32], 10), ...quad([0, 32], [-30, -10], [0, -32], 10).slice(1)], '#E59A3E'), line([[0, -26], [0, 30]], '#B9702A', 3));
      break;
    case 'flocon':
      for (let i = 0; i < 3; i++) {
        const a = (i * Math.PI) / 3;
        S.push(line(rotate([[0, -30], [0, 30]], a), '#9CCBF2', 5), line(rotate([[-8, -20], [0, -12], [8, -20]], a), '#9CCBF2', 4), line(rotate([[-8, 20], [0, 12], [8, 20]], a), '#9CCBF2', 4));
      }
      break;
    case 'papillon': {
      const f = 0.55 + 0.45 * Math.abs(Math.sin(t * 9));
      S.push(part(ellipse(-18 * f, -10, 18 * f, 16), '#B78CF2'), part(ellipse(18 * f, -10, 18 * f, 16), '#B78CF2'), part(ellipse(-14 * f, 12, 12 * f, 10), '#F59BBE'), part(ellipse(14 * f, 12, 12 * f, 10), '#F59BBE'), body(ellipse(0, 0, 4, 20), K.ink), line([[0, -18], [-8, -32]], K.ink, 2), line([[0, -18], [8, -32]], K.ink, 2));
      break;
    }
    case 'oiseau': {
      const flap = Math.sin(t * 10) * 16;
      S.push(body(ellipse(0, 0, 24, 18), '#6CB6E8'), body(circle(18, -12, 12), '#6CB6E8'), part([[28, -12], [40, -8], [28, -4]], K.yellow), dot(circle(21, -15, 2.6, 8), K.ink), part([[-6, -4], [-30, -22 - flap], [-18, -2]], '#4E9CD3'));
      break;
    }
    case 'bateau':
      S.push(line([[0, 6], [0, -52]], K.brown, 4), part([[4, -50], [38, 0], [4, 0]], K.white), part([[-4, -40], [-30, 0], [-4, 0]], K.yellow), body([[-44, 6], [44, 6], [30, 30], [-30, 30]], K.red));
      break;
    case 'carotte':
      S.push(part([...quad([0, -18], [-14, -40], [-8, -44], 6), ...quad([-8, -44], [0, -32], [0, -20], 4).slice(1), ...quad([0, -20], [6, -40], [14, -40], 4).slice(1), [2, -18]], '#5EB06A'), body([[-14, -18], [14, -18], [0, 36]], '#F08A3C'), line([[-6, -6], [4, -6]], '#C96A28', 3), line([[-4, 8], [4, 8]], '#C96A28', 3));
      break;
    case 'note':
      S.push(body(rotate(ellipse(-10, 20, 13, 10), -0.35, -10, 20), K.ink), body(rrect(0, -30, 5, 50, 2), K.ink), body([...quad([5, -30], [30, -22], [22, 0], 6), ...quad([22, 0], [20, -14], [5, -16], 6).slice(1)], K.ink));
      break;
    case 'voiture':
      S.push(body([[-26, -12], [-14, -34], [18, -34], [30, -12]], K.red), body(rrect(-44, -12, 88, 28, 10), K.red), part([[-18, -14], [-10, -30], [0, -30], [0, -14]], '#DDF0FF'), part([[6, -14], [6, -30], [14, -30], [22, -14]], '#DDF0FF'), body(circle(-24, 18, 11), K.ink), body(circle(24, 18, 11), K.ink), dot(circle(-24, 18, 4, 8), '#C9CED6'), dot(circle(24, 18, 4, 8), '#C9CED6'));
      break;
    case 'gateau':
      S.push(body(rrect(-36, -6, 72, 34, 8), '#F7C6D9'), part(rrect(-36, -10, 72, 12, 6), K.white), part(rrect(-4, -34, 8, 24, 3), K.blue), part([...quad([0, -46], [7, -38], [0, -34], 4), ...quad([0, -34], [-7, -38], [0, -46], 4).slice(1)], K.sun));
      break;
    case 'bulle':
      S.push(body(circle(0, 0, 24), '#CFEAFF'), part(rotate(ellipse(-9, -9, 6, 4), -0.6, -9, -9), K.white));
      break;
    case 'brosse':
      S.push(body(rotate(rrect(-6, -40, 12, 74, 6), 0.52), K.blue), part(rotate(rrect(-12, -52, 24, 18, 4), 0.52), K.white), part(rotate(rrect(-10, -62, 20, 10, 3), 0.52), '#9CCBF2'));
      break;
    case 'fusee':
      S.push(part([[-18, 6], [-32, 28], [-18, 22]], K.red), part([[18, 6], [32, 28], [18, 22]], K.red), part([[-8, 20], [0, 34 + Math.sin(t * 20) * 4], [8, 20]], K.sun), body([...quad([0, -50], [22, -24], [18, 20], 10), [-18, 20], ...quad([-18, 20], [-22, -24], [0, -50], 10).slice(1)], K.white), part(circle(0, -14, 9), '#6CB6E8'));
      break;
  }
  return fig(S, seed + name.length * 17);
}

/* ───────────── Décors (plan large, repère de scène) ───────────── */

const W = 960;

export function tree(x: number, y: number, s: number, leaf = '#7FC47A'): Shape[] {
  return [body(rrect(x - 10 * s, y - 90 * s, 20 * s, 90 * s, 6 * s), '#A0714A'), body(ellipse(x, y - 120 * s, 60 * s, 52 * s), leaf), part(ellipse(x - 30 * s, y - 100 * s, 30 * s, 26 * s), leaf), part(ellipse(x + 32 * s, y - 104 * s, 30 * s, 28 * s), leaf)];
}

export function pine(x: number, y: number, s: number, snow = false): Shape[] {
  const out: Shape[] = [body(rrect(x - 8 * s, y - 30 * s, 16 * s, 30 * s, 4 * s), '#8A5A3A')];
  for (let i = 0; i < 3; i++) {
    const w = (70 - i * 16) * s,
      top = y - (60 + i * 44) * s - 50 * s;
    out.push(body([[x, top], [x + w, y - (24 + i * 44) * s], [x - w, y - (24 + i * 44) * s]], '#4F9A6E'));
    if (snow) out.push(part([[x, top], [x + w * 0.4, top + 30 * s], [x - w * 0.4, top + 30 * s]], K.white));
  }
  return out;
}

export function house(x: number, y: number, w: number, h: number, wall: string, roof: string, lit: boolean): Shape[] {
  return [
    body([[x, y], [x + w, y], [x + w, y - h], [x, y - h]], wall),
    body([[x - 14, y - h], [x + w / 2, y - h - w * 0.45], [x + w + 14, y - h]], roof),
    part(rrect(x + w * 0.2, y - h * 0.65, w * 0.24, h * 0.28, 4), lit ? '#FFE27A' : '#DDF0FF'),
    part(rrect(x + w * 0.56, y - h * 0.48, w * 0.24, h * 0.48, 4), '#8A5A3C')
  ];
}

export function flowerAt(x: number, y: number, color: string, s = 1): Shape[] {
  const out: Shape[] = [line([[x, y], [x, y - 26 * s]], '#5EA05A', 3 * s)];
  for (let i = 0; i < 5; i++) out.push(part(rotate(ellipse(x, y - 34 * s, 5 * s, 8 * s), (i * Math.PI * 2) / 5, x, y - 26 * s), color));
  out.push(dot(circle(x, y - 26 * s, 4 * s, 8), K.sun));
  return out;
}

export function decor(name: Decor, t = 0): Figure {
  const S: Shape[] = [];
  const ground = (color: string, y = GROUND) => S.push(sky([[-20, y], [W + 20, y], [W + 20, 760], [-20, 760]], color));
  switch (name) {
    case 'chambre':
      S.push(sky([[-20, -20], [W + 20, -20], [W + 20, GROUND], [-20, GROUND]], K.wall));
      ground(K.floor);
      S.push(part(ellipse(480, 470, 300, 40), K.rug), part(ellipse(480, 470, 220, 26), '#FFE3EE'));
      // Fenêtre avec nuage, étagère, lit.
      S.push(body(rrect(110, 80, 190, 150, 12), K.white), part(rrect(122, 92, 166, 126, 8), K.sky), part(move(cloudShape(0, 0, 0.45), 205 + Math.sin(t * 0.3) * 18, 150), K.white), line([[205, 92], [205, 218]], K.white, 6));
      S.push(body(rrect(640, 150, 220, 12, 6), '#D6BB9A'), part(rrect(660, 112, 30, 38, 6), K.red), part(rrect(700, 104, 34, 46, 6), K.green), part(circle(770, 132, 18), K.yellow));
      S.push(body(rrect(690, 320, 230, 100, 16), '#B8D3F0'), part(rrect(700, 296, 70, 34, 14), K.white), body(rrect(680, 290, 20, 130, 8), '#D6BB9A'));
      break;
    case 'cuisine':
      S.push(sky([[-20, -20], [W + 20, -20], [W + 20, GROUND], [-20, GROUND]], K.wall));
      for (let x = -20; x < W; x += 48) for (let y = 285; y < 352; y += 24) S.push(part(rrect(x + ((y / 24) % 2) * 24, y, 44, 20, 3), '#F6EBDD'));
      ground(K.floor);
      S.push(body(rrect(-20, 352, W + 40, 68, 0), '#E8D2B8'), part(rrect(-20, 346, W + 40, 12, 5), '#D6BB9A'));
      S.push(body(rrect(135, 82, 188, 142, 12), K.white), part(rrect(146, 93, 166, 120, 8), K.sky), line([[229, 93], [229, 213]], K.white, 6));
      S.push(body(rrect(615, 158, 225, 10, 5), '#D6BB9A'), part(rrect(630, 120, 30, 38, 8), K.red), part(rrect(672, 112, 33, 46, 8), K.green), part(rrect(717, 124, 28, 34, 8), K.yellow));
      S.push(body(rrect(765, 308, 90, 40, 8), '#B9C3CF'), part(ellipse(810, 308, 42, 8), '#9AA6B4'));
      break;
    case 'jardin':
      S.push(sky([[-20, -20], [W + 20, -20], [W + 20, GROUND], [-20, GROUND]], K.sky));
      S.push(body(circle(818, 98, 38), K.sun));
      S.push(part(move(cloudShape(0, 0, 0.8), 165 + ((t * 14) % 1100) - 150, 90), K.white), part(move(cloudShape(0, 0, 0.6), 570 + ((t * 8) % 1100) - 300, 150), K.white));
      S.push(sky([...arc(480, 900, 900, -Math.PI * 0.9, -Math.PI * 0.1, 30), [W + 20, 760], [-20, 760]], '#9FD38C'));
      ground(K.grass, GROUND);
      S.push(...tree(112, 390, 0.9), ...tree(878, 405, 0.75));
      for (let i = 0; i < 13; i++) S.push(part(rrect(202 + i * 50, 330, 12, 72, 5), K.white));
      S.push(part(rrect(196, 346, 652, 9, 4), K.white), part(rrect(196, 378, 652, 9, 4), K.white));
      S.push(...flowerAt(225, 450, K.pink), ...flowerAt(270, 465, K.yellow, 0.9), ...flowerAt(750, 457, K.red, 0.9), ...flowerAt(810, 447, K.pink), ...flowerAt(855, 468, K.blue, 0.8));
      break;
    case 'foret':
      S.push(sky([[-20, -20], [W + 20, -20], [W + 20, GROUND], [-20, GROUND]], '#DDF2E3'));
      S.push(...pine(60, 390, 1.1), ...pine(225, 375, 0.85), ...pine(750, 382, 0.95), ...pine(908, 390, 1.15), ...tree(420, 352, 0.75, '#6FAE8E'), ...tree(600, 360, 0.65, '#7FB77E'));
      ground('#8CC48A', 405);
      S.push(line([[-20, 411], [480, 400], [W + 20, 405]], '#79B377', 12));
      S.push(body(rrect(182, 432, 10, 18, 3), '#FFF4E2'), body([...arc(187, 436, 18, Math.PI, Math.PI * 2, 10)], K.red));
      break;
    case 'plage': {
      S.push(sky([[-20, -20], [W + 20, -20], [W + 20, 300], [-20, 300]], K.sky));
      S.push(body(circle(788, 90, 34), K.sun), part(move(cloudShape(0, 0, 0.6), 225 + ((t * 10) % 1100) - 220, 105), K.white));
      const wave = (y: number, amp: number, sp: number, color: string) => {
        const pts: Pt[] = [];
        for (let x = -20; x <= W + 20; x += 24) pts.push([x, y + Math.sin(x / 52 + t * sp) * amp]);
        S.push(sky([...pts, [W + 20, y + 160], [-20, y + 160]], color));
      };
      wave(285, 6, 1.4, '#5BB6E8');
      wave(308, 7, -1.1, '#4AA3DA');
      wave(338, 7, 1.7, '#7CCBF0');
      S.push(sky([...arc(480, 1000, 1010, -Math.PI * 0.95, -Math.PI * 0.05, 30), [W + 20, 760], [-20, 760]], '#F6DFA9'));
      ground('#F3D79A', GROUND);
      S.push(line([[135, 450], [150, 308]], K.white, 6), body([...quad([67, 322], [150, 255], [232, 300], 12)], K.red));
      S.push(body([[810, 458], [870, 458], [861, 428], [819, 428]], K.yellow), part(rrect(813, 419, 54, 9, 4), K.red));
      break;
    }
    case 'nuit': {
      S.push(sky([[-20, -20], [W + 20, -20], [W + 20, GROUND], [-20, GROUND]], '#2D3A6E'));
      S.push(sky([[-20, 150], [W + 20, 150], [W + 20, 450], [-20, 450]], '#34427E'));
      for (let i = 0; i < 26; i++) {
        const x = ((i * 211) % 1120) - 60,
          y = 24 + ((i * 97) % 270);
        const tw = 0.6 + 0.4 * Math.abs(Math.sin(t * (0.8 + (i % 5) * 0.3) + i));
        S.push(dot(star(x, y, (3.5 + (i % 3) * 2) * tw, (1.6 + (i % 3)) * tw), '#FFF4C2'));
      }
      S.push(body(circle(795, 105, 44), '#FFF1B8'), part(circle(780, 94, 7), '#EADBA0'), part(circle(807, 120, 9), '#EADBA0'));
      S.push(sky([...quad([-20, 390], [300, 330], [520, 375], 14), ...quad([520, 375], [700, 410], [W + 20, 352], 14).slice(1), [W + 20, 760], [-20, 760]], '#26325E'));
      S.push(...house(100, 405, 112, 98, '#4B5A96', '#5E4C86', true), ...house(705, 405, 128, 112, '#4B5A96', '#5E4C86', true));
      ground('#3A4778', GROUND);
      break;
    }
    case 'neige': {
      S.push(sky([[-20, -20], [W + 20, -20], [W + 20, GROUND], [-20, GROUND]], '#DDEBF7'));
      S.push(sky([[-20, 315], [-75, 165], [180, 315]], '#C7D9EC'), sky([[105, 330], [390, 150], [675, 330]], '#C7D9EC'), sky([[570, 322], [840, 172], [W + 20, 322]], '#C7D9EC'));
      S.push(part([[315, 196], [390, 150], [465, 196]], K.white), part([[787, 202], [840, 172], [892, 202]], K.white));
      S.push(...pine(90, 405, 0.95, true), ...pine(885, 409, 1.05, true), ...pine(780, 390, 0.7, true));
      S.push(sky([...quad([-20, 375], [480, 330], [W + 20, 382], 20), [W + 20, 760], [-20, 760]], '#F4F9FF'));
      ground(K.white, GROUND);
      S.push(body(circle(225, 428, 27), K.white), body(circle(225, 383, 20), K.white), part([[225, 380], [242, 383], [225, 386]], '#F08A3C'), dot(circle(219, 377, 2.4, 8), K.ink), dot(circle(231, 377, 2.4, 8), K.ink));
      for (let i = 0; i < 30; i++) {
        const x = ((i * 157) % 1050) - 45 + Math.sin(t * 1.2 + i) * 10;
        const y = ((((i * 89) % 540) + t * (21 + (i % 4) * 7)) % 570) - 15;
        S.push(dot(circle(x, y, 2 + (i % 3), 8), K.white));
      }
      break;
    }
    case 'ville':
      S.push(sky([[-20, -20], [W + 20, -20], [W + 20, GROUND], [-20, GROUND]], K.sky));
      S.push(body(circle(105, 82, 30), K.sun), part(move(cloudShape(0, 0, 0.6), 450 + ((t * 12) % 1100) - 375, 82), K.white));
      [[-30, 128, 225, '#F2B6A0'], [112, 105, 172, '#B8D3F0'], [232, 142, 248, '#F6D58E'], [615, 120, 195, '#C9B8E8'], [750, 112, 255, '#9FD3C0'], [878, 120, 180, '#F2B6A0']].forEach(([x, w, h, c]) => {
        S.push(body(rrect(x as number, 420 - (h as number), w as number, h as number, 6), c as string));
        for (let yy = 420 - (h as number) + 16; yy < 390; yy += 30) for (let xx = (x as number) + 12; xx < (x as number) + (w as number) - 18; xx += 26) S.push(part(rrect(xx, yy, 13, 16, 2), '#FFFFFF'));
      });
      S.push(sky([[-20, 405], [W + 20, 405], [W + 20, 435], [-20, 435]], '#C9CED6'));
      ground('#8E96A3', 435);
      for (let i = 0; i < 7; i++) S.push(part(rrect(375 + i * 34, 442, 21, 90, 2), K.white));
      break;
  }
  return fig(S, 900 + name.length * 31, 'back');
}

/* ───────────── Personnages ───────────── */

export interface KidPose {
  armL?: number;
  armR?: number;
  tilt?: number;
  blink?: number;
  mouth?: 'smile' | 'open' | 'sad';
  look?: number;
  walk?: number;
  t?: number;
  scaleY?: number;
}

const deg = (d: number) => (d * Math.PI) / 180;

/** Nino (casquette, pull, salopette) ou Nina (robe, couettes, nœuds). Pieds en (0, 0), hauteur ≈ 260. */
export function kid(girl: boolean, p: KidPose = {}, seed = 3): Figure {
  const t = p.t ?? 0;
  const S: Shape[] = [];
  const legs = girl ? K.legging : K.overallDark;
  const top = girl ? K.dress : K.sweater;
  const topDark = girl ? K.dressDark : K.sweaterDark;
  // Jambes (balancement quand il marche).
  for (const [i, side] of [-1, 1].entries()) {
    const sw = p.walk ? Math.sin(t * 9 + i * Math.PI) * p.walk * deg(16) : 0;
    S.push(body(rotate(rrect(side * 14 - 11, -92, 22, 86, 11), sw, side * 14, -92), legs), part(rotate(ellipse(side * 14, -6, 16, 8), sw, side * 14, -92), K.white));
  }
  // Corps.
  if (girl) S.push(body([...quad([-42, -168], [0, -180], [42, -168], 8), [42, -120], [56, -92], ...quad([56, -92], [0, -82], [-56, -92], 8).slice(1), [-42, -120]], K.dress), dot(circle(-30, -150, 3.5, 8), K.white), dot(circle(30, -150, 3.5, 8), K.white));
  else S.push(body(rrect(-42, -172, 84, 80, 26), K.sweater), part(rrect(-30, -152, 60, 66, 16), K.overall), dot(circle(-25, -156, 3.5, 8), K.yellow), dot(circle(25, -156, 3.5, 8), K.yellow));
  // Bras, autour de l'épaule.
  const arm = (side: number, a: number) => {
    const cx = side * 46,
      cy = -150;
    const r = deg(a);
    S.push(body(rotate(rrect(side > 0 ? 36 : -55, -152, 19, 76, 9.5), r, cx, cy), top), part(rotate(rrect(side > 0 ? 36 : -55, -90, 19, 14, 7), r, cx, cy), topDark), part(rotate(circle(side * 45.5, -72, 10), r, cx, cy), K.skin));
  };
  arm(-1, p.armL ?? 0);
  arm(1, p.armR ?? 0);
  // Tête.
  const lx = p.look ?? 0;
  const H = (pts: Pt[]) => move(pts, lx, 0);
  if (girl) {
    S.push(part(H(circle(-66, -204, 15)), K.girlHair), part(H(circle(66, -204, 15)), K.girlHair));
    S.push(part(H([[-66, -216], [-79, -225], [-79, -207]]), K.bow), part(H([[-66, -216], [-53, -225], [-53, -207]]), K.bow), part(H([[66, -216], [53, -225], [53, -207]]), K.bow), part(H([[66, -216], [79, -225], [79, -207]]), K.bow));
  }
  S.push(part(H(circle(-52, -208, 9)), K.skinShade), part(H(circle(52, -208, 9)), K.skinShade), body(H(circle(0, -210, 55, 30)), K.skin));
  if (girl) S.push(part(H([...arc(0, -212, 56, Math.PI, Math.PI * 2, 14), ...quad([56, -212], [34, -244], [0, -246], 6).slice(1), ...quad([0, -246], [-34, -244], [-56, -212], 6).slice(1)]), K.girlHair), part(H([[-56, -214], [-63, -188], [-53, -174], [-46, -194]]), K.girlHair), part(H([[56, -214], [63, -188], [53, -174], [46, -194]]), K.girlHair));
  else S.push(part(H([...arc(0, -228, 56, Math.PI, Math.PI * 2, 14), [56, -238], ...quad([56, -238], [0, -262], [-56, -238], 8).slice(1)]), K.cap), part(H(rotate(ellipse(30, -238, 29, 7), -0.17, 30, -238)), K.capDark), part(H([...quad([-46, -246], [-24, -262], [-6, -252], 6), ...quad([-6, -252], [-30, -246], [-38, -236], 6).slice(1)]), K.hair));
  const blink = p.blink ?? 0;
  const ery = Math.max(0.8, 6.5 * (1 - 0.92 * blink));
  S.push(dot(H(ellipse(-19, -212, 5.6, ery, 0, 10)), K.ink), dot(H(ellipse(19, -212, 5.6, ery, 0, 10)), K.ink));
  S.push(part(H(ellipse(-32, -196, 7, 4, 0, 10)), K.pink), part(H(ellipse(32, -196, 7, 4, 0, 10)), K.pink));
  if (p.mouth === 'open') S.push(dot(H(ellipse(0, -186, 11, 12, 0, 14)), '#8C3B3B'), part(H(ellipse(0, -181, 7, 5, 0, 10)), '#FF8FA8'));
  else if (p.mouth === 'sad') S.push(line(H(quad([-11, -184], [0, -193], [11, -184], 6)), K.ink, 4));
  else S.push(line(H(quad([-12, -191], [0, -181], [12, -191], 6)), K.ink, 4.5));
  // Étirement vertical (respiration, saut).
  const sy = p.scaleY ?? 1;
  const out = sy === 1 ? S : S.map((sh) => ({ ...sh, pts: sh.pts.map(([x, y]) => [x, y * sy] as Pt) }));
  const tilted = p.tilt ? out.map((sh) => ({ ...sh, pts: rotate(sh.pts, deg(p.tilt!), 0, -120) })) : out;
  return { shapes: tilted, seed: seed + (girl ? 50 : 0), layer: 'front', character: true };
}

export interface CatPose {
  tail?: number;
  blink?: number;
  tilt?: number;
  t?: number;
  look?: number;
}

/** Mila, la chatte blanche à taches rousses. Pieds en (0, 0). */
export function cat(p: CatPose = {}, seed = 7): Figure {
  const t = p.t ?? 0;
  const sway = Math.sin(t * 3.4 + (p.tail ?? 0)) * 12;
  const S: Shape[] = [];
  S.push(body(ribbon(cubic([30, -44], [56, -48], [70 + sway, -72], [62, -92], 10), 15), K.cat), part(ribbon(quad([54 + sway, -86], [64 + sway, -84], [66 + sway, -92], 4), 9), K.catPatch));
  S.push(body(ellipse(0, -50, 43, 39), K.cat), part(ellipse(18, -56, 15, 20), '#F7D2B0'), part(ellipse(0, -34, 22, 17), '#FFFDF7'), body(ellipse(-17, -9, 13, 8), K.cat), body(ellipse(17, -9, 13, 8), K.cat));
  const head: Shape[] = [];
  head.push(body([[-40, -22], [-16, -54], [-2, -22]], K.cat), body([[40, -22], [16, -54], [2, -22]], K.cat), part([[-33, -25], [-18, -44], [-9, -25]], K.pink), part([[33, -25], [18, -44], [9, -25]], K.pink));
  head.push(body(circle(0, 0, 37, 28), K.cat), line(quad([-18, -30], [-11, -37], [-4, -30], 4), K.catPatch, 4), line(quad([4, -30], [11, -37], [18, -30], 4), K.catPatch, 4));
  const ery = Math.max(0.8, 7.2 * (1 - 0.9 * (p.blink ?? 0)));
  head.push(dot(ellipse(-13, -4, 7, ery, 0, 10), K.ink), dot(ellipse(13, -4, 7, ery, 0, 10), K.ink));
  head.push(part(ellipse(-25, 7, 6.5, 3.6, 0, 10), K.pink), part(ellipse(25, 7, 6.5, 3.6, 0, 10), K.pink), part([[-4, 2], [4, 2], [0, 7]], K.pink));
  head.push(line([...quad([0, 7], [-6, 13], [-11, 8], 4)], K.ink, 2.6), line([...quad([0, 7], [6, 13], [11, 8], 4)], K.ink, 2.6));
  head.push(line([[-42, 2], [-24, 5]], '#6B5F86', 2), line([[-42, 10], [-24, 10]], '#6B5F86', 2), line([[42, 2], [24, 5]], '#6B5F86', 2), line([[42, 10], [24, 10]], '#6B5F86', 2));
  const tilt = deg(p.tilt ?? 0);
  for (const sh of head) S.push({ ...sh, pts: move(rotate(sh.pts, tilt), 0, -110) });
  return { shapes: S, seed, layer: 'front', character: true };
}
