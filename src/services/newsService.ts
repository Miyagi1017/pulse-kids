import { DailyActivityPackage, ParentalSettings, UserProgress } from '../types/news';
import { INITIAL_DAILY_STORIES } from '../data/dailyStories';
import { computeStarsCount, determineEarnedBadges } from '../utils/screenTime';

const STORAGE_KEYS = {
  CURRENT_STORY: 'pulse_kids_current_story_v1',
  PROGRESS: 'pulse_kids_progress_v1',
  SETTINGS: 'pulse_kids_parental_settings_v1',
  OFFLINE_MODE: 'pulse_kids_offline_mode_v1',
};

export const DEFAULT_PARENTAL_SETTINGS: ParentalSettings = {
  pin: '1234',
  screenTimeMinutes: 15, // 15 min screen time per user requirement
  audioWarningMinutesBefore: 2,
  speechRate: 0.85,
  soundEffectsEnabled: true,
  autoPlayNextActivity: false,
  dailyGoalStars: 5,
  topicsAllowed: {
    nature: true,
    science: true,
    animals: true,
    inventions: true,
    space: true,
  }
};

export const DEFAULT_USER_PROGRESS: UserProgress = {
  completedActivities: [],
  starsEarned: 0,
  unlockedBadges: ['curieux-debutant'],
  wordsDiscovered: ['bâtisseur', 'chaudière', 'radiateur'],
  timeSpentSecondsToday: 0,
  lastVisitDate: new Date().toISOString().slice(0, 10)
};

export function loadSavedSettings(): ParentalSettings {
  if (typeof window === 'undefined') return DEFAULT_PARENTAL_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_PARENTAL_SETTINGS;
    return { ...DEFAULT_PARENTAL_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PARENTAL_SETTINGS;
  }
}

export function saveSettings(settings: ParentalSettings) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

export function loadSavedProgress(): UserProgress {
  if (typeof window === 'undefined') return DEFAULT_USER_PROGRESS;
  try {
    const today = new Date().toISOString().slice(0, 10);
    const raw = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    if (!raw) return { ...DEFAULT_USER_PROGRESS, lastVisitDate: today };
    const parsed: UserProgress = JSON.parse(raw);

    // Reset daily counters if new day
    if (parsed.lastVisitDate !== today) {
      return {
        ...parsed,
        completedActivities: [],
        starsEarned: 0,
        timeSpentSecondsToday: 0,
        lastVisitDate: today
      };
    }
    return parsed;
  } catch {
    return DEFAULT_USER_PROGRESS;
  }
}

export function saveProgress(progress: UserProgress) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
  } catch (err) {
    console.error('Failed to save progress:', err);
  }
}

export function loadCurrentStory(): DailyActivityPackage {
  if (typeof window === 'undefined') return INITIAL_DAILY_STORIES[0];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_STORY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return INITIAL_DAILY_STORIES[0];
}

export function saveCurrentStory(story: DailyActivityPackage) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_STORY, JSON.stringify(story));
  } catch (err) {
    console.error('Failed to save story:', err);
  }
}

export async function fetchDailyNewsAi(isOffline: boolean): Promise<DailyActivityPackage> {
  // If offline, pick from local pre-packaged stories
  if (isOffline) {
    const storyIdx = Math.floor(Math.random() * INITIAL_DAILY_STORIES.length);
    return INITIAL_DAILY_STORIES[storyIdx];
  }

  try {
    const res = await fetch('/api/news/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.story) {
        saveCurrentStory(data.story);
        return data.story;
      }
    }
  } catch (err) {
    console.warn('API generation failed, falling back to local story archive:', err);
  }

  // Fallback to rotating local story
  const randomStory = INITIAL_DAILY_STORIES[Math.floor(Math.random() * INITIAL_DAILY_STORIES.length)];
  return randomStory;
}
