/**
 * Les 50 vidéos du jour, rendues en code (méthode claude-video / Lemo-Opuscar) au lieu de photos.
 * Chaque vidéo a son héros, son décor, ses petits objets et son style (un des 66, jamais deux fois le même).
 * La mise en scène suit les 5 scènes narrées :
 *  0. titre : le héros arrive (il « se dessine ») et le titre s'affiche ;
 *  1. présentation : le héros au centre, les objets flottent autour ;
 *  2. gros plan : la caméra s'approche et le héros fait son action (l'éléphant se douche, le volcan crache…) ;
 *  3. plan large : la caméra recule, le héros se déplace ;
 *  4. la question : Nino et Nina arrivent et saluent l'enfant.
 * L'image est une fonction du temps : render(scène, temps dans la scène) donne toujours la même image.
 */
import type { Objet } from '../data/comptines';
import { VIDEOS, type MiniVideo } from '../data/videos';
import { clamp, easeInOut, easeOut } from '../films/engine';
import { place, type Figure } from '../kits/geom';
import { kid, objet } from '../kits/library';
import type { Material } from '../kits/materials';
import { materialFor, styleAt, type StyleId } from '../kits/styles';
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

/** Le storyboard des 50 vidéos, dans l'ordre de src/data/videos.ts (par thème). */
const BOARDS: Record<string, Board[]> = {
  animaux: [
    B('manchot', 'banquise', ['flocon', 'poisson', 'flocon']),
    B('elephant', 'savane', ['oiseau', 'goutte', 'soleil'], 0.95),
    B('girafe', 'savane', ['oiseau', 'feuille', 'soleil'], 1, 310),
    B('abeille', 'jardin', ['fleur', 'fleur', 'papillon']),
    B('dauphin', 'ocean', ['bulle', 'poisson', 'bulle']),
    B('papillon', 'jardin', ['fleur', 'feuille', 'fleur']),
    B('tortue', 'plage', ['coeur', 'etoile', 'feuille']),
    B('chouette', 'nuit', ['etoile', 'lune', 'etoile']),
    B('vache', 'ferme', ['fleur', 'nuage', 'soleil']),
    B('ecureuil', 'foret', ['feuille', 'feuille', 'oiseau']),
    B('lion', 'savane', ['soleil', 'oiseau', 'etoile'], 0.95),
    B('grenouille', 'jardin', ['goutte', 'fleur', 'papillon']),
    B('panda', 'foret', ['feuille', 'coeur', 'feuille']),
    B('coccinelle', 'jardin', ['feuille', 'fleur', 'etoile']),
    B('baleine', 'ocean', ['poisson', 'bulle', 'poisson'], 0.9)
  ],
  nature: [
    B('arbre', 'jardin', ['oiseau', 'feuille', 'pomme'], 0.95, 300),
    B('arcenciel', 'ciel', ['goutte', 'soleil', 'nuage']),
    B('vagues', 'plage', ['poisson', 'bulle', 'nuage'], 1, 360),
    B('volcan', 'montagnes', ['nuage', 'etoile', 'nuage'], 1, 320),
    B('bonhomme', 'neige', ['flocon', 'flocon', 'etoile'], 0.95, 330),
    B('automne', 'foret', ['feuille', 'feuille', 'nuage'], 0.95, 300),
    B('printemps', 'jardin', ['papillon', 'fleur', 'oiseau'], 1, 310),
    B('pluie', 'ville', ['goutte', 'nuage', 'goutte'], 1, 260),
    B('montagne', 'ciel', ['oiseau', 'nuage', 'flocon'], 1.05, 320),
    B('tournesol', 'jardin', ['papillon', 'soleil', 'fleur'], 1, 300)
  ],
  espace: [
    B('lune', 'espace', ['etoile', 'fusee', 'etoile']),
    B('soleil', 'ciel', ['nuage', 'fleur', 'oiseau']),
    B('planete', 'espace', ['etoile', 'etoile', 'fusee']),
    B('fusee', 'espace', ['etoile', 'lune', 'etoile'], 1, 300),
    B('astronaute', 'espace', ['etoile', 'fusee', 'lune'], 1, 250),
    B('etoile', 'nuit', ['etoile', 'lune', 'etoile'], 1, 230),
    B('terre', 'espace', ['lune', 'etoile', 'nuage']),
    B('aurore', 'neige', ['etoile', 'flocon', 'etoile'], 1, 300)
  ],
  metiers: [
    B('camion', 'ville', ['goutte', 'etoile', 'nuage'], 0.95, 350),
    B('docteur', 'chambre', ['coeur', 'etoile', 'brosse'], 0.9, 320),
    B('tracteur', 'ferme', ['carotte', 'nuage', 'pomme'], 0.95, 340),
    B('pain', 'cuisine', ['gateau', 'coeur', 'etoile'], 1, 300),
    B('livres', 'ecole', ['note', 'pomme', 'etoile'], 0.9, 290),
    B('bus', 'ville', ['etoile', 'nuage', 'oiseau'], 0.85, 350),
    B('microscope', 'ecole', ['bulle', 'etoile', 'goutte'], 0.95, 310)
  ],
  corps: [
    B('dent', 'chambre', ['etoile', 'bulle', 'coeur'], 0.95, 290),
    B('coeur', 'jardin', ['coeur', 'etoile', 'coeur'], 0.9, 260),
    B('fruits', 'cuisine', ['pomme', 'carotte', 'coeur'], 0.9, 330),
    B('dodo', 'chambre', ['etoile', 'lune', 'etoile'], 0.9, 330),
    B('bouger', 'jardin', ['balle', 'ballon', 'etoile'])
  ],
  monde: [
    B('eiffel', 'ville', ['nuage', 'oiseau', 'coeur'], 0.95, 290),
    B('chameau', 'desert', ['soleil', 'etoile', 'oiseau'], 0.95, 330),
    B('palmier', 'foret', ['papillon', 'fleur', 'feuille'], 1, 300),
    B('ours', 'banquise', ['flocon', 'poisson', 'flocon'], 1, 330),
    B('chateau', 'ciel', ['nuage', 'oiseau', 'etoile'], 0.95, 300)
  ]
};

export function boardFor(id: string): Board | undefined {
  const m = /^video-([a-z]+)-(\d+)$/.exec(id);
  if (!m) return undefined;
  return BOARDS[m[1]]?.[Number(m[2]) - 1];
}

/** Le style de chaque vidéo : son rang dans la suite des 50 (toutes différentes, décalées des comptines). */
export function styleForVideo(id: string): StyleId {
  const i = VIDEOS.findIndex((v) => v.id === id);
  return styleAt(Math.max(0, i), 11);
}

export interface VideoScene {
  style: StyleId;
  /** scene : 0 (titre) → 4 (la question) ; t : secondes depuis le début de la scène. */
  render(ctx: CanvasRenderingContext2D, scene: number, t: number, still?: boolean): void;
  dispose(): void;
}

const SPOTS: [number, number][] = [
  [170, 140],
  [800, 170],
  [640, 90]
];

export function createVideoScene(video: MiniVideo, style: StyleId = styleForVideo(video.id)): VideoScene {
  const board = boardFor(video.id) ?? B('etoile', 'ciel', ['etoile', 'nuage', 'etoile']);
  const mat: Material = materialFor(style);
  const s0 = board.s ?? 1,
    y0 = board.y ?? 310;
  let last = '';
  return {
    style,
    render(ctx, scene, tReal, still) {
      const fps = mat.fps || 24;
      const t = still ? tReal : Math.floor(tReal * fps) / fps;
      const key = `${scene}:${t}`;
      if (key !== last || still) {
        last = key;
        // Caméra : zoom (k) et visée (cx, cy) selon la scène, avec un fondu doux entre deux plans.
        const shots = [
          { k: 1, cx: 480, cy: 270 },
          { k: 1, cx: 480, cy: 270 },
          { k: 1.4, cx: 480, cy: y0 - 10 },
          { k: 0.92, cx: 480, cy: 280 },
          { k: 1, cx: 480, cy: 270 }
        ];
        const prev = shots[Math.max(0, scene - 1)],
          cur = shots[Math.min(4, scene)];
        const m = scene === 0 ? 1 : easeInOut(clamp(t / 1.2));
        const k = prev.k + (cur.k - prev.k) * m,
          cx = prev.cx + (cur.cx - prev.cx) * m,
          cy = prev.cy + (cur.cy - prev.cy) * m;
        const cam = (f: Figure): Figure => place(f, { x: 480 - cx * k, y: 270 - cy * k, s: k });
        const T = scene * 20 + t; // temps continu pour les gestes

        mat.begin({ t: T, still });
        mat.draw(cam(videoDecor(board.decor, T)));

        // Petits objets du thème : ils flottent dans le ciel à partir de la présentation.
        if (scene >= 1)
          SPOTS.forEach(([x, y], i) => {
            const pop = scene === 1 ? easeOut(clamp((t - 0.4 - i * 0.35) / 0.6)) : 1;
            if (pop <= 0) return;
            const name = board.extras[i % board.extras.length];
            mat.draw(cam(place(objet(name, T, i + 2), { x: x + Math.sin(T * 0.6 + i * 2) * 18, y: y + Math.sin(T * 0.9 + i) * 10, s: 0.75 * pop, rot: Math.sin(T * 0.7 + i) * 0.15 })));
          });

        // Le héros.
        let hx = 480,
          hs = s0;
        if (scene === 3) hx = 480 + Math.sin(t * 0.5) * 70;
        if (scene === 4) {
          hx = 480 + (310 - 480) * easeInOut(clamp(t / 1.4));
          hs = s0 * (1 - 0.18 * easeInOut(clamp(t / 1.4)));
        }
        const act = scene === 2 ? clamp((t - 1) / 3) : 0;
        const enter = scene === 0 ? easeOut(clamp(t / 1.6)) : 1;
        const H = hero(board.hero, T, act);
        const fig = board.hero === 'bouger' ? kid(true, { armL: 150 + Math.sin(T * 6) * 20, armR: -150 - Math.sin(T * 6) * 20, t: T, mouth: 'open' }, 5) : H;
        const bob = board.hero === 'bouger' ? -Math.abs(Math.sin(T * 3)) * 60 : Math.sin(T * 1.3) * 3;
        mat.draw(cam(place(fig, board.hero === 'bouger' ? { x: hx, y: 470 + bob, s: 0.9 } : { x: hx + (1 - enter) * 520, y: y0 + bob, s: hs })), { reveal: scene === 0 ? clamp(t / 1.4) : 1 });

        // La question : Nino et Nina arrivent en marchant et saluent.
        if (scene === 4) {
          const walk = easeOut(clamp((t - 0.3) / 1.6));
          const wave = Math.sin(T * 7) * 25;
          mat.draw(cam(place(kid(true, { armR: -140 + wave, walk: walk < 1 ? T * 4 : 0, t: T, mouth: 'smile' }, 3), { x: 640 + (1 - walk) * 380, y: 481, s: 0.62 })));
          mat.draw(cam(place(kid(false, { armL: 140 - wave, walk: walk < 1 ? T * 4 : 0, t: T, mouth: 'open' }, 4), { x: 780 + (1 - walk) * 380, y: 481, s: 0.62 })));
        }
        mat.end();
        if (scene === 0) mat.title(video.title, clamp((t - 0.6) / 0.6));
      }
      mat.present(ctx);
    },
    dispose: () => mat.dispose()
  };
}

export { VIDEOS };
