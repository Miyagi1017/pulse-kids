import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Pause, Play, RotateCcw, SkipBack, SkipForward } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Today, VideoScene } from '../../shared/schemas';
import { personalize } from '../data/format';
import { soundEffects, speakFrenchText, stopSpeaking } from '../utils/soundEffects';
import { TopBar } from './ui';

const BG: Record<VideoScene['bg'], string> = {
  soleil: 'bg-soleil text-encre',
  ciel: 'bg-ciel text-white',
  menthe: 'bg-menthe text-white',
  lavande: 'bg-lavande text-white',
  nuit: 'bg-nuit text-white',
  rose: 'bg-rose text-white'
};

/** Durée de repli si la synthèse vocale est absente (≈ 2,5 mots / seconde). */
const readingMs = (text: string) => Math.max(3500, text.split(/\s+/).length * 400);

/**
 * « Vidéo » du jour : un petit dessin animé fait de scènes animées, sous-titrées et narrées.
 * Avance toute seule à la fin de chaque phrase ; boutons géants pause / précédent / suivant.
 */
export function DailyVideo({ today, name, onBack }: { today: Today; name: string; onBack: () => void }) {
  const scenes = today.scenes;
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [imgOk, setImgOk] = useState(true);
  const fallbackTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const finished = index >= scenes.length;
  const scene = scenes[Math.min(index, scenes.length - 1)];
  const text = personalize(scene.text, name);

  const next = useCallback(() => setIndex((i) => i + 1), []);

  useEffect(() => {
    clearTimeout(fallbackTimer.current);
    if (!playing || finished) return;
    setImgOk(true);
    let advanced = false;
    const advance = () => {
      if (advanced) return;
      advanced = true;
      setTimeout(next, 700);
    };
    speakFrenchText(text, { rate: 0.9, pitch: 1.12, onEnd: advance, onError: () => (fallbackTimer.current = setTimeout(advance, readingMs(text))) });
    if (!('speechSynthesis' in window)) fallbackTimer.current = setTimeout(advance, readingMs(text));
    return () => {
      clearTimeout(fallbackTimer.current);
      advanced = true;
      stopSpeaking();
    };
  }, [index, playing, finished, text, next]);

  useEffect(() => {
    if (finished) {
      soundEffects.playFanfare();
      confetti({ particleCount: 120, spread: 100, origin: { y: 0.6 } });
    }
  }, [finished]);

  useEffect(() => () => stopSpeaking(), []);

  const jump = (delta: number) => {
    soundEffects.playPop();
    setIndex((i) => Math.max(0, Math.min(scenes.length, i + delta)));
    setPlaying(true);
  };

  return (
    <div className="min-h-dvh flex flex-col">
      <TopBar title={today.title} emoji="🎬" onBack={onBack} />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 pb-6 flex flex-col gap-4">
        {/* Écran */}
        <div className="relative flex-1 min-h-[60dvh] rounded-[2rem] overflow-hidden shadow-bonbon">
          <AnimatePresence mode="wait">
            {!finished ? (
              <motion.section
                key={index}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.45 }}
                className={`absolute inset-0 flex flex-col items-center justify-center gap-6 p-6 text-center ${BG[scene.bg]}`}
              >
                {/* Décor animé */}
                <motion.span className="absolute top-6 left-6 text-4xl opacity-40" animate={{ y: [0, -12, 0] }} transition={{ duration: 4, repeat: Infinity }} aria-hidden>
                  ☁️
                </motion.span>
                <motion.span className="absolute bottom-24 right-8 text-3xl opacity-40" animate={{ rotate: [0, 20, 0] }} transition={{ duration: 5, repeat: Infinity }} aria-hidden>
                  ✨
                </motion.span>

                {scene.imageUrl && imgOk ? (
                  <motion.figure initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="w-full max-w-md">
                    <img
                      src={scene.imageUrl}
                      alt=""
                      referrerPolicy="no-referrer"
                      onError={() => setImgOk(false)}
                      className="w-full aspect-[4/3] object-cover rounded-3xl border-4 border-white/70 shadow-xl"
                    />
                    {scene.credit && <figcaption className="text-xs opacity-75 mt-1">Photo : {scene.credit}</figcaption>}
                  </motion.figure>
                ) : (
                  <motion.div
                    className="text-[7rem] sm:text-[9rem] leading-none drop-shadow-lg"
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: [0, 1.2, 1], rotate: 0, y: [0, 0, -10, 0] }}
                    transition={{ duration: 1.6, times: [0, 0.4, 0.7, 1] }}
                    aria-hidden
                  >
                    {scene.emoji}
                  </motion.div>
                )}

                {/* Sous-titre */}
                <motion.p initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.35 }} className="text-2xl sm:text-3xl font-semibold leading-snug max-w-xl" aria-live="polite">
                  {text}
                </motion.p>
              </motion.section>
            ) : (
              <motion.section key="fin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-corail text-white flex flex-col items-center justify-center gap-5 p-6 text-center">
                <div className="text-8xl" aria-hidden>
                  🎉
                </div>
                <h2 className="text-4xl font-bold">C’est fini, {name} !</h2>
                <p className="text-xl opacity-90">À demain pour un nouveau journal !</p>
                <button onClick={() => { setIndex(0); setPlaying(true); }} className="press shadow-bonbon bg-white text-corail px-6 py-3 rounded-2xl text-xl font-bold flex items-center gap-2">
                  <RotateCcw className="w-6 h-6" /> Revoir
                </button>
              </motion.section>
            )}
          </AnimatePresence>
        </div>

        {/* Progression */}
        <div className="flex gap-1.5" aria-label={`Scène ${Math.min(index + 1, scenes.length)} sur ${scenes.length}`}>
          {scenes.map((_, i) => (
            <span key={i} className="h-2.5 flex-1 rounded-full bg-encre/10 overflow-hidden">
              <span className={`block h-full bg-corail transition-all duration-500 ${i < index || finished ? 'w-full' : i === index ? 'w-1/2' : 'w-0'}`} />
            </span>
          ))}
        </div>

        {/* Commandes géantes */}
        {!finished && (
          <nav className="flex items-center justify-center gap-5" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            <button onClick={() => jump(-1)} disabled={index === 0} className="press shadow-bonbon w-16 h-16 rounded-full bg-white flex items-center justify-center disabled:opacity-30" aria-label="Scène précédente">
              <SkipBack className="w-7 h-7" />
            </button>
            <button
              onClick={() => {
                soundEffects.playPop();
                setPlaying((p) => !p);
              }}
              className="press shadow-bonbon w-20 h-20 rounded-full bg-corail text-white flex items-center justify-center"
              aria-label={playing ? 'Pause' : 'Lecture'}
            >
              {playing ? <Pause className="w-9 h-9" /> : <Play className="w-9 h-9 ml-1" />}
            </button>
            <button onClick={() => jump(1)} className="press shadow-bonbon w-16 h-16 rounded-full bg-white flex items-center justify-center" aria-label="Scène suivante">
              <SkipForward className="w-7 h-7" />
            </button>
          </nav>
        )}
        {today.sources.length > 0 && <p className="text-center text-xs text-doux">Infos du jour : {today.sources.join(' · ')}</p>}
      </main>
    </div>
  );
}
