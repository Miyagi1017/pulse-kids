import { useEffect, useRef } from 'react';
import type { Comptine } from '../data/comptines';
import { createComptineScene, type ComptineScene } from '../kits/comptineScene';
import { H, W } from '../films/engine';
import { soundEffects } from '../utils/soundEffects';
import type { ComptineTiming } from './stage';
import '../films/fonts';

/**
 * La scène d'une comptine, dessinée en direct sur un canvas avec les kits de style :
 * chaque thème a son style (animaux en papier découpé, compter en briques, émotions en ombres…).
 * Le temps vient de la bande-son, donc l'image reste calée sur le chant.
 * Pendant la chanson, l'enfant peut toucher les objets qui flottent pour les attraper.
 * Sans élément audio (vignette), la scène est figée à l'instant `still`.
 */
export function ComptineStage({
  comptine,
  timing,
  media,
  still,
  className = '',
  onCatch
}: {
  comptine: Comptine;
  timing: ComptineTiming;
  /** Gardé pour compatibilité : les kits choisissent leurs couleurs selon le thème. */
  palette?: 'fille' | 'garcon';
  media?: React.RefObject<HTMLMediaElement | null>;
  still?: number;
  className?: string;
  onCatch?: (total: number) => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<ComptineScene | null>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const scene = createComptineScene(comptine, timing);
    sceneRef.current = scene;
    let raf = 0;
    let cancelled = false;
    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.min(1920, Math.round((cv.clientWidth || 640) * dpr));
      const h = Math.round((w * H) / W);
      if (cv.width !== w || cv.height !== h) {
        cv.width = w;
        cv.height = h;
      }
      const g = cv.getContext('2d')!;
      g.setTransform(cv.width / W, 0, 0, cv.height / H, 0, 0);
      return g;
    };
    void document.fonts.ready.then(() => {
      if (cancelled) return;
      if (!media) {
        scene.render(fit(), still ?? timing.lines[4][0] + 0.8, true);
        return;
      }
      const loop = () => {
        scene.render(fit(), media.current?.currentTime ?? 0);
        raf = requestAnimationFrame(loop);
      };
      loop();
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      scene.dispose();
      sceneRef.current = null;
    };
  }, [comptine, timing, media, still]);

  const onPointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const scene = sceneRef.current;
    if (!scene || !media?.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W;
    const y = ((e.clientY - r.top) / r.height) * H;
    if (scene.tap(x, y, media.current.currentTime)) {
      soundEffects.playPop();
      onCatch?.(scene.collected());
    }
  };

  return (
    <canvas
      ref={ref}
      onPointerDown={onPointer}
      className={`block touch-none select-none ${className}`}
      style={{ aspectRatio: `${W} / ${H}` }}
      role="img"
      aria-label={`Dessin animé : ${comptine.title}`}
    />
  );
}
