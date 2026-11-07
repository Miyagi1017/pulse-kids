import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { CATEGORY_INFO, type Activity } from '../data/activites';
import { splitChoice } from '../data/jeux';
import { soundEffects, speakFrenchText, stopSpeaking } from '../utils/soundEffects';
import { SpeakButton, TopBar } from './ui';

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
  }
}

export function ActivityPlayer({ activity, name, onBack, onSolved, onNext }: { activity: Activity; name: string; onBack: () => void; onSolved: () => void; onNext: () => void }) {
  const round = useMemo(() => build(activity), [activity]);
  const [wrong, setWrong] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const [placed, setPlaced] = useState<string[]>([]); // mode « ordre »
  const [speaking, setSpeaking] = useState(false);
  const cat = CATEGORY_INFO[activity.category];

  const say = (text: string) => {
    setSpeaking(true);
    speakFrenchText(text, { rate: 0.9, pitch: 1.15, onEnd: () => setSpeaking(false), onError: () => setSpeaking(false) });
  };

  useEffect(() => {
    setSolved(false);
    setWrong(null);
    setPlaced([]);
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
  };

  const miss = (key: string, word: string) => {
    setWrong(key);
    soundEffects.playPop();
    say(word ? `${word}… Presque ! Essaie encore.` : 'Presque ! Essaie encore.');
  };

  const answer = (c: Choice) => {
    if (solved) return;
    if (round.steps) {
      // Remettre dans l'ordre : la prochaine étape attendue est steps[placed.length].
      const expected = activity.kind === 'ordre' ? activity.steps[placed.length] : '';
      if (c.key === expected) {
        soundEffects.playPop();
        if (c.word) speakFrenchText(c.word, { rate: 0.95, pitch: 1.15 });
        const next = [...placed, c.key];
        setPlaced(next);
        setWrong(null);
        if (next.length === round.steps.length) setTimeout(win, 400);
      } else miss(c.key, c.word);
      return;
    }
    if (c.correct) win();
    else miss(c.key, c.word);
  };

  const big = activity.kind === 'compte' ? 'text-5xl font-bold' : 'text-6xl sm:text-7xl';
  const cols = activity.kind === 'vf' || round.choices.length === 4 ? 'grid-cols-2' : 'grid-cols-3';

  return (
    <div className="min-h-dvh flex flex-col">
      <TopBar
        title={activity.title}
        emoji={activity.emoji}
        onBack={onBack}
        right={<SpeakButton speaking={speaking} label="Répète" onClick={() => (speaking ? (stopSpeaking(), setSpeaking(false)) : say(round.question))} />}
      />
      <main className="flex-1 max-w-2xl w-full mx-auto px-5 py-6 flex flex-col items-center justify-center gap-7 text-center">
        <span className="rounded-full bg-white shadow-bonbon px-4 py-1.5 font-semibold text-doux">
          {cat.emoji} {cat.label}
        </span>

        {activity.kind === 'vf' && (
          <motion.div className="text-8xl" animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }} aria-hidden>
            {activity.emoji}
          </motion.div>
        )}

        <h2 className="text-2xl sm:text-4xl font-bold leading-tight">{activity.kind === 'vf' ? activity.statement : round.question}</h2>

        {round.display && (
          <div className="bg-white rounded-3xl shadow-bonbon px-6 py-5 text-5xl sm:text-6xl leading-snug tracking-wider max-w-full break-words" aria-label={`${activity.kind === 'compte' ? activity.count : ''} objets`}>
            {round.display}
          </div>
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
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-4xl sm:text-5xl">
                    {s.emoji}
                  </motion.span>
                ) : (
                  <span className="text-3xl text-encre/15">?</span>
                )}
              </li>
            ))}
          </ol>
        )}

        {!(round.steps && solved) && <div className={`grid gap-4 w-full ${cols}`}>
          {round.choices.map((c) => {
            const used = placed.includes(c.key);
            const isRight = solved && (c.correct || (round.steps && used));
            const isWrong = wrong === c.key;
            if (round.steps && used && !solved) return <span key={c.key} className="aspect-square" aria-hidden />;
            return (
              <motion.button
                key={c.key}
                onClick={() => answer(c)}
                animate={isWrong ? { x: [0, -10, 10, -6, 6, 0] } : isRight ? { scale: [1, 1.12, 1] } : {}}
                transition={{ duration: 0.45 }}
                className={`press shadow-bonbon rounded-[2rem] flex flex-col items-center justify-center gap-1 p-2 ${activity.kind === 'vf' ? 'py-6' : 'aspect-square'} ${
                  isRight ? 'bg-menthe text-white ring-8 ring-menthe-clair' : isWrong ? 'bg-rose-clair' : 'bg-white'
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
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <p className="text-2xl font-semibold text-menthe">{activity.bravo}</p>
            <button onClick={onNext} className="press shadow-bonbon px-8 py-4 rounded-2xl bg-menthe text-white text-xl font-bold">
              Jeu suivant ➜
            </button>
          </motion.div>
        )}
      </main>
    </div>
  );
}
