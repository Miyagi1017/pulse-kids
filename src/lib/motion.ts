/**
 * Le « langage » d'animation de Pulse Kids, inspiré des principes classiques du dessin animé :
 *  - anticipation (on s'accroupit avant de sauter),
 *  - écrasement / étirement (squash & stretch) à l'impulsion et à la réception,
 *  - amorti (une oscillation qui diminue au lieu de s'arrêter net),
 *  - entrées et sorties douces, ressorts plutôt que durées fixes,
 *  - vraie gravité pour ce qui vole (trajectoires en arc).
 * Toutes les poses qui écrasent s'appuient sur le bas (originY: 1), comme un personnage posé au sol.
 */
import type { Transition } from 'motion/react';

/* ---------- Ressorts ---------- */

/** Ressort doux : apparitions, changements d'écran. */
export const SPRING_SOFT: Transition = { type: 'spring', stiffness: 170, damping: 22, mass: 0.9 };
/** Ressort rebondissant : boutons, tuiles, réactions joyeuses. */
export const SPRING_BOUNCY: Transition = { type: 'spring', stiffness: 420, damping: 14, mass: 0.8 };
/** Ressort ferme : appui du doigt (réponse immédiate, petit rebond au relâchement). */
export const SPRING_PRESS: Transition = { type: 'spring', stiffness: 600, damping: 24 };

/** Appui « gélatine » : on écrase vers le bas, ça rebondit au relâchement. */
export const PRESS = { scaleY: 0.9, scaleX: 1.05, y: 3, transition: SPRING_PRESS };
/** Survol : la tuile se soulève légèrement. */
export const LIFT = { y: -6, scale: 1.015, transition: SPRING_BOUNCY };

/** Point d'appui en bas : écrasement et étirement « posés au sol ». */
export const GROUNDED = { originY: 1 } as const;

/* ---------- Gestes (une fois) ---------- */

/** Une animation ponctuelle : des valeurs clés + leur transition. */
function kf<T extends Record<string, number[]>>(values: T, transition: Transition): T & { transition: Transition } {
  return { ...values, transition };
}

/** Une boucle continue (personnage « vivant »). */
export interface Loop {
  animate: Record<string, number[]>;
  transition: Transition;
}

/** Saut complet : accroupi → étiré en l'air → écrasé à la réception → retour. */
export function jump(height = 46, duration = 0.85) {
  return kf(
    { y: [0, 4, -height, -height, 0, -6, 0], scaleY: [1, 0.8, 1.14, 1, 0.84, 1.03, 1], scaleX: [1, 1.16, 0.9, 1, 1.14, 0.98, 1] },
    { duration, times: [0, 0.16, 0.42, 0.52, 0.76, 0.88, 1], ease: ['easeOut', 'easeOut', 'linear', 'easeIn', 'easeOut', 'easeInOut'] }
  );
}

/** Tortillement amorti : fort au début, de plus en plus petit. */
export function wiggle(angle = 16, duration = 0.9) {
  return kf({ rotate: [0, -angle, angle * 0.75, -angle * 0.5, angle * 0.28, -angle * 0.1, 0] }, { duration, ease: 'easeInOut' });
}

/** Pirouette avec élan en arrière et léger dépassement à l'arrivée. */
export function spin(duration = 1) {
  return kf({ rotate: [0, -24, 372, 356, 360], scale: [1, 0.92, 1.12, 1, 1] }, { duration, times: [0, 0.2, 0.75, 0.9, 1], ease: ['easeOut', 'easeInOut', 'easeOut', 'easeInOut'] });
}

/** Ressort qu'on écrase puis qui vibre en s'amortissant. */
export function boing(duration = 0.9) {
  return kf({ scaleY: [1, 0.7, 1.22, 0.9, 1.06, 0.98, 1], scaleX: [1, 1.26, 0.86, 1.08, 0.97, 1.01, 1] }, { duration, ease: 'easeOut' });
}

/** Apparition « pop » : surgit un peu trop grand puis se pose. */
export const POP_IN = { initial: { scale: 0, rotate: -12 }, animate: { scale: 1, rotate: 0 }, transition: SPRING_BOUNCY };

/** Secousse « non » amortie (mauvaise réponse). */
export const SHAKE = { x: [0, -12, 10, -7, 4, -2, 0], transition: { duration: 0.5, ease: 'easeOut' } as Transition };

/* ---------- Boucles « vivantes » ---------- */

/**
 * Respiration : le personnage n'est jamais figé. Aller-retour en miroir (pas de saut en fin de boucle).
 * À combiner avec GROUNDED.
 */
export const BREATHE = {
  animate: { scaleY: [1, 1.04], scaleX: [1, 0.985] },
  transition: { duration: 1.8, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' } as Transition
};

/** Flottement doux (nuages, héros des contes) : monte, descend, se balance un peu. */
export function float(distance = 10, duration = 2.6): Loop {
  return {
    animate: { y: [0, -distance], rotate: [-2, 2] },
    transition: {
      y: { duration, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' },
      rotate: { duration: duration * 1.7, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }
    } as Transition
  };
}

/** Balancement de gauche à droite, comme un pendule (accélère au milieu, ralentit aux bords). */
export function sway(angle = 12, duration = 1.4): Loop {
  return {
    animate: { rotate: [-angle, angle] },
    transition: { duration, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' } as Transition
  };
}

/** Sautillement en boucle avec écrasement à chaque réception. */
export function hopLoop(height = 40, duration = 0.8): Loop {
  const j = jump(height, duration);
  return { animate: { y: j.y, scaleY: j.scaleY, scaleX: j.scaleX }, transition: { ...j.transition, repeat: Infinity, repeatDelay: 0.08 } as Transition };
}

/** Course sur place : petits rebonds rapides et léger roulis des épaules. */
export function runLoop(duration = 0.36): Loop {
  return {
    animate: { y: [0, -10, 0], scaleY: [0.94, 1.04, 0.94], rotate: [-4, 4, -4] },
    transition: {
      y: { duration, repeat: Infinity, ease: 'easeInOut' },
      scaleY: { duration, repeat: Infinity, ease: 'easeInOut' },
      rotate: { duration: duration * 2, repeat: Infinity, ease: 'easeInOut' }
    } as Transition
  };
}

/** Étirement lent vers le haut (yoga), avec retour tout en douceur. */
export function stretchLoop(duration = 2.4): Loop {
  return {
    animate: { scaleY: [1, 1.22], scaleX: [1, 0.92], y: [0, -6] },
    transition: { duration, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' } as Transition
  };
}

/** Rotation continue mais douce (tai-chi, planète). */
export function turnLoop(duration = 3.2): Loop {
  return { animate: { rotate: [0, 360] }, transition: { duration, repeat: Infinity, ease: 'linear' } as Transition };
}

/** Geste de kung-fu dans le vide : élan en arrière, détente rapide, retour contrôlé. */
export function punchLoop(duration = 0.9): Loop {
  return {
    animate: { x: [0, -8, 22, 18, 0], scaleX: [1, 0.94, 1.1, 1.04, 1], rotate: [0, -4, 3, 2, 0] },
    transition: { duration, times: [0, 0.25, 0.4, 0.55, 1], ease: ['easeOut', 'easeIn', 'easeOut', 'easeInOut'], repeat: Infinity, repeatDelay: 0.25 }
  };
}

/** Respiration ample et lente (retour au calme). */
export function calmLoop(duration = 3.6): Loop {
  return {
    animate: { scale: [1, 1.1], y: [0, -4] },
    transition: { duration, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' } as Transition
  };
}

/* ---------- Gravité ---------- */

/**
 * Trajectoire balistique échantillonnée (x = vx·t, y = vy·t + ½·g·t²) : les particules
 * montent, ralentissent au sommet et retombent, comme de vrais confettis.
 */
export function ballistic(vx: number, vy: number, gravity = 900, duration = 1.1, steps = 10) {
  const xs: number[] = [];
  const ys: number[] = [];
  const times: number[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * duration;
    xs.push(vx * t * (1 - 0.25 * (i / steps))); // un peu de résistance de l'air
    ys.push(vy * t + 0.5 * gravity * t * t);
    times.push(i / steps);
  }
  return { x: xs, y: ys, times };
}
