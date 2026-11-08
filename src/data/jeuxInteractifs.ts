/**
 * 160 jeux interactifs de plus, à jouer avec le doigt :
 *  - memoire (40) : retourner les cartes pour trouver les paires
 *  - suite (40)   : « qu'est-ce qui vient après ? » (motifs AB, ABC, AAB…)
 *  - trouve (40)  : « touche tous les … » dans une grille
 *  - 40 jeux classiques (devinettes, compter, intrus) sur la science et la vie de tous les jours
 * Les emojis d'une liste sont séparés par des espaces.
 */
import type { Activity } from './activites';

const split = (s: string) => s.trim().split(/\s+/);

// ---------- 🃏 Mémoire : [titre, paires, bravo]
const MEMOIRE: [string, string, string][] = [
  ['Les animaux de la ferme', '🐮 🐷 🐔', 'Bravo ! Tu as retrouvé toute la ferme.'],
  ['Les fruits', '🍎 🍌 🍇', 'Miam ! Toutes les paires de fruits.'],
  ['Les véhicules', '🚗 🚌 🚲', 'Vroum ! Tu as une super mémoire.'],
  ['La météo', '☀️ 🌧️ ❄️', 'Bravo ! Soleil, pluie et neige.'],
  ['Sous la mer', '🐠 🐙 🦀', 'Bien joué, petit plongeur !'],
  ['Dans l’espace', '🚀 🌙 ⭐', 'Décollage réussi !'],
  ['Les légumes', '🥕 🥦 🌽', 'Bravo ! Les légumes, c’est bon pour grandir.'],
  ['Les animaux de la savane', '🦁 🦒 🐘', 'Rooaar ! Quelle mémoire !'],
  ['Les émotions', '😄 😢 😠', 'Bravo ! Tu reconnais les émotions.'],
  ['À la plage', '🏖️ 🐚 ⛱️', 'Bravo ! Les vacances à la plage.'],
  ['Les insectes', '🐝 🐞 🦋', 'Bzzz ! Toutes les paires !'],
  ['Les desserts', '🍰 🍦 🍪', 'Miam ! Bien retrouvé.'],
  ['Les instruments', '🥁 🎸 🎺', 'Quelle musique ! Bravo.'],
  ['Les sports', '⚽ 🏀 🎾', 'But ! Toutes les paires.'],
  ['La nuit', '🌙 🦉 ⭐', 'Chut… tu as tout retrouvé !'],
  ['L’hiver', '⛄ 🧣 ❄️', 'Brrr ! Bravo.'],
  ['Le jardin', '🌻 🌷 🐌', 'Bravo, petit jardinier !'],
  ['La maison', '🛏️ 🪑 🚪', 'Bien joué !'],
  ['Les métiers', '👩‍🚒 👨‍🍳 👩‍⚕️', 'Bravo ! Pompière, cuisinier, docteure.'],
  ['La salle de bain', '🪥 🧼 🛁', 'Tout propre ! Bravo.'],
  ['Les oiseaux', '🐦 🦜 🦆', 'Cui-cui ! Bravo.'],
  ['La forêt', '🌲 🦊 🍄', 'Bravo ! Toute la forêt.'],
  ['Les formes', '🔴 🟦 🔺', 'Rond, carré, triangle : bravo !'],
  ['Le petit-déjeuner', '🥐 🥛 🍓', 'Bon appétit ! Bravo.'],
  ['Les animaux polaires', '🐧 🐻‍❄️ 🦭', 'Brrr ! Super mémoire.'],
  ['L’école', '✏️ 📚 🎒', 'Bravo ! Prêt pour l’école.'],
  ['Les fleurs', '🌸 🌼 🌹', 'Quel joli bouquet !'],
  ['Les transports', '✈️ 🚂 ⛵', 'Bon voyage ! Bravo.'],
  ['Les animaux de compagnie', '🐶 🐱 🐹', 'Bravo ! Ils sont tous là.'],
  ['La pluie', '☂️ 🌧️ 🐸', 'Splash ! Bien joué.'],
  // 4 paires : un peu plus difficile
  ['La grande ferme', '🐮 🐷 🐔 🐑', 'Bravo ! Quatre paires, quelle mémoire !'],
  ['Le grand verger', '🍎 🍐 🍒 🍑', 'Miam ! Quatre paires de fruits.'],
  ['Le zoo', '🦁 🐒 🦓 🐘', 'Bravo ! Tout le zoo est là.'],
  ['L’océan', '🐳 🐬 🐠 🦈', 'Bravo, grand explorateur des mers !'],
  ['Le ciel', '☀️ 🌈 ☁️ ⚡', 'Super ! Tout le ciel.'],
  ['Les dinosaures', '🦕 🦖 🥚 🌋', 'Grrr ! Bravo.'],
  ['La cuisine', '🍳 🥄 🍴 🧁', 'Bravo, petit chef !'],
  ['Les jouets', '🧸 🪀 🪁 🎈', 'Bravo ! Tous les jouets.'],
  ['La fête', '🎂 🎁 🎉 🎈', 'Joyeux anniversaire ! Bravo.'],
  ['Les saisons', '🌷 ☀️ 🍂 ❄️', 'Bravo ! Les quatre saisons.']
];

// ---------- 🔁 Qu'est-ce qui vient après ? : [titre, suite, bonne réponse, autres choix, bravo]
const SUITE: [string, string, string, string, string][] = [
  ['Rouge, bleu', '🔴 🔵 🔴 🔵 🔴', '🔵', '🟢 🟡', 'Oui ! Rouge, bleu, rouge, bleu…'],
  ['Le chat et le chien', '🐱 🐶 🐱 🐶 🐱', '🐶', '🐭 🐰', 'Bravo ! Chat, chien, chat, chien…'],
  ['Soleil et lune', '☀️ 🌙 ☀️ 🌙', '☀️', '⭐ ☁️', 'Oui ! Le jour, la nuit, le jour…'],
  ['Pomme, banane', '🍎 🍌 🍎 🍌 🍎', '🍌', '🍇 🍓', 'Miam ! Bien trouvé.'],
  ['Les trois couleurs', '🔴 🟡 🔵 🔴 🟡', '🔵', '🟢 🟣', 'Bravo ! Rouge, jaune, bleu, et on recommence.'],
  ['Rond, carré', '⚪ ⬛ ⚪ ⬛ ⚪', '⬛', '🔺 ⭐', 'Oui ! Rond, carré, rond, carré…'],
  ['La ferme en musique', '🐮 🐷 🐔 🐮 🐷', '🐔', '🐑 🐶', 'Cocorico ! C’est la poule.'],
  ['Deux étoiles, un cœur', '⭐ ⭐ ❤️ ⭐ ⭐', '❤️', '🌙 ☀️', 'Bravo ! Deux étoiles, un cœur.'],
  ['Petit, grand', '🐭 🐘 🐭 🐘 🐭', '🐘', '🦒 🐱', 'Oui ! Petit, grand, petit, grand…'],
  ['Les fleurs', '🌸 🌻 🌸 🌻', '🌸', '🌹 🍀', 'Bravo ! Quel joli motif.'],
  ['Pluie et soleil', '🌧️ ☀️ 🌧️ ☀️ 🌧️', '☀️', '❄️ 🌈', 'Oui ! Après la pluie, le beau temps.'],
  ['Voiture, vélo', '🚗 🚲 🚗 🚲 🚗', '🚲', '🚌 ✈️', 'Bravo ! Bien vu.'],
  ['Les poissons', '🐟 🐠 🐡 🐟 🐠', '🐡', '🐙 🦀', 'Oui ! Les trois poissons recommencent.'],
  ['Deux pommes, une poire', '🍎 🍎 🍐 🍎 🍎', '🍐', '🍌 🍒', 'Bravo ! Deux pommes, une poire.'],
  ['Le matin, le soir', '🌅 🌃 🌅 🌃', '🌅', '🌞 ⭐', 'Oui ! Le matin revient toujours.'],
  ['Les saisons', '🌷 ☀️ 🍂 ❄️ 🌷', '☀️', '🍂 ⛄', 'Bravo ! Après le printemps, l’été.'],
  ['Bonjour, au revoir', '👋 😊 👋 😊 👋', '😊', '😢 😠', 'Oui ! Toujours avec le sourire.'],
  ['Grand, moyen, petit', '🐻 🐺 🐭 🐻 🐺', '🐭', '🐘 🦒', 'Bravo ! Grand, moyen, petit.'],
  ['Les notes', '🎵 🎶 🎵 🎶 🎵', '🎶', '🥁 🎸', 'La la la ! Bravo.'],
  ['Les fusées', '🚀 ⭐ ⭐ 🚀 ⭐', '⭐', '🌙 🪐', 'Oui ! Une fusée, deux étoiles.'],
  ['Les carrés de couleur', '🟥 🟩 🟥 🟩 🟥', '🟩', '🟦 🟨', 'Bravo ! Rouge, vert…'],
  ['Le chiffre qui grandit', '1️⃣ 2️⃣ 3️⃣ 4️⃣', '5️⃣', '1️⃣ 9️⃣', 'Oui ! Après quatre vient cinq.'],
  ['Compter à rebours', '5️⃣ 4️⃣ 3️⃣ 2️⃣', '1️⃣', '6️⃣ 3️⃣', 'Décollage ! Cinq, quatre, trois, deux, un !'],
  ['Les fruits rouges', '🍓 🍒 🍓 🍒 🍓', '🍒', '🍌 🍋', 'Miam ! Bien trouvé.'],
  ['Les oiseaux', '🐦 🦉 🐦 🦉', '🐦', '🐧 🦆', 'Cui-cui ! Bravo.'],
  ['Le train', '🚂 🚃 🚃 🚂 🚃', '🚃', '🚗 🚌', 'Tchou tchou ! Une locomotive, deux wagons.'],
  ['Les visages', '😄 😄 😮 😄 😄', '😮', '😢 😴', 'Bravo ! Deux sourires, une surprise.'],
  ['Feuilles et glands', '🍂 🌰 🍂 🌰 🍂', '🌰', '🍄 🍎', 'Oui ! L’écureuil serait content.'],
  ['Les trois animaux', '🐸 🐢 🐌 🐸 🐢', '🐌', '🐍 🐛', 'Bravo ! Grenouille, tortue, escargot.'],
  ['Les cœurs', '❤️ 💛 💚 ❤️ 💛', '💚', '💜 🖤', 'Oui ! Rouge, jaune, vert.'],
  ['Les balles', '⚽ ⚽ 🏀 ⚽ ⚽', '🏀', '🎾 🏐', 'But ! Bien trouvé.'],
  ['Les lunes', '🌑 🌓 🌕 🌑 🌓', '🌕', '🌙 ☀️', 'Bravo ! La lune grandit.'],
  ['La météo du jour', '☀️ ☁️ 🌧️ ☀️ ☁️', '🌧️', '❄️ ⚡', 'Oui ! Soleil, nuage, pluie.'],
  ['Les chaussures', '👟 👢 👟 👢 👟', '👢', '🧦 🩴', 'Bravo ! Basket, botte…'],
  ['Les desserts', '🍦 🍪 🍰 🍦 🍪', '🍰', '🍩 🍫', 'Miam ! Glace, biscuit, gâteau.'],
  ['Les formes', '🔺 🔺 ⚪ 🔺 🔺', '⚪', '⬛ ⭐', 'Oui ! Deux triangles, un rond.'],
  ['Les véhicules du ciel', '✈️ 🚁 ✈️ 🚁 ✈️', '🚁', '🚀 🚗', 'Bravo ! Avion, hélicoptère.'],
  ['Les légumes', '🥕 🥦 🥕 🥦', '🥕', '🍅 🌽', 'Oui ! Carotte, brocoli…'],
  ['Les mains', '✋ ✊ ✌️ ✋ ✊', '✌️', '👍 👏', 'Bravo ! Feuille, pierre, ciseaux… et on recommence.'],
  ['Les animaux qui grandissent', '🥚 🐣 🐥 🥚 🐣', '🐥', '🐔 🐓', 'Oui ! L’œuf, le poussin qui sort, le poussin.']
];

// ---------- 👆 Touche tous les… : [titre, consigne, cibles, autres, bravo]
const TROUVE: [string, string, string, string, string][] = [
  ['Les fruits', 'Touche tous les fruits !', '🍎 🍌 🍇', '🚗 🐶 ⚽ 🎈 ✏️', 'Bravo ! Tu as trouvé tous les fruits.'],
  ['Les animaux', 'Touche tous les animaux !', '🐶 🐱 🐰', '🍎 🚲 🌞 📚 🎁', 'Bravo ! Tous les animaux sont là.'],
  ['Les véhicules', 'Touche tout ce qui roule !', '🚗 🚌 🚲', '🐟 🍌 🌙 🎈 🧸', 'Vroum ! Bien trouvé.'],
  ['Ce qui vole', 'Touche tout ce qui vole !', '🐦 ✈️ 🦋', '🐟 🚗 🐢 🍎 🪨', 'Bravo ! Tout ce qui vole dans le ciel.'],
  ['Les légumes', 'Touche tous les légumes !', '🥕 🥦 🌽', '🍰 🍬 🍦 🍩 🍪', 'Bravo ! Les légumes aident à grandir.'],
  ['Dans l’eau', 'Touche les animaux qui vivent dans l’eau !', '🐟 🐙 🐬', '🐄 🐓 🐑 🐴 🐷', 'Splash ! Bien trouvé.'],
  ['Pour se laver', 'Touche ce qui sert à se laver !', '🧼 🛁 🪥', '🍕 ⚽ 🎸 📺 🧸', 'Tout propre ! Bravo.'],
  ['Les choses rouges', 'Touche tout ce qui est rouge !', '🍎 🍓 🚒', '🍌 🥦 💙 🌽 🐸', 'Bravo ! Pomme, fraise, camion de pompiers.'],
  ['Pour l’hiver', 'Touche ce qu’on met quand il fait froid !', '🧣 🧤 🧥', '🩳 👙 🩴 🕶️ 👒', 'Bien au chaud ! Bravo.'],
  ['Les insectes', 'Touche tous les insectes !', '🐝 🐞 🐜', '🐶 🐟 🐦 🐸 🐢', 'Bravo ! Six pattes chacun !'],
  ['Dans le ciel', 'Touche ce qu’on voit dans le ciel !', '☀️ 🌙 ⭐', '🌳 🏠 🚗 🐄 🌷', 'Bravo ! Le soleil, la lune, les étoiles.'],
  ['Pour l’école', 'Touche ce qu’on met dans le cartable !', '✏️ 📚 🖍️', '🍳 🛏️ 🚿 🧹 🪴', 'Prêt pour l’école ! Bravo.'],
  ['Les fleurs', 'Touche toutes les fleurs !', '🌸 🌻 🌷', '🍄 🌵 🪨 🍂 🌲', 'Quel joli bouquet !'],
  ['Les sports', 'Touche tout ce qui sert à faire du sport !', '⚽ 🏀 🎾', '🍔 🛏️ 📺 🧁 🪑', 'But ! Bravo.'],
  ['Les animaux de la ferme', 'Touche les animaux de la ferme !', '🐮 🐷 🐔', '🦁 🐘 🦒 🐊 🦓', 'Bravo ! Tous à la ferme.'],
  ['Les animaux sauvages', 'Touche les animaux de la savane !', '🦁 🦒 🐘', '🐮 🐷 🐔 🐶 🐱', 'Rooaar ! Bravo.'],
  ['Ce qui est chaud', 'Touche ce qui est chaud !', '☀️ 🔥 🍵', '❄️ 🧊 ⛄ 🍦 🐧', 'Attention, ça chauffe ! Bravo.'],
  ['Ce qui est froid', 'Touche ce qui est froid !', '❄️ 🧊 🍦', '☀️ 🔥 🌶️ 🍵 🌋', 'Brrr ! Bien trouvé.'],
  ['Les instruments', 'Touche les instruments de musique !', '🥁 🎸 🎺', '🍎 🚗 🧸 🌳 🐶', 'La la la ! Bravo.'],
  ['Les desserts', 'Touche les desserts !', '🍰 🍦 🍪', '🥕 🥦 🍅 🥬 🌽', 'Miam ! Bravo.'],
  ['Pour dormir', 'Touche ce qui sert à dormir !', '🛏️ 🧸 🌙', '⚽ 🚲 🎺 🏀 🛹', 'Bonne nuit ! Bravo.'],
  ['Les bébés animaux', 'Touche les bébés animaux !', '🐣 🐥 🐤', '🐔 🐓 🦃 🦆 🦅', 'Piou piou ! Bravo.'],
  ['Les formes rondes', 'Touche tout ce qui est rond !', '⚽ 🍊 🌕', '📦 📐 🧱 📏 🔺', 'Bravo ! Tout rond.'],
  ['Les métiers', 'Touche les personnes qui travaillent pour soigner !', '👩‍⚕️ 🚑 🩺', '🍰 🎸 🧸 🚲 🌻', 'Bravo ! Merci aux soignants.'],
  ['Pour la pluie', 'Touche ce qui protège de la pluie !', '☂️ 🧥 👢', '🕶️ 🩴 👙 🧴 👒', 'Bien au sec ! Bravo.'],
  ['Le petit-déjeuner', 'Touche ce qu’on mange au petit-déjeuner !', '🥐 🥣 🍞', '🍕 🍔 🌭 🍟 🌮', 'Bon appétit ! Bravo.'],
  ['Les choses jaunes', 'Touche tout ce qui est jaune !', '🍌 🌻 🐥', '🍎 🥦 🫐 🍇 🐸', 'Bravo ! Jaune comme le soleil.'],
  ['Les choses vertes', 'Touche tout ce qui est vert !', '🥦 🐸 🍀', '🍎 🍊 🍌 🌸 🍇', 'Bravo ! Vert comme l’herbe.'],
  ['Pour jardiner', 'Touche ce qui sert à jardiner !', '🪴 🌱 🧑‍🌾', '📺 🎮 🍕 🎧 🧸', 'Bravo, petit jardinier !'],
  ['Les oiseaux', 'Touche tous les oiseaux !', '🐦 🦉 🦆', '🐟 🐍 🐢 🐌 🐸', 'Cui-cui ! Bravo.'],
  ['Les recyclables', 'Touche ce qu’on met dans la poubelle de tri !', '📦 🥫 📰', '🍌 🍎 🥕 🍂 🌸', 'Bravo ! Le tri aide la planète.'],
  ['Pour la plage', 'Touche ce qu’on emporte à la plage !', '🕶️ 🩴 🪣', '🧣 🧤 ⛄ 🧥 🎿', 'Vive les vacances ! Bravo.'],
  ['Les animaux de la nuit', 'Touche les animaux qui sortent la nuit !', '🦉 🦇 🦔', '🐓 🐝 🦋 🐄 🐴', 'Chut… Bravo !'],
  ['Les choses qui brillent', 'Touche ce qui brille !', '⭐ 💡 ☀️', '🪨 🧱 🪵 🍞 🧦', 'Bravo ! Ça brille.'],
  ['Les boissons', 'Touche ce qu’on peut boire !', '💧 🥛 🧃', '🍕 🍞 🍗 🧀 🍪', 'Bravo ! L’eau est la meilleure boisson.'],
  ['Ce qui flotte', 'Touche ce qui flotte sur l’eau !', '⛵ 🦆 🛶', '🪨 🔨 🧱 ⚓ 🗝️', 'Bravo ! Ça flotte.'],
  ['Les arbres', 'Touche tous les arbres !', '🌳 🌲 🌴', '🌸 🌻 🍄 🌵 🌾', 'Bravo ! Les arbres nous donnent de l’air.'],
  ['Les dinosaures', 'Touche les dinosaures !', '🦕 🦖', '🐊 🦎 🐍 🐢 🐸', 'Grrr ! Bien vu, ils se ressemblent beaucoup !'],
  ['Pour cuisiner', 'Touche ce qui sert à cuisiner !', '🍳 🥄 🔪', '🧸 ⚽ 📚 🎈 🪀', 'Bravo, petit chef ! Le couteau, c’est avec un adulte.'],
  ['Les émotions joyeuses', 'Touche les visages contents !', '😄 😊 🥰', '😢 😠 😨 😴 😐', 'Bravo ! Que de sourires.']
];

// ---------- Jeux classiques : science et vie de tous les jours
const DEVINETTES: [string, string, string[], string][] = [
  ['Pour voir dans le noir', 'Qu’est-ce qui éclaire quand il fait noir ?', ['🔦', '🧦', '🥄'], 'Oui ! La lampe éclaire le noir.'],
  ['Ce qui fait pousser les plantes', 'De quoi une plante a-t-elle besoin pour pousser ?', ['💧', '🍬', '📺'], 'Bravo ! De l’eau et du soleil.'],
  ['Le plus froid', 'Lequel est le plus froid ?', ['🧊', '☕', '🔥'], 'Brrr ! La glace est très froide.'],
  ['D’où vient le lait', 'Quel animal nous donne du lait ?', ['🐮', '🐔', '🐟'], 'Oui ! La vache.'],
  ['Ce qui vient de l’œuf', 'Qui sort d’un œuf ?', ['🐣', '🐶', '🐱'], 'Piou ! Le poussin sort de l’œuf.'],
  ['Pour se protéger du soleil', 'Que met-on pour protéger ses yeux du soleil ?', ['🕶️', '🧤', '🧣'], 'Bravo ! Les lunettes de soleil.'],
  ['La planète où on vit', 'Comment s’appelle la planète où nous vivons ?', ['🌍', '🌙', '☀️'], 'Oui ! La Terre.'],
  ['Pour savoir l’heure', 'Qu’est-ce qui donne l’heure ?', ['⏰', '🎈', '🧸'], 'Tic-tac ! L’horloge.'],
  ['Ce qui aimante', 'Qu’est-ce qui attire les objets en fer ?', ['🧲', '🍌', '🧸'], 'Bravo ! L’aimant.'],
  ['Voir les toutes petites choses', 'Avec quoi voit-on les choses en tout petit en grand ?', ['🔍', '🥄', '📏'], 'Oui ! La loupe grossit.'],
  ['La saison des bonhommes de neige', 'En quelle saison fait-on des bonshommes de neige ?', ['❄️', '☀️', '🌷'], 'Bravo ! En hiver.'],
  ['Les feuilles qui tombent', 'En quelle saison les feuilles tombent-elles ?', ['🍂', '🌷', '❄️'], 'Oui ! En automne.'],
  ['Où vont les déchets', 'Où met-on un papier de bonbon ?', ['🗑️', '🌳', '🌊'], 'Bravo ! À la poubelle, pour garder la nature propre.'],
  ['Le numéro des secours', 'Qui appelle-t-on quand il y a le feu ?', ['🚒', '🚌', '🚲'], 'Oui ! Les pompiers, avec un adulte.'],
  ['Pour traverser', 'Où traverse-t-on la rue ?', ['🚸', '🌳', '🏠'], 'Bravo ! Au passage piéton, avec un adulte.'],
  ['Ce qui fait de l’ombre', 'Qu’est-ce qui fait une ombre au soleil ?', ['🌳', '🌈', '💨'], 'Oui ! L’arbre fait de l’ombre.'],
  ['L’arc-en-ciel', 'Quand voit-on un arc-en-ciel ?', ['🌦️', '🌙', '❄️'], 'Bravo ! Quand il y a de la pluie et du soleil.'],
  ['Le cœur', 'Qu’est-ce qui bat dans ta poitrine ?', ['❤️', '🦷', '👂'], 'Boum boum ! Le cœur.'],
  ['Pour entendre', 'Avec quoi entend-on ?', ['👂', '👃', '👅'], 'Oui ! Les oreilles.'],
  ['Pour sentir les odeurs', 'Avec quoi sent-on les fleurs ?', ['👃', '👂', '🦶'], 'Bravo ! Le nez.']
];
const COMPTE: [string, string, number, string][] = [
  ['Les gouttes', '💧', 4, 'Quatre gouttes ! Bravo.'],
  ['Les fleurs', '🌸', 6, 'Six fleurs ! Bien compté.'],
  ['Les étoiles filantes', '🌠', 3, 'Trois étoiles filantes ! Fais un vœu.'],
  ['Les coquillages', '🐚', 5, 'Cinq coquillages !'],
  ['Les champignons', '🍄', 7, 'Sept champignons ! Bravo.'],
  ['Les fraises', '🍓', 8, 'Huit fraises ! Miam.'],
  ['Les abeilles', '🐝', 2, 'Deux abeilles ! Bzzz.'],
  ['Les flocons', '❄️', 9, 'Neuf flocons ! Quel champion.'],
  ['Les crayons', '✏️', 4, 'Quatre crayons !'],
  ['Les planètes', '🪐', 3, 'Trois planètes ! Bravo, astronaute.']
];
const INTRUS: [string, string[], string][] = [
  ['Les planètes', ['🌍', '🪐', '🌕', '🍎'], 'Bravo ! La pomme n’est pas dans l’espace.'],
  ['Pour se laver', ['🧼', '🪥', '🛁', '🍕'], 'Oui ! La pizza ne sert pas à se laver.'],
  ['La météo', ['☀️', '🌧️', '❄️', '🚗'], 'Bravo ! La voiture n’est pas la météo.'],
  ['Les outils', ['🔨', '🪛', '🔧', '🍌'], 'Oui ! La banane n’est pas un outil.'],
  ['Les arbres', ['🌳', '🌲', '🌴', '🐟'], 'Bravo ! Le poisson n’est pas un arbre.'],
  ['Les boissons', ['💧', '🥛', '🧃', '🧱'], 'Oui ! La brique ne se boit pas.'],
  ['Les animaux qui volent', ['🐦', '🦋', '🐝', '🐢'], 'Bravo ! La tortue ne vole pas.'],
  ['Les choses froides', ['❄️', '🧊', '⛄', '🔥'], 'Oui ! Le feu est chaud.'],
  ['Les parties du visage', ['👁️', '👃', '👄', '🦶'], 'Bravo ! Le pied n’est pas sur le visage.'],
  ['Les recyclables', ['📦', '📰', '🥫', '🍌'], 'Oui ! La peau de banane va au compost.']
];

const id = (n: number) => `ji-${String(n).padStart(3, '0')}`;
let n = 0;

export const JEUX_INTERACTIFS: Activity[] = [
  ...MEMOIRE.map(([title, pairs, bravo]): Activity => ({ id: id(++n), category: 'memoire', kind: 'memoire', emoji: '🃏', title, pairs: split(pairs), bravo })),
  ...SUITE.map(([title, seq, answer, others, bravo]): Activity => ({ id: id(++n), category: 'suites', kind: 'suite', emoji: '🔁', title, sequence: split(seq), answer, choices: [answer, ...split(others)], bravo })),
  ...TROUVE.map(([title, question, targets, others, bravo]): Activity => ({ id: id(++n), category: 'observation', kind: 'trouve', emoji: '👆', title, question, targets: split(targets), others: split(others), bravo })),
  ...DEVINETTES.map(([title, question, choices, bravo]): Activity => ({ id: id(++n), category: 'decouverte', kind: 'devinette', emoji: choices[0], title, question, choices, bravo })),
  ...COMPTE.map(([title, item, count, bravo]): Activity => ({ id: id(++n), category: 'maths', kind: 'compte', emoji: item, title, item, count, bravo })),
  ...INTRUS.map(([title, items, bravo]): Activity => ({ id: id(++n), category: 'logique', kind: 'intrus', emoji: items[0], title, items, bravo }))
];
