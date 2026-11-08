import { useEffect, useState, type MouseEvent } from 'react';
import { AnimatePresence, motion, type TargetAndTransition } from 'motion/react';
import confetti from 'canvas-confetti';
import { AVENTURES, type Aventure, type Bruit, type Reaction } from '../data/aventures';
import { soundEffects, speakFrenchText, stopSpeaking } from '../utils/soundEffects';
import { boing, jump, LIFT, PRESS, spin, SPRING_BOUNCY, SPRING_SOFT, wiggle } from '../lib/motion';
import { SpeakButton, TopBar } from './ui';
import { burst, pointOf } from './fx';
import { sceneFor, ThemeScene } from './ThemeScene';

/** Liste des aventures à explorer. */
export function AventuresList({ done, onBack, onPick }: { done: Set<string>; onBack: () => void; onPick: (id: string) => void }) {
  return (
    <div className="min-h-dvh">
      <TopBar title="Les aventures" emoji="🗺️" onBack={onBack} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pb-10 pt-2">
        <p className="text-doux mb-4">Touche les objets pour retrouver ce qui est caché !</p>
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {AVENTURES.map((a, i) => (
            <motion.li key={a.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <motion.button whileHover={LIFT} whileTap={PRESS} onClick={() => (soundEffects.playPop(), onPick(a.id))} className={`relative w-full rounded-3xl shadow-bonbon p-4 text-left bg-gradient-to-b ${a.sky}`}>
                {done.has(a.id) && (
                  <span className="absolute top-2 right-2 w-7 h-7 rounded-full bg-menthe text-white text-sm font-bold flex items-center justify-center" aria-label="Déjà réussie">
                    ✓
                  </span>
                )}
                <span className="block text-5xl mb-2" aria-hidden>
                  {a.emoji}
                </span>
                <span className={`block font-bold leading-snug ${a.id === 'av-07' ? 'text-white' : 'text-encre'}`}>{a.title}</span>
                <span className={`block text-sm ${a.id === 'av-07' ? 'text-white/80' : 'text-doux'}`}>
                  Trouve 3 {a.goal}
                </span>
              </motion.button>
            </motion.li>
          ))}
        </ul>
      </main>
    </div>
  );
}

const REACT: Record<Reaction, TargetAndTransition> = { saute: jump(26, 0.7), tortille: wiggle(16, 0.8), tourne: spin(0.9), grossit: boing(0.8) };

function playBruit(b: Bruit | undefined) {
  switch (b) {
    case 'boing':
      return soundEffects.playBoing();
    case 'sparkle':
      return soundEffects.playSparkle();
    case 'whoosh':
      return soundEffects.playWhoosh();
    case 'vache':
      return soundEffects.playAnimal('cow');
    case 'mouton':
      return soundEffects.playAnimal('sheep');
    case 'cochon':
      return soundEffects.playAnimal('pig');
    case 'poule':
      return soundEffects.playAnimal('chicken');
    default:
      return soundEffects.playPop();
  }
}

/**
 * La scène : on touche un objet, il réagit (mouvement, bruit, phrase). Derrière 3 d'entre eux se cache
 * ce qu'on cherche : il surgit et rejoint le compteur. Après 4 essais sans rien trouver, les cachettes bougent.
 */
export function AventureScene({ aventure, name, onBack, onDone, onNext }: { aventure: Aventure; name: string; onBack: () => void; onDone: () => void; onNext: () => void }) {
  const [searched, setSearched] = useState<Set<number>>(new Set());
  const [found, setFound] = useState(0);
  const [pop, setPop] = useState<number | null>(null);
  const [tapKey, setTapKey] = useState<Record<number, number>>({});
  const [emptyTaps, setEmptyTaps] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [nextIn, setNextIn] = useState<number | null>(null);
  const total = aventure.spots.filter((s) => s.hides).length;
  const done = found >= total;
  const dark = aventure.id === 'av-07';

  const say = (text: string) => {
    setSpeaking(true);
    speakFrenchText(text, { rate: 0.92, pitch: 1.12, onEnd: () => setSpeaking(false), onError: () => setSpeaking(false) });
  };

  useEffect(() => {
    const t = setTimeout(() => say(aventure.story), 400);
    return () => {
      clearTimeout(t);
      stopSpeaking();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aventure.id]);

  // Fin : on enchaîne tout seul sur l'aventure suivante.
  useEffect(() => {
    if (nextIn === null) return;
    if (nextIn <= 0) return onNext();
    const t = setTimeout(() => setNextIn((n) => (n === null ? null : n - 1)), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextIn]);

  const touch = (i: number, e: MouseEvent<HTMLButtonElement>) => {
    if (done) return;
    const s = aventure.spots[i];
    setTapKey((k) => ({ ...k, [i]: (k[i] ?? 0) + 1 }));
    if (s.hides && !searched.has(i)) {
      const next = found + 1;
      setSearched(new Set(searched).add(i));
      setFound(next);
      setPop(i);
      setEmptyTaps(0);
      setTimeout(() => setPop(null), 1100);
      soundEffects.playStarChime();
      const p = pointOf(e);
      burst(p.x, p.y, [aventure.goal, '✨', '⭐'], 10);
      if (next >= total) {
        setTimeout(() => {
          soundEffects.playFanfare();
          confetti({ particleCount: 140, spread: 100, origin: { y: 0.6 } });
          say(`${aventure.bravo} Bravo ${name} !`);
          onDone();
          setNextIn(6);
        }, 700);
        say(`${s.say} Oui ! ${aventure.goalWord} !`);
      } else {
        say(`${s.say} Oui ! ${aventure.goalWord} ! Encore ${total - next}.`);
      }
      return;
    }
    playBruit(s.sound);
    setEmptyTaps((n) => n + 1);
    say(s.hides ? 'Il n’y a plus rien ici.' : s.say);
  };

  const hint = emptyTaps >= 4 && !done;

  return (
    <div className="min-h-dvh flex flex-col">
      <TopBar
        title={aventure.title}
        emoji={aventure.emoji}
        onBack={onBack}
        right={<SpeakButton speaking={speaking} label="Histoire" onClick={() => (speaking ? (stopSpeaking(), setSpeaking(false)) : say(aventure.story))} />}
      />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 pb-6 flex flex-col gap-4">
        {/* Compteur : ce qu'on a retrouvé */}
        <div className="flex items-center justify-center gap-3" aria-label={`${found} sur ${total} trouvés`}>
          {Array.from({ length: total }, (_, i) => (
            <motion.span
              key={i}
              className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-bonbon ${i < found ? 'bg-soleil' : 'bg-white/70'}`}
              animate={i < found ? { scale: [0.6, 1.25, 1] } : { scale: 1 }}
              transition={SPRING_BOUNCY}
            >
              <span className={i < found ? '' : 'opacity-20 grayscale'}>{aventure.goal}</span>
            </motion.span>
          ))}
        </div>

        {/* La scène */}
        <div className={`relative w-full aspect-[4/3] rounded-[2rem] overflow-hidden shadow-bonbon bg-gradient-to-b ${aventure.sky}`}>
          <ThemeScene theme={sceneFor(`${aventure.title} ${aventure.story}`, 'nature')} />
          <div className={`absolute inset-x-0 bottom-0 h-[38%] ${aventure.ground} rounded-t-[50%_20%]`} aria-hidden />
          {aventure.spots.map((s, i) => {
            const r = REACT[s.react ?? 'saute'];
            const showHint = hint && s.hides && !searched.has(i);
            return (
              <motion.button
                key={`${i}-${tapKey[i] ?? 0}`}
                onClick={(e) => touch(i, e)}
                className="absolute -translate-x-1/2 -translate-y-1/2 leading-none p-1 rounded-2xl"
                style={{ left: `${s.x}%`, top: `${s.y}%`, fontSize: `${s.size ?? 3}rem`, originY: 1 }}
                initial={false}
                animate={tapKey[i] ? r : showHint ? { rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] } : {}}
                transition={showHint ? { duration: 1, repeat: Infinity } : undefined}
                whileTap={PRESS}
                aria-label={s.say}
              >
                {s.emoji}
              </motion.button>
            );
          })}
          {/* La chose trouvée surgit de sa cachette */}
          <AnimatePresence>
            {pop !== null && (
              <motion.span
                key={`pop-${pop}`}
                className="absolute text-6xl pointer-events-none"
                style={{ left: `${aventure.spots[pop].x}%`, top: `${aventure.spots[pop].y}%` }}
                initial={{ x: '-50%', y: '-50%', scale: 0, opacity: 0 }}
                animate={{ y: '-160%', scale: 1.4, opacity: 1 }}
                exit={{ y: '-300%', scale: 0.6, opacity: 0 }}
                transition={SPRING_SOFT}
                aria-hidden
              >
                {aventure.goal}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <p className={`text-center font-medium ${dark ? 'text-doux' : 'text-doux'}`}>{hint ? '👀 Regarde ce qui bouge !' : 'Touche les objets pour chercher.'}</p>

        {done && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={SPRING_SOFT} className="flex flex-col items-center gap-3">
            <p className="text-2xl font-bold text-menthe text-center">{aventure.bravo}</p>
            <button onClick={() => (soundEffects.playWhoosh(), onNext())} className="press shadow-bonbon relative overflow-hidden px-8 py-4 rounded-2xl bg-menthe text-white text-xl font-bold">
              <motion.span className="absolute inset-y-0 left-0 bg-white/25" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 6, ease: 'linear' }} aria-hidden />
              <span className="relative">Aventure suivante ➜ {nextIn !== null && nextIn > 0 ? nextIn : ''}</span>
            </button>
          </motion.div>
        )}
      </main>
    </div>
  );
}
