/**
 * Le petit bonhomme qui montre les mouvements : un squelette simple (tête, tronc, bras, avant-bras,
 * cuisses, jambes) piloté par des angles, comme un mannequin articulé.
 * Chaque posture = deux images clés (A ↔ B) jouées en boucle avec une courbe sinusoïdale :
 * c'est le rythme d'une respiration, doux et régulier, sans à-coups.
 * Le corps est posé au sol automatiquement (le point le plus bas touche le sol) : à quatre pattes,
 * ce sont les mains et les genoux qui touchent, allongé c'est le dos, etc.
 *
 * Angles en degrés. Direction 0 = vers le bas, 90 = vers la droite, 180 = vers le haut.
 *  root : rotation de tout le corps · t : inclinaison du tronc (0 = droit)
 *  nk : tête · aL/aR : épaules (0 = bras le long du corps) · eL/eR : coudes
 *  hL/hR : hanches (0 = jambe droite sous le corps) · kL/kR : genoux · lift : décollement (saut)
 * Les consignes sont des jeux de mouvement doux, pas des soins.
 */
import type { SportMove } from '../data/sport';

export interface Angles {
  root: number;
  t: number;
  nk: number;
  aL: number;
  eL: number;
  aR: number;
  eR: number;
  hL: number;
  kL: number;
  hR: number;
  kR: number;
  lift: number;
}

/** Sens du corps : de face, ou de profil (le ventre et le regard tournés vers la droite ou la gauche). */
export type Facing = 'face' | 'droite' | 'gauche';

export interface PoseDef {
  frames: [Partial<Angles>, Partial<Angles>];
  /** Sens du corps pendant le mouvement (de face par défaut). */
  facing?: Facing;
  /** Durée d'un aller (A → B), en secondes. */
  tempo: number;
  /** Consignes détaillées, façon kiné : placement · respiration · sensation. */
  cues: [string, string, string];
}

const BASE: Angles = { root: 0, t: 0, nk: 0, aL: -10, eL: 0, aR: 10, eR: 0, hL: -6, kL: 0, hR: 6, kR: 0, lift: 0 };
export const full = (p: Partial<Angles>): Angles => ({ ...BASE, ...p });

export const POSES = {
  respire: {
    frames: [{}, { aL: -28, aR: 28, t: -2, nk: -6 }],
    tempo: 2.6,
    cues: ['Debout, pieds écartés comme ton bassin, épaules relâchées.', 'Inspire par le nez : le ventre se gonfle comme un ballon.', 'Souffle par la bouche, tout doucement : les épaules descendent.']
  },
  brasHaut: {
    frames: [{}, { aL: -172, aR: 172, nk: -10 }],
    tempo: 2.2,
    cues: ['Pieds bien à plat, genoux souples, pas bloqués.', 'Monte les bras en inspirant, comme pour toucher le ciel.', 'Redescends en soufflant. Tu sens tes côtés qui s’allongent.']
  },
  etoile: {
    frames: [{ aL: -60, aR: 60, hL: -14, hR: 14 }, { aL: -128, aR: 128, hL: -24, hR: 24 }],
    tempo: 2,
    cues: ['Écarte les pieds plus grand que tes épaules.', 'Ouvre les bras en étoile, doigts bien écartés.', 'Grandis-toi en inspirant, relâche en soufflant.']
  },
  unPied: {
    facing: 'droite',
    frames: [{ aL: 40, eL: 100, aR: 46, eR: 100, hR: 70, kR: -105 }, { aL: 168, eL: 6, aR: 174, eR: 4, hR: 78, kR: -112 }],
    tempo: 2.6,
    cues: ['Regarde un point fixe devant toi : ça aide l’équilibre.', 'Plie un genou et pose le pied contre ta cheville ou ton mollet.', 'Respire calmement. Si tu perds l’équilibre, repose le pied et recommence.']
  },
  accroupi: {
    facing: 'droite',
    frames: [{ t: -8, hL: 30, kL: -40, hR: 36, kR: -46, aL: 94, aR: 98 }, { t: -24, hL: 96, kL: -118, hR: 100, kR: -122, aL: 110, eL: 0, aR: 114, eR: 0 }],
    tempo: 2.2,
    cues: ['Pieds écartés, talons bien posés au sol.', 'Descends comme pour t’asseoir sur un petit tabouret, le dos droit.', 'Remonte en poussant dans tes pieds. Les genoux suivent la direction des orteils.']
  },
  saut: {
    facing: 'droite',
    frames: [{ t: -18, hL: 58, kL: -80, hR: 62, kR: -84, aL: -40, aR: -30 }, { lift: 12, aL: 116, eL: 6, aR: 124, eR: 4, hL: 4, kL: -6, hR: 8, kR: -8 }],
    tempo: 0.5,
    cues: ['Plie un peu les genoux pour prendre ton élan.', 'Saute en poussant dans tes pieds, bras vers le ciel.', 'Atterris tout doucement, genoux pliés, comme un chat.']
  },
  course: {
    facing: 'droite',
    frames: [{ t: -8, hL: 48, kL: -70, hR: -18, kR: -34, aL: -40, eL: 85, aR: 46, eR: 80 }, { t: -8, hL: -18, kL: -34, hR: 48, kR: -70, aL: 46, eL: 80, aR: -40, eR: 85, lift: 6 }],
    tempo: 0.34,
    cues: ['Reste sur place, sur l’avant des pieds.', 'Monte les genoux, les bras se balancent avec les jambes.', 'Respire régulièrement. Si tu es essoufflé, ralentis.']
  },
  marche: {
    facing: 'droite',
    frames: [{ hL: 22, kL: -20, hR: -12, kR: -8, aL: -22, eL: 20, aR: 22, eR: 20 }, { hL: -12, kL: -8, hR: 22, kR: -20, aL: 22, eL: 20, aR: -22, eR: 20 }],
    tempo: 0.9,
    cues: ['Pose d’abord le talon, puis la pointe du pied.', 'Les bras se balancent doucement, à l’opposé des jambes.', 'Avance sans bruit, comme un chat qui se promène.']
  },
  chat: {
    facing: 'droite',
    frames: [{ t: -96, nk: 40, aL: 96, aR: 92, hL: 0, kL: -90, hR: 4, kR: -94 }, { t: -82, nk: -40, aL: 82, aR: 78, hL: 0, kL: -90, hR: 4, kR: -94 }],
    tempo: 2.4,
    cues: ['À quatre pattes : mains sous les épaules, genoux sous les hanches.', 'Creuse le dos en inspirant et regarde devant (la vache).', 'Arrondis le dos en soufflant et regarde ton ventre (le chat).']
  },
  chien: {
    facing: 'gauche',
    frames: [{ t: 120, nk: 10, aL: -180, aR: -178, hL: 50, kL: 20, hR: 54, kR: 24 }, { t: 132, nk: 14, aL: -178, aR: -176, hL: 44, kL: 4, hR: 48, kR: 4 }],
    tempo: 2.6,
    cues: ['Mains et pieds au sol, pousse les fesses vers le ciel.', 'Les genoux peuvent rester un peu pliés, c’est très bien.', 'Respire lentement. Tu sens l’arrière des jambes qui s’étire.']
  },
  cobra: {
    facing: 'gauche',
    frames: [{ root: 0, t: 84, nk: -44, aL: -60, eL: -90, aR: -56, eR: -90, hL: 90, kL: 0, hR: 92, kR: 0 }, { root: 0, t: 58, nk: -62, aL: -58, eL: 0, aR: -54, eR: 0, hL: 90, kL: 0, hR: 92, kR: 0 }],
    tempo: 2.6,
    cues: ['Allongé sur le ventre, mains sous les épaules.', 'Soulève doucement la tête et la poitrine en inspirant, sans forcer.', 'Le bas du ventre reste au sol. Redescends en soufflant.']
  },
  bateau: {
    facing: 'droite',
    frames: [{ t: 28, nk: -16, hL: 118, kL: -60, hR: 122, kR: -64, aL: 62, aR: 66 }, { t: 34, nk: -18, hL: 132, kL: -10, hR: 136, kR: -14, aL: 56, aR: 60 }],
    tempo: 2,
    cues: ['Assis, penche-toi un peu en arrière, le dos droit.', 'Lève les jambes, genoux pliés ou tendus, comme tu peux.', 'Bras devant toi, respire : tu tiens en équilibre sur les fesses.']
  },
  guerrier: {
    frames: [{ hL: -36, kL: 0, hR: 46, kR: -44, aL: -84, aR: 84 }, { hL: -40, kL: 0, hR: 54, kR: -56, aL: -92, aR: 92, nk: -4 }],
    tempo: 2.4,
    cues: ['Un grand pas en avant, le genou de devant plié au-dessus du pied.', 'La jambe de derrière reste tendue, le pied bien posé.', 'Ouvre les bras à l’horizontale et regarde loin devant.']
  },
  salut: {
    frames: [{ aL: -22, eL: 118, aR: 22, eR: -118 }, { t: 14, nk: 10, aL: -20, eL: 120, aR: 20, eR: -120 }],
    tempo: 1.8,
    cues: ['Pieds joints, le dos bien droit.', 'Mains l’une contre l’autre devant la poitrine.', 'Penche-toi un tout petit peu en avant pour saluer, puis remonte.']
  },
  cavalier: {
    frames: [{ hL: -32, kL: 30, hR: 32, kR: -30, aL: -20, aR: 20 }, { hL: -38, kL: 42, hR: 38, kR: -42, aL: -84, eL: 28, aR: 84, eR: -28 }],
    tempo: 2.8,
    cues: ['Pieds écartés, genoux pliés, comme sur un petit cheval.', 'Le dos reste droit, les épaules relâchées.', 'Les bras montent lentement en inspirant, redescendent en soufflant.']
  },
  pousser: {
    facing: 'droite',
    frames: [{ hL: 14, kL: -16, hR: -14, kR: 0, aL: 40, eL: 96, aR: 50, eR: 96 }, { t: -6, hL: 24, kL: -26, hR: -18, kR: 0, aL: 94, eL: 6, aR: 100, eR: 6 }],
    tempo: 2.4,
    cues: ['Un pied devant, un pied derrière, genoux souples.', 'Pousse lentement avec les deux mains en soufflant.', 'Ramène les mains vers toi en inspirant, comme une vague.']
  },
  poing: {
    facing: 'droite',
    frames: [{ hL: 26, kL: -24, hR: -26, kR: 0, aR: -20, eR: 118, aL: 50, eL: 100 }, { t: -6, hL: 30, kL: -30, hR: -28, kR: 0, aR: 96, eR: 4, aL: 40, eL: 110 }],
    tempo: 0.7,
    cues: ['Posture stable : un pied devant, genoux pliés.', 'Le poing part de la hanche et va dans le vide, doucement.', 'Arrête ton bras avant qu’il soit complètement tendu : c’est le contrôle.']
  },
  coupDePied: {
    facing: 'droite',
    frames: [{ hL: 6, kL: -10, hR: 60, kR: -100, aL: 50, eL: 100, aR: 40, eR: 110 }, { t: 12, hL: 4, kL: -10, hR: 88, kR: -6, aL: 56, eL: 100, aR: 46, eR: 110 }],
    tempo: 1,
    cues: ['Lève d’abord le genou bien haut.', 'Pousse le pied devant toi, lentement, dans le vide.', 'Repose le pied sans le claquer. La jambe d’appui reste un peu pliée.']
  },
  griffes: {
    facing: 'droite',
    frames: [{ hL: 20, kL: -24, hR: -16, kR: -6, aL: 66, eL: 22, aR: 76, eR: 18 }, { t: -8, hL: 26, kL: -32, hR: -20, kR: -6, aL: 92, eL: 8, aR: 102, eR: 4 }],
    tempo: 1.2,
    cues: ['Plie les doigts comme des griffes de tigre.', 'Avance un pied, les mains devant toi.', 'Griffe l’air doucement, jamais vers quelqu’un.']
  },
  balancier: {
    frames: [{ t: -8, aL: -64, aR: 64 }, { t: 8, aL: -64, aR: 64 }],
    tempo: 1.6,
    cues: ['Pieds bien ancrés au sol, bras écartés.', 'Penche-toi doucement d’un côté, puis de l’autre.', 'Respire tranquillement, comme un arbre dans le vent.']
  },
  flexion: {
    facing: 'droite',
    frames: [{ t: -122, nk: -16, hL: 4, kL: -14, hR: 8, kR: -16, aL: 92, eL: 4, aR: 96, eR: 4 }, { t: -100, nk: -12, hL: 2, kL: -8, hR: 6, kR: -10, aL: 72, eL: 10, aR: 76, eR: 10 }],
    tempo: 3,
    cues: ['Pieds écartés comme ton bassin, genoux un peu pliés.', 'Laisse descendre la tête et les bras vers tes chevilles, sans forcer.', 'Remonte tout doucement en déroulant le dos, la tête en dernier.']
  },
  ballon: {
    frames: [{ hL: -82, kL: 152, hR: 82, kR: -152, aL: -36, eL: 20, aR: 36, eR: -20 }, { hL: -82, kL: 152, hR: 82, kR: -152, aL: -128, eL: 10, aR: 128, eR: -10, nk: -8 }],
    tempo: 2.6,
    cues: ['Assis en tailleur, le dos bien droit.', 'Inspire en ouvrant grand les bras : tu gonfles un gros ballon.', 'Souffle doucement en ramenant les mains sur les genoux.']
  },
  triangle: {
    frames: [{ t: 48, hL: -30, hR: 30, aL: -84, aR: 96 }, { t: 58, nk: -10, hL: -30, hR: 30, aL: -86, aR: 100 }],
    tempo: 2.6,
    cues: ['Jambes très écartées et bien tendues.', 'Penche-toi sur le côté : une main descend vers la jambe.', 'L’autre bras monte vers le ciel. Regarde ta main du haut.']
  },
  koala: {
    frames: [{ hL: 12, kL: 0, hR: -12, kR: 0, aL: -14, eL: 138, aR: 14, eR: -138 }, { t: 4, hL: 14, kL: 0, hR: -14, kR: 0, aL: -10, eL: 142, aR: 10, eR: -142 }],
    tempo: 2.4,
    cues: ['Croise une jambe devant l’autre, genoux un peu pliés.', 'Croise les bras sur ta poitrine comme un koala qui serre sa branche.', 'Respire calmement et reste bien stable.']
  },
  chienJambe: {
    facing: 'gauche',
    frames: [{ t: 128, nk: 12, aL: -180, aR: -178, hL: 46, kL: 4, hR: 110, kR: 0 }, { t: 132, nk: 14, aL: -178, aR: -176, hL: 46, kL: 4, hR: 148, kR: 0 }],
    tempo: 2.4,
    cues: ['Commence en chien tête en bas, mains et pieds au sol.', 'Lève une jambe bien tendue vers l’arrière, doucement.', 'Repose-la sans bruit, puis change de jambe.']
  },
  bebeHeureux: {
    facing: 'droite',
    frames: [{ root: -6, t: 90, nk: -20, hL: 196, kL: -18, hR: 200, kR: -22, aL: 66, eL: 0, aR: 70, eR: 0 }, { root: 6, t: 90, nk: -20, hL: 196, kL: -18, hR: 200, kR: -22, aL: 66, eL: 0, aR: 70, eR: 0 }],
    tempo: 1.6,
    cues: ['Allongé sur le dos, attrape tes pieds avec tes mains.', 'Les genoux s’ouvrent de chaque côté de ton ventre.', 'Balance-toi doucement de droite à gauche : ça masse ton dos.']
  },
  tourne: {
    frames: [{ t: -6, aL: -90, aR: 90, nk: 8 }, { t: 6, aL: -96, aR: 96, nk: -8 }],
    tempo: 1.2,
    cues: ['Bras ouverts, regarde un point devant toi.', 'Tourne lentement, à petits pas.', 'Arrête-toi doucement : la tête ne doit pas tourner.']
  }
} satisfies Record<string, PoseDef>;

export type PoseName = keyof typeof POSES;

export function facingOf(pose: PoseName): Facing {
  return (POSES[pose] as PoseDef).facing ?? 'face';
}

/** Mots de la consigne → posture (le plus précis d'abord). */
const RULES: [RegExp, PoseName][] = [
  [/chaise invisible/i, 'accroupi'],
  [/ligne imaginaire/i, 'marche'],
  [/quatre pattes comme un (gros )?ours|marche à quatre pattes/i, 'chien'],
  [/balance-toi/i, 'balancier'],
  [/câlin|croise les bras/i, 'koala'],
  [/tes muscles/i, 'brasHaut'],
  [/penche-toi (en avant|et touche|pour)|touche (le sol|tes pieds)|tête en bas|en te penchant/i, 'flexion'],
  [/arc-en-ciel|au-dessus de ta tête/i, 'brasHaut'],
  [/bras tendu, main|brasse|gueule/i, 'pousser'],
  [/une main devant/i, 'marche'],
  [/sur le pied (droit|gauche)/i, 'unPied'],
  [/ballon.*(tailleur|assis)|tailleur/i, 'ballon'],
  [/triangle|planche à voile/i, 'triangle'],
  [/koala/i, 'koala'],
  [/jambe tendue vers l’arrière|chien à trois pattes/i, 'chienJambe'],
  [/bébé heureux|happy baby|attrape tes pieds/i, 'bebeHeureux'],
  [/chat|dos rond|vache|creuse le dos/i, 'chat'],
  [/chien/i, 'chien'],
  [/allongé sur le ventre|soulève la tête|deviens un serpent|serpent regarde/i, 'cobra'],
  [/bateau|tangue/i, 'bateau'],
  [/grenouille|accroupi|canard|cueillir/i, 'accroupi'],
  [/guerrier|tire la corde|arc/i, 'guerrier'],
  [/coup de pied|pousse le pied|genou bien haut/i, 'coupDePied'],
  [/poing|griffe l’air|blocage/i, 'poing'],
  [/griffes|tigre/i, 'griffes'],
  [/salue|salut|mains jointes|révérence/i, 'salut'],
  [/cavalier|racines|genoux un peu pliés|genoux pliés/i, 'cavalier'],
  [/pousse|vague|crinière/i, 'pousser'],
  [/un pied|une patte|flamant|arbre|grue|équilibre/i, 'unPied'],
  [/étoile|bras et jambes écartés/i, 'etoile'],
  [/bras.*(ciel|haut)|lève les bras|monte les bras|vers le soleil|étire/i, 'brasHaut'],
  [/cours|galope|course|vite/i, 'course'],
  [/marche|pas lents|petits pas|avance/i, 'marche'],
  [/saut|bond|décolle|sautille/i, 'saut'],
  [/tourne|planète|tornade/i, 'tourne'],
  [/respire|souffle|inspire|calme|bougie/i, 'respire']
];

const BY_ANIM: Record<SportMove['anim'], PoseName> = {
  saut: 'saut',
  balance: 'balancier',
  course: 'course',
  etire: 'brasHaut',
  tourne: 'tourne',
  calme: 'respire',
  frappe: 'poing'
};

export function poseFor(move: Pick<SportMove, 'text' | 'anim'>): PoseName {
  for (const [re, pose] of RULES) if (re.test(move.text)) return pose;
  return BY_ANIM[move.anim];
}

/* ---------- Cinématique : angles → points du dessin ---------- */

export type Pt = [number, number];
export interface Skeleton {
  hip: Pt;
  neck: Pt;
  head: Pt;
  headAngle: number;
  elbowL: Pt;
  handL: Pt;
  elbowR: Pt;
  handR: Pt;
  kneeL: Pt;
  footL: Pt;
  kneeR: Pt;
  footR: Pt;
  lift: number;
}

export const GROUND = 186;
const HEAD_R = 16; // tête des personnages dessinés (proportions d'un enfant de 5-6 ans)
const rad = Math.PI / 180;
const dir = (a: number, len: number): Pt => [Math.sin(a * rad) * len, Math.cos(a * rad) * len];
const add = (a: Pt, b: Pt): Pt => [a[0] + b[0], a[1] + b[1]];

export function lerpAngles(a: Angles, b: Angles, k: number): Angles {
  const out = { ...a };
  for (const key of Object.keys(a) as (keyof Angles)[]) out[key] = a[key] + (b[key] - a[key]) * k;
  return out;
}

/** Calcule le squelette, posé au sol et centré dans un cadre de 200 × 200. */
export function skeleton(p: Angles): Skeleton {
  const hip: Pt = [0, 0];
  const torsoDir = p.root + 180 + p.t;
  const neck = add(hip, dir(torsoDir, 52));
  const headAngle = torsoDir + p.nk;
  const head = add(neck, dir(headAngle, 18));
  const arm = p.root + p.t;
  const elbowL = add(neck, dir(arm + p.aL, 27));
  const handL = add(elbowL, dir(arm + p.aL + p.eL, 25));
  const elbowR = add(neck, dir(arm + p.aR, 27));
  const handR = add(elbowR, dir(arm + p.aR + p.eR, 25));
  const kneeL = add(hip, dir(p.root + p.hL, 36));
  const footL = add(kneeL, dir(p.root + p.hL + p.kL, 36));
  const kneeR = add(hip, dir(p.root + p.hR, 36));
  const footR = add(kneeR, dir(p.root + p.hR + p.kR, 36));

  const pts = [hip, neck, elbowL, handL, elbowR, handR, kneeL, footL, kneeR, footR];
  const maxY = Math.max(...pts.map((q) => q[1]), head[1] + HEAD_R);
  const xs = [...pts.map((q) => q[0]), head[0] - HEAD_R, head[0] + HEAD_R];
  const dx = 100 - (Math.min(...xs) + Math.max(...xs)) / 2;
  const dy = GROUND - 5 - maxY - p.lift; // 5 = moitié de l'épaisseur du trait
  const mv = (q: Pt): Pt => [q[0] + dx, q[1] + dy];
  return {
    hip: mv(hip),
    neck: mv(neck),
    head: mv(head),
    headAngle,
    elbowL: mv(elbowL),
    handL: mv(handL),
    elbowR: mv(elbowR),
    handR: mv(handR),
    kneeL: mv(kneeL),
    footL: mv(footL),
    kneeR: mv(kneeR),
    footR: mv(footR),
    lift: p.lift
  };
}
