import { useState } from 'react';
import { motion } from 'motion/react';
import { Shuffle } from 'lucide-react';
import { ALL_CHANSONS, type Chanson } from '../data/chansons';
import { COMPTINE_THEMES, type ComptineTheme } from '../data/comptines';
import { soundEffects } from '../utils/soundEffects';
import { LIFT, PRESS } from '../lib/motion';
import { TopBar } from './ui';

/** Toutes les comptines : on filtre par thème, ou on tire une surprise. */
export function Comptines({ done, onBack, onPlay, onSurprise }: { done: Set<string>; onBack: () => void; onPlay: (id: string) => void; onSurprise: () => void }) {
  const [theme, setTheme] = useState<ComptineTheme | null>(null);
  const list: Chanson[] = theme ? ALL_CHANSONS.filter((c) => c.comptine?.spec.theme === theme) : ALL_CHANSONS;

  return (
    <div className="min-h-dvh">
      <TopBar
        title="Les comptines"
        emoji="🎵"
        onBack={onBack}
        right={
          <button
            onClick={() => {
              soundEffects.playPop();
              onSurprise();
            }}
            className="press shadow-bonbon h-12 px-4 rounded-2xl bg-corail text-white font-semibold flex items-center gap-2"
          >
            <Shuffle className="w-5 h-5" /> <span className="hidden sm:inline">Au hasard !</span>
          </button>
        }
      />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pb-24 pt-2">
        <p className="text-doux mb-3">
          {list.filter((c) => done.has(c.id)).length} sur {list.length} chantées. Chante avec Nino, Nina et Mila, et fais les gestes !
        </p>
        <div className="flex gap-2 overflow-x-auto pb-3 mb-2 -mx-4 px-4" role="tablist" aria-label="Thèmes des comptines">
          {([null, ...(Object.keys(COMPTINE_THEMES) as ComptineTheme[])] as (ComptineTheme | null)[]).map((t) => {
            const info = t ? COMPTINE_THEMES[t] : { label: 'Toutes', emoji: '🎲' };
            return (
              <button
                key={t ?? 'toutes'}
                role="tab"
                aria-selected={theme === t}
                onClick={() => {
                  soundEffects.playPop();
                  setTheme(t);
                }}
                className={`press shrink-0 rounded-full px-4 py-2 font-semibold whitespace-nowrap ${theme === t ? 'bg-corail text-white shadow-bonbon' : 'bg-white text-encre'}`}
              >
                {info.emoji} {info.label}
              </button>
            );
          })}
        </div>
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {list.map((c, i) => (
            <li key={c.id}>
              <motion.button
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i, 12) * 0.03 }}
                whileHover={LIFT}
                whileTap={PRESS}
                onClick={() => {
                  soundEffects.playPop();
                  onPlay(c.id);
                }}
                className="sticker w-full h-full rounded-3xl bg-white p-3 text-left flex flex-col gap-1"
              >
                <span className="flex items-start justify-between">
                  <span className="text-4xl" aria-hidden>
                    {c.emoji}
                  </span>
                  {done.has(c.id) && <span className="rounded-full bg-menthe text-white text-sm font-bold w-7 h-7 flex items-center justify-center">✓</span>}
                </span>
                <span className="font-bold leading-tight">{c.title}</span>
                <span className="text-xs text-doux">{c.comptine ? COMPTINE_THEMES[c.comptine.spec.theme].label : 'Épisode vidéo'} · {Math.round(c.duration)} s</span>
              </motion.button>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
