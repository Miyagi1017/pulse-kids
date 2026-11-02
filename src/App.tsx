import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { CartoonPlayer } from './components/CartoonPlayer';
import { SoundQuizCard } from './components/SoundQuizCard';
import { AnimalSoundCard } from './components/AnimalSoundCard';
import { MysteryBubbleCard } from './components/MysteryBubbleCard';
import { BedtimeStoryCard } from './components/BedtimeStoryCard';
import { DiscoveriesView } from './components/DiscoveriesView';
import { ParentalModal } from './components/ParentalModal';
import { BadgesModal } from './components/BadgesModal';
import { InteractiveWordModal } from './components/InteractiveWordModal';
import { SessionEndOverlay } from './components/SessionEndOverlay';

import { DailyActivityPackage, ParentalSettings, UserProgress, VocabularyWord } from './types/news';
import {
  loadSavedSettings,
  saveSettings,
  loadSavedProgress,
  saveProgress,
  loadCurrentStory,
  fetchDailyNewsAi,
  DEFAULT_PARENTAL_SETTINGS
} from './services/newsService';
import {
  calculateRemainingSeconds,
  isSessionExpired,
  isWarningTimeReached,
  computeStarsCount,
  determineEarnedBadges
} from './utils/screenTime';
import {
  soundEffects,
  speakFrenchText,
  stopSpeaking,
  isSpeaking as checkIsSpeaking
} from './utils/soundEffects';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'videos' | 'discoveries' | 'badges'>('videos');
  const [currentStory, setCurrentStory] = useState<DailyActivityPackage>(loadCurrentStory());
  const [settings, setSettings] = useState<ParentalSettings>(loadSavedSettings());
  const [progress, setProgress] = useState<UserProgress>(loadSavedProgress());
  
  // Modals state
  const [isParentsOpen, setIsParentsOpen] = useState(false);
  const [isBadgesOpen, setIsBadgesOpen] = useState(false);
  const [selectedWord, setSelectedWord] = useState<VocabularyWord | null>(null);
  
  // Audio state
  const [isSpeakingState, setIsSpeakingState] = useState(false);
  
  // Offline mode state
  const [isOffline, setIsOffline] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Warning chime tracked
  const hasWarnedRef = useRef(false);

  // Screen time ticking
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        const nextTime = prev.timeSpentSecondsToday + 1;
        const updated = { ...prev, timeSpentSecondsToday: nextTime };
        saveProgress(updated);
        return updated;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Time calculations
  const remainingSeconds = calculateRemainingSeconds(
    settings.screenTimeMinutes,
    progress.timeSpentSecondsToday
  );
  const isExpired = isSessionExpired(
    settings.screenTimeMinutes,
    progress.timeSpentSecondsToday
  );
  const isWarning = isWarningTimeReached(
    settings.screenTimeMinutes,
    progress.timeSpentSecondsToday,
    settings.audioWarningMinutesBefore
  );

  // Trigger gentle warning chime once when warning window enters
  useEffect(() => {
    if (isWarning && !hasWarnedRef.ref) {
      hasWarnedRef.current = true;
      soundEffects.playSessionEndAlert();
      speakFrenchText("Attention petit curieux, il te reste deux minutes pour aujourd’hui !", {
        rate: 0.85,
        pitch: 1.15
      });
    }
  }, [isWarning]);

  // Complete an activity handler
  const handleCompleteActivity = (actNum: number) => {
    if (!progress.completedActivities.includes(actNum)) {
      const nextCompleted = [...progress.completedActivities, actNum];
      const nextStars = computeStarsCount(nextCompleted);
      const nextBadges = determineEarnedBadges({
        ...progress,
        completedActivities: nextCompleted,
        starsEarned: nextStars
      });

      const updated = {
        ...progress,
        completedActivities: nextCompleted,
        starsEarned: nextStars,
        unlockedBadges: nextBadges
      };
      setProgress(updated);
      saveProgress(updated);

      // If finished all 5 activities, big celebration!
      if (nextStars >= 5) {
        soundEffects.playFanfare();
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.5 }
        });
        speakFrenchText("Youpi ! Tu as réussi les 5 missions magiques du jour ! Tu es un vrai champion !", {
          rate: 0.9,
          pitch: 1.2
        });
      }
    }
  };

  // Tell story handler (read whole daily summary)
  const handleTellStory = () => {
    if (isSpeakingState) {
      stopSpeaking();
      setIsSpeakingState(false);
      return;
    }

    setIsSpeakingState(true);
    const speech = `Bonjour petit explorateur ! Aujourd’hui dans Pulse Kids : ${currentStory.summary}. Marc le super bâtisseur est prêt dans son atelier ! Touchons l'écran pour commencer !`;
    speakFrenchText(speech, {
      rate: settings.speechRate,
      pitch: 1.15,
      onEnd: () => setIsSpeakingState(false),
      onError: () => setIsSpeakingState(false)
    });
  };

  // Handle AI generation of a new daily edition
  const handleGenerateAi = async () => {
    setIsGeneratingAi(true);
    try {
      const newStory = await fetchDailyNewsAi(isOffline);
      setCurrentStory(newStory);
      soundEffects.playFanfare();
      confetti({ particleCount: 60 });
      speakFrenchText("Tadaaa ! Une nouvelle édition magique vient d'arriver !", { rate: 0.9 });
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Scroll to activity when selected from hero or discoveries
  const handleSelectActivity = (actNum: number) => {
    setCurrentTab('videos');
    const el = document.getElementById(`activity-card-${actNum}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-slate-800 flex flex-col font-sans antialiased">
      {/* 1. Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'badges') {
            setIsBadgesOpen(true);
          } else {
            setCurrentTab(tab);
          }
        }}
        starsCount={progress.starsEarned}
        timeRemainingSeconds={remainingSeconds}
        isWarning={isWarning}
        onOpenParents={() => setIsParentsOpen(true)}
        onToggleReadAloud={handleTellStory}
        isSpeaking={isSpeakingState}
        isOffline={isOffline}
        onToggleOffline={() => {
          soundEffects.playPop();
          setIsOffline(!isOffline);
        }}
      />

      {/* 2. Gentle Screen-Time Warning Banner if nearing 15 min limit */}
      {isWarning && !isExpired && (
        <div className="bg-amber-400 text-amber-950 px-4 py-2 text-center text-xs sm:text-sm font-black border-b border-amber-500 flex items-center justify-center gap-2 animate-pulse">
          <span>🧸</span>
          <span>
            Bientôt la fin du temps d’écran ({Math.ceil(remainingSeconds / 60)} min restantes). Prépare-toi à reposer tes yeux !
          </span>
        </div>
      )}

      {/* 3. Offline Mode Badge Bar if activated */}
      {isOffline && (
        <div className="bg-orange-100 text-orange-900 px-4 py-1.5 text-center text-xs font-bold border-b border-orange-200">
          ✈️ Mode Hors-Ligne Actif : Les activités fonctionnent 100% sans connexion internet !
        </div>
      )}

      {/* 4. Main Body Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-3 sm:p-6 space-y-6">
        {currentTab === 'videos' ? (
          <>
            {/* Hero Adventure Banner */}
            <HeroBanner
              completedCount={progress.completedActivities.length}
              onTellStory={handleTellStory}
              isSpeaking={isSpeakingState}
              onSelectActivity={handleSelectActivity}
            />

            {/* 5 Sequential Interactive News Activities */}
            <section className="space-y-6 pt-2">
              
              {/* Activity 1: Grand Dessin Animé Interactif */}
              <div id="activity-card-1">
                <CartoonPlayer
                  cartoon={currentStory.cartoon}
                  isCompleted={progress.completedActivities.includes(1)}
                  onComplete={() => handleCompleteActivity(1)}
                  onSelectWord={(word) => setSelectedWord(word)}
                />
              </div>

              {/* Activity 2: Le Quiz Sonore */}
              <div id="activity-card-2">
                <SoundQuizCard
                  quiz={currentStory.soundQuiz}
                  isCompleted={progress.completedActivities.includes(2)}
                  onComplete={() => handleCompleteActivity(2)}
                />
              </div>

              {/* Activity 3: Les Animaux de la Ferme */}
              <div id="activity-card-3">
                <AnimalSoundCard
                  discovery={currentStory.animalDiscovery}
                  isCompleted={progress.completedActivities.includes(3)}
                  onComplete={() => handleCompleteActivity(3)}
                />
              </div>

              {/* Activity 4: La Bulle Mystère */}
              <div id="activity-card-4">
                <MysteryBubbleCard
                  mystery={currentStory.mysteryBubble}
                  isCompleted={progress.completedActivities.includes(4)}
                  onComplete={() => handleCompleteActivity(4)}
                />
              </div>

              {/* Activity 5: Mini-Conte Animé du Soir */}
              <div id="activity-card-5">
                <BedtimeStoryCard
                  tale={currentStory.bedtimeTale}
                  isCompleted={progress.completedActivities.includes(5)}
                  onComplete={() => handleCompleteActivity(5)}
                />
              </div>

            </section>
          </>
        ) : (
          /* Tab: Étoiles & Découvertes Overview */
          <DiscoveriesView
            currentStory={currentStory}
            completedActivities={progress.completedActivities}
            onSelectActivity={handleSelectActivity}
            onGenerateNewAiEdition={handleGenerateAi}
            isGeneratingAi={isGeneratingAi}
          />
        )}
      </main>

      {/* 5. Safe Footer for Kids */}
      <footer className="border-t border-amber-200/80 bg-white/60 py-4 px-4 text-center text-xs font-semibold text-amber-900/70 space-y-1">
        <p>
          Pulse Kids • Le journal bienveillant des enfants de 5 ans • Sans publicité • 100% confidentiel
        </p>
        <p className="text-[11px] text-slate-500">
          Temps d’écran paramétré : {settings.screenTimeMinutes} minutes • Développé avec amour pour les p’tits curieux
        </p>
      </footer>

      {/* 6. MODALS & OVERLAYS */}
      
      {/* Vocabulary Word Definition Popover */}
      <InteractiveWordModal
        word={selectedWord}
        onClose={() => setSelectedWord(null)}
      />

      {/* Parental Controls Modal */}
      <ParentalModal
        isOpen={isParentsOpen}
        onClose={() => setIsParentsOpen(false)}
        settings={settings}
        onUpdateSettings={(newSettings) => {
          setSettings(newSettings);
          saveSettings(newSettings);
        }}
        progress={progress}
        onResetScreenTime={() => {
          const reset = { ...progress, timeSpentSecondsToday: 0 };
          setProgress(reset);
          saveProgress(reset);
        }}
        onAddExtraTime={(extraMinutes) => {
          const bonusSeconds = extraMinutes * 60;
          const updated = {
            ...progress,
            timeSpentSecondsToday: Math.max(0, progress.timeSpentSecondsToday - bonusSeconds)
          };
          setProgress(updated);
          saveProgress(updated);
        }}
      />

      {/* Badges Modal */}
      <BadgesModal
        isOpen={isBadgesOpen}
        onClose={() => setIsBadgesOpen(false)}
        unlockedBadgeIds={progress.unlockedBadges}
      />

      {/* End of Screen Time Lock Screen (15 min elapsed) */}
      {isExpired && (
        <SessionEndOverlay
          starsEarned={progress.starsEarned}
          onOpenParents={() => setIsParentsOpen(true)}
          onUnlockEmergency={() => {
            // Add +5 min emergency time
            const updated = {
              ...progress,
              timeSpentSecondsToday: Math.max(0, progress.timeSpentSecondsToday - 300)
            };
            setProgress(updated);
            saveProgress(updated);
          }}
        />
      )}
    </div>
  );
}
