/**
 * 50 mini-vidéos documentaires pour les 5-8 ans : 6 à 8 phrases narrées et animées + une vraie photo
 * (sous licence libre, via Openverse — voir scripts/fetch-video-images.ts).
 * Format : [emoji, titre, recherche photo, "phrase 1|…|phrase 8"]. {p} = prénom.
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
    ['🐧', 'Les manchots', 'penguins', 'Voici Pipo, un petit manchot. Il vit sur la glace, là où il fait très froid.|Pipo a des ailes, mais il ne vole pas.|Pourtant, dans l’eau, il nage très, très vite !|Ce soir, le vent souffle fort. Brrr, Pipo a froid.|Alors tous les manchots se serrent les uns contre les autres.|Bien au chaud au milieu du groupe, Pipo s’endort.|Et toi {p}, sais-tu marcher en te dandinant comme un manchot ?'],
    ['🐘', 'Les éléphants', 'elephant family', 'Voici Bou, un éléphant. C’est le plus gros animal qui marche sur la terre.|Bou a une longue trompe. À quoi sert-elle ?|Avec sa trompe, il peut sentir les fleurs.|Il peut aussi attraper une branche, comme avec une main.|Et il aspire l’eau pour boire, ou pour se faire une douche !|Le soir, Bou rejoint sa famille, qui prend soin des petits.|Et toi {p}, peux-tu faire une trompe avec ton bras ?'],
    ['🦒', 'Les girafes', 'giraffe', 'Voici Lili, une girafe. Elle a le cou le plus long de tous les animaux.|Lili a faim. Mais l’herbe ne lui fait pas envie.|Elle lève la tête, tout en haut de l’arbre.|Là, elle trouve les feuilles les plus tendres.|Elle les attrape avec sa longue langue violette.|Miam ! Lili mange les feuilles tout en haut, là où personne n’arrive.|Et toi {p}, mets-toi sur la pointe des pieds pour être grand comme Lili !'],
    ['🐝', 'Les abeilles', 'honey bee flower', 'Bzzz ! Voici Zia, une petite abeille travailleuse.|Ce matin, elle s’envole de la ruche.|Elle vole de fleur en fleur, toute la journée.|Dans chaque fleur, elle récolte un liquide sucré : le nectar.|De retour à la ruche, elle fabrique le miel avec ses amies.|En passant de fleur en fleur, elle aide aussi les fruits à pousser.|Et toi {p}, tu dis merci aux abeilles avec moi ?'],
    ['🐬', 'Les dauphins', 'dolphin jumping', 'Voici Flip, un dauphin qui vit dans la mer.|Flip nage vite, mais ce n’est pas un poisson.|De temps en temps, il doit remonter à la surface.|Pourquoi ? Pour respirer de l’air, comme nous !|Il siffle pour parler avec ses amis dauphins.|Et quand il est content, il saute très haut hors de l’eau !|Et toi {p}, tu sais siffler comme un dauphin ?'],
    ['🦋', 'Les papillons', 'butterfly flower', 'Sur une feuille, voici une petite chenille.|Elle a très faim : elle mange, elle mange, elle mange !|Puis elle s’enroule dans un cocon et s’endort.|Les jours passent… le cocon ne bouge pas.|Un matin, le cocon s’ouvre tout doucement.|Et un papillon aux belles couleurs s’envole !|Et toi {p}, quelles couleurs ont les papillons que tu as vus ?'],
    ['🐢', 'Les tortues', 'tortoise', 'Voici Tic, une tortue qui avance tout doucement.|Sur son dos, elle porte sa carapace : sa maison, qu’elle porte partout.|Oh ! Un bruit lui fait peur.|Vite, elle rentre la tête dans sa maison.|Quand tout est calme, elle ressort, et reprend sa route.|Certaines tortues vivent plus de cent ans !|Et toi {p}, tu peux marcher tout doucement comme Tic ?'],
    ['🦉', 'Les chouettes', 'owl', 'Le soleil se couche. Pendant que tu vas dormir, quelqu’un se réveille.|C’est Hou, une chouette. Elle vit la nuit.|Ses grands yeux ronds voient très bien dans le noir.|Elle peut tourner la tête presque jusque derrière elle.|Elle vole sans faire de bruit au-dessus de la forêt.|Au petit matin, elle rentre dormir dans son arbre.|Et toi {p}, sais-tu faire le cri de la chouette : hou hou ?'],
    ['🐄', 'La vache', 'cow meadow', 'Meuh ! Voici Rosette, une vache de la ferme.|Toute la journée, elle mange de l’herbe dans le pré.|Le soir, elle rentre à l’étable.|Rosette nous donne du lait.|Avec le lait, on fabrique le beurre, le yaourt et le fromage.|Rosette s’endort, bien au chaud dans la paille.|Et toi {p}, quel est ton fromage préféré ?'],
    ['🐿️', 'Les écureuils', 'squirrel', 'Voici Noisette, un écureuil qui vit dans les arbres.|Il saute de branche en branche, hop, hop !|Sa grande queue touffue l’aide à garder l’équilibre.|En automne, il cache des noisettes pour manger en hiver.|Mais parfois, il oublie où il les a cachées…|Et au printemps, un petit arbre pousse à cet endroit !|Et toi {p}, tu sais où tu caches tes trésors ?'],
    ['🦁', 'Les lions', 'lion cub', 'Voici la savane, en Afrique. Il fait chaud.|Sous un arbre, une famille de lions se repose.|Le papa lion a une grande crinière autour de la tête.|Les lionceaux jouent et se roulent dans l’herbe.|En jouant, ils apprennent à devenir grands.|Puis tout le monde fait la sieste : le lion dort presque toute la journée !|Et toi {p}, tu sais rugir comme le papa lion ?'],
    ['🐸', 'Les grenouilles', 'frog', 'Dans la mare, voici un tout petit têtard.|Il nage avec sa queue, comme un poisson.|Un jour, des pattes lui poussent.|Puis sa queue disparaît, petit à petit.|Le voilà devenu grenouille !|Avec sa longue langue, il attrape une mouche. Hop !|Et toi {p}, sais-tu sauter comme une grenouille ? Croâ !'],
    ['🐼', 'Les pandas', 'giant panda eating bamboo', 'Dans les montagnes de Chine vit un animal très doux.|C’est Mei, une panda géante, noire et blanche.|Mei a faim. Elle cherche sa plante préférée.|Ça y est : voici du bambou !|Elle passe presque toute la journée à manger du bambou.|Le panda est rare : il faut le protéger.|Et toi {p}, tu sais faire une roulade comme Mei ?'],
    ['🐞', 'Les coccinelles', 'ladybug', 'Voici Pois, une petite coccinelle rouge à points noirs.|Elle se promène sur une feuille du jardin.|Oh, des pucerons ! Ils abîment les plantes.|Pois les mange, un par un. Miam !|Les plantes du jardin sont sauvées.|C’est pour ça que les jardiniers adorent les coccinelles.|Et toi {p}, combien de points vois-tu sur Pois ?'],
    ['🐳', 'Les baleines', 'humpback whale breaching', 'Dans l’océan nage le plus grand animal du monde : la baleine.|Elle est plus grande qu’un autobus !|Elle remonte à la surface pour respirer.|Elle respire par un trou sur sa tête…|… et pfffou ! Elle fait un grand jet d’eau.|Pour se parler, les baleines chantent, très loin dans l’océan.|Et toi {p}, tu sais chanter comme une baleine ?']
  ],
  nature: [
    ['🌳', 'Les arbres', 'green tree meadow', 'Voici un grand arbre, calme et tranquille, au milieu du pré.|Sous la terre, ses racines s’étirent comme de longs doigts.|Elles boivent l’eau cachée dans la terre.|L’eau monte doucement dans le tronc, jusqu’aux feuilles.|Et les feuilles fabriquent l’air que nous respirons.|Un oiseau vient se poser sur une branche pour se reposer.|Et toi {p}, tu feras un câlin à un arbre la prochaine fois ?'],
    ['🌈', 'L’arc-en-ciel', 'rainbow landscape', 'Il pleut, mais le soleil sort de derrière un nuage.|Ses rayons traversent les gouttes de pluie.|Et tout à coup, un arc-en-ciel apparaît dans le ciel !|Il a sept couleurs, toujours dans le même ordre.|Rouge, orange, jaune, vert…|… puis bleu, indigo et violet.|Et toi {p}, peux-tu dire les sept couleurs avec moi ?'],
    ['🌊', 'La mer', 'ocean waves beach', 'Voici la mer, immense et bleue. Son eau est salée.|Les vagues vont et viennent sur la plage : chhh… chhh…|C’est le vent qui pousse les vagues.|Et la Lune, de très loin, fait monter et descendre la mer.|Dans l’eau vivent des poissons, des crabes et des coquillages.|Un petit crabe marche de côté sur le sable mouillé.|Et toi {p}, tu fais le bruit des vagues avec moi ?'],
    ['🌋', 'Les volcans', 'volcano landscape', 'Voici une montagne pas comme les autres : un volcan.|Tout en haut, il y a un grand trou.|Parfois, le volcan gronde : grrr…|Et de la lave très chaude en sort, orange et brillante.|En refroidissant, la lave devient de la roche dure.|Petit à petit, le volcan fabrique de nouvelles terres.|Et toi {p}, tu sais faire le bruit du volcan ?'],
    ['❄️', 'La neige', 'snow covered trees', 'Brrr, il fait très froid ce matin.|Dans le ciel, la pluie se transforme en neige.|Des flocons tombent tout doucement, en tournant.|Chaque flocon a une forme unique, jamais deux pareils.|Le jardin devient tout blanc.|On peut faire un bonhomme de neige et des glissades.|Et toi {p}, tu n’oublies pas ton bonnet et tes gants ?'],
    ['🍂', 'L’automne', 'autumn leaves', 'Voici l’automne. L’air devient plus frais.|Sur les arbres, les feuilles changent de couleur.|Elles deviennent jaunes, oranges et rouges.|Puis le vent souffle, et elles tombent en tournant.|Par terre, elles font un tapis qui craque sous les pieds.|C’est aussi la saison des châtaignes et des champignons.|Et toi {p}, tu aimes sauter dans les tas de feuilles ?'],
    ['🌷', 'Le printemps', 'spring flowers', 'Voici le printemps : la nature se réveille.|Les journées deviennent plus longues et plus douces.|Sur les arbres, de petits bourgeons s’ouvrent.|Partout, des fleurs poussent dans l’herbe.|Un oiseau ramasse des brindilles.|Les oiseaux construisent un nid pour leurs futurs petits.|Et toi {p}, tu as déjà vu un nid d’oiseau ?'],
    ['🌧️', 'La pluie', 'rain drops', 'D’où vient la pluie ? Regardons ensemble.|Le soleil chauffe l’eau de la mer.|L’eau monte dans le ciel, toute légère, et forme des nuages.|Les nuages grossissent, deviennent gris et lourds.|Alors il pleut : plic, ploc, plic !|La pluie fait boire les plantes et remplit les rivières.|Et toi {p}, tu aimes écouter la pluie ?'],
    ['⛰️', 'Les montagnes', 'mountains landscape', 'Voici les montagnes, très hautes, avec de la neige au sommet.|Au pied de la montagne, on commence à marcher.|On croise une marmotte qui siffle, et un chamois qui saute.|Il faut beaucoup marcher pour monter tout en haut.|Plus on monte, plus il fait frais.|Enfin, le sommet ! De là-haut, la vue est magnifique.|Et toi {p}, tu aimerais grimper tout en haut d’une montagne ?'],
    ['🌻', 'Les fleurs', 'colorful flowers', 'Dans le jardin, des fleurs s’ouvrent au soleil.|Elles ont toutes sortes de couleurs et de parfums.|Une abeille arrive, attirée par le parfum.|Puis un papillon se pose sur une fleur rouge.|Les abeilles et les papillons aident les fleurs.|Et après la fleur, souvent, arrive un fruit !|Et toi {p}, quelle est ta fleur préférée ?']
  ],
  espace: [
    ['🌙', 'La Lune', 'full moon', 'Regarde là-haut : c’est la Lune !|La Lune tourne autour de la Terre, tout doucement.|Elle ne fait pas de lumière toute seule.|Elle renvoie celle du Soleil, comme un grand miroir.|Certains soirs, elle est toute ronde. D’autres soirs, c’est un fin croissant.|Un jour, des astronautes ont marché sur la Lune !|Et toi {p}, ce soir, tu regarderas la forme de la Lune ?'],
    ['☀️', 'Le Soleil', 'sunrise sun sky', 'Chaque matin, une grande lumière se lève : c’est le Soleil.|Le Soleil est une étoile, très grande et très chaude.|Il nous donne la lumière pour voir, et la chaleur pour avoir chaud.|Grâce à lui, les plantes poussent et les fruits mûrissent.|Le soir, il se couche, et la nuit arrive.|Attention : on ne le regarde jamais directement, cela abîme les yeux.|Et toi {p}, tu aimes jouer au soleil avec ta casquette ?'],
    ['🪐', 'Les planètes', 'saturn planet', 'Au centre, il y a le Soleil. Et autour, des planètes tournent.|Combien sont-elles ? Huit planètes, comme une ronde.|Voici la Terre, notre planète bleue, avec des plantes et des animaux.|Mars est toute rouge, comme de la rouille.|Jupiter est la plus grosse de toutes.|Et Saturne porte de beaux anneaux autour d’elle.|Et toi {p}, tu peux compter jusqu’à huit avec moi ?'],
    ['🚀', 'Les fusées', 'rocket launch', 'Voici une grande fusée, toute droite, prête à partir.|Pour aller dans l’espace, il faut aller très, très haut.|Les astronautes montent à bord et s’attachent bien.|Trois… deux… un… décollage !|La fusée pousse très fort avec du feu, et elle monte.|Bientôt, elle traverse les nuages et arrive dans l’espace.|Et toi {p}, plus tard, tu veux être astronaute ?'],
    ['👩‍🚀', 'Les astronautes', 'astronaut space station', 'Voici Sam, un astronaute, dans la station spatiale.|Ici, tout flotte : c’est l’apesanteur.|Même les gouttes d’eau flottent, comme des petites billes !|Sam dort attaché, pour ne pas s’envoler pendant la nuit.|Pour sortir, il met une grosse combinaison blanche.|Par la fenêtre, il voit la Terre toute ronde.|Et toi {p}, tu aimerais flotter comme Sam ?'],
    ['⭐', 'Les étoiles', 'starry night sky', 'La nuit tombe. Regarde le ciel : il est plein d’étoiles !|Les étoiles brillent comme de petites lumières.|En fait, ce sont des soleils très lointains.|Certaines étoiles forment des dessins : les constellations.|Celle-ci ressemble à une grande casserole.|Les étoiles brillent toute la nuit, jusqu’au matin.|Et toi {p}, ce soir, tu essaieras de compter les étoiles ?'],
    ['🌍', 'La Terre', 'nasa:blue marble earth', 'Voici la Terre, vue de très loin dans l’espace.|Elle est bleue et blanche.|Le bleu, ce sont les océans.|Le blanc, ce sont les nuages.|La Terre tourne sur elle-même : c’est le jour, puis la nuit.|C’est notre maison, à tous : prenons-en soin.|Et toi {p}, comment peux-tu prendre soin de la Terre ?'],
    ['🌌', 'Les aurores', 'aurora borealis', 'Très loin au nord, près du pôle Nord, la nuit est longue.|Il fait froid, et tout est calme.|Et soudain, le ciel se met à danser !|Des lumières vertes, roses et violettes ondulent.|On les appelle des aurores.|C’est un des plus beaux spectacles de la nature.|Et toi {p}, de quelle couleur serait ton aurore ?']
  ],
  metiers: [
    ['🚒', 'Les pompiers', 'fire truck', 'Pin-pon, pin-pon ! Voici le camion rouge des pompiers.|Dans une maison, un feu s’est allumé dans la cuisine.|Les pompiers arrivent vite, avec leur casque et leur grande échelle.|Avec un long tuyau, ils arrosent le feu jusqu’à l’éteindre.|Ils aident aussi les personnes blessées.|En France, pour appeler les pompiers, on fait le 18.|Et toi {p}, tu peux répéter avec moi : un, huit, le 18 ?'],
    ['👩‍⚕️', 'Le médecin', 'stethoscope', 'Aujourd’hui, Nina tousse un peu. Elle va chez le médecin.|Le médecin lui sourit et lui dit bonjour.|Avec son stéthoscope, il écoute son cœur : boum, boum.|Puis il regarde sa gorge : dis « ah » !|Il donne un sirop pour qu’elle guérisse vite.|Quelques jours plus tard, Nina est en pleine forme.|Et toi {p}, tu sais que le médecin est là pour t’aider ?'],
    ['👨‍🌾', 'L’agriculteur', 'farm tractor field', 'Cocorico ! Le jour se lève sur la ferme.|Voici l’agriculteur. Il cultive les champs.|Il sème le blé, et l’arrose en attendant qu’il pousse.|Dans le potager, il fait pousser des légumes et des fruits.|Il donne aussi à manger aux vaches et aux poules.|Grâce à lui, nous avons du pain, des légumes et du lait.|Et toi {p}, quel légume aimerais-tu faire pousser ?'],
    ['🥖', 'Le boulanger', 'bread bakery', 'Il fait encore nuit, mais le boulanger est déjà réveillé.|Il prend de la farine, de l’eau, du sel et de la levure.|Il mélange et pétrit la pâte avec ses mains.|La pâte gonfle doucement, comme un ballon.|Puis il la met dans le four bien chaud.|Le matin, le pain et les croissants sont prêts. Miam !|Et toi {p}, tu préfères le pain ou les croissants ?'],
    ['📚', 'La maîtresse', 'classroom books', 'Ding ! C’est l’heure de l’école.|Voici la maîtresse. Elle dit bonjour à chaque enfant.|Avec elle, les enfants apprennent à lire et à compter.|On dessine, on chante, on découvre plein de choses.|Quand un enfant a du mal, elle l’aide avec patience.|À la fin de la journée, tout le monde a grandi un peu.|Et toi {p}, qu’as-tu appris d’amusant cette semaine ?'],
    ['🚌', 'Le chauffeur de bus', 'yellow school bus road', 'Tut tut ! Voici le bus, et sa chauffeuse, Mona.|Mona conduit le bus en toute sécurité.|À chaque arrêt, elle ouvre les portes pour que les gens montent.|Dans le bus, on dit bonjour, et on reste assis.|Le bus traverse la ville, d’arrêt en arrêt.|Terminus : tout le monde descend. Merci Mona !|Et toi {p}, tu dis bonjour quand tu montes dans le bus ?'],
    ['🔬', 'Les scientifiques', 'microscope science', 'Voici Lou, une scientifique. Elle veut comprendre le monde.|Elle se pose une question : pourquoi les plantes poussent-elles ?|D’abord, elle observe, avec beaucoup d’attention.|Puis elle fait des expériences : une plante au soleil, une à l’ombre.|Avec son microscope, elle voit des choses minuscules.|Elle a trouvé : les plantes ont besoin de lumière !|Et toi {p}, tu es scientifique quand tu demandes « pourquoi ? »']
  ],
  corps: [
    ['🦷', 'Les dents', 'none', 'Ouvre grand la bouche : voici tes dents !|Elles servent à croquer une pomme et à mâcher ton repas.|Tes petites dents de lait tomberont un jour.|Ne t’inquiète pas : de nouvelles dents plus solides pousseront.|Pour les garder belles, il faut les brosser.|Le matin et le soir, on brosse doucement, en faisant des petits ronds.|Et toi {p}, tu te brosses les dents matin et soir ?'],
    ['❤️', 'Le cœur', 'none', 'Pose ta main sur ta poitrine. Tu sens quelque chose ?|C’est ton cœur, un muscle qui travaille pour toi.|Il bat tout le temps, même la nuit quand tu dors.|À chaque battement, il envoie le sang partout dans ton corps.|Quand tu cours, il bat plus vite : boum boum boum !|Quand tu te reposes, il ralentit tout doucement.|Et toi {p}, tu sens ton cœur battre en ce moment ?'],
    ['🍎', 'Bien manger', 'fruits vegetables', 'Pour grandir et avoir de l’énergie, il faut bien manger.|Voici une assiette de toutes les couleurs.|Les légumes et les fruits donnent de la force à ton corps.|Le pain et les pâtes t’aident à courir et à jouer.|Et pour boire, la meilleure boisson, c’est l’eau.|Un grand verre d’eau, et c’est reparti !|Et toi {p}, quel fruit vas-tu manger aujourd’hui ?'],
    ['😴', 'Le sommeil', 'sleeping cat', 'Bâillement… c’est l’heure d’aller dormir.|Pendant la nuit, ton corps se repose et grandit.|Ton cerveau, lui, range tout ce que tu as appris.|Les rêves arrivent, tout doux.|Un enfant de cinq ans dort environ onze heures !|Le matin, tu te réveilles plein d’énergie.|Et toi {p}, quel est ton doudou pour dormir ?'],
    ['🏃', 'Bouger', 'children playing outside', 'Bouger, c’est bon pour le corps et pour la tête.|On peut courir, sauter, danser, ou faire du vélo.|Quand on bouge, le cœur bat plus vite.|Les muscles deviennent forts.|Et on est de bonne humeur !|Après, on boit un peu d’eau, et on se repose.|Et toi {p}, tu peux lever les bras et sauter trois fois ?']
  ],
  monde: [
    ['🗼', 'Paris', 'eiffel tower paris', 'Bienvenue à Paris, la capitale de la France !|Une grande rivière traverse la ville : c’est la Seine.|Des bateaux glissent doucement sur l’eau, sous les ponts.|Et là-bas, toute en fer, voici la tour Eiffel !|Elle est haute comme un immeuble de cent étages.|Le soir, elle s’allume et scintille comme des étoiles.|Et toi {p}, as-tu déjà vu la tour Eiffel ?'],
    ['🏜️', 'Le désert', 'camel sand dunes', 'Voici le désert, un endroit où il ne pleut presque jamais.|Du sable partout, et de grandes dunes qui ressemblent à des vagues.|Un chameau avance lentement, avec ses deux bosses.|Il peut marcher très longtemps sans boire.|Le jour, il fait très chaud sous le soleil.|Mais la nuit, dans le désert, il fait froid !|Et toi {p}, tu aimerais faire une balade à dos de chameau ?'],
    ['🌴', 'La forêt tropicale', 'rainforest', 'Voici la forêt tropicale, chaude et humide.|Ici, les arbres sont très hauts, plus hauts que des maisons.|Tout en haut, un singe saute de branche en branche.|Un perroquet de toutes les couleurs chante : coco !|En dessous, il fait sombre et frais.|C’est la maison de beaucoup d’animaux.|Et toi {p}, quel animal de la forêt aimerais-tu rencontrer ?'],
    ['🧊', 'La banquise', 'nasa:arctic sea ice icebridge', 'Voici la banquise, très loin au nord.|C’est de l’eau de mer gelée, blanche et brillante.|Il y fait très froid toute l’année.|Un ours polaire marche sur la glace avec son petit.|Ils cherchent à manger près de l’eau.|Il faut protéger la banquise pour que les ours polaires restent chez eux.|Et toi {p}, tu sais marcher comme un ours polaire ?'],
    ['🏰', 'Les châteaux', 'medieval castle', 'Il y a très longtemps, on construisait de grands châteaux en pierre.|Voici un château, avec ses tours et ses remparts.|Tout autour, il y a de l’eau pour le protéger.|Pour entrer, on baisse le pont-levis… clac !|On entre par le pont-levis, et voici la cour du château.|Les rois et les reines habitaient ici.|Et toi {p}, si tu avais un château, à quoi ressemblerait-il ?']
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
