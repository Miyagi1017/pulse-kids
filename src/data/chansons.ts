/**
 * Les petites chansons animées : des épisodes vidéo courts (24 s), produits en local et
 * entièrement embarqués dans le dépôt.
 *
 * Chaque chanson existe en **deux thèmes de couleurs**, comme l'app : « fille » (rose) et
 * « garçon » (bleu). Le lecteur choisit la version qui correspond au thème de l'enfant.
 *
 * Elle fournit aussi :
 *  - une affiche par thème ;
 *  - les paroles horodatées (karaoké synchronisé sur la voix) ;
 *  - une question de compréhension et une phrase à retenir, comme les explications.
 *
 * Le pipeline qui fabrique l'épisode est open source et local : voir scripts/chansons/.
 */
import type { ExplainQuiz } from './explications';
import type { Theme } from '../lib/theme';
import { COMPTINES, GESTE_INFO, type Comptine } from './comptines';
import TIMINGS from './comptinesTimings.json';
import { estimateTiming, type ComptineTiming } from '../comptines/stage';

export interface ChansonLyric {
  start: number;
  end: number;
  text: string;
}

export type ChansonTheme = 'fille' | 'garcon';

export interface ChansonMedia {
  video: string;
  poster: string;
}

export interface Chanson {
  id: string;
  title: string;
  emoji: string;
  /** Durée en secondes (sert à la barre de progression). */
  duration: number;
  /** Une version par thème de l'app (rose / bleu) — épisodes vidéo seulement. */
  medias?: Record<ChansonTheme, ChansonMedia>;
  /** Comptine animée en direct : la mise en scène, son horaire et sa bande-son. */
  comptine?: { spec: Comptine; timing: ComptineTiming; audio: string };
  lyrics: ChansonLyric[];
  quiz: ExplainQuiz;
  /** La phrase à retenir après la chanson. */
  retiens: string;
  /** Un petit geste à refaire à la maison. */
  geste: string;
}

export const CHANSONS: Chanson[] = [
  {
    id: 'chanson-nino-range',
    title: 'Nino et Nina rangent leurs jouets',
    emoji: '🧸',
    duration: 24,
    medias: {
      fille: {
        video: '/videos/chansons/nino-nina-fille.mp4',
        poster: '/videos/chansons/nino-nina-fille.jpg'
      },
      garcon: {
        video: '/videos/chansons/nino-nina-garcon.mp4',
        poster: '/videos/chansons/nino-nina-garcon.jpg'
      }
    },
    lyrics: [
      { start: 0.9, end: 4.715, text: 'Range, range, range les jouets,' },
      { start: 4.9, end: 8.814, text: 'Un, deux, trois, dans le panier !' },
      { start: 8.933, end: 12.748, text: 'Range, range, range les jouets,' },
      { start: 12.9, end: 17.154, text: 'La chambre est toute rangée !' },
      { start: 19.3, end: 21.06, text: 'Bravo !' }
    ],
    quiz: {
      q: 'Que font Nino et Nina avec les cubes ?',
      choices: ['Ils les rangent dans le panier', 'Ils les cachent sous le tapis', 'Ils les jettent par la fenêtre'],
      answer: 0,
      why: 'Nino et Nina chantent et rangent : un cube après l’autre, tout finit dans le panier.'
    },
    retiens: 'Ranger, c’est ranger un jouet à la fois… et la chambre est contente !',
    geste: 'Choisis trois jouets avec un adulte et range-les en chantant « range, range, range » : tu as le droit de danser entre deux !'
  }
];

/* ------------------------------------------------------------------ */
/* Les 100 comptines, présentées comme des chansons                    */
/* ------------------------------------------------------------------ */

const timings = TIMINGS as unknown as Record<string, ComptineTiming>;

/** Petit hasard stable, pour que le quiz d'une comptine soit toujours le même. */
function seededPick(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return (n: number) => {
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h >>> 0) % n + n) % n;
  };
}

/** « Complète la comptine » : le début d'une ligne, et trois fins possibles (une seule est la bonne). */
function quizFor(c: Comptine, index: number): ExplainQuiz {
  const pick = seededPick(c.id);
  const line = 1 + pick(3); // ligne 2, 3 ou 4 (la 1re est la plus facile à deviner par le titre)
  const split = (s: string) => {
    const words = s.split(' ');
    const cut = Math.max(2, Math.ceil(words.length / 2));
    return { head: words.slice(0, cut).join(' '), tail: words.slice(cut).join(' ').replace(/[,.!?]+$/, '').trim() };
  };
  const { head, tail } = split(c.lines[line]);
  const others: string[] = [];
  for (let k = 1; others.length < 2 && k < COMPTINES.length; k++) {
    const o = COMPTINES[(index + k * 17) % COMPTINES.length];
    const ot = split(o.lines[line]).tail;
    if (ot && ot !== tail && !others.includes(ot)) others.push(ot);
  }
  const answer = pick(3);
  const choices = [...others];
  choices.splice(answer, 0, tail);
  return {
    q: `Complète la comptine : « ${head}… »`,
    choices: choices as [string, string, string],
    answer,
    why: `Dans « ${c.title} », on chante : « ${c.lines[line]} »`
  };
}

function comptineChanson(c: Comptine, index: number): Chanson {
  const timing = timings[c.id] ?? estimateTiming(c);
  const texts = [...c.lines, c.shout];
  const gestes = [...new Set(c.gestes)].map((g) => `${GESTE_INFO[g].emoji} ${GESTE_INFO[g].label}`);
  return {
    id: c.id,
    title: c.title,
    emoji: c.emoji,
    duration: timing.duration,
    lyrics: timing.lines.map(([start, end], i) => ({ start, end: Math.max(end, start + 1.2), text: texts[i] })),
    quiz: quizFor(c, index),
    retiens: c.retiens,
    geste: `Rechante « ${c.title} » avec les gestes : ${gestes.join(', ')}.`,
    comptine: { spec: c, timing, audio: `/comptines/${c.id}.m4a` }
  };
}

export const COMPTINES_CHANSONS: Chanson[] = COMPTINES.map(comptineChanson);

/** Toutes les chansons : l'épisode vidéo, puis les 100 comptines animées. */
export const ALL_CHANSONS: Chanson[] = [...CHANSONS, ...COMPTINES_CHANSONS];

export function chansonOf(id: string): Chanson | undefined {
  return ALL_CHANSONS.find((c) => c.id === id);
}

/** Une chanson au hasard, de préférence pas encore chantée (et jamais celle qu'on vient d'écouter). */
export function randomChanson(done: Set<string>, exceptId?: string): Chanson {
  const pool = ALL_CHANSONS.filter((c) => c.id !== exceptId);
  const fresh = pool.filter((c) => !done.has(c.id));
  const from = fresh.length ? fresh : pool;
  return from[Math.floor(Math.random() * from.length)];
}

/** La version à jouer pour le thème choisi (kawaii et aquarelle prennent la version rose). */
export function mediaFor(chanson: Chanson, theme: Theme): ChansonMedia | undefined {
  return chanson.medias?.[theme === 'garcon' ? 'garcon' : 'fille'];
}

/** La palette des dessins pour le thème choisi. */
export const paletteFor = (theme: Theme): ChansonTheme => (theme === 'garcon' ? 'garcon' : 'fille');

/** L'épisode vidéo historique (gardé pour les liens et les tests). */
export const CHANSON_DU_JOUR = CHANSONS[0];
