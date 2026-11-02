import { DailyActivityPackage } from '../types/news';

export const INITIAL_DAILY_STORIES: DailyActivityPackage[] = [
  {
    id: 'story-today-heating',
    date: '2026-11-02',
    tagline: 'L’actualité du jour expliquée aux enfants',
    topic: 'Les Inventions & La Chaleur de l’Hiver',
    source: 'Le Journal des Sciences Douces',
    summary: 'Aujourd’hui, l’hiver approche et les ingénieurs préparent nos maisons pour qu’elles soient bien douillettes !',
    cartoon: {
      title: 'Marc le Super Bâtisseur réchauffe la maison !',
      durationLabel: '4 min chrono',
      badgeLabel: 'Activité 1 sur 5',
      heroName: 'Marc le Bâtisseur',
      heroDescription: 'Avec sa salopette bleue et sa boîte à outils, il apporte la douce chaleur dans toutes les chambres !',
      scenes: [
        {
          id: 'scene-1',
          title: 'L’atelier sous la neige',
          narration: 'Regarde par la fenêtre ! Il neige de jolis flocons blancs. Dans son atelier en bois, Marc le bâtisseur prépare sa boîte à outils magique.',
          durationSeconds: 15,
          bgType: 'workshop',
          character: {
            name: 'Marc',
            avatar: '👷‍♂️',
            mood: 'happy',
            speech: 'Bonjour petit curieux ! Aujourd’hui, on va apporter de la chaleur dans ta chambre !'
          },
          interactiveHotspots: [
            {
              id: 'hotspot-snow',
              label: 'Flocons de neige',
              xPercent: 18,
              yPercent: 32,
              emoji: '❄️',
              soundType: 'pop',
              reactionText: 'Brrr ! Il fait froid dehors ! Mais dedans on est bien au chaud !'
            },
            {
              id: 'hotspot-toolbox',
              label: 'Boîte magique',
              xPercent: 42,
              yPercent: 68,
              emoji: '🧰',
              soundType: 'wrench',
              reactionText: 'Clic-clac ! Tous les outils de Marc sont bien rangés !'
            }
          ],
          keyWords: [
            {
              word: 'bâtisseur',
              syllables: 'bâ - tis - seur',
              definition: 'Un ami fort et gentil qui construit et répare les jolies maisons.',
              emoji: '👷‍♂️'
            },
            {
              word: 'atelier',
              syllables: 'a - te - lier',
              definition: 'La pièce secrète où l’on fabrique et répare toutes sortes d’objets géniaux.',
              emoji: '🪵'
            }
          ]
        },
        {
          id: 'scene-2',
          title: 'La grande chaudière rigolote',
          narration: 'Au sous-sol, une grosse marmite colorée ronronne doucement : c’est la chaudière ! Elle réchauffe de l’eau comme pour un bon chocolat chaud.',
          durationSeconds: 16,
          bgType: 'workshop',
          character: {
            name: 'Marc',
            avatar: '👷‍♂️',
            mood: 'proud',
            speech: 'La chaudière ronronne comme un gros chat tout chaud !'
          },
          interactiveHotspots: [
            {
              id: 'hotspot-boiler',
              label: 'La chaudière colorée',
              xPercent: 62,
              yPercent: 52,
              emoji: '🔥',
              soundType: 'pop',
              reactionText: 'Glou-glou ! L’eau commence à chauffer doucement !'
            },
            {
              id: 'hotspot-pipes',
              label: 'Les tuyaux serpents',
              xPercent: 82,
              yPercent: 38,
              emoji: '🚰',
              soundType: 'water-tap',
              reactionText: 'L’eau chaude glisse dans les tuyaux jusqu’à ta chambre !'
            }
          ],
          keyWords: [
            {
              word: 'chaudière',
              syllables: 'chau - dière',
              definition: 'Une grosse marmite magique qui chauffe l’eau pour réchauffer toute la maison.',
              emoji: '🫕'
            },
            {
              word: 'tuyaux',
              syllables: 'tuy - aux',
              definition: 'Des longs tunnels cachés dans les murs où l’eau voyage vite.',
              emoji: '🚰'
            }
          ]
        },
        {
          id: 'scene-3',
          title: 'La petite bulle d’air coquine',
          narration: 'Mais écoute bien... « Glou-glou » ! Une petite bulle d’air s’est glissée dans le radiateur. Marc prend sa clé magique et fait « Pschhh » pour la libérer !',
          durationSeconds: 18,
          bgType: 'workshop',
          character: {
            name: 'Marc',
            avatar: '👷‍♂️',
            mood: 'excited',
            speech: 'Hop petite bulle, envole-toi ! Maintenant le radiateur peut bien chauffer !'
          },
          interactiveHotspots: [
            {
              id: 'hotspot-radiator',
              label: 'Le radiateur blanc',
              xPercent: 86,
              yPercent: 55,
              emoji: '♨️',
              soundType: 'pop',
              reactionText: 'Pschhh ! L’air est sorti, le radiateur devient tout tiède et doux !'
            },
            {
              id: 'hotspot-bubble',
              label: 'Bulle farceuse',
              xPercent: 78,
              yPercent: 28,
              emoji: '🫧',
              soundType: 'pop',
              reactionText: 'Plop ! La bulle a éclaté en faisant un éclat de rire !'
            }
          ],
          keyWords: [
            {
              word: 'radiateur',
              syllables: 'ra - dia - teur',
              definition: 'Une grille en métal où passe l’eau chaude pour réchauffer tes orteils.',
              emoji: '♨️'
            },
            {
              word: 'chaleur',
              syllables: 'cha - leur',
              definition: 'Ce qui rend une pièce aussi agréable qu’un câlin tout doux.',
              emoji: '☀️'
            }
          ]
        },
        {
          id: 'scene-4',
          title: 'Maison douillette et mission réussie !',
          narration: 'Youpi ! La maison est maintenant aussi chaude qu’un nid d’oiseau. Merci Marc le super bâtisseur ! Tu as mérité ta première étoile dorée !',
          durationSeconds: 14,
          bgType: 'workshop',
          character: {
            name: 'Marc',
            avatar: '👷‍♂️',
            mood: 'happy',
            speech: 'Mission accomplie petit champion ! Bravo !'
          },
          interactiveHotspots: [
            {
              id: 'hotspot-star',
              label: 'Étoile dorée',
              xPercent: 50,
              yPercent: 40,
              emoji: '⭐',
              soundType: 'pop',
              reactionText: 'Félicitations ! Étoile numéro 1 débloquée !'
            }
          ],
          keyWords: [
            {
              word: 'douillette',
              syllables: 'douil - lette',
              definition: 'Une maison très agréable, chaude et confortable.',
              emoji: '🧸'
            }
          ]
        }
      ]
    },
    soundQuiz: {
      title: 'Le Quiz Sonore : Qui fait « Clic-clic... Pschhh ! » ?',
      question: 'Touche le bon objet après avoir écouté attentivement le bruit !',
      soundToPlay: 'water-tap',
      options: [
        {
          id: 'opt-wrench',
          label: 'La Clé Magique',
          hint: 'Elle fait plutôt « Cric-crac » en tournant !',
          emoji: '🔧',
          isCorrect: false,
          soundType: 'wrench'
        },
        {
          id: 'opt-tap',
          label: 'Le Robinet d’Eau',
          hint: 'Il ouvre l’eau et fait bien pschhhh !',
          emoji: '🚰',
          isCorrect: true,
          soundType: 'water-tap'
        },
        {
          id: 'opt-tractor',
          label: 'Le Tracteur rigolo',
          hint: 'Lui fait « Vroum-vroum » dans le champ !',
          emoji: '🚜',
          isCorrect: false,
          soundType: 'tractor'
        }
      ]
    },
    animalDiscovery: {
      title: 'Touche un animal pour entendre son cri rigolo !',
      subtitle: 'Les animaux de la ferme se préparent aussi pour l’hiver sous la paille chaude !',
      animals: [
        {
          id: 'an-cow',
          name: 'La Vache',
          soundText: 'Meuhhh ! 🐮',
          emoji: '🐮',
          soundType: 'cow'
        },
        {
          id: 'an-sheep',
          name: 'Le Mouton',
          soundText: 'Bêêê ! 🐑',
          emoji: '🐑',
          soundType: 'sheep'
        },
        {
          id: 'an-pig',
          name: 'Le Cochon',
          soundText: 'Groin-groin ! 🐷',
          emoji: '🐷',
          soundType: 'pig'
        },
        {
          id: 'an-chicken',
          name: 'La Poule',
          soundText: 'Cot-cot ! 🐔',
          emoji: '🐔',
          soundType: 'chicken'
        }
      ]
    },
    mysteryBubble: {
      title: 'Pourquoi le radiateur fait-il « glou-glou » ?',
      question: 'Découvre le grand secret caché dans le radiateur de ta chambre !',
      shortExplanation: 'C’est une petite bulle d’air qui fait des glissades dans l’eau chaude ! Marc tourne sa clé magique et hop, la bulle s’envole en faisant pschitt !',
      detailedSecret: 'Dans les radiateurs, il ne doit y avoir que de l’eau bien chaude. Quand un peu d’air s’infiltre, il forme des bulles qui rebondissent comme des balles de ping-pong ! En tournant la petite vis avec une clé, l’air sort et l’eau remplit tout pour chauffer au maximum.',
      bubbleCount: 5
    },
    bedtimeTale: {
      title: 'L’Aventure des Moulins et de l’Électricité',
      summary: 'Le vent souffle doucement dans les champs, fait tourner les grands moulins et allume la petite veilleuse de ton dodo !',
      nightTheme: 'Vent doux et étoiles bienveillantes',
      taleText: 'Quand la nuit tombe sur la campagne, le vent chante une douce berceuse. Il caresse les grandes ailes blanches des moulins à vent. Cric, crac, les ailes tournent sans faire de bruit et fabriquent une belle énergie propre. Cette électricité voyage dans des petits fils magiques pour éclairer ta jolie veilleuse et chasser tous les monstres. Fais de doux rêves petit explorateur...'
    }
  },
  {
    id: 'story-space-discovery',
    date: '2026-11-01',
    tagline: 'L’actualité de l’espace pour les p’tits curieux',
    topic: 'Le Grand Télescope dans les Étoiles',
    source: 'L’Observatoire des Enfants',
    summary: 'Des astronomes ont aperçu un nuage d’eau sur une planète lointaine grâce à un télescope géant dans l’espace !',
    cartoon: {
      title: 'Maya l’Astronaute trouve des nuages magiques !',
      durationLabel: '3 min chrono',
      badgeLabel: 'Exploration Étoilée',
      heroName: 'Maya l’Astronaute',
      heroDescription: 'Avec son casque transparent et sa fusée jaune, elle vole au milieu des étoiles filantes !',
      scenes: [
        {
          id: 'scene-space-1',
          title: 'Décollage vers les étoiles',
          narration: 'Trois, deux, un... Décollage ! La fusée de Maya s’élève dans le grand ciel bleu foncé parsemé d’étoiles qui brillent comme des diamants.',
          durationSeconds: 15,
          bgType: 'space',
          character: {
            name: 'Maya',
            avatar: '👩‍🚀',
            mood: 'excited',
            speech: 'Coucou la Terre ! Vu d’ici, notre planète ressemble à une jolie bille bleue !'
          },
          interactiveHotspots: [
            {
              id: 'hotspot-star-twinkle',
              label: 'Étoile brillante',
              xPercent: 25,
              yPercent: 30,
              emoji: '✨',
              soundType: 'pop',
              reactionText: 'Scintille, scintille petite étoile !'
            },
            {
              id: 'hotspot-rocket',
              label: 'La fusée jaune',
              xPercent: 70,
              yPercent: 50,
              emoji: '🚀',
              soundType: 'tractor',
              reactionText: 'Fchhhh ! Les moteurs propulsent la fusée en douceur !'
            }
          ],
          keyWords: [
            {
              word: 'télescope',
              syllables: 'té - les - cope',
              definition: 'Une très longue lunette magique pour voir les planètes très lointaines.',
              emoji: '🔭'
            },
            {
              word: 'galaxie',
              syllables: 'ga - la - xie',
              definition: 'Une immense famille d’étoiles qui tournent ensemble dans le noir de l’espace.',
              emoji: '🌌'
            }
          ]
        },
        {
          id: 'scene-space-2',
          title: 'Le nuage d’eau lointain',
          narration: 'Regarde dans le grand télescope ! Sur une planète entourée d’anneaux dorés, il y a un nuage d’eau douce qui vole. C’est la grande nouvelle du jour !',
          durationSeconds: 16,
          bgType: 'space',
          character: {
            name: 'Maya',
            avatar: '👩‍🚀',
            mood: 'happy',
            speech: 'L’eau est le trésor le plus précieux de tout l’univers !'
          },
          interactiveHotspots: [
            {
              id: 'hotspot-planet',
              label: 'Planète bleue',
              xPercent: 50,
              yPercent: 45,
              emoji: '🪐',
              soundType: 'pop',
              reactionText: 'Une planète mystérieuse avec des anneaux dorés !'
            }
          ],
          keyWords: [
            {
              word: 'astronome',
              syllables: 'as - tro - nome',
              definition: 'Un scientifique savant dont le métier est d’observer les étoiles.',
              emoji: '🧑‍🔬'
            }
          ]
        }
      ]
    },
    soundQuiz: {
      title: 'Le Quiz Sonore de l’Espace : Qui fait « Bip... Bip... Bip » ?',
      question: 'Écoute le signal radio envoyé depuis le satellite en orbite !',
      soundToPlay: 'water-tap',
      options: [
        {
          id: 'opt-satellite',
          label: 'Le Satellite Curieux',
          hint: 'Il tourne autour de la Terre et envoie des signaux bip bip !',
          emoji: '🛰️',
          isCorrect: true,
          soundType: 'water-tap'
        },
        {
          id: 'opt-wrench2',
          label: 'La Clé de Réparation',
          hint: 'Elle répare les boulons mais ne fait pas de bip !',
          emoji: '🔧',
          isCorrect: false,
          soundType: 'wrench'
        },
        {
          id: 'opt-tractor2',
          label: 'Le Rover Lunaire',
          hint: 'Lui roule sur le sable de la Lune en faisant vroum !',
          emoji: '🚜',
          isCorrect: false,
          soundType: 'tractor'
        }
      ]
    },
    animalDiscovery: {
      title: 'Touche un animal protecteur des étoiles !',
      subtitle: 'La Chouette et les animaux de la nuit regardent eux aussi les constellations !',
      animals: [
        {
          id: 'an-owl',
          name: 'La Chouette',
          soundText: 'Hou-hou ! 🦉',
          emoji: '🦉',
          soundType: 'sheep'
        },
        {
          id: 'an-frog',
          name: 'La Grenouille',
          soundText: 'Croâ-croâ ! 🐸',
          emoji: '🐸',
          soundType: 'pig'
        },
        {
          id: 'an-wolf',
          name: 'Le Louveteau',
          soundText: 'Aouuuuh ! 🐺',
          emoji: '🐺',
          soundType: 'cow'
        },
        {
          id: 'an-cricket',
          name: 'Le Grillon',
          soundText: 'Cri-cri ! 🦗',
          emoji: '🦗',
          soundType: 'chicken'
        }
      ]
    },
    mysteryBubble: {
      title: 'Pourquoi fait-il tout noir dans l’espace ?',
      question: 'Alors qu’il y a des millions de soleils, pourquoi le ciel est-il noir ?',
      shortExplanation: 'Parce que l’espace est tellement immense que la lumière voyage très longtemps sans rencontrer d’air pour rebondir !',
      detailedSecret: 'Sur Terre, le ciel est bleu parce que la lumière du Soleil tape contre les petites molécules d’air. Dans l’espace, il n’y a pas d’air, alors le ciel reste d’un magnifique velours noir parsemé d’étoiles étincelantes !',
      bubbleCount: 5
    },
    bedtimeTale: {
      title: 'La Berceuse de la Petite Étoile Filante',
      summary: 'Une petite étoile filante fait un câlin à la Lune avant de s’endormir paisiblement.',
      nightTheme: 'Nuit paisible et ciel étoilé',
      taleText: 'Dans le ciel tout doux, une petite étoile filante a dansé toute la journée. Ses pieds sont fatigués de glisser sur les comètes. Elle pose sa tête dorée sur le grand croissant de Lune comme sur un oreiller moelleux. La Lune lui chante une berceuse sans paroles. Ferme tes yeux toi aussi, petit explorateur, demain d’autres aventures t’attendent...'
    }
  }
];
