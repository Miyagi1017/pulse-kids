/**
 * Pour aller plus loin avec Jamy : liens vers des vidéos des chaînes YouTube OFFICIELLES
 * « C'est pas sorcier », « C'est toujours pas sorcier » et « Le Monde De Jamy - France Télévisions »,
 * rangées par thème : les 6 thèmes des vidéos + les sciences, les bons gestes, bien manger, la planète,
 * et « Comment c'est fabriqué ? » (chaîne « Je T'explique Comment », sujets neutres choisis à la main).
 * Identifiants, titres, chaînes et durées relevés sur YouTube le 7 novembre 2026.
 * On privilégie les formats très courts (≈ 1 min, dont #LaMinuteJamy), adaptés aux 5 ans.
 * Ce sont de simples liens : rien n'est chargé depuis YouTube tant qu'un adulte n'ouvre pas la vidéo.
 */
import type { VideoTheme } from './videos';

export interface JamyVideo {
  id: string; // identifiant YouTube
  title: string;
  channel: "C'est pas sorcier" | "C'est toujours pas sorcier" | 'Le Monde de Jamy' | "Je T'explique Comment" | 'Human Tetris Workout' | 'Tibo InShape Entrainement';
  duration: string;
}

/** Thèmes en plus de ceux des vidéos : la science et la vie de tous les jours. */
export const EXTRA_THEMES = {
  sciences: { label: 'Les sciences', emoji: '🔬' },
  gestes: { label: 'Les bons gestes', emoji: '🧼' },
  manger: { label: 'Bien manger', emoji: '🍎' },
  planete: { label: 'La planète', emoji: '♻️' },
  fabrique: { label: 'Comment c’est fabriqué ?', emoji: '🏭' }
} as const;

export type JamyTheme = VideoTheme | keyof typeof EXTRA_THEMES;

export const JAMY: Record<JamyTheme, JamyVideo[]> = {
  animaux: [
    { id: 'qTcakdB17uI', title: 'Comment l’abeille butine-t-elle ?', channel: "C'est pas sorcier", duration: '0:41' },
    { id: 'HtVJcg0key8', title: 'Pourquoi les éléphants ont-ils de grandes oreilles ?', channel: "C'est pas sorcier", duration: '1:02' },
    { id: 'BqvNOs3eJhY', title: 'Comment le sonar du dauphin fonctionne-t-il ?', channel: "C'est pas sorcier", duration: '1:21' },
    { id: 'OFsFbBlCUyg', title: 'Les secrets des abeilles', channel: 'Le Monde de Jamy', duration: '17:18' }
  ],
  nature: [
    { id: 'Pxm2Krt7VAs', title: 'Pourquoi les feuilles tombent-elles ?', channel: "C'est pas sorcier", duration: '0:57' },
    { id: 'noCukKQb7-k', title: 'Pourquoi les feuilles changent de couleur ?', channel: "C'est pas sorcier", duration: '1:05' },
    { id: 'al94rezMJL0', title: 'Arbres feuillus et conifères : quelle différence ?', channel: "C'est pas sorcier", duration: '0:54' },
    { id: '273fv8bancY', title: 'Pourquoi les saisons changent ?', channel: "C'est pas sorcier", duration: '1:40' }
  ],
  espace: [
    { id: 'Njz8Gl6FLug', title: 'Pourquoi les astronautes flottent-ils dans l’espace ?', channel: 'Le Monde de Jamy', duration: '1:01' },
    { id: '1Or5zSH_qLI', title: 'Comment se forment les aurores boréales ?', channel: 'Le Monde de Jamy', duration: '1:00' },
    { id: '0i4decADw1E', title: 'Comment marche le système solaire ?', channel: "C'est pas sorcier", duration: '2:03' },
    { id: '-1R9dUk233c', title: 'La Lune dans tous ses états', channel: 'Le Monde de Jamy', duration: '11:11' }
  ],
  metiers: [
    { id: '-hW5E3zLzoI', title: 'Au feu les pompiers', channel: "C'est pas sorcier", duration: '26:00' },
    { id: 'gdajFlDZ3B4', title: 'Du blé au pain', channel: "C'est pas sorcier", duration: '25:36' },
    { id: 'pAVP1u5Npn8', title: 'Comment les astronautes se préparent à voyager dans l’espace ?', channel: "C'est pas sorcier", duration: '26:11' }
  ],
  corps: [
    { id: 'xbIHaC_6QPc', title: 'Qu’est-ce qu’une dent ?', channel: "C'est pas sorcier", duration: '1:23' },
    { id: 'wyar14uyapQ', title: 'Pourquoi le sucre est-il mauvais pour les dents ?', channel: "C'est pas sorcier", duration: '0:50' },
    { id: 'tCZ99RD60Wg', title: 'Pourquoi sursautons-nous pendant notre sommeil ?', channel: 'Le Monde de Jamy', duration: '1:01' },
    { id: 'nVyMQmWjYbs', title: 'Pourquoi le cœur des sportifs bat-il moins vite ?', channel: "C'est pas sorcier", duration: '0:41' }
  ],
  monde: [
    { id: 'Anl7KvVnc-k', title: 'Pourquoi la mer est salée ?', channel: "C'est pas sorcier", duration: '0:52' },
    { id: 'asM7tWaSwd8', title: 'Pourquoi la mer est-elle bleue ?', channel: 'Le Monde de Jamy', duration: '0:58' },
    { id: '6I9lQkEcIOw', title: 'Pourquoi y a-t-il des marées ?', channel: 'Le Monde de Jamy', duration: '1:01' }
  ],
  sciences: [
    { id: 'zTwu2X5yuSQ', title: 'Comment se forment les arcs-en-ciel ?', channel: 'Le Monde de Jamy', duration: '1:01' },
    { id: 'U1OEPKrOsMo', title: 'D’où viennent les nuages ?', channel: "C'est pas sorcier", duration: '1:42' },
    { id: '1A8eWjANWyU', title: 'Comment se forme un éclair ?', channel: "C'est pas sorcier", duration: '2:05' },
    { id: 'EGk095p3hJs', title: 'Comment fabriquer de l’électricité avec de l’eau ?', channel: "C'est pas sorcier", duration: '0:55' }
  ],
  gestes: [
    { id: 'AD9XD9eEL5A', title: 'Comment le savon lave-t-il ?', channel: "C'est pas sorcier", duration: '1:11' },
    { id: 'De_Cn97cVgk', title: 'À quoi ressemble une bactérie ?', channel: "C'est pas sorcier", duration: '1:23' },
    { id: 'egWE1u14vjM', title: 'Comment le corps se défend-il contre les bactéries ?', channel: "C'est pas sorcier", duration: '1:32' },
    { id: 'UhBXvDlVKz0', title: 'Pourquoi dormons-nous ?', channel: "C'est pas sorcier", duration: '1:32' }
  ],
  manger: [
    { id: '_mOETm_WQ9E', title: 'Comment le fruit se forme-t-il ?', channel: "C'est pas sorcier", duration: '1:00' },
    { id: '43c99CoLryQ', title: 'Quand un fruit est-il mûr ?', channel: "C'est pas sorcier", duration: '1:08' },
    { id: 'LgHgOxtonmM', title: 'La nutrition', channel: "C'est pas sorcier", duration: '26:01' }
  ],
  planete: [
    { id: 'k6ZAt1vUfKo', title: 'Comment nos déchets deviennent de l’électricité ?', channel: "C'est pas sorcier", duration: '0:47' },
    { id: '_WI_Eq5jNe4', title: 'Les déchets : à la poubelle !', channel: "C'est toujours pas sorcier", duration: '25:11' },
    { id: 'XADJgXp9lt0', title: 'Que deviennent nos déchets après le tri ?', channel: "C'est pas sorcier", duration: '25:50' }
  ],
  // Chaîne « Je T'explique Comment » (série « Comment c'est fait ») : seulement des sujets neutres,
  // sans marques ni objets dangereux. Vidéos longues (16 à 23 min) : à regarder avec un adulte.
  fabrique: [
    { id: 'fOmOQAsCmKA', title: 'Comment fabrique-t-on les crayons ?', channel: "Je T'explique Comment", duration: '19:17' },
    { id: 'xmkaJNZKmg4', title: 'Comment fabrique-t-on les crayons de cire ?', channel: "Je T'explique Comment", duration: '16:06' },
    { id: 'VSqqLgISQdA', title: 'Comment fabrique-t-on les balles ?', channel: "Je T'explique Comment", duration: '22:39' },
    { id: 'wasfZRVTpdw', title: 'Comment recycle-t-on le carton ?', channel: "Je T'explique Comment", duration: '23:15' },
    { id: 'WtXcf-QjwiM', title: 'Comment fabrique-t-on les pièces de monnaie ?', channel: "Je T'explique Comment", duration: '17:23' },
    { id: 'tkFDYP43Hpg', title: 'Comment le sable devient-il du quartz ?', channel: "Je T'explique Comment", duration: '18:36' },
    { id: 'WV1jW0Ep4hE', title: 'Comment fabrique-t-on le scotch ?', channel: "Je T'explique Comment", duration: '19:36' }
  ]
};

export const youtubeUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;
