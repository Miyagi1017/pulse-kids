import React, { useState } from 'react';
import { Volume2, Sparkles, Star, ChevronDown, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEffects, speakFrenchText } from '../utils/soundEffects';

interface MysteryBubbleCardProps {
  mystery: {
    title: string;
    question: string;
    shortExplanation: string;
    detailedSecret: string;
    bubbleCount: number;
  };
  isCompleted: boolean;
  onComplete: () => void;
}

export const MysteryBubbleCard: React.FC<MysteryBubbleCardProps> = ({
  mystery,
  isCompleted,
  onComplete
}) => {
  const [poppedBubbles, setPoppedBubbles] = useState<number[]>([]);
  const [isRevealed, setIsRevealed] = useState<boolean>(isCompleted);

  const handlePopBubble = (index: number) => {
    if (poppedBubbles.includes(index)) return;
    soundEffects.playPop();

    const nextPopped = [...poppedBubbles, index];
    setPoppedBubbles(nextPopped);

    if (nextPopped.length >= mystery.bubbleCount) {
      setIsRevealed(true);
      soundEffects.playStarChime();
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.8 }
      });
      speakFrenchText(mystery.shortExplanation, { rate: 0.85, pitch: 1.15 });
      onComplete();
    }
  };

  const handleRevealDirectly = () => {
    soundEffects.playPop();
    setIsRevealed(true);
    speakFrenchText(mystery.shortExplanation, { rate: 0.85, pitch: 1.15 });
    onComplete();
  };

  return (
    <article className="w-full bg-white rounded-3xl border-2 border-amber-300/80 shadow-md overflow-hidden transition-all">
      {/* Header */}
      <div className="p-4 sm:p-5 pb-3 border-b border-amber-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-amber-50/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-amber-500 text-amber-950 font-black text-lg flex items-center justify-center shadow-xs shrink-0">
            4
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
              ACTIVITÉ 4 • LA BULLE MYSTÈRE
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-amber-950 mt-0.5 leading-snug">
              {mystery.title}
            </h2>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleRevealDirectly}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black border shadow-xs transition-transform active:scale-95 self-stretch sm:self-auto justify-center ${
            isCompleted
              ? 'bg-amber-400 text-amber-950 border-amber-500'
              : 'bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 text-amber-950 border-amber-500'
          }`}
          aria-label="Découvrir le secret de la bulle"
        >
          <Sparkles className="w-4 h-4 text-amber-950" />
          <span>{isCompleted ? 'Secret Découvert ! ★' : 'Découvre le secret ! ✨'}</span>
        </button>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {/* Short explanation matching screenshot */}
        <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-relaxed">
          {mystery.shortExplanation}
        </p>

        {/* Interactive Bubble Popping Mini-Zone */}
        <div className="relative rounded-2xl bg-gradient-to-b from-sky-50 to-blue-100/50 border-2 border-sky-200 p-4 min-h-[140px] flex flex-col items-center justify-center">
          <div className="text-xs font-bold text-sky-800 mb-2">
            Touche les {mystery.bubbleCount} bulles farceuses pour les éclater ! ({poppedBubbles.length}/{mystery.bubbleCount})
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 py-2">
            {Array.from({ length: mystery.bubbleCount }).map((_, idx) => {
              const isPopped = poppedBubbles.includes(idx);
              return (
                <button
                  key={idx}
                  onClick={() => handlePopBubble(idx)}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-2xl sm:text-3xl transition-all transform active:scale-90 ${
                    isPopped
                      ? 'bg-sky-200/40 opacity-40 scale-75 cursor-default'
                      : 'bg-white/90 border-2 border-sky-300 shadow-md hover:scale-115 animate-soft-bounce cursor-pointer'
                  }`}
                  aria-label={`Éclater la bulle ${idx + 1}`}
                >
                  {isPopped ? '💥' : '🫧'}
                </button>
              );
            })}
          </div>

          {/* Reveal info box */}
          {isRevealed && (
            <div className="mt-3 w-full bg-white rounded-2xl p-4 border border-amber-300 text-xs sm:text-sm font-medium text-amber-950 shadow-xs animate-in fade-in duration-300">
              <div className="flex items-center gap-1.5 text-amber-700 font-black mb-1">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Le saviez-tu, petit curieux ?</span>
              </div>
              <p className="leading-relaxed">{mystery.detailedSecret}</p>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
