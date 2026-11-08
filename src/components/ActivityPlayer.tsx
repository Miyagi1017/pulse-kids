import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { CATEGORY_INFO, type Activity } from '../data/activites';
import { splitChoice } from '../data/jeux';
import { soundEffects, speakFrenchText, stopSpeaking } from '../utils/soundEffects';
import { SpeakButton, TopBar } from './ui';
import { burst, pointOf } from './fx';
import { FindAllGame, MemoryGame } from './games';
import { sceneFor, ThemeScene, type SceneTheme } from './ThemeScene';
import { Mascot } from './Mascot';
import { mascotForScene } from '../lib/mascots';

/** Décor par défaut selon la famille de jeu, quand le texte ne donne pas d'indice. */
const CATEGORY_SCENE: Record<string, SceneTheme> = {
  decouverte: 'nature', maths: 'fete', logique: 'espace', memoire: 'fete', suites: 'espace', observation: 'animaux',
  langue: 'fete', etre: 'nature', vivre: 'journal', ia: 'espace', discipline: 'journal'
};
import { boing, float, jump, LIFT, POP_IN, PRESS, SHAKE, SPRING_SOFT } from '../lib/motion';

const vfFloat = float(10, 1.8);
const countHop = jump(16, 0.6);
const rightBoing = boing(0.8);

interface Choice {
  key: string;
  emoji: string;
  word: string;
  correct: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Mélange en garantissant que l'ordre affiché n'est pas déjà la solution. */
function shuffleNotSorted<T>(arr: T[]): T[] {
  if (arr.length < 2) return arr;
  let s = shuffle(arr);
  while (s.every((v, i) => v === arr[i])) s = shuffle(arr);
  return s;
}

interface Round {
  question: string;
  display?: string;
  choices: Choice[];
  /** Pour « remettre dans l'ordre » : les étapes attendues. */
  steps?: { emoji: string; word: string }[];
}

function build(a: Activity): Round {
  const toChoice = (c: string, correct: boolean): Choice => ({ key: c, ...splitChoice(c), correct });
  switch (a.kind) {
    case 'devinette':
      return { question: a.question, choices: shuffle(a.choices.map((c, i) => toChoice(c, i === 0))) };
    case 'compte': {
      const options = [...new Set([a.count, Math.max(1, a.count - 1), a.count + 1, a.count + 2])].slice(0, 3);
      if (!options.includes(a.count)) options[0] = a.count;
      return {
        question: `Combien y a-t-il de ${a.title.replace(/^Les /, '').toLowerCase()} ?`,
        display: a.item.repeat(a.count),
        choices: shuffle(options).map((n) => ({ key: String(n), emoji: String(n), word: '', correct: n === a.count }))
      };
    }
    case 'intrus':
      return { question: 'Lequel n’est pas comme les autres ?', choices: shuffle(a.items.map((c, i) => toChoice(c, i === a.items.length - 1))) };
    case 'vf':
      return {
        question: `${a.statement} Oui ou non ?`,
        choices: [
          { key: 'oui', emoji: '👍', word: 'Oui !', correct: a.answer },
          { key: 'non', emoji: '👎', word: 'Non !', correct: !a.answer }
        ]
      };
    case 'ordre': {
      const steps = a.steps.map(splitChoice);
      return { question: a.question, steps, choices: shuffleNotSorted(a.steps).map((c) => toChoice(c, false)) };
    }
    case 'suite':
      return {
        question: 'Qu’est-ce qui vient après ?',
        display: `${a.sequence.join(' ')} ❓`,
        choices: shuffle(a.choices).map((c) => ({ key: c, emoji: c, word: '', correct: c === a.answer }))
      };
    case 'memoire':
      return { question: 'Retourne les cartes et trouve les paires !', choices: [] };
    case 'trouve':
      return { question: a.question, choices: [] };
  }
}

export function ActivityPlayer({ activity, name, onBack, onSolved, onNext }: { activity: Activity; name: string; onBack: () => void; onSolved: () => void; onNext: () => void }) {
  const round = useMemo(() => build(activity), [activity]);
  const [wrong, setWrong] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const [placed, setPlaced] = useState<string[]>([]); // mode « ordre »
  const [speaking, setSpeaking] = useState(false);
  const [counted, setCounted] = useState<number[]>([]); // mode « compte » : objets déjà touchés
  const [misses, setMisses] = useState(0); // après 2 erreurs, la bonne réponse se met à bouger
  const [nextIn, setNextIn] = useState<number | null>(null); // « clique et c'est parti » : jeu suivant automatique
  const hint = misses >= 2 && !solved;
  const [oops, setOops] = useState(false); // la mascotte fait « oh » un instant après une erreur
  const cat = CATEGORY_INFO[activity.category];

  const say = (text: string) => {
    setSpeaking(true);
    speakFrenchText(text, { rate: 0.9, pitch: 1.15, onEnd: () => setSpeaking(false), onError: () => setSpeaking(false) });
  };

  useEffect(() => {
    setSolved(false);
    setWrong(null);
    setPlaced([]);
    setCounted([]);
    setMisses(0);
    setNextIn(null);
    const t = setTimeout(() => say(round.question), 350);
    return () => {
      clearTimeout(t);
      stopSpeaking();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activity.id]);

  const win = () => {
    setSolved(true);
    setWrong(null);
    soundEffects.playStarChime();
    confetti({ particleCount: 110, spread: 90, origin: { y: 0.6 } });
    say(`${activity.bravo} Bravo ${name} !`);
    onSolved();
    setNextIn(5); // le jeu suivant démarre tout seul, pas de bouton à chercher
  };

  // Compte à rebours vers le jeu suivant (on peut toucher pour y aller tout de suite).
  useEffect(() => {
    if (nextIn === null) return;
    if (nextIn <= 0) {
      onNext();
      return;
    }
    const t = setTimeout(() => setNextIn((n) => (n === null ? null : n - 1)), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextIn]);

  /** Erreur : un « oups » doux, une phrase courte ; à la 2e, on montre la bonne réponse qui bouge. */
  const miss = (key: string, word: string) => {
    setWrong(key);
    setOops(true);
    setTimeout(() => setOops(false), 1400);
    soundEffects.playOops();
    const n = misses + 1;
    setMisses(n);
    if (n >= 2) say('Regarde, c’est celui qui bouge !');
    else say(word ? `${word} ? Non. Essaie encore !` : 'Essaie encore !');
  };

  /** Compter avec le doigt : chaque objet touché s'allume et la voix dit son numéro. */
  const countItem = (i: number, e: MouseEvent<HTMLButtonElement>) => {
    if (counted.includes(i)) return;
    const n = counted.length + 1;
    setCounted([...counted, i]);
    soundEffects.playPop();
    const p = pointOf(e);
    burst(p.x, p.y, ['✨', String(n)], 5);
    speakFrenchText(String(n), { rate: 1, pitch: 1.2 });
  };

  const answer = (c: Choice, e: MouseEvent<HTMLButtonElement>) => {
    if (solved) return;
    const p = pointOf(e);
    if (round.steps) {
      // Remettre dans l'ordre : la prochaine étape attendue est steps[placed.length].
      const expected = activity.kind === 'ordre' ? activity.steps[placed.length] : '';
      if (c.key === expected) {
        soundEffects.playPop();
        burst(p.x, p.y, [c.emoji, '✨'], 6);
        if (c.word) speakFrenchText(c.word, { rate: 0.95, pitch: 1.15 });
        const next = [...placed, c.key];
        setPlaced(next);
        setWrong(null);
        if (next.length === round.steps.length) setTimeout(win, 400);
      } else miss(c.key, c.word);
      return;
    }
    if (c.correct) {
      burst(p.x, p.y, [c.emoji, '⭐', '🎉', '✨'], 12);
      win();
    } else miss(c.key, c.word);
  };

  const big = activity.kind === 'compte' ? 'text-5xl font-bold' : 'text-6xl sm:text-7xl';
  const cols = activity.kind === 'vf' || round.choices.length === 4 ? 'grid-cols-2' : 'grid-cols-3';

  const scene = sceneFor(`${activity.title} ${round.question}`, CATEGORY_SCENE[activity.category] ?? 'nature');

  return (
    <div className="min-h-dvh flex flex-col">
      <div className="fixed inset-0 pointer-events-none z-0 opacity-60" aria-hidden>
        <ThemeScene theme={scene} />
      </div>
      <TopBar
        title={activity.title}
        emoji={activity.emoji}
        onBack={onBack}
        right={<SpeakButton speaking={speaking} label="Répète" onClick={() => (speaking ? (stopSpeaking(), setSpeaking(false)) : say(round.question))} />}
      />
      <main className="relative z-10 flex-1 max-w-2xl w-full mx-auto px-5 py-6 flex flex-col items-center justify-center gap-7 text-center">
        <Mascot animal={mascotForScene(scene)} mood={solved ? 'cheer' : hint ? 'hint' : oops ? 'oops' : speaking ? 'talk' : 'idle'} size={88} />
        <span className="rounded-full bg-white shadow-bonbon px-4 py-1.5 font-semibold text-doux">
          {cat.emoji} {cat.label}
        </span>

        {activity.kind === 'vf' && (
          <motion.div className="text-8xl" animate={vfFloat.animate} transition={vfFloat.transition} aria-hidden>
            {activity.emoji}
          </motion.div>
        )}

        <h2 className="text-2xl sm:text-4xl font-bold leading-tight">{activity.kind === 'vf' ? activity.statement : round.question}</h2>

        {activity.kind === 'compte' ? (
          <div className="bg-white rounded-3xl shadow-bonbon px-4 py-4 flex flex-wrap justify-center gap-1 max-w-full">
            {Array.from({ length: activity.count }, (_, i) => {
              const rank = counted.indexOf(i);
              return (
                <motion.button
                  type="button"
                  key={i}
                  onClick={(e) => countItem(i, e)}
                  whileTap={PRESS}
                  style={{ originY: 1 }}
                  animate={rank >= 0 ? { y: countHop.y, scaleY: countHop.scaleY, scaleX: countHop.scaleX } : {}}
                  transition={countHop.transition}
                  className={`relative text-5xl sm:text-6xl leading-none p-1.5 rounded-2xl ${rank >= 0 ? 'bg-soleil-clair' : ''}`}
                  aria-label={rank >= 0 ? `Compté : ${rank + 1}` : 'Touche pour compter'}
                >
                  {activity.item}
                  {rank >= 0 && (
                    <motion.span {...POP_IN} className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-corail text-white text-base font-bold flex items-center justify-center">
                      {rank + 1}
                    </motion.span>
                  )}
                </motion.button>
              );
            })}
          </div>
        ) : (
          round.display && (
            <div className="bg-white rounded-3xl shadow-bonbon px-6 py-5 text-5xl sm:text-6xl leading-snug tracking-wider max-w-full break-words">{round.display}</div>
          )
        )}

        {/* Cases de l'ordre à remplir */}
        {round.steps && (
          <ol className="flex gap-2 sm:gap-3 justify-center w-full">
            {round.steps.map((s, i) => (
              <li
                key={i}
                className={`flex-1 max-w-28 aspect-square rounded-2xl border-4 border-dashed flex flex-col items-center justify-center ${
                  placed[i] ? 'bg-menthe-clair border-menthe' : 'border-encre/15'
                }`}
              >
                <span className="text-xs font-bold text-doux">{i + 1}</span>
                {placed[i] ? (
                  <motion.span {...POP_IN} className="text-4xl sm:text-5xl">
                    {s.emoji}
                  </motion.span>
                ) : (
                  <span className="text-3xl text-encre/15">?</span>
                )}
              </li>
            ))}
          </ol>
        )}

        {/* Jeux à grille : mémoire et « touche tous les… » */}
        {activity.kind === 'memoire' && !solved && <MemoryGame key={activity.id} pairs={activity.pairs} onWin={win} />}
        {activity.kind === 'trouve' && !solved && (
          <FindAllGame
            key={activity.id}
            targets={activity.targets}
            others={activity.others}
            onWin={win}
            hint={hint}
            onMiss={() => {
              soundEffects.playOops();
              const n = misses + 1;
              setMisses(n);
              say(n >= 2 ? 'Regarde, ceux qui bougent !' : 'Pas celui-là. Cherche encore !');
            }}
          />
        )}

        {round.choices.length > 0 && !(round.steps && solved) && <div className={`grid gap-4 w-full ${cols}`}>
          {round.choices.map((c) => {
            const used = placed.includes(c.key);
            const isRight = solved && (c.correct || (round.steps && used));
            const isWrong = wrong === c.key;
            const expected = activity.kind === 'ordre' ? activity.steps[placed.length] === c.key : c.correct;
            const showHint = hint && expected && !isWrong;
            if (round.steps && used && !solved) return <span key={c.key} className="aspect-square" aria-hidden />;
            return (
              <motion.button
                key={c.key}
                onClick={(e) => answer(c, e)}
                whileHover={solved ? undefined : LIFT}
                whileTap={PRESS}
                style={{ originY: 1 }}
                animate={isWrong ? SHAKE : isRight ? rightBoing : showHint ? { scale: [1, 1.12, 1], rotate: [0, -6, 6, 0] } : {}}
                transition={showHint ? { duration: 0.9, repeat: Infinity } : undefined}
                className={`shadow-bonbon rounded-[2rem] flex flex-col items-center justify-center gap-1 p-2 ${activity.kind === 'vf' ? 'py-6' : 'aspect-square'} ${
                  isRight ? 'bg-menthe text-white ring-8 ring-menthe-clair' : isWrong ? 'bg-rose-clair' : showHint ? 'bg-soleil-clair ring-8 ring-soleil' : 'bg-white'
                } ${solved && !isRight ? 'opacity-40' : ''}`}
                aria-label={c.word || c.emoji}
              >
                <span className={big}>{c.emoji}</span>
                {c.word && <span className={`text-sm sm:text-base font-semibold leading-tight ${isRight ? 'text-white' : 'text-doux'}`}>{c.word}</span>}
              </motion.button>
            );
          })}
        </div>}

        {solved && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={SPRING_SOFT} className="space-y-4">
            <motion.div className="text-6xl" initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 9 }} aria-hidden>
              🏆
            </motion.div>
            <p className="text-2xl font-semibold text-menthe">{activity.bravo}</p>
            {/* Le jeu suivant arrive tout seul ; toucher le bouton y va tout de suite */}
            <button onClick={() => (soundEffects.playWhoosh(), onNext())} className="press shadow-bonbon relative overflow-hidden px-8 py-4 rounded-2xl bg-menthe text-white text-xl font-bold">
              <motion.span className="absolute inset-y-0 left-0 bg-white/25" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 5, ease: 'linear' }} aria-hidden />
              <span className="relative">Jeu suivant ➜ {nextIn !== null && nextIn > 0 ? nextIn : ''}</span>
            </button>
          </motion.div>
        )}
      </main>
    </div>
  );
}
