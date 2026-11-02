import React from 'react';
import { Award, Star, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';

interface BadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
  unlockedBadgeIds: string[];
}

interface BadgeDef {
  id: string;
  title: string;
  desc: string;
  emoji: string;
  requiredStars: number;
}

const BADGES_LIST: BadgeDef[] = [
  {
    id: 'curieux-debutant',
    title: 'P’tit Curieux',
    desc: 'Tu as ouvert le journal magique !',
    emoji: '🐣',
    requiredStars: 0
  },
  {
    id: 'super-spectateur',
    title: 'Super Spectateur',
    desc: 'Tu as regardé le grand dessin animé de Marc !',
    emoji: '🎬',
    requiredStars: 1
  },
  {
    id: 'oreille-magique',
    title: 'Oreille Magique',
    desc: 'Tu as reconnu le son mystère du quiz !',
    emoji: '👂',
    requiredStars: 2
  },
  {
    id: 'ami-des-animaux',
    title: 'Ami des Animaux',
    desc: 'Tu as écouté tous les bruits de la ferme !',
    emoji: '🐮',
    requiredStars: 3
  },
  {
    id: 'chasseur-de-mysteres',
    title: 'Chasseur de Bulles',
    desc: 'Tu as percé le secret de la bulle d’air !',
    emoji: '🫧',
    requiredStars: 4
  },
  {
    id: 'roi-des-etoiles',
    title: 'Roi des Étoiles',
    desc: 'Tu as écouté le conte doux du soir !',
    emoji: '🌙',
    requiredStars: 5
  },
  {
    id: 'champion-du-jour',
    title: 'Grand Champion !',
    desc: 'Toutes les 5 missions terminées avec succès !',
    emoji: '🏆',
    requiredStars: 5
  },
  {
    id: 'explorateur-des-mots',
    title: 'Savant des Mots',
    desc: 'Tu as découvert plus de 3 mots magiques !',
    emoji: '📚',
    requiredStars: 3
  }
];

export const BadgesModal: React.FC<BadgesModalProps> = ({
  isOpen,
  onClose,
  unlockedBadgeIds
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl bg-amber-50 border-3 border-amber-300 p-5 sm:p-7 shadow-2xl text-amber-950 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-200 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400 border border-amber-500 flex items-center justify-center text-amber-950 shadow-inner">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-amber-950 font-['Fredoka']">
                Mes Badges & Trésors
              </h2>
              <p className="text-xs font-semibold text-amber-800">
                {unlockedBadgeIds.length} badge(s) magique(s) débloqué(s) !
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-amber-200/80 hover:bg-amber-300 text-amber-900 flex items-center justify-center font-bold transition-all"
            aria-label="Fermer les badges"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[60vh] overflow-y-auto pr-1">
          {BADGES_LIST.map((badge) => {
            const isUnlocked = unlockedBadgeIds.includes(badge.id);

            return (
              <div
                key={badge.id}
                onClick={() => {
                  soundEffects.playPop();
                }}
                className={`rounded-2xl p-3 flex flex-col items-center text-center transition-all border-2 ${
                  isUnlocked
                    ? 'bg-white border-amber-300 shadow-sm scale-102 hover:scale-105 cursor-pointer'
                    : 'bg-amber-100/40 border-amber-200/50 opacity-60'
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-2 ${
                  isUnlocked ? 'bg-amber-100 border border-amber-300 shadow-inner' : 'bg-slate-200 filter grayscale'
                }`}>
                  {badge.emoji}
                </div>

                <h4 className="text-xs sm:text-sm font-extrabold text-amber-950 font-['Fredoka'] leading-snug">
                  {badge.title}
                </h4>

                <p className="text-[10px] font-semibold text-amber-800/80 mt-1">
                  {badge.desc}
                </p>

                {isUnlocked ? (
                  <span className="mt-2 text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                    Débloqué ★
                  </span>
                ) : (
                  <span className="mt-2 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    À gagner
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full py-3 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-sm shadow-md transition-all"
        >
          Continuer à jouer ! 🚀
        </button>

      </div>
    </div>
  );
};
