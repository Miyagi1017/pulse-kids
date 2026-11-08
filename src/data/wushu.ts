/**
 * Le yoga des animaux, façon wushu : l'esprit des jeux doux des cinq animaux (tigre, cerf, ours, singe, oiseau).
 * Des gestes lents et ronds, expliqués par un « maître » animal. Aucun coup, aucun contact :
 * ce sont des jeux de mouvement doux, pas des soins ni un art de combat.
 */
import type { Animal } from '../lib/mascots';
import type { SportMove, SportTip } from './sport';

export interface SeanceWushu extends SportTip {
  mascotte: Animal;
  color: string; // fond Tailwind
  qualite: string;
}

type Cues = [string, string, string];
type MoveRow = [emoji: string, text: string, seconds: number, anim: SportMove['anim'], cues: Cues];
type Row = [mascotte: Animal, emoji: string, titre: string, qualite: string, conseil: string, color: string, moves: [MoveRow, MoveRow, MoveRow]];

const ROWS: Row[] = [
  [
    'tigre',
    '🐯',
    'Le tigre tranquille',
    'La force calme',
    'Le tigre est fort parce qu’il reste calme. Toi aussi, {p}.',
    'bg-corail',
    [
      ['🐯', 'Le maître tigre dit : réveille-toi et ouvre tes pattes vers le ciel, tout doucement.', 20, 'etire', ['Pieds écartés, genoux souples, le dos bien long.', 'Inspire en montant les bras, les mains ouvertes comme des pattes.', 'Tu sens ton dos qui s’allonge, comme un tigre au réveil.']],
      ['🐾', 'Le maître tigre dit : marche à pas de velours, sans faire de bruit.', 20, 'balance', ['Lève un genou, pose le pied tout doucement.', 'Respire lentement à chaque pas.', 'Tes pieds sont silencieux, ton corps est bien droit.']],
      ['🌿', 'Le maître tigre dit : ferme les yeux et laisse ta force se reposer.', 15, 'calme', ['Debout, les bras détendus le long du corps.', 'Souffle longtemps par la bouche.', 'Tes épaules descendent, tu es fort et tranquille.']]
    ]
  ],
  [
    'grue',
    '🕊️',
    'La grue légère',
    'L’équilibre',
    'La grue tient sur une patte parce qu’elle regarde loin devant.',
    'bg-ciel',
    [
      ['🌬️', 'Maître grue dit : ouvre tes grandes ailes et grandis-toi.', 15, 'etire', ['Pieds bien posés, regarde devant toi.', 'Inspire en ouvrant les bras, souffle en les baissant.', 'Tes bras sont légers comme des plumes.']],
      ['🦶', 'Maître grue dit : lève un pied et ouvre tes ailes, comme au bord de l’eau.', 15, 'balance', ['Regarde un point fixe, lève un genou devant toi.', 'Respire calmement, les bras écartés.', 'Si tu perds l’équilibre, repose le pied et recommence.']],
      ['🦶', 'Maître grue dit : maintenant sur l’autre patte, sans te presser.', 15, 'balance', ['Change de pied, regarde toujours ton point fixe.', 'Inspire par le nez, souffle doucement.', 'Tu sens ta jambe solide comme un tronc.']]
    ]
  ],
  [
    'singe',
    '🐵',
    'Le singe joyeux',
    'La souplesse et la vivacité',
    'Le singe est curieux et agile : il bouge avec le sourire.',
    'bg-soleil',
    [
      ['🍌', 'Maître singe dit : petits bonds légers, comme sur une branche.', 15, 'saut', ['Plie les genoux avant de sauter.', 'Souffle à chaque petit bond.', 'Atterris tout doucement, sans bruit.']],
      ['🌀', 'Maître singe dit : tourne sur toi-même à petits pas, les bras ouverts.', 15, 'tourne', ['Fais de la place, petits pas seulement.', 'Respire tranquillement en tournant.', 'Arrête-toi si la tête te tourne.']],
      ['🙆', 'Maître singe dit : attrape un fruit imaginaire tout en haut de l’arbre.', 15, 'etire', ['Monte sur la pointe des pieds, un bras après l’autre.', 'Inspire en montant, souffle en redescendant.', 'Tes côtés s’étirent, comme une liane.']]
    ]
  ],
  [
    'ours',
    '🐻',
    'L’ours paisible',
    'La stabilité',
    'L’ours pose ses pattes bien à plat : rien ne le fait tomber.',
    'bg-menthe',
    [
      ['🌳', 'Maître ours dit : pieds bien plantés, balance-toi doucement de gauche à droite.', 20, 'balance', ['Pieds écartés, genoux un peu pliés.', 'Respire lentement, le ventre tout rond.', 'Tes pieds sont lourds comme des racines.']],
      ['☁️', 'Maître ours dit : pousse le ciel avec tes grosses pattes, tout lentement.', 15, 'etire', ['Mains ouvertes, paumes vers le haut.', 'Inspire en poussant vers le ciel.', 'Tes bras sont forts, ton dos reste long.']],
      ['🍯', 'Maître ours dit : pose tes pattes sur ton ventre et écoute ta respiration.', 15, 'calme', ['Mains sur le ventre, épaules relâchées.', 'Le ventre se gonfle, puis se dégonfle.', 'Tu es calme, comme un ours qui se repose.']]
    ]
  ],
  [
    'cerf',
    '🦌',
    'Le cerf attentif',
    'La douceur',
    'Le cerf bouge sans brusquer : il écoute tout autour de lui.',
    'bg-lavande',
    [
      ['👂', 'Maître cerf dit : grandis ton cou et tes bois, comme pour écouter la forêt.', 15, 'etire', ['Le menton droit, le dos bien long.', 'Inspire en te grandissant.', 'Tu écoutes tous les petits bruits.']],
      ['🍃', 'Maître cerf dit : petits bonds très légers, sur la pointe des pieds.', 15, 'saut', ['Genoux souples, tout petits bonds.', 'Souffle doucement à chaque saut.', 'Tu atterris sans aucun bruit.']],
      ['🌙', 'Maître cerf dit : baisse les bras et respire comme la forêt qui s’endort.', 15, 'calme', ['Debout, les bras relâchés.', 'Respire lentement par le nez.', 'Tout ton corps devient doux et tranquille.']]
    ]
  ]
];

export const WUSHU: SeanceWushu[] = ROWS.map(([mascotte, emoji, title, qualite, tip, color, moves]) => ({
  id: `wushu-${mascotte}`,
  mascotte,
  emoji,
  title,
  qualite,
  tip,
  color,
  moves: moves.map(([e, text, seconds, anim, cues]) => ({ emoji: e, text, seconds, anim, cues, mascotte }))
}));

export const isWushu = (id: string) => id.startsWith('wushu-');
