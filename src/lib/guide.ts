/**
 * Le guide vocal d'un mouvement : ce que la voix dit, et à quel moment, pour qu'un enfant de 5 à 8 ans
 * sache toujours quoi faire sans savoir lire.
 *
 * Trois façons de guider, choisies d'après la consigne :
 *  - « compte » : la consigne demande un nombre de fois (« plie les genoux dix fois », « fais 5 petits
 *    sauts ») → la voix compte avec l'enfant, à un rythme qu'il peut suivre ;
 *  - « souffle » : un exercice de respiration → la voix dit « inspire… souffle… », lentement ;
 *  - « libre » : les autres mouvements (tenir, danser, marcher…) → les 3 petits conseils un par un,
 *    des encouragements, « encore 5 secondes », puis « 3, 2, 1… stop ! ».
 * Les durées sont allongées pour laisser le temps de comprendre et de faire.
 */
import type { SportMove } from '../data/sport';

export type GuideMode = 'compte' | 'souffle' | 'libre';

export interface GuideEvent {
  /** Instant (s) depuis « Partez ! ». */
  at: number;
  say: string;
  /** Plus doux et plus lent (respiration). */
  calm?: boolean;
  /** Un chiffre du compte : affiché en grand. */
  count?: number;
}

export interface MoveGuide {
  mode: GuideMode;
  /** Durée réelle du mouvement (allongée). */
  seconds: number;
  /** Ce que la voix dit avant le décompte de départ. */
  intro: string;
  events: GuideEvent[];
}

const WORDS: Record<string, number> = { deux: 2, trois: 3, quatre: 4, cinq: 5, six: 6, sept: 7, huit: 8, neuf: 9, dix: 10, douze: 12, quinze: 15 };
export const NUMBER_WORDS = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze'];

/** Durée estimée d'une phrase lue par la voix douce (≈ 13 caractères par seconde). */
export const speechSeconds = (s: string) => 0.5 + s.length / 13;

/** Le nombre de répétitions demandé dans la consigne (« dix fois », « 5 petits sauts »), sinon null. */
export function repetitions(text: string): number | null {
  const t = text.toLowerCase();
  if (/secondes?/.test(t)) return null;
  const m = t.match(/\b(\d{1,2}|deux|trois|quatre|cinq|six|sept|huit|neuf|dix|douze|quinze)\b(?:\s+(?:petits?|grands?|grandes?|gros|tout|doux))*\s+(fois|sauts?|pas|tours?|respirations?|squats?|pompes?|bonds?)\b/);
  if (!m) return null;
  const n = /^\d+$/.test(m[1]) ? Number(m[1]) : WORDS[m[1]];
  return n >= 2 && n <= 15 ? n : null;
}

export const isBreathing = (move: SportMove) => /respir|inspire|souffle|gonfle ton ventre|dégonfle/i.test(move.text);

/** Phrases d'encouragement (on en tire une, toujours la même pour un mouvement donné). */
const BRAVOS = ['Continue, tu fais ça très bien !', 'Super, tu y arrives !', 'Bravo, continue comme ça !', 'C’est très bien, on continue !'];

/** Construit le guide vocal d'un mouvement (index dans la séance, nombre de mouvements). */
export function moveGuide(move: SportMove, index: number, total: number, cues: readonly string[]): MoveGuide {
  const consigne = /[.!?…]$/.test(move.text.trim()) ? move.text.trim() : `${move.text.trim()}.`;
  const head = `${index === 0 ? '' : 'Bravo ! On passe au mouvement suivant. '}Mouvement ${index + 1} sur ${total}. ${consigne}`;
  const reps = repetitions(move.text);
  const breathing = isBreathing(move);
  const base = Math.round(move.seconds * 1.3);

  // 0) Des respirations comptées : « inspire… souffle… un », au rythme d'une vraie respiration.
  if (reps && breathing) {
    const events: GuideEvent[] = [];
    for (let i = 1; i <= reps; i++) {
      const t = 0.5 + (i - 1) * 6;
      events.push({ at: t, say: 'Inspire par le nez…', calm: true });
      events.push({ at: t + 3, say: `Souffle… ${NUMBER_WORDS[i]} !`, calm: true, count: i });
    }
    const last = 0.5 + (reps - 1) * 6 + 6;
    events.push({ at: last, say: 'Bravo, tu as bien respiré.', calm: true });
    const seconds = Math.max(base, Math.ceil(last + 3));
    return { mode: 'compte', seconds, intro: `${head} On va respirer ${NUMBER_WORDS[reps]} fois ensemble. Je te dis quand inspirer et quand souffler, et on compte.`, events };
  }

  // 1) On compte les répétitions avec l'enfant.
  if (reps) {
    const pace = move.anim === 'saut' ? 1.6 : move.anim === 'calme' ? 3.2 : 2.2;
    const events: GuideEvent[] = [];
    for (let i = 1; i <= reps; i++) events.push({ at: 0.6 + (i - 1) * pace, say: `${NUMBER_WORDS[i]} !`, count: i });
    const end = 0.6 + (reps - 1) * pace + 1.4;
    events.push({ at: end, say: reps >= 5 ? `Et ${NUMBER_WORDS[reps]} ! Bravo, tu as réussi !` : 'Bravo, tu as réussi !' });
    const seconds = Math.max(base, Math.ceil(end + speechSeconds(events[events.length - 1].say) + 1));
    return { mode: 'compte', seconds, intro: `${head} On va compter ensemble jusqu’à ${NUMBER_WORDS[reps]}. Fais un mouvement à chaque fois que je dis un chiffre.`, events };
  }

  // 2) Respiration : la voix donne le rythme, lentement.
  if (breathing) {
    const cycle = 6; // 3 s pour inspirer, 3 s pour souffler
    const seconds = Math.max(base, 20);
    const events: GuideEvent[] = [];
    for (let t = 0.5; t + 5.5 <= seconds - 1.5; t += cycle) {
      events.push({ at: t, say: 'Inspire par le nez…', calm: true });
      events.push({ at: t + 3, say: 'Et souffle tout doucement…', calm: true });
    }
    events.push({ at: seconds - 1.6, say: 'Très bien.', calm: true });
    return { mode: 'souffle', seconds, intro: `${head} Je vais te dire quand inspirer et quand souffler. Écoute bien.`, events };
  }

  // 3) Mouvement libre : conseils un par un, encouragement, fin comptée.
  const seconds = Math.max(base, 18);
  const events: GuideEvent[] = [];
  const end = seconds - 3;
  let free = 1; // prochain instant libre (pas deux phrases en même temps)
  const plan: [number, string][] = [
    [1, cues[0]],
    [seconds * 0.32, cues[1]],
    [seconds * 0.55, cues[2]],
    [seconds * 0.72, BRAVOS[(move.text.length + index) % BRAVOS.length]],
    [end - 3.2, 'Encore cinq secondes !']
  ];
  for (const [want, say] of plan) {
    if (!say) continue;
    const at = Math.max(want, free);
    if (at + speechSeconds(say) > end - 0.2) continue;
    events.push({ at, say });
    free = at + speechSeconds(say) + 0.6;
  }
  [3, 2, 1].forEach((n, i) => events.push({ at: end + i, say: `${NUMBER_WORDS[n]}…`, count: n }));
  events.push({ at: seconds - 0.05, say: 'Stop !' });
  return { mode: 'libre', seconds, intro: `${head} Écoute bien, je te guide pendant le mouvement.`, events };
}
