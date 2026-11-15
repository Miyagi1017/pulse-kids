/**
 * Minutage réel des prises de Christine (méthode Video-Making : alignement forcé MMS_FA, scripts/voix/align_videos.py).
 * Pour chaque vidéo et chaque scène : la durée de la prise et le début/fin de chaque mot dit.
 * Le montage s'en sert pour caler les plans sur la voix (le coup de zoom tombe juste avant le mot fort,
 * le plan dure le temps de la phrase plus une respiration) et pour allumer les mots au bon moment.
 */
import TIMING from './timing.json';

export interface SceneTiming {
  /** Durée de la prise, en secondes. */
  d: number;
  /** Début et fin de chaque mot (séparé par des espaces) du texte dit ; null pour un signe sans lettre. */
  w: ([number, number] | null)[];
}

const DATA = TIMING as unknown as Record<string, SceneTiming[]>;

export function sceneTiming(id: string, scene: number): SceneTiming | undefined {
  return DATA[id]?.[scene];
}

/** Respiration après la dernière syllabe, avant de couper (Video-Making : on coupe juste après la phrase). */
export const TAIL = 0.45;
/** Durée minimale de chaque plan : le temps que la mise en scène se lise (titre, présentation, gros plan, plan large, question). */
export const MIN_SHOT = [2.4, 2.6, 3.4, 2.6, 2.8];
/** Plan sans prise enregistrée (voix du navigateur) : durée par défaut. */
const DEFAULT_SHOT = [2.6, 3.2, 3.8, 3.2, 3.2];

/** Durée du plan : la voix + une respiration, jamais moins que ce que l'action demande. */
export function shotLength(id: string, scene: number): number {
  const t = sceneTiming(id, scene);
  const min = MIN_SHOT[Math.min(scene, MIN_SHOT.length - 1)];
  return t ? Math.max(min, t.d + TAIL) : DEFAULT_SHOT[Math.min(scene, DEFAULT_SHOT.length - 1)];
}

/** Lettres d'un mot sans accents ni ponctuation, pour comparer le texte affiché au texte dit. */
export function letters(w: string): string {
  return w
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z]/g, '');
}

/** Le prénom n'est pas enregistré : « Et toi {p}, tu… » se dit « Et toi, tu… ». */
export function noName(s: string): string {
  return s
    .replace(/\s*\{p\}\s*([,!?.])/g, '$1')
    .replace(/\{p\}/g, '')
    .replace(/\s+([,!?.])/g, '$1')
    .replace(/,\s*,/g, ',')
    .replace(/,\s*([!?.])/g, '$1')
    .trim();
}

/**
 * Le moment où s'allume chaque mot affiché. Le texte affiché peut contenir le prénom, que Christine ne dit pas :
 * il s'allume avec le mot qui le précède. Sans minutage, null.
 */
export function wordStarts(id: string, scene: number, raw: string, shown: string[]): number[] | null {
  const t = sceneTiming(id, scene);
  const said = noName(raw).split(/\s+/).filter(Boolean);
  if (!t || t.w.length !== said.length) return null;
  const out: number[] = [];
  let k = 0,
    last = 0;
  for (const w of shown) {
    const l = letters(w);
    // On avance dans le texte dit jusqu'au mot qui correspond ; un mot affiché absent (le prénom) garde l'instant précédent.
    for (let j = k; l && j < said.length && j < k + 3; j++) {
      if (letters(said[j]) === l) {
        if (t.w[j]) last = t.w[j]![0];
        k = j + 1;
        break;
      }
    }
    out.push(last);
  }
  return out;
}

/** Le mot fort d'une phrase : le plus long mot de contenu (le coup de zoom tombe juste avant). */
export function keyWordStart(id: string, scene: number, text: string): number | null {
  const t = sceneTiming(id, scene);
  if (!t) return null;
  const words = noName(text).split(/\s+/).filter(Boolean);
  let best = -1,
    len = 0;
  words.forEach((w, i) => {
    const l = letters(w).length;
    // Les deux premiers mots installent la phrase ; on cherche le sujet un peu plus loin.
    if (i >= 1 && l > len && t.w[i]) {
      best = i;
      len = l;
    }
  });
  return best >= 0 ? t.w[best]![0] : null;
}
