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
  /** Une version par thème de l'app (rose / bleu). */
  medias: Record<ChansonTheme, ChansonMedia>;
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

export function chansonOf(id: string): Chanson | undefined {
  return CHANSONS.find((c) => c.id === id);
}

/** La version à jouer pour le thème choisi (kawaii et aquarelle prennent la version rose). */
export function mediaFor(chanson: Chanson, theme: Theme): ChansonMedia {
  return chanson.medias[theme === 'garcon' ? 'garcon' : 'fille'];
}

/** La chanson mise en avant sur l'accueil (une seule pour l'instant). */
export const CHANSON_DU_JOUR = CHANSONS[0];
