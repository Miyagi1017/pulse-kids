import React, { useState } from 'react';
import { Volume2, Star, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { AnimalSoundItem } from '../types/news';
import { soundEffects, speakFrenchText } from '../utils/soundEffects';

interface AnimalSoundCardProps {
  discovery: {
    title: string;
    subtitle: string;
    animals: AnimalSoundItem[];
  };
  isCompleted: boolean;
  onComplete: () => void;
}

export const AnimalSoundCard: React.FC<AnimalSoundCardProps> = ({
  discovery,
  isCompleted,
  onComplete
}) => {
  const [activeAnimalId, setActiveAnimalId] = useState<string | null>(null);
  const [playedAnimals, setPlayedAnimals] = useState<Set<string>>(new Set());

  const handleAnimalClick = (animal: AnimalSoundItem) => {
    setActiveAnimalId(animal.id);
    soundEffects.playAnimal(animal.soundType);

    const nextPlayed = new Set(playedAnimals);
    nextPlayed.add(animal.id);
    setPlayedAnimals(nextPlayed);

    speakFrenchText(`${animal.name} fait ${animal.soundText}`, { rate: 0.9, pitch: 1.2 });

    // Auto validate if touched animals or when clicking validate
    setTimeout(() => {
      setActiveAnimalId(null);
    }, 1500);
  };

  const handleValidate = () => {
    soundEffects.playStarChime();
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.75 }
    });
    onComplete();
  };

  return (
    <article className="w-full bg-white rounded-3xl border-2 border-amber-300/80 shadow-md overflow-hidden transition-all">
      {/* Header */}
      <div className="p-4 sm:p-5 pb-3 border-b border-amber-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-amber-50/30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-amber-400 text-amber-950 font-black text-lg flex items-center justify-center shadow-xs shrink-0">
            3
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
              ACTIVITÉ 3 • LES ANIMAUX DE LA FERME
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-amber-950 mt-0.5 leading-snug">
              {discovery.title}
            </h2>
          </div>
        </div>

        {/* Validation Button */}
        <button
          onClick={handleValidate}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black border shadow-xs transition-transform active:scale-95 self-stretch sm:self-auto justify-center ${
            isCompleted
              ? 'bg-amber-400 text-amber-950 border-amber-500'
              : 'bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-amber-950 border-amber-500'
          }`}
          aria-label="Valider l'étoile 3"
        >
          <Star className="w-4 h-4 fill-amber-950 text-amber-950" />
          <span>{isCompleted ? 'Étoile 3 Validée ! ★' : 'Valider l’étoile 3 ★'}</span>
        </button>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        <p className="text-xs sm:text-sm font-semibold text-amber-900/80 text-center">
          {discovery.subtitle}
        </p>

        {/* 4 Animal Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {discovery.animals.map((animal) => {
            const isActive = activeAnimalId === animal.id;
            const hasListened = playedAnimals.has(animal.id);

            return (
              <button
                key={animal.id}
                onClick={() => handleAnimalClick(animal)}
                className={`relative rounded-3xl p-4 flex flex-col items-center text-center transition-all border-2 active:scale-95 ${
                  isActive
                    ? 'bg-amber-200 border-amber-500 scale-105 shadow-md ring-3 ring-amber-300'
                    : hasListened
                    ? 'bg-amber-50/90 border-amber-300 hover:bg-amber-100 shadow-xs'
                    : 'bg-white hover:bg-amber-50/50 border-slate-200 shadow-xs hover:border-amber-300'
                }`}
                aria-label={`Écouter ${animal.name}`}
              >
                {/* Animal Emoji Avatar */}
                <div className={`w-16 h-16 rounded-2xl bg-amber-100/70 border border-amber-200 flex items-center justify-center text-3xl shadow-inner mb-2.5 transition-transform ${
                  isActive ? 'scale-120 animate-wiggle' : ''
                }`}>
                  {animal.emoji}
                </div>

                {/* Animal Name */}
                <span className="text-sm sm:text-base font-extrabold text-amber-950 font-['Fredoka']">
                  {animal.name}
                </span>

                {/* Animal Sound Pill */}
                <span className="mt-1 px-2.5 py-1 rounded-full text-xs font-black bg-white/90 text-amber-900 border border-amber-200 shadow-2xs">
                  {animal.soundText}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </article>
  );
};
