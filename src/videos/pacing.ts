/**
 * Le rythme lent des dessins animés (5-8 ans) : une idée par plan, des plans d'au moins 3 s, une pause
 * après chaque phrase, des transitions douces. Et les styles « livre d'enfant », un par famille de sujets,
 * pour qu'une suite de vidéos reste reconnaissable. Voir docs/superpowers/specs/2026-11-16-videos-lentes-lemo-design.md.
 */
import type { StyleId } from '../kits/styles';

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

/** En secondes : plus court plan, pause après chaque phrase, durée des transitions. */
export const PACE = { minShot: 3, pauseAfterLine: 1.0, transition: 1.2 } as const;

/** Transitions douces seulement (le « whip » est trop rapide pour les petits). */
export const SLOW_TRANSITIONS = ['iris', 'push', 'doors'] as const;

export const STORYBOOK_STYLES: StyleId[] = ['crayon', 'watercolor', 'paper-popup', 'paper-lantern', 'papercut-red', 'shadow-puppet', 'rubber-hose', 'chalkboard'];

const THEME_STYLE: Record<string, StyleId> = {
  animaux: 'watercolor',
  nature: 'crayon',
  espace: 'paper-lantern',
  metiers: 'rubber-hose',
  corps: 'paper-popup',
  monde: 'papercut-red'
};
/** Les 66 dessins animés, par groupes de 11. */
const CAPSULE_STYLES: StyleId[] = ['crayon', 'watercolor', 'paper-popup', 'shadow-puppet', 'chalkboard', 'rubber-hose'];

/** Le style livre d'enfant d'une vidéo : même thème (vidéos du jour) ou même groupe de 11 (dessins animés) → même style. */
export function storybookStyleFor(id: string): StyleId {
  const v = /^video-([a-z]+)-\d+$/.exec(id);
  if (v) return THEME_STYLE[v[1]] ?? 'crayon';
  const c = /^capsule-(\d+)$/.exec(id);
  if (c) return CAPSULE_STYLES[Math.floor((Number(c[1]) - 1) / 11) % CAPSULE_STYLES.length];
  return 'crayon';
}

/** La phrase suivante quand l'enfant touche « suivant » : un appui pendant la pause l'annule et avance d'une seule phrase. */
export function nextIndex(index: number, count: number, _inPause: boolean): number {
  return Math.min(count, index + 1);
}
