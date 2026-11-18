/**
 * Les 10 mini-vidéos documentaires (les meilleures, gardées sur 50) pour les 5 ans : 4 scènes narrées et animées + une vraie photo
 * (sous licence libre, via Openverse — voir scripts/fetch-video-images.ts).
 * Recherche : mots anglais (Openverse), « nasa:… » (NASA Image Library) ou « none » (emoji animé seul).
 */

import type { StyleId } from '../kits/styles';

export type VideoTheme = 'animaux' | 'nature' | 'espace' | 'metiers' | 'corps' | 'monde';

export interface MiniVideo {
  id: string;
  theme: VideoTheme;
  emoji: string;
  title: string;
  /** Son style, parmi les 10 gardés. */
  style: StyleId;
  query: string;
  scenes: string[];
}

type Row = [string, string, string, string];

/**
 * Les 10 meilleurs dessins animés, dans l'ordre de la suite (les thèmes alternent).
 * Format : [id, thème, style, emoji, titre, recherche photo, "scène 1|…|scène 4"]. {p} = prénom.
 * Chacun a son style, parmi les 10 gardés (src/kits/styles.ts) ; les identifiants d'origine sont conservés
 * (questions, crédits photo, storyboard).
 */
const DATA: [string, VideoTheme, StyleId, ...Row][] = [
  ['video-animaux-01', 'animaux', 'memphis-diorama', '🐧', 'Les manchots', 'penguins', 'Voici les manchots ! Ils vivent là où il fait très, très froid.|Ils ne volent pas, mais ce sont des champions de natation.|Pour avoir chaud, ils se serrent tous les uns contre les autres.|Et toi {p}, sais-tu marcher en te dandinant comme un manchot ?'],
  ['video-nature-02', 'nature', 'isometric-picture-book', '🌈', 'L’arc-en-ciel', 'rainbow landscape', 'Quand il pleut et qu’il y a du soleil, un arc-en-ciel peut apparaître.|Il a sept couleurs : rouge, orange, jaune, vert, bleu, indigo et violet.|La lumière du soleil traverse les gouttes de pluie.|Peux-tu dire toutes les couleurs avec moi ?'],
  ['video-animaux-02', 'animaux', 'cel-anime-80s', '🐘', 'Les éléphants', 'elephant family', 'L’éléphant est le plus gros animal qui marche sur la terre.|Sa trompe lui sert de nez, de main et même de douche !|Les éléphants vivent en famille et prennent soin des petits.|Peux-tu faire une trompe avec ton bras, {p} ?'],
  ['video-espace-01', 'espace', 'pixel-rpg', '🌙', 'La Lune', 'full moon', 'La Lune tourne autour de la Terre.|Elle ne fait pas de lumière : elle renvoie celle du Soleil.|Parfois elle est ronde, parfois en croissant.|Des astronautes ont marché sur la Lune !'],
  ['video-animaux-05', 'animaux', 'brick-toy', '🐬', 'Les dauphins', 'dolphin jumping', 'Les dauphins vivent dans la mer, mais ce ne sont pas des poissons.|Ils remontent à la surface pour respirer.|Ils parlent entre eux avec des sifflements.|Ils adorent jouer et sauter hors de l’eau !'],
  ['video-corps-01', 'corps', 'transit-map', '🦷', 'Les dents', 'none', 'Les dents servent à croquer et à mâcher.|Les petites dents de lait tomberont un jour.|De nouvelles dents plus solides pousseront.|Brosse-les matin et soir pour qu’elles restent belles !'],
  ['video-animaux-03', 'animaux', 'microgame', '🦒', 'Les girafes', 'giraffe', 'La girafe a le cou le plus long de tous les animaux.|Grâce à lui, elle mange les feuilles tout en haut des arbres.|Sa langue est violette et très longue.|Mets-toi sur la pointe des pieds pour être grand comme une girafe !'],
  ['video-espace-03', 'espace', 'lowpoly-island', '🪐', 'Les planètes', 'saturn planet', 'Autour du Soleil tournent huit planètes.|La Terre est notre planète, la seule avec des plantes et des animaux connus.|Saturne a de beaux anneaux, Jupiter est la plus grosse.|Mars est rouge, comme de la rouille.'],
  ['video-animaux-13', 'animaux', 'watercolor', '🐼', 'Les pandas', 'giant panda eating bamboo', 'Le panda géant vit dans les montagnes de Chine.|Il est noir et blanc, et très doux.|Il passe presque toute la journée à manger du bambou.|Le panda est un animal rare : il faut le protéger.'],
  ['video-animaux-15', 'animaux', 'paper-popup', '🐳', 'Les baleines', 'humpback whale breaching', 'La baleine est le plus grand animal du monde.|Elle respire par un trou sur sa tête et fait de grands jets d’eau.|Les baleines chantent pour se parler, très loin dans l’océan.|Elle est plus grande qu’un autobus !']
];

export const VIDEO_THEMES: Record<VideoTheme, { label: string; emoji: string }> = {
  animaux: { label: 'Animaux', emoji: '🐾' },
  nature: { label: 'Nature', emoji: '🌿' },
  espace: { label: 'Espace', emoji: '🚀' },
  metiers: { label: 'Métiers', emoji: '👷' },
  corps: { label: 'Mon corps', emoji: '💪' },
  monde: { label: 'Le monde', emoji: '🌍' }
};

export const VIDEOS: MiniVideo[] = DATA.map(([id, theme, style, emoji, title, query, text]) => ({
  id,
  theme,
  style,
  emoji,
  title,
  query,
  scenes: text.split('|').map((s) => s.trim())
}));

/** La vidéo mise en avant aujourd'hui (change chaque jour). */
export function videoOfTheDay(day: string): MiniVideo {
  const n = Math.floor(Date.parse(day) / 86400000);
  return VIDEOS[((n % VIDEOS.length) + VIDEOS.length) % VIDEOS.length];
}
