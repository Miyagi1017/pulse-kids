/**
 * 60 petits jeux d'apprentissage (12 par thème), mélangés aux autres activités.
 *
 *  - qcm   : question + choix « emoji:mot » (la bonne réponse en 1er, mélangée à l'affichage)
 *  - vf    : « C'est bien ou pas bien ? » / vrai-faux (👍 / 👎) avec une explication
 *  - ordre : remettre 3 ou 4 étapes dans le bon ordre (routines, histoires)
 */

export type Theme = 'langue' | 'etre' | 'vivre' | 'ia' | 'discipline';

export type Jeu =
  | { kind: 'qcm'; theme: Theme; title: string; question: string; choices: string[]; bravo: string }
  | { kind: 'vf'; theme: Theme; title: string; emoji: string; statement: string; answer: boolean; bravo: string }
  | { kind: 'ordre'; theme: Theme; title: string; question: string; steps: string[]; bravo: string };

const L: Theme = 'langue', E: Theme = 'etre', V: Theme = 'vivre', I: Theme = 'ia', D: Theme = 'discipline';

const qcm = (theme: Theme, title: string, question: string, choices: string[], bravo: string): Jeu => ({ kind: 'qcm', theme, title, question, choices, bravo });
const vf = (theme: Theme, title: string, emoji: string, statement: string, answer: boolean, bravo: string): Jeu => ({ kind: 'vf', theme, title, emoji, statement, answer, bravo });
const ordre = (theme: Theme, title: string, question: string, steps: string[], bravo: string): Jeu => ({ kind: 'ordre', theme, title, question, steps, bravo });

export const JEUX: Jeu[] = [
  // ---------- 🗣️ Langue ----------
  qcm(L, 'Ça rime avec chat', 'Quel mot rime avec « chat » ?', ['🐀:rat', '🐶:chien', '🐟:poisson'], 'Oui ! Chat, rat : ça finit pareil, « a » !'),
  qcm(L, 'Ça rime avec bateau', 'Quel mot rime avec « bateau » ?', ['🎂:gâteau', '🚗:voiture', '🍎:pomme'], 'Bravo ! Bateau, gâteau : « o » !'),
  qcm(L, 'Ça rime avec souris', 'Quel mot rime avec « souris » ?', ['🍚:riz', '🐘:éléphant', '🌳:arbre'], 'Exact ! Souris, riz : « i » !'),
  qcm(L, 'Le son « b »', 'Quel mot commence par le son « b » ?', ['🍌:banane', '🍎:pomme', '🐱:chat'], 'Oui ! B-b-banane !'),
  qcm(L, 'Le son « s »', 'Quel mot commence par le son « s » ?', ['☀️:soleil', '🌙:lune', '🐸:grenouille'], 'Bravo ! S-s-soleil !'),
  qcm(L, 'Le contraire de grand', 'Quel est le contraire de « grand » ?', ['🐭:petit', '🦒:géant', '🏔️:énorme'], 'Exact ! Grand et petit sont des contraires.'),
  qcm(L, 'Le contraire de chaud', 'Quel est le contraire de « chaud » ?', ['🧊:froid', '🔥:brûlant', '☀️:soleil'], 'Oui ! Chaud et froid sont des contraires.'),
  qcm(L, 'Les syllabes', 'Pa-pi-llon : combien de morceaux entends-tu ? Tape dans tes mains !', ['3️⃣:trois', '2️⃣:deux', '4️⃣:quatre'], 'Bravo ! Pa — pi — llon : trois syllabes !'),
  qcm(L, 'Un mot en anglais : cow', 'En anglais, « cow », c’est quel animal ?', ['🐮:la vache', '🐷:le cochon', '🐔:la poule'], 'Yes ! Cow, c’est la vache !'),
  qcm(L, 'Un mot en anglais : sun', 'En anglais, « sun », c’est quoi ?', ['☀️:le soleil', '🌙:la lune', '⭐:l’étoile'], 'Yes ! Sun, c’est le soleil !'),
  vf(L, 'Un ou plusieurs', '🐱', 'On dit « un chat », et « des chats » quand il y en a plusieurs.', true, 'Oui ! « Des », c’est quand il y en a plusieurs.'),
  ordre(L, 'Raconte l’histoire', 'Remets l’histoire du poussin dans l’ordre : d’abord, ensuite, enfin.', ['🥚:l’œuf', '🐣:il éclot', '🐥:le poussin', '🐔:la poule'], 'Bravo ! D’abord l’œuf, ensuite le poussin, enfin la poule !'),

  // ---------- 💛 Savoir-être ----------
  qcm(E, 'Le doudou perdu', 'Ton ami a perdu son doudou. Comment se sent-il ?', ['😢:triste', '😄:joyeux', '😴:fatigué'], 'Oui, il est triste. Tu peux l’aider à chercher ou lui faire un câlin.'),
  qcm(E, 'J’ai gagné !', 'Tu as gagné à un jeu. Comment tu te sens ?', ['😄:content', '😢:triste', '😠:en colère'], 'Oui ! Et tu peux dire « bien joué » à ton copain aussi.'),
  qcm(E, 'La colère', 'Quand on est en colère, qu’est-ce qu’on peut faire ?', ['🌬️:respirer doucement', '👊:taper', '📢:crier très fort'], 'Bravo ! Inspire… souffle… La colère redescend doucement.'),
  vf(E, 'Un copain tombe', '🤕', 'Si un copain tombe, je l’aide à se relever.', true, 'Oui ! Aider les autres, c’est être un super ami.'),
  vf(E, 'Tous différents', '🌈', 'On peut se moquer de quelqu’un parce qu’il est différent.', false, 'Non ! Chacun est différent, et c’est ce qui rend le monde joli.'),
  qcm(E, 'Seul à la récré', 'Un enfant est tout seul à la récré. Que fais-tu ?', ['🤝:je l’invite à jouer', '🙈:je l’ignore', '😝:je me moque'], 'Bravo ! Tu viens peut-être de te faire un nouvel ami.'),
  vf(E, 'Avoir peur', '😨', 'Avoir peur, ça arrive à tout le monde, même aux grands.', true, 'Oui ! Et on peut toujours en parler à quelqu’un qu’on aime.'),
  qcm(E, 'Le jouet cassé', 'Tu as cassé le jouet de ta sœur sans faire exprès. Que dis-tu ?', ['🙏:pardon', '🤐:rien', '🙅:c’est pas moi'], 'Oui ! Dire pardon, c’est courageux.'),
  vf(E, 'Partager', '🧸', 'Partager ses jouets peut rendre tout le monde heureux.', true, 'Exact ! On s’amuse encore plus à plusieurs.'),
  qcm(E, 'La surprise', 'Quel visage montre la surprise ?', ['😮:surpris', '😊:content', '😢:triste'], 'Bravo ! La bouche fait un grand « O » !'),
  vf(E, 'Toujours gagner ?', '🏆', 'Il faut toujours gagner pour être content.', false, 'Non ! Jouer ensemble, c’est déjà gagner.'),
  qcm(E, 'Consoler un ami', 'Ton ami est triste. Qu’est-ce qui peut l’aider ?', ['🤗:un câlin', '📺:la télé très fort', '🏃:partir en courant'], 'Oui ! Un câlin et des mots gentils, ça réconforte.'),

  // ---------- 🙏 Savoir-vivre ----------
  qcm(V, 'Le cadeau', 'Quand on reçoit un cadeau, on dit…', ['🙏:merci', '👋:au revoir', '🤐:rien'], 'Merci ! C’est le mot magique.'),
  qcm(V, 'À l’école', 'Le matin, en arrivant à l’école, on dit…', ['👋:bonjour', '🌙:bonne nuit', '🙏:pardon'], 'Bonjour ! Et avec un sourire, c’est encore mieux.'),
  vf(V, 'À table', '🍽️', 'À table, on mange la bouche fermée.', true, 'Oui ! C’est plus agréable pour tout le monde.'),
  vf(V, 'Chacun son tour', '🗣️', 'On peut couper la parole quand quelqu’un parle.', false, 'Non, on attend que l’autre ait fini pour parler.'),
  qcm(V, 'Demander gentiment', 'Pour demander quelque chose gentiment, on dit…', ['🙂:s’il te plaît', '😤:donne !', '🤐:rien'], 'Bravo ! « S’il te plaît », ça ouvre toutes les portes.'),
  vf(V, 'Atchoum !', '🤧', 'Quand on tousse ou qu’on éternue, on met son coude devant sa bouche.', true, 'Oui ! Comme ça, on ne partage pas ses microbes.'),
  qcm(V, 'Avant de manger', 'Avant de manger, on se lave…', ['🧼:les mains', '👟:les chaussures', '🧸:le doudou'], 'Exact ! Des mains propres pour un bon repas.'),
  vf(V, 'Les papiers', '🗑️', 'On peut jeter ses papiers par terre dans la rue.', false, 'Non ! On les met à la poubelle pour garder la ville propre.'),
  qcm(V, 'Dans le bus', 'Dans le bus, une dame âgée n’a pas de place. Que fais-tu ?', ['🪑:je lui donne ma place', '🙈:je fais semblant de ne pas voir', '😴:je dors'], 'Bravo ! C’est un très beau geste.'),
  vf(V, 'Toc toc', '🚪', 'On frappe à la porte avant d’entrer dans une chambre.', true, 'Oui ! Toc toc… on peut entrer ?'),
  qcm(V, 'Traverser la rue', 'Pour traverser, on attend que le petit bonhomme soit…', ['🟢:vert', '🔴:rouge', '🟡:jaune'], 'Oui ! Vert, on traverse, en donnant la main à un adulte.'),
  ordre(V, 'Le bain', 'Remets le bain dans l’ordre.', ['🚰:faire couler l’eau', '🧼:se savonner', '🚿:se rincer', '🧺:se sécher'], 'Tout propre ! Bravo !'),

  // ---------- 🤖 Découvrir l’IA ----------
  vf(I, 'L’IA peut se tromper', '🤖', 'Un robot ou une intelligence artificielle peut parfois se tromper.', true, 'Oui ! C’est pour ça qu’on vérifie toujours avec un adulte.'),
  vf(I, 'L’IA a-t-elle des sentiments ?', '💭', 'Une intelligence artificielle a des sentiments, comme toi.', false, 'Non. Elle sait parler, mais elle ne ressent rien. Tes émotions à toi sont vraies.'),
  qcm(I, 'Un inconnu sur la tablette', 'Quelqu’un que tu ne connais pas te demande ton adresse sur une tablette. Que fais-tu ?', ['🧑‍🧒:je demande à un adulte', '🏠:je la donne', '🤫:je la donne en secret'], 'Bravo ! On ne donne jamais son adresse : on en parle à un adulte.'),
  vf(I, 'Comment apprend une IA', '📚', 'Une intelligence artificielle apprend en regardant beaucoup, beaucoup d’exemples.', true, 'Oui ! Un peu comme toi quand tu t’entraînes.'),
  qcm(I, 'Qui décide ?', 'Qui décide quand tu peux utiliser un écran ?', ['👨‍👩‍👧:mes parents et moi', '🤖:la machine', '📱:la tablette toute seule'], 'Exact ! Ce sont les humains qui décident, pas les machines.'),
  vf(I, 'Tout est vrai à l’écran ?', '🖼️', 'Tout ce qu’on voit sur un écran est vrai.', false, 'Non : certaines images sont inventées, parfois par une IA. On vérifie avec un adulte.'),
  qcm(I, 'Une machine qui parle', 'Laquelle est une machine qui peut parler ?', ['🔊:une enceinte connectée', '🪑:une chaise', '🥄:une cuillère'], 'Oui ! Elle répond grâce à un programme d’ordinateur.'),
  vf(I, 'L’électricité', '🔌', 'Un robot a besoin d’électricité pour fonctionner.', true, 'Exact ! Sans batterie ni électricité, il ne bouge plus.'),
  qcm(I, 'Après l’écran', 'Après un moment sur la tablette, c’est bien de…', ['🌳:aller jouer dehors', '📱:rester encore des heures', '😴:dormir devant l’écran'], 'Bravo ! Bouger et jouer dehors, c’est bon pour le corps et la tête.'),
  vf(I, 'Le mot de passe', '🔐', 'Mon mot de passe, je le garde secret, sauf avec mes parents.', true, 'Oui ! Un mot de passe, c’est comme la clé de la maison.'),
  qcm(I, 'C’est quoi une IA ?', 'Une intelligence artificielle, c’est…', ['💻:un programme d’ordinateur', '🧙:un magicien', '🐶:un animal'], 'Exact ! Des personnes l’ont fabriquée avec des ordinateurs.'),
  vf(I, 'Une image qui fait peur', '🙋', 'Si une image sur l’écran me fait peur, j’en parle à un adulte.', true, 'Oui ! Les adultes sont là pour t’aider et te rassurer.'),

  // ---------- ⏰ Discipline ----------
  ordre(D, 'Se brosser les dents', 'Remets dans l’ordre pour bien se brosser les dents.', ['🪥:je prends ma brosse', '🧴:je mets le dentifrice', '😁:je brosse', '💧:je rince'], 'Des dents toutes brillantes !'),
  ordre(D, 'S’habiller le matin', 'Dans quel ordre on s’habille ?', ['👕:le t-shirt', '👖:le pantalon', '🧦:les chaussettes', '👟:les chaussures'], 'Bravo ! Les chaussettes avant les chaussures !'),
  ordre(D, 'Le soir avant de dormir', 'Remets le soir dans l’ordre.', ['🛁:le bain', '🪥:les dents', '📖:l’histoire', '😴:dodo'], 'Parfait ! Bonne nuit !'),
  vf(D, 'Ranger', '🧸', 'Quand j’ai fini de jouer, je range mes jouets.', true, 'Oui ! Comme ça, on les retrouve la prochaine fois.'),
  qcm(D, 'Le toboggan', 'Ce n’est pas encore ton tour au toboggan. Que fais-tu ?', ['⏳:j’attends mon tour', '🏃:je double tout le monde', '😤:je pousse'], 'Bravo ! Attendre son tour, c’est être patient.'),
  vf(D, 'Je n’y arrive pas', '💪', 'Si je n’y arrive pas du premier coup, j’abandonne tout de suite.', false, 'Non ! On réessaie : c’est comme ça qu’on apprend.'),
  ordre(D, 'Planter une graine', 'Comment fait-on pousser une plante ?', ['🪴:la terre', '🌰:la graine', '💧:l’eau', '🌱:ça pousse'], 'Bravo ! Et il faut être patient pour la voir grandir.'),
  qcm(D, 'Avant de traverser', 'Avant de traverser la rue, on…', ['👀:regarde à gauche et à droite', '🏃:court très vite', '📱:regarde l’écran'], 'Oui ! Et on donne toujours la main à un adulte.'),
  vf(D, 'Le sommeil', '🛌', 'Dormir assez aide mon corps à grandir.', true, 'Exact ! Le corps grandit pendant la nuit.'),
  qcm(D, 'Les chaussures', 'En rentrant à la maison, on range ses chaussures…', ['👟:à leur place', '🛋️:sur le canapé', '🛏️:dans le lit'], 'Bravo ! Chaque chose à sa place.'),
  vf(D, 'Finir ce qu’on commence', '🧩', 'Je finis ce que j’ai commencé avant de passer à autre chose.', true, 'Oui ! Quelle fierté quand le puzzle est terminé !'),
  ordre(D, 'Se laver les mains', 'Remets dans l’ordre pour bien se laver les mains.', ['💧:mouiller', '🧼:savonner', '👐:frotter', '🧻:sécher'], 'Des mains toutes propres !')
];

export const THEME_INFO: Record<Theme, { label: string; emoji: string }> = {
  langue: { label: 'Langue', emoji: '🗣️' },
  etre: { label: 'Savoir-être', emoji: '💛' },
  vivre: { label: 'Savoir-vivre', emoji: '🙏' },
  ia: { label: 'Découvrir l’IA', emoji: '🤖' },
  discipline: { label: 'Discipline', emoji: '⏰' }
};

/** Découpe « emoji:mot ». */
export function splitChoice(c: string): { emoji: string; word: string } {
  const i = c.indexOf(':');
  return i < 0 ? { emoji: c, word: '' } : { emoji: c.slice(0, i), word: c.slice(i + 1) };
}
