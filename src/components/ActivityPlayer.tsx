import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import type { Activity } from '../data/activites';
import { soundEffects, speakFrenchText, stopSpeaking } from '../utils/soundEffects';
import { SpeakButton, TopBar } from './ui';

interface Choice {
  key: string;
  label: string;
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

/** Transforme une activité en question + choix (toujours de gros boutons, 3 ou 4 choix). */
function build(a: Activity): { question: string; display?: string; choices: Choice[] } {
  switch (a.kind) {
    case 'devinette':
      return { question: a.question, choices: shuffle(a.choices.map((c, i) => ({ key: c, label: c, correct: i === 0 }))) };
    case 'compte': {
      const options = shuffle([...new Set([a.count, Math.max(1, a.count - 1), a.count + 1, a.count + 2])].slice(0, 3));
      if (!options.includes(a.count)) options[0] = a.count;
      return {
        question: `Combien y a-t-il de ${a.title.replace(/^Les /, '').toLowerCase()} ?`,
        display: a.item.repeat(a.count),
        choices: shuffle(options).map((n) => ({ key: String(n), label: String(n), correct: n === a.count }))
      };
    }
    case 'intrus':
      return {
        question: 'Lequel n’est pas comme les autres ?',
        choices: shuffle(a.items.map((c, i) => ({ key: c, label: c, correct: i === a.items.length - 1 })))
      };
  }
}

export function ActivityPlayer({ activity, name, onBack, onSolved, onNext }: { activity: Activity; name: string; onBack: () => void; onSolved: () => void; onNext: () => void }) {
  const round = useMemo(() => build(activity), [activity]);
  const [wrong, setWrong] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const say = (text: string) => {
    setSpeaking(true);
    speakFrenchText(text, { rate: 0.9, pitch: 1.15, onEnd: () => setSpeaking(false), onError: () => setSpeaking(false) });
  };

  useEffect(() => {
    setSolved(false);
    setWrong(null);
    const t = setTimeout(() => say(round.question), 350);
    return () => {
      clearTimeout(t);
      stopSpeaking();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activity.id]);

  const answer = (c: Choice) => {
    if (solved) return;
    if (c.correct) {
      setSolved(true);
      setWrong(null);
      soundEffects.playStarChime();
      confetti({ particleCount: 110, spread: 90, origin: { y: 0.6 } });
      say(`${activity.bravo} Bravo ${name} !`);
      onSolved();
    } else {
      setWrong(c.key);
      soundEffects.playPop();
      say('Presque ! Essaie encore.');
    }
  };

  return (
    <div className="min-h-dvh flex flex-col">
      <TopBar
        title={activity.title}
        emoji={activity.emoji}
        onBack={onBack}
        right={<SpeakButton speaking={speaking} label="Répète" onClick={() => (speaking ? (stopSpeaking(), setSpeaking(false)) : say(round.question))} />}
      />
      <main className="flex-1 max-w-2xl w-full mx-auto px-5 py-6 flex flex-col items-center justify-center gap-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold leading-tight">{round.question}</h2>

        {round.display && (
          <div className="bg-white rounded-3xl shadow-bonbon px-6 py-5 text-5xl sm:text-6xl leading-snug tracking-wider max-w-full break-words" aria-label={`${activity.kind === 'compte' ? activity.count : ''} objets`}>
            {round.display}
          </div>
        )}

        <div className={`grid gap-4 w-full ${round.choices.length === 4 ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {round.choices.map((c) => {
            const isRight = solved && c.correct;
            const isWrong = wrong === c.key;
            return (
              <motion.button
                key={c.key}
                onClick={() => answer(c)}
                animate={isWrong ? { x: [0, -10, 10, -6, 6, 0] } : isRight ? { scale: [1, 1.15, 1] } : {}}
                transition={{ duration: 0.45 }}
                className={`press shadow-bonbon aspect-square rounded-[2rem] flex items-center justify-center ${
                  activity.kind === 'compte' ? 'text-5xl font-bold' : 'text-6xl sm:text-7xl'
                } ${isRight ? 'bg-menthe text-white ring-8 ring-menthe-clair' : isWrong ? 'bg-rose-clair' : 'bg-white'} ${solved && !c.correct ? 'opacity-40' : ''}`}
                aria-label={c.label}
              >
                {c.label}
              </motion.button>
            );
          })}
        </div>

        {solved && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <p className="text-2xl font-semibold text-menthe">{activity.bravo}</p>
            <button onClick={onNext} className="press shadow-bonbon px-8 py-4 rounded-2xl bg-menthe text-white text-xl font-bold">
              Activité suivante ➜
            </button>
          </motion.div>
        )}
      </main>
    </div>
  );
}
