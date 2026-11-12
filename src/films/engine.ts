/**
 * Petits films : moteur commun.
 *
 * Méthode reprise de la bibliothèque claude-video / Lemo-Opuscar (MIT) : l'image est une fonction du temps,
 * dessinée en code sur un canvas, sans vidéo ni modèle génératif. Ici le rendu se fait en direct dans l'app
 * pour garder la pause interactive (l'enfant touche l'écran) et le hors ligne.
 *
 * Un film est une suite de « temps forts » (beats) : une phrase dite à voix haute, puis éventuellement une
 * attente où l'enfant doit toucher une zone. Le film dessine chaque image à partir de l'état ci-dessous.
 */
import type { FilmAudio } from './audio';

/** Taille logique de la scène : tout est dessiné dans ce repère, puis mis à l'échelle de l'écran. */
export const W = 960;
export const H = 540;

export interface TapTarget {
  /** Phrase dite pendant l'attente (déjà comprise dans le texte du beat). */
  hint: string;
  /** Centre de la zone, pour placer la petite main qui montre où toucher. */
  at: (s: FrameState) => { x: number; y: number };
  /** Vrai si le point (repère logique) touche la cible. Sinon, tout l'écran compte. */
  hit: (x: number, y: number, s: FrameState) => boolean;
}

export interface Beat {
  /** Texte affiché (les mots « imprimés » du film) et dit à voix haute. */
  text: string;
  /** Variante pour la synthèse vocale (onomatopées, ponctuation lente). */
  say?: string;
  /** Durée minimale du beat, en secondes, même si la phrase est courte. */
  min?: number;
  /** Temps laissé après la fin de la phrase avant de passer au suivant. */
  hold?: number;
  /** Pause active : le film attend que l'enfant touche la cible. */
  tap?: TapTarget;
}

export interface FrameState {
  /** Secondes écoulées depuis le début du film (horloge continue, pour le tracé vivant et la respiration). */
  t: number;
  /** Indice du beat en cours. */
  beat: number;
  /** Secondes écoulées depuis le début du beat. */
  bt: number;
  /** Le film attend un toucher de l'enfant. */
  waiting: boolean;
  /** Secondes écoulées depuis le toucher réussi de ce beat (null tant que l'enfant n'a pas touché). */
  sinceTap: number | null;
  /** Secondes écoulées depuis la fin du dernier beat (null pendant le film). */
  end: number | null;
  /** Le texte du beat en cours, prénom inséré. */
  caption: string;
  /** Rendu figé (affiche de la liste) : pas d'effets qui dépendent de l'appareil. */
  still?: boolean;
}

export interface FilmScene {
  /** Dessine l'image de l'état s. ctx est déjà mis à l'échelle du repère W × H. */
  render(ctx: CanvasRenderingContext2D, s: FrameState): void;
  /** Appelé à chaque nouveau beat (bruitages calés sur l'action). */
  onBeat?(beat: number, audio: FilmAudio): void;
  /** Appelé au toucher réussi. */
  onTap?(beat: number, audio: FilmAudio): void;
  /** Bruitages calés dans le beat : appelé à chaque image avec le temps précédent et l'actuel. */
  cues?(s: FrameState, prevBt: number, audio: FilmAudio): void;
  /** Libère les canvas hors écran. */
  dispose?(): void;
}

export type FilmStyle = 'crayon' | 'rubber-hose' | 'paper-popup' | 'shadow-puppet' | 'brick-toy' | 'whiteboard' | 'watercolor';

export interface Film {
  id: string;
  title: string;
  emoji: string;
  /** Style visuel, nommé comme dans la bibliothèque de styles. */
  style: FilmStyle;
  styleLabel: string;
  /** Ce que l'enfant apprend (pour le parent). */
  goal: string;
  /** Moment calme (soir) ou dynamique. */
  mood: 'calme' | 'rythme' | 'defi';
  /** L'orchestre s'arrête net pendant l'attente du toucher (et reprend au toucher). */
  freezeOnWait?: boolean;
  beats: Beat[];
  /** État utilisé pour l'affiche. */
  poster: { beat: number; bt: number; sinceTap?: number };
  /** Musique de fond (renvoie une fonction d'arrêt). */
  music: (audio: FilmAudio) => () => void;
  /** Crée la scène (canvas hors écran, cache des décors). */
  create: () => FilmScene;
}

/* ───────────── Aléatoire reproductible (aucun Math.random dans le rendu) ───────────── */

export function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Hachage entier → [0, 1). */
export function hash(...n: number[]): number {
  let h = 2166136261;
  for (const v of n) {
    h ^= Math.floor(v * 1000) | 0;
    h = Math.imul(h, 16777619);
  }
  h ^= h >>> 13;
  h = Math.imul(h, 0x5bd1e995);
  h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

/* ───────────── Courbes de temps ───────────── */

export const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
/** Progression 0→1 entre t0 et t1. */
export const span = (t: number, t0: number, t1: number) => clamp((t - t0) / (t1 - t0));
export const easeOut = (u: number) => 1 - (1 - u) ** 3;
export const easeInOut = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2);
/** Dépassement « back » : le décor en papier qui se déplie dépasse un peu puis se pose. */
export const back = (u: number, k = 1.9) => 1 + (k + 1) * (u - 1) ** 3 + k * (u - 1) ** 2;
/** Ressort amorti (0 → 1 avec rebonds). */
export const spring = (u: number, f = 3.2, d = 5) => (u <= 0 ? 0 : 1 - Math.exp(-d * u) * Math.cos(f * Math.PI * u));
/** Pas de dessin : 12 images par seconde (« sur les deux ») comme un dessin animé à la main. */
export const onTwos = (t: number) => Math.floor(t * 12);

/** Temps de lecture approximatif d'une phrase (quand la voix n'est pas disponible). */
export function readingSeconds(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1.8, words * 0.42 + 0.8);
}
