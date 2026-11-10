import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Pause, Play, RotateCcw, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BigQuiz } from './Quiz';
import { TopBar } from './ui';
import { soundEffects } from '../utils/soundEffects';
import { mediaFor, paletteFor, type Chanson } from '../data/chansons';
import type { Theme } from '../lib/theme';
import { ComptineStage } from '../comptines/ComptineStage';

/**
 * Le lecteur de chanson : une vidéo courte (ou une comptine dessinée en direct sur sa bande-son)
 * avec des paroles qui s'allument (karaoké), puis une question de compréhension et une petite
 * mission à refaire à la maison.
 * Le son démarre sur un geste (règle des navigateurs), d'où le gros bouton central.
 */
export function ChansonPlayer({
  chanson,
  name,
  theme,
  onBack,
  onDone,
  onAnother,
  onList
}: {
  chanson: Chanson;
  name: string;
  theme: Theme;
  onBack: () => void;
  onDone: () => void;
  /** Une autre chanson, tirée au hasard. */
  onAnother?: () => void;
  /** Toutes les comptines. */
  onList?: () => void;
}) {
  const media = mediaFor(chanson, theme);
  const anim = chanson.comptine;
  const ref = useRef<HTMLMediaElement>(null);
  const quizRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);
  const [solved, setSolved] = useState(false);

  const line = chanson.lyrics.find((l) => time >= l.start && time <= l.end + 0.25);
  const pct = Math.min(100, (time / chanson.duration) * 100);

  const play = useCallback(() => {
    const v = ref.current;
    if (!v) return;
    setStarted(true);
    v.play().catch(() => setPlaying(false));
  }, []);

  const toggle = useCallback(() => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) play();
    else v.pause();
  }, [play]);

  const replay = useCallback(() => {
    const v = ref.current;
    if (!v) return;
    v.currentTime = 0;
    setEnded(false);
    setSolved(false);
    setTime(0);
    play();
    soundEffects.playSparkle();
  }, [play]);

  useEffect(() => {
    if (!ended) return;
    soundEffects.playFanfare();
    confetti({ particleCount: 90, spread: 90, origin: { y: 0.6 } });
    onDone();
    // La question arrive sous les contrôles : on l'amène à l'écran.
    const t = setTimeout(() => quizRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ended]);

  return (
    <div className="min-h-dvh flex flex-col">
      <TopBar
        title={anim ? 'La comptine' : 'La chanson'}
        emoji="🎵"
        onBack={onBack}
        right={
          onAnother ? (
            <button
              onClick={() => {
                soundEffects.playPop();
                onAnother();
              }}
              className="press shadow-bonbon h-12 px-4 rounded-2xl bg-corail text-white font-semibold flex items-center gap-2"
            >
              🎲 <span className="hidden sm:inline">Une autre</span>
            </button>
          ) : (
            <span className="rounded-full bg-white shadow-bonbon px-3 py-1.5 text-sm font-semibold text-doux">{Math.round(chanson.duration)} s</span>
          )
        }
      />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 pb-8 flex flex-col gap-3">
        <div className="relative rounded-[2rem] overflow-hidden shadow-bonbon bg-nuit">
          {anim ? (
            <>
              <ComptineStage comptine={anim.spec} timing={anim.timing} palette={paletteFor(theme)} media={ref} className="w-full aspect-video" />
              <audio
                ref={ref as React.RefObject<HTMLAudioElement>}
                key={anim.audio}
                src={anim.audio}
                preload="auto"
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
                onEnded={() => {
                  setPlaying(false);
                  setEnded(true);
                }}
              />
              <button type="button" onClick={toggle} className="absolute inset-0" aria-label={playing ? 'Pause' : 'Lecture'} />
            </>
          ) : (
            media && (
              <video
                ref={ref as React.RefObject<HTMLVideoElement>}
                key={media.video}
                src={media.video}
                poster={media.poster}
                playsInline
                preload="metadata"
                className="w-full aspect-video block"
                onClick={toggle}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
                onEnded={() => {
                  setPlaying(false);
                  setEnded(true);
                }}
              />
            )
          )}
          {!playing && !ended && (
            <button onClick={play} className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-encre/30 text-white" aria-label="Lancer la chanson">
              <motion.span
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-20 h-20 rounded-full bg-white text-corail flex items-center justify-center shadow-bonbon"
              >
                <Play className="w-9 h-9 ml-1" />
              </motion.span>
              <span className="text-xl font-bold drop-shadow">{started ? 'Continuer' : `Chanter avec ${name}`}</span>
            </button>
          )}
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-center">
          {chanson.emoji} {chanson.title}
        </h1>

        {/* Les paroles, en très gros, synchronisées avec la voix */}
        <div className="rounded-3xl bg-white px-4 py-4 min-h-[5.5rem] flex items-center justify-center shadow-bonbon text-center">
          <p key={line?.text ?? 'none'} className="text-2xl sm:text-3xl font-bold leading-snug text-corail" aria-live="polite">
            {line ? line.text : ended ? 'Bravo !' : `Appuie sur ▶ pour chanter`}
          </p>
        </div>

        <div className="h-3 rounded-full bg-encre/15 overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)}>
          <div className="h-full bg-corail transition-[width] duration-200" style={{ width: `${pct}%` }} />
        </div>

        <nav className="flex items-center justify-center gap-5">
          <button onClick={replay} className="press shadow-bonbon w-16 h-16 rounded-full bg-white flex items-center justify-center" aria-label="Revoir la chanson">
            <RotateCcw className="w-7 h-7" />
          </button>
          <button
            onClick={toggle}
            className="press shadow-bonbon w-20 h-20 rounded-full bg-corail text-white flex items-center justify-center"
            aria-label={playing ? 'Pause' : 'Lecture'}
          >
            {playing ? <Pause className="w-9 h-9" /> : <Play className="w-9 h-9 ml-1" />}
          </button>
          <button
            onClick={() => {
              soundEffects.playSparkle();
              const v = ref.current;
              if (v) v.currentTime = Math.min(chanson.duration - 0.2, v.currentTime + 5);
            }}
            className="press shadow-bonbon w-16 h-16 rounded-full bg-white flex items-center justify-center"
            aria-label="Avancer de 5 secondes"
          >
            <span className="font-bold text-lg">+5 s</span>
          </button>
        </nav>

        <div ref={quizRef} className="flex flex-col gap-3 scroll-mt-24">
          {ended && !solved && (
            <div className="rounded-[2rem] bg-white p-4 sm:p-5 shadow-bonbon">
              <div className="flex items-center gap-2 justify-center mb-2">
                <Sparkles className="w-5 h-5 text-ciel" aria-hidden />
                <p className="text-sm font-bold text-doux uppercase tracking-wide">Et toi, tu as compris ?</p>
              </div>
              <BigQuiz
                quiz={chanson.quiz}
                tone="light"
                onSolved={() => {
                  setSolved(true);
                  confetti({ particleCount: 70, spread: 80, origin: { y: 0.65 } });
                  soundEffects.playStarChime();
                }}
              />
            </div>
          )}

          {solved && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2rem] bg-white p-4 sm:p-5 shadow-bonbon text-center">
              <div className="text-5xl" aria-hidden>
                🌟
              </div>
              <p className="text-2xl font-bold mt-1">Bravo {name} !</p>
              <p className="mt-3 rounded-2xl bg-menthe-clair px-4 py-3 text-lg font-semibold">📌 {chanson.retiens}</p>
              <p className="mt-3 rounded-2xl bg-soleil-clair px-4 py-3 text-left">🎯 <strong>À toi :</strong> {chanson.geste}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <button onClick={replay} className="press shadow-bonbon bg-white px-6 py-3 rounded-2xl text-xl font-bold">
                  Rechanter 🎵
                </button>
                {onAnother && (
                  <button onClick={onAnother} className="press shadow-bonbon bg-corail text-white px-6 py-3 rounded-2xl text-xl font-bold">
                    🎲 Une autre comptine
                  </button>
                )}
              </div>
            </motion.div>
          )}
          {ended && onAnother && !solved && (
            <button onClick={onAnother} className="press self-center shadow-bonbon bg-corail text-white px-6 py-3 rounded-2xl text-lg font-bold">
              🎲 Une autre comptine
            </button>
          )}
          {onList && (
            <button onClick={onList} className="self-center text-sm font-semibold text-doux underline underline-offset-4 decoration-2 px-2 py-1">
              🎵 Toutes les comptines ➜
            </button>
          )}
        </div>

        {/* Toutes les paroles : on peut sauter directement à une ligne */}
        <ol className="grid gap-2 mt-1">
          {chanson.lyrics.map((l, i) => {
            const active = line === l;
            return (
              <li key={i}>
                <button
                  onClick={() => {
                    const v = ref.current;
                    if (!v) return;
                    v.currentTime = l.start;
                    if (v.paused) play();
                    soundEffects.playPop();
                  }}
                  className={`press w-full text-left rounded-2xl px-4 py-2.5 font-semibold flex items-center gap-3 ${
                    active ? 'bg-corail text-white shadow-bonbon' : 'bg-white text-encre shadow-bonbon'
                  }`}
                  aria-current={active ? 'true' : undefined}
                >
                  <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm ${active ? 'bg-white/25' : 'bg-creme text-doux'}`} aria-hidden>
                    {i + 1}
                  </span>
                  <span className="flex-1">{l.text}</span>
                  <span className={`text-xs font-bold ${active ? 'text-white/80' : 'text-doux'}`}>{l.start.toFixed(1)}s</span>
                </button>
              </li>
            );
          })}
        </ol>
      </main>
    </div>
  );
}
