import React, { useState } from 'react';
import { Moon, Star, Lock, Heart, Sparkles } from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';

interface SessionEndOverlayProps {
  starsEarned: number;
  onOpenParents: () => void;
  onUnlockEmergency: () => void;
}

export const SessionEndOverlay: React.FC<SessionEndOverlayProps> = ({
  starsEarned,
  onOpenParents,
  onUnlockEmergency
}) => {
  const [showMathPrompt, setShowMathPrompt] = useState(false);
  const [mathAnswer, setMathAnswer] = useState('');

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(mathAnswer, 10) === 16) {
      soundEffects.playPop();
      onUnlockEmergency();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 text-center animate-in fade-in duration-300">
      <div className="max-w-md w-full bg-slate-900 border-3 border-indigo-400 rounded-3xl p-6 sm:p-8 text-white shadow-2xl space-y-5">
        
        {/* Sleeping Moon Avatar */}
        <div className="w-24 h-24 mx-auto rounded-full bg-indigo-900/60 border-2 border-indigo-400 flex items-center justify-center text-5xl shadow-inner animate-soft-bounce">
          🌙
        </div>

        <div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-800 text-amber-300 border border-indigo-600 mb-2">
            Temps d’écran terminé pour aujourd’hui
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-amber-300 font-['Fredoka']">
            L’écran fait dodo ! 🧸💤
          </h2>
          <p className="text-sm font-medium text-indigo-200 mt-2 leading-relaxed">
            Tu as bien exploré le monde aujourd’hui ! C’est l’heure de reposer tes petits yeux, de faire un gros dessin, de courir dehors ou d’écouter une histoire avec papa ou maman !
          </p>
        </div>

        {/* Stars recap */}
        <div className="bg-indigo-950/80 p-3.5 rounded-2xl border border-indigo-800 flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="text-sm font-bold text-amber-200">
            Tu as récolté {starsEarned} étoiles magiques ! Bravo champion !
          </span>
        </div>

        {/* Parent unlock button */}
        {!showMathPrompt ? (
          <button
            onClick={() => setShowMathPrompt(true)}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-200 underline pt-2 flex items-center justify-center gap-1 mx-auto"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Espace réservé aux parents (Prolonger)</span>
          </button>
        ) : (
          <form onSubmit={handleVerify} className="p-3 bg-indigo-950 rounded-2xl border border-indigo-700 space-y-2">
            <p className="text-xs font-bold text-indigo-300">
              Parents : combien font 8 + 8 ?
            </p>
            <div className="flex gap-2">
              <input
                type="number"
                value={mathAnswer}
                onChange={(e) => setMathAnswer(e.target.value)}
                placeholder="16"
                className="w-full px-3 py-1.5 rounded-xl bg-slate-800 text-white border border-indigo-600 text-center font-bold text-sm"
              />
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shrink-0"
              >
                +5 min
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
