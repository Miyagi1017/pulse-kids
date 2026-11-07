import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Pause, Play, RotateCcw, SkipBack, SkipForward, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { VideoScene } from '../../shared/schemas';
import { personalize } from '../data/format';
import type { Playable } from '../lib/playlist';
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
const NEXT_DELAY = 5;

/**
 * Lecteur de vidéos : scènes animées, sous-titrées et narrées, qui avancent toutes seules.
 * En fin de vidéo, la suivante de la playlist démarre après un compte à rebours (annulable).
 */
export function VideoPlayer({ playlist, startIndex, name, onBack, onWatched }: { playlist: Playable[]; startIndex: number; name: string; onBack: () => void; onWatched: (id: string) => void }) {
  const [videoIndex, setVideoIndex] = useState(startIndex);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [imgOk, setImgOk] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);
  const fallbackTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const video = playlist[videoIndex];
  const scenes = video.scenes;
  const finished = index >= scenes.length;
  const scene = scenes[Math.min(index, scenes.length - 1)];
  const text = personalize(scene.text, name);
  const nextVideo = playlist[videoIndex + 1];

  const next = useCallback(() => setIndex((i) => i + 1), []);

  const goToVideo = useCallback((vi: number) => {
    stopSpeaking();
    setCountdown(null);
    setVideoIndex(vi);
    setIndex(0);
    setPlaying(true);
  }, []);

  // Narration + avance automatique des scènes.
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
  }, [videoIndex, index, playing, finished, text, next]);

  // Fin de vidéo : fête, puis compte à rebours vers la suivante.
  useEffect(() => {
    if (!finished) return;
    onWatched(video.id);
    soundEffects.playStarChime();
    confetti({ particleCount: 80, spread: 90, origin: { y: 0.6 } });
    setCountdown(nextVideo ? NEXT_DELAY : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished, videoIndex]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      goToVideo(videoIndex + 1);
      return;
    }
    const t = setTimeout(() => setCountdown((c) => (c === null ? null : c - 1)), 1000);
    return () => clearTimeout(t);
  }, [countdown, videoIndex, goToVideo]);

  useEffect(() => () => stopSpeaking(), []);

  const jump = (delta: number) => {
    soundEffects.playPop();
    setCountdown(null);
    setIndex((i) => Math.max(0, Math.min(scenes.length, i + delta)));
    setPlaying(true);
  };

  return (
    <div className="min-h-dvh flex flex-col">
      <TopBar
        title={video.title}
        emoji={video.emoji}
        onBack={onBack}
        right={
          <span className="hidden sm:inline rounded-full bg-white shadow-bonbon px-3 py-1.5 text-sm font-semibold text-doux">
            {videoIndex + 1} / {playlist.length}
          </span>
        }
      />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 pb-6 flex flex-col gap-4">
        <div className="relative flex-1 min-h-[60dvh] rounded-[2rem] overflow-hidden shadow-bonbon">
          <AnimatePresence mode="wait">
            {!finished ? (
              <motion.section
                key={`${videoIndex}-${index}`}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.45 }}
                className={`absolute inset-0 flex flex-col items-center justify-center gap-6 p-6 text-center ${BG[scene.bg]}`}
              >
                <motion.span className="absolute top-6 left-6 text-4xl opacity-40" animate={{ y: [0, -12, 0] }} transition={{ duration: 4, repeat: Infinity }} aria-hidden>
                  ☁️
                </motion.span>
                <motion.span className="absolute bottom-24 right-8 text-3xl opacity-40" animate={{ rotate: [0, 20, 0] }} transition={{ duration: 5, repeat: Infinity }} aria-hidden>
                  ✨
                </motion.span>

                {scene.imageUrl && imgOk ? (
                  <motion.figure initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="w-full max-w-md">
                    <div className="overflow-hidden rounded-3xl border-4 border-white/70 shadow-xl aspect-[4/3]">
                      <motion.img
                        src={scene.imageUrl}
                        alt=""
                        referrerPolicy="no-referrer"
                        onError={() => setImgOk(false)}
                        className="w-full h-full object-cover"
                        initial={{ scale: 1.02 }}
                        animate={{ scale: 1.15 }}
                        transition={{ duration: 12, ease: 'easeOut' }}
                      />
                    </div>
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

                <motion.p initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.35 }} className="text-2xl sm:text-3xl font-semibold leading-snug max-w-xl" aria-live="polite">
                  {text}
                </motion.p>
              </motion.section>
            ) : (
              <motion.section key={`fin-${videoIndex}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-corail text-white flex flex-col items-center justify-center gap-5 p-6 text-center">
                <div className="text-7xl" aria-hidden>
                  {nextVideo ? '⭐' : '🎉'}
                </div>
                {nextVideo && countdown !== null ? (
                  <>
                    <p className="text-xl opacity-90">Bravo {name} ! Vidéo suivante dans {countdown}…</p>
                    <div className="flex items-center gap-3 bg-white/20 rounded-3xl p-3 pr-5">
                      {nextVideo.thumb ? <img src={nextVideo.thumb} alt="" className="w-24 h-18 object-cover rounded-2xl" /> : <span className="text-5xl">{nextVideo.emoji}</span>}
                      <span className="text-2xl font-bold text-left">{nextVideo.title}</span>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => goToVideo(videoIndex + 1)} className="press shadow-bonbon bg-white text-corail px-6 py-3 rounded-2xl text-xl font-bold flex items-center gap-2">
                        <Play className="w-6 h-6" /> Tout de suite
                      </button>
                      <button onClick={() => setCountdown(null)} className="press bg-white/20 px-5 py-3 rounded-2xl text-lg font-semibold flex items-center gap-2" aria-label="Ne pas enchaîner">
                        <X className="w-5 h-5" /> Stop
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-4xl font-bold">{nextVideo ? `Bravo, ${name} !` : `Tu as tout regardé, ${name} !`}</h2>
                    <div className="flex flex-wrap justify-center gap-3">
                      <button onClick={() => goToVideo(videoIndex)} className="press shadow-bonbon bg-white text-corail px-6 py-3 rounded-2xl text-xl font-bold flex items-center gap-2">
                        <RotateCcw className="w-6 h-6" /> Revoir
                      </button>
                      {nextVideo && (
                        <button onClick={() => goToVideo(videoIndex + 1)} className="press bg-white/20 px-6 py-3 rounded-2xl text-xl font-bold">
                          Suivante ➜
                        </button>
                      )}
                    </div>
                  </>
                )}
              </motion.section>
            )}
          </AnimatePresence>
        </div>

        <div className="flex gap-1.5" aria-label={`Scène ${Math.min(index + 1, scenes.length)} sur ${scenes.length}`}>
          {scenes.map((_, i) => (
            <span key={i} className="h-2.5 flex-1 rounded-full bg-encre/10 overflow-hidden">
              <span className={`block h-full bg-corail transition-all duration-500 ${i < index || finished ? 'w-full' : i === index ? 'w-1/2' : 'w-0'}`} />
            </span>
          ))}
        </div>

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
      </main>
    </div>
  );
}
