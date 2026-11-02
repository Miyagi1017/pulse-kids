import React from 'react';
import { Volume2, X, Sparkles } from 'lucide-react';
import { VocabularyWord } from '../types/news';
import { speakFrenchText, soundEffects } from '../utils/soundEffects';

interface InteractiveWordModalProps {
  word: VocabularyWord | null;
  onClose: () => void;
}

export const InteractiveWordModal: React.FC<InteractiveWordModalProps> = ({
  word,
  onClose
}) => {
  if (!word) return null;

  const handlePronounce = () => {
    soundEffects.playPop();
    speakFrenchText(word.word, { rate: 0.75, pitch: 1.1 });
  };

  const handlePronounceSyllables = () => {
    soundEffects.playPop();
    speakFrenchText(word.syllables.replace(/ - /g, ' ... '), { rate: 0.65, pitch: 1.1 });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-amber-50 border-3 border-amber-300 p-6 shadow-2xl text-center transform scale-100 transition-all">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-amber-200/80 hover:bg-amber-300 text-amber-900 flex items-center justify-center font-bold transition-transform active:scale-90"
          aria-label="Fermer la boîte mot"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Word Emoji Avatar */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-white border-2 border-amber-300 flex items-center justify-center text-4xl shadow-inner mb-3">
          {word.emoji}
        </div>

        {/* Badge */}
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-200 text-amber-900 border border-amber-300 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-700" />
          Mot Magique
        </span>

        {/* Main Word */}
        <h3 className="text-3xl font-extrabold text-amber-950 capitalize tracking-wide font-['Fredoka']">
          {word.word}
        </h3>

        {/* Syllables Button */}
        <div className="mt-3 flex items-center justify-center gap-2">
          <button
            onClick={handlePronounceSyllables}
            className="px-4 py-2 rounded-2xl bg-white border-2 border-amber-300 text-amber-900 text-sm font-black shadow-xs hover:bg-amber-100 flex items-center gap-1.5 transition-transform active:scale-95"
            title="Écouter les syllabes découpées"
          >
            <span>{word.syllables}</span>
            <Volume2 className="w-4 h-4 text-amber-700" />
          </button>
        </div>

        {/* Definition */}
        <div className="mt-4 p-3.5 rounded-2xl bg-white/90 border border-amber-200 text-sm font-semibold text-amber-950 leading-relaxed shadow-xs text-left">
          <p className="text-xs font-bold text-amber-600 mb-1">C’EST QUOI ?</p>
          <p>{word.definition}</p>
        </div>

        {/* Big Action button to hear full word */}
        <button
          onClick={handlePronounce}
          className="mt-5 w-full py-3 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-extrabold text-base shadow-md border-2 border-amber-500 flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
          <Volume2 className="w-5 h-5" />
          <span>Écouter le mot tout haut !</span>
        </button>
      </div>
    </div>
  );
};
