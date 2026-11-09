import type { SportMove, SportTip } from '../../src/data/sport';
import { POSES, poseFor } from '../../src/lib/poses';
import { type Sign, signFor } from './MoveSigns';
import VOICES from './voices.json';

/** Les phrases dites par la voix off. Le fichier audio de chaque phrase porte le code de son texte. */

export const BRAVO_LINE = 'Bravo ! Tu peux être fier de toi. Pense à boire un verre d’eau.';
export const COUNT_LINES = ['Trois.', 'Deux.', 'Un.'];

/** Code court et stable d'un texte (FNV-1a), utilisable dans le navigateur comme en script. */
export function voiceKey(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

/** La petite histoire : un souci au début, la mascotte aide, on bouge, on est fier à la fin. */
const PROBLEMS = ['Oh là là, je me sens tout mou !', 'Oh non, mes jambes dorment encore !', 'Ouh là, je ne tiens plus en place !', 'Hum, je m’ennuie un peu…'];

export const seedOf = (tip: SportTip) => parseInt(voiceKey(tip.id), 16);
export const problemLine = (tip: SportTip) => PROBLEMS[seedOf(tip) % PROBLEMS.length];
export const helpLine = (tip: SportTip) => `Viens, on bouge ensemble : ${tip.title} !`;

/** Le refrain à répéter pendant le mouvement. */
const REFRAINS: Record<Sign, string> = {
  saut: 'On saute, on saute, hop hop hop !',
  balance: 'On tient, on tient, tout doux, tout doux !',
  course: 'On bouge, on bouge, vite vite vite !',
  etire: 'On s’étire, on s’étire, tout là-haut !',
  tourne: 'On tourne, on tourne, à petits pas !',
  calme: 'On respire, on respire, tout doucement.',
  frappe: 'Doucement, doucement, hop hop hop !',
  pousse: 'On pousse, on pousse, encore un peu !',
  baisse: 'On plie, on plie, et on remonte !'
};

export const refrainOf = (move: Pick<SportMove, 'anim' | 'text'>) => REFRAINS[signFor(move)];

/** Une seule instruction par mouvement : on laisse de la place à la musique. */
export const cueOf = (move: SportMove): string => (move.cues ?? POSES[poseFor(move)].cues)[0];

export function linesOf(tip: SportTip): string[] {
  return [problemLine(tip), helpLine(tip), ...tip.moves.flatMap((m) => [m.text, cueOf(m), refrainOf(m)])];
}

const DURATIONS = VOICES as Record<string, number>;

/** Durée de la phrase en secondes, ou null si son audio n'a pas encore été généré. */
export const voiceDuration = (text: string): number | null => DURATIONS[voiceKey(text)] ?? null;
export const voiceFile = (text: string) => `voice/${voiceKey(text)}.wav`;
