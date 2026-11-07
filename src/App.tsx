import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { CartoonPlayer } from './components/CartoonPlayer';
import { SoundQuizCard } from './components/SoundQuizCard';
import { AnimalSoundCard } from './components/AnimalSoundCard';
import { MysteryBubbleCard } from './components/MysteryBubbleCard';
import { BedtimeStoryCard } from './components/BedtimeStoryCard';
import { DiscoveriesView } from './components/DiscoveriesView';
import { BadgesModal } from './components/BadgesModal';
import { InteractiveWordModal } from './components/InteractiveWordModal';

import type { DailyActivityPackage, UserProgress, VocabularyWord } from './types/news';
import {
  fetchTodayStory,
  loadCachedStory,
  loadSavedProgress,
  pickAnotherStory,
  purgeLegacyStorage,
  saveProgress,
  SPEECH_RATE
} from './services/newsService';
import { computeStarsCount, determineEarnedBadges } from './utils/screenTime';
import { soundEffects, speakFrenchText, stopSpeaking } from './utils/soundEffects';

/** Recalcule étoiles et badges à partir de l'état brut (une seule source de vérité). */
function withDerived(p: UserProgress): UserProgress {
  const starsEarned = computeStarsCount(p.completedActivities);
  const unlockedBadges = [...new Set([...p.unlockedBadges, ...determineEarnedBadges({ ...p, starsEarned })])];
  return { ...p, starsEarned, unlockedBadges };
}

/** Statut réseau réel du navigateur (le mode hors ligne s'active tout seul). */
function useOffline() {
  const [offline, setOffline] = useState(() => typeof navigator !== 'undefined' && !navigator.onLine);
  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  return offline;
}

export default function App() {
  const [currentTab, setCurrentTab] = useState<'videos' | 'discoveries' | 'badges'>('videos');
  const [currentStory, setCurrentStory] = useState<DailyActivityPackage>(loadCachedStory);
  const [progress, setProgress] = useState<UserProgress>(loadSavedProgress);

  const [isBadgesOpen, setIsBadgesOpen] = useState(false);
  const [selectedWord, setSelectedWord] = useState<VocabularyWord | null>(null);
  const [isSpeakingState, setIsSpeakingState] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const isOffline = useOffline();

  // Démarrage : nettoyage des anciennes données et chargement de l'édition du jour.
  useEffect(() => {
    purgeLegacyStorage();
    fetchTodayStory().then((story) => story && setCurrentStory(story));
  }, []);

  const updateProgress = (fn: (p: UserProgress) => UserProgress) => {
    setProgress((prev) => {
      const next = withDerived(fn(prev));
      saveProgress(next);
      return next;
    });
  };

  const handleCompleteActivity = (actNum: number) => {
    if (progress.completedActivities.includes(actNum)) return;
    const finishesAll = computeStarsCount([...progress.completedActivities, actNum]) >= 5;
    updateProgress((p) => ({ ...p, completedActivities: [...p.completedActivities, actNum] }));

    if (finishesAll) {
      soundEffects.playFanfare();
      confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });
      speakFrenchText('Youpi ! Tu as réussi les 5 missions magiques du jour ! Tu es un vrai champion !', {
        rate: 0.9,
        pitch: 1.2
      });
    }
  };

  // Chaque mot touché enrichit le vocabulaire (débloque le badge « explorateur des mots »).
  const handleSelectWord = (word: VocabularyWord) => {
    setSelectedWord(word);
    updateProgress((p) =>
      p.wordsDiscovered.includes(word.word) ? p : { ...p, wordsDiscovered: [...p.wordsDiscovered, word.word] }
    );
  };

  const handleTellStory = () => {
    if (isSpeakingState) {
      stopSpeaking();
      setIsSpeakingState(false);
      return;
    }
    setIsSpeakingState(true);
    const speech = `Bonjour petit explorateur ! Aujourd’hui dans Pulse Kids : ${currentStory.summary} ${currentStory.cartoon.heroName} t’attend pour l’aventure ! Touche l’écran pour commencer !`;
    speakFrenchText(speech, {
      rate: SPEECH_RATE,
      pitch: 1.15,
      onEnd: () => setIsSpeakingState(false),
      onError: () => setIsSpeakingState(false)
    });
  };

  const handleGenerateAi = async () => {
    setIsGeneratingAi(true);
    try {
      const today = await fetchTodayStory();
      const next = today && today.id !== currentStory.id ? today : pickAnotherStory(currentStory.id);
      setCurrentStory(next);
      soundEffects.playFanfare();
      confetti({ particleCount: 60 });
      speakFrenchText('Tadaaa ! Une nouvelle édition magique vient d’arriver !', { rate: 0.9 });
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSelectActivity = (actNum: number) => {
    setCurrentTab('videos');
    requestAnimationFrame(() =>
      document.getElementById(`activity-card-${actNum}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    );
  };

  const done = (n: number) => progress.completedActivities.includes(n);

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-slate-800 flex flex-col font-sans antialiased">
      {/* 1. Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => (tab === 'badges' ? setIsBadgesOpen(true) : setCurrentTab(tab))}
        starsCount={progress.starsEarned}
        onToggleReadAloud={handleTellStory}
        isSpeaking={isSpeakingState}
        isOffline={isOffline}
      />

      {/* 2. Offline Mode Badge Bar (automatique) */}
      {isOffline && (
        <div role="status" className="bg-orange-100 text-orange-900 px-4 py-1.5 text-center text-xs font-bold border-b border-orange-200">
          ✈️ Mode Hors-Ligne Actif : Les activités fonctionnent 100% sans connexion internet !
        </div>
      )}

      {/* 3. Main Body Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-3 sm:p-6 space-y-6">
        {currentTab === 'videos' ? (
          <>
            <HeroBanner
              completedActivities={progress.completedActivities}
              onTellStory={handleTellStory}
              isSpeaking={isSpeakingState}
              onSelectActivity={handleSelectActivity}
            />

            {/* 5 Sequential Interactive News Activities */}
            <section className="space-y-6 pt-2" key={currentStory.id}>
              <div id="activity-card-1">
                <CartoonPlayer
                  cartoon={currentStory.cartoon}
                  isCompleted={done(1)}
                  onComplete={() => handleCompleteActivity(1)}
                  onSelectWord={handleSelectWord}
                />
              </div>
              <div id="activity-card-2">
                <SoundQuizCard quiz={currentStory.soundQuiz} isCompleted={done(2)} onComplete={() => handleCompleteActivity(2)} />
              </div>
              <div id="activity-card-3">
                <AnimalSoundCard discovery={currentStory.animalDiscovery} isCompleted={done(3)} onComplete={() => handleCompleteActivity(3)} />
              </div>
              <div id="activity-card-4">
                <MysteryBubbleCard mystery={currentStory.mysteryBubble} isCompleted={done(4)} onComplete={() => handleCompleteActivity(4)} />
              </div>
              <div id="activity-card-5">
                <BedtimeStoryCard tale={currentStory.bedtimeTale} isCompleted={done(5)} onComplete={() => handleCompleteActivity(5)} />
              </div>
            </section>
          </>
        ) : (
          <DiscoveriesView
            currentStory={currentStory}
            completedActivities={progress.completedActivities}
            onSelectActivity={handleSelectActivity}
            onGenerateNewAiEdition={handleGenerateAi}
            isGeneratingAi={isGeneratingAi}
          />
        )}
      </main>

      {/* 4. Safe Footer for Kids */}
      <footer className="border-t border-amber-200/80 bg-white/60 py-4 px-4 text-center text-xs font-semibold text-amber-900/70 space-y-1">
        <p>Pulse Kids • Le journal bienveillant des enfants de 5 ans • Sans publicité • 100% confidentiel</p>
        <p className="text-[11px] text-slate-500">Développé avec amour pour les p’tits curieux</p>
      </footer>

      {/* 5. MODALS */}
      <InteractiveWordModal word={selectedWord} onClose={() => setSelectedWord(null)} />
      <BadgesModal isOpen={isBadgesOpen} onClose={() => setIsBadgesOpen(false)} unlockedBadgeIds={progress.unlockedBadges} />
    </div>
  );
}
