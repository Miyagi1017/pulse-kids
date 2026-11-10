/**
 * L'âge de l'enfant : 🐣 5–6 ans (« petit ») ou 🦊 7–8 ans (« grand »).
 *
 * L'âge ne sert QU'À adapter ce que l'enfant voit et entend : longueur des phrases,
 * vitesse de la voix, explications supplémentaires. Il reste sur l'appareil, comme le prénom.
 */
export type AgeBand = 'petit' | 'grand';

export const AGE_BANDS: AgeBand[] = ['petit', 'grand'];

export const AGE_INFO: Record<
  AgeBand,
  {
    /** « 5–6 ans » */
    label: string;
    /** « 5-6 » */
    short: string;
    emoji: string;
    /** Vitesse de narration demandée (la voix est ensuite adoucie par softTone). */
    speechRate: number;
    pitch: number;
    /** Ce que le mode change, en une phrase (affiché dans l'onboarding). */
    hint: string;
    /** Libellé du bouton qui révèle l'explication détaillée. */
    moreLabel: string;
    /** Version dite à voix haute (« Cinq ou six ans »). */
    spoken: string;
  }
> = {
  petit: {
    label: '5–6 ans',
    short: '5-6',
    emoji: '🐣',
    speechRate: 0.8,
    pitch: 1.15,
    hint: 'Des phrases courtes et une voix très lente.',
    moreLabel: 'Une autre idée',
    spoken: 'Cinq ou six ans'
  },
  grand: {
    label: '7–8 ans',
    short: '7-8',
    emoji: '🦊',
    speechRate: 0.9,
    pitch: 1.1,
    hint: 'Des explications plus détaillées et une voix un peu plus rapide.',
    moreLabel: 'Pour aller plus loin',
    spoken: 'Sept ou huit ans'
  }
};

export function isAgeBand(value: unknown): value is AgeBand {
  return value === 'petit' || value === 'grand';
}

/** Lit un âge stocké (ou reçu d'ailleurs) en retombant sur « petit » : jamais d'erreur. */
export function readAge(value: unknown): AgeBand {
  return isAgeBand(value) ? value : 'petit';
}

/** L'autre bande d'âge (le bouton de l'accueil alterne entre les deux). */
export function otherAge(age: AgeBand): AgeBand {
  return age === 'petit' ? 'grand' : 'petit';
}

/** Vitesse de narration pour cet âge (0.8 = très lente, 0.9 = lente mais fluide). */
export function narrationRate(age: AgeBand): number {
  return AGE_INFO[age].speechRate;
}

/**
 * Le texte à lire/lire à voix haute pour une étape d'explication selon l'âge.
 * 5–6 ans : l'essentiel seulement. 7–8 ans : l'essentiel + le complément.
 */
export function stepText(step: { text: string; more?: string }, age: AgeBand): string {
  return age === 'grand' && step.more ? `${step.text} ${step.more}` : step.text;
}
