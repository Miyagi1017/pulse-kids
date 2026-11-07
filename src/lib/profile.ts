/**
 * Profil de l'enfant : prénom + avatar, stockés UNIQUEMENT sur l'appareil.
 * Rien n'est envoyé au serveur (le prénom est inséré localement dans les textes).
 */
import { useCallback, useState } from 'react';

export interface Profile {
  name: string;
  avatar: string;
}

export const AVATARS = ['🦊', '🐼', '🦁', '🐸', '🐙', '🦄', '🐢', '🐧', '🐰', '🐻'];

const PROFILE_KEY = 'pulse_kids_profile_v3';
const DONE_KEY = 'pulse_kids_done_v3';

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
    /* navigation privée : on garde en mémoire */
  }
}

/** Prénom : lettres, espaces, tirets, apostrophes ; 20 caractères max. */
export function cleanName(input: string): string {
  return input
    .replace(/[^\p{L}\p{M}' -]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 20)
    .replace(/^\p{L}/u, (c) => c.toUpperCase());
}

export function useProfile() {
  const [profile, setProfileState] = useState<Profile | null>(() => {
    const p = read<Profile>(PROFILE_KEY);
    return p && cleanName(p.name) ? { name: cleanName(p.name), avatar: AVATARS.includes(p.avatar) ? p.avatar : AVATARS[0] } : null;
  });
  const setProfile = useCallback((p: Profile) => {
    const next = { name: cleanName(p.name), avatar: p.avatar };
    write(PROFILE_KEY, next);
    setProfileState(next);
  }, []);
  return { profile, setProfile };
}

/** Contenus terminés (conte lu, activité réussie) → petite coche ✓. */
export function useDone() {
  const [done, setDone] = useState<Set<string>>(() => new Set(read<string[]>(DONE_KEY) ?? []));
  const markDone = useCallback((id: string) => {
    setDone((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev).add(id);
      write(DONE_KEY, [...next]);
      return next;
    });
  }, []);
  return { done, markDone };
}

/** Purge des données des versions précédentes (dont un ancien code PIN en clair). */
export function purgeLegacyStorage() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith('pulse_kids_') && !k.endsWith('_v3'))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}
