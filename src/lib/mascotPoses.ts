import type { MoveAnim } from '../data/sport';
import type { Mood } from './mascots';
import { BREATHE, calmLoop, hopLoop, type Loop, punchLoop, runLoop, stretchLoop, sway } from './motion';

/** Les poses des mascottes : angles des pattes et de la tête, partagés entre l'app et les vidéos. */

export type Mouth = 'sourire' | 'parle' | 'joie' | 'oh' | 'aucune';

export interface Pose {
  armL: number[];
  armR: number[];
  legL?: number[];
  legR?: number[];
  head: number[];
  /** Durée d'un aller, en secondes. */
  tempo: number;
  body: Loop;
  closed?: boolean;
  mouth: Mouth;
}

const STILL: Loop = BREATHE as Loop;

export const MOODS: Record<Mood, Pose> = {
  idle: { armL: [6, 12], armR: [-6, -12], head: [-3, 3], tempo: 1.8, body: STILL, mouth: 'sourire' },
  talk: { armL: [8, 14], armR: [-20, -62], head: [-4, 4], tempo: 0.7, body: STILL, mouth: 'parle' },
  cheer: { armL: [120, 150], armR: [-120, -150], head: [-6, 6], tempo: 0.35, body: hopLoop(22, 0.7), mouth: 'joie' },
  hint: { armL: [6, 10], armR: [-95, -112], head: [6, 12], tempo: 0.5, body: sway(3, 1), mouth: 'sourire' },
  oops: { armL: [25, 36], armR: [-25, -36], head: [-10, 10], tempo: 0.42, body: STILL, mouth: 'oh' },
  sleep: { armL: [4, 6], armR: [-4, -6], head: [10, 14], tempo: 3.6, body: calmLoop(3.6), closed: true, mouth: 'aucune' }
};

/** Tourner sur soi-même : on écrase la largeur et on passe de l'autre côté, sans jamais se retrouver la tête en bas. */
const SPIN_IN_PLACE: Loop = { animate: { scaleX: [1, 0.15, -1, 0.15, 1] }, transition: { duration: 2.4, repeat: Infinity, ease: 'linear' } };

export const GESTURES: Record<MoveAnim, Pose> = {
  saut: { armL: [30, 140], armR: [-30, -140], legL: [0, 14], legR: [0, -14], head: [-3, 3], tempo: 0.42, body: hopLoop(44, 0.85), mouth: 'joie' },
  balance: { armL: [85, 96], armR: [-85, -96], legL: [0, 2], legR: [-58, -66], head: [-3, 3], tempo: 1.5, body: sway(5, 1.5), mouth: 'sourire' },
  course: { armL: [-35, 35], armR: [35, -35], legL: [32, -32], legR: [-32, 32], head: [-3, 3], tempo: 0.34, body: runLoop(0.34), mouth: 'joie' },
  etire: { armL: [118, 146], armR: [-118, -146], head: [-3, 3], tempo: 2.4, body: stretchLoop(2.4), mouth: 'sourire' },
  tourne: { armL: [80, 100], armR: [-80, -100], head: [0, 0], tempo: 0.8, body: SPIN_IN_PLACE, mouth: 'joie' },
  calme: { armL: [10, 30], armR: [-10, -30], head: [-2, 2], tempo: 3.6, body: calmLoop(3.6), closed: true, mouth: 'sourire' },
  frappe: { armL: [70, 12], armR: [-12, -85], head: [-3, 3], tempo: 0.55, body: punchLoop(0.9), mouth: 'sourire' }
};

