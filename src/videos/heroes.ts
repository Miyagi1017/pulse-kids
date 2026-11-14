/**
 * Les héros des 50 vidéos du jour, dessinés en code (formes des kits, geom.ts).
 * Chaque héros est centré sur (0, 0), hauteur ≈ 240, pieds vers y = +110 ; t anime son geste propre
 * (battre des ailes, souffler, cligner des yeux, rouler…). `act` (0 → 1) est son « action » du gros plan :
 * l'éléphant se douche, le volcan crache, la fusée décolle, le cœur bat plus fort…
 * Les décors propres aux vidéos (savane, espace, fond marin, désert…) sont en bas du fichier.
 */
import { arc, body, circle, cubic, dot, ellipse, line, move, part, quad, ribbon, rotate, rrect, sky, star, type Figure, type Pt, type Shape } from '../kits/geom';
import { GROUND, K, cloudShape, decor as libDecor, flowerAt, objet, pine, tree } from '../kits/library';
import type { Decor } from '../data/comptines';

const INK = K.ink;
const fig = (shapes: Shape[], seed: number, layer: Figure['layer'] = 'front'): Figure => ({ shapes, seed, layer, character: layer === 'front' });

/** Œil : blanc + pupille ; ferme (trait) quand blink. */
const eye = (x: number, y: number, r: number, blink = false, look = 0): Shape[] =>
  blink ? [line([[x - r, y], [x + r, y]], INK, 2.6)] : [part(circle(x, y, r), K.white), dot(circle(x + look * r * 0.35, y + r * 0.1, r * 0.55, 10), INK)];
const smile = (x: number, y: number, w: number) => line(arc(x, y - w * 0.4, w, 0.35, Math.PI - 0.35, 8), INK, 2.6);
const blinkAt = (t: number, every = 3.7) => t % every < 0.13;
const leg = (x: number, y: number, w: number, h: number, c: string) => body(rrect(x - w / 2, y, w, h, w / 2), c);

export type HeroName =
  | 'manchot' | 'elephant' | 'girafe' | 'abeille' | 'dauphin' | 'papillon' | 'tortue' | 'chouette' | 'vache' | 'ecureuil' | 'lion' | 'grenouille' | 'panda' | 'coccinelle' | 'baleine'
  | 'arbre' | 'arcenciel' | 'vagues' | 'volcan' | 'bonhomme' | 'automne' | 'printemps' | 'pluie' | 'montagne' | 'tournesol'
  | 'lune' | 'soleil' | 'planete' | 'fusee' | 'astronaute' | 'etoile' | 'terre' | 'aurore'
  | 'camion' | 'docteur' | 'tracteur' | 'pain' | 'livres' | 'bus' | 'microscope'
  | 'dent' | 'coeur' | 'fruits' | 'dodo' | 'bouger'
  | 'eiffel' | 'chameau' | 'palmier' | 'ours' | 'chateau';

export function hero(name: HeroName, t = 0, act = 0): Figure {
  const S: Shape[] = [];
  const b = blinkAt(t);
  switch (name) {
    /* ───────── Animaux ───────── */
    case 'manchot': {
      const w = Math.sin(t * 6) * 0.25;
      S.push(part(rotate(ellipse(-50, 10, 14, 44), 0.35 + w, -44, -20), '#22253a'), part(rotate(ellipse(50, 10, 14, 44), -0.35 - w, 44, -20), '#22253a'));
      S.push(body(ellipse(0, 14, 54, 84), '#2b2d42'), part(ellipse(0, 30, 38, 62), K.white), body(circle(0, -62, 40), '#2b2d42'), part(ellipse(0, -55, 28, 24), K.white));
      S.push(...eye(-11, -62, 6, b), ...eye(11, -62, 6, b), part([[-9, -50], [9, -50], [0, -38]], '#F29A3A'));
      S.push(part(ellipse(-20, 98, 18, 8), '#F29A3A'), part(ellipse(20, 98, 18, 8), '#F29A3A'), part(ellipse(0, -20, 30, 8), '#F2C14E'));
      break;
    }
    case 'elephant': {
      const ear = Math.sin(t * 3) * 0.12;
      const sw = Math.sin(t * 1.6) * 10;
      S.push(line([[-108, -10], [-124, 30]], '#8b95a1', 5));
      S.push(leg(-70, 20, 34, 86, '#8b95a1'), leg(50, 20, 34, 86, '#8b95a1'));
      S.push(body(ellipse(-10, 0, 110, 68), '#9aa5b1'));
      S.push(leg(-40, 30, 34, 78, '#9aa5b1'), leg(80, 30, 34, 78, '#9aa5b1'));
      const trunkTip: Pt = act > 0.2 ? [176, -78 - act * 30] : [150 + sw * 0.4, 70];
      S.push(body(ribbon([[118, -26], ...quad([136, 0], [160 + sw, 30], trunkTip, 8)], 26 - 6), '#9aa5b1'));
      S.push(body(circle(100, -40, 52), '#9aa5b1'), part(rotate(ellipse(72, -34, 36, 48), ear, 90, -60), '#b8c1cc'));
      S.push(...eye(116, -54, 6, b), part([[128, -6], [150, 10], [134, 2]], K.white));
      if (act > 0.2) for (let i = 0; i < 9; i++) S.push(dot(circle(trunkTip[0] - 30 + i * 9 + Math.sin(t * 9 + i) * 4, trunkTip[1] + 18 + ((t * 120 + i * 37) % 180), 4, 8), '#6BB8F2'));
      break;
    }
    case 'girafe': {
      const nod = Math.sin(t * 1.4) * 6;
      S.push(leg(-55, 30, 18, 90, '#e8b33e'), leg(-25, 30, 18, 90, '#e8b33e'), leg(40, 30, 18, 90, '#e8b33e'), leg(68, 30, 18, 90, '#e8b33e'));
      S.push(body(ellipse(5, 25, 85, 42), '#f2c14e'), body(ribbon([[50, 10], [70, -60], [86, -150 + nod]], 30), '#f2c14e'));
      S.push(body(rotate(ellipse(100, -165 + nod, 34, 20), 0.25, 100, -165), '#f2c14e'), part(ellipse(126, -156 + nod, 12, 9), '#e2a35a'));
      S.push(line([[86, -180 + nod], [82, -200 + nod]], '#9a6a34', 5), line([[100, -182 + nod], [102, -202 + nod]], '#9a6a34', 5), dot(circle(82, -202 + nod, 5, 8), '#9a6a34'), dot(circle(102, -204 + nod, 5, 8), '#9a6a34'));
      for (const [x, y, r] of [[-40, 15, 12], [-5, 32, 14], [30, 10, 11], [-60, 40, 9], [62, -40, 8], [74, -90, 8], [58, 30, 10]]) S.push(part(ellipse(x, y, r, r * 0.8), '#b8742c'));
      S.push(...eye(96, -172 + nod, 5, b), line([[-80, 20], [-96, 60]], '#9a6a34', 4));
      if (act > 0.2) S.push(part(rotate(ellipse(150, -150 + nod, 16, 6), 0.3), '#8a3fa8'));
      break;
    }
    case 'abeille': {
      const f = 0.4 + 0.6 * Math.abs(Math.sin(t * 22));
      S.push(part(ellipse(-8, -46, 26, 30 * f), '#e8f6ff'), part(ellipse(18, -42, 22, 26 * f), '#d8eefc'));
      S.push(body(ellipse(10, 0, 58, 40), '#F6C531'), part(ellipse(-4, 0, 9, 38), '#2b2622'), part(ellipse(22, 0, 9, 36), '#2b2622'), part(ellipse(46, 0, 7, 26), '#2b2622'));
      S.push(part([[66, -6], [84, 0], [66, 6]], '#2b2622'), body(circle(-48, -4, 28), '#2b2622'), ...eye(-56, -10, 7, b), line([[-58, -28], [-72, -56]], '#2b2622', 3), line([[-44, -30], [-40, -60]], '#2b2622', 3));
      S.push(line(arc(-58, 4, 9, 0.3, Math.PI - 0.3, 6), K.white, 2.4));
      break;
    }
    case 'dauphin': {
      const arcY = act > 0.2 ? -Math.sin(Math.min(1, act) * Math.PI) * 60 : Math.sin(t * 2) * 6;
      const R = act > 0.2 ? -0.4 + act * 0.8 : 0;
      const D: Shape[] = [];
      D.push(part([[90, -10], [140, -40], [130, 0], [140, 34], [90, 10]], '#5a8fb8'), part([[-10, -30], [20, -78], [36, -32]], '#5a8fb8'));
      D.push(body(rotate(ellipse(0, 0, 104, 38), -0.08), '#6c9fc7'), part(rotate(ellipse(-6, 14, 76, 18), -0.08), '#d6e8f5'), body(ellipse(-104, 10, 34, 12), '#6c9fc7'), part([[-10, 16], [-30, 54], [6, 28]], '#5a8fb8'));
      D.push(...eye(-70, -6, 6, b), line(arc(-110, 6, 18, 0.2, 1.2, 6), INK, 2.2));
      for (const s of D) S.push({ ...s, pts: move(rotate(s.pts, R), 0, arcY) });
      break;
    }
    case 'papillon': {
      const p = objet('papillon', t, 2);
      for (const s of p.shapes) S.push({ ...s, pts: s.pts.map(([x, y]) => [x * 3, y * 3] as Pt), width: s.width ? s.width * 2.5 : undefined });
      break;
    }
    case 'tortue': {
      const step = Math.sin(t * 2.5) * 6;
      S.push(body(ellipse(-80 + step, 50, 22, 14), '#8bbf6a'), body(ellipse(70 - step, 50, 22, 14), '#8bbf6a'), part([[96, 30], [120, 36], [96, 44]], '#8bbf6a'));
      const out = act > 0.2 ? Math.max(0, 1 - act * 2) : 1;
      S.push(body(circle(-120 + 40 * (1 - out), 0, 30), '#9ccf7a'), ...(out > 0.5 ? eye(-128 + 40 * (1 - out), -6, 6, b) : []), ...(out > 0.5 ? [smile(-126, 6, 10)] : []));
      S.push(body([...arc(0, 50, 100, Math.PI, Math.PI * 2, 24, 90)], '#4f8a3a'));
      for (const [x, y] of [[-50, 20], [0, -8], [50, 20], [-24, -40], [26, -40]]) S.push(part([[x - 18, y], [x - 9, y - 16], [x + 9, y - 16], [x + 18, y], [x + 9, y + 16], [x - 9, y + 16]], '#6aa84f'));
      S.push(part(rrect(-104, 44, 208, 12, 6), '#3e6e2e'));
      break;
    }
    case 'chouette': {
      const turn = act > 0.2 ? Math.sin(act * Math.PI) * 0.9 : 0;
      S.push(part(ellipse(-62, 20, 24, 56), '#7a5236'), part(ellipse(62, 20, 24, 56), '#7a5236'));
      S.push(body(ellipse(0, 18, 64, 88), '#a0714a'), part(ellipse(0, 40, 42, 60), '#e8cfa4'));
      for (let r = 0; r < 3; r++) for (let c = -1; c <= 1; c++) S.push(line(arc(c * 20, 20 + r * 22, 8, 0.4, Math.PI - 0.4, 5), '#b98a5a', 2));
      const H: Shape[] = [part([[-50, -96], [-36, -62], [-24, -84]], '#7a5236'), part([[50, -96], [36, -62], [24, -84]], '#7a5236'), body(ellipse(0, -52, 58, 46), '#a0714a')];
      H.push(part(circle(-24, -54, 22), K.white), part(circle(24, -54, 22), K.white));
      if (b) H.push(line([[-36, -54], [-12, -54]], INK, 3), line([[12, -54], [36, -54]], INK, 3));
      else H.push(part(circle(-24, -54, 13), '#F2B441'), part(circle(24, -54, 13), '#F2B441'), dot(circle(-24, -54, 7, 10), INK), dot(circle(24, -54, 7, 10), INK));
      H.push(part([[-7, -38], [7, -38], [0, -24]], '#F29A3A'));
      for (const s of H) S.push({ ...s, pts: s.pts.map(([x, y]) => [x * Math.cos(turn), y] as Pt) });
      S.push(part(ellipse(-20, 104, 14, 7), '#F29A3A'), part(ellipse(20, 104, 14, 7), '#F29A3A'));
      break;
    }
    case 'vache': {
      const chew = Math.sin(t * 5) * 3;
      S.push(line([[-100, -20], ...quad([-120, 10], [-112, 40], [-118, 60], 6)], '#ffffff', 5), leg(-70, 20, 26, 80, '#f4f0e8'), leg(60, 20, 26, 80, '#f4f0e8'));
      S.push(body(rrect(-100, -56, 200, 96, 44), '#ffffff'), part(ellipse(-50, -20, 30, 22), '#2b2622'), part(ellipse(20, 6, 24, 18), '#2b2622'), part(ellipse(60, -36, 18, 14), '#2b2622'), part(ellipse(-4, 30, 26, 14), '#F7C6D9'));
      S.push(leg(-40, 30, 26, 74, '#ffffff'), leg(84, 30, 26, 74, '#ffffff'));
      S.push(part([[100, -88], [92, -112], [112, -96]], '#e8d2b8'), part([[148, -88], [156, -112], [136, -96]], '#e8d2b8'), part(rotate(ellipse(84, -78, 20, 10), -0.4, 84, -78), '#ffffff'), part(rotate(ellipse(166, -78, 20, 10), 0.4, 166, -78), '#ffffff'));
      S.push(body(rrect(92, -96, 64, 80, 30), '#ffffff'), part(ellipse(124, -30 + chew * 0.3, 34, 22), '#F7C6D9'), dot(circle(112, -30, 4, 8), INK), dot(circle(136, -30, 4, 8), INK), ...eye(110, -70, 6, b), ...eye(138, -70, 6, b));
      break;
    }
    case 'ecureuil': {
      const tw = Math.sin(t * 3) * 0.08;
      S.push(body(rotate(ribbon([[-20, 80], ...cubic([-60, 70], [-130, 20], [-110, -110], [-40, -120], 12)], 54), tw, -20, 80), '#c4703a'), part(rotate(ribbon([[-30, 60], ...cubic([-70, 50], [-110, 10], [-96, -90], [-50, -100], 10)], 22), tw, -20, 80), '#e08f52'));
      S.push(body(ellipse(10, 30, 44, 60), '#b5612f'), part(ellipse(18, 40, 26, 40), '#f0d2a8'), body(circle(20, -40, 34), '#b5612f'), part([[0, -66], [6, -96], [18, -70]], '#b5612f'), part([[34, -68], [44, -94], [46, -64]], '#b5612f'));
      S.push(...eye(32, -46, 6, b), dot(circle(52, -34, 4, 8), INK), part(ellipse(40, 16, 18, 16), '#9a5a2a'), part(ellipse(40, 8, 16, 8), '#6b3a1a'));
      S.push(part(ellipse(-6, 92, 22, 10), '#9a5a2a'), part(ellipse(30, 92, 22, 10), '#9a5a2a'));
      break;
    }
    case 'lion': {
      const roar = act > 0.2 ? Math.sin(Math.min(1, act * 1.5) * Math.PI) : 0;
      S.push(line([[-90, 20], ...quad([-140, 30], [-140, -20], [-150, -30], 6)], '#d99a3a', 6), part(circle(-152, -34, 12), '#a8531a'));
      S.push(leg(-70, 30, 30, 76, '#e0a040'), leg(40, 30, 30, 76, '#e0a040'), body(ellipse(-20, 20, 90, 50), '#e8ac48'), leg(-40, 40, 30, 66, '#e8ac48'), leg(70, 40, 30, 66, '#e8ac48'));
      S.push(body(star(70, -50, 86 + roar * 6, 62, t * 0.2, 14), '#b8601e'), body(circle(70, -50, 54), '#f2b441'));
      S.push(part(circle(34, -96, 14), '#f2b441'), part(circle(106, -96, 14), '#f2b441'), ...eye(52, -62, 6, b && !roar), ...eye(88, -62, 6, b && !roar), part(ellipse(70, -32, 22, 16), '#f8d58a'), part([[62, -44], [78, -44], [70, -36]], '#6b3a1a'));
      S.push(roar > 0.2 ? part(ellipse(70, -18, 14, 12 * roar), '#8a2a2a') : line(arc(70, -32, 10, 0.4, Math.PI - 0.4, 6), INK, 2.4));
      break;
    }
    case 'grenouille': {
      const hop = act > 0.2 ? Math.sin(Math.min(1, act * 1.2) * Math.PI) * 90 : Math.max(0, Math.sin(t * 2.2)) * 6;
      const G: Shape[] = [];
      G.push(part(ellipse(-60, 70, 40, 18), '#4f9a3e'), part(ellipse(60, 70, 40, 18), '#4f9a3e'), body(ellipse(0, 30, 74, 52), '#6cbf4a'), part(ellipse(0, 48, 48, 28), '#cde8a0'));
      G.push(body(circle(-34, -22, 24), '#6cbf4a'), body(circle(34, -22, 24), '#6cbf4a'), ...eye(-34, -24, 13, b), ...eye(34, -24, 13, b), line(arc(0, 6, 40, 0.25, Math.PI - 0.25, 10), INK, 3));
      G.push(part(ellipse(-26, 86, 22, 8), '#4f9a3e'), part(ellipse(26, 86, 22, 8), '#4f9a3e'));
      if (act > 0.6 && act < 0.9) G.push(line([[30, 14], [130, -30]], '#e86a6a', 6), dot(circle(134, -32, 6, 8), '#2b2622'));
      for (const s of G) S.push({ ...s, pts: move(s.pts, 0, -hop) });
      break;
    }
    case 'panda': {
      const chew = Math.sin(t * 4) * 0.12;
      S.push(body(ellipse(0, 40, 76, 70), '#ffffff'), part(ellipse(-60, 90, 30, 22), '#2b2622'), part(ellipse(60, 90, 30, 22), '#2b2622'), part(ellipse(0, 10, 76, 22), '#2b2622'));
      S.push(body(rotate(rrect(30, -120, 14, 190, 6), 0.3 + chew, 37, 40), '#6fbf6a'), part(rotate(ellipse(60, -96, 18, 7), -0.4), '#5ea05a'));
      S.push(part(circle(-46, -96, 20), '#2b2622'), part(circle(46, -96, 20), '#2b2622'), body(circle(0, -56, 56), '#ffffff'));
      S.push(part(rotate(ellipse(-22, -60, 15, 20), 0.5, -22, -60), '#2b2622'), part(rotate(ellipse(22, -60, 15, 20), -0.5, 22, -60), '#2b2622'), ...eye(-20, -62, 6, b), ...eye(20, -62, 6, b), dot(ellipse(0, -38, 8, 5), INK), smile(0, -26, 9));
      S.push(part(ellipse(-50, 20, 20, 32), '#2b2622'), part(rotate(ellipse(44, 10, 20, 32), -0.6 + chew, 44, 10), '#2b2622'));
      break;
    }
    case 'coccinelle': {
      const open = act > 0.2 ? Math.sin(Math.min(1, act) * Math.PI) : 0;
      S.push(line([[-70, -20], [-100, -70]], INK, 4), line([[-60, -30], [-70, -84]], INK, 4), dot(circle(-100, -72, 6, 8), INK), dot(circle(-70, -86, 6, 8), INK));
      if (open > 0.1) S.push(part(rotate(ellipse(-10, -40, 70, 26), -0.6 - open * 0.4, 0, -10), '#f4f0e4'), part(rotate(ellipse(30, -40, 70, 26), 0.6 + open * 0.4, 0, -10), '#f4f0e4'));
      for (const side of [-1, 1]) S.push(body(rotate([...arc(0, 10, 90, -Math.PI / 2, Math.PI / 2, 16, 74)].map(([x, y]) => [side * Math.abs(x), y] as Pt), side * open * 0.5, 0, -50), '#e4372b'));
      S.push(body([...arc(-62, 10, 40, Math.PI * 0.5, Math.PI * 1.5, 12)], '#2b2622'), ...eye(-76, 0, 8, b));
      for (const [x, y] of [[-30, -30], [30, -30], [-44, 30], [44, 30], [0, 50], [0, -60]]) S.push(part(circle(x * (1 + open * 0.3), y, 13), '#2b2622'));
      break;
    }
    case 'baleine': {
      const sw = Math.sin(t * 1.2) * 8;
      S.push(part([[150, -10 + sw], [210, -60 + sw], [196, -6 + sw], [214, 40 + sw], [150, 10 + sw]], '#2f5f8a'));
      S.push(body(ellipse(0, 0, 170, 76), '#3c6e9e'), part([...arc(0, 0, 170, 0.15, Math.PI - 0.15, 20, 76)], '#a9c9e6'));
      for (let i = 0; i < 6; i++) S.push(line([[-110 + i * 30, 30], [-100 + i * 30, 66]], '#7fa8cc', 2.5));
      S.push(...eye(-110, -14, 8, b), line(arc(-150, 18, 24, 0.1, 1.0, 6), INK, 2.6), part(ellipse(-20, 40, 30, 12, 0.5), '#2f5f8a'));
      const spout = act > 0.2 ? Math.sin(Math.min(1, act) * Math.PI) : 0.25 + 0.15 * Math.sin(t * 2);
      for (let i = -2; i <= 2; i++) S.push(line(quad([-60, -76], [-60 + i * 16, -76 - 70 * spout], [-60 + i * 34, -76 - 110 * spout], 6), '#8fd0f5', 6));
      break;
    }

    /* ───────── Nature ───────── */
    case 'arbre':
      S.push(...tree(0, 110, 1.9, '#5fae5a'));
      for (const [x, y] of [[-50, -110], [40, -150], [70, -90], [-20, -170], [-80, -70]]) S.push(part(circle(x, y + Math.sin(t * 2 + x) * 2, 10), K.red));
      if (act > 0.2) for (let i = 0; i < 6; i++) S.push(...objet('oiseau', t + i, i).shapes.map((s) => ({ ...s, pts: move(s.pts.map(([x, y]) => [x * 0.5, y * 0.5] as Pt), -120 + i * 50 + ((t * 30) % 40), -240 + Math.sin(t * 2 + i) * 10) })).slice(0, i < 2 ? 5 : 0));
      break;
    case 'arcenciel': {
      const cols = ['#e4372b', '#f39a3a', '#f6c531', '#57b894', '#4a90d9', '#4b5bb7', '#9a6ad8'];
      const k = act > 0.05 ? Math.min(1, act * 1.4) : 1;
      cols.forEach((c, i) => S.push(body(ribbon(arc(0, 110, 230 - i * 16, Math.PI, Math.PI + Math.PI * k, 30), 16), c)));
      S.push(body(move(cloudShape(0, 0, 0.8), -220, 100), K.white), body(move(cloudShape(0, 0, 0.8), 220, 100), K.white));
      break;
    }
    case 'vagues':
      for (let r = 0; r < 3; r++) {
        const pts: Pt[] = [];
        for (let x = -260; x <= 260; x += 20) pts.push([x, -20 + r * 40 + Math.sin(x / 40 + t * (1.5 + r * 0.4) + r) * (18 - r * 4)]);
        S.push(body([...pts, [260, 140], [-260, 140]], ['#4AA3DA', '#5BB6E8', '#7CCBF0'][r]));
        for (let x = -240; x < 260; x += 80) S.push(part(ellipse(x + Math.sin(t + x) * 10, -26 + r * 40 + Math.sin(x / 40 + t * (1.5 + r * 0.4) + r) * (18 - r * 4), 18, 6), K.white));
      }
      S.push(...objet('bateau', t).shapes.map((s) => ({ ...s, pts: move(s.pts, 40, -56 + Math.sin(t * 1.6) * 8) })));
      break;
    case 'volcan': {
      const boom = act > 0.2 ? Math.min(1, act * 1.3) : 0;
      for (let i = 0; i < 5; i++) {
        const y = -130 - ((t * 30 + i * 40) % 200);
        S.push(part(circle(Math.sin(t + i) * 30 + i * 10 - 20, y, 26 + ((t * 30 + i * 40) % 200) * 0.15), '#9aa0a8'));
      }
      S.push(body([[-230, 110], [-50, -110], [50, -110], [230, 110]], '#8a5a3c'), part([[-50, -110], [50, -110], [36, -96], [-36, -96]], '#e0603a'));
      S.push(part(ribbon([[-20, -100], [-40, -40], [-30, 20], [-60, 90]], 22), '#f28a2a'), part(ribbon([[24, -100], [50, -30], [80, 40]], 18), '#f6a23a'));
      if (boom > 0) for (let i = 0; i < 10; i++) S.push(part(circle(Math.cos(i * 0.6 - 2.6) * 120 * boom, -110 + Math.sin(i * 0.6 - 2.6) * 140 * boom + boom * boom * 60, 10 + (i % 3) * 3), i % 2 ? '#f6c531' : '#e4372b'));
      break;
    }
    case 'bonhomme': {
      const wave = Math.sin(t * 3) * 14;
      S.push(line([[-40, -50], [-100, -90 - wave]], '#7a5236', 5), line([[40, -50], [100, -96 + wave]], '#7a5236', 5));
      S.push(body(circle(0, 60, 64), K.white), body(circle(0, -40, 48), K.white), body(circle(0, -118, 38), K.white));
      S.push(part(rrect(-40, -90, 80, 16, 8), '#e4372b'), part(rrect(14, -84, 16, 56, 6), '#e4372b'), body(rrect(-36, -176, 72, 14, 4), '#2b2622'), body(rrect(-24, -228, 48, 54, 6), '#2b2622'), part(rrect(-24, -190, 48, 10, 2), '#e4372b'));
      S.push(...eye(-14, -126, 5, b), ...eye(14, -126, 5, b), part([[-2, -116], [36, -110], [-2, -106]], '#F08A3C'), dot(circle(0, -30, 5, 8), INK), dot(circle(0, -6, 5, 8), INK), dot(circle(0, 40, 5, 8), INK));
      break;
    }
    case 'automne':
      S.push(...tree(0, 110, 1.8, '#e8892d'), part(ellipse(-60, -160, 50, 40), '#d9622b'), part(ellipse(50, -120, 46, 38), '#f2b441'));
      for (let i = 0; i < 7; i++) {
        const y = ((t * 40 + i * 60) % 320) - 160;
        S.push(...objet('feuille', t, i).shapes.map((s) => ({ ...s, pts: move(rotate(s.pts.map(([x, yy]) => [x * 0.5, yy * 0.5] as Pt), t * 2 + i), -160 + i * 54 + Math.sin(t * 2 + i) * 20, y), color: i % 2 ? s.color : s.role === 'body' ? '#d9622b' : s.color })));
      }
      break;
    case 'printemps':
      S.push(...tree(-60, 110, 1.4, '#f7c6d9'), part(ellipse(-100, -110, 40, 30), '#ffe0ec'));
      S.push(body([...arc(70, -60, 40, 0, Math.PI, 14, 22)], '#9a6a3a'), part(ellipse(56, -64, 10, 8), '#cfe6f5'), part(ellipse(80, -64, 10, 8), '#cfe6f5'));
      S.push(...objet('oiseau', t, 4).shapes.map((s) => ({ ...s, pts: move(s.pts, 150, -120 + Math.sin(t * 2) * 10) })));
      for (let i = 0; i < 5; i++) S.push(...flowerAt(-140 + i * 70, 110, ['#F59BBE', '#F2B441', '#B78CF2', '#E4572E', '#6BB8F2'][i], 1.6 + Math.min(1, act) * 0.4));
      break;
    case 'pluie': {
      for (let i = 0; i < 16; i++) {
        const x = -150 + (i % 8) * 42 + (i > 7 ? 20 : 0);
        const y = ((t * 220 + i * 47) % 220) - 30;
        S.push(...objet('goutte', 0, i).shapes.map((s) => ({ ...s, pts: move(s.pts.map(([a, c]) => [a * 0.45, c * 0.45] as Pt), x, y) })));
      }
      S.push(body(move(cloudShape(0, 0, 2.6), 0, -90), '#b9c3cf'), ...eye(-30, -92, 7, b), ...eye(30, -92, 7, b), smile(0, -70, 12));
      S.push(part(ribbon(arc(140, 120, 40, Math.PI, Math.PI * 2, 10), 6), '#e4372b'));
      break;
    }
    case 'montagne':
      S.push(body([[-260, 110], [-120, -80], [20, 110]], '#8f949c'), body([[-120, 110], [40, -150], [200, 110]], '#a3a9b2'), body([[60, 110], [170, -40], [280, 110]], '#8f949c'));
      S.push(part([[40, -150], [74, -102], [56, -92], [40, -104], [22, -90], [6, -102]], K.white), part([[-120, -80], [-96, -48], [-120, -54], [-142, -48]], K.white));
      S.push(...objet('oiseau', t, 5).shapes.map((s) => ({ ...s, pts: move(s.pts.map(([x, y]) => [x * 1.4, y * 1.4] as Pt), -40 + Math.sin(t * 0.6) * 90, -190 + Math.sin(t) * 12), color: s.color === '#6CB6E8' ? '#7a5236' : s.color })));
      break;
    case 'tournesol': {
      const sway = Math.sin(t * 1.2) * 0.06;
      const F: Shape[] = [body(rrect(-7, -40, 14, 160, 7), '#5ea05a'), part(rotate(ellipse(-34, 40, 34, 14), 0.5, -34, 40), '#6fbf6a'), part(rotate(ellipse(34, 70, 34, 14), -0.5, 34, 70), '#6fbf6a')];
      for (let i = 0; i < 16; i++) F.push(part(rotate(ellipse(0, -118, 14, 34), (i * Math.PI) / 8 + t * 0.1, 0, -70), '#F6C531'));
      F.push(body(circle(0, -70, 36), '#7a4a26'), ...eye(-12, -76, 6, b), ...eye(12, -76, 6, b), smile(0, -58, 12));
      for (const s of F) S.push({ ...s, pts: rotate(s.pts, sway, 0, 110) });
      break;
    }

    /* ───────── Espace ───────── */
    case 'lune':
      S.push(body(circle(0, -10, 110), '#efe6c4'), part(circle(-40, -50, 20), '#d8cda6'), part(circle(30, 20, 28), '#d8cda6'), part(circle(50, -60, 12), '#d8cda6'), part(circle(-50, 40, 14), '#d8cda6'));
      S.push(...eye(-26, -14, 8, b), ...eye(26, -14, 8, b), smile(0, 14, 18));
      if (act > 0.2) S.push(...astronautShapes(t, 150, 70, 0.4));
      break;
    case 'soleil':
      for (let i = 0; i < 12; i++) S.push(body(rotate([[0, -112], [16, -150 - Math.sin(t * 3 + i) * 10], [-16, -150 - Math.sin(t * 3 + i) * 10]], (i * Math.PI) / 6 + t * 0.2), '#F6A23A'));
      S.push(body(circle(0, 0, 104), '#FFC93C'), part(circle(-30, -30, 30), '#FFE07A'), ...eye(-34, -14, 9, b), ...eye(34, -14, 9, b), smile(0, 18, 26), part(ellipse(-60, 20, 14, 8), '#F59BBE'), part(ellipse(60, 20, 14, 8), '#F59BBE'));
      break;
    case 'planete':
      S.push(part([...arc(0, 0, 170, Math.PI, Math.PI * 2, 24, 34), ...arc(0, 0, 130, Math.PI * 2, Math.PI, 24, 24)], '#c9a46a'));
      S.push(body(circle(0, 0, 90), '#e8c27a'), part(ellipse(0, -30, 88, 12), '#d4a85a'), part(ellipse(0, 22, 86, 14), '#f2d69a'));
      S.push(body([...arc(0, 0, 170, 0, Math.PI, 24, 34), ...arc(0, 0, 130, Math.PI, 0, 24, 24)], '#d9b77a'));
      S.push(body(circle(-190 + Math.cos(t * 0.5) * 20, -110, 30), '#d9622b'), body(circle(200, -120 + Math.sin(t * 0.6) * 10, 22), '#6b8fc4'));
      break;
    case 'fusee': {
      const up = act > 0.2 ? Math.pow(Math.min(1, act), 2) * 380 : 0;
      for (let i = 0; i < 7; i++) S.push(part(circle(-60 + i * 20 + Math.sin(t * 4 + i) * 6, 110 - up * 0.1, 22 + (i % 3) * 8 + up * 0.04), '#d8dde4'));
      S.push(...objet('fusee', t).shapes.map((s) => ({ ...s, pts: move(s.pts.map(([x, y]) => [x * 2.6, y * 2.6] as Pt), 0, -20 - up) })));
      if (up > 0) S.push(part([[-24, 70 - up], [0, 150 - up + Math.sin(t * 30) * 12], [24, 70 - up]], '#F6A23A'));
      break;
    }
    case 'astronaute':
      S.push(...astronautShapes(t, 0, 0, 1));
      break;
    case 'etoile': {
      const s = 1 + Math.sin(t * 3) * 0.05;
      S.push(body(star(0, 0, 120 * s, 54 * s, Math.sin(t) * 0.1), '#FFC93C'), part(star(0, 0, 60 * s, 30 * s, Math.sin(t) * 0.1), '#FFE07A'), ...eye(-22, -6, 8, b), ...eye(22, -6, 8, b), smile(0, 14, 14));
      for (let i = 0; i < 8; i++) S.push(part(star(Math.cos(i) * 200, Math.sin(i * 1.7) * 120, 12 + 6 * Math.abs(Math.sin(t * 2 + i)), 5, 0), '#FFF4C2'));
      break;
    }
    case 'terre': {
      const r = t * 0.25;
      S.push(body(circle(0, 0, 120), '#3a7bd5'));
      for (const [x, y, w, h] of [[-40, -40, 50, 34], [40, 20, 46, 54], [-60, 50, 30, 22], [70, -60, 26, 18]]) S.push(part(rotate(ellipse(x, y, w, h), 0.4, 0, 0).map(([px, py]) => [px * Math.cos(r * 0.2) + Math.sin(r + px / 40) * 6, py] as Pt), '#57b894'));
      S.push(part(ellipse(-20, -90, 60, 12), K.white), part(ellipse(30, 86, 50, 10), K.white), part(ellipse(80, 0, 26, 8), '#e8f4ff'));
      S.push(...eye(-26, -4, 8, b), ...eye(26, -4, 8, b), smile(0, 22, 18));
      break;
    }
    case 'aurore':
      ['#57e0a0', '#a06bff', '#ff7ab0'].forEach((c, k) => {
        const pts: Pt[] = [];
        for (let x = -300; x <= 300; x += 20) pts.push([x, -140 + k * 36 + Math.sin(x / 70 + t * (0.8 + k * 0.3) + k) * 30]);
        S.push(body(ribbon(pts, 34 - k * 6), c));
      });
      S.push(...pine(-200, 110, 0.9), ...pine(-130, 110, 0.7), ...pine(170, 110, 1));
      break;

    /* ───────── Métiers ───────── */
    case 'camion': {
      const flash = Math.floor(t * 4) % 2;
      S.push(body(rrect(-170, -60, 230, 110, 12), '#e4372b'), body([[60, -60], [130, -60], [170, 0], [170, 50], [60, 50]], '#e4372b'), part([[74, -48], [124, -48], [150, -6], [74, -6]], '#DDF0FF'));
      S.push(body(rrect(-170, -86, 220, 14, 4), '#c9ced6'));
      for (let i = 0; i < 8; i++) S.push(line([[-160 + i * 28, -86], [-160 + i * 28, -72]], '#8e96a3', 4));
      S.push(part(rrect(-150, -40, 60, 44, 6), '#c4251f'), part(circle(-10, -10, 26), '#f2b441'), part(rrect(100, -76, 30, 14, 6), flash ? '#4a90d9' : '#e4372b'));
      for (const x of [-120, 110]) S.push(body(circle(x, 54, 32), '#2b2622'), dot(circle(x, 54, 12, 10), '#c9ced6'));
      if (act > 0.2) for (let i = 0; i < 12; i++) S.push(dot(circle(-170 - i * 18, -80 - Math.sin(i / 3) * 40 + i * 6, 6, 8), '#6BB8F2'));
      break;
    }
    case 'docteur':
      S.push(body(rrect(-120, -50, 240, 150, 24), '#c94a4a'), body(rrect(-60, -84, 120, 44, 16), '#a83a3a'), part(rrect(-48, -74, 96, 26, 12), '#c94a4a'));
      S.push(part(rrect(-18, -10, 36, 96, 6), K.white), part(rrect(-48, 20, 96, 36, 6), K.white));
      S.push(line([...quad([-160, -120], [-200, 40], [-130, 80], 10)], '#4a4f5a', 6), line([...quad([-100, -120], [-80, 0], [-130, 80], 10)], '#4a4f5a', 6), body(circle(-130, 90, 18), '#c9ced6'));
      S.push(...objet('coeur', t).shapes.map((s) => ({ ...s, pts: move(s.pts.map(([x, y]) => [x * (1 + 0.1 * Math.abs(Math.sin(t * 5))), y * (1 + 0.1 * Math.abs(Math.sin(t * 5)))] as Pt), 160, -100) })));
      break;
    case 'tracteur': {
      const roll = t * 3;
      S.push(body(rrect(-60, -40, 170, 70, 10), '#4f9a3e'), body(rrect(-80, -130, 100, 100, 8), '#4f9a3e'), part(rrect(-68, -118, 76, 60, 6), '#DDF0FF'), body(rrect(80, -100, 14, 60, 4), '#4a4f5a'));
      for (let i = 0; i < 3; i++) S.push(part(circle(96 + i * 8, -114 - ((t * 40 + i * 20) % 60), 8 + i * 3), '#c9ced6'));
      S.push(body(circle(-60, 40, 70), '#2b2622'), dot(circle(-60, 40, 30, 12), '#f2b441'), body(circle(100, 60, 44), '#2b2622'), dot(circle(100, 60, 18, 10), '#f2b441'));
      for (let i = 0; i < 6; i++) S.push(line(rotate([[-60, 0], [-60, -24]], roll + (i * Math.PI) / 3, -60, 40), '#c9a03a', 4));
      break;
    }
    case 'pain':
      for (let i = 0; i < 3; i++) {
        S.push(body(rotate(ellipse(-60 + i * 30, 0 + i * 20, 150, 26), -0.5 + i * 0.15, -60 + i * 30, i * 20), '#d9a05a'));
        for (let k = -2; k <= 2; k++) S.push(line(rotate([[-60 + i * 30 + k * 40 - 10, i * 20 - 8], [-60 + i * 30 + k * 40 + 10, i * 20 + 8]], -0.5 + i * 0.15, -60 + i * 30, i * 20), '#a8702a', 4));
      }
      S.push(body([...arc(140, 60, 60, Math.PI * 1.1, Math.PI * 1.9, 14), ...arc(140, 60, 26, Math.PI * 1.9, Math.PI * 1.1, 10)], '#e8a84a'));
      for (let i = 0; i < 4; i++) S.push(part(circle(-120 + i * 70 + Math.sin(t * 2 + i) * 6, -110 - ((t * 20 + i * 30) % 60), 10), '#f4f0e8'));
      break;
    case 'livres':
      S.push(body(rrect(-200, -170, 400, 230, 14), '#7a5236'), part(rrect(-186, -156, 372, 202, 8), '#2f5a46'));
      S.push(line([[-150, -60], [-120, -112], [-90, -60]], K.white, 5), line([[-136, -80], [-104, -80]], K.white, 4), line(arc(-40, -86, 24, Math.PI * 0.25, Math.PI * 1.75, 12), K.white, 5), line([[40, -110], [40, -60], [70, -60]], K.white, 5));
      ['#e4372b', '#4a90d9', '#f2b441', '#57b894'].forEach((c, i) => S.push(body(rrect(-140 + i * 6, 60 + i * -22 + 20, 180 - i * 12, 24, 4), c)));
      S.push(...objet('pomme', t).shapes.map((s) => ({ ...s, pts: move(s.pts.map(([x, y]) => [x * 1.4, y * 1.4] as Pt), 110, 54) })));
      break;
    case 'bus':
      S.push(body(rrect(-210, -90, 420, 150, 22), '#F6C531'), part(rrect(-210, 10, 420, 14, 4), '#2b2622'));
      for (let i = 0; i < 5; i++) S.push(part(rrect(-190 + i * 70, -70, 54, 50, 8), '#DDF0FF'));
      S.push(part(rrect(160, -70, 36, 110, 6), '#DDF0FF'));
      for (let i = 0; i < 3; i++) S.push(part(circle(-160 + i * 140, -46, 12), [K.skin, '#c48a5a', K.skin][i]));
      for (const x of [-130, 130]) S.push(body(circle(x, 66, 34), '#2b2622'), dot(circle(x, 66, 12, 10), '#c9ced6'));
      S.push(part(rrect(-250, -50, 30, 30, 8), '#e4372b'));
      break;
    case 'microscope':
      S.push(body(rrect(-90, 80, 180, 30, 10), '#4a4f5a'), body(ribbon([[40, 90], [90, 20], [60, -60]], 26), '#6b7280'));
      S.push(body(rotate(rrect(-20, -150, 40, 120, 10), 0.35, 0, -90), '#c9ced6'), body(rrect(-60, 20, 100, 14, 4), '#4a4f5a'), part(rotate(rrect(-26, -160, 52, 20, 6), 0.35, 0, -90), '#2b2622'));
      S.push(body([[150, 110], [200, 110], [190, 20], [190, -30], [160, -30], [160, 20]], '#cfeaff'), part([[150, 110], [200, 110], [194, 50], [156, 50]], '#57e0a0'));
      for (let i = 0; i < 4; i++) S.push(part(circle(170 + (i % 2) * 14, 40 - ((t * 30 + i * 20) % 80), 6), K.white));
      break;

    /* ───────── Mon corps ───────── */
    case 'dent': {
      const shine = act > 0.2 ? Math.sin(t * 8) : 0;
      S.push(body([...quad([-80, -60], [-90, -130], [-30, -120], 10), ...quad([-30, -120], [0, -100], [30, -120], 6).slice(1), ...quad([30, -120], [90, -130], [80, -60], 10).slice(1), ...quad([80, -60], [70, 40], [50, 110], 10).slice(1), ...quad([50, 110], [20, 110], [10, 40], 8).slice(1), ...quad([-10, 40], [-20, 110], [-50, 110], 8).slice(1), ...quad([-50, 110], [-70, 40], [-80, -60], 10).slice(1)], '#ffffff'));
      S.push(...eye(-28, -50, 9, b), ...eye(28, -50, 9, b), smile(0, -14, 22), part(ellipse(-52, -16, 12, 7), '#F59BBE'), part(ellipse(52, -16, 12, 7), '#F59BBE'));
      if (shine > 0) S.push(part(star(70, -110, 20, 6), '#FFE07A'));
      S.push(...objet('brosse', t).shapes.map((s) => ({ ...s, pts: move(rotate(s.pts.map(([x, y]) => [x * 1.8, y * 1.8] as Pt), act > 0.2 ? Math.sin(t * 10) * 0.3 : 0), 160, -20) })));
      break;
    }
    case 'coeur': {
      const beat = 1 + 0.12 * Math.pow(Math.abs(Math.sin(t * (act > 0.2 ? 6 : 3))), 6);
      S.push(...objet('coeur', t).shapes.map((s) => ({ ...s, pts: s.pts.map(([x, y]) => [x * 4.4 * beat, y * 4.4 * beat] as Pt) })), ...eye(-30, -20, 9, b), ...eye(30, -20, 9, b), smile(0, 8, 18));
      break;
    }
    case 'fruits':
      S.push(body([...arc(0, 20, 170, 0, Math.PI, 20, 90)], '#c98d5a'), part(rrect(-170, 14, 340, 16, 8), '#a8703a'));
      S.push(...objet('pomme', t).shapes.map((s) => ({ ...s, pts: move(s.pts.map(([x, y]) => [x * 2, y * 2] as Pt), -80, -20) })));
      S.push(body([...arc(40, -80, 70, 0.3, Math.PI - 0.3, 14), ...arc(40, -110, 70, Math.PI - 0.5, 0.5, 14)], '#F6D44A'));
      S.push(...objet('carotte', t).shapes.map((s) => ({ ...s, pts: move(rotate(s.pts.map(([x, y]) => [x * 1.8, y * 1.8] as Pt), 0.9), 110, -10) })));
      S.push(body(circle(0, -10, 40), '#f39a3a'), part(circle(-12, -22, 8), '#ffc48a'));
      break;
    case 'dodo':
      S.push(body(rrect(-200, 0, 400, 90, 20), '#b8d3f0'), body(rrect(-220, -80, 30, 190, 10), '#d6bb9a'), body(rrect(190, -30, 30, 140, 10), '#d6bb9a'));
      S.push(part(ellipse(-130, -4, 60, 28), K.white), body(circle(-120, -26, 38), K.skin), part([...arc(-120, -26, 40, Math.PI, Math.PI * 2, 12)], K.hair), line([[-136, -26], [-124, -26]], INK, 3), line([[-112, -26], [-100, -26]], INK, 3));
      S.push(body(rrect(-90, -20, 280, 70, 30), '#f2b441'), part(rrect(-90, -20, 280, 20, 10), '#f7c6d9'));
      for (let i = 0; i < 3; i++) {
        const k = (t * 0.6 + i / 3) % 1;
        const x = -80 + k * 80 + i * 10,
          y = -80 - k * 120,
          s = 10 + k * 14;
        S.push(line([[x - s, y - s], [x + s, y - s], [x - s, y + s], [x + s, y + s]], '#6b8fc4', 4));
      }
      break;
    case 'bouger':
      break;

    /* ───────── Le monde ───────── */
    case 'eiffel':
      S.push(body([[-150, 110], [-24, -150], [24, -150], [150, 110], [100, 110], [0, -40], [-100, 110]], '#8a6a4a'));
      S.push(body(rrect(-110, 0, 220, 18, 4), '#7a5a3a'), body(rrect(-60, -90, 120, 14, 4), '#7a5a3a'), body([[-14, -150], [0, -250], [14, -150]], '#8a6a4a'), line([[0, -250], [0, -276]], '#7a5a3a', 4));
      for (let i = 0; i < 6; i++) S.push(line([[-130 + i * 10, 110 - i * 20], [-40 + i * 6, 10 - i * 18]], '#6b4a2a', 2), line([[130 - i * 10, 110 - i * 20], [40 - i * 6, 10 - i * 18]], '#6b4a2a', 2));
      S.push(part([...arc(0, 110, 60, Math.PI, Math.PI * 2, 14, 70)], '#a8d5f0'));
      break;
    case 'chameau': {
      const step = Math.sin(t * 2.4) * 8;
      S.push(leg(-80 + step, 10, 18, 100, '#9a6a32'), leg(60 - step, 10, 18, 100, '#9a6a32'), body(ellipse(-10, 0, 110, 50), '#b8803e'));
      S.push(body([...arc(-50, -30, 40, Math.PI, Math.PI * 2, 12)], '#b8803e'), body([...arc(30, -30, 40, Math.PI, Math.PI * 2, 12)], '#b8803e'));
      S.push(leg(-50 - step, 20, 18, 90, '#b8803e'), leg(90 + step, 20, 18, 90, '#b8803e'), body(ribbon([[90, 0], [130, -60], [150, -110]], 28), '#b8803e'));
      S.push(body(ellipse(170, -116, 36, 20), '#b8803e'), ...eye(170, -124, 5, b), line([[-120, 0], [-136, 40]], '#a8783a', 4), part(rrect(-60, -76, 80, 18, 6), '#c94a4a'));
      break;
    }
    case 'palmier': {
      const sw = Math.sin(t * 1.4) * 0.08;
      S.push(body(ribbon([[0, 110], [10, 0], [-20, -130]], 28), '#a8703a'));
      for (let i = 0; i < 6; i++) S.push(part(rotate(ribbon(quad([-20, -130], [-20 + Math.cos(i) * 80, -190], [-20 + Math.cos(i * 1.05) * 150, -110 + Math.sin(i) * 20], 10), 26), sw * (i % 2 ? 1 : -1), -20, -130), i % 2 ? '#4f9a3e' : '#6cbf4a'));
      S.push(part(circle(-34, -124, 14), '#7a5236'), part(circle(-8, -118, 14), '#7a5236'));
      // Perroquet.
      S.push(body(ellipse(110, -20, 26, 40), '#e4372b'), body(circle(118, -62, 20), '#e4372b'), part([[132, -64], [150, -56], [134, -50]], '#f2b441'), ...eye(122, -66, 5, b), part(ellipse(100, 10, 14, 30, 0.3), '#4a90d9'), part([[100, 20], [92, 70], [110, 30]], '#f2b441'));
      break;
    }
    case 'ours':
      S.push(body([[-220, 110], [-200, 50], [200, 40], [230, 110]], '#e8f4ff'), part([[-200, 50], [200, 40], [190, 58], [-190, 66]], '#cfe6f5'));
      S.push(leg(-70, 10, 34, 50, '#f4f0e8'), leg(50, 10, 34, 50, '#f4f0e8'), body(ellipse(-10, -20, 100, 54), '#f8f6f0'), leg(-40, 14, 34, 46, '#f8f6f0'), leg(70, 14, 34, 46, '#f8f6f0'));
      S.push(body(ellipse(110, -50, 46, 36), '#f8f6f0'), part(circle(84, -82, 12), '#f8f6f0'), ...eye(112, -60, 5, b), dot(circle(150, -50, 7, 8), INK), smile(136, -36, 8));
      break;
    case 'chateau': {
      const flag = Math.sin(t * 4) * 6;
      S.push(body(rrect(-150, -60, 300, 170, 4), '#c9b8a0'));
      for (let i = 0; i < 6; i++) S.push(body(rrect(-150 + i * 54, -80, 30, 24, 2), '#c9b8a0'));
      for (const x of [-190, 150]) S.push(body(rrect(x, -130, 40, 240, 4), '#b8a78f'), body([[x - 10, -130], [x + 20, -200], [x + 50, -130]], '#4a7bb7'), line([[x + 20, -200], [x + 20, -240]], INK, 3), part([[x + 20, -240], [x + 50, -232 + flag], [x + 20, -222]], '#e4372b'));
      S.push(body([...arc(0, 40, 40, Math.PI, Math.PI * 2, 12), [40, 110], [-40, 110]], '#7a5236'), part(rrect(-90, -30, 26, 36, 12), '#2d3a6e'), part(rrect(64, -30, 26, 36, 12), '#2d3a6e'));
      break;
    }
  }
  return fig(S, 300 + name.length * 13);
}

function astronautShapes(t: number, x: number, y: number, s: number): Shape[] {
  const R = Math.sin(t * 0.8) * 0.2;
  const S: Shape[] = [
    body(rrect(-60, -10, 120, 120, 30), '#f4f4f4'),
    part(rrect(-70, 0, 20, 70, 10), '#c9ced6'),
    body(ribbon([[-56, 10], [-100, 50 + Math.sin(t * 2) * 10]], 30), '#f4f4f4'),
    body(ribbon([[56, 10], [100, -30 + Math.sin(t * 2 + 1) * 10]], 30), '#f4f4f4'),
    body(ribbon([[-30, 100], [-40, 160]], 34), '#f4f4f4'),
    body(ribbon([[30, 100], [40, 160]], 34), '#f4f4f4'),
    part(rrect(-30, 30, 60, 30, 6), '#4a90d9'),
    body(circle(0, -60, 60), '#f4f4f4'),
    part(ellipse(0, -58, 44, 36), '#2d3a6e'),
    part(ellipse(-14, -70, 12, 8), '#8fb3e8')
  ];
  return S.map((sh) => ({ ...sh, pts: move(rotate(sh.pts.map(([a, b]) => [a * s, b * s] as Pt), R), x, y) }));
}

/* ───────────── Décors des vidéos ───────────── */

export type VideoDecor = Decor | 'savane' | 'espace' | 'ocean' | 'desert' | 'montagnes' | 'ferme' | 'ecole' | 'banquise' | 'ciel';

const W = 960;
const ground = (S: Shape[], color: string, y = GROUND) => S.push(sky([[-20, y], [W + 20, y], [W + 20, 760], [-20, 760]], color));
const skyFill = (S: Shape[], color: string, y = GROUND) => S.push(sky([[-20, -20], [W + 20, -20], [W + 20, y], [-20, y]], color));

export function videoDecor(name: VideoDecor, t = 0): Figure {
  if (['chambre', 'jardin', 'plage', 'nuit', 'neige', 'foret', 'cuisine', 'ville'].includes(name)) return libDecor(name as Decor, t);
  const S: Shape[] = [];
  const clouds = (c = K.white) => S.push(part(move(cloudShape(0, 0, 0.7), 200 + ((t * 10) % 1100) - 200, 90), c), part(move(cloudShape(0, 0, 0.5), 640 + ((t * 6) % 1100) - 400, 140), c));
  switch (name) {
    case 'savane':
      skyFill(S, '#f8d9a0');
      S.push(body(circle(780, 120, 50), '#f6a23a'));
      S.push(sky([...quad([-20, 360], [480, 300], [W + 20, 350], 20), [W + 20, 760], [-20, 760]], '#e8c26a'));
      ground(S, '#d9b25a', 420);
      S.push(body(rrect(130, 220, 16, 180, 6), '#7a5236'), body(ellipse(138, 214, 110, 30), '#7a9a3a'), body(ellipse(100, 230, 60, 18), '#6b8a32'));
      for (let i = 0; i < 18; i++) S.push(line([[30 + i * 55, 440], [36 + i * 55, 420]], '#b8902e', 3));
      break;
    case 'espace':
      skyFill(S, '#141a3a', 600);
      for (let i = 0; i < 60; i++) {
        const tw = 0.5 + 0.5 * Math.abs(Math.sin(t * (0.6 + (i % 5) * 0.3) + i));
        S.push(dot(circle((i * 157) % 960, (i * 89) % 540, (1 + (i % 3)) * tw, 6), '#fff4c2'));
      }
      S.push(part(circle(120, 430, 70), '#6b5aa8'), part(ellipse(120, 430, 110, 14), '#9a8ad8'), part(circle(860, 90, 26), '#d9622b'));
      break;
    case 'ocean':
      skyFill(S, '#2f7fb8', 600);
      S.push(sky([[-20, -20], [W + 20, -20], [W + 20, 140], [-20, 140]], '#5ab0e0'));
      for (let i = 0; i < 6; i++) S.push(part(ellipse(80 + i * 170, 60 + Math.sin(t + i) * 10, 70, 6), '#8fd0f5'));
      S.push(sky([...quad([-20, 450], [480, 410], [W + 20, 455], 20), [W + 20, 760], [-20, 760]], '#f3dfab'));
      for (const x of [80, 160, 820, 880]) S.push(body(ribbon([[x, 470], [x + Math.sin(t * 1.5 + x) * 14, 400], [x - Math.sin(t * 1.5 + x) * 10, 330]], 16), '#3f9a5a'));
      for (let i = 0; i < 8; i++) S.push(part(circle(300 + i * 60, 520 - ((t * 40 + i * 70) % 500), 6 + (i % 3) * 2), '#cfeaff'));
      break;
    case 'desert':
      skyFill(S, '#fbe3b0');
      S.push(body(circle(160, 110, 54), '#f6c531'));
      S.push(sky([...quad([-20, 330], [250, 250], [520, 340], 16), ...quad([520, 340], [760, 270], [W + 20, 320], 16).slice(1), [W + 20, 760], [-20, 760]], '#e8b46a'));
      ground(S, '#f0c47a', 420);
      S.push(body(rrect(830, 330, 24, 90, 12), '#4f9a3e'), body(rrect(800, 350, 20, 40, 10), '#4f9a3e'), body(rrect(862, 340, 20, 36, 10), '#4f9a3e'));
      break;
    case 'montagnes':
      skyFill(S, '#cfe6f5');
      clouds();
      S.push(sky([[-20, 360], [180, 160], [380, 360]], '#a3b4c8'), sky([[600, 360], [800, 140], [W + 20, 360]], '#a3b4c8'));
      S.push(sky([...quad([-20, 380], [480, 330], [W + 20, 385], 20), [W + 20, 760], [-20, 760]], '#9fd38c'));
      ground(S, '#8cc47a', 430);
      break;
    case 'ferme':
      skyFill(S, '#bfe3f7');
      clouds();
      S.push(body(rrect(700, 220, 180, 160, 8), '#c94a3a'), body([[690, 220], [790, 150], [890, 220]], '#a83a2a'), part(rrect(760, 300, 60, 80, 6), '#f4e6c4'), line([[760, 300], [820, 380]], '#a83a2a', 5), line([[820, 300], [760, 380]], '#a83a2a', 5));
      ground(S, '#a8d98a', 380);
      for (let i = 0; i < 7; i++) S.push(line([[-20, 410 + i * 22], [W + 20, 400 + i * 24]], '#8cc46a', 6));
      break;
    case 'ecole':
      skyFill(S, '#fdf3e6');
      ground(S, '#e8d2b0', 420);
      S.push(body(rrect(60, 60, 140, 110, 8), K.white), part(rrect(70, 70, 120, 90, 4), '#bfe3f7'), body(rrect(760, 70, 120, 120, 60), '#ffffff'), line([[820, 130], [820, 92]], INK, 4), line([[820, 130], [846, 140]], INK, 4));
      for (let i = 0; i < 6; i++) S.push(part(rrect(260 + i * 74, 60, 50, 50, 4), ['#e4372b', '#f2b441', '#57b894', '#4a90d9', '#b78cf2', '#f59bbe'][i]));
      break;
    case 'banquise':
      skyFill(S, '#d8ecf8', 330);
      S.push(sky([[-20, 330], [W + 20, 330], [W + 20, 760], [-20, 760]], '#3a7bb8'));
      for (let i = 0; i < 4; i++) S.push(body([[i * 260 - 40 + Math.sin(t * 0.5 + i) * 6, 350 + i * 20], [i * 260 + 160, 345 + i * 20], [i * 260 + 140, 380 + i * 20], [i * 260 - 20, 384 + i * 20]], '#f4f9ff'));
      S.push(body([[700, 330], [760, 200], [820, 230], [860, 330]], '#e8f4ff'), part([[760, 200], [790, 260], [820, 230]], '#cfe6f5'));
      break;
    case 'ciel':
      skyFill(S, '#bfe3f7', 600);
      clouds();
      S.push(sky([...quad([-20, 470], [480, 430], [W + 20, 470], 20), [W + 20, 760], [-20, 760]], '#a8d98a'));
      break;
  }
  return fig(S, 700 + name.length * 29, 'back');
}
