/**
 * Photos des mini-vidéos (licences libres, relues — scripts/fetch-video-images.ts) et leurs crédits.
 * Vite ne fournit que les URL : chaque photo n'est téléchargée qu'à l'affichage.
 */
import credits from './videoCredits.json';

const files = import.meta.glob<string>('../assets/video-images/*.webp', { eager: true, query: '?url', import: 'default' });
const byId = new Map(Object.entries(files).map(([f, url]) => [f.split('/').pop()!.replace('.webp', ''), url]));

export interface PhotoCredit {
  title: string;
  creator: string;
  license: string;
  licenseUrl: string;
  source: string;
}

export function videoPhoto(id: string): { url: string; credit?: PhotoCredit } | undefined {
  const url = byId.get(id);
  return url ? { url, credit: (credits as Record<string, PhotoCredit>)[id] } : undefined;
}

/** Crédit court affiché sous la photo (exigé par les licences CC BY / BY-SA). */
export function creditLine(c?: PhotoCredit): string | undefined {
  if (!c) return undefined;
  return `${c.creator} — ${c.license}`;
}
