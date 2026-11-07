import { ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import type { ReactNode } from 'react';
import { soundEffects } from '../utils/soundEffects';

export type Section = 'video' | 'contes' | 'activites' | 'soir';

/** Couleur de chaque espace : repère visuel immédiat pour un enfant qui ne lit pas encore. */
export const SECTION_STYLE: Record<Section, { label: string; emoji: string; strong: string; soft: string; text: string }> = {
  video: { label: 'La vidéo du jour', emoji: '🎬', strong: 'bg-corail', soft: 'bg-corail-clair', text: 'text-corail' },
  contes: { label: 'Les contes', emoji: '📖', strong: 'bg-soleil', soft: 'bg-soleil-clair', text: 'text-amber-600' },
  activites: { label: 'Les activités', emoji: '🧩', strong: 'bg-menthe', soft: 'bg-menthe-clair', text: 'text-menthe' },
  soir: { label: 'Les contes du soir', emoji: '🌙', strong: 'bg-lavande', soft: 'bg-lavande-clair', text: 'text-lavande' }
};

export function TopBar({ title, emoji, onBack, dark = false, right }: { title: string; emoji: string; onBack: () => void; dark?: boolean; right?: ReactNode }) {
  return (
    <header
      className={`sticky top-0 z-20 flex items-center gap-3 px-4 py-3 sm:px-6 ${dark ? 'bg-nuit/95 text-white' : 'bg-creme/95 text-encre'}`}
      style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
    >
      <button
        onClick={() => {
          soundEffects.playPop();
          onBack();
        }}
        className={`press shadow-bonbon w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${dark ? 'bg-white/15' : 'bg-white'}`}
        aria-label="Retour"
      >
        <ArrowLeft className="w-6 h-6" strokeWidth={3} />
      </button>
      <h1 className="text-xl sm:text-2xl font-semibold truncate flex-1">
        <span aria-hidden className="mr-2">
          {emoji}
        </span>
        {title}
      </h1>
      {right}
    </header>
  );
}

export function SpeakButton({ speaking, onClick, dark = false, label = 'Écouter' }: { speaking: boolean; onClick: () => void; dark?: boolean; label?: string }) {
  return (
    <button
      onClick={onClick}
      className={`press shadow-bonbon h-12 px-4 rounded-2xl flex items-center gap-2 font-semibold shrink-0 ${
        speaking ? 'bg-ciel text-white' : dark ? 'bg-white/15 text-white' : 'bg-white text-encre'
      }`}
      aria-label={speaking ? 'Arrêter la lecture' : label}
      aria-pressed={speaking}
    >
      {speaking ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
      <span className="hidden sm:inline">{speaking ? 'Stop' : label}</span>
    </button>
  );
}
