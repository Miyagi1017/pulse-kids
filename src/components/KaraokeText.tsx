import { Fragment, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { voiceProgress, voiceTime } from '../videos/voice';
import { wordStarts } from '../videos/timing';

/**
 * Le texte de la scène, dont les mots s'allument pendant que Christine les dit.
 * Règles Video-Making (sous-titres karaoké) : chaque mot s'allume à l'instant mesuré par l'alignement forcé
 * (src/videos/timing.json), jamais estimé ; le mot en cours est mis en couleur avec un petit rebond,
 * les mots déjà dits sont pleins, ceux à venir estompés.
 * Sans minutage (journal du jour, voix du navigateur), on retombe sur une estimation par la position dans la phrase.
 */
export function KaraokeText({ text, raw, id, scene, className = '' }: { text: string; raw?: string; id?: string; scene?: number; className?: string }) {
  const words = useMemo(() => {
    const out: { w: string; at: number }[] = [];
    let pos = 0;
    for (const w of text.split(/(\s+)/)) {
      if (w.trim()) out.push({ w, at: (pos + w.length * 0.3) / Math.max(1, text.length) });
      pos += w.length;
    }
    return out;
  }, [text]);
  const starts = useMemo(() => (id && scene !== undefined && raw ? wordStarts(id, scene, raw, words.map((x) => x.w)) : null), [id, scene, raw, words]);
  const [now, setNow] = useState<{ t: number | null; p: number | null }>({ t: null, p: null });
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      setNow({ t: voiceTime(), p: voiceProgress() });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text]);

  // Le mot en cours : le dernier dont le début est passé.
  let active = -1;
  if (starts && now.t !== null) starts.forEach((s, i) => s <= now.t! && (active = i));
  return (
    <span className={className}>
      {words.map(({ w, at }, i) => {
        let style: CSSProperties;
        if (starts && now.t !== null) {
          const since = now.t - starts[i];
          const pop = i === active && since < 0.12 ? 1 + 0.08 * Math.sin((since / 0.12) * Math.PI) : 1;
          style = {
            opacity: i <= active ? 1 : 0.38,
            color: i === active ? 'var(--karaoke, #d97706)' : undefined,
            display: 'inline-block',
            transform: `scale(${pop})`
          };
        } else {
          style = { opacity: now.p === null || at <= now.p + 0.02 ? 1 : 0.38 };
        }
        // L'espace reste hors du mot : un bloc en ligne (pour le rebond) avalerait l'espace final.
        return (
          <Fragment key={i}>
            <span className="transition-opacity duration-150" style={style}>
              {w}
            </span>
            {i < words.length - 1 ? ' ' : ''}
          </Fragment>
        );
      })}
    </span>
  );
}
