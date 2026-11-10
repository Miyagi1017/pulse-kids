/**
 * Les 100 comptines animées de Pulse Kids — paroles originales, à chanter avec Nino, Nina et Mila.
 *
 * Chaque comptine : 4 lignes courtes + un cri final, un décor, des objets qui apparaissent
 * pendant la chanson et un geste par ligne (que les personnages font… et l'enfant aussi).
 *
 * L'animation est dessinée en direct dans le navigateur (src/comptines/stage.ts, mêmes dessins
 * que la chanson vidéo) ; la voix et la musique sont un petit fichier audio par comptine,
 * fabriqué en local par scripts/comptines/build.mjs. Les horaires réels des lignes sont dans
 * comptinesTimings.json (écrit par ce même script).
 */

export type Decor = 'chambre' | 'jardin' | 'plage' | 'nuit' | 'neige' | 'foret' | 'cuisine' | 'ville';
export type Geste = 'tape' | 'coucou' | 'saute' | 'balance' | 'bras' | 'montre' | 'tourne' | 'marche' | 'etire' | 'dort';
export type Objet =
  | 'etoile'
  | 'coeur'
  | 'soleil'
  | 'lune'
  | 'nuage'
  | 'goutte'
  | 'fleur'
  | 'pomme'
  | 'poisson'
  | 'ballon'
  | 'balle'
  | 'canard'
  | 'cube'
  | 'feuille'
  | 'flocon'
  | 'papillon'
  | 'oiseau'
  | 'bateau'
  | 'carotte'
  | 'note'
  | 'voiture'
  | 'gateau'
  | 'bulle'
  | 'brosse'
  | 'fusee';

export type ComptineTheme = 'animaux' | 'routine' | 'compter' | 'couleurs' | 'corps' | 'meteo' | 'nature' | 'miam' | 'coeur' | 'voyage';

export const COMPTINE_THEMES: Record<ComptineTheme, { label: string; emoji: string }> = {
  animaux: { label: 'Animaux', emoji: '🐾' },
  routine: { label: 'Bonnes habitudes', emoji: '🪥' },
  compter: { label: 'Compter', emoji: '🔢' },
  couleurs: { label: 'Couleurs et formes', emoji: '🎨' },
  corps: { label: 'Bouger', emoji: '🤸' },
  meteo: { label: 'Météo et saisons', emoji: '🌦️' },
  nature: { label: 'Nature', emoji: '🌳' },
  miam: { label: 'Miam', emoji: '🍎' },
  coeur: { label: 'Émotions et politesse', emoji: '💛' },
  voyage: { label: 'Nuit et voyages', emoji: '🚀' }
};

export interface Comptine {
  id: string;
  title: string;
  emoji: string;
  theme: ComptineTheme;
  decor: Decor;
  objets: Objet[];
  /** Un geste par ligne chantée (4). */
  gestes: [Geste, Geste, Geste, Geste];
  /** Les 4 lignes chantées. */
  lines: [string, string, string, string];
  /** Le cri final, joyeux et court. */
  shout: string;
  /** La phrase à retenir. */
  retiens: string;
}

export const GESTE_INFO: Record<Geste, { emoji: string; label: string }> = {
  tape: { emoji: '👏', label: 'tape dans tes mains' },
  coucou: { emoji: '👋', label: 'fais coucou' },
  saute: { emoji: '🦘', label: 'saute sur place' },
  balance: { emoji: '🎶', label: 'balance-toi de gauche à droite' },
  bras: { emoji: '🙌', label: 'lève les bras' },
  montre: { emoji: '👉', label: 'montre du doigt' },
  tourne: { emoji: '🌀', label: 'tourne sur toi-même, doucement' },
  marche: { emoji: '🚶', label: 'marche sur place' },
  etire: { emoji: '🤸', label: 'étire-toi très haut' },
  dort: { emoji: '😴', label: 'pose ta tête sur tes mains' }
};

const slug = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

function c(theme: ComptineTheme, title: string, emoji: string, decor: Decor, objets: string, gestes: string, lines: string[], shout: string, retiens: string): Comptine {
  const g = gestes.split(' ') as Geste[];
  if (lines.length !== 4 || g.length !== 4) throw new Error(`Comptine « ${title} » : 4 lignes et 4 gestes attendus`);
  return {
    id: `comptine-${slug(title)}`,
    title,
    emoji,
    theme,
    decor,
    objets: objets.split(' ') as Objet[],
    gestes: g as Comptine['gestes'],
    lines: lines as Comptine['lines'],
    shout,
    retiens
  };
}

export const COMPTINES: Comptine[] = [
  /* ---------------------------------------------------------------- */
  /* Animaux                                                          */
  /* ---------------------------------------------------------------- */
  c('animaux', 'Le petit chat Mila', '🐱', 'chambre', 'balle coeur', 'balance coucou saute tape', ['Mila, la petite chatte,', 'Donne une patte, deux pattes,', 'Elle saute sur le tapis,', 'Et ronronne : « Merci ! »'], 'Miaou !', 'On caresse un chat tout doucement, dans le sens des poils.'),
  c('animaux', 'Les poissons de la mer', '🐟', 'plage', 'poisson bulle', 'balance montre tourne tape', ['Petit poisson dans l’eau bleue,', 'Fait des bulles, une ou deux,', 'Il tourne, tourne, tourne en rond,', 'Et nage avec ses amis poissons !'], 'Blop, blop !', 'Les poissons respirent dans l’eau grâce à leurs branchies.'),
  c('animaux', 'Le canard qui fait coin-coin', '🦆', 'jardin', 'canard goutte', 'marche balance saute tape', ['Coin-coin fait le canard,', 'Il se promène sans retard,', 'Il saute dans la flaque d’eau,', 'Splash ! Il est tout beau !'], 'Coin-coin !', 'Les plumes du canard ne se mouillent pas : elles sont huilées.'),
  c('animaux', 'Le papillon léger', '🦋', 'jardin', 'papillon fleur', 'bras balance tourne coucou', ['Papillon, joli papillon,', 'Vole au-dessus des chardons,', 'Il se pose sur une fleur,', 'Et repart de toutes les couleurs !'], 'Envole-toi !', 'Avant d’être un papillon, il était une chenille.'),
  c('animaux', 'L’oiseau du matin', '🐦', 'jardin', 'oiseau soleil', 'coucou bras balance tape', ['Petit oiseau sur la branche,', 'Chante fort quand c’est dimanche,', 'Il ouvre ses ailes au soleil,', 'Et dit bonjour au monde qui s’éveille !'], 'Cui-cui !', 'Les oiseaux chantent surtout le matin, au lever du jour.'),
  c('animaux', 'Le lapin gourmand', '🐰', 'jardin', 'carotte fleur', 'saute montre tape saute', ['Saute, saute, petit lapin,', 'Dans le pré du grand jardin,', 'Il trouve une carotte orange,', 'Croc, croc, croc, comme il la mange !'], 'Croc !', 'Le lapin a de longues oreilles pour bien entendre.'),
  c('animaux', 'L’escargot tranquille', '🐌', 'foret', 'feuille goutte', 'marche balance etire tape', ['Escargot, tout doux, tout lent,', 'Porte sa maison en avançant,', 'Il sort ses cornes quand il pleut,', 'Et se promène tout heureux !'], 'Tout doux !', 'L’escargot porte sa coquille sur son dos : c’est sa maison.'),
  c('animaux', 'La grenouille qui saute', '🐸', 'foret', 'goutte feuille', 'saute saute balance tape', ['Grenouille verte dans l’étang,', 'Saute, saute en chantant,', 'Sur un nénuphar elle s’assoit,', 'Et fait « croa, croa, croa » !'], 'Croa !', 'Le têtard grandit et devient une grenouille.'),
  c('animaux', 'L’ours qui dort', '🐻', 'neige', 'flocon lune', 'dort etire marche tape', ['Le gros ours dort tout l’hiver,', 'Bien caché, les yeux fermés,', 'Au printemps il s’étire, il bâille,', 'Et part goûter le miel des abeilles !'], 'Bonjour l’ours !', 'Certains animaux dorment presque tout l’hiver : ils hibernent.'),
  c('animaux', 'Les abeilles au travail', '🐝', 'jardin', 'fleur soleil', 'balance tourne montre tape', ['Bzz, bzz, la petite abeille,', 'Vole de fleur en fleur pareille,', 'Elle rapporte du pollen,', 'Pour faire du miel, quelle reine !'], 'Bzz !', 'Les abeilles aident les fleurs et les fruits à pousser.'),

  /* ---------------------------------------------------------------- */
  /* Bonnes habitudes                                                 */
  /* ---------------------------------------------------------------- */
  c('routine', 'Je me lave les mains', '🧼', 'cuisine', 'bulle goutte', 'montre tourne tape coucou', ['De l’eau, du savon, frotte, frotte,', 'Les doigts, les pouces, la menotte,', 'Je rince bien, je fais des bulles,', 'Mes mains sont propres, c’est super !'], 'Toutes propres !', 'On se lave les mains avant de manger et après les toilettes.'),
  c('routine', 'Brosse, brosse les dents', '🪥', 'chambre', 'brosse bulle', 'montre balance tourne tape', ['Brosse, brosse, brosse les dents,', 'En haut, en bas, tout doucement,', 'Les petits ronds, deux minutes,', 'Et mon sourire fait la culbute !'], 'Ça brille !', 'On se brosse les dents le matin et le soir, deux minutes.'),
  c('routine', 'Je range ma chambre', '🧸', 'chambre', 'cube balle canard', 'montre tape balance bras', ['Un jouet, puis un autre encore,', 'Je range tout, je suis très fort,', 'Les cubes, la balle, le canard,', 'Ma chambre est belle, quel art !'], 'Rangé !', 'Ranger un jouet à la fois, c’est plus facile.'),
  c('routine', 'Je m’habille tout seul', '👕', 'chambre', 'coeur etoile', 'bras montre marche tape', ['Le t-shirt passe par la tête,', 'Le pantalon, une jambe, c’est prête,', 'Les chaussettes, les chaussures,', 'Je suis habillé, c’est sûr !'], 'Prêt !', 'On met d’abord les chaussettes, puis les chaussures.'),
  c('routine', 'Au dodo', '🌙', 'nuit', 'lune etoile', 'balance dort etire dort', ['La lune brille dans le ciel,', 'Les étoiles font la ronde avec elle,', 'Je bâille, je ferme les yeux,', 'Fais de beaux rêves, mon ami joyeux !'], 'Bonne nuit !', 'Dormir assez aide le corps à grandir.'),
  c('routine', 'Le bain qui fait des bulles', '🛁', 'chambre', 'bulle canard', 'tourne tape balance coucou', ['Dans le bain, plein de mousse,', 'Le canard flotte et se trémousse,', 'Je lave mes bras, mes pieds,', 'Me voilà tout propre et parfumé !'], 'Splash !', 'Le bain, c’est toujours avec un adulte tout près.'),
  c('routine', 'Boire de l’eau', '💧', 'cuisine', 'goutte soleil', 'montre bras tape saute', ['Glou, glou, un verre d’eau,', 'C’est bon pour le corps, c’est beau,', 'Quand je cours et quand j’ai chaud,', 'Je bois, je bois, c’est rigolo !'], 'Glou, glou !', 'L’eau est la meilleure boisson pour le corps.'),
  c('routine', 'Le petit-déjeuner', '🥣', 'cuisine', 'pomme soleil', 'coucou montre tape bras', ['Le soleil se lève, bonjour,', 'Le petit-déj’, c’est mon tour,', 'Un fruit, du pain, un bol de lait,', 'Je suis plein d’énergie, c’est parfait !'], 'Miam !', 'Le petit-déjeuner donne de l’énergie pour la matinée.'),
  c('routine', 'Je me mouche', '🤧', 'chambre', 'nuage coeur', 'montre tape balance coucou', ['Atchoum ! Mon nez coule un peu,', 'Je prends un mouchoir, c’est mieux,', 'Je souffle fort, une narine, deux,', 'Puis je jette, et je me lave les mains !'], 'À tes souhaits !', 'On éternue dans son coude et on jette le mouchoir.'),
  c('routine', 'Les chaussures à leur place', '👟', 'chambre', 'cube etoile', 'marche montre tape coucou', ['Quand je rentre à la maison,', 'J’enlève mes chaussures, c’est bon,', 'Je les pose bien à côté,', 'Et ma maison reste rangée !'], 'Bien rangées !', 'Chaque chose à sa place, on la retrouve plus vite.'),

  /* ---------------------------------------------------------------- */
  /* Compter                                                          */
  /* ---------------------------------------------------------------- */
  c('compter', 'Un, deux, trois, on compte', '🔢', 'chambre', 'cube etoile', 'montre saute tape bras', ['Un, deux, trois, on compte en chœur,', 'Quatre, cinq, six, avec bonheur,', 'Sept, huit, neuf, encore un pas,', 'Et dix ! On a gagné, hourra !'], 'Dix !', 'Compter jusqu’à dix, c’est utiliser ses deux mains.'),
  c('compter', 'Cinq petits doigts', '🖐️', 'chambre', 'coeur etoile', 'montre coucou balance tape', ['Cinq petits doigts dans ma main,', 'Le pouce dit « bonjour » au voisin,', 'L’index montre le chemin,', 'Et tous ensemble font coucou demain !'], 'Coucou !', 'Une main a cinq doigts ; deux mains en ont dix.'),
  c('compter', 'Trois petits nuages', '☁️', 'jardin', 'nuage goutte', 'bras montre balance tape', ['Trois petits nuages dans le ciel,', 'Un pour la pluie, un pour le miel,', 'Le troisième est tout content,', 'Il danse avec le vent !'], 'Un, deux, trois !', 'Les nuages sont faits de toutes petites gouttes d’eau.'),
  c('compter', 'Quatre ballons', '🎈', 'ville', 'ballon coeur', 'bras montre tourne tape', ['Un ballon rouge, un ballon bleu,', 'Un ballon jaune, ça fait trois, mon vieux,', 'Un ballon vert pour finir,', 'Quatre ballons qui font sourire !'], 'Quatre !', 'On tient bien la ficelle du ballon pour qu’il ne s’envole pas.'),
  c('compter', 'Deux mains, deux pieds', '🦶', 'jardin', 'etoile coeur', 'tape marche saute bras', ['Deux mains pour taper, clap, clap,', 'Deux pieds pour marcher, tap, tap,', 'Un nez, une bouche, un menton,', 'Et deux yeux tout ronds !'], 'Clap, tap !', 'Le corps a souvent des paires : deux yeux, deux oreilles, deux bras.'),
  c('compter', 'Dix étoiles', '⭐', 'nuit', 'etoile lune', 'montre bras balance dort', ['Une étoile, puis deux, puis trois,', 'Elles s’allument au-dessus des toits,', 'Quatre, cinq, et jusqu’à dix,', 'Le ciel brille, c’est un délice !'], 'Dix étoiles !', 'Les étoiles sont de très grands soleils, très très loin.'),
  c('compter', 'Les pommes du pommier', '🍎', 'jardin', 'pomme feuille', 'montre bras saute tape', ['Sur le pommier, une pomme rouge,', 'Deux pommes qui bougent, bougent,', 'Trois pommes tombent dans l’herbe,', 'On les ramasse, c’est superbe !'], 'Trois pommes !', 'La pomme pousse sur le pommier, après la fleur.'),
  c('compter', 'Les jours de la semaine', '📅', 'ville', 'soleil etoile', 'marche coucou tape bras', ['Lundi, mardi, on va à l’école,', 'Mercredi, on joue, on rigole,', 'Jeudi, vendredi, samedi,', 'Et dimanche, on fait la fête aussi !'], 'Sept jours !', 'Une semaine a sept jours.'),
  c('compter', 'Les saisons en rond', '🍂', 'foret', 'fleur feuille', 'tourne balance montre tape', ['Le printemps fait pousser les fleurs,', 'L’été chauffe de bonne humeur,', 'L’automne fait tomber les feuilles,', 'L’hiver, la neige nous accueille !'], 'Quatre saisons !', 'Il y a quatre saisons dans une année.'),
  c('compter', 'Cache-cache jusqu’à cinq', '🙈', 'jardin', 'fleur papillon', 'dort montre saute tape', ['Je ferme les yeux, je compte,', 'Un, deux, trois, quatre, cinq, je raconte,', 'Où es-tu ? Je cherche partout,', 'Je t’ai trouvé ! Coucou !'], 'Trouvé !', 'Au cache-cache, on se cache dans des endroits sans danger.'),

  /* ---------------------------------------------------------------- */
  /* Couleurs et formes                                               */
  /* ---------------------------------------------------------------- */
  c('couleurs', 'L’arc-en-ciel', '🌈', 'jardin', 'nuage soleil', 'bras montre balance tape', ['Rouge, orange, jaune soleil,', 'Vert et bleu, quelle merveille,', 'Indigo et violet joli,', 'L’arc-en-ciel sourit après la pluie !'], 'Arc-en-ciel !', 'L’arc-en-ciel apparaît quand il y a du soleil et de la pluie.'),
  c('couleurs', 'Le rond, le carré', '🔷', 'chambre', 'balle cube', 'tourne montre tape bras', ['Le rond roule comme un ballon,', 'Le carré a quatre côtés bien bons,', 'Le triangle pointe le ciel,', 'Les formes, c’est pas pareil !'], 'Rond, carré !', 'Un carré a quatre côtés de la même taille.'),
  c('couleurs', 'Le rouge qui chante', '🍓', 'cuisine', 'pomme coeur', 'montre balance tape coucou', ['Rouge comme une fraise des bois,', 'Rouge comme la pomme du roi,', 'Rouge comme mon petit cœur,', 'Rouge, c’est plein de bonheur !'], 'Tout rouge !', 'La fraise, la tomate et la cerise sont rouges.'),
  c('couleurs', 'Le bleu de la mer', '🌊', 'plage', 'poisson bateau', 'balance bras montre tape', ['Bleu comme la mer qui danse,', 'Bleu comme le ciel en vacances,', 'Bleu comme le petit bateau,', 'Qui glisse doucement sur l’eau !'], 'Tout bleu !', 'La mer paraît bleue parce qu’elle reflète le ciel.'),
  c('couleurs', 'Le jaune soleil', '🌻', 'jardin', 'soleil fleur', 'bras balance montre tape', ['Jaune comme le soleil d’été,', 'Jaune comme le canard mouillé,', 'Jaune comme le tournesol,', 'Qui regarde le ciel et rigole !'], 'Tout jaune !', 'Le tournesol tourne sa tête vers le soleil.'),
  c('couleurs', 'Le vert de la forêt', '🌳', 'foret', 'feuille oiseau', 'etire balance montre tape', ['Vert comme la feuille de l’arbre,', 'Vert comme la grenouille qui se cabre,', 'Vert comme l’herbe du pré,', 'Vert, c’est la nature qui va chanter !'], 'Tout vert !', 'Les feuilles sont vertes grâce à la lumière du soleil.'),
  c('couleurs', 'Je mélange les couleurs', '🎨', 'chambre', 'goutte etoile', 'tourne montre tape bras', ['Du bleu, du jaune, je mélange,', 'Et voilà du vert, c’est étrange !', 'Du rouge, du jaune, tourne, tourne,', 'L’orange arrive, tout le monde se retourne !'], 'Magie !', 'Bleu et jaune mélangés donnent du vert.'),
  c('couleurs', 'Le triangle pointu', '🔺', 'ville', 'cube balle', 'montre bras tourne tape', ['Trois côtés et trois pointes,', 'Le triangle a la tête bien jointe,', 'Comme le toit de la maison,', 'Ou un chapeau de clown, c’est bon !'], 'Pointu !', 'Un triangle a trois côtés et trois coins.'),
  c('couleurs', 'Noir et blanc', '🐼', 'neige', 'flocon lune', 'balance montre tape coucou', ['Blanc comme la neige qui tombe,', 'Noir comme la nuit qui s’arrondit,', 'Le panda est noir et blanc,', 'Il mange du bambou en dansant !'], 'Noir et blanc !', 'Le panda mange surtout du bambou.'),
  c('couleurs', 'Le rose bonbon', '🌸', 'jardin', 'fleur coeur', 'balance coucou tourne tape', ['Rose comme la fleur du cerisier,', 'Rose comme mes joues après avoir joué,', 'Rose comme le cochon qui rit,', 'Rose, c’est doux et joli !'], 'Tout rose !', 'Le rose, c’est du rouge mélangé avec du blanc.'),

  /* ---------------------------------------------------------------- */
  /* Bouger                                                           */
  /* ---------------------------------------------------------------- */
  c('corps', 'Tête, épaules, genoux', '🙆', 'chambre', 'etoile coeur', 'montre montre montre bras', ['Je touche ma tête, mes épaules,', 'Mes genoux, mes pieds, c’est drôle,', 'Mes yeux, mon nez, ma bouche,', 'Et mes oreilles, je les touche !'], 'Et voilà !', 'Connaître les parties de son corps aide à dire où on a mal.'),
  c('corps', 'Je saute comme un kangourou', '🦘', 'jardin', 'etoile ballon', 'saute saute balance tape', ['Hop, hop, je saute très haut,', 'Comme un kangourou rigolo,', 'Pieds joints et genoux pliés,', 'J’atterris tout doux sur mes pieds !'], 'Hop !', 'On plie les genoux pour atterrir en douceur.'),
  c('corps', 'Je marche comme un éléphant', '🐘', 'foret', 'feuille soleil', 'marche marche balance tape', ['Boum, boum, je marche lourdement,', 'Comme un gros éléphant,', 'Ma trompe se balance,', 'Et je danse, je danse !'], 'Boum !', 'L’éléphant est le plus gros animal qui vit sur terre.'),
  c('corps', 'Je m’étire comme un chat', '🐈', 'chambre', 'coeur balle', 'etire bras balance dort', ['Je m’étire comme Mila,', 'Les bras en haut, comme ça,', 'Je fais le dos rond, tout doux,', 'Et je bâille, comme vous !'], 'Miaou !', 'S’étirer le matin réveille les muscles en douceur.'),
  c('corps', 'La danse des bras', '🙌', 'ville', 'note etoile', 'bras balance tourne tape', ['Les bras en haut, les bras en bas,', 'Les bras devant, comme ça,', 'Je tourne, tourne, comme le vent,', 'Et j’applaudis en chantant !'], 'Bravo !', 'Danser, c’est bouger son corps avec la musique.'),
  c('corps', 'Le petit train', '🚂', 'ville', 'nuage voiture', 'marche marche bras tape', ['Tchou, tchou, le petit train,', 'Avance, avance sur son chemin,', 'Il siffle fort dans le tunnel,', 'Et s’arrête près du ruisseau bleu !'], 'Tchou, tchou !', 'Le train roule sur des rails.'),
  c('corps', 'Debout, assis', '🪑', 'chambre', 'cube etoile', 'bras dort saute tape', ['Debout, je grandis comme un arbre,', 'Assis, je suis calme comme du marbre,', 'Debout, je saute comme un ressort,', 'Assis, je respire très fort !'], 'Debout !', 'Bouger un peu toutes les heures, c’est bon pour le corps.'),
  c('corps', 'Les pieds qui dansent', '💃', 'ville', 'note coeur', 'marche tourne saute tape', ['Talon, pointe, talon, pointe,', 'Mes pieds dansent, rien ne les dompte,', 'Un petit tour sur moi-même,', 'C’est la danse que j’aime !'], 'Olé !', 'On danse pieds nus ou avec des chaussures qui tiennent bien.'),
  c('corps', 'Je respire comme une fleur', '🌼', 'jardin', 'fleur papillon', 'bras balance etire coucou', ['Je sens la fleur, j’inspire,', 'Je souffle la bougie, je respire,', 'Mon ventre monte, mon ventre descend,', 'Je suis calme et content !'], 'Tout calme !', 'Respirer lentement aide à se calmer.'),
  c('corps', 'Le robot rigolo', '🤖', 'ville', 'cube etoile', 'marche montre tourne tape', ['Je suis un robot, bip, bip,', 'Je marche tout raide, clip, clip,', 'Je tourne la tête, à gauche, à droite,', 'Et je danse, la tête bien droite !'], 'Bip bip !', 'Les robots obéissent aux programmes écrits par des humains.'),

  /* ---------------------------------------------------------------- */
  /* Météo et saisons                                                 */
  /* ---------------------------------------------------------------- */
  c('meteo', 'Il pleut, il mouille', '🌧️', 'ville', 'goutte nuage', 'montre saute balance tape', ['Plic, ploc, il pleut sur le toit,', 'Je mets mes bottes, une, deux, trois,', 'Je saute dans les flaques d’eau,', 'Avec mon grand parapluie beau !'], 'Plic, ploc !', 'Les bottes de pluie gardent les pieds au sec.'),
  c('meteo', 'Bonjour soleil', '☀️', 'jardin', 'soleil fleur', 'coucou bras balance tape', ['Bonjour soleil, tu brilles fort,', 'Tu fais pousser les fleurs d’or,', 'Je mets mon chapeau sur la tête,', 'Et de l’eau, c’est la fête !'], 'Bonjour !', 'Au soleil, on met un chapeau et on boit de l’eau.'),
  c('meteo', 'La neige tombe', '❄️', 'neige', 'flocon nuage', 'bras tourne balance tape', ['Tout doux, tout blanc, il neige,', 'Les flocons dansent en cortège,', 'Je fais un bonhomme tout rond,', 'Avec une carotte et un chapeau long !'], 'Il neige !', 'Chaque flocon de neige a une forme différente.'),
  c('meteo', 'Le vent qui souffle', '🌬️', 'foret', 'feuille nuage', 'balance tourne bras tape', ['Fff, fff, le vent souffle fort,', 'Les feuilles volent jusqu’au port,', 'Il pousse les nuages là-bas,', 'Et fait danser mes cheveux comme ça !'], 'Fffff !', 'Le vent, c’est de l’air qui bouge.'),
  c('meteo', 'L’orage gronde', '⛈️', 'ville', 'nuage goutte', 'montre dort balance tape', ['Boum ! L’orage gronde là-haut,', 'Je me cache au chaud, il fait beau,', 'Je compte jusqu’au tonnerre,', 'Et bientôt revient la lumière !'], 'Ça passe !', 'Pendant l’orage, on reste à l’abri dans la maison.'),
  c('meteo', 'Le printemps arrive', '🌷', 'jardin', 'fleur oiseau', 'bras coucou balance tape', ['Le printemps ouvre la porte,', 'Les fleurs sortent, quelle cohorte !', 'Les oiseaux reviennent chanter,', 'Les arbres se remettent à pousser !'], 'Printemps !', 'Au printemps, les fleurs poussent et les oiseaux font leur nid.'),
  c('meteo', 'L’été à la plage', '🏖️', 'plage', 'soleil bateau', 'balance montre saute tape', ['L’été, on va à la plage,', 'On fait des châteaux de sable sages,', 'On saute dans les vagues bleues,', 'Avec un chapeau, c’est mieux !'], 'Les vacances !', 'À la plage, on met de la crème solaire et un chapeau.'),
  c('meteo', 'L’automne des feuilles', '🍁', 'foret', 'feuille pomme', 'tourne balance saute tape', ['Les feuilles tombent en tournant,', 'Rouges, jaunes, en dansant,', 'Je saute dans le gros tas,', 'Et ça fait crac, crac, crac !'], 'Crac !', 'En automne, beaucoup d’arbres perdent leurs feuilles.'),
  c('meteo', 'Le bonhomme de neige', '⛄', 'neige', 'flocon carotte', 'tourne montre bras tape', ['Une boule, puis deux, puis trois,', 'Mon bonhomme est grand, ma foi,', 'Une carotte pour le nez,', 'Et une écharpe pour ne pas geler !'], 'Brrr !', 'Quand il fait froid, on met un bonnet, une écharpe et des gants.'),
  c('meteo', 'Le nuage voyageur', '🌥️', 'ville', 'nuage soleil', 'balance montre tourne coucou', ['Un petit nuage voyage,', 'Au-dessus des villes et des villages,', 'Il pleut un peu sur le jardin,', 'Et repart au matin !'], 'Au revoir nuage !', 'La pluie qui tombe vient des nuages.'),

  /* ---------------------------------------------------------------- */
  /* Nature                                                           */
  /* ---------------------------------------------------------------- */
  c('nature', 'La petite graine', '🌱', 'jardin', 'goutte fleur', 'dort etire bras tape', ['Une graine dort dans la terre,', 'La pluie lui donne de l’eau claire,', 'Le soleil la réchauffe un peu,', 'Elle pousse et devient fleur, c’est merveilleux !'], 'Elle pousse !', 'Une plante a besoin d’eau, de lumière et de terre.'),
  c('nature', 'Le grand arbre', '🌳', 'foret', 'feuille oiseau', 'etire bras balance tape', ['Le grand arbre a des racines,', 'Qui boivent l’eau tout en bas des collines,', 'Ses branches touchent le ciel,', 'Et les oiseaux y font leur nid de miel !'], 'Grand arbre !', 'Les arbres fabriquent l’air que nous respirons.'),
  c('nature', 'Les vagues de la mer', '🌊', 'plage', 'bateau poisson', 'balance balance bras tape', ['La vague arrive, la vague s’en va,', 'Elle chatouille mes pieds comme ça,', 'Le petit bateau se balance,', 'Sur la mer qui danse !'], 'Splash !', 'À la mer, on se baigne toujours avec un adulte.'),
  c('nature', 'La fourmi travailleuse', '🐜', 'foret', 'feuille pomme', 'marche montre tape bras', ['Une fourmi, deux fourmis,', 'Portent une miette, quelle amie !', 'Elles marchent toutes en file,', 'Et rentrent à la maison tranquille !'], 'En file !', 'Les fourmis travaillent ensemble pour nourrir leur colonie.'),
  c('nature', 'Les champignons', '🍄', 'foret', 'feuille goutte', 'montre dort tape coucou', ['Dans la forêt, après la pluie,', 'Les champignons sortent, hop, les voici,', 'On les regarde, on ne les mange pas,', 'Seul un adulte sait, voilà !'], 'On regarde !', 'On ne mange jamais un champignon trouvé sans un adulte qui s’y connaît.'),
  c('nature', 'La montagne', '⛰️', 'neige', 'nuage oiseau', 'marche etire bras tape', ['On grimpe, on grimpe la montagne,', 'Un pas, deux pas, on gagne,', 'Tout en haut, on voit très loin,', 'Les nuages nous disent « bonjour, copain » !'], 'Tout en haut !', 'En montagne, on marche doucement et on boit souvent.'),
  c('nature', 'La rivière', '🏞️', 'foret', 'poisson goutte', 'balance montre marche tape', ['La rivière coule, coule, coule,', 'Sur les cailloux elle roule,', 'Les poissons nagent à l’envers,', 'Elle s’en va jusqu’à la mer !'], 'Glou glou !', 'Les rivières finissent souvent dans la mer.'),
  c('nature', 'Le jardin potager', '🥕', 'jardin', 'carotte goutte', 'montre bras dort tape', ['Je plante une carotte, un radis,', 'J’arrose tous les mercredis,', 'Le soleil fait pousser tout ça,', 'Et bientôt on mangera !'], 'Ça pousse !', 'Les légumes poussent dans le potager, avec de l’eau et du soleil.'),
  c('nature', 'La coccinelle', '🐞', 'jardin', 'feuille fleur', 'montre bras balance tape', ['Coccinelle rouge à pois noirs,', 'Monte sur mon doigt, viens voir,', 'Compte tes points, un, deux, trois,', 'Et envole-toi loin de moi !'], 'Envole-toi !', 'La coccinelle mange les pucerons qui abîment les plantes.'),
  c('nature', 'Le coquillage', '🐚', 'plage', 'poisson etoile', 'montre balance tourne tape', ['J’ai trouvé un coquillage,', 'Tout au bord de la plage,', 'Je l’approche de mon oreille,', 'J’entends la mer, quelle merveille !'], 'Chhhh !', 'Les coquillages étaient la maison de petits animaux de la mer.'),

  /* ---------------------------------------------------------------- */
  /* Miam                                                             */
  /* ---------------------------------------------------------------- */
  c('miam', 'La soupe aux légumes', '🥣', 'cuisine', 'carotte goutte', 'tourne montre tape bras', ['Une carotte, un poireau,', 'Une pomme de terre, dans le pot,', 'Je tourne, tourne la cuillère,', 'Mmh, la soupe de grand-mère !'], 'Miam !', 'Les légumes donnent des vitamines pour être en forme.'),
  c('miam', 'Les fruits de toutes les couleurs', '🍇', 'cuisine', 'pomme coeur', 'montre balance tape bras', ['Une banane jaune, une fraise rouge,', 'Une poire verte qui bouge,', 'Des raisins violets tout ronds,', 'Les fruits, c’est très bon !'], 'Miam miam !', 'On mange des fruits de toutes les couleurs.'),
  c('miam', 'Le gâteau d’anniversaire', '🎂', 'cuisine', 'gateau etoile', 'tape montre bras tape', ['De la farine, du sucre, des œufs,', 'On mélange, c’est merveilleux,', 'Des bougies sur le gâteau,', 'Joyeux anniversaire, bravo !'], 'Joyeux anniversaire !', 'On fait la cuisine avec un adulte, surtout avec le four.'),
  c('miam', 'Le pique-nique', '🧺', 'jardin', 'pomme soleil', 'marche montre tape coucou', ['On étale la nappe dans l’herbe,', 'Le pique-nique, c’est superbe,', 'Des tartines et du fromage,', 'Et on range tout, c’est sage !'], 'Pique-nique !', 'Après le pique-nique, on ramasse tous les papiers.'),
  c('miam', 'La crêpe qui saute', '🥞', 'cuisine', 'gateau coeur', 'tourne saute tape bras', ['Je verse la pâte dans la poêle,', 'La crêpe est ronde comme une étoile,', 'Hop ! Elle saute dans les airs,', 'Et retombe, quelle affaire !'], 'Hop la crêpe !', 'La poêle est chaude : c’est l’adulte qui fait sauter la crêpe.'),
  c('miam', 'Le jus d’orange', '🍊', 'cuisine', 'soleil goutte', 'tourne montre bras tape', ['Je presse, presse les oranges,', 'Le jus coule comme une vendange,', 'Un grand verre bien sucré,', 'Plein de soleil à goûter !'], 'Glou glou !', 'L’orange contient de la vitamine C.'),
  c('miam', 'Le marché', '🧺', 'ville', 'pomme carotte', 'marche montre tape coucou', ['Au marché, il y a des tomates,', 'Des poireaux et des patates,', 'Des pommes, des poires, du raisin,', 'Je remplis mon panier, c’est bien !'], 'Bon marché !', 'Au marché, on trouve des fruits et légumes de saison.'),
  c('miam', 'Le pain croustillant', '🥖', 'ville', 'soleil coeur', 'marche montre tape bras', ['Le boulanger se lève tôt,', 'Il fait le pain tout chaud,', 'La baguette est croustillante,', 'Crac ! Elle est craquante !'], 'Crac !', 'Le pain est fait avec de la farine, de l’eau et du sel.'),
  c('miam', 'La pomme croquante', '🍏', 'jardin', 'pomme feuille', 'montre tape saute bras', ['Une pomme rouge, une pomme verte,', 'Croque-la, ta bouche est ouverte,', 'Elle est sucrée, elle est juteuse,', 'Ma pomme me rend heureuse !'], 'Croc !', 'On lave les fruits avant de les manger.'),
  c('miam', 'La table bien mise', '🍽️', 'cuisine', 'gateau etoile', 'montre montre tape coucou', ['La fourchette à gauche, à droite le couteau,', 'L’assiette au milieu, c’est beau,', 'Le verre juste au-dessus,', 'À table, tout le monde est venu !'], 'À table !', 'Aider à mettre la table, c’est aider toute la famille.'),

  /* ---------------------------------------------------------------- */
  /* Émotions et politesse                                            */
  /* ---------------------------------------------------------------- */
  c('coeur', 'Bonjour, merci', '🙏', 'ville', 'coeur etoile', 'coucou montre tape bras', ['Bonjour quand j’arrive le matin,', 'Merci quand on me donne la main,', 'S’il te plaît pour demander,', 'Et au revoir quand je dois m’en aller !'], 'Merci !', 'Les mots magiques rendent tout le monde content.'),
  c('coeur', 'Je suis content', '😊', 'jardin', 'coeur soleil', 'saute tape bras tourne', ['Quand je suis content, je souris,', 'Je saute, je danse et je ris,', 'Mon cœur fait des petits bonds,', 'Et je chante cette chanson !'], 'Youpi !', 'Partager sa joie, ça la rend encore plus grande.'),
  c('coeur', 'Quand je suis triste', '😢', 'chambre', 'nuage coeur', 'dort balance bras coucou', ['Quand je suis triste, je pleure un peu,', 'Je fais un câlin, ça va mieux,', 'Je dis ce qui me fait du chagrin,', 'Et le soleil revient demain !'], 'Un câlin !', 'Quand on est triste, on peut le dire à un adulte.'),
  c('coeur', 'Quand je suis en colère', '😤', 'chambre', 'nuage etoile', 'marche etire balance tape', ['Grr ! Je suis en colère,', 'Je tape des pieds sur la terre,', 'Je respire comme un dragon,', 'Et la colère s’en va, c’est bon !'], 'Ouf !', 'Respirer très lentement aide la colère à partir.'),
  c('coeur', 'J’ai un peu peur', '😨', 'nuit', 'lune etoile', 'dort montre bras tape', ['J’ai un peu peur dans le noir,', 'J’allume ma veilleuse, je veux voir,', 'Mon doudou est près de moi,', 'Et la peur s’en va comme ça !'], 'Plus peur !', 'Avoir peur, c’est normal ; on peut en parler.'),
  c('coeur', 'Mon ami', '🤝', 'jardin', 'coeur ballon', 'coucou tape tourne bras', ['Mon ami, viens jouer avec moi,', 'On partage le ballon, une fois, deux fois,', 'On fait la ronde main dans la main,', 'Les amis, c’est tous les matins !'], 'Les amis !', 'Un ami, on l’écoute et on partage avec lui.'),
  c('coeur', 'Chacun son tour', '🔄', 'chambre', 'balle cube', 'montre coucou tape bras', ['C’est ton tour, puis c’est le mien,', 'On attend, on joue très bien,', 'Je te passe la balle, tiens,', 'Chacun son tour, c’est malin !'], 'À toi !', 'Attendre son tour, c’est être juste avec les autres.'),
  c('coeur', 'Je t’aime, maman et papa', '❤️', 'chambre', 'coeur etoile', 'bras tape coucou dort', ['Un bisou sur la joue,', 'Un câlin tout doux, tout doux,', 'Je t’aime gros comme la lune,', 'Et même plus, plus qu’une !'], 'Je t’aime !', 'Dire « je t’aime » fait du bien au cœur.'),
  c('coeur', 'Pardon', '🫶', 'ville', 'coeur nuage', 'montre balance coucou tape', ['Oups, je t’ai fait mal, pardon,', 'Ce n’était pas exprès, c’est bon ?', 'On se serre la main,', 'Et on rejoue demain !'], 'Pardon !', 'Demander pardon répare les petites disputes.'),
  c('coeur', 'Je suis fier de moi', '🏅', 'ville', 'etoile coeur', 'bras saute tape tourne', ['J’ai essayé, j’ai réussi,', 'Je n’ai pas lâché, me voici,', 'Je suis fier, je suis content,', 'Bravo à moi, bravo vraiment !'], 'Bravo moi !', 'Se tromper, c’est normal : on essaie encore.'),

  /* ---------------------------------------------------------------- */
  /* Nuit et voyages                                                  */
  /* ---------------------------------------------------------------- */
  c('voyage', 'La fusée', '🚀', 'nuit', 'fusee etoile', 'dort bras saute tape', ['Dix, neuf, huit, la fusée attend,', 'Sept, six, cinq, attention maintenant,', 'Quatre, trois, deux, un, zéro,', 'Décollage vers les étoiles, bravo !'], 'Décollage !', 'Les astronautes voyagent dans l’espace en fusée.'),
  c('voyage', 'La lune', '🌙', 'nuit', 'lune etoile', 'bras balance montre dort', ['La lune ronde comme un ballon,', 'Éclaire les toits de la maison,', 'Parfois elle est toute petite,', 'Comme un croissant qui sourit vite !'], 'Bonne nuit lune !', 'La lune change de forme pendant le mois.'),
  c('voyage', 'Le bateau sur l’eau', '⛵', 'plage', 'bateau poisson', 'balance balance montre tape', ['Le petit bateau sur l’eau,', 'Se balance, il est beau,', 'Le vent gonfle sa voile,', 'Il part jusqu’aux étoiles !'], 'Bon voyage !', 'Sur un bateau, on porte un gilet de sauvetage.'),
  c('voyage', 'La voiture rouge', '🚗', 'ville', 'voiture etoile', 'montre marche tourne tape', ['Vroum, vroum, la voiture rouge,', 'Roule, roule, tout bouge,', 'Elle s’arrête au feu rouge,', 'Et repart quand c’est vert, ça bouge !'], 'Vroum !', 'Au feu rouge, on s’arrête ; au vert, on peut passer.'),
  c('voyage', 'L’avion dans le ciel', '✈️', 'ville', 'nuage oiseau', 'bras tourne balance coucou', ['Les bras en ailes, je suis l’avion,', 'Je vole au-dessus des maisons,', 'Je traverse les gros nuages,', 'Et je pars en voyage !'], 'Vrrrr !', 'L’avion vole très haut, au-dessus des nuages.'),
  c('voyage', 'Traverser la rue', '🚦', 'ville', 'voiture coeur', 'montre montre marche tape', ['Je donne la main pour traverser,', 'Je regarde à gauche, à droite, c’est assuré,', 'Le bonhomme est vert, on y va,', 'Pas à pas, voilà !'], 'Bien traversé !', 'On traverse sur le passage piéton, en donnant la main.'),
  c('voyage', 'Les étoiles filantes', '🌠', 'nuit', 'etoile lune', 'montre bras dort balance', ['Une étoile file dans la nuit,', 'Je fais un vœu tout petit,', 'Je ferme les yeux très fort,', 'Et je m’endors dans le décor !'], 'Un vœu !', 'Une étoile filante, c’est un petit caillou qui brille en traversant le ciel.'),
  c('voyage', 'Le vélo', '🚲', 'ville', 'soleil voiture', 'marche montre bras tape', ['Je pédale, pédale sur mon vélo,', 'Avec mon casque, c’est plus beau,', 'Je sonne : dring, dring, attention,', 'Je roule jusqu’à la maison !'], 'Dring dring !', 'À vélo, on met toujours son casque.'),
  c('voyage', 'La musique du soir', '🎵', 'nuit', 'note lune', 'balance dort bras dort', ['La musique du soir est douce,', 'Elle fait la ronde sur la mousse,', 'Les notes dansent dans le noir,', 'Bonsoir, bonsoir, à demain soir !'], 'Bonsoir !', 'Une musique douce aide à s’endormir.'),
  c('voyage', 'Le tour du monde', '🌍', 'plage', 'bateau soleil', 'marche tourne coucou tape', ['On fait le tour du monde en bateau,', 'On voit des pays tout beaux,', 'On dit bonjour en chantant,', 'Aux enfants de tous les continents !'], 'Bonjour le monde !', 'Les enfants du monde entier aiment chanter et jouer.')
];

export function comptineOf(id: string): Comptine | undefined {
  return COMPTINES.find((c) => c.id === id);
}
