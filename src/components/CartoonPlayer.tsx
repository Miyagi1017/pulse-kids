import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, Star, CheckCircle, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartoonScene, VocabularyWord } from '../types/news';
import { soundEffects, speakFrenchText, stopSpeaking, isSpeaking } from '../utils/soundEffects';

interface CartoonPlayerProps {
  cartoon: {
    title: string;
    durationLabel: string;
    badgeLabel: string;
    heroName: string;
    heroDescription: string;
    scenes: CartoonScene[];
  };
  isCompleted: boolean;
  onComplete: () => void;
  onSelectWord: (word: VocabularyWord) => void;
}

export const CartoonPlayer: React.FC<CartoonPlayerProps> = ({
  cartoon,
  isCompleted,
  onComplete,
  onSelectWord
}) => {
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechActive, setSpeechActive] = useState(false);
  const [highlightedWordIndex, setHighlightedWordIndex] = useState<number | null>(null);
  const [activeReaction, setActiveReaction] = useState<string | null>(null);
  const [speechRate, setSpeechRate] = useState<number>(0.85); // 0.7 for turtle, 0.85 normal

  const currentScene = cartoon.scenes[currentSceneIdx] || cartoon.scenes[0];
  const words = currentScene.narration.split(' ');

  // Auto progression when audio ends
  const handlePlayScene = (sceneIndex: number = currentSceneIdx) => {
    soundEffects.playPop();
    const scene = cartoon.scenes[sceneIndex];
    if (!scene) return;

    setIsPlaying(true);
    setSpeechActive(true);
    setHighlightedWordIndex(null);

    speakFrenchText(scene.narration, {
      rate: speechRate,
      pitch: 1.15,
      onWord: (word) => {
        // Find matching word index in text
        const cleanWord = word.toLowerCase().replace(/[^a-zà-ÿ]/g, '');
        const foundIdx = words.findIndex((w) => w.toLowerCase().replace(/[^a-zà-ÿ]/g, '') === cleanWord);
        if (foundIdx !== -1) {
          setHighlightedWordIndex(foundIdx);
        }
      },
      onEnd: () => {
        setSpeechActive(false);
        setHighlightedWordIndex(null);
        // If not last scene, advance after short delay
        if (sceneIndex < cartoon.scenes.length - 1) {
          setTimeout(() => {
            setCurrentSceneIdx(sceneIndex + 1);
            handlePlayScene(sceneIndex + 1);
          }, 1200);
        } else {
          setIsPlaying(false);
        }
      },
      onError: () => {
        setSpeechActive(false);
        setIsPlaying(false);
      }
    });
  };

  const handlePause = () => {
    soundEffects.playPop();
    stopSpeaking();
    setIsPlaying(false);
    setSpeechActive(false);
  };

  const handleRestart = () => {
    stopSpeaking();
    setCurrentSceneIdx(0);
    handlePlayScene(0);
  };

  const handleCompleteActivity = () => {
    soundEffects.playStarChime();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    onComplete();
  };

  const handleHotspotClick = (hotspot: (typeof currentScene.interactiveHotspots)[0]) => {
    soundEffects.playPop();
    if (hotspot.soundType === 'wrench') soundEffects.playWrench();
    else if (hotspot.soundType === 'water-tap') soundEffects.playSteamClick();
    else soundEffects.playPop();

    setActiveReaction(hotspot.reactionText);
    speakFrenchText(hotspot.reactionText, { rate: 0.9, pitch: 1.2 });
    setTimeout(() => {
      setActiveReaction(null);
    }, 4000);
  };

  // Find vocabulary item for a tapped word if present
  const handleWordClick = (rawWord: string) => {
    const clean = rawWord.toLowerCase().replace(/[^a-zà-ÿ]/g, '');
    const vocab = currentScene.keyWords.find(k => k.word.toLowerCase() === clean);
    if (vocab) {
      onSelectWord(vocab);
    } else {
      // Just pronounce the word
      soundEffects.playPop();
      speakFrenchText(rawWord, { rate: 0.75, pitch: 1.1 });
    }
  };

  return (
    <article className="w-full bg-white rounded-3xl border-2 border-amber-300/80 shadow-md overflow-hidden transition-all">
      {/* Activity Header */}
      <div className="p-4 sm:p-5 pb-3 border-b border-amber-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-amber-400 text-amber-950 font-black text-lg flex items-center justify-center shadow-xs shrink-0">
            1
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
              ACTIVITÉ 1 • GRAND DESSIN ANIMÉ
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-amber-950 mt-0.5 leading-snug">
              {cartoon.title}
            </h2>
          </div>
        </div>

        {/* Listen Button */}
        <button
          onClick={() => {
            if (speechActive) handlePause();
            else handlePlayScene(currentSceneIdx);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-extrabold border shadow-xs transition-transform active:scale-95 self-stretch sm:self-auto justify-center ${
            speechActive
              ? 'bg-indigo-600 text-white border-indigo-700 animate-pulse'
              : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-900 border-indigo-300'
          }`}
          aria-label="Écouter l'histoire de Marc"
        >
          <Volume2 className="w-4 h-4" />
          <span>{speechActive ? 'Pause voix' : 'Écoute l’histoire'}</span>
        </button>
      </div>

      {/* Main Cartoon Stage */}
      <div className="p-3 sm:p-5 space-y-4">
        
        {/* Animated Visual Canvas Box */}
        <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[460px] rounded-2xl overflow-hidden border-2 border-amber-200 bg-gradient-to-b from-sky-100 via-amber-50 to-amber-100 shadow-inner group">
          
          {/* Activity Tag badges */}
          <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
            <span className="bg-amber-400/95 text-amber-950 font-black text-xs px-2.5 py-1 rounded-full shadow-xs border border-amber-500">
              {cartoon.badgeLabel}
            </span>
            <span className="bg-emerald-500/90 text-white font-bold text-xs px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
              <span>Scène {currentSceneIdx + 1}/{cartoon.scenes.length}</span>
            </span>
          </div>

          <div className="absolute top-3 right-3 z-20">
            <span className="bg-white/90 backdrop-blur-xs text-amber-950 font-bold text-xs px-3 py-1 rounded-full shadow-xs border border-amber-200 flex items-center gap-1.5">
              <span>⏱️ {cartoon.durationLabel}</span>
            </span>
          </div>

          {/* SCENE ILLUSTRATION / ANIMATION */}
          <div className="absolute inset-0 flex items-center justify-center select-none overflow-hidden">
            {/* Rich cartoon scene rendering */}
            <div className="relative w-full h-full">
              {/* Cozy Wooden Workshop Background */}
              <div className="absolute inset-0 bg-[#f7eed9] opacity-90">
                {/* Wood planks texture */}
                <div className="w-full h-full opacity-15 bg-[radial-gradient(#8b5a2b_1px,transparent_1px)] [background-size:16px_16px]" />
              </div>

              {/* Window to snowy outside */}
              <div className="absolute top-8 left-8 sm:top-12 sm:left-12 w-28 h-36 sm:w-44 sm:h-52 bg-sky-200 rounded-t-3xl border-4 border-[#8B5A2B] shadow-inner overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-sky-300 to-sky-100" />
                {/* Snowy mountain & trees */}
                <div className="absolute -bottom-2 left-0 right-0 h-16 bg-white rounded-t-full border-t border-sky-100" />
                <div className="absolute bottom-6 left-3 text-emerald-800 text-lg">🌲</div>
                <div className="absolute bottom-8 left-10 text-emerald-800 text-base">🌲</div>
                <div className="absolute bottom-5 right-4 text-emerald-800 text-xl">🌲</div>
                {/* Falling animated snowflakes */}
                <div className="absolute inset-0 pointer-events-none">
                  <span className="absolute top-2 left-4 text-white text-xs animate-pulse">❄️</span>
                  <span className="absolute top-8 right-6 text-white text-sm animate-bounce">❄️</span>
                  <span className="absolute top-16 left-12 text-white text-xs animate-pulse">❄️</span>
                  <span className="absolute top-24 right-10 text-white text-sm animate-bounce">❄️</span>
                </div>
              </div>

              {/* Big colorful boiler/furnace (Chaudière magique) */}
              <div className="absolute bottom-4 right-1/4 sm:right-1/3 w-32 sm:w-44 h-48 sm:h-64 bg-gradient-to-t from-orange-400 via-amber-400 to-yellow-300 rounded-t-full border-4 border-amber-700 shadow-xl flex flex-col items-center justify-end p-2 pb-6">
                <div className="w-14 sm:w-20 h-14 sm:h-20 rounded-full bg-amber-950/20 border-2 border-white/50 flex items-center justify-center text-2xl sm:text-3xl mb-2 animate-pulse">
                  🔥
                </div>
                <div className="text-[10px] sm:text-xs font-black uppercase text-amber-950 bg-amber-200/90 px-2 py-0.5 rounded-full border border-amber-600">
                  CHAUDIÈRE
                </div>
                {/* Steam puffs */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xl sm:text-2xl animate-bounce">
                  ♨️
                </div>
              </div>

              {/* Radiator on the right */}
              <div className="absolute bottom-8 right-4 sm:right-10 w-24 sm:w-36 h-32 sm:h-44 bg-white rounded-2xl border-4 border-slate-300 shadow-lg flex flex-col justify-between p-2">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[9px] sm:text-[10px] font-black text-slate-500">CHALEUR DOUCE</span>
                  <span className="text-amber-500 animate-spin text-xs">☀️</span>
                </div>
                {/* Radiator vertical ribs */}
                <div className="flex justify-around h-20 sm:h-28 items-center">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="w-2 sm:w-3 h-full bg-slate-100 rounded-full border border-slate-300 shadow-inner" />
                  ))}
                </div>
                {/* Warm heat waves animation */}
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex gap-1">
                  <span className="text-amber-500 text-sm animate-wiggle">〰️</span>
                  <span className="text-orange-500 text-sm animate-wiggle" style={{ animationDelay: '0.2s' }}>〰️</span>
                  <span className="text-amber-500 text-sm animate-wiggle" style={{ animationDelay: '0.4s' }}>〰️</span>
                </div>
              </div>

              {/* Character: Marc le Bâtisseur */}
              <div className="absolute bottom-2 left-1/3 sm:left-1/4 -translate-x-1/2 flex flex-col items-center">
                {/* Animated Speech Bubble */}
                <div className="mb-2 bg-white px-3 py-1.5 rounded-2xl border-2 border-amber-300 shadow-md text-xs sm:text-sm font-extrabold text-amber-950 animate-soft-bounce max-w-[200px] text-center">
                  {currentScene.character.speech}
                </div>

                {/* Marc's Figure */}
                <div className="relative text-6xl sm:text-8xl transform hover:scale-105 transition-transform cursor-pointer" onClick={() => {
                  soundEffects.playPop();
                  speakFrenchText(currentScene.character.speech, { rate: 0.9, pitch: 1.2 });
                }}>
                  👷‍♂️
                  {/* Wrench held by Marc */}
                  <span className="absolute -right-2 top-8 text-2xl sm:text-4xl animate-wiggle">
                    🔧
                  </span>
                </div>
                <span className="mt-1 bg-amber-400 text-amber-950 text-xs font-black px-2.5 py-0.5 rounded-full border border-amber-500">
                  Marc
                </span>
              </div>

              {/* Cat / mascot in workshop */}
              <div className="absolute bottom-4 left-6 sm:left-14 text-3xl sm:text-4xl cursor-pointer hover:scale-110 transition-transform" onClick={() => {
                soundEffects.playPop();
                speakFrenchText("Ronron ! Le chat adore dormir près du radiateur !", { rate: 0.85 });
              }}>
                🐱
              </div>

              {/* Tool bench decor */}
              <div className="absolute top-24 left-1/2 -translate-x-1/2 flex gap-3 text-2xl opacity-80 pointer-events-none">
                <span>🧰</span>
                <span>🔨</span>
                <span>🪚</span>
              </div>
            </div>

            {/* Interactive Hotspots Overlays */}
            {currentScene.interactiveHotspots.map((hotspot) => (
              <button
                key={hotspot.id}
                onClick={() => handleHotspotClick(hotspot)}
                style={{ top: `${hotspot.yPercent}%`, left: `${hotspot.xPercent}%` }}
                className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2 group/hotspot focus:outline-hidden"
                aria-label={hotspot.label}
              >
                <div className="relative">
                  <span className="absolute -inset-2 rounded-full bg-amber-400/40 animate-ping" />
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/95 border-2 border-amber-400 shadow-lg flex items-center justify-center text-lg sm:text-xl transform group-hover/hotspot:scale-115 transition-transform">
                    {hotspot.emoji}
                  </div>
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-amber-950/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md pointer-events-none opacity-0 group-hover/hotspot:opacity-100 transition-opacity">
                    {hotspot.label}
                  </span>
                </div>
              </button>
            ))}

            {/* Active Reaction Bubble Overlay */}
            {activeReaction && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 max-w-sm w-11/12 bg-white/95 backdrop-blur-xs border-2 border-emerald-400 rounded-2xl p-3 shadow-xl text-center animate-in fade-in zoom-in duration-200">
                <p className="text-xs sm:text-sm font-extrabold text-emerald-950">
                  ✨ {activeReaction}
                </p>
              </div>
            )}

            {/* Center Big Play Button if paused */}
            {!isPlaying && !speechActive && (
              <div className="absolute inset-0 z-20 bg-amber-950/20 backdrop-blur-[1px] flex flex-col items-center justify-center gap-3">
                <div className="relative">
                  <span className="absolute -inset-2 rounded-full bg-amber-400/40 animate-ping pointer-events-none" />
                  <button
                    onClick={() => handlePlayScene(currentSceneIdx)}
                    className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-amber-950 border-4 border-white shadow-2xl flex items-center justify-center transform hover:scale-110 active:scale-95 transition-transform"
                    aria-label="Touche pour regarder"
                  >
                    <Play className="w-10 h-10 sm:w-12 sm:h-12 fill-amber-950 ml-1.5" />
                  </button>
                </div>
                <div className="bg-white/95 border-2 border-amber-300 px-5 py-2 rounded-full shadow-lg text-sm sm:text-base font-extrabold text-amber-950">
                  Touche pour regarder ! 👆
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scene Navigation Pills */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto py-1">
          <div className="flex items-center gap-1.5">
            {cartoon.scenes.map((sc, i) => (
              <button
                key={sc.id}
                onClick={() => {
                  stopSpeaking();
                  setCurrentSceneIdx(i);
                  handlePlayScene(i);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  currentSceneIdx === i
                    ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-xs scale-105'
                    : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                }`}
              >
                Scène {i + 1}
              </button>
            ))}
          </div>

          {/* Speed Toggle (Tortue / Lapin) */}
          <button
            onClick={() => {
              soundEffects.playPop();
              const nextRate = speechRate === 0.85 ? 0.7 : 0.85;
              setSpeechRate(nextRate);
            }}
            className="flex items-center gap-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-xl text-xs font-bold shrink-0"
            title="Changer la vitesse de parole"
          >
            <span>{speechRate < 0.8 ? '🐢 Mode Tortue' : '🐰 Mode Normal'}</span>
          </button>
        </div>

        {/* INTERACTIVE SUBTITLES & KARAOKE BOX */}
        <div className="p-4 rounded-2xl bg-amber-50/90 border-2 border-amber-200 shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase text-amber-800 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Sous-titres Magiques (Touche un mot pour le découvrir !)
            </span>
            <span className="text-xs text-amber-600 font-semibold">
              {currentScene.title}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 items-center justify-start text-base sm:text-lg md:text-xl font-bold leading-relaxed text-amber-950">
            {words.map((word, index) => {
              const cleanWord = word.toLowerCase().replace(/[^a-zà-ÿ]/g, '');
              const isVocab = currentScene.keyWords.some(k => k.word.toLowerCase() === cleanWord);
              const isSpokenNow = highlightedWordIndex === index;

              return (
                <button
                  key={`${word}-${index}`}
                  onClick={() => handleWordClick(word)}
                  className={`px-2 py-0.5 rounded-xl transition-all cursor-pointer ${
                    isSpokenNow
                      ? 'bg-amber-400 text-amber-950 scale-110 shadow-md ring-2 ring-amber-500'
                      : isVocab
                      ? 'bg-amber-200 hover:bg-amber-300 text-amber-950 border border-amber-400 underline decoration-wavy decoration-amber-500'
                      : 'hover:bg-amber-200/60 text-slate-800'
                  }`}
                  title={isVocab ? "Mot magique ! Clique pour voir l'explication" : "Clique pour écouter"}
                >
                  {word}
                </button>
              );
            })}
          </div>
        </div>

        {/* Player Bottom Bar Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Restart */}
            <button
              onClick={handleRestart}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm border border-slate-300 transition-transform active:scale-95"
              aria-label="Recommencer le dessin animé"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Recommencer</span>
            </button>

            {/* Pause / Play */}
            <button
              onClick={() => {
                if (isPlaying || speechActive) handlePause();
                else handlePlayScene();
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-teal-400 hover:bg-teal-500 text-teal-950 font-extrabold text-xs sm:text-sm border-2 border-teal-500 transition-transform active:scale-95 shadow-xs"
            >
              {isPlaying || speechActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying || speechActive ? 'Pause' : 'Reprendre'}</span>
            </button>
          </div>

          {/* "J'ai regardé ! ★" Validation button */}
          <button
            onClick={handleCompleteActivity}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-black text-sm sm:text-base border-2 shadow-md transition-all active:scale-95 ${
              isCompleted
                ? 'bg-amber-400 text-amber-950 border-amber-500'
                : 'bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-amber-950 border-amber-500 hover:shadow-lg'
            }`}
            aria-label="Valider l'étoile 1"
          >
            <Star className={`w-5 h-5 ${isCompleted ? 'fill-amber-950' : 'fill-amber-950'}`} />
            <span>{isCompleted ? 'Étoile 1 Gagnée ! ★' : 'J’ai regardé ! ★'}</span>
          </button>
        </div>

      </div>
    </article>
  );
};
