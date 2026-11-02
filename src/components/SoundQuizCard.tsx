import React, { useState } from 'react';
import { Volume2, CheckCircle2, XCircle, Sparkles, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SoundQuizOption } from '../types/news';
import { soundEffects, speakFrenchText } from '../utils/soundEffects';

interface SoundQuizCardProps {
  quiz: {
    title: string;
    question: string;
    soundToPlay: 'water-tap' | 'tractor' | 'wrench';
    options: SoundQuizOption[];
  };
  isCompleted: boolean;
  onComplete: () => void;
}

export const SoundQuizCard: React.FC<SoundQuizCardProps> = ({
  quiz,
  isCompleted,
  onComplete
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(isCompleted);
  const [feedbackText, setFeedbackText] = useState<string | null>(null);

  const handlePlayMysterySound = () => {
    soundEffects.playSteamClick();
  };

  const handleSelectOption = (opt: SoundQuizOption) => {
    soundEffects.playPop();
    setSelectedOptionId(opt.id);

    // Play individual option sound
    if (opt.soundType === 'wrench') soundEffects.playWrench();
    else if (opt.soundType === 'tractor') soundEffects.playTractor();
    else if (opt.soundType === 'water-tap') soundEffects.playSteamClick();

    if (opt.isCorrect) {
      setIsSuccess(true);
      setFeedbackText("Bravo champion ! C'est le robinet d'eau qui fait pschhh !");
      soundEffects.playStarChime();
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 }
      });
      speakFrenchText("Bravo champion ! C'est exactement le robinet d'eau !", { rate: 0.9, pitch: 1.2 });
      onComplete();
    } else {
      setIsSuccess(false);
      setFeedbackText(opt.hint);
      speakFrenchText(opt.hint + " Réessaie pour voir !", { rate: 0.85 });
    }
  };

  return (
    <article className="w-full bg-white rounded-3xl border-2 border-emerald-300/80 shadow-md overflow-hidden transition-all">
      {/* Header */}
      <div className="p-4 sm:p-5 pb-3 border-b border-emerald-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-emerald-50/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-700 text-white font-black text-lg flex items-center justify-center shadow-xs shrink-0">
            2
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
              ACTIVITÉ 2 • JEU SONORE
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-emerald-950 mt-0.5 leading-snug">
              {quiz.title}
            </h2>
          </div>
        </div>

        {/* Listen Sound Button */}
        <button
          onClick={handlePlayMysterySound}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-extrabold bg-emerald-400 hover:bg-emerald-500 text-emerald-950 border-2 border-emerald-500 shadow-xs transition-transform active:scale-95 self-stretch sm:self-auto justify-center"
          aria-label="Écouter le bruit mystère"
        >
          <Volume2 className="w-4 h-4 animate-bounce" />
          <span>Écoute le bruit 🎵</span>
        </button>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        <p className="text-xs sm:text-sm font-semibold text-emerald-900/80 text-center">
          {quiz.question}
        </p>

        {/* 3 Option Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {quiz.options.map((option) => {
            const isSelected = selectedOptionId === option.id;
            const isCorrectAnswer = option.isCorrect && isSuccess;

            return (
              <div
                key={option.id}
                onClick={() => handleSelectOption(option)}
                className={`relative rounded-3xl p-4 sm:p-5 flex flex-col items-center justify-between text-center transition-all cursor-pointer border-2 ${
                  isCorrectAnswer
                    ? 'bg-emerald-100/90 border-emerald-500 shadow-md ring-3 ring-emerald-300'
                    : isSelected && !option.isCorrect
                    ? 'bg-amber-50 border-amber-300 shadow-xs'
                    : 'bg-white hover:bg-emerald-50/50 border-slate-200 shadow-xs hover:border-emerald-300'
                }`}
              >
                {/* Badge if correct */}
                {isCorrectAnswer && (
                  <span className="absolute -top-3 bg-emerald-500 text-white text-[11px] font-black px-3 py-0.5 rounded-full shadow-xs flex items-center gap-1 animate-bounce">
                    ✨ Bonne réponse !
                  </span>
                )}

                {/* Option Icon */}
                <div className="w-16 h-16 rounded-2xl bg-amber-100/70 border border-amber-200 flex items-center justify-center text-3xl shadow-inner mb-3">
                  {option.emoji}
                </div>

                {/* Option Name */}
                <h3 className="text-base sm:text-lg font-black text-slate-900 mb-1 font-['Fredoka']">
                  {option.label}
                </h3>

                {/* Hint Text */}
                <p className="text-xs font-medium text-slate-600 mb-4 min-h-[32px] flex items-center justify-center">
                  {option.hint}
                </p>

                {/* Option Button */}
                <button
                  type="button"
                  className={`w-full py-2.5 px-3 rounded-2xl text-xs sm:text-sm font-extrabold border transition-all pointer-events-none ${
                    isCorrectAnswer
                      ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                      : isSelected && !option.isCorrect
                      ? 'bg-amber-200 text-amber-900 border-amber-300'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                >
                  {isCorrectAnswer ? 'C’est lui ! 🎉' : `C’est ${option.label.toLowerCase()} ?`}
                </button>
              </div>
            );
          })}
        </div>

        {/* Feedback message banner if answered */}
        {feedbackText && (
          <div className={`p-3 rounded-2xl text-xs sm:text-sm font-bold text-center border animate-in fade-in duration-200 ${
            isSuccess ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-amber-100 text-amber-900 border-amber-300'
          }`}>
            {isSuccess ? '🌟 ' : '💡 '} {feedbackText}
          </div>
        )}

      </div>
    </article>
  );
};
