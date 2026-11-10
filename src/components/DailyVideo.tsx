import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Pause, Play, RotateCcw, SkipBack, SkipForward, Type, Volume2, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { VideoScene } from '../../shared/schemas';
import { personalize } from '../data/format';
import { quizFor } from '../data/videoQuiz';
import type { Playable } from '../lib/playlist';
import { AGE_INFO, narrationRate, type AgeBand } from '../lib/age';
import { soundEffects, speakFrenchText, stopSpeaking } from '../utils/soundEffects';
import { TopBar } from './ui';
import { burst } from './fx';
import { BigQuiz } from './Quiz';
import { ThemeScene, type SceneTheme } from './ThemeScene';
import { Mascot } from './Mascot';
import { mascotForScene } from '../lib/mascots';
import { float, SPRING_SOFT, sway } from '../lib/motion';

const cloud = float(12, 2.8);
const sparkle = sway(18, 2.2);
const heroFloat = float(8, 2.2);

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
 *
 * Pour les 5–8 ans, il ajoute :
 *  - une question de compréhension à la fin de chaque vidéo (3 gros boutons, explication de la réponse) ;
 *  - « Le savais-tu ? » : un complément à écouter pendant la vidéo ;
 *  - « Réécouter la scène » et des scènes cliquables pour revenir en arrière sans se perdre ;
 *  - un texte plus gros pour les 5–6 ans, une vitesse de voix adaptée à l'âge ;
 *  - les raccourcis clavier ← → (scène), espace (pause), R (réécouter) pour les grands frères et sœurs.
 */
export function VideoPlayer({
  playlist,
  startIndex,
  name,
  age,
  onBack,
  onWatched
}: {
  playlist: Playable[];
  startIndex: number;
  name: string;
  age: AgeBand;
  onBack: () => void;
  onWatched: (id: string) => void;
}) {
  const [videoIndex, setVideoIndex] = useState(Math.max(0, Math.min(startIndex, playlist.length - 1)));
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [imgOk, setImgOk] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [bigText, setBigText] = useState(age === 'petit');
  const [replayTick, setReplayTick] = useState(0);
  const [quizSolved, setQuizSolved] = useState(false);
  const fallbackTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const video = playlist[videoIndex];
  const scenes = video.scenes;
  const finished = index >= scenes.length;
  const scene = scenes[Math.min(index, scenes.length - 1)];
  const text = personalize(scene.text, name);
  const nextVideo = playlist[videoIndex + 1];
  const quiz = quizFor(video.id);
  const quizPhase = finished && !!quiz && !quizSolved;

  const next = useCallback(() => setIndex((i) => i + 1), []);

  const goToVideo = useCallback((vi: number) => {
    stopSpeaking();
    setCountdown(null);
    setQuizSolved(false);
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
    speakFrenchText(text, {
      rate: narrationRate(age),
      pitch: AGE_INFO[age].pitch,
      onEnd: advance,
      onError: () => (fallbackTimer.current = setTimeout(advance, readingMs(text) * (age === 'petit' ? 1.3 : 1)))
    });
    if (!('speechSynthesis' in window)) fallbackTimer.current = setTimeout(advance, readingMs(text) * (age === 'petit' ? 1.3 : 1));
    return () => {
      clearTimeout(fallbackTimer.current);
      advanced = true;
      stopSpeaking();
    };
  }, [videoIndex, index, playing, finished, text, next, replayTick, age]);

  // Vidéo terminée : on la marque comme vue (sans couper la question qui suit).
  useEffect(() => {
    if (!finished) return;
    onWatched(video.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished, videoIndex]);

  // Fin de vidéo (ou bonne réponse à la question) : fête, puis compte à rebours vers la suivante.
  useEffect(() => {
    if (!finished || (quiz && !quizSolved)) return;
    soundEffects.playStarChime();
    confetti({ particleCount: 80, spread: 90, origin: { y: 0.6 } });
    setCountdown(nextVideo ? NEXT_DELAY : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished, quizSolved, videoIndex]);

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

  const jump = useCallback(
    (delta: number) => {
      soundEffects.playPop();
      setCountdown(null);
      setIndex((i) => Math.max(0, Math.min(scenes.length, i + delta)));
      setPlaying(true);
    },
    [scenes.length]
  );

  const jumpTo = (i: number) => {
    soundEffects.playSparkle();
    setCountdown(null);
    setIndex(Math.max(0, Math.min(scenes.length - 1, i)));
    setPlaying(true);
  };

  const replay = () => {
    soundEffects.playSparkle();
    setPlaying(true);
    setReplayTick((t) => t + 1);
  };

  // Raccourcis clavier : ← → pour changer de scène, espace pour la pause, R pour réécouter.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (quizPhase) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        jump(1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        jump(-1);
      } else if (e.key === ' ') {
        e.preventDefault();
        if (!finished) {
          soundEffects.playPop();
          setPlaying((p) => !p);
        }
      } else if (e.key.toLowerCase() === 'r' && !finished) {
        e.preventDefault();
        replay();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [jump, finished, quizPhase]);

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
            {quizPhase && quiz ? (
              <motion.section
                key={`quiz-${videoIndex}`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={SPRING_SOFT}
                className="absolute inset-0 bg-corail text-white flex flex-col items-center justify-center gap-3 p-5 sm:p-6 overflow-y-auto"
              >
                <div className="flex items-center gap-2 justify-center pt-1">
                  <Mascot animal={mascotForScene((video.category as SceneTheme | undefined) ?? 'journal')} mood="talk" size={62} />
                  <p className="text-sm font-bold uppercase tracking-wide opacity-90">Question flash</p>
                </div>
                <div className="w-full max-w-md">
                  <BigQuiz
                    quiz={quiz}
                    tone="dark"
                    onSolved={() => {
                      soundEffects.playStarChime();
                      setQuizSolved(true);
                    }}
                  />
                </div>
                <button onClick={() => setQuizSolved(true)} className="press bg-white/20 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2" aria-label="Passer la question">
                  <X className="w-4 h-4" /> Passer
                </button>
              </motion.section>
            ) : !finished ? (
              <motion.section
                key={`${videoIndex}-${index}`}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={SPRING_SOFT}
                onPointerDown={(e) => {
                  soundEffects.playSparkle();
                  burst(e.clientX, e.clientY, [scene.emoji, '✨', '⭐'], 7);
                }}
                className={`absolute inset-0 flex flex-col items-center justify-center gap-3 p-5 sm:p-6 text-center cursor-pointer ${BG[scene.bg]}`}
              >
                {/* Décor animé propre au thème de la vidéo */}
                <ThemeScene theme={(video.category as SceneTheme | undefined) ?? 'journal'} />
                {/* La mascotte présente la vidéo */}
                <div className="absolute top-3 right-3 z-10">
                  <Mascot animal={mascotForScene((video.category as SceneTheme | undefined) ?? 'journal')} mood={playing ? 'talk' : 'idle'} size={84} />
                </div>
                <motion.span className="absolute top-6 left-6 text-4xl opacity-40" animate={cloud.animate} transition={cloud.transition} aria-hidden>
                  ☁️
                </motion.span>
                <motion.span className="absolute bottom-24 right-8 text-3xl opacity-40" animate={sparkle.animate} transition={sparkle.transition} aria-hidden>
                  ✨
                </motion.span>

                {scene.imageUrl && imgOk ? (
                  <motion.figure initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="w-full max-w-md">
                    <div className="overflow-hidden rounded-3xl border-4 border-white/70 shadow-xl aspect-[4/3] max-h-[34dvh] mx-auto">
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
                    className={`${bigText ? 'text-[7rem] sm:text-[9rem]' : 'text-[5.5rem] sm:text-[7rem]'} leading-none drop-shadow-lg`}
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 220, damping: 11, delay: 0.15 }}
                    aria-hidden
                  >
                    <motion.span className="inline-block" animate={heroFloat.animate} transition={heroFloat.transition}>
                      {scene.emoji}
                    </motion.span>
                  </motion.div>
                )}

                <motion.p
                  initial={{ y: 16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className={`${bigText ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'} font-semibold leading-snug max-w-xl`}
                  aria-live="polite"
                >
                  {text}
                </motion.p>

                <div className="flex flex-wrap justify-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      replay();
                    }}
                    className="press bg-white/25 rounded-full px-3 py-1.5 text-sm sm:text-base font-semibold flex items-center gap-1.5"
                    aria-label="Réécouter cette scène"
                  >
                    <Volume2 className="w-4 h-4" /> Réécouter
                  </button>
                </div>
              </motion.section>
            ) : (
              <motion.section key={`fin-${videoIndex}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-corail text-white flex flex-col items-center justify-center gap-4 p-6 text-center overflow-y-auto">
                <div aria-hidden>
                  <Mascot animal={mascotForScene((video.category as SceneTheme | undefined) ?? 'journal')} mood="cheer" size={110} />
                </div>
                {nextVideo && countdown !== null ? (
                  <>
                    <p className="text-xl font-semibold">Bravo {name} !</p>
                    <p className="text-lg opacity-90 -mt-2">Vidéo suivante dans {countdown}…</p>
                    <div className="flex items-center gap-3 bg-white/20 rounded-3xl p-3 pr-5">
                      {nextVideo.thumb ? <img src={nextVideo.thumb} alt="" className="w-24 h-18 object-cover rounded-2xl" /> : <span className="text-5xl">{nextVideo.emoji}</span>}
                      <span className="text-2xl font-bold text-left">{nextVideo.title}</span>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => goToVideo(videoIndex + 1)} className="press shadow-bonbon bg-white text-corail px-5 py-3 rounded-2xl text-lg sm:text-xl font-bold flex items-center gap-2 whitespace-nowrap">
                        <Play className="w-6 h-6" /> Tout de suite
                      </button>
                      <button onClick={() => setCountdown(null)} className="press bg-white/20 px-5 py-3 rounded-2xl text-lg font-semibold flex items-center gap-2 whitespace-nowrap" aria-label="Ne pas enchaîner">
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
                {quiz && (
                  <p className="max-w-md rounded-2xl bg-white/20 px-4 py-2 text-left text-sm sm:text-base leading-snug">
                    💡 <strong>Le savais-tu ?</strong> {quiz.why}
                  </p>
                )}
              </motion.section>
            )}
          </AnimatePresence>
        </div>

        <div className="flex gap-1.5" aria-label={`Scène ${Math.min(index + 1, scenes.length)} sur ${scenes.length}`}>
          {scenes.map((_, i) => (
            <button
              key={i}
              onClick={() => !finished && jumpTo(i)}
              disabled={finished}
              className="h-3 flex-1 rounded-full bg-encre/10 overflow-hidden disabled:cursor-default group"
              aria-label={`Aller à la scène ${i + 1}`}
              aria-current={i === index && !finished ? 'step' : undefined}
            >
              <span className={`block h-full bg-corail transition-all duration-500 ${i < index || finished ? 'w-full' : i === index ? 'w-1/2' : 'w-0'}`} />
            </button>
          ))}
        </div>

        {!finished && (
          <nav className="flex items-center justify-center gap-4" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            <button onClick={() => jump(-1)} disabled={index === 0} className="press shadow-bonbon w-14 h-14 rounded-full bg-white flex items-center justify-center disabled:opacity-30" aria-label="Scène précédente">
              <SkipBack className="w-6 h-6" />
            </button>
            <button
              onClick={() => {
                soundEffects.playPop();
                setPlaying((p) => !p);
              }}
              className="press shadow-bonbon w-20 h-20 rounded-full bg-corail text-white flex items-center justify-center"
              aria-label={playing ? 'Pause' : 'Lecture'}
            >
              {playing ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
            </button>
            <button onClick={() => jump(1)} className="press shadow-bonbon w-14 h-14 rounded-full bg-white flex items-center justify-center" aria-label="Scène suivante">
              <SkipForward className="w-6 h-6" />
            </button>
            <button
              onClick={() => {
                soundEffects.playPop();
                setBigText((b) => !b);
              }}
              className={`press shadow-bonbon w-14 h-14 rounded-full flex items-center justify-center ${bigText ? 'bg-soleil text-encre' : 'bg-white text-doux'}`}
              aria-pressed={bigText}
              aria-label={bigText ? 'Réduire le texte' : 'Agrandir le texte'}
            >
              <Type className="w-6 h-6" />
            </button>
          </nav>
        )}

        {finished && !quizPhase && countdown === null && nextVideo && (
          <button onClick={() => goToVideo(videoIndex + 1)} className="press self-center rounded-full bg-white px-5 py-2.5 font-semibold text-doux shadow-bonbon flex items-center gap-2">
            Vidéo suivante <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </main>
    </div>
  );
}
