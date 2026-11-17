/**
 * Le rythme lent des dessins animés (5-8 ans) : une idée par plan, des plans d'au moins 3 s, une pause
 * après chaque phrase, des transitions douces. Et un style différent par vidéo, parmi les 66 du catalogue. Voir docs/superpowers/specs/2026-11-16-videos-lentes-lemo-design.md.
 */
import { styleAt, type StyleId } from '../kits/styles';
import { VIDEOS } from '../data/videos';
import { CAPSULES } from './capsules';

/** Le rôle d'un plan dans l'histoire : il choisit la caméra et ce que font les personnages. */
export type Shot = 'titre' | 'decouverte' | 'action' | 'detail' | 'calme' | 'question';

/** Le plan `scene` (0 = titre … count = la question) d'une histoire de `count` phrases. */
export function shotFor(scene: number, count: number): Shot {
  if (scene <= 0) return 'titre';
  if (scene >= count) return 'question';
  if (scene === 1) return 'decouverte';
  if (scene === Math.floor((count + 1) / 2)) return 'action';
  return scene % 2 ? 'calme' : 'detail';
}

/** Réglages du rythme (module sans dépendance, aussi utilisé par le moteur des films). */
export { PACE } from './pace';

/** Transitions douces seulement (le « whip » est trop rapide pour les petits). */
export const SLOW_TRANSITIONS = ['iris', 'push', 'doors'] as const;

/**
 * Le style d'une vidéo : un style différent par vidéo, parmi les 66 du catalogue (styles Lemo-Opuscar).
 * Les 66 dessins animés gardent chacun leur style du catalogue ; les 50 vidéos du jour suivent la suite
 * des 66 (décalée de 11), donc toutes différentes.
 */
export function videoStyleFor(id: string): StyleId {
  const c = CAPSULES.find((x) => x.id === id);
  if (c) return c.style;
  return styleAt(Math.max(0, VIDEOS.findIndex((v) => v.id === id)), 11);
}

/** La phrase suivante quand l'enfant touche « suivant » : un appui pendant la pause l'annule et avance d'une seule phrase. */
export function nextIndex(index: number, count: number, _inPause: boolean): number {
  return Math.min(count, index + 1);
}
