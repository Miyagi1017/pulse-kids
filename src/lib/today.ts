import { todaySchema, type Today } from '../../shared/schemas';
import { factFor, frenchDate, seasonFor } from '../../shared/dailyContent';

const CACHE_KEY = 'pulse_kids_today_v3';
const NASA_HOSTS = new Set(['apod.nasa.gov', 'images-assets.nasa.gov']);

export function todayKey(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(new Date());
}

/** Vidéo du jour minimale, construite sans réseau (hors ligne ou serveur indisponible). */
export function offlineToday(): Today {
  const day = todayKey();
  const season = seasonFor(day);
  const [factEmoji, fact] = factFor(day);
  return {
    date: day,
    title: `Le journal du ${frenchDate(day)}`,
    emoji: season.emoji,
    sources: [],
    scenes: [
      { emoji: '👋', bg: 'soleil', text: `Bonjour {p} ! Nous sommes ${frenchDate(day)}. Voici ton journal du jour !` },
      { emoji: season.emoji, bg: 'menthe', text: season.text },
      { emoji: factEmoji, bg: 'rose', text: `Le savais-tu ? ${fact}` },
      { emoji: '🌙', bg: 'lavande', text: 'Ce soir, choisis un conte du soir pour faire de beaux rêves. À demain {p} !' }
    ]
  };
}

function sanitize(raw: unknown): Today | null {
  const parsed = todaySchema.safeParse(raw);
  if (!parsed.success) return null;
  // Défense en profondeur : seules les images NASA en https sont gardées.
  parsed.data.scenes = parsed.data.scenes.map((s) => {
    if (!s.imageUrl) return s;
    try {
      const u = new URL(s.imageUrl);
      return u.protocol === 'https:' && NASA_HOSTS.has(u.hostname) ? s : { ...s, imageUrl: undefined };
    } catch {
      return { ...s, imageUrl: undefined };
    }
  });
  return parsed.data;
}

export function cachedToday(): Today {
  try {
    const raw = JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null');
    const t = sanitize(raw);
    if (t && t.date === todayKey()) return t;
  } catch {
    /* ignore */
  }
  return offlineToday();
}

export async function fetchToday(): Promise<Today | null> {
  if (!navigator.onLine) return null;
  try {
    const res = await fetch('/api/today');
    if (!res.ok) return null;
    const t = sanitize((await res.json()).today);
    if (!t) return null;
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(t));
    } catch {
      /* ignore */
    }
    return t;
  } catch {
    return null;
  }
}
