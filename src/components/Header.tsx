import React from 'react';
import { Volume2, Lock, Sparkles, Star, Award, Wifi, WifiOff, Clock } from 'lucide-react';
import { formatTimeDisplay } from '../utils/screenTime';

interface HeaderProps {
  currentTab: 'videos' | 'discoveries' | 'badges';
  onSelectTab: (tab: 'videos' | 'discoveries' | 'badges') => void;
  starsCount: number;
  timeRemainingSeconds: number;
  isWarning: boolean;
  onOpenParents: () => void;
  onToggleReadAloud: () => void;
  isSpeaking: boolean;
  isOffline: boolean;
  onToggleOffline: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  starsCount,
  timeRemainingSeconds,
  isWarning,
  onOpenParents,
  onToggleReadAloud,
  isSpeaking,
  isOffline,
  onToggleOffline
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FAF7F0]/95 backdrop-blur-md border-b border-amber-200/70 px-3 py-2.5 sm:px-6 sm:py-3 shadow-xs">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5">
        
        {/* Brand & offline status */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onSelectTab('videos')}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md transform hover:rotate-6 transition-transform">
              <span className="text-2xl" role="img" aria-label="sourire">😊</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-amber-950 font-['Fredoka']">
                  PULSE KIDS
                </span>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-amber-300">
                  5 ANS
                </span>
              </div>
              <p className="text-[11px] sm:text-xs font-semibold text-amber-800/80 -mt-0.5">
                Le journal des p’tits curieux
              </p>
            </div>
          </div>

          {/* Quick status bar on mobile */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Screen time indicator */}
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border transition-colors ${
              isWarning
                ? 'bg-red-100 text-red-700 border-red-300 animate-pulse'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTimeDisplay(timeRemainingSeconds)}</span>
            </div>

            {/* Parents button mobile */}
            <button
              onClick={onOpenParents}
              className="flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full text-xs font-bold border border-indigo-200 shadow-xs"
              aria-label="Accès Espace Parents"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Parents</span>
            </button>
          </div>
        </div>

        {/* Main navigation tabs */}
        <nav className="flex items-center gap-1.5 bg-amber-100/70 p-1 rounded-full border border-amber-200 shadow-inner overflow-x-auto max-w-full">
          <button
            onClick={() => onSelectTab('videos')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all shadow-xs ${
              currentTab === 'videos'
                ? 'bg-amber-400 text-amber-950 shadow-sm scale-102'
                : 'text-amber-900/80 hover:bg-amber-200/50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-800" />
            <span>Vidéos & Reportages</span>
          </button>

          <button
            onClick={() => onSelectTab('discoveries')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
              currentTab === 'discoveries'
                ? 'bg-amber-400 text-amber-950 shadow-sm scale-102'
                : 'text-amber-900/80 hover:bg-amber-200/50'
            }`}
          >
            <Star className="w-4 h-4 text-amber-700 fill-amber-500" />
            <span>Étoiles ({starsCount}/5)</span>
          </button>

          <button
            onClick={() => onSelectTab('badges')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
              currentTab === 'badges'
                ? 'bg-amber-400 text-amber-950 shadow-sm scale-102'
                : 'text-amber-900/80 hover:bg-amber-200/50'
            }`}
          >
            <Award className="w-4 h-4 text-amber-700" />
            <span>Mes Badges</span>
          </button>
        </nav>

        {/* Action buttons (Right) */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Offline mode indicator/toggle */}
          <button
            onClick={onToggleOffline}
            title={isOffline ? "Mode hors-ligne actif (sans internet)" : "Connecté à internet"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
              isOffline
                ? 'bg-orange-100 text-orange-800 border-orange-300'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            {isOffline ? <WifiOff className="w-3.5 h-3.5 text-orange-600" /> : <Wifi className="w-3.5 h-3.5 text-emerald-600" />}
            <span>{isOffline ? 'Mode Hors Ligne' : 'En Ligne'}</span>
          </button>

          {/* Read aloud global button */}
          <button
            onClick={onToggleReadAloud}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold border shadow-xs transition-transform active:scale-95 ${
              isSpeaking
                ? 'bg-teal-500 text-white border-teal-600 animate-pulse'
                : 'bg-teal-400 hover:bg-teal-500 text-teal-950 border-teal-500'
            }`}
            aria-label="Écouter la voix magique"
          >
            <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-bounce' : ''}`} />
            <span>{isSpeaking ? 'En train de parler...' : 'Écoute-moi !'}</span>
          </button>

          {/* Screen time pill */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold border ${
              isWarning
                ? 'bg-red-100 text-red-800 border-red-300 animate-pulse'
                : 'bg-amber-100/90 text-amber-900 border-amber-300'
            }`}
            title="Temps d'écran restant"
          >
            <Clock className="w-4 h-4 text-amber-800" />
            <span>{formatTimeDisplay(timeRemainingSeconds)}</span>
          </div>

          {/* Parental button */}
          <button
            onClick={onOpenParents}
            className="flex items-center gap-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-900 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold border border-indigo-300 shadow-xs transition-transform active:scale-95"
            aria-label="Accès Contrôle Parental"
          >
            <Lock className="w-3.5 h-3.5 text-indigo-700" />
            <span>Parents</span>
          </button>
        </div>

      </div>
    </header>
  );
};
