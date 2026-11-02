import React from 'react';
import { Star, CheckCircle, Sparkles, RefreshCw, BookOpen, Volume2 } from 'lucide-react';
import { DailyActivityPackage } from '../types/news';
import { soundEffects, speakFrenchText } from '../utils/soundEffects';

interface DiscoveriesViewProps {
  currentStory: DailyActivityPackage;
  completedActivities: number[];
  onSelectActivity: (activityNum: number) => void;
  onGenerateNewAiEdition: () => void;
  isGeneratingAi: boolean;
}

export const DiscoveriesView: React.FC<DiscoveriesViewProps> = ({
  currentStory,
  completedActivities,
  onSelectActivity,
  onGenerateNewAiEdition,
  isGeneratingAi
}) => {
  const activities = [
    { num: 1, title: currentStory.cartoon.title, category: 'Grand Dessin Animé', emoji: '🎬' },
    { num: 2, title: currentStory.soundQuiz.title, category: 'Jeu Sonore', emoji: '👂' },
    { num: 3, title: currentStory.animalDiscovery.title, category: 'Animaux & Sons', emoji: '🐮' },
    { num: 4, title: currentStory.mysteryBubble.title, category: 'La Bulle Mystère', emoji: '🫧' },
    { num: 5, title: currentStory.bedtimeTale.title, category: 'Mini-Conte Étoilé', emoji: '🌙' },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 p-6 text-amber-950 shadow-md">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/90 flex items-center justify-center text-4xl shadow-inner">
              ⭐
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider bg-white/40 px-3 py-0.5 rounded-full">
                Tableau des Découvertes
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-['Fredoka'] mt-1">
                {completedActivities.length} sur 5 Étoiles Débloquées !
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-amber-900 mt-0.5">
                Chaque mission te fait découvrir une merveille du monde d’aujourd’hui !
              </p>
            </div>
          </div>

          {/* AI Generator button */}
          <button
            onClick={() => {
              soundEffects.playPop();
              onGenerateNewAiEdition();
            }}
            disabled={isGeneratingAi}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-amber-50 text-amber-950 font-black text-sm border-2 border-white shadow-md transition-all active:scale-95 disabled:opacity-60"
          >
            <Sparkles className={`w-4 h-4 text-amber-600 ${isGeneratingAi ? 'animate-spin' : ''}`} />
            <span>{isGeneratingAi ? 'Création de l’histoire par IA...' : 'Nouvelle actualité IA ✨'}</span>
          </button>
        </div>
      </div>

      {/* 5 Activities Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {activities.map((act) => {
          const isDone = completedActivities.includes(act.num);

          return (
            <div
              key={act.num}
              onClick={() => {
                soundEffects.playPop();
                onSelectActivity(act.num);
              }}
              className={`rounded-3xl p-5 border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                isDone
                  ? 'bg-amber-50 border-amber-400 shadow-xs hover:bg-amber-100/60'
                  : 'bg-white border-slate-200 hover:border-amber-300 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${
                  isDone ? 'bg-amber-400 text-amber-950' : 'bg-slate-100 text-slate-400'
                }`}>
                  {act.emoji}
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    Activité {act.num} • {act.category}
                  </span>
                  <h3 className="text-sm sm:text-base font-extrabold text-amber-950 mt-1 line-clamp-1">
                    {act.title}
                  </h3>
                </div>
              </div>

              <div className="shrink-0">
                {isDone ? (
                  <span className="w-8 h-8 rounded-full bg-amber-400 text-amber-950 font-black flex items-center justify-center text-sm shadow-xs">
                    ★
                  </span>
                ) : (
                  <span className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 text-xs font-bold">
                    Jouer
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Educational Recap Section */}
      <div className="rounded-3xl bg-white border-2 border-amber-200 p-6 space-y-3 shadow-xs">
        <div className="flex items-center gap-2 text-amber-900">
          <BookOpen className="w-5 h-5 text-amber-600" />
          <h3 className="text-lg font-black font-['Fredoka']">
            Ce que l’on apprend aujourd’hui :
          </h3>
        </div>
        <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-relaxed">
          {currentStory.summary}
        </p>
        <div className="pt-2 flex flex-wrap gap-2">
          {currentStory.cartoon.scenes.flatMap(s => s.keyWords).map((kw, i) => (
            <span key={i} className="bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full border border-amber-200">
              {kw.emoji} {kw.word} ({kw.syllables})
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
