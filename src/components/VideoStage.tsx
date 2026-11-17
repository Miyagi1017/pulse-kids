import { useEffect, useRef } from 'react';
import { createVideoScene, type CodedVideo } from '../videos/videoScene';
import { swatch } from '../kits/styles';
import { storybookStyleFor } from '../videos/pacing';
import type { Paint } from './Vignette';

/**
 * Le dessin animé d'une vidéo du jour (rendu en code, dans le style de la vidéo).
 * Le temps repart de zéro à chaque scène ; en pause, l'image s'arrête.
 */
export function VideoStage({ video, scene, playing, className = '' }: { video: CodedVideo; scene: number; playing: boolean; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const playingRef = useRef(playing);
  playingRef.current = playing;
  const sceneRef = useRef(scene);
  sceneRef.current = scene;
  const redraw = useRef<() => void>(() => undefined);
  // Mouvements réduits : pas de boucle d'animation, on redessine seulement quand le plan change.
  useEffect(() => {
    redraw.current();
  }, [scene]);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const vs = createVideoScene(video);
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let raf = 0,
      alive = true,
      t = reduced ? 3 : 0,
      shown = sceneRef.current,
      last = performance.now();
    const frame = () => {
      if (!alive) return;
      const now = performance.now();
      // Nouveau plan : le temps du plan repart de zéro (la scène garde l'image précédente pour la transition).
      if (sceneRef.current !== shown) {
        shown = sceneRef.current;
        t = reduced ? 3 : 0;
      }
      if (playingRef.current && !reduced) t += Math.min(0.1, (now - last) / 1000);
      last = now;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.min(1600, Math.round((cv.clientWidth || 960) * dpr)),
        h = Math.round((w * 9) / 16);
      if (cv.width !== w || cv.height !== h) {
        cv.width = w;
        cv.height = h;
      }
      const g = cv.getContext('2d')!;
      g.setTransform(w / 960, 0, 0, h / 540, 0, 0);
      vs.render(g, shown, t, !!reduced);
      if (!reduced) raf = requestAnimationFrame(frame);
    };
    redraw.current = () => {
      if (alive && reduced) frame();
    };
    void document.fonts.ready.then(() => alive && frame());
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      vs.dispose();
    };
  }, [video]);
  return <canvas ref={ref} className={`block w-full ${className}`} style={{ aspectRatio: '16 / 9' }} role="img" aria-label={`${video.title}, dessin animé`} />;
}

/** Couleur de papier du style de la vidéo (fond autour de l'image, sous le texte). */
export function videoPaper(video: { id: string }) {
  return swatch(storybookStyleFor(video.id));
}

/** Vignette d'une vidéo : la scène de présentation, figée. */
const posters = new Map<string, Paint>();
export function videoPoster(video: CodedVideo): Paint {
  const hit = posters.get(video.id);
  if (hit) return hit;
  const p: Paint = (ctx) => {
    const vs = createVideoScene(video);
    vs.render(ctx, 1, 2.6, true);
    vs.dispose();
  };
  posters.set(video.id, p);
  return p;
}
