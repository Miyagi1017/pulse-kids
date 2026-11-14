import { useEffect, useRef } from 'react';
import { createHoseCoach, CH, CW } from '../sport/hoseCoach';
import type { PoseName } from '../lib/poses';

/**
 * Le coach en dessin animé des années 30 qui montre le mouvement du défi.
 * Le mouvement n'avance que pendant l'exercice (playing) ; en pause, il se fige dans sa pose.
 * Si l'appareil demande moins d'animations, il montre la posture sans bouger.
 */
export function HoseCoach({ pose, playing, className = '' }: { pose: PoseName; playing: boolean; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const playingRef = useRef(playing);
  playingRef.current = playing;

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const coach = createHoseCoach(2);
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let raf = 0,
      alive = true,
      moveT = 0,
      last = performance.now();
    const start = last;
    const frame = () => {
      if (!alive) return;
      const now = performance.now();
      if (playingRef.current && !reduced) moveT += (now - last) / 1000;
      last = now;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round((cv.clientWidth || CW) * dpr);
      const h = Math.round((w * CH) / CW);
      if (cv.width !== w || cv.height !== h) {
        cv.width = w;
        cv.height = h;
      }
      const g = cv.getContext('2d')!;
      g.setTransform(w / CW, 0, 0, h / CH, 0, 0);
      coach.render(g, { pose, t: reduced ? 0.6 : moveT, clock: (now - start) / 1000, still: reduced });
      if (!reduced) raf = requestAnimationFrame(frame);
    };
    frame();
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      coach.dispose();
    };
  }, [pose]);

  return <canvas ref={ref} className={`block rounded-[1.75rem] shadow-bonbon ${className}`} style={{ aspectRatio: `${CW} / ${CH}` }} role="img" aria-label="Le coach montre le mouvement" />;
}
