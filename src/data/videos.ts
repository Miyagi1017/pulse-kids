/**
 * Les 10 mini-vidéos documentaires (les meilleures, gardées sur 50) pour les 5-8 ans : 6 à 8 phrases narrées et animées + une vraie photo
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
 * Format : [id, thème, style, emoji, titre, recherche photo, "phrase 1|…|phrase 8"]. {p} = prénom.
 * Chacun a son style, parmi les 10 gardés (src/kits/styles.ts) ; les identifiants d'origine sont conservés
 * (questions, crédits photo, storyboard).
 */
const DATA: [string, VideoTheme, StyleId, ...Row][] = [
  ['video-animaux-01', 'animaux', 'memphis-diorama', '🐧', 'Les manchots', 'penguins', 'Voici Pipo, un petit manchot. Il vit sur la glace, là où il fait très froid.|Pipo a des ailes, mais il ne vole pas.|Pourtant, dans l’eau, il nage très, très vite !|Ce soir, le vent souffle fort. Brrr, Pipo a froid.|Alors tous les manchots se serrent les uns contre les autres.|Bien au chaud au milieu du groupe, Pipo s’endort.|Et toi {p}, sais-tu marcher en te dandinant comme un manchot ?'],
  ['video-nature-02', 'nature', 'isometric-picture-book', '🌈', 'L’arc-en-ciel', 'rainbow landscape', 'Il pleut, mais le soleil sort de derrière un nuage.|Ses rayons traversent les gouttes de pluie.|Et tout à coup, un arc-en-ciel apparaît dans le ciel !|Il a sept couleurs, toujours dans le même ordre.|Rouge, orange, jaune, vert…|… puis bleu, indigo et violet.|Et toi {p}, peux-tu dire les sept couleurs avec moi ?'],
  ['video-animaux-02', 'animaux', 'cel-anime-80s', '🐘', 'Les éléphants', 'elephant family', 'Voici Bou, un éléphant. C’est le plus gros animal qui marche sur la terre.|Bou a une longue trompe. À quoi sert-elle ?|Avec sa trompe, il peut sentir les fleurs.|Il peut aussi attraper une branche, comme avec une main.|Et il aspire l’eau pour boire, ou pour se faire une douche !|Le soir, Bou rejoint sa famille, qui prend soin des petits.|Et toi {p}, peux-tu faire une trompe avec ton bras ?'],
  ['video-espace-01', 'espace', 'pixel-rpg', '🌙', 'La Lune', 'full moon', 'Regarde là-haut : c’est la Lune !|La Lune tourne autour de la Terre, tout doucement.|Elle ne fait pas de lumière toute seule.|Elle renvoie celle du Soleil, comme un grand miroir.|Certains soirs, elle est toute ronde. D’autres soirs, c’est un fin croissant.|Un jour, des astronautes ont marché sur la Lune !|Et toi {p}, ce soir, tu regarderas la forme de la Lune ?'],
  ['video-animaux-05', 'animaux', 'brick-toy', '🐬', 'Les dauphins', 'dolphin jumping', 'Voici Flip, un dauphin qui vit dans la mer.|Flip nage vite, mais ce n’est pas un poisson.|De temps en temps, il doit remonter à la surface.|Pourquoi ? Pour respirer de l’air, comme nous !|Il siffle pour parler avec ses amis dauphins.|Et quand il est content, il saute très haut hors de l’eau !|Et toi {p}, tu sais siffler comme un dauphin ?'],
  ['video-corps-01', 'corps', 'transit-map', '🦷', 'Les dents', 'none', 'Ouvre grand la bouche : voici tes dents !|Elles servent à croquer une pomme et à mâcher ton repas.|Tes petites dents de lait tomberont un jour.|Ne t’inquiète pas : de nouvelles dents plus solides pousseront.|Pour les garder belles, il faut les brosser.|Le matin et le soir, on brosse doucement, en faisant des petits ronds.|Et toi {p}, tu te brosses les dents matin et soir ?'],
  ['video-animaux-03', 'animaux', 'microgame', '🦒', 'Les girafes', 'giraffe', 'Voici Lili, une girafe. Elle a le cou le plus long de tous les animaux.|Lili a faim. Mais l’herbe ne lui fait pas envie.|Elle lève la tête, tout en haut de l’arbre.|Là, elle trouve les feuilles les plus tendres.|Elle les attrape avec sa longue langue violette.|Miam ! Lili mange les feuilles tout en haut, là où personne n’arrive.|Et toi {p}, mets-toi sur la pointe des pieds pour être grand comme Lili !'],
  ['video-espace-03', 'espace', 'lowpoly-island', '🪐', 'Les planètes', 'saturn planet', 'Au centre, il y a le Soleil. Et autour, des planètes tournent.|Combien sont-elles ? Huit planètes, comme une ronde.|Voici la Terre, notre planète bleue, avec des plantes et des animaux.|Mars est toute rouge, comme de la rouille.|Jupiter est la plus grosse de toutes.|Et Saturne porte de beaux anneaux autour d’elle.|Et toi {p}, tu peux compter jusqu’à huit avec moi ?'],
  ['video-animaux-13', 'animaux', 'watercolor', '🐼', 'Les pandas', 'giant panda eating bamboo', 'Dans les montagnes de Chine vit un animal très doux.|C’est Mei, une panda géante, noire et blanche.|Mei a faim. Elle cherche sa plante préférée.|Ça y est : voici du bambou !|Elle passe presque toute la journée à manger du bambou.|Le panda est rare : il faut le protéger.|Et toi {p}, tu sais faire une roulade comme Mei ?'],
  ['video-animaux-15', 'animaux', 'paper-popup', '🐳', 'Les baleines', 'humpback whale breaching', 'Dans l’océan nage le plus grand animal du monde : la baleine.|Elle est plus grande qu’un autobus !|Elle remonte à la surface pour respirer.|Elle respire par un trou sur sa tête…|… et pfffou ! Elle fait un grand jet d’eau.|Pour se parler, les baleines chantent, très loin dans l’océan.|Et toi {p}, tu sais chanter comme une baleine ?']
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
