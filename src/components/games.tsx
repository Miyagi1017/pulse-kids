import { useMemo, useState, type MouseEvent } from 'react';
import { motion } from 'motion/react';
import { soundEffects } from '../utils/soundEffects';
import { burst, pointOf } from './fx';
import { PRESS, SHAKE, SPRING_BOUNCY } from '../lib/motion';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Mémoire : on retourne deux cartes ; si elles sont pareilles, elles restent visibles.
 * Toutes les paires trouvées → gagné.
 */
export function MemoryGame({ pairs, onWin }: { pairs: string[]; onWin: () => void }) {
  const cards = useMemo(() => shuffle([...pairs, ...pairs].map((emoji, i) => ({ key: `${emoji}-${i}`, emoji }))), [pairs]);
  const [open, setOpen] = useState<number[]>([]);
  const [found, setFound] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  const flip = (i: number, e: MouseEvent<HTMLButtonElement>) => {
    if (busy || open.includes(i) || found.has(cards[i].emoji)) return;
    soundEffects.playWhoosh();
    const next = [...open, i];
    setOpen(next);
    if (next.length < 2) return;
    const [a, b] = next.map((k) => cards[k].emoji);
    if (a === b) {
      const p = pointOf(e);
      burst(p.x, p.y, [a, '✨', '⭐'], 8);
      soundEffects.playSparkle();
      const nowFound = new Set(found).add(a);
      setFound(nowFound);
      setOpen([]);
      if (nowFound.size === pairs.length) setTimeout(onWin, 450);
    } else {
      soundEffects.playOops();
      setBusy(true);
      setTimeout(() => {
        setOpen([]);
        setBusy(false);
      }, 900);
    }
  };

  const cols = cards.length <= 6 ? 'grid-cols-3' : 'grid-cols-4';
  return (
    <div className={`grid ${cols} gap-3 w-full max-w-md`} role="grid" aria-label="Cartes à retourner">
      {cards.map((c, i) => {
        const visible = open.includes(i) || found.has(c.emoji);
        const matched = found.has(c.emoji);
        return (
          <motion.button
            key={c.key}
            onClick={(e) => flip(i, e)}
            whileTap={PRESS}
            animate={{ rotateY: visible ? 0 : 180, scale: matched ? [1, 1.12, 1] : 1 }}
            transition={SPRING_BOUNCY}
            className={`relative aspect-square rounded-3xl shadow-bonbon text-5xl sm:text-6xl flex items-center justify-center ${matched ? 'bg-menthe-clair ring-4 ring-menthe' : visible ? 'bg-white' : 'bg-lavande'}`}
            style={{ transformStyle: 'preserve-3d' }}
            aria-label={visible ? c.emoji : 'Carte cachée'}
          >
            <span style={{ backfaceVisibility: 'hidden' }}>{visible ? c.emoji : ''}</span>
            {!visible && (
              <span className="absolute text-3xl text-white" style={{ transform: 'rotateY(180deg)' }} aria-hidden>
                ❓
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

/**
 * Touche tous les… : une grille mélangée ; toucher une bonne réponse l'allume,
 * toucher une mauvaise la fait trembler. Toutes trouvées → gagné.
 */
export function FindAllGame({ targets, others, onWin, onMiss, hint = false }: { targets: string[]; others: string[]; onWin: () => void; onMiss: (emoji: string) => void; hint?: boolean }) {
  const items = useMemo(() => shuffle([...targets.map((e) => ({ e, ok: true })), ...others.map((e) => ({ e, ok: false }))]), [targets, others]);
  const [found, setFound] = useState<Set<number>>(new Set());
  const [shake, setShake] = useState<number | null>(null);

  const touch = (i: number, e: MouseEvent<HTMLButtonElement>) => {
    if (found.has(i)) return;
    if (items[i].ok) {
      soundEffects.playPop();
      const p = pointOf(e);
      burst(p.x, p.y, [items[i].e, '✨'], 6);
      const next = new Set(found).add(i);
      setFound(next);
      if (next.size === targets.length) setTimeout(onWin, 400);
    } else {
      setShake(i);
      setTimeout(() => setShake(null), 500);
      onMiss(items[i].e);
    }
  };

  return (
    <div className="w-full max-w-md">
      <p className="mb-3 font-semibold text-doux">
        {found.size} / {targets.length} trouvés
      </p>
      <div className="grid grid-cols-4 gap-3" role="group">
        {items.map((it, i) => (
          <motion.button
            key={i}
            onClick={(e) => touch(i, e)}
            whileTap={PRESS}
            animate={shake === i ? SHAKE : found.has(i) ? { scale: [1, 1.18, 1.05] } : hint && it.ok ? { scale: [1, 1.12, 1], rotate: [0, -6, 6, 0] } : { scale: 1 }}
            transition={hint && it.ok && !found.has(i) ? { duration: 0.9, repeat: Infinity } : undefined}
            className={`aspect-square rounded-3xl shadow-bonbon text-4xl sm:text-5xl flex items-center justify-center ${found.has(i) ? 'bg-menthe-clair ring-4 ring-menthe' : hint && it.ok ? 'bg-soleil-clair ring-4 ring-soleil' : 'bg-white'}`}
            aria-label={it.e}
            aria-pressed={found.has(i)}
          >
            {it.e}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
