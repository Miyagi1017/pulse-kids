/**
 * 50 mini-vidéos documentaires pour les 5 ans : 4 scènes narrées et animées + une vraie photo
 * (sous licence libre, via Openverse — voir scripts/fetch-video-images.ts).
 * Format : [emoji, titre, recherche photo, "scène 1|…|scène 4"]. {p} = prénom.
 * Recherche : mots anglais (Openverse), « nasa:… » (NASA Image Library) ou « none » (emoji animé seul).
 */

export type VideoTheme = 'animaux' | 'nature' | 'espace' | 'metiers' | 'corps' | 'monde';

export interface MiniVideo {
  id: string;
  theme: VideoTheme;
  emoji: string;
  title: string;
  query: string;
  scenes: string[];
}

type Row = [string, string, string, string];

const DATA: Record<VideoTheme, Row[]> = {
  animaux: [
    ['🐧', 'Les manchots', 'penguins', 'Voici les manchots ! Ils vivent là où il fait très, très froid.|Ils ne volent pas, mais ce sont des champions de natation.|Pour avoir chaud, ils se serrent tous les uns contre les autres.|Et toi {p}, sais-tu marcher en te dandinant comme un manchot ?'],
    ['🐘', 'Les éléphants', 'elephant family', 'L’éléphant est le plus gros animal qui marche sur la terre.|Sa trompe lui sert de nez, de main et même de douche !|Les éléphants vivent en famille et prennent soin des petits.|Peux-tu faire une trompe avec ton bras, {p} ?'],
    ['🦒', 'Les girafes', 'giraffe', 'La girafe a le cou le plus long de tous les animaux.|Grâce à lui, elle mange les feuilles tout en haut des arbres.|Sa langue est violette et très longue.|Mets-toi sur la pointe des pieds pour être grand comme une girafe !'],
    ['🐝', 'Les abeilles', 'honey bee flower', 'Bzzz ! Voici l’abeille, une petite travailleuse.|Elle vole de fleur en fleur pour récolter le nectar.|Avec, elle fabrique le miel dans la ruche.|Les abeilles aident aussi les fruits à pousser. Merci les abeilles !'],
    ['🐬', 'Les dauphins', 'dolphin jumping', 'Les dauphins vivent dans la mer, mais ce ne sont pas des poissons.|Ils remontent à la surface pour respirer.|Ils parlent entre eux avec des sifflements.|Ils adorent jouer et sauter hors de l’eau !'],
    ['🦋', 'Les papillons', 'butterfly flower', 'Avant d’être un papillon, il y a une chenille.|La chenille mange beaucoup de feuilles, puis fabrique un cocon.|Un jour, le cocon s’ouvre… et un papillon s’envole !|Quelles couleurs ont les papillons que tu as vus, {p} ?'],
    ['🐢', 'Les tortues', 'tortoise', 'La tortue porte sa maison sur son dos : sa carapace.|Quand elle a peur, elle rentre la tête dedans.|Certaines tortues vivent plus de cent ans !|Elle avance doucement, mais elle arrive toujours au bout.'],
    ['🦉', 'Les chouettes', 'owl', 'La chouette se réveille quand nous allons dormir.|Ses grands yeux voient très bien dans le noir.|Elle peut tourner la tête presque jusque derrière elle.|Hou hou ! Sais-tu faire le cri de la chouette ?'],
    ['🐄', 'La vache', 'cow meadow', 'La vache vit à la ferme et mange de l’herbe toute la journée.|Elle nous donne du lait.|Avec le lait, on fabrique le beurre, le yaourt et le fromage.|Meuh ! Quel est ton fromage préféré, {p} ?'],
    ['🐿️', 'Les écureuils', 'squirrel', 'L’écureuil vit dans les arbres et saute de branche en branche.|Sa grande queue touffue l’aide à garder l’équilibre.|En automne, il cache des noisettes pour l’hiver.|Parfois il oublie où il les a cachées… et un arbre pousse !'],
    ['🦁', 'Les lions', 'lion cub', 'Le lion vit dans la savane, en Afrique.|Le papa lion a une grande crinière autour de la tête.|Les lionceaux jouent beaucoup pour apprendre.|Le lion dort presque toute la journée !'],
    ['🐸', 'Les grenouilles', 'frog', 'La grenouille commence sa vie dans l’eau : c’est un têtard.|Puis ses pattes poussent et sa queue disparaît.|Elle attrape les insectes avec sa longue langue.|Croâ croâ ! Sais-tu sauter comme une grenouille ?'],
    ['🐼', 'Les pandas', 'giant panda eating bamboo', 'Le panda géant vit dans les montagnes de Chine.|Il est noir et blanc, et très doux.|Il passe presque toute la journée à manger du bambou.|Le panda est un animal rare : il faut le protéger.'],
    ['🐞', 'Les coccinelles', 'ladybug', 'La coccinelle est un petit insecte rouge à points noirs.|Elle mange les pucerons qui abîment les plantes.|Les jardiniers l’adorent !|Combien de points vois-tu sur une coccinelle ?'],
    ['🐳', 'Les baleines', 'humpback whale breaching', 'La baleine est le plus grand animal du monde.|Elle respire par un trou sur sa tête et fait de grands jets d’eau.|Les baleines chantent pour se parler, très loin dans l’océan.|Elle est plus grande qu’un autobus !']
  ],
  nature: [
    ['🌳', 'Les arbres', 'green tree meadow', 'Les arbres sont de géants très calmes.|Leurs racines boivent l’eau dans la terre.|Leurs feuilles fabriquent l’air que nous respirons.|Fais un câlin à un arbre la prochaine fois, {p} !'],
    ['🌈', 'L’arc-en-ciel', 'rainbow landscape', 'Quand il pleut et qu’il y a du soleil, un arc-en-ciel peut apparaître.|Il a sept couleurs : rouge, orange, jaune, vert, bleu, indigo et violet.|La lumière du soleil traverse les gouttes de pluie.|Peux-tu dire toutes les couleurs avec moi ?'],
    ['🌊', 'La mer', 'ocean waves beach', 'La mer est immense et son eau est salée.|Les vagues vont et viennent sur la plage.|Elle abrite des poissons, des crabes et des coquillages.|Écoute… chhh… c’est le bruit des vagues.'],
    ['🌋', 'Les volcans', 'volcano landscape', 'Un volcan est une montagne avec un trou en haut.|Parfois, de la lave très chaude en sort.|En refroidissant, la lave devient de la roche.|Les volcans fabriquent de nouvelles terres !'],
    ['❄️', 'La neige', 'snow covered trees', 'Quand il fait très froid, la pluie devient de la neige.|Chaque flocon a une forme unique.|On peut faire des bonhommes de neige et des glissades.|N’oublie pas ton bonnet et tes gants, {p} !'],
    ['🍂', 'L’automne', 'autumn leaves', 'En automne, les feuilles changent de couleur.|Elles deviennent jaunes, oranges et rouges.|Puis elles tombent et font un tapis qui craque.|C’est aussi la saison des châtaignes et des champignons.'],
    ['🌷', 'Le printemps', 'spring flowers', 'Au printemps, la nature se réveille.|Les fleurs poussent et les arbres font des bourgeons.|Les oiseaux construisent leurs nids.|Les journées deviennent plus longues et plus douces.'],
    ['🌧️', 'La pluie', 'rain drops', 'La pluie vient des nuages.|L’eau de la mer chauffe au soleil, monte au ciel et forme les nuages.|Quand les nuages sont trop lourds, il pleut.|La pluie fait boire les plantes et remplit les rivières.'],
    ['⛰️', 'Les montagnes', 'mountains landscape', 'Les montagnes sont très hautes, parfois avec de la neige au sommet.|On y voit des chamois, des marmottes et des aigles.|Il faut beaucoup marcher pour monter tout en haut.|De là-haut, la vue est magnifique !'],
    ['🌻', 'Les fleurs', 'colorful flowers', 'Les fleurs ont toutes sortes de couleurs et de parfums.|Elles attirent les abeilles et les papillons.|Après la fleur vient souvent le fruit.|Quelle est ta fleur préférée, {p} ?']
  ],
  espace: [
    ['🌙', 'La Lune', 'full moon', 'La Lune tourne autour de la Terre.|Elle ne fait pas de lumière : elle renvoie celle du Soleil.|Parfois elle est ronde, parfois en croissant.|Des astronautes ont marché sur la Lune !'],
    ['☀️', 'Le Soleil', 'sunrise sun sky', 'Le Soleil est une étoile, très grande et très chaude.|Il nous donne la lumière et la chaleur.|Sans lui, les plantes ne pousseraient pas.|Attention : on ne le regarde jamais directement !'],
    ['🪐', 'Les planètes', 'saturn planet', 'Autour du Soleil tournent huit planètes.|La Terre est notre planète, la seule avec des plantes et des animaux connus.|Saturne a de beaux anneaux, Jupiter est la plus grosse.|Mars est rouge, comme de la rouille.'],
    ['🚀', 'Les fusées', 'rocket launch', 'Pour aller dans l’espace, il faut une fusée.|Elle pousse très fort avec du feu pour monter.|Trois, deux, un… décollage !|Plus tard, veux-tu être astronaute, {p} ?'],
    ['👩‍🚀', 'Les astronautes', 'astronaut space station', 'Les astronautes voyagent dans l’espace.|Dans la station spatiale, tout flotte, même les gouttes d’eau !|Pour sortir, ils mettent une grosse combinaison.|Ils voient la Terre toute ronde par la fenêtre.'],
    ['⭐', 'Les étoiles', 'starry night sky', 'La nuit, le ciel est plein d’étoiles.|Ce sont des soleils, mais très, très loin.|Certaines étoiles forment des dessins : les constellations.|Ce soir, essaie de compter les étoiles !'],
    ['🌍', 'La Terre', 'nasa:blue marble earth', 'Vue de l’espace, la Terre est bleue et blanche.|Le bleu, ce sont les océans ; le blanc, les nuages.|Elle tourne sur elle-même : c’est le jour et la nuit.|C’est notre maison : prenons-en soin.'],
    ['🌌', 'Les aurores', 'aurora borealis', 'Près du pôle Nord, le ciel danse parfois.|On appelle ces lumières des aurores.|Elles sont vertes, roses ou violettes.|C’est un des plus beaux spectacles de la nature !']
  ],
  metiers: [
    ['🚒', 'Les pompiers', 'fire truck', 'Les pompiers éteignent les incendies.|Ils aident aussi les personnes blessées.|Leur camion rouge a une grande échelle.|Le numéro des pompiers en France, c’est le 18.'],
    ['👩‍⚕️', 'Le médecin', 'stethoscope', 'Le médecin soigne quand on est malade.|Avec son stéthoscope, il écoute ton cœur.|Il peut donner des médicaments pour guérir.|Il ne faut pas avoir peur : il est là pour aider.'],
    ['👨‍🌾', 'L’agriculteur', 'farm tractor field', 'L’agriculteur cultive les champs.|Il fait pousser le blé, les légumes et les fruits.|Il s’occupe aussi des animaux de la ferme.|Grâce à lui, nous avons à manger !'],
    ['🥖', 'Le boulanger', 'bread bakery', 'Le boulanger se lève très tôt.|Il fabrique le pain avec de la farine, de l’eau, du sel et de la levure.|Il fait aussi les croissants.|Miam, ça sent bon dans la boulangerie !'],
    ['📚', 'La maîtresse', 'classroom books', 'À l’école, la maîtresse ou le maître t’apprend plein de choses.|Lire, compter, dessiner, chanter.|Il ou elle aide chaque enfant à grandir.|Qu’as-tu appris d’amusant cette semaine, {p} ?'],
    ['🚌', 'Le chauffeur de bus', 'yellow school bus road', 'Le chauffeur conduit le bus en toute sécurité.|Il s’arrête aux arrêts pour que les gens montent.|Dans le bus, on reste assis et on dit bonjour.|Tut tut ! En route !'],
    ['🔬', 'Les scientifiques', 'microscope science', 'Les scientifiques cherchent à comprendre le monde.|Ils observent, posent des questions et font des expériences.|Avec un microscope, on voit des choses minuscules.|Toi aussi tu es un scientifique quand tu te demandes « pourquoi ? »']
  ],
  corps: [
    ['🦷', 'Les dents', 'none', 'Les dents servent à croquer et à mâcher.|Les petites dents de lait tomberont un jour.|De nouvelles dents plus solides pousseront.|Brosse-les matin et soir pour qu’elles restent belles !'],
    ['❤️', 'Le cœur', 'none', 'Le cœur est un muscle dans ta poitrine.|Il bat tout le temps, même quand tu dors.|Il envoie le sang partout dans ton corps.|Mets ta main sur ta poitrine : sens-tu ton cœur battre ?'],
    ['🍎', 'Bien manger', 'fruits vegetables', 'Pour grandir, il faut bien manger.|Les fruits et les légumes donnent de l’énergie.|L’eau est la meilleure boisson.|Quel fruit vas-tu manger aujourd’hui, {p} ?'],
    ['😴', 'Le sommeil', 'sleeping cat', 'Dormir, c’est très important.|Pendant la nuit, ton corps se repose et grandit.|Ton cerveau range tout ce que tu as appris.|Un enfant de cinq ans dort environ onze heures !'],
    ['🏃', 'Bouger', 'children playing outside', 'Bouger, c’est bon pour le corps et la tête.|Courir, sauter, danser, faire du vélo…|Le sport rend fort et de bonne humeur.|Allez, lève les bras et saute trois fois !']
  ],
  monde: [
    ['🗼', 'Paris', 'eiffel tower paris', 'Paris est la capitale de la France.|On y trouve la tour Eiffel, haute comme un immeuble de cent étages !|La Seine traverse la ville.|As-tu déjà vu la tour Eiffel, {p} ?'],
    ['🏜️', 'Le désert', 'camel sand dunes', 'Le désert est un endroit où il pleut très peu.|Il y a du sable à perte de vue, avec des dunes.|Le chameau peut marcher longtemps sans boire.|La nuit, dans le désert, il fait froid !'],
    ['🌴', 'La forêt tropicale', 'rainforest', 'La forêt tropicale est chaude et humide.|Il y vit des perroquets, des singes et des papillons géants.|Les arbres sont si hauts qu’il fait sombre en dessous.|C’est la maison de beaucoup d’animaux.'],
    ['🧊', 'La banquise', 'nasa:arctic sea ice icebridge', 'La banquise, c’est de l’eau de mer gelée.|Les ours polaires y vivent et chassent.|Il y fait très froid toute l’année.|Il faut protéger la banquise pour les animaux.'],
    ['🏰', 'Les châteaux', 'medieval castle', 'Autrefois, on construisait de grands châteaux en pierre.|Ils avaient des tours, des remparts et un pont-levis.|Les rois et les reines y habitaient.|Si tu avais un château, à quoi ressemblerait-il ?']
  ]
};

export const VIDEO_THEMES: Record<VideoTheme, { label: string; emoji: string }> = {
  animaux: { label: 'Animaux', emoji: '🐾' },
  nature: { label: 'Nature', emoji: '🌿' },
  espace: { label: 'Espace', emoji: '🚀' },
  metiers: { label: 'Métiers', emoji: '👷' },
  corps: { label: 'Mon corps', emoji: '💪' },
  monde: { label: 'Le monde', emoji: '🌍' }
};

const ordered: MiniVideo[] = (Object.keys(DATA) as VideoTheme[]).flatMap((theme) =>
  DATA[theme].map(([emoji, title, query, text], i) => ({
    id: `video-${theme}-${String(i + 1).padStart(2, '0')}`,
    theme,
    emoji,
    title,
    query,
    scenes: text.split('|').map((s) => s.trim())
  }))
);

/** Mélange régulier des thèmes, pour une suite de vidéos variée. */
export const VIDEOS: MiniVideo[] = (() => {
  const groups = new Map<VideoTheme, MiniVideo[]>();
  for (const v of ordered) groups.set(v.theme, [...(groups.get(v.theme) ?? []), v]);
  return [...groups.values()]
    .flatMap((g, gi) => g.map((v, i) => ({ v, key: (i + 0.5) / g.length, gi })))
    .sort((a, b) => a.key - b.key || a.gi - b.gi)
    .map((x) => x.v);
})();

/** La vidéo mise en avant aujourd'hui (change chaque jour). */
export function videoOfTheDay(day: string): MiniVideo {
  const n = Math.floor(Date.parse(day) / 86400000);
  return VIDEOS[((n % VIDEOS.length) + VIDEOS.length) % VIDEOS.length];
}
