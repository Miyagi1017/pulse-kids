/**
 * Les 66 petits dessins animés du catalogue Pulse Kids : un titre, son style (celui du catalogue),
 * son héros, son décor et quatre phrases courtes tirées de l'« Action » du catalogue.
 * Ils sont rendus en code comme les vidéos du jour (videoScene.ts) et se rangent dans la rubrique Vidéos.
 */
import type { Objet } from '../data/comptines';
import type { StyleId } from '../kits/styles';
import type { Board } from './videoScene';
import type { HeroName, VideoDecor } from './heroes';

export interface Capsule {
  id: string;
  title: string;
  emoji: string;
  style: StyleId;
  board: Board;
  /** Les 4 phrases narrées (la dernière pose une question à l'enfant). */
  scenes: string[];
}

type Row = [string, StyleId, HeroName, VideoDecor, Objet[], string, string, string, string];

const ROWS: Row[] = [
  ['Info Enfants', 'caption-news', 'soleil', 'ciel', ['nuage', 'goutte', 'nuage'], 'Bonjour {p}, voici les nouvelles du jour !', 'Ce matin, le soleil brille très fort.', 'Cet après-midi, quelques nuages passent.', 'Et toi, quel temps fait-il chez toi ?'],
  ['Journal Vintage', 'newsreel', 'bouger', 'ville', ['etoile', 'nuage', 'oiseau'], 'Voici un vieux film, tout en noir et blanc.', 'Il y a cent ans, les enfants jouaient déjà.', 'Ils sautaient à la corde : un, deux, trois, hop !', 'Et toi {p}, tu sais sauter à la corde ?'],
  ['Compte à Rebours Fusée', 'countdown', 'fusee', 'espace', ['etoile', 'lune', 'etoile'], 'La fusée est prête à partir.', 'On compte avec elle : trois, deux, un…', 'Décollage ! La fusée monte doucement vers les étoiles.', 'Et toi {p}, où irais-tu avec une fusée ?'],
  ['Symphonie du Temps', 'city-symphony', 'etoile', 'ville', ['etoile', 'lune', 'nuage'], 'Le soleil se lève sur la petite ville.', 'Les heures passent comme une musique.', 'La nuit arrive, et les étoiles s’allument une à une.', 'Et toi {p}, tu préfères le jour ou la nuit ?'],
  ['Enquête du Doudou', 'visual-investigation', 'dodo', 'chambre', ['etoile', 'coeur', 'etoile'], 'Oh non, le doudou a disparu !', 'On cherche les indices, un par un.', 'Ding ! Le doudou était caché sous le lit.', 'Et toi {p}, comment s’appelle ton doudou ?'],
  ['Construire Ensemble', 'constructivist', 'tourblocs', 'ville', ['cube', 'etoile', 'cube'], 'Voici des blocs rouges, jaunes et bleus.', 'Chacun apporte son bloc.', 'Les blocs s’assemblent et forment une grande tour !', 'Et toi {p}, tu construirais quoi avec des blocs ?'],
  ['Course des Animaux', 'telestrator', 'tortue', 'jardin', ['etoile', 'fleur', 'etoile'], 'C’est la grande course du lapin et de la tortue.', 'Le lapin court très vite, puis il s’arrête.', 'La tortue avance doucement, sans s’arrêter… et elle gagne !', 'Et toi {p}, tu es plutôt lapin ou tortue ?'],
  ['Météo des Petits', 'news-package', 'pluie', 'ville', ['goutte', 'soleil', 'nuage'], 'Voici la météo des petits.', 'Ici, il pleut : prends ton parapluie.', 'Là-bas, le soleil revient et sèche les flaques.', 'Et toi {p}, tu aimes sauter dans les flaques ?'],
  ['Terre depuis l’Espace', 'satellite-briefing', 'terre', 'espace', ['lune', 'etoile', 'nuage'], 'Voici notre planète, vue de très haut.', 'Le bleu, c’est la mer. Le vert, ce sont les forêts.', 'On s’approche d’une forêt, puis d’une montagne.', 'Et toi {p}, tu habites près de la mer ou des montagnes ?'],
  ['Pont de Blocs', 'briefing-board', 'tourblocs', 'ecole', ['cube', 'etoile', 'cube'], 'Il faut construire un pont pour traverser la rivière.', 'Un pont en bois, ou un pont en pierre ?', 'Le pont en pierre est le plus solide. Bravo !', 'Et toi {p}, tu as déjà traversé un pont ?'],
  ['Chasse aux Formes', 'lidar-survey', 'ours', 'ciel', ['etoile', 'flocon', 'etoile'], 'Dans le noir, des petits points s’allument.', 'Ils dessinent une forme… qu’est-ce que c’est ?', 'C’est un ours, tout en points lumineux !', 'Et toi {p}, quel animal aimerais-tu voir en points ?'],
  ['Ville en Construction', 'white-model', 'tourblocs', 'ville', ['nuage', 'oiseau', 'etoile'], 'Voici une ville toute blanche, comme une maquette.', 'La lumière lui donne des couleurs.', 'Des arbres et des maisons apparaissent partout !', 'Et toi {p}, de quelle couleur serait ta maison ?'],
  ['Poussée de la Plante', 'data-physical', 'tournesol', 'jardin', ['goutte', 'soleil', 'goutte'], 'On a planté une graine.', 'Chaque jour, elle grandit un petit peu.', 'Jour après jour, elle devient une grande fleur !', 'Et toi {p}, tu as déjà planté une graine ?'],
  ['Voiture Démontée', 'teardown', 'camion', 'chambre', ['etoile', 'cube', 'etoile'], 'Comment est faite une petite voiture ?', 'Elle se sépare : les roues, le dessous, la carrosserie.', 'Clic, clic, clic : elle se remonte toute seule !', 'Et toi {p}, tu aimes démonter et remonter tes jouets ?'],
  ['Goutte d’Eau', 'microscope', 'bulle', 'ocean', ['bulle', 'goutte', 'bulle'], 'Voici une toute petite goutte d’eau.', 'On regarde de très près, au microscope.', 'Dedans, de minuscules formes dansent !', 'Et toi {p}, qu’est-ce que tu aimerais regarder de très près ?'],
  ['Photo de Famille', 'archive-lighttable', 'coeur', 'chambre', ['etoile', 'coeur', 'etoile'], 'Voici une très vieille photo.', 'On la regarde avec une loupe.', 'Oh ! C’est un bébé qui sourit.', 'Et toi {p}, tu as vu des photos de toi bébé ?'],
  ['Lune Endormie', 'crayon', 'lune', 'nuit', ['etoile', 'etoile', 'nuage'], 'La Lune est toute ronde, mais elle n’arrive pas à dormir.', 'Léo monte sur le toit et chante tout doux.', 'La Lune ferme les yeux et devient un croissant.', 'Et toi {p}, quelle chanson te fait dormir ?'],
  ['Voyage de la Pluie', 'watercolor', 'pluie', 'jardin', ['goutte', 'fleur', 'goutte'], 'Un nuage gris passe au-dessus du jardin.', 'Il fait tomber une douce pluie.', 'La pluie colore tout le paysage en vert.', 'Et toi {p}, qu’est-ce qui pousse quand il pleut ?'],
  ['Panda et Bambou', 'ink-wash', 'panda', 'foret', ['feuille', 'feuille', 'nuage'], 'Voici un panda peint à l’encre.', 'Il a très faim.', 'Il croque une tige de bambou. Miam !', 'Et toi {p}, quel est ton repas préféré ?'],
  ['Arc-en-ciel', 'impasto', 'arcenciel', 'ciel', ['nuage', 'soleil', 'goutte'], 'Le ciel est tout gris.', 'Un grand coup de pinceau rouge apparaît…', 'Puis toutes les couleurs : voici un arc-en-ciel !', 'Et toi {p}, quelle est ta couleur préférée ?'],
  ['Dessine un Chat', 'one-line', 'chat', 'jardin', ['papillon', 'fleur', 'etoile'], 'Avec un seul trait de crayon, on dessine…', 'Les oreilles, puis la tête…', 'Et la queue ! Voici un chat.', 'Et toi {p}, tu sais dessiner un chat ?'],
  ['Comment Poussent les Plantes', 'whiteboard', 'tournesol', 'ecole', ['goutte', 'soleil', 'feuille'], 'Le feutre dessine une petite graine.', 'Sous la terre, des racines poussent.', 'Puis une tige sort… et une fleur s’ouvre !', 'Et toi {p}, de quoi une plante a-t-elle besoin ?'],
  ['Mon Quartier', 'urban-sketch', 'bus', 'ville', ['oiseau', 'nuage', 'fleur'], 'Voici mon quartier, dessiné au stylo.', 'Le vent passe et colorie les maisons.', 'Puis les arbres deviennent tout verts.', 'Et toi {p}, qu’est-ce qu’il y a dans ton quartier ?'],
  ['Apprendre les Lettres', 'chalkboard', 'livres', 'ecole', ['etoile', 'pomme', 'note'], 'Sur le tableau, il y a un gribouillage.', 'La craie l’efface… et trace la lettre A.', 'Le A devient une montagne !', 'Et toi {p}, par quelle lettre commence ton prénom ?'],
  ['La Fraise Partagée', 'shadow-puppet', 'coccinelle', 'jardin', ['pomme', 'feuille', 'fleur'], 'La fourmi et la coccinelle trouvent une fraise.', 'Toutes les deux la veulent.', 'Elles la coupent en deux et la partagent !', 'Et toi {p}, avec qui aimes-tu partager ?'],
  ['Grenouille et Lotus', 'ukiyoe', 'grenouille', 'jardin', ['fleur', 'goutte', 'feuille'], 'Sur l’étang flottent des feuilles de lotus.', 'Une petite grenouille se prépare.', 'Hop ! Elle saute d’une feuille à l’autre.', 'Et toi {p}, tu sais sauter comme une grenouille ?'],
  ['Dragon du Nouvel An', 'papercut-red', 'lion', 'ville', ['etoile', 'coeur', 'etoile'], 'C’est la fête du Nouvel An !', 'Les tambours font boum, boum, boum.', 'Le dragon de papier rouge danse dans la rue.', 'Et toi {p}, tu aimes danser quand c’est la fête ?'],
  ['Train de Nuit', 'paper-lantern', 'train', 'nuit', ['etoile', 'lune', 'etoile'], 'Le petit train roule dans la nuit.', 'Tchou tchou ! Il entre dans un tunnel.', 'Les fenêtres s’éteignent une à une : tout le monde dort.', 'Et toi {p}, tu as déjà pris le train ?'],
  ['Balade à Vélo', 'risograph', 'bus', 'ville', ['oiseau', 'fleur', 'nuage'], 'Dring dring ! C’est l’heure de la balade.', 'On traverse la ville.', 'À chaque arrêt, une nouvelle couleur apparaît.', 'Et toi {p}, tu sais faire du vélo ?'],
  ['Enquête du Jouet Perdu', 'halftone-dossier', 'chat', 'chambre', ['etoile', 'cube', 'etoile'], 'Un jouet a disparu !', 'Le chat est soupçonné… Est-ce lui ?', 'Non, le chat est innocent. Le jouet était dans le coffre !', 'Et toi {p}, où ranges-tu tes jouets ?'],
  ['La Petite Cloche', 'woodcut', 'cloche', 'neige', ['flocon', 'flocon', 'etoile'], 'Dans le village, il neige depuis longtemps.', 'Les villageois fabriquent une cloche.', 'Ding dong ! La cloche sonne et la neige s’arrête.', 'Et toi {p}, tu aimes la neige ?'],
  ['L’Abeille Sympathique', 'engraving', 'abeille', 'jardin', ['fleur', 'fleur', 'papillon'], 'Sur une grande page, une abeille se dessine.', 'Ligne par ligne, on voit ses ailes et ses rayures.', 'Bzzz ! Elle s’envole vers les fleurs.', 'Et toi {p}, tu sais faire bzzz comme une abeille ?'],
  ['Voyage au Zoo', 'silkscreen-poster', 'girafe', 'savane', ['oiseau', 'soleil', 'feuille'], 'Voici un ticket pour le zoo !', 'Le ticket se transforme en paysage.', 'Voici la girafe, avec son très long cou.', 'Et toi {p}, quel animal veux-tu voir au zoo ?'],
  ['Retour des Oiseaux', 'printed-long-take', 'montagne', 'ciel', ['oiseau', 'oiseau', 'nuage'], 'Le printemps revient.', 'Les oiseaux rentrent de leur long voyage.', 'Ils volent ensemble au-dessus de la vallée.', 'Et toi {p}, tu entends les oiseaux chanter le matin ?'],
  ['Trier les Formes', 'swiss-motion', 'tourblocs', 'ecole', ['cube', 'etoile', 'balle'], 'Voici des ronds, des carrés et des triangles.', 'Chaque forme cherche sa boîte.', 'Clic ! Tout est bien rangé.', 'Et toi {p}, tu connais d’autres formes ?'],
  ['Trouver la Clé', 'spy-titles', 'chateau', 'ciel', ['etoile', 'nuage', 'etoile'], 'Chut… c’est une mission secrète.', 'Des formes bougent et se rassemblent.', 'Elles forment une clé dorée qui ouvre le château !', 'Et toi {p}, quel trésor cacherais-tu ?'],
  ['Carte de Merci', 'art-deco', 'coeur', 'chambre', ['coeur', 'etoile', 'coeur'], 'On plie une jolie feuille.', 'On dessine un grand cœur dessus.', 'Et on la donne à un ami : merci !', 'Et toi {p}, à qui voudrais-tu dire merci ?'],
  ['Avion en Papier', 'blueprint', 'avion', 'ciel', ['nuage', 'oiseau', 'nuage'], 'Voici le plan d’un avion en papier.', 'On plie la feuille, étape par étape.', 'Et l’avion s’envole très loin !', 'Et toi {p}, tu sais plier un avion en papier ?'],
  ['Soleil du Matin', 'stained-glass', 'chateau', 'ciel', ['soleil', 'oiseau', 'etoile'], 'Le soleil du matin traverse le vitrail.', 'Les couleurs s’allument une à une.', 'Elles racontent l’histoire d’un gentil chevalier.', 'Et toi {p}, quelles couleurs mettrais-tu sur un vitrail ?'],
  ['Parapluie Perdu', 'pictogram-motion', 'pluie', 'ville', ['goutte', 'nuage', 'goutte'], 'Un parapluie attend tout seul sur une étagère.', 'Plic, ploc… il commence à pleuvoir.', 'Le parapluie s’ouvre et protège tout le monde !', 'Et toi {p}, de quelle couleur est ton parapluie ?'],
  ['Robot Dit Bonjour', 'ascii-crt', 'robot', 'chambre', ['etoile', 'etoile', 'cube'], 'Bip bip ! Un petit robot se réveille.', 'Il dessine sur son écran avec des lettres.', 'Voici un grand sourire : bonjour !', 'Et toi {p}, comment dis-tu bonjour ?'],
  ['Changement des Saisons', 'dataviz', 'automne', 'foret', ['feuille', 'flocon', 'fleur'], 'L’été, l’arbre est tout vert.', 'L’automne, il devient orange.', 'L’hiver, tout devient blanc.', 'Et toi {p}, quelle saison préfères-tu ?'],
  ['De la Graine à la Pomme', 'iso-infographic', 'arbre', 'jardin', ['goutte', 'soleil', 'pomme'], 'On plante une graine dans la terre.', 'On l’arrose, le soleil la réchauffe.', 'Elle devient un pommier plein de pommes !', 'Et toi {p}, tu aimes les pommes ?'],
  ['Ranger les Jouets', 'dark-keynote', 'tourblocs', 'chambre', ['cube', 'balle', 'etoile'], 'Oh là là, les jouets sont partout !', 'On les range un par un dans les boîtes.', 'Voilà, la chambre est toute propre.', 'Et toi {p}, tu aides à ranger ta chambre ?'],
  ['Tutoriel Dessin', 'living-screencast', 'soleil', 'ciel', ['nuage', 'fleur', 'oiseau'], 'Aujourd’hui, on apprend à dessiner.', 'On choisit une couleur : le jaune.', 'On trace un rond… c’est un soleil !', 'Et toi {p}, qu’est-ce que tu aimes dessiner ?'],
  ['Scan du Robot', 'hologram-hud', 'robot', 'espace', ['etoile', 'etoile', 'lune'], 'Un rayon bleu scanne un robot jouet.', 'Voici ses roues… et voici ses bras.', 'Scan terminé : c’est un robot très gentil !', 'Et toi {p}, ton robot saurait faire quoi ?'],
  ['Bus vers le Parc', 'transit-map', 'bus', 'ville', ['fleur', 'oiseau', 'soleil'], 'Le bus part de la station Maison.', 'Il passe par la rue et par le pont.', 'Terminus : la station Parc !', 'Et toi {p}, qu’est-ce que tu fais au parc ?'],
  ['File d’Attente Animaux', 'isometric-picture-book', 'bus', 'jardin', ['fleur', 'papillon', 'etoile'], 'Les animaux attendent le bus.', 'Le lapin est premier, l’ours est deuxième.', 'Chacun son tour, ils montent dans le bus !', 'Et toi {p}, tu sais attendre ton tour ?'],
  ['Énergie du Jouet', 'circuit-board', 'robot', 'chambre', ['etoile', 'etoile', 'cube'], 'Le jouet ne bouge plus.', 'La lumière part de la pile et voyage dans les fils.', 'Elle arrive aux roues : le jouet s’allume !', 'Et toi {p}, quel jouet marche avec des piles ?'],
  ['Danse des Chaussettes', 'rubber-hose', 'bouger', 'chambre', ['note', 'etoile', 'note'], 'Trois chaussettes se réveillent.', 'Elles sautent en rythme : un, deux, trois !', 'Et elles dansent toutes ensemble.', 'Et toi {p}, tu danses avec elles ?'],
  ['Livraison Étoilée', 'cel-anime-80s', 'etoile', 'nuit', ['etoile', 'lune', 'etoile'], 'La nuit est toute violette.', 'Une fille à vélo transporte une étoile filante.', 'Elle la livre au-dessus de la ville endormie.', 'Et toi {p}, à qui donnerais-tu une étoile ?'],
  ['Robot Rigolo', 'scifi-toon', 'robot', 'espace', ['etoile', 'fusee', 'etoile'], 'Un robot ouvre un portail magique.', 'Il entre dedans… on attend…', 'Il ressort avec un gros gâteau !', 'Et toi {p}, quel gâteau aimerais-tu ?'],
  ['Assembler l’Aspirateur', 'midcentury-toon', 'robot', 'chambre', ['etoile', 'cube', 'etoile'], 'Voici un aspirateur jouet.', 'Première étape : on branche le tuyau.', 'Deuxième étape : on appuie sur le bouton. Vroum !', 'Et toi {p}, tu aides à faire le ménage ?'],
  ['Trouver le Jouet', 'pixel-rpg', 'arbre', 'foret', ['etoile', 'feuille', 'etoile'], 'Le héros cherche un jouet caché.', 'Il regarde derrière un buisson…', 'Pop ! Le jouet était là !', 'Et toi {p}, où est ta meilleure cachette ?'],
  ['Flamme du Phare', 'hd-2d', 'phare', 'plage', ['nuage', 'goutte', 'oiseau'], 'C’est la tempête, le phare s’est éteint.', 'Une fille monte avec une petite flamme.', 'Le phare se rallume et guide les bateaux !', 'Et toi {p}, tu as déjà vu un phare ?'],
  ['Taper dans les Mains', 'microgame', 'etoile', 'ciel', ['etoile', 'ballon', 'etoile'], 'Une étoile apparaît !', 'Vite, tape dans tes mains !', 'Bravo ! Des confettis tombent partout.', 'Et toi {p}, tu peux taper encore plus fort ?'],
  ['Quiz des Animaux', 'game-show', 'vache', 'ferme', ['etoile', 'fleur', 'etoile'], 'Bienvenue au quiz des animaux !', 'Voici un animal : quel est son cri ?', 'Meuh ! C’est la vache. Un point de plus !', 'Et toi {p}, tu sais faire le cri du chien ?'],
  ['Partager la Pomme', 'silent-film', 'arbre', 'jardin', ['pomme', 'oiseau', 'nuage'], 'Une pomme est tout en haut de l’arbre.', 'Un garçon aide son ami à l’attraper.', 'Ils la partagent : une moitié chacun !', 'Et toi {p}, tu aides tes amis ?'],
  ['Lumière dans le Noir', 'backrooms', 'dodo', 'chambre', ['etoile', 'etoile', 'lune'], 'Le couloir est un peu sombre.', 'Des autocollants brillent pour montrer le chemin.', 'Ils mènent jusqu’au lit tout doux. Bonne nuit !', 'Et toi {p}, tu as une veilleuse ?'],
  ['Tour des Couleurs', 'brick-toy', 'tourblocs', 'chambre', ['cube', 'etoile', 'cube'], 'Voici une brique rouge.', 'Puis une bleue, puis une jaune.', 'Elles s’empilent et forment une tour de couleurs !', 'Et toi {p}, ta tour serait haute comment ?'],
  ['Ouvrir la Porte', 'paper-popup', 'chateau', 'ciel', ['nuage', 'oiseau', 'etoile'], 'Voici un château en papier.', 'Touche l’écran pour ouvrir la porte…', 'Le pont-levis descend : bienvenue !', 'Et toi {p}, qui habite dans ce château ?'],
  ['Ville Jouet', 'tilt-shift', 'train', 'ville', ['nuage', 'oiseau', 'etoile'], 'Voici une toute petite ville.', 'Des voitures et des trains roulent partout.', 'On dirait une ville de jouets !', 'Et toi {p}, quel véhicule préfères-tu ?'],
  ['Île qui Grandit', 'lowpoly-island', 'palmier', 'plage', ['poisson', 'nuage', 'oiseau'], 'Au milieu de la mer, il n’y a rien.', 'Un bout de terre apparaît, puis un arbre.', 'Tuile après tuile, une île est née !', 'Et toi {p}, que mettrais-tu sur ton île ?'],
  ['Bulle Brillante', 'glass-product', 'bulle', 'ciel', ['bulle', 'bulle', 'nuage'], 'Voici une bulle de savon géante.', 'Elle flotte doucement dans l’air.', 'Elle brille de toutes les couleurs de l’arc-en-ciel !', 'Et toi {p}, tu sais faire des bulles ?'],
  ['Arbre des Saisons', 'memphis-diorama', 'automne', 'jardin', ['feuille', 'flocon', 'fleur'], 'Voici un arbre tout vert.', 'En un clin d’œil, il devient orange.', 'Puis blanc comme la neige !', 'Et toi {p}, quelle couleur d’arbre préfères-tu ?'],
  ['Photo à Mamie', 'desktop-flythrough', 'chat', 'chambre', ['coeur', 'etoile', 'coeur'], 'Voici une photo du chat.', 'Elle glisse d’une fenêtre à l’autre.', 'Hop ! Elle arrive chez Mamie, qui sourit.', 'Et toi {p}, quelle photo enverrais-tu à Mamie ?']
];

export const CAPSULES: Capsule[] = ROWS.map(([title, style, hero, decor, extras, a, b, c, d], i) => ({
  id: `capsule-${String(i + 1).padStart(2, '0')}`,
  title,
  emoji: '🎬',
  style,
  board: { hero, decor, extras, s: hero === 'tourblocs' || hero === 'cloche' ? 0.9 : hero === 'chat' ? 0.75 : undefined, y: ['tourblocs', 'phare', 'cloche', 'eiffel'].includes(hero) ? 300 : hero === 'avion' || hero === 'bulle' ? 250 : undefined },
  scenes: [a, b, c, d]
}));
