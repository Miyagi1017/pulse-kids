export interface VocabularyWord {
  word: string;
  syllables: string;
  definition: string;
  emoji: string;
}

export interface CartoonScene {
  id: string;
  title: string;
  narration: string;
  durationSeconds: number;
  bgType: 'workshop' | 'space' | 'ocean' | 'nature' | 'windmills';
  character: {
    name: string;
    avatar: string;
    mood: 'happy' | 'thinking' | 'proud' | 'excited' | 'sleepy';
    speech: string;
  };
  interactiveHotspots: {
    id: string;
    label: string;
    xPercent: number;
    yPercent: number;
    emoji: string;
    soundType: string;
    reactionText: string;
  }[];
  keyWords: VocabularyWord[];
}

export interface SoundQuizOption {
  id: string;
  label: string;
  hint: string;
  emoji: string;
  isCorrect: boolean;
  soundType: 'water-tap' | 'wrench' | 'tractor' | 'bell' | 'chime';
}

export interface AnimalSoundItem {
  id: string;
  name: string;
  soundText: string;
  emoji: string;
  soundType: 'cow' | 'sheep' | 'pig' | 'chicken';
}

export interface DailyActivityPackage {
  id: string;
  date: string;
  tagline: string;
  topic: string;
  source: string;
  summary: string;
  cartoon: {
    title: string;
    durationLabel: string;
    badgeLabel: string;
    heroName: string;
    heroDescription: string;
    scenes: CartoonScene[];
  };
  soundQuiz: {
    title: string;
    question: string;
    soundToPlay: 'water-tap' | 'tractor' | 'wrench';
    options: SoundQuizOption[];
  };
  animalDiscovery: {
    title: string;
    subtitle: string;
    animals: AnimalSoundItem[];
  };
  mysteryBubble: {
    title: string;
    question: string;
    shortExplanation: string;
    detailedSecret: string;
    bubbleCount: number;
  };
  bedtimeTale: {
    title: string;
    summary: string;
    nightTheme: string;
    taleText: string;
  };
}


export interface UserProgress {
  completedActivities: number[]; // e.g. [1, 2, 3]
  starsEarned: number;
  unlockedBadges: string[];
  wordsDiscovered: string[];
  timeSpentSecondsToday: number;
  lastVisitDate: string;
}
