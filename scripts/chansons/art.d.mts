/** Types des dessins de la chanson (art.mjs), pour les réutiliser dans l'app (comptines animées). */
export const C: Record<string, string>;
export const PALETTES: Record<'fille' | 'garcon', Record<string, string>>;
export function applyPalette(name: 'fille' | 'garcon'): void;

export function clamp(v: number, a?: number, b?: number): number;
export function lerp(a: number, b: number, p: number): number;
export function smooth(p: number): number;
export function easeOut(p: number): number;
export function easeIn(p: number): number;
export function easeInOut(p: number): number;
export function backOut(p: number): number;
export function seg(t: number, a: number, b: number, ease?: (p: number) => number): number;
export function bob(t: number, amp?: number, speed?: number, phase?: number): number;

export function text(
  x: number,
  y: number,
  str: string,
  options?: { size?: number; fill?: string; anchor?: string; weight?: number; family?: string; opacity?: number; letter?: number }
): string;
export function star(x: number, y: number, radius: number, fill: string, rot?: number, opacity?: number): string;

export interface KidOptions {
  x?: number;
  y?: number;
  s?: number;
  armL?: number;
  armR?: number;
  tilt?: number;
  blink?: number;
  mouth?: 'smile' | 'open' | 'sad';
  look?: number;
  t?: number;
  walk?: number;
  scaleY?: number;
  girl?: boolean;
}
export function nino(options?: KidOptions): string;
export function nina(options?: KidOptions): string;
export function mila(options?: { x?: number; y?: number; s?: number; tail?: number; blink?: number; tilt?: number; t?: number; jump?: number; look?: number }): string;
export function room(options?: { tidy?: number; t?: number }): string;
export function basket(options?: { x?: number; y?: number; s?: number; fill?: number; wobble?: number }): string;
export function block(options: { x: number; y: number; s?: number; rot?: number; color?: string; symbol?: 'star' | 'heart' | 'dot' }): string;
export function ball(options: { x: number; y: number; s?: number; rot?: number }): string;
export function duck(options: { x: number; y: number; s?: number; rot?: number }): string;
export function sparkle(x: number, y: number, s: number, opacity: number): string;
