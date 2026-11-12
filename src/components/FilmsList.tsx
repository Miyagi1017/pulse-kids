// Polices des styles de film (auto-hébergées, chargées seulement avec les films).
import '../films/fonts';
import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { FILMS } from '../films';
import { H, W, type Film } from '../films/engine';
import { soundEffects } from '../utils/soundEffects';
import { LIFT, PRESS } from '../lib/motion';
import { TopBar } from './ui';

const MOOD: Record<Film['mood'], { label: string; cls: string }> = {
  calme: { label: '🌙 Moment calme', cls: 'bg-lavande-clair text-lavande' },
  rythme: { label: '🎵 Ça bouge', cls: 'bg-corail-clair text-corail' },
  defi: { label: '👆 À toi de jouer', cls: 'bg-menthe-clair text-menthe' }
};

/** Affiche d'un film : la scène elle-même, dessinée une fois à un moment clé. */
function Poster({ film }: { film: Film }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const scene = film.create();
    let cancelled = false;
    void document.fonts.ready.then(() => {
      const c = ref.current;
      if (cancelled || !c) return;
      c.width = 640;
      c.height = 360;
      const g = c.getContext('2d')!;
      g.setTransform(c.width / W, 0, 0, c.height / H, 0, 0);
      const p = film.poster;
      scene.render(g, { t: p.bt + 3, beat: p.beat, bt: p.bt, waiting: false, sinceTap: p.sinceTap ?? null, end: null, caption: film.beats[p.beat].text, still: true });
      scene.dispose?.();
    });
    return () => {
      cancelled = true;
    };
  }, [film]);
  return <canvas ref={ref} className="w-full aspect-video rounded-2xl bg-nuit/10" aria-hidden />;
}

export function FilmsList({ done, onBack, onPlay }: { done: Set<string>; onBack: () => void; onPlay: (id: string) => void }) {
  return (
    <div className="min-h-dvh">
      <TopBar title="Les petits films" emoji="🎞️" onBack={onBack} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-24 pt-2">
        <p className="text-doux mb-4">Des petits films dessinés, chacun dans un style différent. Regarde bien : à un moment, c’est toi qui dois toucher l’écran !</p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FILMS.map((f, i) => (
            <li key={f.id}>
              <motion.button
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.06 * i } }}
                whileHover={LIFT}
                whileTap={PRESS}
                onClick={() => {
                  soundEffects.playPop();
                  onPlay(f.id);
                }}
                className="sticker w-full rounded-[1.75rem] bg-white p-3 text-left"
              >
                <Poster film={f} />
                <span className="flex items-start gap-2 px-1 pt-3">
                  <span className="text-3xl leading-none" aria-hidden>
                    {f.emoji}
                  </span>
                  <span className="flex-1">
                    <span className="block text-lg font-bold leading-tight">
                      {f.title} {done.has(f.id) ? '✓' : ''}
                    </span>
                    <span className="block text-sm text-doux">{f.styleLabel}</span>
                  </span>
                </span>
                <span className={`inline-block mt-2 ml-1 rounded-full px-3 py-1 text-sm font-semibold ${MOOD[f.mood].cls}`}>{MOOD[f.mood].label}</span>
              </motion.button>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
