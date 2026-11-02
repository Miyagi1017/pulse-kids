import React from 'react';
import { Volume2, Sparkles, CheckCircle2 } from 'lucide-react';
import { speakFrenchText, stopSpeaking, soundEffects } from '../utils/soundEffects';

interface HeroBannerProps {
  completedCount: number;
  onTellStory: () => void;
  isSpeaking: boolean;
  onSelectActivity: (activityNum: number) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  completedCount,
  onTellStory,
  isSpeaking,
  onSelectActivity
}) => {
  return (
    <section className="w-full space-y-4">
      {/* Top Banner with Fox */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-100 via-orange-100 to-amber-200 border-2 border-amber-300/80 p-4 sm:p-6 shadow-sm">
        
        {/* Soft background decor circle */}
        <div className="absolute -right-6 -bottom-8 w-36 h-36 rounded-full bg-amber-300/30 blur-md pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 sm:gap-5">
            {/* Fox Avatar */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/90 border-2 border-amber-300 flex items-center justify-center text-3xl sm:text-4xl shadow-inner shrink-0 transform hover:scale-105 transition-transform">
              🦊
            </div>
            
            <div className="text-left">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-amber-200/90 text-amber-900 border border-amber-300/70 mb-1">
                Mon aventure du jour
              </span>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-amber-950 leading-tight">
                Bonjour petit explorateur !
              </h1>
              <p className="text-xs sm:text-sm md:text-base font-semibold text-amber-900/80 mt-1 max-w-xl">
                5 missions magiques t’attendent aujourd’hui ! Touche avec ton doigt pour jouer et apprendre plein de secrets !
              </p>
            </div>
          </div>

          {/* Big Green "Raconte-moi !" Button */}
          <button
            onClick={() => {
              soundEffects.playPop();
              if (isSpeaking) {
                stopSpeaking();
              } else {
                onTellStory();
              }
            }}
            className={`w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl font-extrabold text-base sm:text-lg border-2 shadow-md transition-all active:scale-95 shrink-0 ${
              isSpeaking
                ? 'bg-emerald-600 text-white border-emerald-700 animate-pulse'
                : 'bg-emerald-400 hover:bg-emerald-500 text-emerald-950 border-emerald-500 hover:shadow-lg'
            }`}
            aria-label="Raconte-moi l'histoire du jour"
          >
            <Volume2 className={`w-6 h-6 ${isSpeaking ? 'animate-spin' : ''}`} />
            <span>{isSpeaking ? 'Chut, j’écoute !' : 'Raconte-moi !'}</span>
          </button>
        </div>
      </div>

      {/* 5 Magical Discoveries Stepper */}
      <div className="bg-white/80 border border-amber-200 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-amber-950 font-bold shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-amber-950">
              Tes 5 Découvertes Magiques
            </h2>
            <p className="text-xs font-semibold text-amber-800/80">
              Fais chaque activité pour gagner tes 5 étoiles !
            </p>
          </div>
        </div>

        {/* 1 -> 2 -> 3 -> 4 -> 5 step indicators */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {[1, 2, 3, 4, 5].map((num, idx) => {
            const isDone = completedCount >= num;
            return (
              <React.Fragment key={num}>
                <button
                  onClick={() => onSelectActivity(num)}
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-extrabold text-xs sm:text-sm transition-all border shadow-xs ${
                    isDone
                      ? 'bg-amber-400 text-amber-950 border-amber-500 scale-105'
                      : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                  }`}
                  aria-label={`Aller à l'activité ${num}`}
                >
                  {isDone ? '★' : num}
                </button>
                {idx < 4 && (
                  <span className="text-amber-300 font-black text-xs">→</span>
                )}
              </React.Fragment>
            );
          })}
          <span className="ml-1 text-sm">🎯</span>
        </div>
      </div>
    </section>
  );
};
