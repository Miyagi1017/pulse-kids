/** Contenus du jour calculés sans réseau : utilisables par le serveur ET hors ligne sur l'appareil. */

export function frenchDate(day: string): string {
  return new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(`${day}T12:00:00Z`));
}

export interface Season {
  name: string;
  emoji: string;
  text: string;
}

export function seasonFor(day: string): Season {
  const [, m, d] = day.split('-').map(Number);
  const md = m * 100 + d;
  if (md >= 321 && md < 621) return { name: 'printemps', emoji: '🌷', text: 'C’est le printemps : les fleurs poussent et les oiseaux font leurs nids.' };
  if (md >= 621 && md < 923) return { name: 'été', emoji: '🌞', text: 'C’est l’été : il fait chaud, les journées sont longues et on peut aller à la plage.' };
  if (md >= 923 && md < 1221) return { name: 'automne', emoji: '🍂', text: 'C’est l’automne : les feuilles deviennent jaunes et rouges, puis tombent des arbres.' };
  return { name: 'hiver', emoji: '❄️', text: 'C’est l’hiver : il fait froid, et parfois la neige tombe comme du coton.' };
}

// ---- Anecdotes « Le savais-tu ? » (vraies, relues, une par jour) ----

export const FACTS: [string, string][] = [
  ['🐙', 'La pieuvre a trois cœurs et du sang bleu !'],
  ['🐌', 'Un escargot peut dormir pendant trois ans quand il fait trop sec.'],
  ['🦒', 'La girafe dort seulement deux heures par jour, souvent debout !'],
  ['🐝', 'Pour faire un pot de miel, les abeilles visitent des millions de fleurs.'],
  ['🌍', 'La Terre tourne sur elle-même : c’est pour ça qu’il y a le jour et la nuit.'],
  ['🐘', 'L’éléphant est le seul animal qui ne peut pas sauter.'],
  ['🦋', 'Les papillons goûtent les fleurs avec leurs pattes !'],
  ['🐧', 'Les manchots empereurs se serrent tous ensemble pour avoir chaud.'],
  ['🌙', 'Sur la Lune, il n’y a pas de vent : les traces de pas des astronautes y sont toujours.'],
  ['🐬', 'Les dauphins dorment avec un œil ouvert.'],
  ['🌈', 'Un arc-en-ciel apparaît quand le soleil brille à travers les gouttes de pluie.'],
  ['🦔', 'Un bébé hérisson naît avec des piquants tout mous.'],
  ['🐢', 'Certaines tortues peuvent vivre plus de cent ans.'],
  ['❄️', 'Chaque flocon de neige a une forme unique, aucun n’est pareil !'],
  ['🐨', 'Le koala dort presque toute la journée, jusqu’à vingt heures !'],
  ['🌳', 'Les arbres fabriquent l’air que nous respirons.'],
  ['🦉', 'La chouette peut tourner la tête presque jusque derrière son dos.'],
  ['☀️', 'Le Soleil est une étoile, si grande qu’un million de Terres tiendraient dedans.'],
  ['🐳', 'La baleine bleue est le plus grand animal qui ait jamais existé.'],
  ['🐜', 'Une fourmi peut porter des objets beaucoup plus lourds qu’elle.'],
  ['🦩', 'Les flamants roses sont roses grâce aux petites crevettes qu’ils mangent.'],
  ['🐸', 'La grenouille boit de l’eau à travers sa peau.'],
  ['🌋', 'Il existe des volcans sous la mer.'],
  ['🐿️', 'L’écureuil oublie parfois où il a caché ses noisettes… et des arbres poussent !'],
  ['🪐', 'Saturne est si légère qu’elle pourrait flotter dans une baignoire géante.'],
  ['🐄', 'Les vaches ont des meilleures amies et sont tristes quand elles sont séparées.'],
  ['🦈', 'Les requins existaient déjà avant les dinosaures.'],
  ['🐞', 'Les coccinelles mangent les pucerons et protègent les jardins.'],
  ['🌊', 'L’océan couvre presque toute la surface de la Terre.'],
  ['🦜', 'Certains perroquets peuvent apprendre des centaines de mots.']
];

export function factFor(day: string): [string, string] {
  const n = Math.floor(Date.parse(day) / 86400000);
  return FACTS[((n % FACTS.length) + FACTS.length) % FACTS.length];
}
