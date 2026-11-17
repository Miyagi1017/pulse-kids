/**
 * Gabarit de film Lemo-Opuscar pour Pulse Kids : une page que Lemo filme image par image (window.DUR,
 * window.render(t), window.READY ; voir lemo-opuscar/core/README.md). L'image : frame.ts.
 * Regroupé par esbuild en film.js + film.css (scripts/lemo/render.sh).
 */
import '@fontsource/fredoka/latin-500.css';
import '../../../src/films/fonts';
import { filmFrame, type Story } from './frame';

declare global {
  interface Window {
    DUR: number;
    READY: boolean;
    render: (t: number) => void;
  }
}

export async function boot(canvas: HTMLCanvasElement, story: Story) {
  await document.fonts.ready;
  const frame = filmFrame(story);
  const ctx = canvas.getContext('2d')!;
  window.DUR = story.dur;
  window.render = (t: number) => frame.render(ctx, t);
  window.render(0);
  window.READY = true;
}
