// Polices des styles de film (auto-hébergées, chargées seulement avec les films).
import '../films/fonts';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { H, W, readingSeconds, type Film, type FilmScene, type FrameState } from '../films/engine';
import { FilmAudio } from '../films/audio';
import { sayLine, stopLine } from '../films/voice';
import { personalize } from '../data/format';
import { soundEffects } from '../utils/soundEffects';
import { TopBar } from './ui';

/** Horloge du film : temps forts, voix, attente du toucher. Tout le reste est dessiné par la scène. */
interface Clock {
  beat: number;
  beatStart: number;
  /** Fin de la phrase (null tant qu'elle est dite). */
  spoken: number | null;
  waitingSince: number | null;
  tapAt: number | null;
  endAt: number | null;
  prevBt: number;
}

export function FilmPlayer({ film, name, onBack, onDone, onNext }: { film: Film; name: string; onBack: () => void; onDone: () => void; onNext: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [hint, setHint] = useState<{ x: number; y: number } | null>(null);
  const [ended, setEnded] = useState(false);
  const [runId, setRunId] = useState(0);

  const sceneRef = useRef<FilmScene | null>(null);
  const audioRef = useRef<FilmAudio | null>(null);
  const clockRef = useRef<Clock | null>(null);
  const timeRef = useRef({ origin: 0, pausedAt: 0 as number | null });
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  const caption = (beat: number) => personalize(film.beats[Math.min(beat, film.beats.length - 1)].text, name);

  // Scène + affiche immobile avant le départ.
  useEffect(() => {
    const scene = film.create();
    sceneRef.current = scene;
    let cancelled = false;
    void document.fonts.ready.then(() => {
      if (cancelled) return;
      const c = canvasRef.current;
      if (!c) return;
      fit(c);
      const g = c.getContext('2d')!;
      g.setTransform(c.width / W, 0, 0, c.height / H, 0, 0);
      const p = film.poster;
      scene.render(g, { t: p.bt + 3, beat: p.beat, bt: p.bt, waiting: false, sinceTap: p.sinceTap ?? null, end: null, caption: caption(p.beat), still: true });
    });
    return () => {
      cancelled = true;
      scene.dispose?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [film]);

  // Lecture.
  useEffect(() => {
    if (!started) return;
    const scene = sceneRef.current!;
    const audio = new FilmAudio();
    audio.setMuted(mutedRef.current);
    audio.resume();
    audioRef.current = audio;
    const stopMusic = film.music(audio);
    const now = () => performance.now() / 1000 - timeRef.current.origin;
    timeRef.current = { origin: performance.now() / 1000, pausedAt: null };
    let doneSent = false;

    const enter = (beat: number) => {
      const b = film.beats[beat];
      const start = now();
      clockRef.current = { beat, beatStart: start, spoken: null, waitingSince: null, tapAt: null, endAt: null, prevBt: 0 };
      scene.onBeat?.(beat, audio);
      audio.duck(true);
      const text = personalize(b.say ?? b.text, name);
      sayLine(
        film.id,
        beat,
        text,
        () => {
          const c = clockRef.current;
          if (!c || c.beat !== beat) return;
          // Pas de voix disponible : on laisse le temps de lire (la phrase est écrite à l'écran).
          const t = now();
          c.spoken = t - c.beatStart < 0.5 ? c.beatStart + readingSeconds(text) : t;
          audio.duck(false);
        },
        mutedRef.current
      );
    };
    enter(0);

    let raf = 0;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const c = clockRef.current;
      const cv = canvasRef.current;
      if (!c || !cv || timeRef.current.pausedAt !== null) return;
      const t = now();
      const b = film.beats[c.beat];
      if (c.endAt === null) {
        // Filet de sécurité : certaines voix ne signalent jamais la fin de la phrase.
        if (c.spoken === null && t - c.beatStart > readingSeconds(b.say ?? b.text) * 1.8 + 2) c.spoken = t;
        const spokenDone = c.spoken !== null && t >= c.spoken;
        if (spokenDone) audio.duck(false);
        if (b.tap && spokenDone && c.tapAt === null && c.waitingSince === null) c.waitingSince = t;
        let endTime = Infinity;
        if (b.tap) {
          if (c.tapAt !== null) endTime = c.tapAt + (b.hold ?? 2);
        } else if (c.spoken !== null) endTime = Math.max(c.beatStart + (b.min ?? 0), c.spoken + (b.hold ?? 0.6));
        if (t >= endTime) {
          if (c.beat + 1 < film.beats.length) {
            enter(c.beat + 1);
            return;
          }
          c.endAt = t;
          if (!doneSent) {
            doneSent = true;
            onDone();
          }
        }
      }
      const bt = t - c.beatStart;
      const waiting = c.waitingSince !== null && c.tapAt === null;
      audio.hold = !!film.freezeOnWait && waiting;
      const s: FrameState = {
        t,
        beat: c.beat,
        bt,
        waiting,
        sinceTap: c.tapAt !== null ? t - c.tapAt : null,
        end: c.endAt !== null ? t - c.endAt : null,
        caption: caption(c.beat)
      };
      if (c.endAt === null) scene.cues?.(s, c.prevBt, audio);
      c.prevBt = bt;
      fit(cv);
      const g = cv.getContext('2d')!;
      g.setTransform(cv.width / W, 0, 0, cv.height / H, 0, 0);
      scene.render(g, s);
      // Petite main qui montre où toucher, si l'enfant hésite.
      if (waiting && t - c.waitingSince! > 2.5 && b.tap) {
        const p = b.tap.at(s);
        setHint((h) => (h && h.x === p.x && h.y === p.y ? h : p));
      } else setHint((h) => (h ? null : h));
      if (s.end !== null && s.end > 2.2) setEnded(true);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      stopMusic();
      stopLine();
      audio.close();
      audioRef.current = null;
      clockRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, runId, film]);

  useEffect(() => {
    audioRef.current?.setMuted(muted);
  }, [muted]);

  // Pause : l'horloge s'arrête, la voix aussi ; à la reprise, la phrase en cours est redite.
  const togglePause = () => {
    soundEffects.playPop();
    const tr = timeRef.current;
    if (!paused) {
      tr.pausedAt = performance.now() / 1000;
      stopLine();
      audioRef.current?.setMuted(true);
    } else if (tr.pausedAt !== null) {
      tr.origin += performance.now() / 1000 - tr.pausedAt;
      tr.pausedAt = null;
      audioRef.current?.setMuted(muted);
      const c = clockRef.current;
      if (c && c.spoken === null) {
        const beat = c.beat;
        sayLine(film.id, beat, personalize(film.beats[beat].say ?? film.beats[beat].text, name), () => {
          const cc = clockRef.current;
          if (cc && cc.beat === beat) cc.spoken = performance.now() / 1000 - timeRef.current.origin;
        }, muted);
      }
    }
    setPaused(!paused);
  };

  const onPointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = clockRef.current;
    if (!started || !c || paused) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W;
    const y = ((e.clientY - r.top) / r.height) * H;
    const b = film.beats[c.beat];
    if (!b.tap || c.tapAt !== null || c.endAt !== null) return;
    const t = performance.now() / 1000 - timeRef.current.origin;
    const s: FrameState = { t, beat: c.beat, bt: t - c.beatStart, waiting: true, sinceTap: null, end: null, caption: caption(c.beat) };
    if (b.tap.hit(x, y, s)) {
      c.tapAt = t;
      c.waitingSince ??= t;
      stopLine();
      audioRef.current?.duck(false);
      sceneRef.current?.onTap?.(c.beat, audioRef.current!);
    } else soundEffects.playPop();
  };

  const replay = () => {
    soundEffects.playPop();
    setEnded(false);
    setHint(null);
    setPaused(false);
    setRunId((n) => n + 1);
  };

  return (
    <div className="min-h-dvh bg-nuit text-white">
      <TopBar
        title={film.title}
        emoji={film.emoji}
        onBack={onBack}
        dark
        right={
          <div className="flex gap-2">
            <button onClick={() => setMuted(!muted)} className="press shadow-bonbon w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center" aria-label={muted ? 'Remettre le son' : 'Couper le son'}>
              {muted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            </button>
            {started && !ended && (
              <button onClick={togglePause} className="press shadow-bonbon w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center" aria-label={paused ? 'Reprendre' : 'Pause'}>
                {paused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
              </button>
            )}
          </div>
        }
      />
      <main className="max-w-5xl mx-auto px-3 sm:px-6 pb-10">
        <div className="relative w-full overflow-hidden rounded-[1.5rem] shadow-2xl bg-black" style={{ aspectRatio: `${W} / ${H}` }}>
          <canvas ref={canvasRef} onPointerDown={onPointer} className="absolute inset-0 w-full h-full touch-none select-none" aria-label={`Petit film : ${film.title}`} role="img" />
          {hint && (
            <motion.span
              className="pointer-events-none absolute text-5xl sm:text-6xl"
              style={{ left: `${(hint.x / W) * 100}%`, top: `${(hint.y / H) * 100}%` }}
              initial={{ opacity: 0, x: '-30%', y: '10%' }}
              animate={{ opacity: 1, y: ['10%', '-10%', '10%'], scale: [1, 0.9, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              aria-hidden
            >
              👆
            </motion.span>
          )}
          {!started && (
            <button
              onClick={() => {
                soundEffects.playPop();
                setStarted(true);
              }}
              className="absolute inset-0 flex items-center justify-center bg-black/25"
              aria-label="Regarder le film"
            >
              <span className="press shadow-bonbon flex items-center gap-3 rounded-full bg-corail px-7 py-4 text-2xl font-bold">
                <Play className="w-8 h-8" fill="currentColor" /> Regarder
              </span>
            </button>
          )}
          {paused && (
            <button onClick={togglePause} className="absolute inset-0 flex items-center justify-center bg-black/40 text-3xl font-bold" aria-label="Reprendre">
              ⏸ Pause — touche pour reprendre
            </button>
          )}
          {ended && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex flex-col sm:flex-row items-center justify-center gap-3 bg-black/45 p-4">
              <button onClick={replay} className="press shadow-bonbon flex items-center gap-2 rounded-full bg-white text-encre px-6 py-3 text-xl font-bold">
                <RotateCcw className="w-6 h-6" /> Encore !
              </button>
              <button
                onClick={() => {
                  soundEffects.playPop();
                  onNext();
                }}
                className="press shadow-bonbon rounded-full bg-corail px-6 py-3 text-xl font-bold"
              >
                Film suivant ➜
              </button>
            </motion.div>
          )}
        </div>
        <p className="mt-4 text-center text-white/75">
          {film.styleLabel} · {film.goal}
        </p>
      </main>
    </div>
  );
}

/** Ajuste la taille en pixels du canvas à son affichage (écran Retina compris, plafonné). */
function fit(c: HTMLCanvasElement) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.min(1920, Math.round(c.clientWidth * dpr));
  const h = Math.round((w * H) / W);
  if (w > 0 && (c.width !== w || c.height !== h)) {
    c.width = w;
    c.height = h;
  }
}
