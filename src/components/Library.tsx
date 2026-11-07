import { motion } from 'motion/react';
import { Shuffle } from 'lucide-react';
import { SECTION_STYLE, TopBar, type Section } from './ui';
import { soundEffects } from '../utils/soundEffects';

export interface LibraryItem {
  id: string;
  emoji: string;
  title: string;
}

/** Grille des 50 contenus d'un espace : gros emojis, titre court, coche quand c'est fait. */
export function Library({ section, items, done, onBack, onPick }: { section: Exclude<Section, 'video'>; items: LibraryItem[]; done: Set<string>; onBack: () => void; onPick: (id: string) => void }) {
  const st = SECTION_STYLE[section];
  const dark = section === 'soir';
  const pick = (id: string) => {
    soundEffects.playPop();
    onPick(id);
  };
  const surprise = () => {
    const pool = items.filter((i) => !done.has(i.id));
    const list = pool.length ? pool : items;
    pick(list[Math.floor(Math.random() * list.length)].id);
  };

  return (
    <div className={`min-h-dvh ${dark ? 'bg-nuit text-white' : ''}`}>
      <TopBar
        title={st.label}
        emoji={st.emoji}
        onBack={onBack}
        dark={dark}
        right={
          <button onClick={surprise} className={`press shadow-bonbon h-12 px-4 rounded-2xl ${st.strong} ${section === 'contes' ? 'text-encre' : 'text-white'} font-semibold flex items-center gap-2`}>
            <Shuffle className="w-5 h-5" /> <span className="hidden sm:inline">Surprise !</span>
          </button>
        }
      />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pb-10 pt-2">
        <p className={`mb-4 ${dark ? 'text-white/70' : 'text-doux'}`}>
          {done.size ? `${[...done].filter((d) => items.some((i) => i.id === d)).length} sur ${items.length} déjà faits. ` : ''}Touche une image pour commencer !
        </p>
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {items.map((item, i) => {
            const isDone = done.has(item.id);
            return (
              <motion.li key={item.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 12) * 0.03 }}>
                <button
                  onClick={() => pick(item.id)}
                  className={`press shadow-bonbon relative w-full h-full rounded-3xl p-4 text-left flex flex-col gap-2 ${dark ? 'bg-white/10' : 'bg-white'}`}
                >
                  {isDone && (
                    <span className="absolute top-2 right-2 w-7 h-7 rounded-full bg-menthe text-white text-sm font-bold flex items-center justify-center" aria-label="Déjà fait">
                      ✓
                    </span>
                  )}
                  <span className={`w-16 h-16 rounded-2xl ${dark ? 'bg-white/10' : st.soft} flex items-center justify-center text-4xl`} aria-hidden>
                    {item.emoji}
                  </span>
                  <span className="font-semibold leading-snug">{item.title}</span>
                </button>
              </motion.li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
