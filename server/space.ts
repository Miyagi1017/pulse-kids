import { z } from 'zod';
import { cacheGet, cacheSet, once } from './cache.js';
import { todayParis } from './date.js';

/**
 * « La photo de l'espace du jour » — sources ouvertes de la NASA (domaine public) :
 *   1. APOD (Astronomy Picture of the Day) : NASA_API_KEY, sinon DEMO_KEY ;
 *   2. repli : NASA Image and Video Library (sans clé), un thème différent chaque jour.
 * La légende est écrite en français pour les 5 ans (textes fixes, relus, sans IA).
 */

export const spacePhotoSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  title: z.string().min(1).max(80),
  caption: z.string().min(1).max(300),
  emoji: z.string().min(1).max(8),
  imageUrl: z
    .string()
    .url()
    .refine((u) => ALLOWED_IMAGE_HOSTS.has(new URL(u).hostname), 'hôte d’image non autorisé'),
  originalTitle: z.string().max(200),
  credit: z.string().max(120),
  source: z.enum(['apod', 'nasa-library']),
  link: z.string().url()
});
export type SpacePhoto = z.infer<typeof spacePhotoSchema>;

/** Doit rester synchronisé avec img-src de la CSP (vercel.json). */
export const ALLOWED_IMAGE_HOSTS = new Set(['apod.nasa.gov', 'images-assets.nasa.gov']);

interface Theme {
  query: string;
  /** Le titre de la photo doit correspondre (la recherche NASA est large). */
  match: RegExp;
  /** Titres à écarter (entraînements, maquettes, marques commerciales…). */
  exclude?: RegExp;
  title: string;
  emoji: string;
  caption: string;
}

/** Thèmes adaptés aux enfants, chacun avec une légende française simple et vraie. */
export const THEMES: Theme[] = [
  { query: 'nebula hubble', match: /nebula/i, title: 'Une nébuleuse, la maison des étoiles', emoji: '🌌', caption: 'Ce grand nuage coloré est fait de gaz et de poussière. C’est là que naissent les bébés étoiles !' },
  { query: 'saturn rings cassini', match: /saturn/i, title: 'Saturne et ses anneaux', emoji: '🪐', caption: 'Saturne porte de grands anneaux faits de morceaux de glace et de cailloux qui tournent autour d’elle.' },
  { query: 'jupiter juno', match: /jupiter/i, title: 'Jupiter, la géante', emoji: '🟠', caption: 'Jupiter est la plus grosse planète. Ses jolies bandes sont des nuages poussés par des vents très forts.' },
  { query: 'mars rover curiosity', match: /mars|rover|curiosity/i, title: 'Un robot explorateur sur Mars', emoji: '🤖', caption: 'Sur Mars, la planète rouge, des robots roulent tout seuls pour étudier les cailloux et le sable.' },
  { query: 'aurora from space station', match: /aurora/i, title: 'Une aurore vue de l’espace', emoji: '💚', caption: 'Les aurores sont des rubans de lumière qui dansent dans le ciel, tout près des pôles de la Terre.' },
  { query: 'earth from space blue marble', match: /earth|blue marble/i, title: 'Notre Terre, la planète bleue', emoji: '🌍', caption: 'Vue de très loin, la Terre est toute bleue grâce à ses océans. C’est notre maison !' },
  { query: 'full moon', match: /moon/i, title: 'La Lune', emoji: '🌕', caption: 'La Lune tourne autour de la Terre. Ses taches sont de grandes plaines et des trous appelés cratères.' },
  { query: 'spacewalk international space station', match: /spacewalk|extravehicular/i, exclude: /practice|training|pool|nbl|mockup/i, title: 'Un astronaute dans l’espace', emoji: '👩‍🚀', caption: 'Avec sa grosse combinaison, l’astronaute peut sortir de la station spatiale pour réparer des machines.' },
  { query: 'spiral galaxy', match: /galaxy/i, title: 'Une galaxie en spirale', emoji: '🌀', caption: 'Une galaxie est une immense famille de milliards d’étoiles qui tourne comme un tourbillon.' },
  { query: 'space shuttle launch', match: /launch|liftoff|lifts off/i, exclude: /rocket lab|spacex|falcon|boeing|blue origin|northrop|ula\b/i, title: 'Le décollage d’une fusée', emoji: '🚀', caption: 'Pour aller dans l’espace, la fusée pousse très fort vers le bas avec du feu pour monter vers le ciel.' },
  { query: 'sun solar dynamics observatory', match: /sun|solar/i, title: 'Le Soleil de tout près', emoji: '☀️', caption: 'Le Soleil est une étoile. Il nous donne la lumière et la chaleur. On ne doit jamais le regarder directement !' },
  { query: 'international space station backdropped earth', match: /space station|\bISS\b/, exclude: /mockup|training|experiment|onboard|inside|configuration/i, title: 'La station spatiale', emoji: '🛰️', caption: 'Des astronautes vivent dans cette maison qui flotte et fait le tour de la Terre 16 fois par jour !' }
];

export function themeForDay(day: string): Theme {
  const n = Math.floor(Date.parse(day) / 86400000);
  return THEMES[((n % THEMES.length) + THEMES.length) % THEMES.length];
}

const FETCH_TIMEOUT = 12_000;

async function fromApod(day: string): Promise<SpacePhoto | null> {
  const key = process.env.NASA_API_KEY || 'DEMO_KEY';
  const res = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${encodeURIComponent(key)}&date=${day}`, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT)
  });
  if (!res.ok) return null;
  const a = (await res.json()) as { media_type?: string; url?: string; title?: string; copyright?: string };
  if (a.media_type !== 'image' || !a.url) return null;
  // Seules les vraies images APOD sont acceptées (le service renvoie parfois un logo générique).
  if (new URL(a.url).hostname !== 'apod.nasa.gov') return null;
  const theme = themeForDay(day);
  return {
    date: day,
    title: 'La photo de l’espace du jour',
    caption: 'Une image du ciel choisie par les astronomes de la NASA. Regarde bien toutes ces couleurs et ces lumières !',
    emoji: theme.emoji,
    imageUrl: a.url.replace(/^http:/, 'https:'),
    originalTitle: (a.title ?? '').slice(0, 200),
    credit: a.copyright ? `© ${a.copyright.trim().slice(0, 100)}` : 'NASA',
    source: 'apod',
    link: `https://apod.nasa.gov/apod/ap${day.slice(2).replaceAll('-', '')}.html`
  };
}

interface LibraryItem {
  data?: { nasa_id?: string; title?: string; center?: string }[];
  links?: { href?: string; render?: string }[];
}

async function fromLibrary(day: string): Promise<SpacePhoto | null> {
  const theme = themeForDay(day);
  const url = `https://images-api.nasa.gov/search?q=${encodeURIComponent(theme.query)}&media_type=image&page_size=60`;
  const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT) });
  if (!res.ok) return null;
  const body = (await res.json()) as { collection?: { items?: LibraryItem[] } };
  const items = (body.collection?.items ?? [])
    .filter((i) => i.links?.[0]?.href && i.data?.[0]?.nasa_id && theme.match.test(i.data[0].title ?? '') && !theme.exclude?.test(i.data[0].title ?? ''))
    .slice(0, 15); // les plus pertinents seulement
  if (!items.length) return null;

  // Choix stable pour la journée (tout le monde voit la même photo).
  const n = Math.floor(Date.parse(day) / 86400000);
  const item = items[Math.floor(n / THEMES.length) % items.length];
  const meta = item.data![0];
  const preview = item.links![0].href!;
  return {
    date: day,
    title: theme.title,
    caption: theme.caption,
    emoji: theme.emoji,
    // ~medium : bon compromis qualité / poids pour tablettes.
    imageUrl: preview.replace(/~(thumb|small)\.jpg$/i, '~medium.jpg').replace(/^http:/, 'https:'),
    originalTitle: (meta.title ?? '').slice(0, 200),
    credit: `NASA${meta.center ? ` / ${meta.center}` : ''}`.slice(0, 120),
    source: 'nasa-library',
    link: `https://images.nasa.gov/details/${encodeURIComponent(meta.nasa_id!)}`
  };
}

const validPhoto = (raw: unknown) => {
  const r = spacePhotoSchema.safeParse(raw);
  return r.success ? r.data : null;
};

export async function getSpacePhoto(): Promise<SpacePhoto | null> {
  const day = todayParis();
  const key = `space:${day}`;
  const cached = await cacheGet(key, validPhoto);
  if (cached) return cached;

  return once(key, async () => {
    for (const source of [fromApod, fromLibrary]) {
      try {
        const photo = validPhoto(await source(day));
        if (photo) {
          await cacheSet(key, photo);
          return photo;
        }
      } catch (err) {
        console.warn(`[space] ${source.name} indisponible :`, err instanceof Error ? err.message : err);
      }
    }
    return null;
  });
}
