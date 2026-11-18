/**
 * Les 10 vidéos du jour, rendues en code (méthode claude-video / Lemo-Opuscar) au lieu de photos.
 * Chaque vidéo a son héros, son décor, ses petits objets et son style (un des 10, jamais deux fois le même).
 * La mise en scène suit les 5 scènes narrées :
 *  0. titre : le héros arrive (il « se dessine ») et le titre s'affiche ;
 *  1. présentation : le héros au centre, les objets flottent autour ;
 *  2. gros plan : la caméra s'approche et le héros fait son action (l'éléphant se douche, le volcan crache…) ;
 *  3. plan large : la caméra recule, le héros se déplace ;
 *  4. la question : Nino et Nina arrivent et saluent l'enfant.
 * L'image est une fonction du temps : render(scène, temps dans la scène) donne toujours la même image.
 */
import type { Objet } from '../data/comptines';
import { VIDEOS } from '../data/videos';
import { back, clamp, easeInOut, easeOut } from '../films/engine';
import { place, type Figure } from '../kits/geom';
import { kid, objet } from '../kits/library';
import type { Material } from '../kits/materials';
import { materialFor, strHash, styleAt, swatch, type StyleId } from '../kits/styles';
import { hero, videoDecor, type HeroName, type VideoDecor } from './heroes';

export interface Board {
  hero: HeroName;
  decor: VideoDecor;
  extras: Objet[];
  /** Taille du héros au plan normal. */
  s?: number;
  /** Hauteur du héros (le centre de la figure). */
  y?: number;
}

const B = (hero: HeroName, decor: VideoDecor, extras: Objet[], s?: number, y?: number): Board => ({ hero, decor, extras, s, y });

/** Le storyboard des 10 vidéos gardées (par identifiant). */
const BOARDS: Record<string, Board> = {
  'video-animaux-01': B('manchot', 'banquise', ['flocon', 'poisson', 'flocon']),
  'video-nature-02': B('arcenciel', 'ciel', ['goutte', 'soleil', 'nuage']),
  'video-animaux-02': B('elephant', 'savane', ['oiseau', 'goutte', 'soleil'], 0.95),
  'video-espace-01': B('lune', 'espace', ['etoile', 'fusee', 'etoile']),
  'video-animaux-05': B('dauphin', 'ocean', ['bulle', 'poisson', 'bulle']),
  'video-corps-01': B('dent', 'chambre', ['etoile', 'bulle', 'coeur'], 0.95, 290),
  'video-animaux-03': B('girafe', 'savane', ['oiseau', 'feuille', 'soleil'], 1, 310),
  'video-espace-03': B('planete', 'espace', ['etoile', 'etoile', 'fusee']),
  'video-animaux-13': B('panda', 'foret', ['feuille', 'coeur', 'feuille']),
  'video-animaux-15': B('baleine', 'ocean', ['poisson', 'bulle', 'poisson'], 0.9)
};

export function boardFor(id: string): Board | undefined {
  return BOARDS[id];
}

/** Le style de chaque vidéo : celui qui lui est attribué dans src/data/videos.ts (un des 10). */
export function styleForVideo(id: string): StyleId {
  return VIDEOS.find((v) => v.id === id)?.style ?? styleAt(0);
}

/** Ce qu'il faut pour rendre un dessin animé codé : une des 10 mini-vidéos. */
export interface CodedVideo {
  id: string;
  title: string;
  style?: StyleId;
  board?: Board;
}

export interface VideoScene {
  style: StyleId;
  /** scene : 0 (titre) → 4 (la question) ; t : secondes depuis le début de la scène. */
  render(ctx: CanvasRenderingContext2D, scene: number, t: number, still?: boolean): void;
  dispose(): void;
}

const W0 = 960,
  H0 = 540;
/** Durée des transitions entre plans, et l'arrêt sur image du gros plan (vocabulaire video-shotcraft). */
const TRANS = 0.55,
  FREEZE_AT = 2.6,
  FREEZE = 0.9;
const TRANSITIONS = ['iris', 'whip', 'push', 'doors'] as const;
/** Places des objets à la fin (« photo de groupe » autour du héros et des enfants). */
const GROUP: [number, number][] = [
  [200, 250],
  [860, 260],
  [540, 120]
];

const SPOTS: [number, number][] = [
  [170, 140],
  [800, 170],
  [640, 90]
];

export function createVideoScene(video: CodedVideo, style: StyleId = video.style ?? styleForVideo(video.id)): VideoScene {
  const board = video.board ?? boardFor(video.id) ?? B('etoile', 'ciel', ['etoile', 'nuage', 'etoile']);
  const mat: Material = materialFor(style);
  const s0 = board.s ?? 1,
    y0 = board.y ?? 310;
  let last = '';
  // Images du plan courant et du plan précédent (pour les transitions entre plans).
  const cur = document.createElement('canvas'),
    prev = document.createElement('canvas');
  cur.width = prev.width = 1280;
  cur.height = prev.height = 720;
  const curG = cur.getContext('2d')!,
    prevG = prev.getContext('2d')!;
  prevG.setTransform(1, 0, 0, 1, 0, 0);
  let curScene = -1,
    hadPrev = false;
  const sw = swatch(style);
  const vHash = strHash(video.id);
  // Ouverture : projecteur pour les styles sombres, sinon grue ou lente avancée selon la vidéo.
  const opening: 'spot' | 'crane' | 'push' = sw.dark ? 'spot' : vHash % 2 ? 'crane' : 'push';
  return {
    style,
    render(ctx, scene, tReal, still) {
      // Le plan change : on garde la dernière image du plan précédent pour la transition.
      if (scene !== curScene) {
        if (curScene >= 0 && !still) prevG.drawImage(cur, 0, 0);
        hadPrev = curScene >= 0 && !still;
        curScene = scene;
      }
      const fps = mat.fps || 24;
      // Arrêt sur image (une seule fois, au sommet de l'action du gros plan) : le temps du monde s'arrête.
      const tw = scene === 2 && !still && tReal > FREEZE_AT ? (tReal < FREEZE_AT + FREEZE ? FREEZE_AT : tReal - FREEZE) : tReal;
      const t = still ? tw : Math.floor(tw * fps) / fps;
      const frozen = scene === 2 && !still && tReal > FREEZE_AT && tReal < FREEZE_AT + FREEZE;
      const key = `${scene}:${t}:${frozen ? Math.floor(tReal * 12) : ''}`;
      if (key !== last || still) {
        last = key;
        const T = scene * 20 + t; // temps continu pour les gestes
        const heroY = board.hero === 'bouger' ? 400 : y0;

        // ── Caméra (vocabulaire de video-shotcraft, adapté aux enfants) ──
        let k = 1,
          cx = 480,
          cy = 270,
          drive = 0, // glissement latéral pour la parallaxe (profondeur)
          shake = 0;
        if (scene === 0) {
          if (opening === 'crane') {
            // Grue : on part au ras du sol, tout près, puis on s'élève et on recule.
            const e = easeOut(clamp(t / 2));
            k = 1.3 - 0.3 * e;
            cy = 400 - 130 * e;
          } else if (opening === 'push') {
            const e = easeInOut(clamp(t / 2.4));
            k = 0.9 + 0.1 * e;
          }
        } else if (scene === 1) {
          // Glissière à plusieurs plans : le décor glisse lentement, les objets proches vite.
          drive = 150 * (1 - easeOut(clamp(t / 2.4)));
        } else if (scene === 2) {
          // Coup de zoom : plan large tenu, puis on fonce sur le héros, léger rebond.
          const z = clamp((t - 0.5) / 0.25);
          const zin = z * z * z;
          const back = clamp((t - 0.75) / 0.22);
          k = 1 + 0.52 * zin - 0.06 * easeOut(back);
          cx = 480;
          cy = 270 + (heroY - 20 - 270) * zin;
          shake = t > 0.75 && t < 1.05 ? Math.sin(t * 90) * 6 * (1 - (t - 0.75) / 0.3) : 0;
        } else if (scene === 3) {
          // On recule doucement pour voir tout le monde.
          const e = easeInOut(clamp(t / 3));
          k = 1.18 - 0.28 * e;
          cy = heroY - 30 + (280 - heroY + 30) * e;
          drive = Math.sin(t * 0.4) * 40;
        }
        const camAt = (depth: number) => (f: Figure): Figure => {
          const kk = 1 + (k - 1) * depth;
          return place(f, { x: 480 - cx * kk + drive * depth + shake, y: 270 - cy * kk, s: kk });
        };
        const far = camAt(0.45),
          mid = camAt(1),
          near = camAt(1.35);

        mat.begin({ t: T, still });
        mat.draw(far(videoDecor(board.decor, T)));

        // Petits objets du thème : au premier plan (ils passent plus vite), ils arrivent à la présentation ;
        // à la fin, ils se rassemblent autour de tout le monde, comme pour une photo de groupe.
        if (scene >= 1)
          SPOTS.forEach(([x, y], i) => {
            const pop = scene === 1 ? easeOut(clamp((t - 0.4 - i * 0.35) / 0.6)) : 1;
            if (pop <= 0) return;
            let ox = x + Math.sin(T * 0.6 + i * 2) * 18,
              oy = y + Math.sin(T * 0.9 + i) * 10;
            if (scene === 4) {
              const g = back(clamp((t - 0.8 - i * 0.2) / 0.8));
              const [gx, gy] = GROUP[i % GROUP.length];
              ox += (gx - x) * g;
              oy += (gy - y) * g;
            }
            const name = board.extras[i % board.extras.length];
            mat.draw(near(place(objet(name, T, i + 2), { x: ox, y: oy, s: 0.75 * pop, rot: Math.sin(T * 0.7 + i) * 0.15 })));
          });

        // Le héros.
        let hx = 480,
          hs = s0;
        if (scene === 3) hx = 480 + Math.sin(t * 0.5) * 70;
        if (scene === 4) {
          hx = 480 + (310 - 480) * easeInOut(clamp(t / 1.4));
          hs = s0 * (1 - 0.18 * easeInOut(clamp(t / 1.4)));
        }
        // Le héros « se soulève » à la fin de la glissière (il devient le sujet du plan).
        if (scene === 1) hs *= 1 + 0.035 * easeOut(clamp((t - 2.2) / 0.5));
        const act = scene === 2 ? clamp((t - 1.1) / 2.6) : 0;
        const enter = scene === 0 ? easeOut(clamp(t / 1.6)) : 1;
        const H = hero(board.hero, T, act);
        const fig = board.hero === 'bouger' ? kid(true, { armL: 150 + Math.sin(T * 6) * 20, armR: -150 - Math.sin(T * 6) * 20, t: T, mouth: 'open' }, 5) : H;
        const bob = board.hero === 'bouger' ? -Math.abs(Math.sin(T * 3)) * 60 : Math.sin(T * 1.3) * 3;
        mat.draw(mid(place(fig, board.hero === 'bouger' ? { x: hx, y: 470 + bob, s: 0.9 } : { x: hx + (1 - enter) * 520, y: y0 + bob, s: hs })), { reveal: scene === 0 ? clamp(t / 1.4) : 1 });

        // La question : Nino et Nina arrivent en marchant et saluent.
        if (scene === 4) {
          const walk = easeOut(clamp((t - 0.3) / 1.6));
          const wave = Math.sin(T * 7) * 25;
          mat.draw(mid(place(kid(true, { armR: -140 + wave, walk: walk < 1 ? T * 4 : 0, t: T, mouth: 'smile' }, 3), { x: 640 + (1 - walk) * 380, y: 481, s: 0.62 })));
          mat.draw(mid(place(kid(false, { armL: 140 - wave, walk: walk < 1 ? T * 4 : 0, t: T, mouth: 'open' }, 4), { x: 780 + (1 - walk) * 380, y: 481, s: 0.62 })));
        }
        mat.end();
        if (scene === 0) mat.title(video.title, clamp((t - 0.6) / 0.6));

        // ── Composition de l'image : effets de plan, puis transition depuis le plan précédent ──
        curG.setTransform(cur.width / W0, 0, 0, cur.height / H0, 0, 0);
        mat.present(curG);
        // Projecteur (ouverture des styles sombres) : la nuit, un rond de lumière cherche puis trouve le héros.
        if (scene === 0 && opening === 'spot') {
          const e = easeInOut(clamp(t / 2.2));
          const sx = 140 + (480 - 140) * e,
            sy = 200 + (y0 - 200) * e,
            r = 130 + 900 * clamp((t - 2.2) / 0.8) ** 2;
          curG.save();
          const grd = curG.createRadialGradient(sx, sy, r * 0.6, sx, sy, r);
          grd.addColorStop(0, 'rgba(5,4,12,0)');
          grd.addColorStop(1, 'rgba(5,4,12,0.82)');
          curG.fillStyle = grd;
          curG.fillRect(0, 0, W0, H0);
          curG.restore();
        }
        // Coup de zoom : un éclair chaud à l'arrivée.
        if (scene === 2 && t > 0.75 && t < 1.2) {
          curG.fillStyle = `rgba(255,244,214,${0.55 * Math.exp(-(t - 0.75) * 9)})`;
          curG.fillRect(0, 0, W0, H0);
        }
        // Arrêt sur image : coins de cadre, et un cercle dessiné à la main autour du héros.
        if (frozen) {
          const f = clamp((tReal - FREEZE_AT) / 0.35);
          const sx = (480 - cx * k) + 480 * k,
            sy = (270 - cy * k) + heroY * k;
          curG.save();
          curG.strokeStyle = sw.dark ? '#ffd36e' : '#e4372b';
          curG.lineWidth = 6;
          curG.lineCap = 'round';
          curG.beginPath();
          const R = 150 * Math.min(1.4, k),
            a1 = -Math.PI / 2 + Math.PI * 2.15 * easeOut(f);
          for (let a = -Math.PI / 2; a <= a1; a += 0.05) {
            const rr = R * (1 + 0.05 * Math.sin(a * 3));
            const px = sx + Math.cos(a) * rr * 1.25,
              py = sy + Math.sin(a) * rr;
            if (a === -Math.PI / 2) curG.moveTo(px, py);
            else curG.lineTo(px, py);
          }
          curG.stroke();
          curG.lineWidth = 5;
          curG.strokeStyle = sw.dark ? '#fff8ea' : '#1d1a17';
          const c = 22 * f;
          for (const [x0, y0c, dx, dy] of [[24, 24, 1, 1], [W0 - 24, 24, -1, 1], [24, H0 - 24, 1, -1], [W0 - 24, H0 - 24, -1, -1]]) {
            curG.beginPath();
            curG.moveTo(x0, y0c + dy * c * 2);
            curG.lineTo(x0, y0c);
            curG.lineTo(x0 + dx * c * 2, y0c);
            curG.stroke();
          }
          if (tReal - FREEZE_AT < 0.1) {
            curG.fillStyle = 'rgba(255,255,255,0.6)';
            curG.fillRect(0, 0, W0, H0);
          }
          curG.restore();
        }
      }

      // Transition (une demi-seconde au début du plan), sinon l'image du plan telle quelle.
      const p = hadPrev ? clamp(tReal / TRANS) : 1;
      if (p >= 1) {
        ctx.drawImage(cur, 0, 0, W0, H0);
        return;
      }
      const kind = TRANSITIONS[(vHash + scene) % TRANSITIONS.length];
      const e = easeInOut(p);
      ctx.save();
      if (kind === 'iris') {
        // Iris : le nouveau plan s'ouvre en rond depuis le héros ; l'ancien recule et s'assombrit.
        const s = 1.03 + 0.19 * p * p;
        ctx.save();
        ctx.translate(480, y0);
        ctx.scale(s, s);
        ctx.translate(-480, -y0);
        ctx.drawImage(prev, 0, 0, W0, H0);
        ctx.restore();
        ctx.fillStyle = `rgba(0,0,0,${0.55 * p})`;
        ctx.fillRect(0, 0, W0, H0);
        ctx.beginPath();
        ctx.arc(480, Math.min(y0, 400), 20 + 1150 * p * p, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(cur, 0, 0, W0, H0);
      } else if (kind === 'whip') {
        // Panoramique filé : les deux plans glissent ensemble, flous, puis le nouveau freine.
        const x = -W0 * (1 - (1 - e) ** 3);
        for (let i = 3; i >= 0; i--) {
          ctx.globalAlpha = i === 0 ? 1 : 0.18;
          ctx.drawImage(prev, x - i * 26 * Math.sin(p * Math.PI), 0, W0, H0);
          ctx.drawImage(cur, x + W0 - i * 26 * Math.sin(p * Math.PI), 0, W0, H0);
        }
      } else if (kind === 'push') {
        // Le nouveau plan monte du bas et pousse l'ancien hors du cadre.
        const y = H0 * (1 - e);
        ctx.drawImage(prev, 0, y - H0, W0, H0);
        ctx.drawImage(cur, 0, y, W0, H0);
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(0, y - 6, W0, 6);
      } else {
        // Portes battantes : l'ancien plan s'ouvre en deux comme un rideau.
        ctx.drawImage(cur, 0, 0, W0, H0);
        const d = (W0 / 2) * e;
        ctx.drawImage(prev, 0, 0, prev.width / 2, prev.height, -d, 0, W0 / 2, H0);
        ctx.drawImage(prev, prev.width / 2, 0, prev.width / 2, prev.height, W0 / 2 + d, 0, W0 / 2, H0);
      }
      ctx.restore();
    },
    dispose: () => {
      mat.dispose();
      cur.width = cur.height = prev.width = prev.height = 0;
    }
  };
}

export { VIDEOS };
