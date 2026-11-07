/**
 * 50 petites activités (1 à 2 minutes chacune), sans lecture nécessaire :
 * tout est dit à voix haute et se joue avec de gros emojis.
 *
 *  - devinette : une question, la bonne réponse est le 1er choix (mélangé à l'affichage)
 *  - compte    : compter des objets
 *  - intrus    : trouver celui qui n'est pas de la même famille (le dernier de la liste)
 */

import { JEUX, splitChoice, type Theme } from './jeux';

export type Category = Theme | 'decouverte' | 'maths' | 'logique';

interface Base {
  id: string;
  category: Category;
  emoji: string;
  title: string;
  bravo: string;
}

export type Activity = Base &
  (
    | { kind: 'devinette'; question: string; choices: string[] }
    | { kind: 'compte'; item: string; count: number }
    | { kind: 'intrus'; items: string[] }
    | { kind: 'vf'; statement: string; answer: boolean }
    | { kind: 'ordre'; question: string; steps: string[] }
  );

type Row =
  | ['devinette', string, string, string[], string] // titre, question, [bonne, autres…], bravo
  | ['compte', string, string, number, string] // titre, objet, nombre, bravo
  | ['intrus', string, string[], string]; // titre, [famille…, intrus], bravo

const ROWS: Row[] = [
  ['devinette', 'Qui fait meuh ?', 'Quel animal fait « meuh » ?', ['🐮', '🐷', '🐔'], 'Oui ! La vache fait meuh et nous donne du lait.'],
  ['devinette', 'Qui fait miaou ?', 'Quel animal fait « miaou » ?', ['🐱', '🐶', '🐸'], 'Bravo ! Le chat ronronne quand il est content.'],
  ['devinette', 'Le roi de la savane', 'Qui est le roi de la savane ?', ['🦁', '🐭', '🐌'], 'Rooaar ! Le lion a une grande crinière.'],
  ['devinette', 'Ça brille la nuit', 'Qu’est-ce qui brille dans le ciel la nuit ?', ['🌙', '☀️', '🌈'], 'Exact ! La lune éclaire la nuit.'],
  ['devinette', 'Pour la pluie', 'Qu’est-ce qu’on prend quand il pleut ?', ['☂️', '🕶️', '🩴'], 'Oui ! Le parapluie nous garde au sec.'],
  ['devinette', 'Le fruit jaune', 'Quel fruit est jaune et tout long ?', ['🍌', '🍎', '🍇'], 'Miam ! La banane est le fruit préféré des singes.'],
  ['devinette', 'Ça vole', 'Lequel peut voler dans le ciel ?', ['🐦', '🐟', '🐢'], 'Bravo ! L’oiseau bat des ailes pour voler.'],
  ['devinette', 'Sous l’eau', 'Qui vit dans l’eau ?', ['🐠', '🐄', '🐓'], 'Bien joué ! Le poisson respire sous l’eau.'],
  ['devinette', 'Pour se brosser les dents', 'Qu’utilise-t-on pour se brosser les dents ?', ['🪥', '🍴', '✏️'], 'Super ! Deux fois par jour, c’est parfait.'],
  ['devinette', 'Il fait froid', 'Que met-on sur la tête quand il fait froid ?', ['🧢', '🩳', '👙'], 'Oui ! Un bonnet ou une casquette protège la tête.'],
  ['devinette', 'Le plus grand cou', 'Quel animal a le plus long cou ?', ['🦒', '🐇', '🦔'], 'Exact ! La girafe mange les feuilles en haut des arbres.'],
  ['devinette', 'Ça pique', 'Lequel a des piquants ?', ['🦔', '🐑', '🐰'], 'Bravo ! Le hérisson se met en boule pour se protéger.'],
  ['devinette', 'Pour dessiner', 'Avec quoi peut-on dessiner ?', ['🖍️', '🥄', '🧦'], 'Oui ! Quel dessin vas-tu faire ?'],
  ['devinette', 'Qui fait du miel ?', 'Quel petit animal fabrique le miel ?', ['🐝', '🐜', '🐞'], 'Bzzz ! L’abeille butine les fleurs pour faire du miel.'],
  ['devinette', 'Le véhicule des pompiers', 'Quel véhicule utilisent les pompiers ?', ['🚒', '🚜', '🚲'], 'Pin-pon ! Le camion rouge des pompiers.'],
  ['devinette', 'Ça fond au soleil', 'Qu’est-ce qui fond au soleil ?', ['🍦', '🪨', '🧱'], 'Oui ! Vite, il faut manger la glace !'],
  ['devinette', 'Le légume orange', 'Quel légume est orange et croquant ?', ['🥕', '🥦', '🍆'], 'Bravo ! Les lapins adorent les carottes.'],
  ['devinette', 'Pour aller dans l’espace', 'Qu’est-ce qui va dans l’espace ?', ['🚀', '🚗', '⛵'], 'Décollage ! La fusée monte jusqu’aux étoiles.'],
  ['devinette', 'Qui fait cocorico ?', 'Qui chante « cocorico » le matin ?', ['🐓', '🦆', '🐦'], 'Cocorico ! Le coq réveille la ferme.'],
  ['devinette', 'La maison sur le dos', 'Qui porte sa maison sur son dos ?', ['🐌', '🐛', '🐜'], 'Oui ! L’escargot rentre dans sa coquille.'],
  ['compte', 'Les pommes', '🍎', 3, 'Trois pommes ! Bien compté.'],
  ['compte', 'Les étoiles', '⭐', 5, 'Cinq étoiles, comme les doigts d’une main !'],
  ['compte', 'Les ballons', '🎈', 4, 'Quatre ballons ! Bravo.'],
  ['compte', 'Les poussins', '🐥', 2, 'Deux poussins ! Piou piou.'],
  ['compte', 'Les fleurs', '🌸', 6, 'Six fleurs ! Quel joli bouquet.'],
  ['compte', 'Les poissons', '🐟', 3, 'Trois poissons ! Glou glou.'],
  ['compte', 'Les cœurs', '❤️', 4, 'Quatre cœurs pleins d’amour !'],
  ['compte', 'Les voitures', '🚗', 5, 'Cinq voitures ! Vroum.'],
  ['compte', 'Les cupcakes', '🧁', 2, 'Deux gâteaux, un pour toi et un pour un ami !'],
  ['compte', 'Les papillons', '🦋', 6, 'Six papillons ! Ils s’envolent.'],
  ['compte', 'Les fraises', '🍓', 7, 'Sept fraises ! Miam.'],
  ['compte', 'Les lunes', '🌙', 1, 'Une seule lune dans le ciel !'],
  ['compte', 'Les coccinelles', '🐞', 4, 'Quatre coccinelles ! Bravo.'],
  ['compte', 'Les ours', '🧸', 3, 'Trois oursons, comme dans le conte !'],
  ['compte', 'Les bateaux', '⛵', 5, 'Cinq bateaux sur la mer !'],
  ['intrus', 'Les fruits', ['🍎', '🍌', '🍐', '🚗'], 'Oui ! La voiture n’est pas un fruit.'],
  ['intrus', 'Les animaux de la ferme', ['🐮', '🐷', '🐔', '🦁'], 'Bravo ! Le lion vit dans la savane, pas à la ferme.'],
  ['intrus', 'Les véhicules', ['🚗', '🚌', '🚲', '🍰'], 'Exact ! Le gâteau ne roule pas.'],
  ['intrus', 'Sous la mer', ['🐠', '🐙', '🦀', '🐘'], 'Oui ! L’éléphant ne vit pas dans la mer.'],
  ['intrus', 'Les légumes', ['🥕', '🥦', '🌽', '⚽'], 'Bravo ! Le ballon ne se mange pas.'],
  ['intrus', 'Dans le ciel', ['☁️', '🌙', '⭐', '🐟'], 'Exact ! Le poisson nage, il ne vole pas.'],
  ['intrus', 'Les instruments', ['🎸', '🥁', '🎺', '🍕'], 'Oui ! La pizza ne fait pas de musique.'],
  ['intrus', 'Les vêtements', ['👕', '👖', '🧦', '🍌'], 'Bravo ! On ne s’habille pas avec une banane.'],
  ['intrus', 'L’hiver', ['⛄', '🧣', '❄️', '🏖️'], 'Exact ! La plage, c’est plutôt l’été.'],
  ['intrus', 'Les insectes', ['🐝', '🐞', '🦋', '🐄'], 'Oui ! La vache est bien trop grande pour un insecte.'],
  ['intrus', 'Le petit-déjeuner', ['🥐', '🥛', '🍞', '🔨'], 'Bravo ! Le marteau, ça ne se mange pas.'],
  ['intrus', 'Les formes rondes', ['⚽', '🍊', '🌕', '📦'], 'Exact ! La boîte est carrée.'],
  ['intrus', 'Les oiseaux', ['🦜', '🦉', '🐧', '🐶'], 'Oui ! Le chien n’a pas de plumes.'],
  ['intrus', 'Dans la salle de bain', ['🛁', '🧼', '🪥', '🌵'], 'Bravo ! Le cactus vit dans le désert.'],
  ['intrus', 'Les couleurs du feu', ['🔴', '🟠', '🟡', '🔵'], 'Exact ! Le bleu, c’est la couleur de l’eau.']
];

const titleEmoji = (row: Row): string =>
  row[0] === 'devinette' ? row[3][0] : row[0] === 'compte' ? row[2] : row[2][0];

const CLASSIQUES: Activity[] = ROWS.map((row, i): Activity => {
  const id = `activite-${String(i + 1).padStart(2, '0')}`;
  const emoji = titleEmoji(row);
  switch (row[0]) {
    case 'devinette':
      return { id, category: 'decouverte', kind: 'devinette', emoji, title: row[1], question: row[2], choices: row[3], bravo: row[4] };
    case 'compte':
      return { id, category: 'maths', kind: 'compte', emoji, title: row[1], item: row[2], count: row[3], bravo: row[4] };
    case 'intrus':
      return { id, category: 'logique', kind: 'intrus', emoji, title: row[1], items: row[2], bravo: row[3] };
  }
});

const APPRENTISSAGES: Activity[] = JEUX.map((j, i): Activity => {
  const base = { id: `jeu-${String(i + 1).padStart(2, '0')}`, category: j.theme, title: j.title, bravo: j.bravo };
  switch (j.kind) {
    case 'qcm':
      return { ...base, kind: 'devinette', emoji: splitChoice(j.choices[0]).emoji, question: j.question, choices: j.choices };
    case 'vf':
      return { ...base, kind: 'vf', emoji: j.emoji, statement: j.statement, answer: j.answer };
    case 'ordre':
      return { ...base, kind: 'ordre', emoji: splitChoice(j.steps[0]).emoji, question: j.question, steps: j.steps };
  }
});

/** Mélange équilibré : on alterne les thèmes, puis on intercale avec les jeux classiques. */
function interleave(groups: Activity[][]): Activity[] {
  // Répartition régulière : chaque élément est placé à sa position relative (i + ½) / taille
  // dans son groupe ; les grands groupes s'étalent donc sur toute la liste.
  return groups
    .flatMap((g, gi) => g.map((a, i) => ({ a, key: (i + 0.5) / g.length, gi })))
    .sort((x, y) => x.key - y.key || x.gi - y.gi)
    .map((x) => x.a);
}

const byCategory = (list: Activity[]) => {
  const map = new Map<Category, Activity[]>();
  for (const a of list) map.set(a.category, [...(map.get(a.category) ?? []), a]);
  return [...map.values()];
};

/** 110 activités : 50 classiques + 60 jeux d'apprentissage, toutes catégories mêlées. */
export const ACTIVITES: Activity[] = interleave(byCategory([...APPRENTISSAGES, ...CLASSIQUES]));

export const CATEGORY_INFO: Record<Category, { label: string; emoji: string }> = {
  langue: { label: 'Langue', emoji: '🗣️' },
  etre: { label: 'Savoir-être', emoji: '💛' },
  vivre: { label: 'Savoir-vivre', emoji: '🙏' },
  ia: { label: 'Découvrir l’IA', emoji: '🤖' },
  discipline: { label: 'Discipline', emoji: '⏰' },
  decouverte: { label: 'Découverte', emoji: '🔎' },
  maths: { label: 'Compter', emoji: '🔢' },
  logique: { label: 'Logique', emoji: '🧠' }
};