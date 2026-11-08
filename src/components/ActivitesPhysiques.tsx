import { useState } from 'react';
import { motion } from 'motion/react';
import { Shuffle } from 'lucide-react';
import { PHYSIQUES, PHYSIQUE_CATS, VIDEOS_SPORT, type PhysiqueCat } from '../data/physiques';
import { soundEffects } from '../utils/soundEffects';
import { LIFT, PRESS } from '../lib/motion';
import { TopBar } from './ui';
import { JamyLinks } from './JamyLinks';
import { ThemeScene, type SceneTheme } from './ThemeScene';

/** Les 60 activités physiques : l'enfant choisit par catégorie ou tire une surprise. */
export function ActivitesPhysiques({ done, onBack, onPlay, scene }: { done: Set<string>; onBack: () => void; onPlay: (id: string) => void; scene: SceneTheme }) {
  const [cat, setCat] = useState<PhysiqueCat | null>(null);
  const list = cat ? PHYSIQUES.filter((a) => a.categorie === cat) : PHYSIQUES;

  const play = (id: string) => {
    soundEffects.playPop();
    onPlay(id);
  };
  const surprise = () => {
    const pool = list.filter((a) => !done.has(a.id));
    const from = pool.length ? pool : list;
    play(from[Math.floor(Math.random() * from.length)].id);
  };

  return (
    <div className="min-h-dvh">
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
        <ThemeScene theme={scene} />
      </div>
      <TopBar
        title="Activités physiques"
        emoji="🤸"
        onBack={onBack}
        right={
          <button onClick={surprise} className="press shadow-bonbon h-12 px-4 rounded-2xl bg-corail text-white font-semibold flex items-center gap-2">
            <Shuffle className="w-5 h-5" /> <span className="hidden sm:inline">Surprise !</span>
          </button>
        }
      />
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pb-24 pt-2">
        <p className="text-doux mb-3">
          {list.filter((a) => done.has(a.id)).length} sur {list.length} réussies. Une minute pour bouger à la maison !
        </p>
        <div className="flex gap-2 overflow-x-auto pb-3 mb-2 -mx-4 px-4" role="tablist" aria-label="Catégories d’activités physiques">
          {([null, ...(Object.keys(PHYSIQUE_CATS) as PhysiqueCat[])] as (PhysiqueCat | null)[]).map((c) => {
            const info = c ? PHYSIQUE_CATS[c] : { label: 'Toutes', emoji: '🎲' };
            return (
              <button
                key={c ?? 'toutes'}
                role="tab"
                aria-selected={cat === c}
                onClick={() => {
                  soundEffects.playPop();
                  setCat(c);
                }}
                className={`press shrink-0 rounded-full px-4 py-2 font-semibold whitespace-nowrap ${cat === c ? 'bg-corail text-white shadow-bonbon' : 'bg-white text-encre'}`}
              >
                {info.emoji} {info.label}
              </button>
            );
          })}
        </div>
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {list.map((a, i) => (
            <motion.li key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 16) * 0.02 }}>
              <motion.button whileHover={LIFT} whileTap={PRESS} onClick={() => play(a.id)} className="relative w-full h-full rounded-3xl bg-white shadow-bonbon p-3 text-left flex flex-col gap-2">
                {done.has(a.id) && (
                  <span className="absolute top-2 right-2 w-7 h-7 rounded-full bg-menthe text-white text-sm font-bold flex items-center justify-center" aria-label="Déjà réussie">
                    ✓
                  </span>
                )}
                <span className={`w-14 h-14 rounded-2xl ${PHYSIQUE_CATS[a.categorie].color} flex items-center justify-center text-3xl`} aria-hidden>
                  {a.emoji}
                </span>
                <span className="font-semibold leading-snug">{a.title}</span>
                <span className="text-xs text-doux">
                  {PHYSIQUE_CATS[a.categorie].emoji} {PHYSIQUE_CATS[a.categorie].label} · {a.moves.reduce((t, m) => t + m.seconds, 0)} s
                </span>
              </motion.button>
            </motion.li>
          ))}
        </ul>

        <JamyLinks theme={null} videos={VIDEOS_SPORT} intro="Deux séances de sport pour enfants à faire à la maison, à regarder avec un adulte." />
      </main>
    </div>
  );
}
