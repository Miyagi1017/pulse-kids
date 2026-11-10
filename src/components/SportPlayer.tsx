import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Pause, Play, SkipForward } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { SportMove, SportTip } from '../data/sport';
import { moveGuide, NUMBER_WORDS, speechSeconds, type MoveGuide } from '../lib/guide';
import { personalize } from '../data/format';
import { soundEffects, speakFrenchText, stopSpeaking } from '../utils/soundEffects';
import { SpeakButton, TopBar } from './ui';
import { burst, pointOf } from './fx';
import { POSES, poseFor } from '../lib/poses';
import { float, jump, POP_IN, SPRING_SOFT } from '../lib/motion';
import { mascotForMove } from '../lib/mascots';
import { sportVideoUrl } from '../lib/sportVideos';
import { Mascot } from './Mascot';
import { ThemeScene, type SceneTheme } from './ThemeScene';

const introFloat = float(12, 1.6);
const introHop = jump(30, 0.9);

type Phase = { name: 'intro' } | { name: 'move'; index: number } | { name: 'rest'; next: number } | { name: 'bravo' };

/** Durée de la petite pause entre deux mouvements. */
const REST_MS = 4500;

/** Étape du départ où la voix lit encore la consigne (avant 3, 2, 1). */
const LISTEN = -1;

/** Le chiffre que la voix vient de compter (répétitions), en très gros. */
function CountBubble({ n }: { n: number }) {
  return (
    <div className="relative w-28 h-28 flex items-center justify-center rounded-full bg-white shadow-bonbon" role="status" aria-live="polite" aria-label={`On compte : ${n}`}>
      <AnimatePresence mode="popLayout">
        <motion.span key={n} initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.5, opacity: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }} className="absolute text-6xl font-bold">
          {n}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

/** Le décompte de départ, en très gros : 👂 pendant la consigne, puis 3, 2, 1, « Partez ! ». */
function ReadyGo({ step }: { step: number }) {
  const label = step === LISTEN ? '👂' : step > 0 ? String(step) : 'Partez !';
  return (
    <div className="relative w-28 h-28 flex items-center justify-center" role="status" aria-live="assertive" aria-label={step === LISTEN ? 'Écoute la consigne' : label}>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={step}
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.6, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 16 }}
          className={`absolute font-bold leading-none ${step > 0 ? 'text-7xl' : step === 0 ? 'text-3xl whitespace-nowrap' : 'text-6xl'}`}
        >
          {label}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

/** Cercle qui se vide pendant le mouvement : on voit le temps qu'il reste sans savoir lire. */
function Countdown({ left, total }: { left: number; total: number }) {
  const r = 44;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative w-28 h-28" aria-label={`Encore ${left} secondes`}>
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeOpacity={0.15} strokeWidth="10" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - left / total)} className="transition-[stroke-dashoffset] duration-1000 ease-linear" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-4xl font-bold">{left}</span>
    </div>
  );
}

export function SportPlayer({
  tip,
  name,
  onBack,
  onDone,
  onAnother,
  title = 'Le sport du jour',
  headerEmoji = '🏃',
  rule = 'Fais de la place autour de toi.',
  anotherLabel = 'Un autre défi ➜',
  scene
}: {
  tip: SportTip;
  name: string;
  onBack: () => void;
  onDone: () => void;
  onAnother: () => void;
  title?: string;
  headerEmoji?: string;
  rule?: string;
  anotherLabel?: string;
  /** Décor animé en fond (par défaut, aucun). */
  scene?: SceneTheme;
}) {
  const [phase, setPhase] = useState<Phase>({ name: 'intro' });
  const [playing, setPlaying] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [watching, setWatching] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const videoUrl = sportVideoUrl(tip.id);
  const [cue, setCue] = useState(0);
  /**
   * Le départ de chaque mouvement : la voix lit la consigne (LISTEN), puis compte 3, 2, 1
   * et dit « Partez ! » (0). `null` : le mouvement est en cours, guidé à voix haute.
   */
  const [ready, setReady] = useState<number | null>(null);
  /** Temps écoulé dans le mouvement (ms), et le chiffre que la voix vient de compter. */
  const [elapsed, setElapsed] = useState(0);
  const [counted, setCounted] = useState<number | null>(null);
  const nextEvent = useRef(0);
  const moveIndex = phase.name === 'move' ? phase.index : phase.name === 'rest' ? phase.next : 0;
  const pose = phase.name === 'move' ? poseFor(tip.moves[phase.index]) : 'respire';
  const cuesOf = (m: SportMove) => m.cues ?? POSES[poseFor(m)].cues;
  const guide: MoveGuide = useMemo(() => {
    const m = tip.moves[moveIndex];
    return moveGuide(m, moveIndex, tip.moves.length, cuesOf(m));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tip, moveIndex]);
  const left = Math.max(0, Math.ceil(guide.seconds - elapsed / 1000));

  // Les 3 consignes : en mode « libre », la voix les lit une par une (et on les surligne) ;
  // sinon elles défilent doucement.
  useEffect(() => {
    setCue(0);
  }, [phase]);
  useEffect(() => {
    if (phase.name !== 'move' || !playing || guide.mode === 'libre') return;
    const t = setInterval(() => setCue((c) => (c + 1) % 3), 4500);
    return () => clearInterval(t);
  }, [phase, playing, guide.mode]);

  /** La voix guide : plus lente, pour que l'enfant ait le temps de comprendre. */
  const say = (text: string, rate = 0.82) => {
    setSpeaking(true);
    speakFrenchText(personalize(text, name), { rate, pitch: 1.15, onEnd: () => setSpeaking(false), onError: () => setSpeaking(false) });
  };
  const introText = `${tip.title.replace(/^Séance (\d+) · /, 'Séance $1 : ')} ! ${tip.tip} ${rule} Si quelque chose fait mal, on arrête. Quand tu es prêt, appuie sur « C’est parti ».`;

  useEffect(() => {
    const t = setTimeout(() => say(introText), 400);
    return () => {
      clearTimeout(t);
      stopSpeaking();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tip.id]);

  // Début de chaque mouvement : la voix explique quoi faire et comment on va compter, puis le départ.
  useEffect(() => {
    if (phase.name !== 'move') return;
    setPlaying(true);
    setReady(LISTEN);
    setElapsed(0);
    setCounted(null);
    nextEvent.current = 0;
    soundEffects.playPop();
    const text = `${guide.intro} Prêt ?`;
    let started = false;
    let pause: ReturnType<typeof setTimeout> | undefined;
    const go = () => {
      if (started) return;
      started = true;
      setSpeaking(false);
      // Un petit silence avant le décompte : le temps de se mettre en place.
      pause = setTimeout(() => setReady((r) => (r === LISTEN ? 3 : r)), 900);
    };
    setSpeaking(true);
    speakFrenchText(personalize(text, name), { rate: 0.82, pitch: 1.15, onEnd: go, onError: go });
    // Filet de sécurité : certains navigateurs n'envoient jamais la fin de la voix.
    const safety = setTimeout(go, Math.max(4000, speechSeconds(text) * 1300));
    return () => {
      clearTimeout(safety);
      if (pause) clearTimeout(pause);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Le décompte de départ : 3, 2, 1 à voix haute (lentement), puis « Partez ! ».
  useEffect(() => {
    if (phase.name !== 'move' || !playing || ready === null || ready === LISTEN) return;
    if (ready > 0) {
      soundEffects.playTick();
      speakFrenchText(NUMBER_WORDS[ready], { rate: 0.9, pitch: 1.15 });
    } else {
      soundEffects.playPop();
      speakFrenchText('Partez !', { rate: 1, pitch: 1.2 });
    }
    const t = setTimeout(() => setReady(ready > 0 ? ready - 1 : null), ready > 0 ? 1300 : 1000);
    return () => clearTimeout(t);
  }, [ready, playing, phase]);

  // L'horloge du mouvement (4 fois par seconde : la voix tombe pile au bon moment).
  useEffect(() => {
    if (phase.name !== 'move' || !playing || ready !== null) return;
    const t = setInterval(() => setElapsed((e) => e + 250), 250);
    return () => clearInterval(t);
  }, [phase, playing, ready]);

  // Ce que la voix dit pendant le mouvement : compter, respirer, conseils, encouragements, fin.
  useEffect(() => {
    if (phase.name !== 'move' || ready !== null) return;
    while (nextEvent.current < guide.events.length && guide.events[nextEvent.current].at * 1000 <= elapsed) {
      const e = guide.events[nextEvent.current++];
      if (e.count) {
        soundEffects.playTick();
        setCounted(e.count);
      }
      const k = cuesOf(tip.moves[phase.index]).indexOf(e.say);
      if (k >= 0) setCue(k);
      say(e.say, e.count ? 0.95 : e.calm ? 0.72 : 0.85);
    }
    if (elapsed >= guide.seconds * 1000) {
      const last = phase.index === tip.moves.length - 1;
      if (last) {
        setPhase({ name: 'bravo' });
        soundEffects.playFanfare();
        confetti({ particleCount: 140, spread: 100, origin: { y: 0.6 } });
        setTimeout(() => say(`Bravo ${name} ! ${title === 'Le sport du jour' ? 'Tu as réussi le défi du jour.' : 'Séance réussie.'} Ton corps te dit merci !`), 900);
        onDone();
      } else setPhase({ name: 'rest', next: phase.index + 1 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed, ready, phase]);

  // Petite pause entre deux mouvements : on souffle, puis la voix explique le suivant.
  useEffect(() => {
    if (phase.name !== 'rest' || !playing) return;
    const breathe = setTimeout(() => say('Petite pause. Respire bien.', 0.78), 1100);
    const t = setTimeout(() => goMove(phase.next), REST_MS);
    return () => {
      clearTimeout(breathe);
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, playing]);

  function goMove(index: number) {
    setElapsed(0);
    setPhase({ name: 'move', index });
  }
  const start = () => goMove(0);
  const skip = () => {
    stopSpeaking();
    setSpeaking(false);
    if (phase.name === 'rest') return goMove(phase.next);
    if (phase.name !== 'move') return;
    // Pendant le décompte, « suivant » saute le décompte ; ensuite, il termine le mouvement.
    if (ready !== null) setReady(null);
    else {
      nextEvent.current = guide.events.length;
      setElapsed(guide.seconds * 1000);
    }
  };
  const togglePlay = () => {
    soundEffects.playPop();
    stopSpeaking();
    setSpeaking(false);
    // Reprendre pendant la consigne : on enchaîne directement sur le décompte.
    if (!playing && ready === LISTEN) setReady(3);
    setPlaying((p) => !p);
  };

  return (
    <div className="min-h-dvh flex flex-col bg-gradient-to-b from-soleil-clair/70 to-transparent">
      {scene && (
        <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
          <ThemeScene theme={scene} />
        </div>
      )}
      <TopBar
        title={title}
        emoji={headerEmoji}
        onBack={onBack}
        right={phase.name === 'intro' ? <SpeakButton speaking={speaking} label="Écouter" onClick={() => (speaking ? (stopSpeaking(), setSpeaking(false)) : say(introText))} /> : undefined}
      />
      <main className="relative z-10 flex-1 max-w-2xl w-full mx-auto px-5 py-6 flex flex-col items-center justify-center gap-6 text-center">
        <AnimatePresence mode="wait">
          {phase.name === 'intro' && (
            <motion.section key="intro" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={SPRING_SOFT} className="flex flex-col items-center gap-5">
              <motion.button
                type="button"
                className="text-[8rem] leading-none"
                style={{ originY: 1 }}
                animate={{ y: introHop.y, scaleY: introHop.scaleY, scaleX: introHop.scaleX }}
                transition={{ ...introHop.transition, repeat: 3, repeatDelay: 0.9 }}
                whileTap={{ scaleY: 0.8, scaleX: 1.15 }}
                onClick={(e) => {
                  const p = pointOf(e);
                  burst(p.x, p.y, [tip.emoji, '💪', '⭐'], 8);
                  soundEffects.playBoing();
                }}
                aria-label={tip.title}
              >
                <Mascot animal={mascotForMove(tip.moves[0])} mood={speaking ? 'talk' : 'idle'} size={190} />
              </motion.button>
              <h2 className="text-3xl sm:text-4xl font-bold">{tip.title}</h2>
              <div className="bg-white rounded-3xl shadow-bonbon px-5 py-4 max-w-md">
                <p className="text-sm font-bold text-corail mb-1">💡 Le conseil du jour</p>
                <p className="text-xl leading-snug">{personalize(tip.tip, name)}</p>
              </div>
              <ol className="flex gap-3" aria-label="Les mouvements">
                {tip.moves.map((m, i) => (
                  <motion.li key={i} {...POP_IN} transition={{ ...POP_IN.transition, delay: 0.3 + i * 0.12 }} className="w-16 h-16 rounded-2xl bg-white shadow-bonbon flex items-center justify-center text-3xl" title={m.text}>
                    {m.emoji}
                  </motion.li>
                ))}
              </ol>
              <p className="text-doux font-medium max-w-md">⚠️ {rule}</p>
              {tip.adulte && <p className="text-doux text-sm max-w-md">🧑‍🍼 Pour l’adulte : {tip.adulte}</p>}
              <p className="text-doux text-sm max-w-md">🩹 Bouge doucement. Si quelque chose fait mal, on arrête et on le dit à un adulte.</p>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={start} className="shadow-bonbon px-10 py-5 rounded-3xl bg-corail text-white text-2xl font-bold flex items-center gap-3">
                <Play className="w-8 h-8" /> C’est parti !
              </motion.button>
              {videoUrl && (
                <button
                  onClick={() => {
                    soundEffects.playPop();
                    stopSpeaking();
                    setSpeaking(false);
                    setVideoFailed(false);
                    setWatching(true);
                  }}
                  className="press shadow-bonbon px-7 py-3 rounded-2xl bg-white text-xl font-bold"
                >
                  🎬 Regarder la vidéo
                </button>
              )}
            </motion.section>
          )}

          {phase.name === 'move' && (
            <motion.section key={`move-${phase.index}`} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} transition={SPRING_SOFT} className="flex flex-col items-center gap-6 w-full">
              <span className="rounded-full bg-white shadow-bonbon px-4 py-1.5 font-semibold text-doux">
                Mouvement {phase.index + 1} / {tip.moves.length}
              </span>
              {/* L'animal montre le geste ; la bulle garde l'image du mouvement (grenouille, kangourou…) */}
              <div className="relative">
                <Mascot animal={mascotForMove(tip.moves[phase.index])} gesture={playing ? tip.moves[phase.index].anim : undefined} size={210} />
                <span className="absolute -right-8 bottom-0 w-16 h-16 rounded-full bg-white shadow-bonbon flex items-center justify-center text-4xl" aria-hidden>
                  {tip.moves[phase.index].emoji}
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-semibold leading-snug max-w-lg">{personalize(tip.moves[phase.index].text, name)}</p>
              {/* Consignes détaillées, une après l'autre (placement · respiration · sensation) */}
              <div className="flex items-center justify-center gap-5">
                <div className="text-corail">
                  {ready !== null ? (
                    <ReadyGo step={ready} />
                  ) : guide.mode === 'compte' && counted !== null && left > 1 ? (
                    <CountBubble n={counted} />
                  ) : (
                    <Countdown left={left} total={guide.seconds} />
                  )}
                </div>
                <nav className="flex items-center gap-5">
                  <button
                    onClick={togglePlay}
                    className="press shadow-bonbon w-20 h-20 rounded-full bg-corail text-white flex items-center justify-center"
                    aria-label={playing ? 'Pause' : 'Reprendre'}
                  >
                    {playing ? <Pause className="w-9 h-9" /> : <Play className="w-9 h-9 ml-1" />}
                  </button>
                  <button onClick={skip} className="press shadow-bonbon w-16 h-16 rounded-full bg-white flex items-center justify-center" aria-label="Mouvement suivant">
                    <SkipForward className="w-7 h-7" />
                  </button>
                </nav>
              </div>
              <ol className="w-full max-w-md grid gap-1.5 text-left" aria-label="Comment bien faire le mouvement">
                {(tip.moves[phase.index].cues ?? POSES[pose].cues).map((c, i) => (
                  <motion.li
                    key={`${pose}-${i}`}
                    animate={{ opacity: i === cue ? 1 : 0.45, scale: i === cue ? 1 : 0.98 }}
                    transition={SPRING_SOFT}
                    className={`flex gap-2 items-start rounded-2xl px-3 py-2 ${i === cue ? 'bg-white shadow-bonbon' : 'bg-white/70'}`}
                  >
                    <span className="shrink-0 w-6 h-6 rounded-full bg-corail text-white text-sm font-bold flex items-center justify-center">{i + 1}</span>
                    <span className="leading-snug">{c}</span>
                  </motion.li>
                ))}
              </ol>
            </motion.section>
          )}

          {phase.name === 'rest' && (
            <motion.section key={`rest-${phase.next}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={SPRING_SOFT} className="flex flex-col items-center gap-4">
              <motion.span className="text-[6rem] leading-none" animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} aria-hidden>
                😮‍💨
              </motion.span>
              <h2 className="text-3xl sm:text-4xl font-bold">Petite pause</h2>
              <p className="text-xl text-doux">Respire bien… Ensuite : {tip.moves[phase.next].emoji}</p>
              <span className="rounded-full bg-white shadow-bonbon px-4 py-1.5 font-semibold text-doux">
                Mouvement {phase.next + 1} / {tip.moves.length} dans un instant
              </span>
              <button onClick={skip} className="press shadow-bonbon px-6 py-3 rounded-2xl bg-white text-lg font-bold flex items-center gap-2">
                <SkipForward className="w-5 h-5" /> Je suis prêt
              </button>
            </motion.section>
          )}

          {phase.name === 'bravo' && (
            <motion.section key="bravo" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-5">
              <motion.div className="text-[8rem] leading-none" style={{ originY: 1 }} initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 9 }} aria-hidden>
                <motion.span className="inline-block" animate={introFloat.animate} transition={introFloat.transition}>
                  <Mascot animal={mascotForMove(tip.moves[tip.moves.length - 1])} mood="cheer" size={180} />
                </motion.span>
              </motion.div>
              <h2 className="text-4xl font-bold">Bravo {name} !</h2>
              <p className="text-xl text-doux">{title === 'Le sport du jour' ? 'Défi du jour réussi.' : 'Séance réussie !'} Pense à boire un verre d’eau 💧</p>
              <div className="flex flex-wrap justify-center gap-3">
                <button onClick={() => setPhase({ name: 'intro' })} className="press shadow-bonbon px-6 py-4 rounded-2xl bg-white text-xl font-bold">
                  🔁 Recommencer
                </button>
                <button onClick={onAnother} className="press shadow-bonbon px-6 py-4 rounded-2xl bg-corail text-white text-xl font-bold">
                  {anotherLabel}
                </button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* La vidéo animée de l'activité, en plein écran */}
      {watching && videoUrl && (
        <div className="fixed inset-0 z-50 bg-encre/95 flex items-center justify-center p-3" role="dialog" aria-modal="true" aria-label={`Vidéo : ${tip.title}`}>
          {videoFailed ? (
            <div className="bg-white rounded-3xl shadow-bonbon px-6 py-8 max-w-sm text-center">
              <p className="text-5xl mb-3" aria-hidden>🎬</p>
              <p className="text-xl font-bold">La vidéo ne démarre pas.</p>
              <p className="text-doux mt-1">Pas de souci, on peut jouer sans elle !</p>
              <button onClick={() => setWatching(false)} className="press shadow-bonbon mt-4 px-6 py-3 rounded-2xl bg-corail text-white text-xl font-bold">
                C’est parti !
              </button>
            </div>
          ) : (
            <video src={videoUrl} controls autoPlay playsInline preload="auto" onError={() => setVideoFailed(true)} onEnded={() => setWatching(false)} className="max-w-full max-h-full rounded-2xl" />
          )}
          <button onClick={() => setWatching(false)} className="press absolute top-4 right-4 w-14 h-14 rounded-full bg-white shadow-bonbon text-2xl font-bold" aria-label="Fermer la vidéo">
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
