import type { MoveAnim } from '../../src/data/sport';
import type { Animal, Mood } from '../../src/lib/mascots';

/**
 * Le texte des vidéos au format éducatif : phrases courtes, écrites pour un enfant de 5 ans qui ne lit pas encore.
 * Relu d'après la revue de sécurité (pulse-kids-5-videos-revue-securite.md) : ne pas changer une consigne sans la revoir.
 */

export interface EduStep {
  text: string;
  anim: MoveAnim;
  /** Une seconde phrase, dite en alternance avec l'étape. */
  also?: string;
  /** Dite une seule fois : par exemple un nombre de répétitions. */
  once?: boolean;
  mood?: Mood;
}

export interface EduScript {
  animal: Animal;
  intro: string;
  learn: string;
  learnLabel: string;
  /** Durée de chaque étape, en secondes. */
  stepSeconds: number;
  steps: EduStep[];
  safety: string[];
  safetyLabel: string;
  safetyEmoji: string;
  story: string;
}

export const QUESTION_LINE = 'Bravo ! Comment tu te sens maintenant ?';
export const CHOICE_LINE = 'Tu peux recommencer, ou t’arrêter.';
export const BYE_LINE = 'Bravo, à bientôt !';

export const EDU_SCRIPTS: Record<string, EduScript> = {
  'physique-61': {
    animal: 'cerf',
    intro: 'Aujourd’hui, on joue à la montagne.',
    learn: 'Tu vas apprendre à tenir bien droit.',
    learnLabel: 'Tenir droit',
    stepSeconds: 16,
    steps: [
      { text: 'Mets-toi debout, pieds joints.', anim: 'calme' },
      { text: 'Laisse tes bras le long du corps.', anim: 'calme' },
      { text: 'Respire. Un. Deux. Trois.', anim: 'calme' },
      { text: 'Ta tête touche le ciel.', anim: 'etire' }
    ],
    safety: ['Si tu bouges trop, mets ton dos au mur.'],
    safetyLabel: 'Dos au mur',
    safetyEmoji: '🧱',
    story: 'Tu es une grande montagne.'
  },
  'physique-70': {
    animal: 'ours',
    intro: 'Aujourd’hui, on joue au ventre ballon.',
    learn: 'Tu vas apprendre à respirer avec le ventre.',
    learnLabel: 'Le ventre respire',
    // Étapes courtes : on ne garde jamais l'air entre deux gestes.
    stepSeconds: 9,
    steps: [
      { text: 'Allonge-toi sur le dos.', anim: 'calme' },
      { text: 'Pose une main sur ton ventre.', anim: 'calme' },
      { text: 'Respire par le nez. Le ventre gonfle.', anim: 'calme', once: true },
      { text: 'Souffle par la bouche. Le ballon se dégonfle.', anim: 'calme', once: true },
      { text: 'Recommence trois fois.', anim: 'calme', once: true }
    ],
    safety: ['Si tu as la tête qui tourne, respire normalement.', 'Pas besoin de retenir ton souffle.'],
    safetyLabel: 'Respire normalement',
    safetyEmoji: '🌬️',
    story: 'Ton ventre est un gentil ballon.'
  },
  'physique-84': {
    animal: 'grue',
    intro: 'Aujourd’hui, on joue à la grue.',
    learn: 'Tu vas apprendre à tenir sur une jambe.',
    learnLabel: 'Sur une jambe',
    stepSeconds: 12,
    steps: [
      { text: 'Tiens-toi debout, une main sur le mur.', anim: 'calme' },
      { text: 'Pose ton poids sur une jambe.', anim: 'balance' },
      { text: 'Lève un genou devant toi.', anim: 'balance' },
      { text: 'Ouvre un bras comme une aile.', anim: 'balance' },
      { text: 'Reste comme une grue. Une respiration.', anim: 'balance', once: true },
      { text: 'Change de jambe.', anim: 'balance' }
    ],
    safety: ['Si tu perds l’équilibre, pose le pied.'],
    safetyLabel: 'Pose le pied',
    safetyEmoji: '🦶',
    story: 'La grue se tient sur une patte.'
  },
  'physique-95': {
    animal: 'tigre',
    intro: 'Aujourd’hui, on joue au chat en boule.',
    learn: 'Tu vas apprendre à arrondir ton dos.',
    learnLabel: 'Dos tout rond',
    stepSeconds: 16,
    steps: [
      { text: 'Assieds-toi sur le tapis, dos tout rond.', anim: 'calme' },
      { text: 'Ramène tes genoux contre toi.', anim: 'calme' },
      { text: 'Serre tes jambes avec tes bras.', anim: 'calme' },
      { text: 'Berce-toi doucement de gauche à droite.', also: 'Ne roule pas en arrière.', anim: 'balance' }
    ],
    safety: ['Si ça fait mal, arrête-toi.'],
    safetyLabel: 'On arrête',
    safetyEmoji: '🛑',
    story: 'Le chat se met en boule pour dormir.'
  },
  'physique-105': {
    animal: 'singe',
    intro: 'Aujourd’hui, on joue aux émotions en gestes.',
    learn: 'Tu vas apprendre à nommer tes émotions.',
    learnLabel: 'Nommer ses émotions',
    stepSeconds: 13,
    steps: [
      { text: 'Mets-toi debout, sans te presser.', anim: 'calme' },
      { text: 'Je dis une émotion.', anim: 'calme', once: true },
      { text: 'Joyeux : les bras en l’air.', anim: 'etire', mood: 'cheer' },
      { text: 'Triste : les épaules en bas.', anim: 'calme', mood: 'hint' },
      { text: 'Choisis celle que tu veux.', anim: 'calme' }
    ],
    safety: ['Tu peux garder ton idée pour toi.', 'Tu peux aussi ne rien montrer.', 'Tu peux en parler à un grand.'],
    safetyLabel: 'Ton choix',
    safetyEmoji: '💛',
    story: 'Ton corps sait dire ce que tu sens.'
  }
};

export const eduLines = (s: EduScript): string[] => [
  s.intro,
  s.learn,
  ...s.steps.flatMap((x) => (x.also ? [x.text, x.also] : [x.text])),
  ...s.safety,
  s.story,
  QUESTION_LINE,
  CHOICE_LINE,
  BYE_LINE
];
