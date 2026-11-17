/**
 * Gabarit de film Lemo-Opuscar pour Pulse Kids : une page que Lemo filme image par image (window.DUR,
 * window.render(t), window.READY ; voir lemo-opuscar/core/README.md).
 * L'image vient du moteur de dessins animés de l'app (src/videos/videoScene.ts, style du catalogue) ; le
 * gabarit y ajoute la matière d'un film Lemo : grain du papier qui « respire » à 8 images/s, léger tremblé du
 * trait, vignettage, ouverture et carton de fin. Le rythme vient de story.json (src/videos/filmTimeline.ts).
 * Regroupé par esbuild en film.js + film.css (scripts/lemo/render.sh).
 */
import '@fontsource/fredoka/latin-500.css';
import '../../../src/films/fonts';
import { createVideoScene, type CodedVideo } from '../../../src/videos/videoScene';
import { VIDEOS } from '../../../src/data/videos';
import { CAPSULES } from '../../../src/videos/capsules';
import { swatch } from '../../../src/kits/styles';
import { videoStyleFor } from '../../../src/videos/pacing';
import { FILM_PACE } from '../../../src/videos/filmTimeline';

export interface Story {
  id: string;
  title: string;
  dur: number;
  scenes: number[];
}

const W = 1280,
  H = 720,
  BOIL = 8; // images par seconde du grain et du tremblé (le dessin est « refait » 8 fois par seconde)

declare global {
  interface Window {
    DUR: number;
    READY: boolean;
    render: (t: number) => void;
  }
}

/** Bruit reproductible (mulberry32). */
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Quatre feuilles de grain de papier (on passe de l'une à l'autre : le papier « respire »). */
function grains(dark: boolean): HTMLCanvasElement[] {
  return [1, 2, 3, 4].map((k) => {
    const c = document.createElement('canvas');
    c.width = W / 2;
    c.height = H / 2;
    const g = c.getContext('2d')!;
    const img = g.createImageData(c.width, c.height);
    const r = rng(k * 7919);
    for (let i = 0; i < img.data.length; i += 4) {
      const fibre = Math.sin(((i / 4) % c.width) * 0.9 + r() * 2) * 6;
      const v = 200 + r() * 55 + fibre;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = dark ? 255 - v * 0.4 : v;
      img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    return c;
  });
}

export async function boot(canvas: HTMLCanvasElement, story: Story) {
  const video: CodedVideo | undefined = [...VIDEOS, ...CAPSULES].find((v) => v.id === story.id);
  if (!video) throw new Error(`vidéo inconnue : ${story.id}`);
  const style = videoStyleFor(story.id);
  const sw = swatch(style);
  await document.fonts.ready;
  const vs = createVideoScene(video, style);
  const ctx = canvas.getContext('2d')!;
  const pic = document.createElement('canvas');
  pic.width = W;
  pic.height = H;
  const pg = pic.getContext('2d')!;
  const grain = grains(sw.dark);
  const paper = sw.dark ? '#14121c' : sw.paper;
  let shown = -1;

  const sceneAt = (t: number) => {
    let s = 0;
    for (let i = 0; i < story.scenes.length; i++) if (story.scenes[i] <= t) s = i;
    return s;
  };

  window.DUR = story.dur;
  window.render = (t: number) => {
    const s = sceneAt(t);
    // Lemo peut commencer au milieu du film (rendu en parallèle) : on rejoue la fin du plan précédent
    // pour que la transition parte de la bonne image.
    if (s !== shown && s > 0 && shown !== s - 1) {
      pg.setTransform(W / 960, 0, 0, H / 540, 0, 0);
      vs.render(pg, s - 1, Math.max(0, story.scenes[s] - story.scenes[s - 1] - 0.05));
    }
    shown = s;
    pg.setTransform(W / 960, 0, 0, H / 540, 0, 0);
    // Le moteur reçoit le temps réel du plan et ralentit lui-même les gestes (videoScene.ts, SLOW).
    vs.render(pg, s, t - story.scenes[s]);

    const step = Math.floor(t * BOIL);
    const j = rng(step + 1);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = paper;
    ctx.fillRect(0, 0, W, H);
    // Tremblé du trait : l'image entière bouge d'un pixel, 8 fois par seconde.
    ctx.drawImage(pic, (j() - 0.5) * 2, (j() - 0.5) * 2);
    // Grain du papier.
    ctx.save();
    ctx.globalCompositeOperation = sw.dark ? 'screen' : 'multiply';
    ctx.globalAlpha = sw.dark ? 0.06 : 0.16;
    ctx.drawImage(grain[step % grain.length], 0, 0, W, H);
    ctx.restore();
    // Vignettage doux.
    const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.85);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, sw.dark ? 'rgba(0,0,0,0.45)' : 'rgba(60,40,20,0.22)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, W, H);
    // Ouverture depuis le papier, et carton de fin.
    const endAt = story.dur - FILM_PACE.end;
    const fade = Math.max(1 - Math.min(1, t / 0.8), Math.min(1, Math.max(0, (t - endAt) / 0.9)));
    if (fade > 0) {
      ctx.globalAlpha = fade;
      ctx.fillStyle = paper;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }
    if (t > endAt + 0.6) {
      ctx.globalAlpha = Math.min(1, (t - endAt - 0.6) / 0.6);
      ctx.fillStyle = sw.dark ? '#fff8ea' : sw.text;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '500 64px Fredoka';
      ctx.fillText(story.title, W / 2, H / 2 - 30);
      ctx.font = '500 40px Fredoka';
      ctx.fillText('Fin', W / 2, H / 2 + 50);
      ctx.globalAlpha = 1;
    }
  };
  window.render(0);
  window.READY = true;
}
