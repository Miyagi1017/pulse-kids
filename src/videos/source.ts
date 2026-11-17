/**
 * Version film (MP4 Lemo-Opuscar, public/films-mp4/<id>.mp4) ou version dessin animé en code ?
 * Le film seulement en ligne et s'il existe (liste : mp4-index.json) ; hors ligne, ou si le film ne se charge pas,
 * le dessin animé en code reprend à la même scène. À côté de chaque film, <id>.json donne le début de chaque
 * scène (scenes, secondes) et les moments où le prénom doit être dit (names, secondes ; le film y laisse un silence).
 */
import INDEX from './mp4-index.json';

export interface FilmCues {
  scenes: number[];
  names: number[];
}

export const MP4_INDEX: readonly string[] = INDEX;

export function pickSource(id: string, online: boolean, index: readonly string[] = MP4_INDEX): 'mp4' | 'code' {
  return online && index.includes(id) ? 'mp4' : 'code';
}

export const mp4Url = (id: string) => `/films-mp4/${id}.mp4`;
export const cuesUrl = (id: string) => `/films-mp4/${id}.json`;

/** La scène dont le début est le dernier ≤ t. */
export function sceneAt(times: readonly number[], t: number): number {
  let s = 0;
  for (let i = 0; i < times.length; i++) if (times[i] <= t) s = i;
  return s;
}

/** Les moments de prénom passés entre deux images (from exclu, to inclus). */
export function nameAt(names: readonly number[], from: number, to: number): number[] {
  return names.filter((n) => n > from && n <= to);
}
