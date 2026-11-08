/**
 * Choix et réglage de la voix : une « conteuse » douce et chaleureuse.
 *  - on préfère les voix féminines naturelles/neuronales (bien plus douces que les voix classiques) ;
 *  - on adoucit le ton demandé par chaque écran : un peu plus lent, aigu mais jamais criard.
 */

/** Voix féminines françaises connues (Edge/Windows, Apple, Android…). */
const FEMALE = ['denise', 'vivienne', 'eloise', 'brigitte', 'coralie', 'jacqueline', 'josephine', 'yvette', 'celeste', 'audrey', 'amélie', 'amelie', 'aurélie', 'marie', 'julie', 'hortense', 'sylvie', 'ariane', 'google'];
/** Voix masculines : utilisées seulement s'il n'y a rien d'autre. */
const MALE = ['paul', 'thomas', 'henri', 'remy', 'rémy', 'claude', 'alain', 'jerome', 'jérôme', 'yves', 'antoine', 'fabrice', 'jean', 'nicolas', 'daniel'];

export interface VoiceLike {
  name: string;
  lang: string;
}

/** Note d'une voix : plus c'est haut, plus elle est douce. -1 = pas française. */
export function voiceScore(v: VoiceLike): number {
  if (!v.lang.toLowerCase().startsWith('fr')) return -1;
  const n = v.name.toLowerCase();
  let score = 0;
  if (/natural|neural|online|enhanced|premium|siri/.test(n)) score += 50; // voix de nouvelle génération
  if (FEMALE.some((f) => n.includes(f))) score += 20;
  if (MALE.some((m) => n.includes(m))) score -= 30;
  if (n.includes('google')) score += 10; // correcte et féminine sur Chrome / Android
  if (n.includes('multilingual')) score -= 5; // accent parfois moins naturel
  if (v.lang.toLowerCase() === 'fr-fr') score += 3;
  return score;
}

export function pickVoice<T extends VoiceLike>(voices: T[]): T | undefined {
  let best: T | undefined;
  let bestScore = -1;
  for (const v of voices) {
    const s = voiceScore(v);
    if (s > bestScore) {
      best = v;
      bestScore = s;
    }
  }
  return best;
}

const clamp = (x: number, min: number, max: number) => Math.min(max, Math.max(min, x));

/**
 * Ton de conteuse : on garde l'intention de chaque écran (plus gai, plus calme…)
 * mais on resserre tout vers une voix posée et douce.
 */
export function softTone(rate = 0.9, pitch = 1.1): { rate: number; pitch: number; volume: number } {
  return {
    rate: clamp(rate * 0.93, 0.72, 0.92),
    pitch: clamp(1 + (pitch - 1) * 0.5, 0.95, 1.12),
    volume: 0.9
  };
}
