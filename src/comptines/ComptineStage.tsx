import { useEffect, useRef } from 'react';
import type { Comptine } from '../data/comptines';
import { comptineFrame, type ComptineTiming } from './stage';

/**
 * La scène d'une comptine, dessinée en direct : à chaque image, on lit l'heure de la bande-son
 * et on redessine le SVG (sans passer par React, pour rester fluide même sur une tablette).
 * Sans élément audio (vignette), la scène est figée à l'instant `still`.
 */
export function ComptineStage({
  comptine,
  timing,
  palette,
  media,
  still,
  className = ''
}: {
  comptine: Comptine;
  timing: ComptineTiming;
  palette: 'fille' | 'garcon';
  media?: React.RefObject<HTMLMediaElement | null>;
  still?: number;
  className?: string;
}) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let last = -1;
    const draw = (t: number) => {
      // ~30 images/s suffisent (comme la vidéo) : on évite de redessiner pour rien.
      if (Math.abs(t - last) < 1 / 32 && last >= 0) return;
      last = t;
      el.innerHTML = comptineFrame(comptine, timing, t, palette);
    };
    if (!media) {
      draw(still ?? timing.lines[4][0] + 0.8);
      return;
    }
    let raf = 0;
    const loop = () => {
      draw(media.current?.currentTime ?? 0);
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [comptine, timing, palette, media, still]);

  return <div ref={host} className={`[&>svg]:w-full [&>svg]:h-full [&>svg]:block ${className}`} role="img" aria-label={`Dessin animé : ${comptine.title}`} />;
}
