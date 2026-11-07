/** Prompts des illustrations (partagés par tous les générateurs). */
import type { Tale } from '../src/data/format.ts';

export const STYLE =
  'Children’s picture book illustration, soft watercolor and gouache, rounded cute characters, ' +
  'gentle and friendly, simple composition, centered subject, warm cheerful pastel palette, ' +
  'safe for 5-year-old children, no text, no letters, no words, no watermark';
const NIGHT = 'calm bedtime scene at night, deep blue sky, soft moonlight, twinkling stars, cozy and sleepy atmosphere';
const DAY = 'bright sunny daytime scene, joyful colors';

/** Personnage principal en anglais (d'après l'emoji du conte) : évite les confusions du modèle. */
export const SUBJECT: Record<string, string> = {
  '🦊': 'a cute little fox', '🐢': 'a cute turtle', '🐘': 'a cute baby elephant', '🌻': 'a little child planting a sunflower',
  '🐧': 'a cute penguin', '🐉': 'a friendly little dragon', '🐝': 'a cute bee', '🚂': 'a small smiling toy train',
  '🐻': 'a cute bear cub', '🦄': 'a cute unicorn', '🐌': 'a cute snail', '🎈': 'a red balloon and a little child',
  '🐸': 'a cute frog', '🦁': 'a cute lion cub', '🌈': 'a rainbow with sun and rain clouds', '🐙': 'a cute octopus',
  '🚀': 'a cardboard rocket and a little child', '🐿️': 'a cute squirrel', '🦋': 'a caterpillar and a butterfly', '🐳': 'a friendly blue whale and a small fish',
  '🧸': 'a teddy bear', '🐓': 'a cute rooster', '🌙': 'a smiling moon', '🦔': 'a cute hedgehog', '⛄': 'a snowman',
  '🐕': 'a cute puppy with a ball', '🌳': 'a big old oak tree with birds', '🎨': 'a little child painting', '🐭': 'a cute mouse with cheese',
  '⭐': 'a little star', '🦒': 'a cute giraffe', '🚒': 'a small red fire truck', '🐰': 'a cute bunny with a carrot',
  '🏰': 'a sandcastle on the beach', '🦉': 'a cute owl', '🍎': 'a red apple', '🐞': 'a cute ladybug', '🌊': 'a small wave on a beach',
  '🦜': 'a cute parrot', '🐑': 'a cute sheep', '🌋': 'a smiling volcano', '🎵': 'music notes and a little child', '🐄': 'a cute cow',
  '🛶': 'a beaver, a duck and a frog in a small boat', '🌰': 'an acorn and an oak tree', '🐼': 'a cute panda eating bamboo', '🎪': 'a circus tent with friendly animals',
  '🌸': 'a cherry tree in bloom', '🦀': 'a cute crab', '🏆': 'children running a race',
  '🕯️': 'a soft night light in a cozy bedroom', '🌌': 'a starry sky and a little bed flying', '🌧️': 'soft rain on a cozy house roof', '☁️': 'a soft fluffy cloud',
  '🐈': 'a sleeping cat on a bed', '🎐': 'a wind chime by a window', '🏔️': 'a snowy mountain at night', '🍵': 'a cup of warm milk',
  '🌠': 'a shooting star', '🛏️': 'a cozy child bed', '🌾': 'a wheat field under the moon', '🐠': 'colorful fish in a lagoon',
  '🎶': 'a music box with a tiny dancer', '🌛': 'a crescent moon', '🏡': 'a cozy house at night', '🌬️': 'a gentle breeze moving curtains',
  '🐐': 'a cute little goat', '🌷': 'a night garden with flowers', '🦢': 'a white swan on a lake', '🪐': 'a dreamy planet',
  '🌄': 'a sunrise over hills', '🐨': 'a cute koala in a tree', '🌺': 'a beautiful flower', '🦭': 'a cute seal on ice',
  '📖': 'an open storybook', '🌑': 'a peaceful night sky', '🐥': 'a chick under a hen wing', '💤': 'a sleeping child in bed',
  '🌲': 'a forest falling asleep', '🐟': 'fish'
};

export function promptFor(t: Tale): string {
  // Le sujet d'abord : les modèles rapides accordent le plus de poids au début du prompt.
  const subject = SUBJECT[t.emoji] ?? t.title.replaceAll('{p}', 'a little child');
  const scene = t.pages[0].replaceAll('{p}', 'a little child');
  return `${subject}, ${t.kind === 'soir' ? NIGHT : DAY}. ${STYLE}. Story (French): ${scene}`;
}

/** Graine stable par conte : relancer le script redonne la même image. */
export const seedFor = (id: string) => [...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % 2_000_000_000;
