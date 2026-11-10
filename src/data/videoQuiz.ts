/**
 * Une question de compréhension pour chacune des 50 mini-vidéos.
 *
 * Elle arrive à la fin de la vidéo : 3 gros boutons, une seule bonne réponse.
 * `why` est la petite explication dite après le choix (« Le savais-tu ? ») :
 * elle transforme la vidéo en moment d’apprentissage, sans jamais gronder.
 */
export interface VideoQuiz {
  q: string;
  choices: [string, string, string];
  /** Index de la bonne réponse. */
  answer: number;
  why: string;
}

export const VIDEO_QUIZ: Record<string, VideoQuiz> = {
  /* 🐾 Animaux */
  'video-animaux-01': {
    q: 'Pour avoir chaud, que font les manchots ?',
    choices: ['Ils se serrent les uns contre les autres', 'Ils allument un feu', 'Ils plongent dans l’eau glacée'],
    answer: 0,
    why: 'En se serrant, les manchots partagent leur chaleur : au milieu du groupe, il fait presque chaud !'
  },
  'video-animaux-02': {
    q: 'À quoi sert la trompe de l’éléphant ?',
    choices: ['À sentir, attraper et boire', 'À voler', 'À dormir'],
    answer: 0,
    why: 'La trompe est un nez très long : l’éléphant respire, attrape des branches et aspire de l’eau avec.'
  },
  'video-animaux-03': {
    q: 'Pourquoi la girafe a-t-elle un long cou ?',
    choices: ['Pour manger les feuilles tout en haut', 'Pour mieux dormir', 'Pour nager plus vite'],
    answer: 0,
    why: 'Son cou lui permet d’atteindre les feuilles des grands arbres, là où les autres animaux ne peuvent pas manger.'
  },
  'video-animaux-04': {
    q: 'Que récolte l’abeille dans les fleurs ?',
    choices: ['Le nectar', 'L’herbe', 'Le sable'],
    answer: 0,
    why: 'Le nectar devient du miel dans la ruche. En butinant, l’abeille aide aussi les fleurs à faire des fruits.'
  },
  'video-animaux-05': {
    q: 'Pourquoi les dauphins remontent-ils à la surface ?',
    choices: ['Pour respirer', 'Pour boire', 'Pour dormir au sec'],
    answer: 0,
    why: 'Les dauphins sont des mammifères : ils ont besoin d’air et respirent par un trou sur leur tête.'
  },
  'video-animaux-06': {
    q: 'Que devient la chenille enfermée dans son cocon ?',
    choices: ['Un papillon', 'Un oiseau', 'Une araignée'],
    answer: 0,
    why: 'La chenille se transforme dans son cocon : elle en sort avec des ailes. C’est la métamorphose.'
  },
  'video-animaux-07': {
    q: 'Qu’est-ce que la carapace de la tortue ?',
    choices: ['Sa maison qu’elle porte partout', 'Un chapeau', 'Un sac de voyage'],
    answer: 0,
    why: 'La carapace protège la tortue : elle peut y rentrer la tête et les pattes quand elle a peur.'
  },
  'video-animaux-08': {
    q: 'Quand la chouette se réveille-t-elle ?',
    choices: ['La nuit', 'Le matin', 'À midi'],
    answer: 0,
    why: 'Ses grands yeux voient très bien dans le noir : elle chasse quand les autres animaux dorment.'
  },
  'video-animaux-09': {
    q: 'Que nous donne la vache ?',
    choices: ['Du lait', 'Des œufs', 'Du miel'],
    answer: 0,
    why: 'Avec le lait de la vache, on fabrique le beurre, le yaourt et le fromage.'
  },
  'video-animaux-10': {
    q: 'Pourquoi l’écureuil cache-t-il des noisettes ?',
    choices: ['Pour manger en hiver', 'Pour jouer', 'Pour les offrir'],
    answer: 0,
    why: 'En automne, il fait des réserves pour l’hiver. Les noisettes qu’il oublie peuvent devenir des arbres !'
  },
  'video-animaux-11': {
    q: 'Qui a une grande crinière ?',
    choices: ['Le papa lion', 'La maman lionne', 'Le lionceau'],
    answer: 0,
    why: 'Seul le lion adulte porte une crinière : elle le protège et le rend impressionnant.'
  },
  'video-animaux-12': {
    q: 'Comment s’appelle le bébé de la grenouille ?',
    choices: ['Un têtard', 'Un poussin', 'Un caneton'],
    answer: 0,
    why: 'Le têtard vit dans l’eau avec une queue. Peu à peu, ses pattes poussent et il devient une grenouille.'
  },
  'video-animaux-13': {
    q: 'Que mange surtout le panda géant ?',
    choices: ['Du bambou', 'Du poisson', 'Des noisettes'],
    answer: 0,
    why: 'Le panda passe presque toute sa journée à manger du bambou, et il faut le protéger.'
  },
  'video-animaux-14': {
    q: 'Que mange la coccinelle ?',
    choices: ['Les pucerons', 'Les fleurs', 'Les cailloux'],
    answer: 0,
    why: 'Les pucerons abîment les plantes : la coccinelle en mange beaucoup et aide le jardin.'
  },
  'video-animaux-15': {
    q: 'Comment la baleine respire-t-elle ?',
    choices: ['Par un trou sur sa tête', 'Avec ses nageoires', 'Par sa bouche sous l’eau'],
    answer: 0,
    why: 'Elle remonte à la surface et respire par son évent : c’est ce qui fait le grand jet d’eau.'
  },

  /* 🌿 Nature */
  'video-nature-01': {
    q: 'Que font les racines d’un arbre ?',
    choices: ['Elles boivent l’eau dans la terre', 'Elles volent', 'Elles mangent les oiseaux'],
    answer: 0,
    why: 'Les racines tiennent l’arbre bien droit et boivent l’eau et les sels minéraux du sol.'
  },
  'video-nature-02': {
    q: 'Combien de couleurs un arc-en-ciel a-t-il ?',
    choices: ['Sept', 'Deux', 'Mille'],
    answer: 0,
    why: 'La lumière du soleil se sépare en sept couleurs quand elle traverse les gouttes de pluie.'
  },
  'video-nature-03': {
    q: 'Qu’est-ce qui fait les vagues sur la plage ?',
    choices: ['Le vent et la Lune', 'Les poissons', 'Les crabes'],
    answer: 0,
    why: 'Le vent pousse l’eau et la Lune attire les océans : c’est ce qui fait bouger la mer.'
  },
  'video-nature-04': {
    q: 'Qu’est-ce qui sort d’un volcan ?',
    choices: ['De la lave très chaude', 'De l’eau tiède', 'Du sable froid'],
    answer: 0,
    why: 'La lave très chaude sort parfois du volcan, puis refroidit et devient de la roche.'
  },
  'video-nature-05': {
    q: 'Que devient la pluie quand il fait très froid ?',
    choices: ['De la neige', 'Du sable', 'Du feu'],
    answer: 0,
    why: 'Le froid transforme les gouttes en flocons. Chaque flocon a une forme unique !'
  },
  'video-nature-06': {
    q: 'Que font les feuilles en automne ?',
    choices: ['Elles changent de couleur puis tombent', 'Elles deviennent bleues', 'Elles restent vertes'],
    answer: 0,
    why: 'En automne, les feuilles deviennent jaunes, orange et rouges, puis elles tombent et font un tapis.'
  },
  'video-nature-07': {
    q: 'Que font les oiseaux au printemps ?',
    choices: ['Ils construisent un nid', 'Ils font un bonhomme de neige', 'Ils hibernent'],
    answer: 0,
    why: 'Au printemps, la nature se réveille : les oiseaux construisent leur nid pour avoir des petits.'
  },
  'video-nature-08': {
    q: 'D’où vient la pluie ?',
    choices: ['Des nuages', 'Des arbres', 'De la Lune'],
    answer: 0,
    why: 'L’eau s’évapore, forme les nuages, puis retombe en gouttes : c’est le cycle de l’eau.'
  },
  'video-nature-09': {
    q: 'Que trouve-t-on au sommet des très hautes montagnes ?',
    choices: ['De la neige', 'De la plage', 'Une forêt tropicale'],
    answer: 0,
    why: 'En altitude, il fait plus froid : la neige reste souvent au sommet, même en été.'
  },
  'video-nature-10': {
    q: 'Qui vient voler autour des fleurs ?',
    choices: ['Les abeilles et les papillons', 'Les poissons', 'Les pingouins'],
    answer: 0,
    why: 'Les fleurs attirent les abeilles et les papillons : ils se nourrissent et transportent le pollen.'
  },

  /* 🚀 Espace */
  'video-espace-01': {
    q: 'La Lune fabrique-t-elle sa propre lumière ?',
    choices: ['Non, elle renvoie celle du Soleil', 'Oui, elle brûle', 'Oui, elle est électrique'],
    answer: 0,
    why: 'La Lune est comme un miroir : elle renvoie la lumière du Soleil.'
  },
  'video-espace-02': {
    q: 'Qu’est-ce que le Soleil ?',
    choices: ['Une étoile', 'Une planète', 'Une lune'],
    answer: 0,
    why: 'Le Soleil est une étoile : une énorme boule de gaz très chaude qui nous donne lumière et chaleur.'
  },
  'video-espace-03': {
    q: 'Combien de planètes tournent autour du Soleil ?',
    choices: ['Huit', 'Deux', 'Cent'],
    answer: 0,
    why: 'Autour du Soleil tournent huit planètes. La Terre est la troisième, et la seule où l’on connaît la vie.'
  },
  'video-espace-04': {
    q: 'Pourquoi une fusée monte-t-elle ?',
    choices: ['Elle pousse très fort avec du feu', 'Elle bat des ailes', 'Elle est tirée par un élastique'],
    answer: 0,
    why: 'Les moteurs brûlent du carburant et crachent du feu : la fusée part vers le haut.'
  },
  'video-espace-05': {
    q: 'Comment les astronautes flottent-ils dans la station ?',
    choices: ['Tout flotte en apesanteur', 'Ils portent des ailes', 'Ils sautent très haut'],
    answer: 0,
    why: 'Loin de la Terre, tout flotte : même les gouttes d’eau. On dit qu’ils sont en apesanteur.'
  },
  'video-espace-06': {
    q: 'Que sont les étoiles ?',
    choices: ['Des soleils très lointains', 'Des ampoules', 'Des avions'],
    answer: 0,
    why: 'Les étoiles sont des soleils très, très loin de nous. Certaines forment des dessins dans le ciel.'
  },
  'video-espace-07': {
    q: 'Que sont les zones blanches de la Terre vue de l’espace ?',
    choices: ['Les nuages', 'Le sable', 'Les forêts'],
    answer: 0,
    why: 'Le bleu, ce sont les océans ; le blanc, les nuages et la glace.'
  },
  'video-espace-08': {
    q: 'Où voit-on souvent des aurores ?',
    choices: ['Près du pôle Nord', 'Dans le désert', 'Sous la mer'],
    answer: 0,
    why: 'Les aurores dansent dans le ciel des régions polaires, en vert, rose ou violet.'
  },

  /* 👷 Métiers */
  'video-metiers-01': {
    q: 'Quel est le numéro des pompiers en France ?',
    choices: ['Le 18', 'Le 1', 'Le 100'],
    answer: 0,
    why: 'En France, on appelle les pompiers au 18. Ils éteignent les incendies et aident les personnes blessées.'
  },
  'video-metiers-02': {
    q: 'Avec quel outil le médecin écoute-t-il ton cœur ?',
    choices: ['Un stéthoscope', 'Une flûte', 'Un marteau'],
    answer: 0,
    why: 'Le stéthoscope permet d’écouter le cœur et la respiration. Le médecin est là pour aider.'
  },
  'video-metiers-03': {
    q: 'Que fait l’agriculteur ?',
    choices: ['Il cultive les champs', 'Il pilote un avion', 'Il fait du pain'],
    answer: 0,
    why: 'Il fait pousser le blé, les légumes et les fruits, et s’occupe des animaux de la ferme.'
  },
  'video-metiers-04': {
    q: 'Que faut-il pour faire du pain ?',
    choices: ['De la farine, de l’eau, du sel et de la levure', 'Du sucre et des bonbons', 'De la peinture'],
    answer: 0,
    why: 'Le boulanger mélange farine, eau, sel et levure, puis il cuit la pâte dans un grand four.'
  },
  'video-metiers-05': {
    q: 'Que fait la maîtresse ou le maître ?',
    choices: ['Ils apprennent à lire et à compter', 'Ils vendent des gâteaux', 'Ils conduisent le bus'],
    answer: 0,
    why: 'À l’école, on apprend à lire, à compter, à dessiner et à chanter, avec l’aide de la maîtresse ou du maître.'
  },
  'video-metiers-06': {
    q: 'Que fait-on dans le bus ?',
    choices: ['On reste assis', 'On saute partout', 'On crie'],
    answer: 0,
    why: 'Dans le bus, on reste assis et on dit bonjour : c’est pour la sécurité de tout le monde.'
  },
  'video-metiers-07': {
    q: 'Que font les scientifiques ?',
    choices: ['Ils observent et font des expériences', 'Ils dorment toute la journée', 'Ils dessinent seulement'],
    answer: 0,
    why: 'Les scientifiques posent des questions, observent et testent des idées pour comprendre le monde.'
  },

  /* 💪 Mon corps */
  'video-corps-01': {
    q: 'Que faut-il faire pour garder de belles dents ?',
    choices: ['Les brosser matin et soir', 'Manger des bonbons toute la journée', 'Ne jamais les laver'],
    answer: 0,
    why: 'Se brosser les dents matin et soir chasse les petits restes de nourriture qui abîment l’émail.'
  },
  'video-corps-02': {
    q: 'Quand ton cœur bat-il ?',
    choices: ['Tout le temps, même la nuit', 'Seulement quand tu cours', 'Seulement quand tu manges'],
    answer: 0,
    why: 'Le cœur bat jour et nuit : il envoie du sang dans tout le corps, même pendant le sommeil.'
  },
  'video-corps-03': {
    q: 'Quelle est la meilleure boisson ?',
    choices: ['L’eau', 'Le soda', 'Le sirop'],
    answer: 0,
    why: 'L’eau est la meilleure boisson : elle hydrate sans sucre ajouté.'
  },
  'video-corps-04': {
    q: 'Que fait ton corps quand tu dors ?',
    choices: ['Il se repose et grandit', 'Il arrête de respirer', 'Il devient froid'],
    answer: 0,
    why: 'Pendant la nuit, ton corps se répare, grandit et ton cerveau range tout ce que tu as appris.'
  },
  'video-corps-05': {
    q: 'Pourquoi bouger est-il bon ?',
    choices: ['Ça rend fort et de bonne humeur', 'Ça rend fatigué pour toujours', 'Ça empêche de dormir'],
    answer: 0,
    why: 'Courir, sauter, danser : bouger rend le corps fort et met de bonne humeur.'
  },

  /* 🌍 Le monde */
  'video-monde-01': {
    q: 'Quel monument trouve-t-on à Paris ?',
    choices: ['La tour Eiffel', 'La tour de Pise', 'Les pyramides'],
    answer: 0,
    why: 'La tour Eiffel est à Paris, la capitale de la France. Elle est haute comme un immeuble de cent étages !'
  },
  'video-monde-02': {
    q: 'Que trouve-t-on dans le désert ?',
    choices: ['Du sable et des dunes', 'Des icebergs', 'Des forêts'],
    answer: 0,
    why: 'Dans le désert, il pleut très peu : il y a du sable à perte de vue, et le chameau peut marcher longtemps sans boire.'
  },
  'video-monde-03': {
    q: 'Pourquoi fait-il sombre sous la forêt tropicale ?',
    choices: ['Les arbres sont très hauts', 'Il y a une grotte', 'Il fait toujours nuit'],
    answer: 0,
    why: 'Les arbres sont si hauts que la lumière du soleil a du mal à passer dessous.'
  },
  'video-monde-04': {
    q: 'Quel animal vit sur la banquise ?',
    choices: ['L’ours polaire', 'Le lion', 'Le kangourou'],
    answer: 0,
    why: 'L’ours polaire vit sur la banquise, où il fait très froid toute l’année. Il faut la protéger.'
  },
  'video-monde-05': {
    q: 'Comment entrait-on dans un château fort ?',
    choices: ['Par un pont-levis', 'Par la fenêtre', 'Par le toit'],
    answer: 0,
    why: 'Les châteaux forts avaient des remparts et un pont-levis qu’on relevait pour se protéger.'
  }
};

export function quizFor(videoId: string): VideoQuiz | undefined {
  return VIDEO_QUIZ[videoId];
}
