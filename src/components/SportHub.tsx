import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import type { SportTip } from '../data/sport';
import { ESSENTIELS } from '../data/programmes';
import { MINI_DEFIS } from '../data/miniDefis';
import { WUSHU } from '../data/wushu';
import { Mascot } from './Mascot';
import { soundEffects } from '../utils/soundEffects';
import { LIFT, POP_IN, PRESS, SPRING_SOFT, float } from '../lib/motion';
import { TopBar } from './ui';

const appear = (i: number) => ({ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { ...SPRING_SOFT, delay: 0.05 * i } });
const heroFloat = float(8, 2);

/**
 * Bouger et grandir : l'essentiel, sans surcharge.
 *  1. le défi du jour ;
 *  2. les 5 essentiels pour grandir (sauter, équilibre, muscles, souplesse, calme) ;
 */
export function SportHub({ daily, done, onBack, onPlay, onMinis }: { daily: SportTip; done: Set<string>; onBack: () => void; onPlay: (id: string) => void; onMinis: () => void }) {
  const go = (fn: () => void) => () => {
    soundEffects.playPop();
    fn();
  };
  const essentialsDone = ESSENTIELS.filter((e) => done.has(e.id)).length;

  return (
    <div className="min-h-dvh">
      <TopBar title="Bouger et grandir" emoji="🌱" onBack={onBack} />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pb-10">
        {/* 1. Le défi du jour */}
        <motion.button
          {...appear(0)}
          whileHover={LIFT}
          whileTap={PRESS}
          onClick={go(() => onPlay(daily.id))}
          className="sticker w-full rounded-[2rem] bg-soleil p-5 sm:p-6 flex items-center gap-4 text-left mb-6"
        >
          <motion.span className="text-7xl leading-none" animate={heroFloat.animate} transition={heroFloat.transition} aria-hidden>
            {daily.emoji}
          </motion.span>
          <span className="flex-1 min-w-0">
            <span className="inline-block bg-white/60 rounded-full px-3 py-1 text-sm font-semibold mb-2">⭐ Le défi du jour {done.has(daily.id) ? '✓' : ''}</span>
            <span className="block text-2xl font-bold leading-tight">{daily.title}</span>
            <span className="block mt-1 opacity-80">💡 {daily.tip}</span>
          </span>
        </motion.button>

        {/* Les 160 mini-défis à choisir */}
        <motion.button {...appear(1)} whileHover={LIFT} whileTap={PRESS} onClick={go(onMinis)} className="sticker w-full rounded-[2rem] bg-corail text-white p-5 flex items-center gap-4 text-left mb-6">
          <span className="text-6xl leading-none" aria-hidden>
            🎯
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-2xl font-bold leading-tight">{MINI_DEFIS.length} mini-défis</span>
            <span className="block opacity-90">30 secondes chacun : sauter, équilibre, muscles, souplesse, coordination, calme</span>
          </span>
          <span className="bg-white text-corail rounded-full px-3 py-1.5 font-bold shrink-0">
            {MINI_DEFIS.filter((d) => done.has(d.id)).length} ✓
          </span>
        </motion.button>

        {/* Le yoga des animaux, façon wushu */}
        <div className="flex items-baseline justify-between mb-1">
          <h2 className="text-2xl font-bold">Le yoga des animaux</h2>
          <span className="text-doux font-semibold">
            {WUSHU.filter((s) => done.has(s.id)).length} / {WUSHU.length}
          </span>
        </div>
        <p className="text-doux mb-3">Façon wushu : des gestes lents, expliqués par les maîtres animaux.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {WUSHU.map((s, i) => (
            <motion.button key={s.id} {...appear(i + 1)} whileHover={LIFT} whileTap={PRESS} onClick={go(() => onPlay(s.id))} className={`sticker rounded-3xl ${s.color} text-white p-3 flex flex-col items-center text-center`}>
              <Mascot animal={s.mascotte} size={92} />
              <span className="block text-lg font-bold leading-tight mt-1">{s.title}</span>
              <span className="block text-sm opacity-90">
                {s.qualite} {done.has(s.id) ? '✓' : ''}
              </span>
            </motion.button>
          ))}
        </div>

        {/* 2. Les 5 essentiels */}
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-2xl font-bold">Les 5 essentiels pour grandir</h2>
          <span className="text-doux font-semibold">
            {essentialsDone} / {ESSENTIELS.length}
          </span>
        </div>
        <ol className="grid gap-3 mb-6">
          {ESSENTIELS.map((e, i) => (
            <motion.li key={e.id} {...appear(i + 1)}>
              <motion.button whileHover={LIFT} whileTap={PRESS} onClick={go(() => onPlay(e.id))} className={`sticker w-full rounded-3xl ${e.color} text-white p-4 flex items-center gap-4 text-left`}>
                <span className="text-4xl w-14 h-14 rounded-2xl bg-white/25 flex items-center justify-center shrink-0" aria-hidden>
                  {e.emoji}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold opacity-90">{e.besoin}</span>
                  <span className="block text-xl font-bold leading-tight">{e.title}</span>
                  <span className="block text-sm opacity-90">{e.pourquoi}</span>
                </span>
                {done.has(e.id) ? (
                  <motion.span {...POP_IN} className="w-9 h-9 rounded-full bg-white text-menthe flex items-center justify-center shrink-0" aria-label="Déjà fait">
                    <Check className="w-5 h-5" strokeWidth={3} />
                  </motion.span>
                ) : (
                  <span className="bg-white text-encre rounded-full px-3 py-1.5 font-bold shrink-0">1 min</span>
                )}
              </motion.button>
            </motion.li>
          ))}
        </ol>

      </main>
    </div>
  );
}
