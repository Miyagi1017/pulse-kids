/**
 * La chronologie d'un film MP4 (gabarit Lemo-Opuscar, video/lemo/pulse-film) : le rythme vient de la voix.
 * Chaque plan = une respiration, la phrase dite, la pause après la phrase (PACE), avec un minimum de durée ;
 * une phrase avec prénom est dite en deux morceaux séparés par un silence où l'app dira le prénom (names).
 */
import { PACE } from './pacing';

/** En secondes. */
export const FILM_PACE = { titleLead: 0.8, titleMin: 4.5, lead: 0.5, shotMin: 5, tail: 0.3, nameGap: 0.7, end: 2.5 } as const;

/** Un morceau de voix (prise et sa durée) ou la place du prénom. */
export type VoicePart = { src: string; dur: number } | { name: true };

export interface FilmTimeline {
  /** Début de chaque plan (0 = titre). */
  scenes: number[];
  /** Moments où le prénom doit être dit (silence dans le film). */
  names: number[];
  /** Où poser chaque prise dans le mixage. */
  voices: { src: string; at: number }[];
  /** Durée totale, carton de fin compris. */
  dur: number;
}

export function filmTimeline(shots: VoicePart[][]): FilmTimeline {
  const tl: FilmTimeline = { scenes: [], names: [], voices: [], dur: 0 };
  let t = 0;
  shots.forEach((parts, i) => {
    tl.scenes.push(t);
    let at = t + (i === 0 ? FILM_PACE.titleLead : FILM_PACE.lead);
    for (const p of parts) {
      if ('name' in p) {
        tl.names.push(at);
        at += FILM_PACE.nameGap;
      } else {
        tl.voices.push({ src: p.src, at });
        at += p.dur;
      }
    }
    t = Math.max(t + (i === 0 ? FILM_PACE.titleMin : FILM_PACE.shotMin), at + PACE.pauseAfterLine + FILM_PACE.tail);
  });
  tl.dur = t + FILM_PACE.end;
  return tl;
}
