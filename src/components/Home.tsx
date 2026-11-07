import { motion } from 'motion/react';
import { Pencil, WifiOff } from 'lucide-react';
import type { Profile } from '../lib/profile';
import type { Today } from '../../shared/schemas';
import { SECTION_STYLE, type Section } from './ui';
import { soundEffects } from '../utils/soundEffects';

interface HomeProps {
  profile: Profile;
  today: Today;
  counts: Record<Exclude<Section, 'video'>, { total: number; done: number }>;
  offline: boolean;
  onOpen: (s: Section) => void;
  onEditProfile: () => void;
}

function greeting(): string {
  const h = Number(new Intl.DateTimeFormat('fr-FR', { hour: 'numeric', hour12: false, timeZone: 'Europe/Paris' }).format(new Date()));
  return h >= 18 || h < 5 ? 'Bonsoir' : 'Bonjour';
}

const TILE_LABEL: Record<Exclude<Section, 'video'>, string> = { contes: 'Contes', activites: 'Activités', soir: 'Contes du soir' };

const tile = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  show: (i: number) => ({ opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 140, damping: 16, delay: 0.08 * i } })
};

export function Home({ profile, today, counts, offline, onOpen, onEditProfile }: HomeProps) {
  const open = (s: Section) => {
    soundEffects.playPop();
    onOpen(s);
  };
  const isEvening = greeting() === 'Bonsoir';
  const small: Exclude<Section, 'video'>[] = isEvening ? ['soir', 'contes', 'activites'] : ['contes', 'activites', 'soir'];

  return (
    <main className="min-h-dvh max-w-3xl mx-auto px-4 sm:px-6 pb-10" style={{ paddingTop: 'max(1.25rem, env(safe-area-inset-top))' }}>
      {/* Accueil personnalisé */}
      <header className="flex items-center gap-4 mb-6">
        <div className="text-6xl float" aria-hidden>
          {profile.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-doux text-lg">{greeting()}</p>
          <h1 className="text-4xl sm:text-5xl font-bold truncate">{profile.name} !</h1>
        </div>
        <button onClick={onEditProfile} className="press w-11 h-11 rounded-2xl bg-white shadow-bonbon flex items-center justify-center text-doux" aria-label="Changer de prénom">
          <Pencil className="w-5 h-5" />
        </button>
      </header>

      {offline && (
        <p role="status" className="mb-4 flex items-center gap-2 rounded-2xl bg-ciel-clair text-ciel px-4 py-2 font-medium">
          <WifiOff className="w-5 h-5" /> Pas d’internet ? Pas de souci, tout marche quand même !
        </p>
      )}

      {/* Vidéo du jour : la grande tuile */}
      <motion.button
        custom={0}
        variants={tile}
        initial="hidden"
        animate="show"
        onClick={() => open('video')}
        className="press shadow-bonbon w-full rounded-[2rem] bg-corail text-white p-6 sm:p-8 text-left relative overflow-hidden mb-4"
      >
        <span className="absolute -right-4 -bottom-6 text-[9rem] opacity-25 rotate-12" aria-hidden>
          {today.emoji}
        </span>
        <span className="inline-block bg-white/25 rounded-full px-3 py-1 text-sm font-semibold mb-3">🎬 La vidéo du jour</span>
        <span className="block text-2xl sm:text-3xl font-bold leading-tight max-w-[85%]">{today.title}</span>
        <span className="mt-4 inline-flex items-center gap-2 bg-white text-corail rounded-full px-5 py-2 text-lg font-bold">▶ Regarder</span>
      </motion.button>

      {/* Les 3 bibliothèques */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {small.map((s, i) => {
          const st = SECTION_STYLE[s];
          const c = counts[s];
          return (
            <motion.button
              key={s}
              custom={i + 1}
              variants={tile}
              initial="hidden"
              animate="show"
              onClick={() => open(s)}
              className={`press shadow-bonbon rounded-[2rem] ${st.strong} ${s === 'soir' || s === 'activites' ? 'text-white' : 'text-encre'} p-5 text-left flex sm:flex-col items-center sm:items-start gap-4`}
            >
              <span className="text-5xl sm:text-6xl" aria-hidden>
                {st.emoji}
              </span>
              <span className="flex-1">
                <span className="block text-xl font-bold">{TILE_LABEL[s]}</span>
                <span className="block opacity-80 font-medium">
                  {c.done > 0 ? `${c.done} / ${c.total} ✓` : `${c.total} à découvrir`}
                </span>
              </span>
            </motion.button>
          );
        })}
      </div>

      <footer className="text-center text-sm text-doux mt-10">Pulse Kids • sans publicité • ton prénom reste sur cet appareil</footer>
    </main>
  );
}
