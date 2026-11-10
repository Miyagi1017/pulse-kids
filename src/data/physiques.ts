/**
 * 60 activités physiques à la maison pour les enfants : 3 mouvements guidés (environ 1 minute),
 * sans matériel ou avec des objets doux (coussin, chaussette roulée). On ne monte sur aucun meuble.
 * Textes écrits pour Pulse Kids, dans l'esprit des séances pour enfants à faire à la maison.
 * Ce sont des jeux de mouvement doux, pas des soins.
 * Format d'un mouvement : "emoji~consigne~secondes~animation".
 */
import GUIDEES from './guidees.json';
import type { JamyVideo } from './jamy';
import type { MoveAnim, SportMove, SportTip } from './sport';

export type PhysiqueCat = 'defoule' | 'force' | 'adresse' | 'seance' | Famille;

type Famille = 'yoga' | 'detente' | 'taichi' | 'etirements' | 'education' | 'comportement';

export const PHYSIQUE_CATS: Record<PhysiqueCat, { label: string; emoji: string; color: string; tip: string }> = {
  defoule: { label: 'Se défouler', emoji: '🔥', color: 'bg-corail-clair', tip: 'Quand on a trop d’énergie, on bouge très fort, puis on se calme.' },
  force: { label: 'Devenir fort', emoji: '💪', color: 'bg-soleil-clair', tip: 'Des muscles forts protègent ton dos et t’aident à grimper.' },
  adresse: { label: 'Adresse', emoji: '🎯', color: 'bg-ciel-clair', tip: 'L’adresse, c’est quand les yeux, les mains et les pieds travaillent ensemble.' },
  seance: { label: 'Mini-séances', emoji: '⏱️', color: 'bg-menthe-clair', tip: 'On réveille son corps, on bouge, puis on revient au calme.' },
  yoga: { label: 'Yoga', emoji: '🧘', color: 'bg-menthe-clair', tip: 'Le yoga apprend à tenir une position en respirant calmement.' },
  detente: { label: 'Détente', emoji: '🌬️', color: 'bg-ciel-clair', tip: 'Respirer doucement aide le corps et la tête à se calmer.' },
  taichi: { label: 'Tai-chi', emoji: '☯️', color: 'bg-soleil-clair', tip: 'Au tai-chi, on bouge lentement, comme dans l’eau.' },
  etirements: { label: 'Étirements', emoji: '🙆', color: 'bg-corail-clair', tip: 'On s’étire doucement, sans jamais forcer.' },
  education: { label: 'Éducation physique', emoji: '🏃', color: 'bg-ciel-clair', tip: 'Courir, viser, attraper : tout le corps apprend.' },
  comportement: { label: 'Vivre ensemble', emoji: '💛', color: 'bg-soleil-clair', tip: 'On apprend à attendre, à écouter et à dire ce qu’on ressent.' }
};

/** Consignes générales par type de geste : toujours justes, quel que soit le jeu. */
const CUES: Record<MoveAnim, [string, string, string]> = {
  saut: ['Plie les genoux avant de sauter.', 'Souffle quand tu retombes.', 'Atterris tout doucement, sans bruit.'],
  balance: ['Regarde un point fixe devant toi.', 'Respire calmement, sans te presser.', 'Si tu perds l’équilibre, ce n’est pas grave : recommence.'],
  course: ['Fais de la place autour de toi.', 'Respire régulièrement en bougeant.', 'Trop essoufflé ? Ralentis un peu.'],
  etire: ['Le dos reste bien long.', 'Inspire en te grandissant, souffle en revenant.', 'On va doucement, sans jamais forcer.'],
  tourne: ['Fais de la place, tourne à petits pas.', 'Respire tranquillement.', 'Arrête-toi si la tête te tourne.'],
  calme: ['Détends tes épaules et tes mains.', 'Inspire par le nez, souffle longtemps.', 'Tu sens ton cœur qui ralentit.'],
  frappe: ['Le geste reste doux, dans le vide.', 'Souffle à chaque geste.', 'On ne touche personne.']
};

type Row = [PhysiqueCat, string, string, string];

const DATA: Row[] = [
  // ---- Se défouler (15)
  ['defoule', '🌪️', 'La tornade', '🌪️~Tourne doucement sur toi-même, les bras ouverts~15~tourne|🏃~Cours sur place, de plus en plus vite~20~course|🌬️~Arrête-toi et souffle comme le vent qui se calme~15~calme'],
  ['defoule', '🌋', 'Le volcan qui gronde', '🌋~Accroupis-toi, puis jaillis en sautant, bras en l’air~20~saut|🔥~Secoue tes bras et tes jambes comme de la lave~15~course|🌫️~Le volcan s’endort : redescends tout doucement~15~calme'],
  ['defoule', '🐕', 'Le chien fou', '🐕~Cours sur place en remuant les fesses~20~course|🦴~Saute pour attraper un os imaginaire~15~saut|💤~Mets-toi en boule, le chien se repose~15~calme'],
  ['defoule', '🥁', 'Le tambour fou', '🥁~Tape des pieds très vite sur le sol, sans avancer~20~course|👏~Tape dans tes mains au-dessus de ta tête~15~etire|🫁~Pose tes mains sur ton ventre et respire~15~calme'],
  ['defoule', '🚒', 'Les pompiers', '🚒~Cours sur place vers le feu imaginaire~20~course|🪜~Monte à l’échelle imaginaire, bras et genoux~20~etire|💧~Le feu est éteint : souffle longuement~15~calme'],
  ['defoule', '🎢', 'Le grand huit', '🎢~Accroupis-toi, puis relève-toi très vite~20~saut|↔️~Penche-toi à gauche, puis à droite, ça secoue !~15~balance|🙌~Lève les bras et fais youpi, puis respire~15~calme'],
  ['defoule', '🐝', 'L’essaim', '🐝~Cours à petits pas en battant des ailes~20~course|🌀~Tourne en rond tout doucement, bzzz~15~tourne|🌸~Pose-toi sur une fleur et ne bouge plus~15~calme'],
  ['defoule', '⚡', 'L’éclair', '⚡~Cours le plus vite possible sur place, 10 secondes~12~course|🌩️~Saute et fais un éclair avec tes bras~15~saut|🌈~L’orage est passé : respire lentement~15~calme'],
  ['defoule', '🎸', 'Le concert', '🎸~Saute sur place comme une star sur scène~20~saut|🎶~Joue de la guitare imaginaire, genoux pliés~15~balance|🙇~Salue ton public tout doucement~15~calme'],
  ['defoule', '🦖', 'Le gros dinosaure', '🦖~Marche sur place lourdement, boum, boum~20~course|🦕~Ouvre grand tes bras de géant~15~etire|🥱~Le dinosaure bâille et s’assoit~15~calme'],
  ['defoule', '🤖', 'Le robot fou', '🤖~Bouge bras et jambes, tout raides, comme un robot~20~course|⚙️~Le robot s’emballe : va plus vite !~15~course|🔋~Batterie vide : ralentis, puis arrête-toi~15~calme'],
  ['defoule', '🌊', 'La grande vague', '🌊~Monte sur la pointe des pieds, bras vers le ciel~15~etire|💦~Saute par-dessus les petites vagues~20~saut|🏖️~Allonge-toi : la mer est toute plate~15~calme'],
  ['defoule', '🐎', 'Le rodéo', '🐎~Galope sur place, tiens bien les rênes~20~course|🤠~Saute à droite, puis à gauche~15~saut|🐴~Caresse ton cheval et respire~15~calme'],
  ['defoule', '🎆', 'Le feu d’artifice', '🧨~Accroupis-toi tout petit, la mèche est allumée~10~calme|🎆~Saute en ouvrant bras et jambes : boum !~20~saut|✨~Laisse retomber tes doigts comme des étincelles~15~etire'],
  ['defoule', '🏎️', 'La voiture de course', '🏎️~Cours sur place, tes mains tiennent le volant~20~course|↪️~Un virage : penche-toi à droite, puis à gauche~15~balance|🛑~Arrêt au stand : respire trois fois~15~calme'],

  // ---- Devenir fort (15)
  ['force', '🧱', 'Le mur solide', '🧱~Debout face au mur, pousse-le avec tes deux mains~15~etire|🦵~Dos contre le mur, plie un peu les genoux~15~etire|🫧~Secoue doucement tes jambes~15~calme'],
  ['force', '🐻', 'L’ours costaud', '🐻~Marche à quatre pattes, les fesses en l’air~20~course|🌲~Grimpe à un arbre imaginaire~15~etire|🍯~L’ours s’assoit et souffle~15~calme'],
  ['force', '🦀', 'Le crabe pressé', '🦀~Assis, mains derrière toi, lève un peu les fesses~15~etire|🏖️~Avance comme un crabe, tout doucement~20~course|🧘~Repose-toi, assis en tailleur~15~calme'],
  ['force', '🐢', 'La tortue costaude', '🐢~À quatre pattes, avance très lentement~20~course|🛡️~Reste à quatre pattes, le dos tout plat~15~etire|🏠~Rentre dans ta carapace : assis sur tes talons~15~calme'],
  ['force', '🌉', 'Le pont', '🌉~Allongé, pieds au sol, monte tes fesses~15~etire|⬇️~Redescends doucement, puis remonte~20~etire|🤗~Serre tes genoux contre ton ventre~15~calme'],
  ['force', '🏋️', 'Le grand champion', '🏋️~Soulève un gros ballon imaginaire au-dessus de ta tête~15~etire|🦵~Accroupis-toi pour le poser, le dos bien droit~20~etire|🏅~Bravo champion : respire et secoue tes bras~15~calme'],
  ['force', '🪑', 'La chaise magique', '🪑~Plie les genoux comme si tu t’asseyais dans le vide~15~etire|⬆️~Relève-toi, puis recommence doucement~20~etire|🫧~Secoue tes jambes l’une après l’autre~15~calme'],
  ['force', '🐛', 'La chenille costaude', '🐛~Mains au sol, avance tes mains, puis tes pieds~20~course|🌿~Allongé sur le ventre, lève la tête et les bras~15~etire|🦋~Mets-toi en boule, comme dans ton cocon~15~calme'],
  ['force', '🚜', 'Le tracteur', '🚜~À quatre pattes, pousse un coussin avec ta tête~20~course|🌾~Pousse maintenant le coussin avec tes mains~20~course|😌~Pose ta tête sur le coussin et respire~15~calme'],
  ['force', '🧗', 'L’alpiniste', '🧗~Grimpe sur place, un bras et un genou à la fois~20~course|🏔️~Au sommet : monte sur la pointe des pieds~15~etire|⛺~Redescends lentement et assieds-toi~15~calme'],
  ['force', '🐸', 'La grosse grenouille', '🐸~Accroupis-toi, les mains au sol~10~etire|💚~Hop, petits sauts de grenouille~20~saut|🪷~La grenouille se pose sur son nénuphar~15~calme'],
  ['force', '🦸', 'Le super-héros', '🦸~Lève les bras et montre tes muscles~15~etire|🪨~Pousse un rocher imaginaire devant toi~20~course|🌍~Le monde est sauvé : souffle tranquillement~15~calme'],
  ['force', '🛸', 'La soucoupe', '🛸~Accroupis-toi et compte jusqu’à 3~10~etire|⬆️~Relève-toi tout lentement, les bras en l’air~20~etire|🌌~Assieds-toi et flotte dans l’espace~15~calme'],
  ['force', '🐈', 'Le grand chat', '🐈~À quatre pattes, fais le dos tout rond~15~etire|🌙~Creuse le dos doucement et regarde devant~15~etire|😺~Assis sur tes talons, le chat se repose~15~calme'],
  ['force', '🪵', 'Le petit bûcheron', '🪵~Soulève une bûche imaginaire, genoux pliés~15~etire|🚶~Porte-la en marchant sur place~20~course|🔥~Pose-la près du feu et respire~15~calme'],

  // ---- Adresse (15)
  ['adresse', '🧦', 'La chaussette volante', '🧦~Roule une chaussette en boule et lance-la tout droit~20~balance|🤲~Rattrape-la avec tes deux mains~20~balance|🧺~Vise un panier et lance-la dedans~15~balance'],
  ['adresse', '🛋️', 'Le coussin sur la tête', '🛋️~Pose un coussin sur ta tête et marche doucement~20~balance|🌀~Tourne-toi sans le faire tomber~15~tourne|😮‍💨~Enlève le coussin et souffle~10~calme'],
  ['adresse', '🎪', 'Le funambule du salon', '🎪~Marche sur une ligne imaginaire, pied devant pied~20~balance|↩️~Reviens en arrière, les bras bien ouverts~15~balance|🦶~Arrête-toi sur un pied et compte jusqu’à 5~10~balance'],
  ['adresse', '🛟', 'Le slalom', '🛟~Pose 3 coussins et contourne-les en zigzag~20~course|🔁~Contourne-les dans l’autre sens~20~course|🧹~Range les coussins, bravo !~10~calme'],
  ['adresse', '🎈', 'Le ballon magique', '🎈~Tape un ballon imaginaire vers le haut, tout doux~20~etire|🦶~Fais-le rebondir sur ton genou~15~balance|🫧~Laisse-le s’envoler et souffle~10~calme'],
  ['adresse', '🥄', 'La cuillère', '🥄~Pose une chaussette sur une cuillère et marche~20~balance|🐌~Avance encore plus lentement, sans la faire tomber~20~balance|🏁~Pose la cuillère et lève les bras~10~etire'],
  ['adresse', '🎯', 'La cible au bol', '🎯~Pose un bol par terre et vise avec une chaussette~20~balance|👣~Recule d’un grand pas et vise encore~20~balance|🫳~Ramasse tout en pliant bien les genoux~10~etire'],
  ['adresse', '📖', 'Le livre sur la tête', '📖~Pose un livre fin sur ta tête, tiens-toi droit~15~balance|🚶~Fais quatre petits pas sans le faire tomber~20~balance|😌~Pose le livre et relâche tes épaules~10~calme'],
  ['adresse', '🕳️', 'Le tunnel', '🕳️~Passe à quatre pattes sous une table~20~course|🐇~Ressors de l’autre côté, tout doucement~15~course|🌞~Relève-toi et grandis-toi~10~etire'],
  ['adresse', '📦', 'Le déménageur', '📦~Porte un coussin d’un bout à l’autre de la pièce~20~course|🔙~Rapporte-le en le tenant sur ta tête~20~balance|🧘~Pose-le et assieds-toi dessus pour respirer~10~calme'],
  ['adresse', '🎨', 'Le peintre en l’air', '🎨~Dessine un grand rond en l’air avec ton bras~15~etire|🦶~Dessine un petit rond avec ton pied~15~balance|🌈~Peins un arc-en-ciel avec tes deux bras~15~etire'],
  ['adresse', '🪞', 'Le miroir à deux', '🪞~Fais face à un adulte et imite ses gestes~20~balance|🔄~Maintenant, c’est lui qui t’imite~20~etire|😊~Saluez-vous et respirez ensemble~10~calme'],
  ['adresse', '🚦', 'Le feu tricolore', '🟢~Vert : marche vite sur place~15~course|🟠~Orange : ralentis tout doucement~15~balance|🔴~Rouge : statue, ne bouge plus !~10~calme'],
  ['adresse', '🎵', 'La statue musicale', '🎵~Danse sur place comme tu veux~15~course|🗿~Statue : ne bouge plus du tout~10~calme|💃~Danse encore, puis salue~15~tourne'],
  ['adresse', '🗼', 'La tour de coussins', '🗼~Empile 3 coussins en pliant bien les genoux~20~etire|👣~Fais le tour de ta tour à petits pas~15~course|🧹~Range les coussins un par un~15~etire'],

  // ---- Mini-séances (15)
  ['seance', '⏰', 'Le réveil tonique', '🙆~Étire-toi comme au réveil, bras en l’air~15~etire|🏃~Cours sur place, genoux bien hauts~20~course|☀️~Respire et dis bonjour à ta journée~15~calme'],
  ['seance', '🏅', 'L’entraînement du champion', '🦵~Plie les genoux dix fois, tout doucement~20~etire|🐇~Fais dix petits sauts pieds joints~20~saut|🏆~Monte sur un podium imaginaire et respire~15~calme'],
  ['seance', '🌤️', 'La pause du matin', '🙌~Lève les bras et balance-toi~15~balance|🚶~Marche sur place, le dos bien droit~20~course|🌬️~Ferme les yeux et respire doucement~15~calme'],
  ['seance', '📚', 'La pause devoirs', '🤷~Monte et baisse tes épaules~15~etire|🔄~Tourne doucement ta tête, à gauche, à droite~15~calme|🏃~Cours 15 secondes sur place, puis retourne au travail~15~course'],
  ['seance', '🛁', 'Avant le bain', '🧴~Frotte-toi les bras et les jambes pour de faux~15~etire|🫧~Saute comme une bulle qui monte~15~saut|🧘~Assieds-toi et respire doucement~15~calme'],
  ['seance', '🌧️', 'Le jour de pluie', '☔~Saute dans des flaques imaginaires, splash !~20~saut|🌂~Ouvre un grand parapluie avec tes bras~15~etire|🛋️~Rentre au chaud et souffle~15~calme'],
  ['seance', '🏟️', 'Les petits Jeux', '🏃~Le sprint : cours vite sur place~15~course|🤸~Le saut : saute en écartant les bras~15~saut|🥇~La médaille : lève les bras, respire~15~calme'],
  ['seance', '🕺', 'La boum du salon', '🕺~Danse en bougeant les épaules~20~course|💃~Tourne doucement, les bras ouverts~15~tourne|🎶~Balance-toi lentement, la chanson finit~15~calme'],
  ['seance', '🌳', 'La promenade en forêt', '🥾~Marche sur place, genoux hauts~20~course|🌲~Grandis-toi comme un très grand arbre~15~etire|🍃~Balance-toi comme une feuille, tout doucement~15~balance'],
  ['seance', '🚀', 'La mission spatiale', '🧑‍🚀~Accroupis-toi, puis décolle en sautant~20~saut|🌕~Marche sur la Lune, à pas très lents~20~balance|🌌~Allonge-toi et regarde les étoiles~15~calme'],
  ['seance', '🦁', 'Le safari', '🦁~Marche à quatre pattes comme un lion~20~course|🦒~Grandis-toi comme une girafe~15~etire|🌅~Assieds-toi, le soleil se couche~15~calme'],
  ['seance', '🧊', 'La banquise qui glisse', '🐧~Dandine-toi comme un pingouin~20~balance|❄️~Saute pour te réchauffer~15~saut|🧣~Serre-toi dans tes bras et respire~15~calme'],
  ['seance', '🍎', 'Le goûter qui bouge', '🍎~Attrape des pommes tout en haut de l’arbre~20~etire|🧺~Accroupis-toi pour les mettre dans le panier~15~etire|😋~Frotte ton ventre et respire~15~calme'],
  ['seance', '🌈', 'La séance arc-en-ciel', '🔴~Cours sur place pour le rouge~15~course|🟡~Saute pour le jaune~15~saut|🔵~Respire lentement pour le bleu~15~calme'],
  ['seance', '🌙', 'La séance du soir', '🌙~Étire-toi doucement vers la Lune~15~etire|🦉~Tourne ta tête lentement, comme un hibou~15~calme|😴~Allonge-toi et ferme les yeux~20~calme']
];

const ANIMS = Object.keys(CUES) as MoveAnim[];

function parseMoves(spec: string): SportMove[] {
  return spec.split('|').map((m) => {
    const [emoji, text, secs, anim] = m.split('~');
    if (!ANIMS.includes(anim as MoveAnim)) throw new Error(`Animation inconnue : ${m}`);
    return { emoji, text, seconds: Number(secs), anim: anim as MoveAnim, cues: CUES[anim as MoveAnim] };
  });
}

export interface ActivitePhysique extends SportTip {
  categorie: PhysiqueCat;
}

/** Même exercice que la version guidée d'Angela, qui est plus détaillée : on n'en garde qu'une. */
const REMPLACEES = new Set(['Le pont', 'Le crabe pressé', 'Le funambule du salon']);

const BASE: ActivitePhysique[] = DATA.map(([categorie, emoji, title, spec], i) => ({
  id: `physique-${String(i + 1).padStart(2, '0')}`,
  categorie,
  emoji,
  title,
  tip: PHYSIQUE_CATS[categorie].tip,
  moves: parseMoves(spec)
})).filter((a) => !REMPLACEES.has(a.title));

/** Activités guidées d'Angela : étapes détaillées, histoire pour l'enfant et conseil pour l'adulte. */
const GUIDEE_SECONDS = 15;
const guidees: ActivitePhysique[] = (GUIDEES as { famille: Famille; title: string; but: string; etapes: string[]; histoire: string; adulte: string; anims: MoveAnim[] }[]).map((a, i) => ({
  id: `physique-${DATA.length + i + 1}`,
  categorie: a.famille,
  emoji: PHYSIQUE_CATS[a.famille].emoji,
  title: a.title,
  tip: `${a.histoire} ${a.but}`,
  adulte: a.adulte,
  moves: a.etapes.map((text, s) => ({ emoji: PHYSIQUE_CATS[a.famille].emoji, text, seconds: GUIDEE_SECONDS, anim: a.anims[s], cues: CUES[a.anims[s]] }))
}));

export const PHYSIQUES: ActivitePhysique[] = [...BASE, ...guidees];

export const isPhysique = (id: string) => id.startsWith('physique-');

/** Séances à regarder sur YouTube avec un adulte (titres, chaînes et durées relevés le 8 novembre 2026). */
export const VIDEOS_SPORT: JamyVideo[] = [
  { id: 'iz4Udv5dDnY', title: '10 exercices pour enfant agité à la maison', channel: 'Human Tetris Workout', duration: '8:54' },
  { id: '9G2BKYd77ko', title: 'Séance de sport à la maison, 15 minutes', channel: 'Tibo InShape Entrainement', duration: '15:24' }
];
