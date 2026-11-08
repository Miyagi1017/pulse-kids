/**
 * Quelle mascotte pour quel écran : logique pure (testée), sans dessin.
 * Le dessin et les mouvements sont dans components/Mascot.tsx.
 */
import type { SceneTheme } from '../components/ThemeScene';
import type { MoveAnim, SportMove } from '../data/sport';

export type Animal = 'tigre' | 'grue' | 'singe' | 'ours' | 'cerf' | 'dauphin' | 'pingouin' | 'hibou';
export type Mood = 'idle' | 'talk' | 'cheer' | 'hint' | 'oops' | 'sleep';

export const ANIMALS: Animal[] = ['tigre', 'grue', 'singe', 'ours', 'cerf', 'dauphin', 'pingouin', 'hibou'];

export const SCENE_MASCOT: Record<SceneTheme, Animal> = {
  animaux: 'tigre',
  nature: 'cerf',
  espace: 'singe',
  metiers: 'ours',
  corps: 'tigre',
  monde: 'grue',
  journal: 'hibou',
  mer: 'dauphin',
  neige: 'pingouin',
  pluie: 'grue',
  fete: 'singe',
  nuit: 'hibou',
  kawaii: 'singe',
  kawaiiFille: 'cerf',
  kawaiiGarcon: 'tigre'
};

export const MOVE_MASCOT: Record<MoveAnim, Animal> = {
  saut: 'singe',
  balance: 'grue',
  course: 'tigre',
  etire: 'cerf',
  tourne: 'dauphin',
  calme: 'ours',
  frappe: 'tigre'
};

export function mascotForScene(theme: SceneTheme): Animal {
  return SCENE_MASCOT[theme];
}

/** Une séance peut imposer son animal ; sinon il dépend du type de mouvement. */
export function mascotForMove(move: Pick<SportMove, 'anim' | 'mascotte'>): Animal {
  return move.mascotte ?? MOVE_MASCOT[move.anim];
}
