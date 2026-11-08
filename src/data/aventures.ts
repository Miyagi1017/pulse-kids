/**
 * Aventures « pointer et cliquer » : une scène pleine d'objets, une petite histoire,
 * et 3 choses cachées à retrouver en touchant les objets. Chaque objet réagit (son, mouvement, phrase).
 * Positions en % de la scène (x depuis la gauche, y depuis le haut).
 */

export type Reaction = 'saute' | 'tortille' | 'tourne' | 'grossit';
export type Bruit = 'pop' | 'boing' | 'sparkle' | 'whoosh' | 'vache' | 'mouton' | 'cochon' | 'poule';

export interface Hotspot {
  emoji: string;
  x: number;
  y: number;
  size?: number; // en rem (3 par défaut)
  say: string;
  hides?: boolean; // une des 3 choses cachées est derrière
  react?: Reaction;
  sound?: Bruit;
}

export interface Aventure {
  id: string;
  emoji: string;
  title: string;
  story: string;
  goal: string; // l'emoji à retrouver
  goalWord: string; // au singulier, pour la voix : « une carotte »
  sky: string; // classes Tailwind du fond
  ground: string;
  bravo: string;
  spots: Hotspot[];
}

const S = (emoji: string, x: number, y: number, say: string, extra: Partial<Hotspot> = {}): Hotspot => ({ emoji, x, y, say, ...extra });
const H = (emoji: string, x: number, y: number, say: string, extra: Partial<Hotspot> = {}): Hotspot => ({ emoji, x, y, say, hides: true, ...extra });

export const AVENTURES: Aventure[] = [
  {
    id: 'av-01', emoji: '🐰', title: 'Les carottes de Lulu', goal: '🥕', goalWord: 'une carotte',
    story: 'Lulu le lapin a perdu ses trois carottes dans le jardin. Touche les objets pour les retrouver !',
    sky: 'from-sky-200 to-sky-100', ground: 'bg-green-300', bravo: 'Merci ! Lulu va se régaler.',
    spots: [
      H('🪴', 14, 62, 'Dans le pot de fleurs…'), S('🐱', 32, 70, 'Le chat dort. Chut !', { react: 'tortille' }), H('🪣', 52, 72, 'Dans le seau…', { react: 'tourne' }),
      S('🌻', 70, 52, 'Le tournesol te dit bonjour !', { react: 'grossit', sound: 'sparkle' }), S('🐦', 82, 22, 'Cui-cui ! L’oiseau chante.', { react: 'saute' }),
      H('🌳', 86, 50, 'Derrière l’arbre…', { size: 5 }), S('🦋', 40, 28, 'Le papillon s’envole !', { react: 'tourne', sound: 'whoosh' }), S('🐌', 24, 82, 'L’escargot avance tout doucement.')
    ]
  },
  {
    id: 'av-02', emoji: '🧸', title: 'Le doudou perdu', goal: '🧸', goalWord: 'un doudou',
    story: 'Trois doudous se sont cachés dans la chambre. Aide-moi à les trouver avant de dormir !',
    sky: 'from-violet-200 to-rose-100', ground: 'bg-amber-200', bravo: 'Tous les doudous sont là. Bonne nuit !',
    spots: [
      H('🛏️', 22, 64, 'Sous le lit…', { size: 5 }), S('💡', 50, 18, 'La lumière s’allume !', { react: 'grossit', sound: 'sparkle' }), H('📦', 70, 72, 'Dans le coffre à jouets…'),
      S('🪟', 80, 30, 'Par la fenêtre, on voit la lune.'), H('🪑', 46, 70, 'Sous la chaise…'), S('📚', 62, 44, 'Des livres pour ce soir !', { react: 'tortille' }),
      S('🪀', 12, 84, 'Le yoyo monte et descend !', { react: 'saute', sound: 'boing' }), S('🕰️', 34, 30, 'Tic-tac, c’est bientôt l’heure de dormir.')
    ]
  },
  {
    id: 'av-03', emoji: '🍪', title: 'Les biscuits de la cuisine', goal: '🍪', goalWord: 'un biscuit',
    story: 'Mamie a caché trois biscuits dans la cuisine pour le goûter. Où sont-ils ?',
    sky: 'from-amber-100 to-orange-50', ground: 'bg-orange-200', bravo: 'Miam ! C’est l’heure du goûter.',
    spots: [
      H('🫖', 20, 46, 'Dans la théière…', { react: 'tortille' }), S('🍳', 40, 60, 'Ça grésille dans la poêle !', { sound: 'pop' }), H('🧺', 66, 70, 'Dans le panier…'),
      S('🧊', 82, 40, 'Brrr, le glaçon est froid !', { react: 'tortille' }), H('🫙', 56, 38, 'Dans le bocal…'), S('🥄', 30, 76, 'La cuillère fait ding !', { sound: 'sparkle' }),
      S('🐈', 86, 76, 'Miaou ! Le chat a faim aussi.', { react: 'saute' }), S('🍎', 72, 24, 'Une pomme bien rouge.')
    ]
  },
  {
    id: 'av-04', emoji: '🐚', title: 'Les coquillages de la plage', goal: '🐚', goalWord: 'un coquillage',
    story: 'La mer a laissé trois jolis coquillages sur la plage. Cherche-les !',
    sky: 'from-sky-300 to-cyan-100', ground: 'bg-yellow-200', bravo: 'Quelle belle collection de coquillages !',
    spots: [
      H('🏖️', 16, 68, 'Sous le parasol…', { size: 4 }), S('🦀', 36, 80, 'Le crabe marche de côté !', { react: 'tortille' }), H('🪣', 56, 74, 'Dans le seau…'),
      S('🌊', 76, 46, 'Splash ! Une vague.', { size: 5, sound: 'whoosh' }), S('☀️', 84, 14, 'Le soleil brille fort. Mets ta casquette !', { react: 'tourne' }),
      H('🪨', 86, 78, 'Sous le rocher…'), S('🐦', 50, 22, 'La mouette crie.', { react: 'saute' }), S('⛵', 66, 34, 'Un bateau passe au loin.', { react: 'tortille' })
    ]
  },
  {
    id: 'av-05', emoji: '🐿️', title: 'Les noisettes de l’écureuil', goal: '🌰', goalWord: 'une noisette',
    story: 'L’écureuil a caché trois noisettes dans la forêt et il a oublié où. Aide-le !',
    sky: 'from-emerald-200 to-lime-100', ground: 'bg-amber-700/40', bravo: 'L’écureuil est tout content. Merci !',
    spots: [
      H('🍄', 18, 74, 'Sous le champignon…'), S('🦉', 30, 26, 'Hou hou ! La chouette ouvre un œil.', { react: 'grossit' }), H('🪵', 50, 78, 'Dans le tronc…'),
      S('🦔', 66, 82, 'Le hérisson se roule en boule.', { react: 'tourne' }), H('🌲', 82, 46, 'Au pied du sapin…', { size: 5 }), S('🦊', 44, 56, 'Le renard fait coucou !', { react: 'saute' }),
      S('🐸', 12, 50, 'Croâ ! La grenouille saute.', { react: 'saute', sound: 'boing' }), S('🍂', 70, 30, 'Une feuille tombe en tournant.', { react: 'tourne', sound: 'whoosh' })
    ]
  },
  {
    id: 'av-06', emoji: '🥚', title: 'Les œufs de la ferme', goal: '🥚', goalWord: 'un œuf',
    story: 'La poule a pondu trois œufs, mais elle les a cachés dans la ferme. Retrouve-les !',
    sky: 'from-sky-200 to-amber-50', ground: 'bg-lime-300', bravo: 'Bravo ! Les œufs sont tous dans le panier.',
    spots: [
      S('🐮', 18, 56, 'Meuh !', { sound: 'vache', react: 'tortille', size: 4 }), H('🌾', 36, 74, 'Dans la paille…'), S('🐷', 56, 70, 'Groin groin !', { sound: 'cochon', react: 'saute' }),
      H('🛖', 80, 48, 'Dans la cabane…', { size: 5 }), S('🐑', 66, 34, 'Bêê !', { sound: 'mouton', react: 'tortille' }), H('🚜', 30, 38, 'Derrière le tracteur…', { size: 4 }),
      S('🐔', 48, 50, 'Cot cot ! C’est la maman poule.', { sound: 'poule', react: 'saute' }), S('🐕', 86, 80, 'Wouf ! Le chien garde la ferme.', { react: 'saute' })
    ]
  },
  {
    id: 'av-07', emoji: '⭐', title: 'Les étoiles de l’espace', goal: '⭐', goalWord: 'une étoile',
    story: 'Trois étoiles se sont cachées dans l’espace. Pars à leur recherche, petit astronaute !',
    sky: 'from-indigo-900 to-violet-800', ground: 'bg-slate-500', bravo: 'Les étoiles brillent à nouveau. Bravo, astronaute !',
    spots: [
      S('🚀', 20, 62, 'La fusée fait vroum !', { react: 'saute', sound: 'whoosh', size: 4 }), H('🪐', 40, 26, 'Derrière la planète…', { react: 'tourne' }), H('🌕', 80, 18, 'Derrière la lune…', { size: 4 }),
      S('👽', 60, 70, 'Bip bip ! Un petit extraterrestre te fait coucou.', { react: 'tortille' }), H('☄️', 64, 40, 'Dans la comète…'), S('🛸', 30, 40, 'La soucoupe tourne !', { react: 'tourne' }),
      S('👩‍🚀', 84, 66, 'L’astronaute flotte dans l’espace.', { react: 'saute' }), S('🌍', 14, 20, 'Voici la Terre, notre maison.', { react: 'grossit' })
    ]
  },
  {
    id: 'av-08', emoji: '🐠', title: 'Les poissons cachés', goal: '🐠', goalWord: 'un petit poisson',
    story: 'Trois petits poissons jouent à cache-cache au fond de la mer. Trouve-les !',
    sky: 'from-cyan-600 to-blue-300', ground: 'bg-amber-200', bravo: 'Tous les petits poissons sont retrouvés !',
    spots: [
      H('🪸', 16, 70, 'Dans le corail…'), S('🐙', 36, 56, 'La pieuvre agite ses bras !', { react: 'tortille' }), H('🐚', 56, 82, 'Dans le coquillage…'),
      S('🐳', 74, 24, 'La baleine chante !', { size: 5, react: 'grossit' }), H('🪨', 84, 72, 'Derrière le rocher…'), S('🦀', 44, 82, 'Le crabe pince l’eau.', { react: 'saute' }),
      S('🐢', 26, 30, 'La tortue nage tranquillement.'), S('🫧', 62, 46, 'Blop blop, des bulles !', { react: 'grossit', sound: 'pop' })
    ]
  },
  {
    id: 'av-09', emoji: '🎈', title: 'Les ballons du parc', goal: '🎈', goalWord: 'un ballon',
    story: 'Le vent a fait s’envoler trois ballons dans le parc. Où sont-ils ?',
    sky: 'from-sky-200 to-sky-50', ground: 'bg-green-300', bravo: 'Les ballons sont retrouvés. Quelle fête !',
    spots: [
      H('🌳', 16, 46, 'Dans l’arbre…', { size: 5 }), S('🛝', 40, 66, 'Wiii ! Le toboggan !', { size: 4, sound: 'whoosh' }), H('🎪', 66, 44, 'Derrière le manège…', { size: 4 }),
      S('🐕', 82, 78, 'Le chien court après sa balle !', { react: 'saute' }), H('⛲', 50, 76, 'Près de la fontaine…'), S('🦆', 26, 80, 'Coin coin !', { react: 'tortille' }),
      S('🌞', 84, 14, 'Il fait beau aujourd’hui !', { react: 'tourne' }), S('🍦', 30, 30, 'Une glace à la fraise, miam !')
    ]
  },
  {
    id: 'av-10', emoji: '🧤', title: 'Les gants dans la neige', goal: '🧤', goalWord: 'un gant',
    story: 'Il a neigé ! Trois gants se sont perdus dans la neige. Aide-moi à les trouver.',
    sky: 'from-slate-200 to-sky-100', ground: 'bg-white', bravo: 'Merci ! Maintenant, on a les mains au chaud.',
    spots: [
      H('⛄', 20, 56, 'Près du bonhomme de neige…', { size: 4 }), S('🛷', 40, 78, 'Wiii, la luge glisse !', { sound: 'whoosh', react: 'saute' }), H('🏠', 70, 46, 'Devant la maison…', { size: 5 }),
      S('🐧', 86, 74, 'Le pingouin glisse sur le ventre !', { react: 'tortille' }), H('🌲', 50, 40, 'Sous le sapin…', { size: 4 }), S('❄️', 30, 20, 'Un flocon tombe doucement.', { react: 'tourne' }),
      S('🦌', 14, 82, 'Le renne t’a vu !', { react: 'saute' }), S('☕', 84, 22, 'Un chocolat chaud t’attend.')
    ]
  },
  {
    id: 'av-11', emoji: '🍎', title: 'Les pommes du verger', goal: '🍎', goalWord: 'une pomme',
    story: 'Papi a besoin de trois pommes pour faire une tarte. Cherche-les dans le verger !',
    sky: 'from-sky-200 to-amber-50', ground: 'bg-lime-300', bravo: 'Merci ! Papi va faire une délicieuse tarte.',
    spots: [
      H('🌳', 18, 40, 'Dans le pommier…', { size: 5 }), S('🐝', 40, 26, 'Bzzz, l’abeille butine.', { react: 'tortille' }), H('🧺', 54, 76, 'Dans le panier…'),
      S('🐛', 30, 82, 'La chenille a faim !', { react: 'tortille' }), H('🪜', 72, 56, 'Au pied de l’échelle…', { size: 4 }), S('🐞', 84, 80, 'La coccinelle compte ses points.'),
      S('🌼', 86, 40, 'Une fleur toute jolie.', { react: 'grossit', sound: 'sparkle' }), S('🐦', 62, 18, 'L’oiseau fait son nid.', { react: 'saute' })
    ]
  },
  {
    id: 'av-12', emoji: '🦆', title: 'Les canetons de la mare', goal: '🐥', goalWord: 'un caneton',
    story: 'Maman cane cherche ses trois canetons autour de la mare. Peux-tu l’aider ?',
    sky: 'from-sky-200 to-emerald-50', ground: 'bg-emerald-300', bravo: 'Toute la famille cane est réunie. Bravo !',
    spots: [
      S('🦆', 20, 60, 'Coin coin ! C’est maman cane.', { react: 'saute' }), H('🪷', 42, 72, 'Sous le nénuphar…'), H('🌾', 70, 54, 'Dans les roseaux…'),
      S('🐸', 56, 82, 'Croâ ! Bonjour la grenouille.', { react: 'saute', sound: 'boing' }), H('🪨', 84, 76, 'Derrière la pierre…'), S('🐟', 34, 86, 'Un poisson fait une bulle.', { sound: 'pop' }),
      S('🦢', 80, 28, 'Le cygne est tout blanc.', { react: 'tortille' }), S('🌈', 30, 20, 'Un arc-en-ciel au-dessus de la mare !', { size: 4, react: 'grossit' })
    ]
  }
];
