import type { Film } from './engine';
import { lune } from './lune';
import { chaussettes } from './chaussettes';
import { popup } from './popup';

/** Les petits films, dans l'ordre de la liste (un calme, un rythmé, un défi). */
export const FILMS: Film[] = [lune, chaussettes, popup];

export function filmOf(id: string): Film {
  return FILMS.find((f) => f.id === id) ?? FILMS[0];
}

export function nextFilm(id: string): Film {
  const i = FILMS.findIndex((f) => f.id === id);
  return FILMS[(i + 1) % FILMS.length];
}

export type { Film } from './engine';
