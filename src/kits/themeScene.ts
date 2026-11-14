/**
 * Les décors de fond de l'app (jeux, sport, aventures, contes, vidéo du jour…), dessinés avec les kits de style.
 * Chaque thème de scène a son style et son décor, et quelques objets qui flottent doucement :
 * on reconnaît l'univers d'une page à son style, comme pour les comptines et les petits films.
 */
import type { Decor, Objet } from '../data/comptines';
import { H, W } from '../films/engine';
import { place } from './geom';
import { decor, objet } from './library';
import type { Material } from './materials';
import { materialFor, type StyleId } from './styles';

export type SceneTheme = 'animaux' | 'nature' | 'espace' | 'metiers' | 'corps' | 'monde' | 'journal' | 'mer' | 'neige' | 'pluie' | 'fete' | 'nuit' | 'kawaii' | 'kawaiiFille' | 'kawaiiGarcon';

export const SCENE_STYLE: Record<SceneTheme, { style: StyleId; decor: Decor; objets: Objet[] }> = {
  animaux: { style: 'claymation', decor: 'jardin', objets: ['papillon', 'oiseau', 'fleur'] },
  nature: { style: 'urban-sketch', decor: 'foret', objets: ['feuille', 'papillon', 'fleur'] },
  espace: { style: 'scifi-toon', decor: 'nuit', objets: ['fusee', 'etoile', 'lune'] },
  metiers: { style: 'brick-toy', decor: 'ville', objets: ['cube', 'voiture', 'etoile'] },
  corps: { style: 'rubber-hose', decor: 'chambre', objets: ['balle', 'ballon', 'etoile'] },
  monde: { style: 'sea-adventure', decor: 'ville', objets: ['bateau', 'oiseau', 'nuage'] },
  journal: { style: 'newsprint', decor: 'ville', objets: ['soleil', 'nuage', 'note'] },
  mer: { style: 'ukiyoe', decor: 'plage', objets: ['poisson', 'bateau', 'bulle'] },
  neige: { style: 'blue-white', decor: 'neige', objets: ['flocon', 'etoile', 'flocon'] },
  pluie: { style: 'risograph', decor: 'jardin', objets: ['goutte', 'nuage', 'goutte'] },
  fete: { style: 'comic-pop', decor: 'chambre', objets: ['ballon', 'gateau', 'etoile'] },
  nuit: { style: 'paper-lantern', decor: 'nuit', objets: ['etoile', 'lune', 'etoile'] },
  kawaii: { style: 'felt', decor: 'chambre', objets: ['coeur', 'bulle', 'etoile'] },
  kawaiiFille: { style: 'origami', decor: 'jardin', objets: ['coeur', 'papillon', 'fleur'] },
  kawaiiGarcon: { style: 'pixel-8bit', decor: 'chambre', objets: ['fusee', 'voiture', 'etoile'] }
};

/** Places des objets flottants : dans le ciel, loin du centre où se pose le contenu de la page. */
const SPOTS: [number, number, number][] = [
  [110, 120, 0.8],
  [850, 100, 0.9],
  [720, 210, 0.6],
  [230, 230, 0.6],
  [480, 70, 0.55]
];

export interface ThemeBackdrop {
  style: StyleId;
  render(ctx: CanvasRenderingContext2D, t: number, still?: boolean): void;
  dispose(): void;
}

/** Décor d'un thème ; `style` force un autre des 66 styles (un jeu, une page, un contenu précis). */
export function createThemeBackdrop(theme: SceneTheme, style?: StyleId): ThemeBackdrop {
  const spec = SCENE_STYLE[theme];
  const mat: Material = materialFor(style ?? spec.style);
  let lastStep = -1;
  return {
    style: style ?? spec.style,
    render(ctx, tReal, still) {
      // Un fond se dessine lentement : 12 images/s suffisent (et laissent la place au contenu de la page).
      const fps = mat.fps || 12;
      const step = Math.floor(tReal * fps);
      if (step !== lastStep || still) {
        lastStep = step;
        const t = step / fps;
        mat.begin({ t, still });
        mat.draw(decor(spec.decor, t));
        SPOTS.forEach(([x, y, s], i) => {
          const name = spec.objets[i % spec.objets.length];
          const dx = Math.sin(t * 0.5 + i * 1.7) * 14,
            dy = Math.sin(t * 0.8 + i) * 10;
          mat.draw(place(objet(name, t, i + 1), { x: x + dx, y: y + dy, s, rot: Math.sin(t * 0.6 + i) * 0.12 }));
        });
        mat.end();
      }
      mat.present(ctx);
    },
    dispose: () => mat.dispose()
  };
}

export { W, H };
