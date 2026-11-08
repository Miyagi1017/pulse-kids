import type { SportTip } from '../../src/data/sport';
import VOICES from './voices.json';

/** Les phrases dites par la voix off. Le fichier audio de chaque phrase porte le code de son texte. */

export const BRAVO_LINE = 'Bravo ! Tu as réussi. Pense à boire un verre d’eau.';
export const COUNT_LINES = ['Trois.', 'Deux.', 'Un.'];
export const titleLine = (tip: SportTip) => `${tip.title}. ${tip.tip}`;

/** Code court et stable d'un texte (FNV-1a), utilisable dans le navigateur comme en script. */
export function voiceKey(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

export function linesOf(tip: SportTip): string[] {
  return [titleLine(tip), ...tip.moves.map((m) => m.text)];
}

const DURATIONS = VOICES as Record<string, number>;

/** Durée de la phrase en secondes, ou null si son audio n'a pas encore été généré. */
export const voiceDuration = (text: string): number | null => DURATIONS[voiceKey(text)] ?? null;
export const voiceFile = (text: string) => `voice/${voiceKey(text)}.wav`;
