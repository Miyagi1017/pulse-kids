import React, { useState } from 'react';
import { Sparkles, Moon, Star, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEffects, speakFrenchText, stopSpeaking } from '../utils/soundEffects';

interface BedtimeStoryCardProps {
  tale: {
    title: string;
    summary: string;
    nightTheme: string;
    taleText: string;
  };
  isCompleted: boolean;
  onComplete: () => void;
}

export const BedtimeStoryCard: React.FC<BedtimeStoryCardProps> = ({
  tale,
  isCompleted,
  onComplete
}) => {
  const [isPlayingTale, setIsPlayingTale] = useState<boolean>(false);

  const handlePlayTale = () => {
    soundEffects.playPop();
    soundEffects.playGentleLullaby();
    setIsPlayingTale(true);

    speakFrenchText(tale.taleText, {
      rate: 0.78,
      pitch: 1.05,
      onEnd: () => {
        setIsPlayingTale(false);
        soundEffects.playStarChime();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.85 }
        });
        onComplete();
      }
    });
  };

  const handleStopTale = () => {
    stopSpeaking();
    setIsPlayingTale(false);
  };

  return (
    <article className="w-full bg-white rounded-3xl border-2 border-blue-300/80 shadow-md overflow-hidden transition-all">
      {/* Header */}
      <div className="p-4 sm:p-5 pb-3 border-b border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-blue-50/30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-600 text-white font-black text-lg flex items-center justify-center shadow-xs shrink-0">
            5
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
              ACTIVITÉ 5 • MINI-CONTE ANIMÉ
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-blue-950 mt-0.5 leading-snug">
              {tale.title}
            </h2>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={isPlayingTale ? handleStopTale : handlePlayTale}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black border shadow-xs transition-transform active:scale-95 self-stretch sm:self-auto justify-center ${
            isPlayingTale
              ? 'bg-blue-700 text-white border-blue-800 animate-pulse'
              : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-700'
          }`}
          aria-label="Regarder le conte du soir"
        >
          {isPlayingTale ? <Volume2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>{isPlayingTale ? 'Chut, le conte parle...' : 'Regarder le conte ! ⚡'}</span>
        </button>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-relaxed">
          {tale.summary}
        </p>

        {/* Night Scene Canvas Box */}
        <div className="relative rounded-2xl bg-gradient-to-b from-indigo-950 via-slate-900 to-indigo-900 border-2 border-indigo-700 p-5 min-h-[160px] overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Twinkling stars */}
          <div className="absolute inset-0 pointer-events-none opacity-80">
            <span className="absolute top-3 left-8 text-amber-200 text-xs animate-pulse">★</span>
            <span className="absolute top-8 left-1/3 text-amber-300 text-sm animate-ping">✦</span>
            <span className="absolute top-4 right-1/4 text-white text-xs animate-pulse">★</span>
            <span className="absolute top-12 right-10 text-amber-200 text-sm animate-pulse">★</span>
            <span className="absolute top-2 right-2 text-3xl">🌙</span>
          </div>

          {/* Left: Spinning Windmills */}
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-4xl shadow-inner">
              <span className={`inline-block transition-transform ${isPlayingTale ? 'animate-spin' : ''}`}>
                🎐
              </span>
            </div>
            <div className="text-left text-white">
              <span className="text-[11px] font-black uppercase text-amber-300 tracking-wider">
                Énergie Propre
              </span>
              <h3 className="text-base font-extrabold text-white">
                Les grands moulins bienveillants
              </h3>
              <p className="text-xs text-indigo-200">
                Ils fabriquent la lumière douce pour ta chambre !
              </p>
            </div>
          </div>

          {/* Right: Glowing Nightlight */}
          <div className="relative z-10 flex items-center gap-3 bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/20">
            <div className="text-3xl animate-bounce">💡</div>
            <div className="text-left">
              <p className="text-xs font-bold text-amber-300">Veilleuse de nuit</p>
              <p className="text-[11px] text-white">Dodo serein garanti</p>
            </div>
          </div>

        </div>

        {/* Validation indicator */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-bold text-slate-500">
            Dernière mission de la journée
          </span>
          <button
            onClick={() => {
              soundEffects.playStarChime();
              confetti({ particleCount: 70, spread: 60 });
              onComplete();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black border transition-all ${
              isCompleted
                ? 'bg-amber-400 text-amber-950 border-amber-500'
                : 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
            }`}
          >
            {isCompleted ? 'Étoile 5 Validée ! ★' : 'Valider l’étoile 5 ★'}
          </button>
        </div>

      </div>
    </article>
  );
};
