import type { DailyActivityPackage, UserProgress } from '../types/news';
import { INITIAL_DAILY_STORIES } from '../data/dailyStories';
import { storySchema } from '../../shared/schemas';

const STORAGE_KEYS = {
  STORY: 'pulse_kids_story_v2',
  PROGRESS: 'pulse_kids_progress_v2',
  // Anciennes clés (dont l'ancien code PIN stocké en clair) : supprimées au démarrage.
  LEGACY: ['pulse_kids_current_story_v1', 'pulse_kids_progress_v1', 'pulse_kids_parental_settings_v1', 'pulse_kids_offline_mode_v1']
};

/** Rythme de lecture adapté aux enfants de 5 ans. */
export const SPEECH_RATE = 0.85;

export function todayKey(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(new Date());
}

export function emptyProgress(): UserProgress {
  return {
    completedActivities: [],
    starsEarned: 0,
    unlockedBadges: ['curieux-debutant'],
    wordsDiscovered: [],
    timeSpentSecondsToday: 0,
    lastVisitDate: todayKey()
  };
}

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / navigation privée : l'app continue en mémoire */
  }
}

export function purgeLegacyStorage() {
  try {
    STORAGE_KEYS.LEGACY.forEach((k) => localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}

// ---- Progression ----

export function loadSavedProgress(): UserProgress {
  const parsed = read<UserProgress>(STORAGE_KEYS.PROGRESS);
  if (!parsed) return emptyProgress();
  if (parsed.lastVisitDate !== todayKey()) {
    // Nouveau jour : on garde badges et vocabulaire, les missions repartent à zéro.
    return { ...parsed, completedActivities: [], starsEarned: 0, timeSpentSecondsToday: 0, lastVisitDate: todayKey() };
  }
  return parsed;
}

export function saveProgress(progress: UserProgress) {
  write(STORAGE_KEYS.PROGRESS, progress);
}

// ---- Édition du jour ----

/** Histoire embarquée choisie selon la date : elle change chaque jour, même hors ligne. */
export function localStoryForToday(): DailyActivityPackage {
  const day = Math.floor(Date.parse(todayKey()) / 86400000);
  return INITIAL_DAILY_STORIES[day % INITIAL_DAILY_STORIES.length];
}

export function loadCachedStory(): DailyActivityPackage {
  const cached = read<{ day: string; story: DailyActivityPackage }>(STORAGE_KEYS.STORY);
  if (cached?.day === todayKey()) return cached.story;
  return localStoryForToday();
}

/** Récupère l'édition IA du jour (revalidée côté client). Renvoie null si indisponible. */
export async function fetchTodayStory(): Promise<DailyActivityPackage | null> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return null;
  try {
    const res = await fetch('/api/news/today');
    if (!res.ok) return null;
    const data = await res.json();
    const parsed = storySchema.safeParse(data.story);
    if (!parsed.success) return null;
    const story = parsed.data as DailyActivityPackage;
    write(STORAGE_KEYS.STORY, { day: todayKey(), story });
    return story;
  } catch {
    return null;
  }
}

// ---- Photo de l'espace du jour (NASA) ----

export interface SpacePhotoData {
  date: string;
  title: string;
  caption: string;
  emoji: string;
  imageUrl: string;
  originalTitle: string;
  credit: string;
  link: string;
}

const NASA_HOSTS = ['apod.nasa.gov', 'images-assets.nasa.gov'];

export async function fetchSpacePhoto(): Promise<SpacePhotoData | null> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return null;
  try {
    const res = await fetch('/api/space/today');
    if (!res.ok) return null;
    const { photo } = (await res.json()) as { photo: SpacePhotoData | null };
    if (!photo || typeof photo.imageUrl !== 'string') return null;
    // Défense en profondeur : seules les images NASA https sont affichées.
    const url = new URL(photo.imageUrl);
    if (url.protocol !== 'https:' || !NASA_HOSTS.includes(url.hostname)) return null;
    return photo;
  } catch {
    return null;
  }
}

/** Autre histoire de la bibliothèque (bouton « nouvelle édition »). */
export function pickAnotherStory(currentId: string): DailyActivityPackage {
  const others = INITIAL_DAILY_STORIES.filter((s) => s.id !== currentId);
  return others[Math.floor(Math.random() * others.length)] ?? INITIAL_DAILY_STORIES[0];
}
