import { useState } from 'react';
import { motion } from 'motion/react';
import { Volume2 } from 'lucide-react';
import { SHAKE } from '../lib/motion';
import { shuffled } from '../lib/shuffle';
import { soundEffects, speakFrenchText, isSpeaking, stopSpeaking } from '../utils/soundEffects';
import type { ExplainQuiz } from '../data/explications';

/**
 * La question de compréhension, en très gros boutons.
 *
 * — une seule bonne réponse, jamais de chrono (on réfléchit) ;
 * — une erreur n'est pas une punition : on montre la bonne réponse, on explique pourquoi, on peut réessayer ;
 * — tout est lisible sans savoir lire : la question et l'explication sont dites à voix haute.
 */
export function BigQuiz({
  quiz,
  tone = 'dark',
  onSolved,
  onWrong
}: {
  quiz: ExplainQuiz;
  /** « dark » : posé sur un fond coloré (fin de vidéo). « light » : sur une carte blanche. */
  tone?: 'dark' | 'light';
  onSolved?: () => void;
  onWrong?: () => void;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const [speaking, setSpeaking] = useState(false);
  // Les propositions sont mélangées à l'affichage : sinon la bonne réponse serait toujours « A ».
  const [order] = useState(() => shuffled(quiz.choices.map((_, i) => i)));
  const answerPos = order.indexOf(quiz.answer);
  const solved = picked === answerPos;

  const listen = (text: string) => {
    if (isSpeaking()) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    speakFrenchText(text, { rate: 0.85, pitch: 1.12, onEnd: () => setSpeaking(false), onError: () => setSpeaking(false) });
  };

  const choose = (i: number) => {
    if (solved) return;
    setPicked(i);
    if (i === answerPos) {
      soundEffects.playFanfare();
      onSolved?.();
    } else {
      soundEffects.playOops();
      onWrong?.();
    }
  };

  const choiceClass = (i: number) => {
    const base = 'press shadow-bonbon w-full rounded-2xl px-4 py-4 text-left text-lg sm:text-xl font-semibold flex items-center gap-3 transition-colors';
    if (picked === null) return `${base} ${tone === 'dark' ? 'bg-white text-encre' : 'bg-white text-encre border-4 border-creme'}`;
    if (i === answerPos) return `${base} bg-menthe text-white`;
    if (i === picked) return `${base} ${tone === 'dark' ? 'bg-white/30 text-white' : 'bg-rose-clair text-encre'} opacity-80`;
    return `${base} ${tone === 'dark' ? 'bg-white/20 text-white/70' : 'bg-white text-doux'} opacity-60`;
  };

  return (
    <div className="w-full">
      <div className="flex items-start gap-2 justify-center">
        <p className={`text-xl sm:text-2xl font-bold leading-snug ${tone === 'dark' ? 'text-white' : 'text-encre'}`} aria-live="polite">
          {quiz.q}
        </p>
        <button
          onClick={() => listen(quiz.q)}
          className={`press shrink-0 w-11 h-11 rounded-full flex items-center justify-center ${tone === 'dark' ? 'bg-white/20 text-white' : 'bg-ciel-clair text-ciel'}`}
          aria-label="Écouter la question"
        >
          <Volume2 className="w-6 h-6" />
        </button>
      </div>

      <motion.div key={picked === null ? 'q' : `a${picked}`} animate={picked !== null && !solved ? SHAKE : undefined} className="grid gap-3 mt-4" role="group" aria-label="Choisis ta réponse">
        {order.map((choiceIndex, pos) => {
          const choice = quiz.choices[choiceIndex];
          return (
            <button key={choice} onClick={() => choose(pos)} className={choiceClass(pos)} aria-pressed={picked === pos} disabled={solved}>
              <span className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-bold ${picked === pos || (solved && pos === answerPos) ? 'bg-white/30' : 'bg-creme'}`} aria-hidden>
                {solved && pos === answerPos ? '✓' : picked === pos ? '✗' : ['A', 'B', 'C'][pos]}
              </span>
              <span className="flex-1">{choice}</span>
            </button>
          );
        })}
      </motion.div>

      {picked !== null && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`mt-4 rounded-2xl p-4 text-left ${solved ? 'bg-menthe text-white' : tone === 'dark' ? 'bg-white/20 text-white' : 'bg-soleil-clair text-encre'}`} aria-live="polite">
          <p className="font-bold text-lg">{solved ? '🎉 Bravo, c’est ça !' : `Presque ! La bonne réponse est « ${quiz.choices[quiz.answer]} ».`}</p>
          <p className="mt-1 leading-snug">💡 {quiz.why}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            <button onClick={() => listen(quiz.why)} className="press bg-white/25 rounded-full px-4 py-2 text-sm font-bold flex items-center gap-2">
              <Volume2 className="w-4 h-4" /> Écouter l’explication
            </button>
            {!solved && (
              <button onClick={() => setPicked(null)} className="press bg-white text-encre rounded-full px-4 py-2 text-sm font-bold">
                Réessayer ↻
              </button>
            )}
          </div>
        </motion.div>
      )}

      {speaking && <span className="sr-only">Lecture en cours</span>}
    </div>
  );
}
