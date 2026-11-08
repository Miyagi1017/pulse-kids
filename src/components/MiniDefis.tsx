import { useState } from 'react';
import { motion } from 'motion/react';
import { Shuffle } from 'lucide-react';
import { MINI_DEFIS, MINI_FAMILLES, type MiniFamille } from '../data/miniDefis';
import { soundEffects } from '../utils/soundEffects';
import { LIFT, PRESS } from '../lib/motion';
import { TopBar } from './ui';

const FAMILLE_COLOR: Record<MiniFamille, string> = {
  sauter: 'bg-corail-clair',
  equilibre: 'bg-ciel-clair',
  muscles: 'bg-soleil-clair',
  souplesse: 'bg-menthe-clair',
  coordination: 'bg-rose-clair',
  calme: 'bg-lavande-clair'
};

/** Les 160 mini-défis : l'enfant choisit (par famille) ou tire une surprise. */
export function MiniDefis({ done, onBack, onPlay, initialFamille }: { done: Set<string>; onBack: () => void; onPlay: (id: string) => void; initialFamille?: MiniFamille | null }) {
  const [famille, setFamille] = useState<MiniFamille | null>(initialFamille ?? null);
  const list = famille ? MINI_DEFIS.filter((d) => d.famille === famille) : MINI_DEFIS;
  const nbDone = list.filter((d) => done.has(d.id)).length;

  const play = (id: string) => {
    soundEffects.playPop();
    onPlay(id);
  };
  const surprise = () => {
    const pool = list.filter((d) => !done.has(d.id));
    const from = pool.length ? pool : list;
    play(from[Math.floor(Math.random() * from.length)].id);
  };

  return (
    <div className="min-h-dvh">
      <TopBar
        title="Mini-défis"
        emoji="🎯"
        onBack={onBack}
        right={
          <button onClick={surprise} className="press shadow-bonbon h-12 px-4 rounded-2xl bg-corail text-white font-semibold flex items-center gap-2">
            <Shuffle className="w-5 h-5" /> <span className="hidden sm:inline">Surprise !</span>
          </button>
        }
      />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pb-10 pt-2">
        <p className="text-doux mb-3">
          {nbDone} sur {list.length} réussis. Choisis un mini-défi d’environ 30 secondes !
        </p>
        <div className="flex gap-2 overflow-x-auto pb-3 mb-2 -mx-4 px-4" role="tablist" aria-label="Familles de mini-défis">
          {([null, ...(Object.keys(MINI_FAMILLES) as MiniFamille[])] as (MiniFamille | null)[]).map((f) => {
            const active = famille === f;
            const info = f ? MINI_FAMILLES[f] : { label: 'Tous', emoji: '🎲' };
            return (
              <button
                key={f ?? 'tous'}
                role="tab"
                aria-selected={active}
                onClick={() => {
                  soundEffects.playPop();
                  setFamille(f);
                }}
                className={`press shrink-0 rounded-full px-4 py-2 font-semibold whitespace-nowrap ${active ? 'bg-corail text-white shadow-bonbon' : 'bg-white text-encre'}`}
              >
                {info.emoji} {info.label}
              </button>
            );
          })}
        </div>
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {list.map((d, i) => {
            const isDone = done.has(d.id);
            const seconds = d.moves.reduce((t, m) => t + m.seconds, 0);
            return (
              <motion.li key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 16) * 0.02 }}>
                <motion.button whileHover={LIFT} whileTap={PRESS} onClick={() => play(d.id)} className="relative w-full h-full rounded-3xl bg-white shadow-bonbon p-3 text-left flex flex-col gap-2">
                  {isDone && (
                    <span className="absolute top-2 right-2 w-7 h-7 rounded-full bg-menthe text-white text-sm font-bold flex items-center justify-center" aria-label="Déjà réussi">
                      ✓
                    </span>
                  )}
                  <span className={`w-14 h-14 rounded-2xl ${FAMILLE_COLOR[d.famille]} flex items-center justify-center text-3xl`} aria-hidden>
                    {d.emoji}
                  </span>
                  <span className="font-semibold leading-snug">{d.title}</span>
                  <span className="text-xs text-doux">
                    {MINI_FAMILLES[d.famille].emoji} {MINI_FAMILLES[d.famille].label} · {seconds} s
                  </span>
                </motion.button>
              </motion.li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
