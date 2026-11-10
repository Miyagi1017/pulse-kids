/**
 * Les explications animées : une grande question d’enfant, une réponse en 3 étapes animées.
 *
 * Pour chaque étape :
 *  - `text` : la phrase pour les 5–6 ans (courte, concrète, avec une comparaison) ;
 *  - `more` : le complément pour les 7–8 ans (le mot juste, l’explication qui va plus loin).
 * La même explication sert donc aux deux âges, sans contenu séparé à maintenir.
 *
 * `quiz` vérifie la compréhension (3 gros boutons, une seule bonne réponse),
 * `retiens` est la phrase à retenir, `experience` une petite manip’ à faire à la maison.
 * Tout est embarqué : aucune requête réseau, l’enfant peut réviser hors ligne.
 */

export type ExplainTheme = 'ciel' | 'terre' | 'nature' | 'corps' | 'technique';

/** L’animation SVG qui illustre l’explication (voir components/ExplainAnim.tsx). */
export type AnimId = 'pluie' | 'graine' | 'ciel' | 'arcenciel' | 'saisons' | 'lune' | 'volcan' | 'coeur' | 'digestion' | 'aimant' | 'son' | 'abeille';

/** Les 12 dessins animés disponibles (ExplainAnim doit tous les fournir : vérifié par le typecheck). */
export const ANIM_IDS: AnimId[] = ['pluie', 'graine', 'ciel', 'arcenciel', 'saisons', 'lune', 'volcan', 'coeur', 'digestion', 'aimant', 'son', 'abeille'];

export interface ExplainStep {
  emoji: string;
  title: string;
  /** 5–6 ans : une phrase courte, concrète. */
  text: string;
  /** 7–8 ans : le complément, avec le mot juste. */
  more: string;
}

export interface ExplainQuiz {
  q: string;
  choices: [string, string, string];
  /** Index de la bonne réponse dans `choices`. */
  answer: number;
  /** Pourquoi c’est la bonne réponse (dit après le choix). */
  why: string;
}

export interface Explication {
  id: string;
  emoji: string;
  /** Le thème court, pour la carte : « La pluie ». */
  title: string;
  /** La grande question, telle qu’un enfant la pose. */
  question: string;
  theme: ExplainTheme;
  anim: AnimId;
  steps: ExplainStep[];
  quiz: ExplainQuiz;
  retiens: string;
  experience: string;
}

export const EXPLAIN_THEMES: Record<ExplainTheme, { label: string; emoji: string }> = {
  ciel: { label: 'Le ciel', emoji: '🌤️' },
  terre: { label: 'La Terre', emoji: '🌍' },
  nature: { label: 'La nature', emoji: '🌱' },
  corps: { label: 'Mon corps', emoji: '❤️' },
  technique: { label: 'Les machines', emoji: '⚙️' }
};

const DATA: Omit<Explication, 'id'>[] = [
  {
    emoji: '🌧️',
    title: 'La pluie',
    question: 'D’où vient la pluie ?',
    theme: 'ciel',
    anim: 'pluie',
    steps: [
      {
        emoji: '☀️',
        title: 'Le soleil chauffe l’eau',
        text: 'Le soleil chauffe la mer et les flaques. L’eau devient une vapeur très légère qui monte dans le ciel, comme la buée sur un miroir.',
        more: 'C’est l’évaporation : en chauffant, l’eau change d’état et devient un gaz invisible, la vapeur d’eau.'
      },
      {
        emoji: '☁️',
        title: 'Le nuage se remplit',
        text: 'En haut, il fait froid. La vapeur se rassemble en toutes petites gouttes : un nuage est né.',
        more: 'Des milliards de gouttelettes se collent autour de minuscules poussières. Le nuage est lourd, mais il flotte.'
      },
      {
        emoji: '🌧️',
        title: 'Il pleut !',
        text: 'Quand le nuage est trop plein, les gouttes tombent. C’est la pluie ! Ensuite, l’eau retourne dans la mer.',
        more: 'Les gouttes grossissent en se cognant. Elles tombent quand elles sont trop lourdes : c’est le cycle de l’eau.'
      }
    ],
    quiz: {
      q: 'Que devient l’eau quand le soleil la chauffe ?',
      choices: ['De la vapeur d’eau', 'Du sable', 'De la neige'],
      answer: 0,
      why: 'En chauffant, l’eau devient de la vapeur d’eau : un gaz invisible qui monte dans le ciel.'
    },
    retiens: 'L’eau voyage sans fin : mer → nuage → pluie → mer.',
    experience: 'Mets un bol d’eau au soleil et couvre-le d’une assiette. Au bout d’une heure, des gouttes apparaissent dessous !'
  },
  {
    emoji: '🌱',
    title: 'La graine',
    question: 'Comment pousse une graine ?',
    theme: 'nature',
    anim: 'graine',
    steps: [
      {
        emoji: '🫘',
        title: 'Une graine qui dort',
        text: 'Dans la terre, une graine attend bien au chaud. C’est un bébé plante endormi, avec assez de nourriture pour démarrer.',
        more: 'La graine contient une minuscule plante et des réserves : de quoi tenir avant d’avoir des racines et des feuilles.'
      },
      {
        emoji: '💧',
        title: 'L’eau la réveille',
        text: 'L’eau entre dans la graine et la réveille. Les racines descendent chercher de l’eau, la tige monte vers la lumière.',
        more: 'La graine gonfle, sa peau s’ouvre. Les racines pompent l’eau et les sels minéraux du sol.'
      },
      {
        emoji: '🌻',
        title: 'Des feuilles et une fleur',
        text: 'Avec la lumière du soleil, les feuilles fabriquent la nourriture de la plante. Puis une fleur apparaît, avec des graines dedans !',
        more: 'C’est la photosynthèse : les feuilles transforment la lumière, l’eau et l’air en sucre pour faire grandir la plante.'
      }
    ],
    quiz: {
      q: 'De quoi la graine a-t-elle besoin pour se réveiller ?',
      choices: ['D’eau et de chaleur', 'De bonbons', 'De musique'],
      answer: 0,
      why: 'L’eau ramollit la graine et la chaleur la réveille : alors la petite plante peut commencer à pousser.'
    },
    retiens: 'Une graine + de la terre + de l’eau + du soleil = une plante.',
    experience: 'Fais germer un haricot sur du coton humide, dans un pot. Regarde-le chaque jour : une racine sort, puis une tige !'
  },
  {
    emoji: '🌤️',
    title: 'Le ciel bleu',
    question: 'Pourquoi le ciel est bleu ?',
    theme: 'ciel',
    anim: 'ciel',
    steps: [
      {
        emoji: '✨',
        title: 'Une lumière pleine de couleurs',
        text: 'La lumière du soleil semble blanche, mais elle cache toutes les couleurs de l’arc-en-ciel, mélangées.',
        more: 'La lumière est faite d’ondes de tailles différentes : le rouge est une grande vague, le bleu une petite vague.'
      },
      {
        emoji: '🫧',
        title: 'Les petites bulles d’air',
        text: 'L’air est rempli de milliards de petites bulles invisibles. La lumière les frappe et rebondit dans tous les sens.',
        more: 'Ces molécules éparpillent surtout la lumière bleue, parce qu’elle voyage en petites vagues très serrées.'
      },
      {
        emoji: '💙',
        title: 'Du bleu partout',
        text: 'Le bleu rebondit partout dans le ciel et arrive jusqu’à tes yeux. Voilà pourquoi le ciel est bleu !',
        more: 'Au coucher du soleil, la lumière traverse plus d’air : le bleu se disperse avant, il reste le rouge et l’orange.'
      }
    ],
    quiz: {
      q: 'Pourquoi le ciel est-il bleu ?',
      choices: ['La lumière bleue rebondit partout dans l’air', 'L’air est peint en bleu', 'La mer se reflète dans le ciel'],
      answer: 0,
      why: 'Les petites bulles d’air éparpillent la lumière bleue du soleil dans tout le ciel : elle arrive à tes yeux.'
    },
    retiens: 'L’air éparpille la lumière bleue du soleil : c’est ce bleu qui nous arrive aux yeux.',
    experience: 'Remplis un verre d’eau, ajoute une goutte de lait et éclaire-le avec une lampe : la lumière devient bleutée, comme le ciel !'
  },
  {
    emoji: '🌈',
    title: 'L’arc-en-ciel',
    question: 'Comment se forme un arc-en-ciel ?',
    theme: 'ciel',
    anim: 'arcenciel',
    steps: [
      {
        emoji: '🌦️',
        title: 'De la pluie et du soleil',
        text: 'Un arc-en-ciel apparaît quand le soleil brille pendant qu’il pleut. Les gouttes d’eau jouent aux petits prismes.',
        more: 'La lumière doit venir de derrière toi et les gouttes être devant toi : c’est pour ça qu’on le voit face à la pluie.'
      },
      {
        emoji: '🔺',
        title: 'La lumière se sépare',
        text: 'En entrant dans une goutte, la lumière blanche se coupe en sept couleurs : rouge, orange, jaune, vert, bleu, indigo, violet.',
        more: 'Chaque couleur se courbe un peu différemment : c’est la réfraction. Le rouge se courbe moins que le violet.'
      },
      {
        emoji: '🌉',
        title: 'Un pont de couleurs',
        text: 'Chaque goutte renvoie une couleur. Toutes ensemble, elles dessinent un grand arc. On ne peut jamais l’atteindre !',
        more: 'Un arc-en-ciel est en réalité un cercle complet, mais le sol cache sa moitié.'
      }
    ],
    quiz: {
      q: 'Combien de couleurs a un arc-en-ciel ?',
      choices: ['Sept', 'Trois', 'Cent'],
      answer: 0,
      why: 'La lumière blanche se sépare en sept couleurs : rouge, orange, jaune, vert, bleu, indigo et violet.'
    },
    retiens: 'Du soleil + des gouttes de pluie = sept couleurs dans le ciel.',
    experience: 'Avec un verre d’eau et une feuille blanche, envoie la lumière du soleil sur la feuille : essaie de faire un petit arc-en-ciel.'
  },
  {
    emoji: '🍂',
    title: 'Les saisons',
    question: 'Pourquoi y a-t-il des saisons ?',
    theme: 'terre',
    anim: 'saisons',
    steps: [
      {
        emoji: '🌍',
        title: 'La Terre fait le tour du Soleil',
        text: 'La Terre tourne autour du Soleil en un an. En même temps, elle tourne sur elle-même : c’est le jour et la nuit.',
        more: 'Il faut 365 jours et 6 heures à la Terre pour faire un tour complet : c’est pour ça qu’il y a une année bissextile.'
      },
      {
        emoji: '📐',
        title: 'La Terre est penchée',
        text: 'La Terre est un peu penchée, comme si elle s’inclinait sur le côté. Certains endroits reçoivent plus de soleil que d’autres.',
        more: 'Son axe est incliné de 23 degrés. C’est cette inclinaison, et non la distance, qui crée les saisons.'
      },
      {
        emoji: '🌸',
        title: 'Quatre saisons',
        text: 'Quand ton pays penche vers le Soleil, c’est l’été. Quand il penche de l’autre côté, c’est l’hiver. Entre les deux : le printemps et l’automne.',
        more: 'Dans l’hémisphère sud, les saisons sont inversées : on y fête Noël en plein été.'
      }
    ],
    quiz: {
      q: 'Pourquoi fait-il plus chaud en été ?',
      choices: ['La Terre est penchée vers le Soleil', 'Le Soleil se rapproche beaucoup', 'On allume plus de lampes'],
      answer: 0,
      why: 'La Terre est penchée : en été, ton pays reçoit la lumière du Soleil plus droit et plus longtemps.'
    },
    retiens: 'Les saisons viennent de la Terre penchée qui tourne autour du Soleil.',
    experience: 'Prends une orange et une lampe. Incline l’orange : regarde où la lumière arrive le plus fort, comme sur la Terre.'
  },
  {
    emoji: '🌙',
    title: 'La Lune',
    question: 'Pourquoi la Lune change de forme ?',
    theme: 'ciel',
    anim: 'lune',
    steps: [
      {
        emoji: '🌑',
        title: 'La Lune ne brille pas',
        text: 'La Lune ne fabrique pas de lumière : elle renvoie celle du Soleil, comme un miroir. La moitié éclairée regarde toujours le Soleil.',
        more: 'La face que l’on ne voit jamais depuis la Terre s’appelle la face cachée. Elle est éclairée aussi, mais tournée de l’autre côté.'
      },
      {
        emoji: '🔄',
        title: 'Elle tourne autour de la Terre',
        text: 'En tournant autour de la Terre, la Lune nous montre plus ou moins de sa partie éclairée.',
        more: 'Un tour complet prend environ 29 jours et demi : c’est aussi la durée d’un mois lunaire.'
      },
      {
        emoji: '🌓',
        title: 'Croissant, pleine ou nouvelle',
        text: 'Un mince sourire : c’est le croissant. Toute ronde : la pleine Lune. Invisible : la nouvelle Lune.',
        more: 'La Lune attire l’eau des océans : c’est elle qui fait monter et descendre les marées.'
      }
    ],
    quiz: {
      q: 'Pourquoi la Lune brille-t-elle la nuit ?',
      choices: ['Elle renvoie la lumière du Soleil', 'C’est une étoile qui brûle', 'Elle est éclairée par les lampes'],
      answer: 0,
      why: 'La Lune est comme un miroir : elle renvoie la lumière du Soleil, qui l’éclaire toujours à moitié.'
    },
    retiens: 'Les formes de la Lune, c’est la partie éclairée par le Soleil que l’on voit.',
    experience: 'Dans une pièce sombre, éclaire une balle avec une lampe et tourne autour : tu retrouves le croissant et la pleine Lune.'
  },
  {
    emoji: '🌋',
    title: 'Le volcan',
    question: 'Pourquoi un volcan crache-t-il du feu ?',
    theme: 'terre',
    anim: 'volcan',
    steps: [
      {
        emoji: '🔥',
        title: 'Il fait très chaud sous nos pieds',
        text: 'Sous nos pieds, la Terre est très chaude. À certains endroits, la roche fond : c’est le magma.',
        more: 'À 30 kilomètres de profondeur, il fait plus de 1000 degrés : assez pour faire fondre la roche.'
      },
      {
        emoji: '⬆️',
        title: 'Le magma monte',
        text: 'Le magma est plus léger que la roche autour. Il pousse pour monter par une cheminée, comme une bulle dans du jus.',
        more: 'Les gaz du magma augmentent la pression, comme dans une bouteille de soda secouée.'
      },
      {
        emoji: '💥',
        title: 'L’éruption',
        text: 'Le volcan crache de la lave, des cendres et de la fumée. La lave refroidit et devient de la pierre.',
        more: 'En refroidissant, la lave forme de nouvelles roches : certains volcans font grandir les îles.'
      }
    ],
    quiz: {
      q: 'Comment s’appelle la roche chaude et fondue sous le volcan ?',
      choices: ['Le magma', 'Le sable', 'La glace'],
      answer: 0,
      why: 'Sous terre, la roche fondue s’appelle le magma. Quand elle sort du volcan, on l’appelle la lave.'
    },
    retiens: 'Sous la Terre, la roche fond : le magma. Dehors, il devient de la lave.',
    experience: 'Avec un adulte, mets du vinaigre, du bicarbonate et du colorant rouge dans un petit volcan en pâte à sel : éruption !'
  },
  {
    emoji: '❤️',
    title: 'Le cœur',
    question: 'Comment bat ton cœur ?',
    theme: 'corps',
    anim: 'coeur',
    steps: [
      {
        emoji: '✊',
        title: 'Une pompe dans ta poitrine',
        text: 'Ton cœur est un muscle gros comme ton poing. Il bat jour et nuit, sans jamais s’arrêter.',
        more: 'Il bat environ 100 000 fois par jour. Un cœur d’enfant bat plus vite que celui d’un adulte.'
      },
      {
        emoji: '🩸',
        title: 'Du sang partout',
        text: 'À chaque battement, le cœur envoie du sang dans tout ton corps. Le sang apporte de l’oxygène et de la nourriture.',
        more: 'Le sang part par les artères et revient par les veines, comme des routes qui font le tour du corps.'
      },
      {
        emoji: '🏃',
        title: 'Il accélère quand tu bouges',
        text: 'Quand tu cours, tes muscles ont besoin de plus d’air. Alors ton cœur bat plus vite : boum, boum, boum !',
        more: 'Après l’effort, il ralentit doucement. Pose deux doigts dans ton cou, sous la mâchoire, pour compter les battements.'
      }
    ],
    quiz: {
      q: 'À quoi sert le cœur ?',
      choices: ['À envoyer le sang dans tout le corps', 'À digérer les aliments', 'À faire pousser les cheveux'],
      answer: 0,
      why: 'Le cœur est une pompe : il pousse le sang qui apporte de l’oxygène partout, même au bout des doigts.'
    },
    retiens: 'Le cœur est une pompe qui envoie du sang dans tout le corps, sans s’arrêter.',
    experience: 'Compte les battements de ton cœur au repos, puis cours sur place et recompte : il bat beaucoup plus vite !'
  },
  {
    emoji: '🍎',
    title: 'La digestion',
    question: 'Que devient ton goûter ?',
    theme: 'corps',
    anim: 'digestion',
    steps: [
      {
        emoji: '🦷',
        title: 'La bouche broie',
        text: 'Tes dents coupent les aliments et ta salive les ramollit. Puis tu avales.',
        more: 'La salive contient déjà des enzymes : elles commencent à découper les aliments dès la bouche.'
      },
      {
        emoji: '🪱',
        title: 'Un très long tuyau',
        text: 'La nourriture descend dans l’estomac, puis dans un long tuyau qui la découpe en tout petits morceaux.',
        more: 'L’estomac est un sac qui mélange les aliments avec des sucs pendant 2 à 4 heures.'
      },
      {
        emoji: '💪',
        title: 'De la nourriture pour tout le corps',
        text: 'Les petits morceaux passent dans le sang et nourrissent tes muscles, ton cerveau et tes os.',
        more: 'Ce que le corps ne garde pas part aux toilettes : c’est normal et nécessaire.'
      }
    ],
    quiz: {
      q: 'Que devient la nourriture après l’estomac ?',
      choices: ['De tout petits morceaux pour le sang', 'Elle disparaît comme par magie', 'Elle reste dans le ventre pour toujours'],
      answer: 0,
      why: 'La digestion découpe les aliments en morceaux minuscules : le sang les emporte pour nourrir tout le corps.'
    },
    retiens: 'Manger, c’est découper les aliments en petits morceaux pour nourrir tout le corps.',
    experience: 'Mâche très lentement un morceau de pain : au bout d’un moment, il devient sucré dans ta bouche !'
  },
  {
    emoji: '🧲',
    title: 'L’aimant',
    question: 'Comment marche un aimant ?',
    theme: 'technique',
    anim: 'aimant',
    steps: [
      {
        emoji: '📎',
        title: 'Il attire le fer',
        text: 'Un aimant attire le fer : les trombones viennent à lui tout seuls, comme par magie.',
        more: 'Un aimant a un pôle nord et un pôle sud. Deux pôles différents s’attirent, deux pôles identiques se repoussent.'
      },
      {
        emoji: '📄',
        title: 'Même à travers le papier',
        text: 'L’aimant attire le fer même à travers une feuille, un verre ou ta main.',
        more: 'Le métal s’aimante à son tour : les trombones collés se collent aussi entre eux.'
      },
      {
        emoji: '🧭',
        title: 'Il est partout',
        text: 'On trouve des aimants dans les frigos, les haut-parleurs et les trains. Et la Terre est un immense aimant !',
        more: 'C’est l’aimant de la Terre qui fait pointer l’aiguille d’une boussole vers le nord.'
      }
    ],
    quiz: {
      q: 'Quel métal un aimant attire-t-il ?',
      choices: ['Le fer', 'Le bois', 'Le plastique'],
      answer: 0,
      why: 'L’aimant attire le fer et quelques autres métaux, mais pas le bois, le plastique ou le verre.'
    },
    retiens: 'Un aimant attire le fer, même à travers une feuille.',
    experience: 'Mets des trombones sur une feuille et promène un aimant dessous : ils bougent tout seuls, comme par magie !'
  },
  {
    emoji: '🥁',
    title: 'Le son',
    question: 'Comment voyage le son ?',
    theme: 'technique',
    anim: 'son',
    steps: [
      {
        emoji: '👋',
        title: 'Le son est une vibration',
        text: 'Quand tu frappes un tambour, sa peau vibre. Elle pousse l’air tout autour d’elle.',
        more: 'Le son a besoin de matière pour voyager : de l’air, de l’eau… mais il ne passe pas dans le vide.'
      },
      {
        emoji: '🌊',
        title: 'L’air fait des vagues',
        text: 'La vibration voyage dans l’air en petites vagues, comme des vagues sur l’eau.',
        more: 'Ces vagues font vibrer ton tympan, un petit tambour tendu au fond de ton oreille.'
      },
      {
        emoji: '👂',
        title: 'Ton oreille écoute',
        text: 'Ton oreille transforme les vibrations en messages, et ton cerveau les comprend : c’est le son !',
        more: 'Le son voyage à environ 340 mètres par seconde : bien plus lentement que la lumière.'
      }
    ],
    quiz: {
      q: 'De quoi le son a-t-il besoin pour voyager ?',
      choices: ['De l’air ou de l’eau', 'De rien du tout', 'Du sable seulement'],
      answer: 0,
      why: 'Le son a besoin de matière pour faire vibrer : l’air, l’eau… mais pas le vide de l’espace.'
    },
    retiens: 'Le son est une vibration qui voyage jusqu’à ton oreille.',
    experience: 'Pose la main sur ta gorge et chante : tu sens la vibration. Plus tu chantes fort, plus ça vibre !'
  },
  {
    emoji: '🐝',
    title: 'Le miel',
    question: 'Comment les abeilles font-elles le miel ?',
    theme: 'nature',
    anim: 'abeille',
    steps: [
      {
        emoji: '🌼',
        title: 'Les abeilles butinent',
        text: 'L’abeille vole de fleur en fleur et boit un liquide sucré : le nectar.',
        more: 'En même temps, elle transporte du pollen. C’est ainsi que les fleurs peuvent faire des fruits et des graines.'
      },
      {
        emoji: '🍯',
        title: 'Dans la ruche',
        text: 'Elle rapporte le nectar à la ruche et le confie aux autres abeilles.',
        more: 'Les abeilles le passent de bouche en bouche, ajoutent des enzymes, puis le déposent dans les alvéoles.'
      },
      {
        emoji: '✨',
        title: 'Le miel est prêt',
        text: 'L’air de la ruche fait sécher l’eau du nectar. Il devient du miel, la nourriture des abeilles pour l’hiver.',
        more: 'L’apiculteur récolte le miel, mais il laisse toujours assez de miel aux abeilles pour passer l’hiver.'
      }
    ],
    quiz: {
      q: 'Que récolte l’abeille sur les fleurs ?',
      choices: ['Le nectar', 'Le miel', 'La cire'],
      answer: 0,
      why: 'L’abeille boit le nectar des fleurs. C’est dans la ruche que ce nectar devient du miel.'
    },
    retiens: 'Nectar des fleurs + travail de la ruche = miel.',
    experience: 'Observe une fleur dehors : regarde où l’abeille pose sa tête quand elle butine. Ne la touche pas, elle travaille !'
  }
];

export const EXPLICATIONS: Explication[] = DATA.map((e, i) => ({
  ...e,
  id: `expl-${String(i + 1).padStart(2, '0')}-${e.anim}`
}));

export function explicationOf(id: string): Explication | undefined {
  return EXPLICATIONS.find((e) => e.id === id);
}

/** Explication mise en avant aujourd’hui (change chaque jour, comme les vidéos). */
export function explicationOfTheDay(day: string): Explication {
  const n = Math.floor(Date.parse(day) / 86400000);
  return EXPLICATIONS[((n % EXPLICATIONS.length) + EXPLICATIONS.length) % EXPLICATIONS.length];
}
