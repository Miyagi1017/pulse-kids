import { useEffect, useMemo, useState } from 'react';
import { voiceProgress } from '../videos/voice';

/**
 * Le texte de la scène, dont les mots s'allument pendant que Christine les dit
 * (synchronisation à la voix, comme les tableaux « board-sync »). L'avancement vient de la prise
 * en cours ; on répartit les mots selon leur position dans la phrase. Sans prise : texte normal.
 */
export function KaraokeText({ text, className = '' }: { text: string; className?: string }) {
  const words = useMemo(() => {
    const out: { w: string; at: number }[] = [];
    let pos = 0;
    for (const w of text.split(/(\s+)/)) {
      if (w.trim()) out.push({ w, at: (pos + w.length * 0.3) / Math.max(1, text.length) });
      pos += w.length;
    }
    return out;
  }, [text]);
  const [p, setP] = useState<number | null>(null);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      setP(voiceProgress());
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text]);
  return (
    <span className={className}>
      {words.map(({ w, at }, i) => (
        <span key={i} className="transition-opacity duration-150" style={{ opacity: p === null || at <= p + 0.02 ? 1 : 0.38 }}>
          {w}
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </span>
  );
}
