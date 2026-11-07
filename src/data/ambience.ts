import type { Tale } from './format';

/** Particules d'ambiance animées, choisies d'après le sujet du conte. */
export interface Ambience {
  particles: string[];
  motion: 'rise' | 'fall' | 'twinkle' | 'drift';
}

const RULES: [RegExp, Ambience][] = [
  [/mer|vague|baleine|poisson|océan|lagon|pieuvre|crabe|phoque/i, { particles: ['🫧', '🫧', '·'], motion: 'rise' }],
  [/neige|hiver|flocon|banquise|pingouin|pingo/i, { particles: ['❄️', '❅', '·'], motion: 'fall' }],
  [/pluie|nuage|orage/i, { particles: ['💧', '·'], motion: 'fall' }],
  [/fleur|jardin|printemps|cerisier|tournesol|abeille|papillon|graine/i, { particles: ['🌸', '✿', '🍃'], motion: 'drift' }],
  [/automne|feuille|forêt|chêne|écureuil|gland|hérisson/i, { particles: ['🍂', '🍁', '🍃'], motion: 'fall' }],
  [/fusée|espace|planète|étoile filante|astronaute/i, { particles: ['⭐', '✦', '🪐'], motion: 'twinkle' }],
  [/musique|chanson|chante|berceuse|note|carillon/i, { particles: ['🎵', '🎶', '✦'], motion: 'rise' }],
  [/ballon|cirque|course|fête|anniversaire/i, { particles: ['🎈', '✨', '🎉'], motion: 'rise' }]
];

export function ambienceFor(t: Tale): Ambience {
  const text = `${t.title} ${t.pages.join(' ')}`;
  for (const [re, a] of RULES) if (re.test(text)) return a;
  return t.kind === 'soir' ? { particles: ['✦', '⭐', '·'], motion: 'twinkle' } : { particles: ['✨', '·', '✦'], motion: 'drift' };
}
