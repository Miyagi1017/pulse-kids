/**
 * Le sport du jour : un conseil santé + un petit défi de 3 mouvements guidés à la voix.
 * 15 défis choisis pour les besoins d'un enfant qui grandit : sauter, équilibre, muscles, souplesse, calme.
 * Mouvements sûrs à la maison pour les 5 ans (pas de matériel, pas de saut en hauteur risqué).
 * Format : [emoji, titre, conseil, "emoji~consigne~secondes~animation|…"]. {p} = prénom.
 * Animations : saut · balance · course · etire · tourne · calme · frappe (kung-fu, dans le vide).
 */

import type { Animal } from '../lib/mascots';

export type MoveAnim = 'saut' | 'balance' | 'course' | 'etire' | 'tourne' | 'calme' | 'frappe';

export interface SportMove {
  emoji: string;
  text: string;
  seconds: number;
  anim: MoveAnim;
  /** Animal qui montre le mouvement (sinon choisi d'après `anim`). */
  mascotte?: Animal;
  /** Consignes détaillées propres à ce mouvement (sinon celles de la posture la plus proche). */
  cues?: [string, string, string];
}

export interface SportTip {
  id: string;
  emoji: string;
  title: string;
  tip: string;
  moves: SportMove[];
}

type Row = [string, string, string, string];

const DATA: Row[] = [
  ['🐸', 'Le défi grenouille', 'Bouger un peu chaque jour rend ton cœur plus fort.', '🐸~Saute comme une grenouille, accroupi puis hop !~20~saut|🦩~Tiens-toi sur un pied comme un flamant rose~15~balance|😮‍💨~Respire tout doucement, comme pour souffler une bougie~15~calme'],
  ['🐻', 'La marche de l’ours', 'Avant de bouger, on réveille son corps doucement : c’est l’échauffement.', '🐻~Marche à quatre pattes comme un gros ours~20~course|🙆~Étire tes bras très haut vers le ciel~15~etire|🐢~La tortue rentre la tête : accroupis-toi tout petit~15~calme'],
  ['🏃', 'La course sur place', 'Courir fait battre ton cœur plus vite : c’est normal, c’est lui qui travaille !', '🏃~Cours sur place, les genoux bien hauts~20~course|✋~Pose ta main sur ton cœur : tu le sens battre ?~10~calme|🌬️~Inspire par le nez, souffle par la bouche~15~calme'],
  ['🦩', 'Équilibre de flamant', 'L’équilibre, ça s’entraîne : chaque jour tu tiens un peu plus longtemps.', '🦩~Debout sur le pied droit, les bras écartés~15~balance|🦩~Maintenant sur le pied gauche~15~balance|🧘~Ferme les yeux et respire calmement~15~calme'],
  ['🐇', 'Les sauts de lapin', 'Bien dormir aide ton corps à grandir et à récupérer après le sport.', '🐇~Petits sauts de lapin, pieds joints~20~saut|🥕~Accroupis-toi pour cueillir des carottes~15~etire|💤~Le lapin se repose en respirant doucement~10~calme'],
  ['🌳', 'L’arbre dans le vent', 'Respirer profondément calme le corps et la tête.', '🌳~Bras en l’air : tu es un grand arbre~15~etire|🌬️~Le vent souffle : balance-toi doucement~20~balance|🍂~Une feuille tombe : descends tout doucement en t’accroupissant~15~calme'],
  ['🦀', 'La marche du crabe', 'Bouger dans tous les sens fait travailler tous tes muscles.', '🦀~Marche de côté comme un crabe~20~course|🦀~Maintenant de l’autre côté !~20~course|🐚~Le crabe s’arrête et respire calmement~10~calme'],
  ['🤸', 'Le petit gymnaste', 'On fait du sport dans un espace dégagé, sans rien autour qui fait mal.', '⭐~Fais l’étoile : bras et jambes écartés~15~etire|🙇~Touche tes pieds sans plier les genoux~15~etire|🤸~Fais 5 petits sauts sur place~15~saut'],
  ['🧘', 'Le chat qui s’étire', 'Le matin, un petit étirement aide à bien se réveiller.', '🐈~À quatre pattes, fais le dos rond comme un chat~15~etire|🐄~Puis creuse le dos comme une vache~15~etire|😺~Le chat fait le dos rond et ronronne~15~calme'],
  ['🦘', 'Le kangourou', 'Sauter fait travailler les jambes et rend les os solides.', '🦘~Sauts de kangourou vers l’avant~20~saut|👶~Croise les bras : un gros câlin au petit kangourou~15~calme|🦘~Encore des sauts, mais tout petits~15~saut'],
  ['🎯', 'Le défi des statues', 'Savoir s’arrêter net, c’est aussi apprendre à bien contrôler son corps.', '💃~Danse, danse, danse !~15~tourne|🗿~Statue ! Ne bouge plus du tout~10~calme|💃~Danse encore… puis statue sur un pied !~20~balance'],
  ['🎈', 'Le ballon qui gonfle', 'Bien respirer donne de l’énergie à tout ton corps.', '🎈~Inspire et gonfle ton ventre comme un ballon~15~calme|💨~Souffle et dégonfle-toi tout doucement~15~calme|🎈~Le ballon s’envole : saute vers le ciel !~15~saut'],
  ['🏋️', 'Le petit costaud', 'On devient plus fort petit à petit, en s’entraînant régulièrement.', '🏋️~Soulève des haltères imaginaires~15~etire|💪~Montre tes muscles !~10~saut|🪑~Assieds-toi sur une chaise invisible, 5 secondes~15~balance'],
  ['🌻', 'La fleur qui pousse', 'Comme une plante, ton corps grandit chaque jour.', '🌱~Accroupi, tu es une petite graine~10~calme|🌿~Grandis tout doucement en te levant~15~etire|🌻~Ouvre tes bras comme une fleur au soleil~15~etire'],
  ['🌙', 'Le sport du soir', 'Le soir, on bouge en douceur pour préparer le sommeil.', '🙆~Étire-toi doucement comme un chat qui se réveille~15~etire|🌬️~Respire lentement, 3 grandes fois~15~calme|🌙~Debout, relâche tout ton corps, les bras lourds~15~calme']
];

const MOVE_ANIMS: MoveAnim[] = ['saut', 'balance', 'course', 'etire', 'tourne', 'calme', 'frappe'];

export const SPORT_TIPS: SportTip[] = DATA.map(([emoji, title, tip, moves], i) => ({
  id: `sport-${String(i + 1).padStart(3, '0')}`,
  emoji,
  title,
  tip,
  moves: moves.split('|').map((m) => {
    const [e, text, secs, anim] = m.split('~');
    return { emoji: e, text, seconds: Number(secs), anim: (MOVE_ANIMS.includes(anim as MoveAnim) ? anim : 'calme') as MoveAnim };
  })
}));

/** Le défi du jour (change chaque jour, revient au début après la liste). */
export function sportOfTheDay(day: string): SportTip {
  const n = Math.floor(Date.parse(day) / 86400000);
  return SPORT_TIPS[((n % SPORT_TIPS.length) + SPORT_TIPS.length) % SPORT_TIPS.length];
}
