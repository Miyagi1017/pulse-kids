/**
 * Les grandes vignettes dessinées de l'accueil et des menus (à la place des emojis).
 * Chaque rubrique a sa scène et son style (un des 66) : on reconnaît la rubrique à son dessin,
 * sans avoir besoin de lire. Rendu une seule fois dans le repère 960 × 540 (voir components/Vignette).
 */
import type { Objet } from '../data/comptines';
import { place, type Figure } from './geom';
import { cat, kid, objet } from './library';
import { materialFor, styleForKey, type StyleId } from './styles';
import { hero, videoDecor, type HeroName, type VideoDecor } from '../videos/heroes';

export type TileId = 'sport' | 'bouger' | 'video' | 'comptines' | 'films' | 'explications' | 'contes' | 'activites' | 'soir' | 'lire';

interface TileArt {
  style: StyleId;
  decor: VideoDecor;
  hero?: [HeroName, number, number, number];
  kids?: 'both' | 'girl' | 'boy' | 'jump';
  cat?: boolean;
  objets: [Objet, number, number, number][];
}

export const TILE_ART: Record<TileId, TileArt> = {
  sport: { style: 'halftone-dossier', decor: 'jardin', kids: 'jump', objets: [['ballon', 760, 170, 1.2], ['etoile', 200, 130, 1], ['balle', 640, 430, 1]] },
  bouger: { style: 'isometric-picture-book', decor: 'savane', hero: ['girafe', 640, 300, 0.95], kids: 'girl', objets: [['soleil', 180, 110, 1.1]] },
  video: { style: 'scifi-toon', decor: 'espace', hero: ['fusee', 600, 270, 0.9], kids: 'boy', objets: [['etoile', 820, 110, 0.9], ['lune', 160, 120, 1]] },
  comptines: { style: 'memphis-diorama', decor: 'chambre', kids: 'both', objets: [['note', 260, 150, 1.3], ['note', 700, 120, 1.1], ['etoile', 480, 90, 0.9]] },
  films: { style: 'paper-popup', decor: 'ciel', hero: ['chateau', 480, 300, 0.85], objets: [['oiseau', 200, 130, 1], ['nuage', 780, 110, 1]] },
  explications: { style: 'briefing-board', decor: 'ecole', hero: ['microscope', 640, 320, 0.9], kids: 'girl', objets: [['bulle', 820, 150, 1], ['etoile', 200, 120, 0.8]] },
  contes: { style: 'watercolor', decor: 'foret', kids: 'both', cat: true, objets: [['papillon', 480, 150, 1.2], ['fleur', 820, 420, 1]] },
  activites: { style: 'brick-toy', decor: 'chambre', kids: 'boy', objets: [['cube', 640, 400, 1.3], ['cube', 720, 400, 1.3], ['cube', 680, 340, 1.3], ['balle', 220, 420, 1]] },
  soir: { style: 'paper-lantern', decor: 'nuit', hero: ['chouette', 700, 300, 0.75], objets: [['lune', 220, 120, 1.4], ['etoile', 480, 80, 0.8], ['etoile', 880, 200, 0.7]] },
  lire: { style: 'risograph', decor: 'ecole', hero: ['livres', 480, 290, 0.8], objets: [['pomme', 820, 420, 1], ['etoile', 160, 120, 0.9]] }
};

/** Dessine la vignette d'une rubrique (t fixe : c'est une image, pas une animation). */
export function paintTile(id: TileId, t = 1.2) {
  return (ctx: CanvasRenderingContext2D) => {
    const a = TILE_ART[id];
    const m = materialFor(a.style);
    m.begin({ t, still: true });
    m.draw(videoDecor(a.decor, t));
    for (const [o, x, y, s] of a.objets) m.draw(place(objet(o, t, x), { x, y, s }));
    if (a.hero) m.draw(place(hero(a.hero[0], t, 0), { x: a.hero[1], y: a.hero[2], s: a.hero[3] }));
    const kids: Figure[] = [];
    if (a.kids === 'jump') kids.push(place(kid(true, { armL: 160, armR: -160, t, mouth: 'open' }, 3), { x: 470, y: 440, s: 0.85 }));
    if (a.kids === 'girl' || a.kids === 'both') kids.push(place(kid(true, { armR: -120, t, mouth: 'smile' }, 3), { x: a.kids === 'both' ? 400 : 300, y: 481, s: 0.72 }));
    if (a.kids === 'boy' || a.kids === 'both') kids.push(place(kid(false, { armL: 120, t, mouth: 'smile' }, 4), { x: a.kids === 'both' ? 560 : 300, y: 481, s: 0.72 }));
    if (a.cat) kids.push(place(cat({ t }, 7), { x: 700, y: 493, s: 0.6 }));
    for (const k of kids) m.draw(k);
    m.end();
    m.present(ctx);
    m.dispose();
  };
}

const painters = new Map<TileId, (ctx: CanvasRenderingContext2D) => void>();
/** Même fonction pour une même rubrique (la vignette n'est dessinée qu'une fois). */
export function tilePainter(id: TileId) {
  let p = painters.get(id);
  if (!p) painters.set(id, (p = paintTile(id)));
  return p;
}

/* ───────────── Vignettes des contenus (contes, activités, contes du soir…) ───────────── */


/** Mots du titre → héros dessiné (le premier qui correspond gagne). */
const HERO_WORDS: [RegExp, HeroName][] = [
  [/manchot|pingouin/i, 'manchot'], [/éléphant|elephant/i, 'elephant'], [/girafe/i, 'girafe'], [/abeille|miel/i, 'abeille'], [/dauphin/i, 'dauphin'],
  [/papillon|chenille/i, 'papillon'], [/tortue/i, 'tortue'], [/chouette|hibou/i, 'chouette'], [/vache|ferme|meuh/i, 'vache'], [/écureuil|noisette/i, 'ecureuil'],
  [/\blion/i, 'lion'], [/grenouille|crapaud/i, 'grenouille'], [/panda/i, 'panda'], [/coccinelle/i, 'coccinelle'], [/baleine/i, 'baleine'],
  [/arc-en-ciel|couleur/i, 'arcenciel'], [/volcan/i, 'volcan'], [/bonhomme de neige|hiver/i, 'bonhomme'], [/automne|feuille/i, 'automne'], [/printemps/i, 'printemps'],
  [/pluie|nuage|orage/i, 'pluie'], [/montagne/i, 'montagne'], [/tournesol|fleur|jardin/i, 'tournesol'], [/arbre|forêt|\bbois\b/i, 'arbre'], [/\bmer\b|vague|océan|bateau|pirate/i, 'vagues'],
  [/lune/i, 'lune'], [/soleil/i, 'soleil'], [/planète|saturne|\bmars\b/i, 'planete'], [/fusée|espace/i, 'fusee'], [/astronaute/i, 'astronaute'], [/étoile/i, 'etoile'], [/terre|monde/i, 'terre'],
  [/pompier|camion/i, 'camion'], [/docteur|médecin|malade|bobo/i, 'docteur'], [/tracteur/i, 'tracteur'], [/pain|boulang|gâteau|cuisine/i, 'pain'], [/école|lettre|livre|\blire\b|\bmots?\b/i, 'livres'],
  [/bus|voiture|train/i, 'bus'], [/science|expérience|loupe/i, 'microscope'], [/dent/i, 'dent'], [/cœur|coeur|amour|câlin|\bami(e|s)?\b/i, 'coeur'], [/fruit|légume|manger|pomme/i, 'fruits'],
  [/dodo|dormir|\bnuit\b|sommeil|\blit\b/i, 'dodo'], [/paris|tour eiffel/i, 'eiffel'], [/désert|chameau/i, 'chameau'], [/jungle|perroquet|palmier/i, 'palmier'], [/\bours\b|banquise|glace/i, 'ours'],
  [/château|princ|roi|reine|dragon|chevalier|fée/i, 'chateau']
];

const HERO_DECOR: Partial<Record<HeroName, VideoDecor>> = {
  manchot: 'banquise', ours: 'banquise', elephant: 'savane', girafe: 'savane', lion: 'savane', dauphin: 'ocean', baleine: 'ocean', vache: 'ferme', tracteur: 'ferme',
  chouette: 'nuit', dodo: 'chambre', lune: 'espace', planete: 'espace', fusee: 'espace', astronaute: 'espace', terre: 'espace', etoile: 'nuit', chameau: 'desert',
  livres: 'ecole', microscope: 'ecole', pain: 'cuisine', fruits: 'cuisine', dent: 'chambre', docteur: 'chambre', camion: 'ville', bus: 'ville', eiffel: 'ville',
  volcan: 'montagnes', montagne: 'ciel', arcenciel: 'ciel', chateau: 'ciel', bonhomme: 'neige', vagues: 'plage', ecureuil: 'foret', arbre: 'jardin', palmier: 'foret', panda: 'foret'
};

const items = new Map<string, (ctx: CanvasRenderingContext2D) => void>();

/**
 * Vignette d'un contenu : un héros choisi d'après les mots du titre (sinon Nino et Nina dans un décor),
 * dans un style tiré de l'identifiant du contenu (toujours le même pour un même conte).
 */
export function itemPainter(id: string, title: string, evening = false) {
  const key = `${id}|${evening}`;
  let p = items.get(key);
  if (p) return p;
  const h = HERO_WORDS.find(([re]) => re.test(title))?.[1];
  const style = styleForKey(id);
  const decor: VideoDecor = evening ? 'nuit' : h ? (HERO_DECOR[h] ?? 'jardin') : (['jardin', 'foret', 'chambre', 'plage', 'ville', 'ciel'] as VideoDecor[])[id.length % 6];
  p = (ctx) => {
    const m = materialFor(style);
    const t = 1.2;
    m.begin({ t, still: true });
    m.draw(videoDecor(decor, t));
    if (evening) m.draw(place(objet('lune', t), { x: 200, y: 120, s: 1.4 }));
    if (h) m.draw(place(hero(h, t, 0), { x: 480, y: 300, s: 0.95 }));
    else {
      m.draw(place(kid(true, { armR: -120, t, mouth: 'smile' }, 3), { x: 400, y: 481, s: 0.75 }));
      m.draw(place(kid(false, { armL: 120, t, mouth: 'smile' }, 4), { x: 560, y: 481, s: 0.75 }));
      m.draw(place(objet('etoile', t), { x: 760, y: 140, s: 1.1 }));
    }
    m.end();
    m.present(ctx);
    m.dispose();
  };
  items.set(key, p);
  return p;
}
