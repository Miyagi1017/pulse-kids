import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Pause, Play, SkipForward } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { SportTip } from '../data/sport';
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

type Phase = { name: 'intro' } | { name: 'move'; index: number } | { name: 'bravo' };

/** Étape du départ où la voix lit encore la consigne (avant 3, 2, 1). */
const LISTEN = -1;

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
  const [left, setLeft] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [watching, setWatching] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const videoUrl = sportVideoUrl(tip.id);
  const [cue, setCue] = useState(0);
  /**
   * Le départ de chaque mouvement : la voix lit la consigne (LISTEN), puis compte 3, 2, 1
   * et dit « Partez ! » (0). `null` : le chrono tourne.
   */
  const [ready, setReady] = useState<number | null>(null);
  const pose = phase.name === 'move' ? poseFor(tip.moves[phase.index]) : 'respire';

  // Les 3 consignes défilent doucement pendant le mouvement.
  useEffect(() => {
    setCue(0);
  }, [phase]);
  useEffect(() => {
    if (phase.name !== 'move' || !playing) return;
    const t = setInterval(() => setCue((c) => (c + 1) % 3), 3800);
    return () => clearInterval(t);
  }, [phase, playing]);

  const say = (text: string) => {
    setSpeaking(true);
    speakFrenchText(personalize(text, name), { rate: 0.95, pitch: 1.15, onEnd: () => setSpeaking(false), onError: () => setSpeaking(false) });
  };
  const introText = `${tip.title.replace(/^Séance (\d+) · /, 'Séance $1 : ')} ! ${tip.tip} ${rule} Si quelque chose fait mal, on arrête. C’est parti !`;

  useEffect(() => {
    const t = setTimeout(() => say(introText), 400);
    return () => {
      clearTimeout(t);
      stopSpeaking();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tip.id]);

  // Début de chaque mouvement : la voix lit la consigne, puis le décompte de départ.
  useEffect(() => {
    if (phase.name !== 'move') return;
    const move = tip.moves[phase.index];
    setPlaying(true);
    setReady(LISTEN);
    soundEffects.playPop();
    const consigne = /[.!?…]$/.test(move.text.trim()) ? move.text.trim() : `${move.text.trim()}.`;
    const text = `${phase.index === 0 ? '' : 'Mouvement suivant ! '}${consigne} Prêt ?`;
    let started = false;
    const go = () => {
      if (started) return;
      started = true;
      setSpeaking(false);
      setReady((r) => (r === LISTEN ? 3 : r));
    };
    setSpeaking(true);
    speakFrenchText(personalize(text, name), { rate: 0.95, pitch: 1.15, onEnd: go, onError: go });
    // Filet de sécurité : certains navigateurs n'envoient jamais la fin de la voix.
    const safety = setTimeout(go, Math.max(3000, text.length * 85));
    return () => clearTimeout(safety);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Le décompte de départ : 3, 2, 1 à voix haute, puis « Partez ! » et le chrono démarre.
  useEffect(() => {
    if (phase.name !== 'move' || !playing || ready === null || ready === LISTEN) return;
    if (ready > 0) {
      soundEffects.playTick();
      speakFrenchText(String(ready), { rate: 1, pitch: 1.15 });
    } else {
      soundEffects.playPop();
      speakFrenchText('Partez !', { rate: 1, pitch: 1.2 });
    }
    const t = setTimeout(() => setReady(ready > 0 ? ready - 1 : null), ready > 0 ? 1000 : 800);
    return () => clearTimeout(t);
  }, [ready, playing, phase]);

  // Le chrono : 3, 2, 1 annoncés à voix haute, puis mouvement suivant.
  useEffect(() => {
    if (phase.name !== 'move' || !playing || ready !== null) return;
    if (left <= 0) {
      const last = phase.index === tip.moves.length - 1;
      if (last) {
        setPhase({ name: 'bravo' });
        soundEffects.playFanfare();
        confetti({ particleCount: 140, spread: 100, origin: { y: 0.6 } });
        say(`Bravo ${name} ! ${title === 'Le sport du jour' ? 'Tu as réussi le défi du jour.' : 'Séance réussie.'} Ton corps te dit merci !`);
        onDone();
      } else goMove(phase.index + 1);
      return;
    }
    const t = setTimeout(() => {
      if (left <= 4 && left > 1) {
        soundEffects.playTick();
        speakFrenchText(String(left - 1), { rate: 1, pitch: 1.1 });
      }
      setLeft((l) => l - 1);
    }, 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, playing, phase, ready]);

  /** Durée et mouvement changent ensemble : le chrono ne voit jamais un 0 périmé. */
  function goMove(index: number) {
    setLeft(tip.moves[index].seconds);
    setPhase({ name: 'move', index });
  }
  const start = () => goMove(0);
  const skip = () => {
    if (phase.name !== 'move') return;
    // Pendant le décompte, « suivant » saute le décompte ; ensuite, il passe au mouvement suivant.
    if (ready !== null) {
      stopSpeaking();
      setSpeaking(false);
      setReady(null);
    } else setLeft(0);
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
                  {ready === null ? <Countdown left={left} total={tip.moves[phase.index].seconds} /> : <ReadyGo step={ready} />}
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
