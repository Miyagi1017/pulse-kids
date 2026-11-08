/**
 * L'essentiel pour un enfant qui grandit (repères de l'OMS pour les enfants) :
 * bouger environ 1 heure par jour en jouant, sauter et courir pour les os et le cœur,
 * travailler l'équilibre, des muscles forts, rester souple, et savoir se calmer.
 * → 5 petites routines de 3 mouvements (environ 1 minute), plus les bonnes habitudes du quotidien.
 * Ce sont des jeux de mouvement doux, pas des soins.
 * Format d'un mouvement : "emoji~consigne~secondes~animation".
 */
import type { MoveAnim, SportMove, SportTip } from './sport';

export interface Essential extends SportTip {
  besoin: string;
  pourquoi: string;
  color: string; // fond Tailwind
}

const ANIMS: MoveAnim[] = ['saut', 'balance', 'course', 'etire', 'tourne', 'calme', 'frappe'];

function moves(spec: string): SportMove[] {
  return spec.split('|').map((m) => {
    const [emoji, text, secs, anim] = m.split('~');
    return { emoji, text, seconds: Number(secs), anim: (ANIMS.includes(anim as MoveAnim) ? anim : 'calme') as MoveAnim };
  });
}

type Row = [string, string, string, string, string, string]; // emoji, besoin, titre, pourquoi, couleur, mouvements

const ROWS: Row[] = [
  ['🦘', 'Sauter et courir', 'Des os solides', 'Sauter et courir rendent les os plus solides et font travailler le cœur.', 'bg-corail', '🐇~Petits sauts pieds joints, atterris tout doucement~20~saut|🏃~Cours sur place, les genoux bien hauts~20~course|🌬️~Respire calmement, la main sur le cœur~10~calme'],
  ['🦩', 'L’équilibre', 'Bien tenir debout', 'L’équilibre aide à ne pas tomber et à mieux bouger à tous les jeux.', 'bg-ciel', '🦩~Debout sur le pied droit, les bras écartés~15~balance|🦩~Debout sur le pied gauche, regarde un point devant toi~15~balance|👣~Marche sur une ligne imaginaire, un pied devant l’autre~15~course'],
  ['💪', 'Des muscles forts', 'Porter, grimper, jouer', 'Des muscles forts protègent le dos et aident à grimper et à porter.', 'bg-soleil', '🐸~Accroupi comme une grenouille, puis relève-toi, le dos droit~20~saut|🐈~À quatre pattes comme un chat, mains sous les épaules~15~etire|🐕~Mains et pieds au sol, fesses en l’air : le chien qui s’étire~15~etire'],
  ['🤸', 'La souplesse', 'Un corps qui s’étire', 'S’étirer garde le corps souple pendant qu’il grandit.', 'bg-menthe', '🙆~Étire tes bras très haut vers le ciel~15~etire|🙇~Penche-toi en avant, tête en bas, doucement~15~etire|🐈~À quatre pattes, fais le dos rond comme un chat, puis creuse le dos~20~etire'],
  ['😌', 'Le calme', 'Se poser, respirer', 'Respirer lentement aide à se calmer et à bien dormir.', 'bg-lavande', '🎈~Assis en tailleur, gonfle un ballon en ouvrant les bras~20~calme|🌬️~Debout, respire lentement, les mains sur le ventre~20~calme|🙏~Mains jointes devant le cœur, ferme les yeux et souris~15~calme']
];

export const ESSENTIELS: Essential[] = ROWS.map(([emoji, besoin, title, pourquoi, color, spec], i) => ({
  id: `essentiel-${i + 1}`,
  emoji,
  besoin,
  title,
  tip: pourquoi,
  pourquoi,
  color,
  moves: moves(spec)
}));

export function isEssential(id: string): boolean {
  return id.startsWith('essentiel-');
}

/** Les bonnes habitudes d'un enfant qui grandit : une phrase courte, lue à voix haute. */
export const HABITUDES: { emoji: string; title: string; text: string }[] = [
  { emoji: '🏃', title: 'Bouger chaque jour', text: 'Joue, cours, saute : bouge au moins une heure par jour, un peu à la fois.' },
  { emoji: '😴', title: 'Bien dormir', text: 'À ton âge, il faut dormir environ 10 à 13 heures, en comptant la sieste. C’est la nuit que le corps grandit.' },
  { emoji: '💧', title: 'Boire de l’eau', text: 'L’eau est la meilleure boisson, surtout quand tu as bougé.' },
  { emoji: '🍎', title: 'Manger des couleurs', text: 'Des fruits et des légumes de toutes les couleurs, à chaque repas.' },
  { emoji: '📺', title: 'Peu d’écrans', text: 'Moins d’écrans, plus de jeux, de dessins et de câlins. Et jamais avant de dormir.' }
];

/**
 * Le conseil du jour : une bonne habitude simple, qui change chaque jour.
 * Hygiène, sommeil, alimentation, sécurité, émotions, politesse : des gestes du quotidien, sans jargon.
 */
export const CONSEILS: { emoji: string; text: string }[] = [
  { emoji: '🧼', text: 'Lave-toi les mains avec du savon avant de manger et en rentrant à la maison.' },
  { emoji: '🪥', text: 'Brosse-toi les dents le matin et le soir, pendant deux minutes.' },
  { emoji: '😴', text: 'Le soir, un bain, une histoire, un câlin : ton corps se prépare à bien dormir.' },
  { emoji: '💧', text: 'Bois de l’eau quand tu as soif, surtout après avoir couru.' },
  { emoji: '🍎', text: 'Goûte un fruit ou un légume nouveau : une petite bouchée suffit pour commencer.' },
  { emoji: '🥣', text: 'Le petit-déjeuner donne de l’énergie pour toute la matinée.' },
  { emoji: '🚸', text: 'Pour traverser la rue, donne la main à un adulte et regarde à gauche et à droite.' },
  { emoji: '🚲', text: 'À vélo ou en trottinette, on met toujours son casque.' },
  { emoji: '🧢', text: 'Au soleil, mets une casquette et de la crème, et bois de l’eau.' },
  { emoji: '🤧', text: 'Quand tu éternues, fais-le dans ton coude, puis lave-toi les mains.' },
  { emoji: '🗣️', text: 'Quand tu es triste ou en colère, tu peux le dire avec des mots.' },
  { emoji: '🌬️', text: 'Si tu es énervé, respire lentement trois fois : ça aide à se calmer.' },
  { emoji: '🙏', text: 'Dis s’il te plaît et merci : ça fait plaisir à tout le monde.' },
  { emoji: '🤝', text: 'Aider quelqu’un, même un tout petit peu, c’est un super pouvoir.' },
  { emoji: '🧸', text: 'Après avoir joué, on range ses jouets : ta chambre te dit merci.' },
  { emoji: '📺', text: 'Les écrans, c’est un peu. Les jeux, les livres et les câlins, c’est beaucoup !' },
  { emoji: '🌳', text: 'Jouer dehors chaque jour, c’est bon pour le corps et pour la tête.' },
  { emoji: '🪑', text: 'Assis à table, le dos bien droit et les pieds posés.' },
  { emoji: '🍬', text: 'Les bonbons, c’est de temps en temps, et on se brosse les dents après.' },
  { emoji: '🛁', text: 'Après le sport ou un jeu dans la boue, un bon bain !' },
  { emoji: '🔥', text: 'Les allumettes, le four et les prises, on n’y touche pas : on demande à un adulte.' },
  { emoji: '💊', text: 'Les médicaments, seulement quand un adulte te les donne.' },
  { emoji: '📞', text: 'En cas d’urgence, un adulte appelle le 112 : c’est le numéro des secours en Europe.' },
  { emoji: '🫶', text: 'Ton corps est à toi : tu as le droit de dire non à un câlin.' },
  { emoji: '👂', text: 'Pour bien écouter, on regarde la personne qui parle.' },
  { emoji: '🌙', text: 'Se coucher à la même heure chaque soir aide à bien dormir.' },
  { emoji: '🥕', text: 'Mange des couleurs : du vert, du rouge, de l’orange dans ton assiette.' },
  { emoji: '♻️', text: 'Les déchets vont à la poubelle, et on trie le papier et le plastique.' },
  { emoji: '🐶', text: 'Avant de caresser un chien, on demande toujours à son maître.' },
  { emoji: '😊', text: 'Chaque soir, pense à une chose qui t’a rendu heureux aujourd’hui.' }
];

/** Le conseil du jour (change chaque jour, revient au début après la liste). */
export function conseilDuJour(day: string): { emoji: string; text: string } {
  const n = Math.floor(Date.parse(day) / 86400000);
  return CONSEILS[((n % CONSEILS.length) + CONSEILS.length) % CONSEILS.length];
}
