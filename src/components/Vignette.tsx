import { memo, useEffect, useRef } from 'react';

/** Dessine une fois dans le repère 960 × 540 (scène des kits). */
export type Paint = (ctx: CanvasRenderingContext2D) => void;

const cache = new Map<string, string>();

/**
 * Vignette dessinée en code (une scène des kits, dans son style), à la place d'une photo ou d'un emoji.
 * Elle n'est dessinée qu'une fois, quand elle devient visible, puis gardée en mémoire (image).
 */
export const Vignette = memo(function Vignette({ id, paint, className = '', ratio = '16 / 9' }: { id: string; paint: Paint; className?: string; ratio?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const hit = cache.get(id);
    if (hit && imgRef.current) {
      imgRef.current.src = hit;
      return;
    }
    let done = false;
    const draw = () => {
      if (done) return;
      done = true;
      const w = 480,
        h = 270;
      cv.width = w;
      cv.height = h;
      const g = cv.getContext('2d');
      if (!g) return;
      g.setTransform(w / 960, 0, 0, h / 540, 0, 0);
      try {
        paint(g);
        const url = cv.toDataURL('image/webp', 0.82);
        cache.set(id, url);
        if (imgRef.current) imgRef.current.src = url;
      } catch {
        /* vignette absente : le cadre coloré reste */
      }
    };
    const io = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) {
        io.disconnect();
        void document.fonts.ready.then(draw);
      }
    }, { rootMargin: '200px' });
    io.observe(cv);
    return () => io.disconnect();
  }, [id, paint]);
  return (
    <span className={`relative block overflow-hidden bg-black/5 ${className}`} style={{ aspectRatio: ratio }}>
      <canvas ref={ref} className="absolute inset-0 w-full h-full opacity-0" aria-hidden />
      <img ref={imgRef} alt="" src={cache.get(id)} className="absolute inset-0 w-full h-full object-cover" />
    </span>
  );
});
