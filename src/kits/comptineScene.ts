/**
 * Les comptines, rendues avec les kits de style.
 * Même mise en scène que l'animation d'origine (src/comptines/stage.ts) : titre, Nino et Nina qui entrent,
 * un geste par ligne chantée, les objets de la ligne qui surgissent, la ronde du cri final, « Bravo ! ».
 * Le temps vient de la bande-son, donc l'image reste calée sur le chant.
 * Nouveau : l'enfant peut attraper les objets en les touchant pendant la chanson (ils éclatent en étoiles).
 */
import { COMPTINES, type Comptine, type Geste } from '../data/comptines';
import type { ComptineTiming } from '../comptines/stage';
import { H, W, clamp, easeInOut, easeOut, lerp } from '../films/engine';
import { place, type Figure } from './geom';
import { FEET, cat, decor, kid, objet, type KidPose } from './library';
import type { Material } from './materials';
import { materialFor, styleAt, styleForKey, type StyleId } from './styles';

/**
 * Chaque comptine a son propre style parmi les 66 (dans l'ordre de la liste : deux comptines voisines
 * ne se ressemblent jamais). Une comptine qui n'est pas dans la liste prend un style tiré de son id.
 */
export function styleForComptine(c: Comptine): StyleId {
  const i = COMPTINES.findIndex((x) => x.id === c.id);
  return i >= 0 ? styleAt(i) : styleForKey(c.id);
}

const backOut = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : 1 + 2.7 * (u - 1) ** 3 + 1.7 * (u - 1) ** 2);
const seg = (t: number, a: number, b: number, f: (u: number) => number = (u) => u) => f(clamp((t - a) / (b - a)));

function seeded(id: string) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return (n: number) => {
    let x = Math.imul(h ^ (h >>> 15), 2246822507) ^ n;
    x = Math.imul(x ^ (x >>> 13), 3266489909);
    return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
  };
}

const blinkAt = (t: number, every: number, phase: number) => {
  const m = (t + phase) % every;
  return m < 0.16 ? 1 - Math.abs((m - 0.08) / 0.08) : 0;
};

type Pose = KidPose & { jump?: number; spin?: number; zzz?: boolean };

/** Le geste d'une ligne, à l'intensité k (même chorégraphie que l'animation d'origine). */
function gesture(g: Geste, t: number, k: number, side: 1 | -1): Pose {
  const w = Math.sin(t * Math.PI * 2 * 1.6);
  switch (g) {
    case 'tape':
      return { armL: k * (42 + w * 16), armR: -k * (42 + w * 16), tilt: -2 * side * k };
    case 'coucou':
      return side > 0 ? { armR: -k * (150 + Math.sin(t * 11) * 18), armL: 6, tilt: -4 * k } : { armL: k * (150 + Math.sin(t * 11) * 18), armR: -6, tilt: 4 * k };
    case 'bras':
      return { armL: k * (165 + w * 6), armR: -k * (165 + w * 6), scaleY: 1 + 0.03 * k };
    case 'saute': {
      const p = (((t * 1.25) % 1) + 1) % 1;
      return { jump: k * 46 * Math.abs(Math.sin(p * Math.PI)), armL: k * 40, armR: -k * 40, scaleY: 1 - 0.04 * k * (1 - Math.abs(Math.sin(p * Math.PI))) };
    }
    case 'balance':
      return { tilt: k * 10 * Math.sin(t * 3.4), armL: k * (24 + 10 * Math.sin(t * 3.4)), armR: -k * (24 - 10 * Math.sin(t * 3.4)), look: 6 * Math.sin(t * 3.4) };
    case 'montre':
      return side > 0 ? { armR: -k * (96 + Math.sin(t * 5) * 6), look: 10 * k, tilt: -3 * k } : { armL: k * (96 + Math.sin(t * 5) * 6), look: -10 * k, tilt: 3 * k };
    case 'tourne':
      return { spin: k, armL: k * 60, armR: -k * 60 };
    case 'marche':
      return { walk: k, armL: k * 18 * Math.sin(t * 9), armR: k * 18 * Math.sin(t * 9 + Math.PI), tilt: k * 2 * Math.sin(t * 9) };
    case 'etire':
      return { armL: k * (172 + Math.sin(t * 2) * 6), armR: -k * (172 + Math.sin(t * 2) * 6), scaleY: 1 + 0.06 * k * (0.5 + 0.5 * Math.sin(t * 2)), tilt: k * 4 * Math.sin(t * 1.4) };
    case 'dort':
      return { tilt: k * 12 * side, blink: k > 0.5 ? 1 : 0, armL: k * 8, armR: -k * 8, mouth: 'smile', zzz: k > 0.5 };
  }
}

const singing = (t: number, timing: ComptineTiming) => timing.lines.some(([s, e]) => t > s - 0.15 && t < e + 0.15) && Math.sin(t * 15.1) * Math.sin(t * 7.3) > 0.05;

/** Caméra : un plan par ligne (même découpage que la vidéo). Repère de scène 960 × 540. */
function camera(timing: ComptineTiming, t: number) {
  const shots = [
    { x: 480, y: 352, s: 1.0 },
    { x: 420, y: 360, s: 1.1 },
    { x: 540, y: 360, s: 1.1 },
    { x: 480, y: 375, s: 1.18 },
    { x: 480, y: 352, s: 1.04 },
    { x: 480, y: 352, s: 1.0 }
  ];
  const cuts = [0, ...timing.lines.map(([s]) => s - 0.2)];
  let idx = 0;
  for (let i = 0; i < cuts.length; i++) if (t >= cuts[i]) idx = i;
  const cur = shots[Math.min(idx, shots.length - 1)];
  const prev = shots[Math.max(0, Math.min(idx - 1, shots.length - 1))];
  const p = idx > 0 ? easeInOut(clamp((t - cuts[idx]) / 0.8)) : 1;
  return { s: lerp(prev.s, cur.s, p), x: lerp(prev.x, cur.x, p), y: lerp(prev.y, cur.y, p) };
}

interface Live {
  key: string;
  x: number;
  y: number;
  r: number;
}

export interface ComptineScene {
  material: Material;
  style: StyleId;
  /** Dessine l'instant t (s) sur ctx, mis à l'échelle W × H. */
  render(ctx: CanvasRenderingContext2D, t: number, still?: boolean): void;
  /** Toucher en coordonnées de scène : vrai si un objet a été attrapé. */
  tap(x: number, y: number, t: number): boolean;
  collected(): number;
  dispose(): void;
}

export function createComptineScene(c: Comptine, timing: ComptineTiming, style: StyleId = styleForComptine(c)): ComptineScene {
  const mat = materialFor(style);
  const rand = seeded(c.id);
  const ninoLeft = rand(3) > 0.5;
  const ninoX = ninoLeft ? 322 : 495;
  const ninaX = ninoLeft ? 495 : 322;
  const milaX = rand(4) > 0.5 ? 660 : 165;
  const caught = new Map<string, number>();
  let live: Live[] = [];
  const [fs, fe] = timing.lines[4];

  const kidAt = (girl: boolean, t: number, homeX: number, enterFrom: number) => {
    const enter = clamp((t - 0.5) / 2);
    const x = t < 2.5 ? lerp(enterFrom, homeX, easeOut(enter)) : homeX;
    const walking = t > 0.5 && t < 2.5 ? 1 : 0;
    const side: 1 | -1 = homeX > 480 ? 1 : -1;
    let pose: Pose = { armL: 4, armR: -4, tilt: 0, mouth: 'smile', look: 0 };
    timing.lines.slice(0, 4).forEach(([s, e], i) => {
      const k = seg(t, s - 0.35, s + 0.15) * (1 - seg(t, e + 0.25, e + 0.7));
      if (k > 0.001) pose = { ...pose, ...gesture(c.gestes[i], t, k, side) };
    });
    if (t > fs - 0.3) {
      const k = seg(t, fs - 0.3, fs + 0.1);
      const hop = Math.abs(Math.sin(((t - fs) * 1.4 + (girl ? 0.3 : 0)) * Math.PI)) * 22 * k;
      pose = { ...pose, ...gesture('tape', t, k, side), jump: hop, mouth: 'open', blink: 0, zzz: false, spin: 0, walk: 0 };
    }
    if (singing(t, timing) && !pose.zzz) pose.mouth = 'open';
    pose.blink = Math.max(pose.blink ?? 0, blinkAt(t, 3.7 + rand(girl ? 2 : 1) * 1.5, girl ? 1.9 : 0.4));
    pose.walk = walking || pose.walk || 0;
    pose.t = t + (girl ? 0.7 : 0);
    const spin = pose.spin ? Math.cos(t * 4.2) : 1;
    const sx = pose.spin ? Math.sign(spin || 1) * Math.max(0.18, Math.abs(spin)) : 1;
    return { x, y: FEET - (pose.jump ?? 0) * 0.75, pose, sx, zzz: !!pose.zzz, side };
  };

  // Les matières dessinées « sur les deux » (crayon, cartoon, briques) ne changent d'image que 12 fois par seconde :
  // entre deux dessins, on réaffiche le tampon au lieu de tout recomposer (c'est aussi ce qui donne le style).
  let lastStep = -1,
    lastCaught = -1;
  return {
    material: mat,
    style,
    render(ctx, tReal, still) {
      let t = tReal;
      if (mat.fps > 0 && !still) {
        const step = Math.floor(tReal * mat.fps);
        if (step === lastStep && caught.size === lastCaught) {
          mat.present(ctx);
          return;
        }
        lastStep = step;
        lastCaught = caught.size;
        t = step / mat.fps;
      }
      const cam = camera(timing, t);
      const view = (x: number, y: number) => ({ x: 480 + (x - cam.x) * cam.s, y: 270 + (y - cam.y) * cam.s });
      const put = (fig: Figure, x: number, y: number, s: number, rot = 0, sx = 1) => {
        const p = view(x, y);
        return place(fig, { x: p.x, y: p.y, s: s * cam.s, rot, sx });
      };
      mat.begin({ t, still });
      mat.draw(place(decor(c.decor, t), { x: 480 - cam.x * cam.s, y: 270 - cam.y * cam.s, s: cam.s }));

      // Mila se balance, puis saute de joie au cri final.
      let jump = 0,
        tilt = Math.sin(t * 2.4) * 3,
        tail = 0;
      if (t > fs) {
        const p = ((t - fs) % 1.1) / 1.1;
        jump = 30 * Math.abs(Math.sin(p * Math.PI));
        tail = Math.sin(t * 8) * 6;
        tilt = Math.sin(t * 8) * 4;
      }
      mat.draw(put(cat({ t, tail, tilt, blink: blinkAt(t, 4.3, 2.2), look: Math.sin(t * 0.7) * 10 }), milaX, 493 - jump * 0.75, 0.71));

      const a = kidAt(false, t, ninoX, ninoLeft ? -90 : 1050);
      const b = kidAt(true, t, ninaX, ninoLeft ? 1050 : -90);
      for (const k of [a, b]) {
        mat.draw(put(kid(k === b, k.pose, 3), k.x, k.y, 0.75, 0, k.sx));
        if (k.zzz)
          [0, 1, 2].forEach((i) => {
            const p = (((t * 0.6 + i / 3) % 1) + 1) % 1;
            mat.draw(put(objet('note', t, 2), k.x + k.side * (30 + p * 38), k.y - 210 - p * 60, 0.25 + i * 0.05));
          });
      }

      // Les objets de chaque ligne : 3 exemplaires qui surgissent et flottent ; on peut les attraper.
      live = [];
      const spots = [
        [165, 225],
        [480, 172],
        [795, 225],
        [300, 278],
        [660, 278]
      ];
      const bob = (amp: number, sp: number, ph: number) => Math.sin(t * sp + ph) * amp;
      const drawObj = (key: string, name: Comptine['objets'][number], x: number, y: number, s: number, rot: number, p: number) => {
        const got = caught.get(key);
        if (got !== undefined) {
          // Attrapé : il gonfle, s'efface, et laisse une gerbe d'étoiles.
          const u = clamp((t - got) / 0.5);
          if (u < 1) {
            mat.draw(put(objet(name, t, key.length), x, y, s * (1 + u * 0.5), rot), { reveal: 1 - u });
            for (let i = 0; i < 6; i++) {
              const ang = (i / 6) * Math.PI * 2;
              mat.draw(put(objet('etoile', t, i), x + Math.cos(ang) * 70 * easeOut(u), y + Math.sin(ang) * 70 * easeOut(u), 0.35 * (1 - u)));
            }
          }
          return;
        }
        mat.draw(put(objet(name, t, key.length), x, y, s, rot), { reveal: p });
        const v = view(x, y);
        live.push({ key, x: v.x, y: v.y, r: 46 * s * cam.s + 16 });
      };
      for (let i = 0; i < 4; i++) {
        const [s0] = timing.lines[i];
        const name = c.objets[i % c.objets.length];
        const next = i < 3 ? timing.lines[i + 1][0] : fs;
        for (let k = 0; k < 3; k++) {
          const appear = s0 + k * 0.3;
          const pIn = seg(t, appear, appear + 0.45, backOut);
          const pOut = 1 - seg(t, next - 0.2, next + 0.25, easeInOut);
          const p = pIn * pOut;
          if (p <= 0.01) continue;
          const [sx, sy] = spots[(i * 2 + k) % spots.length];
          const x = sx + bob(7, 1.3, i + k) + (rand(i * 10 + k) - 0.5) * 45;
          const y = sy + bob(9, 1.9, k * 2.1 + i);
          drawObj(`${i}-${k}`, name, x, y, 0.86 * Math.max(0.5, p), (Math.sin(t * 2 + k) * 10 * Math.PI) / 180, clamp(pIn * 1.2));
        }
      }
      if (t > fs - 0.2) {
        const p = seg(t, fs - 0.2, fs + 0.5, backOut);
        for (let k = 0; k < 8; k++) {
          const ang = (k / 8) * Math.PI * 2 + (t - fs) * 0.9;
          drawObj(`f-${k}`, c.objets[k % c.objets.length], 480 + Math.cos(ang) * 352, 225 + Math.sin(ang) * 112, 0.71 * Math.max(0.4, p), (Math.sin(t * 3 + k) * 14 * Math.PI) / 180, clamp(p));
        }
      }
      mat.end();

      // Textes : titre, ligne chantée, compteur, carte de fin.
      const titleK = seg(t, 0.2, 0.75) * (1 - seg(t, 2.3, 2.8));
      const endK = seg(t, fe + 0.6, fe + 1.2);
      if (titleK > 0) mat.title(`${c.emoji} ${c.title}`, titleK);
      else if (endK > 0) mat.title('Bravo !', endK);
      const all = [...c.lines, c.shout];
      const active = timing.lines.findIndex(([s, e]) => t >= s && t <= e + 0.35);
      if (endK > 0) mat.caption(c.retiens);
      else if (active >= 0) mat.caption(all[active]);
      if (caught.size > 0) mat.badge(`⭐ ${caught.size}`);
      mat.present(ctx);
    },
    tap(x, y, t) {
      let best: Live | null = null;
      let bestD = Infinity;
      for (const o of live) {
        const d = Math.hypot(o.x - x, o.y - y);
        if (d < o.r && d < bestD) {
          best = o;
          bestD = d;
        }
      }
      if (!best) return false;
      caught.set(best.key, t);
      return true;
    },
    collected: () => caught.size,
    dispose: () => mat.dispose()
  };
}

export { W, H };
