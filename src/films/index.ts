import type { Film } from './engine';
import { lune } from './lune';
import { chaussettes } from './chaussettes';
import { popup } from './popup';
import { fraise } from './fraise';
import { tour } from './tour';
import { goutte } from './goutte';
import { coccinelle } from './coccinelle';

/** Les petits films, dans l'ordre de la liste (on alterne moments calmes, rythmés et défis). */
export const FILMS: Film[] = [lune, chaussettes, popup, goutte, fraise, tour, coccinelle];

export function filmOf(id: string): Film {
  return FILMS.find((f) => f.id === id) ?? FILMS[0];
}

export function nextFilm(id: string): Film {
  const i = FILMS.findIndex((f) => f.id === id);
  return FILMS[(i + 1) % FILMS.length];
}

export type { Film } from './engine';
