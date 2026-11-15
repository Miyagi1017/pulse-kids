import { useEffect } from 'react';
import { motion } from 'motion/react';
import { BookA, BookOpen, Film, Footprints, Lightbulb, Moon, Music, Palette, Pencil, Play, Puzzle, WifiOff, Zap, type LucideIcon } from 'lucide-react';
import type { Profile } from '../lib/profile';
import type { Today } from '../../shared/schemas';
import type { SportTip } from '../data/sport';
import type { Playable } from '../lib/playlist';
import { sceneFor, ThemeScene, type SceneTheme } from './ThemeScene';
import { nextTheme, THEME_INFO, type Theme } from '../lib/theme';
import { AGE_INFO, otherAge, type AgeBand } from '../lib/age';
import { Habitudes } from './Habitudes';
import { soundEffects } from '../utils/soundEffects';
import { burst, Mascot, pointOf, sayHello } from './fx';
import { LIFT, PRESS } from '../lib/motion';
import { ALL_CHANSONS, type Chanson } from '../data/chansons';
import type { Section } from './ui';
import { VideoStage } from './VideoStage';
import { Vignette } from './Vignette';
import { tilePainter, type TileId } from '../kits/tiles';

interface HomeProps {
  profile: Profile;
  today: Today;
  counts: Record<Exclude<Section, 'video' | 'explications'>, { total: number; done: number }>;
  offline: boolean;
  onOpen: (s: Section) => void;
  onEditProfile: () => void;
  sport: SportTip;
  sportDone: boolean;
  /** Joue tout de suite le défi tiré au sort. */
  onSport: () => void;
  /** Ouvre l'espace « Bouger et grandir ». */
  onSportHub: () => void;
  onLire: () => void;
  /** Vidéo tirée au sort à chaque chargement, et comment la lancer. */
  featured: Playable;
  onFeatured: () => void;
  lireCount: { total: number; done: number };
  theme: Theme;
  onTheme: (t: Theme) => void;
  /** 🐣 5–6 ans ou 🦊 7–8 ans : adapte les textes et la voix. */
  age: AgeBand;
  onAge: () => void;
  onExplications: () => void;
  explicationsCount: { total: number; done: number };
  /** La chanson animée du jour (épisode vidéo court). */
  /** La chanson mise en avant (tirée au sort à chaque chargement). */
  chanson: Chanson;
  onChanson: () => void;
  /** Toutes les comptines. */
  onComptines: () => void;
  chansonDone: boolean;
  /** Les petits films dessinés (un style par film). */
  onFilms: () => void;
  filmsCount: { total: number; done: number };
}

function greeting(): string {
  const h = Number(new Intl.DateTimeFormat('fr-FR', { hour: 'numeric', hour12: false, timeZone: 'Europe/Paris' }).format(new Date()));
  return h >= 18 || h < 5 ? 'Bonsoir' : 'Bonjour';
}

const TILE_LABEL: Record<'contes' | 'activites' | 'soir', string> = { contes: 'Contes', activites: 'Activités', soir: 'Contes du soir' };

const tile = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  show: (i: number) => ({ opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 140, damping: 16, delay: 0.08 * i } }),
  hover: LIFT
};

const TAP = PRESS;

export function Home({ profile, today, counts, offline, onOpen, onEditProfile, sport, sportDone, onSport, onSportHub, onLire, lireCount, featured, onFeatured, theme, onTheme, age, onAge, onExplications, explicationsCount, chanson, onChanson, onComptines, chansonDone, onFilms, filmsCount }: HomeProps) {
  const kawaii = theme !== 'aquarelle';
  const isEvening = greeting() === 'Bonsoir';

  // La voix dit le prénom en arrivant (une fois par visite ; muet si le navigateur bloque l'audio avant un geste).
  useEffect(() => {
    const t = setTimeout(() => sayHello(greeting(), profile.name, { once: true }), 600);
    return () => clearTimeout(t);
  }, [profile.name]);
  const small: ('soir' | 'contes' | 'activites')[] = isEvening ? ['soir', 'contes', 'activites'] : ['contes', 'activites', 'soir'];

  const featuredScene = (featured.category as SceneTheme | undefined) ?? sceneFor(featured.title, 'journal');
  const go = (fn: () => void) => () => {
    soundEffects.playPop();
    fn();
  };
  const count = (c: { total: number; done: number }) => (c.done > 0 ? `${c.done} / ${c.total} ✓` : `${c.total} à découvrir`);
  const tiles: TileProps[] = [
    { id: 'sport', title: sport.title, sub: sportDone ? 'Défi réussi ✓' : 'Ton défi du jour', icon: Zap, color: 'bg-soleil text-encre', onClick: go(onSport) },
    { id: 'comptines', title: 'Comptines', sub: `${ALL_CHANSONS.length} chansons à chanter${chansonDone ? ' ✓' : ''}`, icon: Music, color: 'bg-rose text-white', onClick: go(onComptines) },
    { id: 'films', title: 'Petits films', sub: count(filmsCount), icon: Film, color: 'bg-lavande text-white', onClick: go(onFilms) },
    { id: 'explications', title: 'Pourquoi ?', sub: count(explicationsCount), icon: Lightbulb, color: 'bg-ciel text-white', onClick: go(onExplications) },
    { id: 'contes', title: TILE_LABEL.contes, sub: count(counts.contes), icon: BookOpen, color: 'bg-menthe text-white', onClick: go(() => onOpen('contes')) },
    { id: 'activites', title: TILE_LABEL.activites, sub: count(counts.activites), icon: Puzzle, color: 'bg-corail text-white', onClick: go(() => onOpen('activites')) },
    { id: 'soir', title: TILE_LABEL.soir, sub: count(counts.soir), icon: Moon, color: 'bg-nuit text-white', onClick: go(() => onOpen('soir')) },
    { id: 'lire', title: 'Lire', sub: count(lireCount), icon: BookA, color: 'bg-ciel text-white', onClick: go(onLire) },
    { id: 'video', title: 'Vidéos', sub: 'Le journal et 50 dessins animés', icon: Play, color: 'bg-corail text-white', onClick: go(() => onOpen('video')) },
    { id: 'bouger', title: 'Bouger', sub: 'Défis et mini-défis', icon: Footprints, color: 'bg-menthe text-white', onClick: go(onSportHub) }
  ];
  // Le soir, les contes du soir passent en premier.
  if (isEvening) tiles.unshift(...tiles.splice(6, 1));
  void small;
  void kawaii;

  return (
    <main className="min-h-dvh max-w-3xl mx-auto px-4 sm:px-6 pb-10" style={{ paddingTop: 'max(1.25rem, env(safe-area-inset-top))' }}>
      {/* Bonjour + prénom (touche-le pour l'entendre) */}
      <header className="flex items-center gap-2 sm:gap-4 mb-5">
        <div className="text-5xl sm:text-6xl shrink-0">
          <Mascot avatar={profile.avatar} name={profile.name} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-doux text-lg">{greeting()}</p>
          <h1 className="text-4xl sm:text-5xl font-bold truncate">
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={(e) => {
                const p = pointOf(e);
                burst(p.x, p.y, ['✨', '⭐'], 8);
                sayHello(greeting(), profile.name);
              }}
              className="max-w-full truncate text-left"
              aria-label={`Écouter : ${greeting()} ${profile.name}`}
            >
              {profile.name} !
            </motion.button>
          </h1>
        </div>
        <button
          onClick={() => {
            soundEffects.playSparkle();
            onAge();
          }}
          className="press shrink-0 h-11 sm:h-12 px-2.5 sm:px-3 rounded-2xl bg-white shadow-bonbon font-bold text-doux text-sm sm:text-base"
          aria-label={`Âge : ${AGE_INFO[age].label}. Passer à ${AGE_INFO[otherAge(age)].label}`}
        >
          {AGE_INFO[age].label}
        </button>
        <button
          onClick={() => {
            soundEffects.playSparkle();
            onTheme(nextTheme(theme));
          }}
          className="press shrink-0 hidden sm:flex w-12 h-12 rounded-2xl bg-white shadow-bonbon items-center justify-center text-doux"
          aria-label={`Couleurs ${THEME_INFO[theme].label}. Passer à ${THEME_INFO[nextTheme(theme)].label}`}
        >
          <Palette className="w-6 h-6" />
        </button>
        <button onClick={onEditProfile} className="press shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white shadow-bonbon flex items-center justify-center text-doux" aria-label="Changer de prénom">
          <Pencil className="w-6 h-6" />
        </button>
      </header>

      {offline && (
        <p role="status" className="mb-4 flex items-center gap-2 rounded-2xl bg-ciel-clair text-ciel px-4 py-2 font-medium">
          <WifiOff className="w-5 h-5" /> Pas d’internet ? Tout marche quand même !
        </p>
      )}

      {/* La vidéo du jour : un grand dessin animé qui bouge déjà, et un énorme bouton ▶ */}
      <motion.button
        custom={0}
        variants={tile}
        initial="hidden"
        animate="show"
        whileHover="hover"
        whileTap={TAP}
        onClick={(e) => {
          soundEffects.playPop();
          const p = pointOf(e);
          burst(p.x, p.y, ['⭐', '✨'], 9);
          onFeatured();
        }}
        className="sticker w-full rounded-[2rem] bg-corail text-white text-left relative overflow-hidden mb-5 block"
        aria-label={`Regarder : ${featured.title}`}
      >
        <span className="relative block">
          {featured.mini ? (
            <VideoStage video={featured.mini} scene={1} playing />
          ) : (
            <span className="relative block aspect-video overflow-hidden">
              <ThemeScene theme={featuredScene} />
            </span>
          )}
          <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/90 text-corail shadow-xl flex items-center justify-center">
              <Play className="w-12 h-12 sm:w-14 sm:h-14 ml-1.5" fill="currentColor" />
            </span>
          </span>
        </span>
        <span className="flex items-center gap-3 px-5 py-4">
          <span className="flex-1 min-w-0">
            <span className="block text-sm font-semibold opacity-90">{featured.title === today.title ? 'Le journal du jour' : 'Ta vidéo du jour'}</span>
            <span className="block text-2xl sm:text-3xl font-bold leading-tight truncate">{featured.title}</span>
          </span>
        </span>
      </motion.button>

      {/* Les rubriques : de grandes images dessinées, chacune dans son style, un seul pictogramme */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {tiles.map((t, i) => (
          <Tile key={t.id} {...t} i={i + 1} />
        ))}
      </div>

      {/* Les bonnes habitudes, en première page */}
      <div className="mt-6">
        <Habitudes day={today.date} />
      </div>

      <footer className="text-center text-sm text-doux mt-10">
        <p>Pulse Kids • sans publicité • ton prénom reste sur cet appareil</p>
        {/* Crédits (pour les grands) : styles, voix et outils libres utilisés. */}
        <details className="mt-2 text-xs opacity-80">
          <summary className="cursor-pointer">Crédits</summary>
          <p className="mt-1 leading-relaxed">
            Dessins animés rendus en code d’après Lemo-Opuscar et claude-video (MIT). Voix : Christine (ElevenLabs) ; timbre prolongé avec OpenVoice V2 de MyShell (MIT) sur la voix
            française Piper « siwis » (jeu de données SIWIS, Université d’Édimbourg, CC BY 4.0).
          </p>
        </details>
      </footer>
    </main>
  );
}

interface TileProps {
  id: TileId;
  title: string;
  sub: string;
  icon: LucideIcon;
  color: string;
  onClick: () => void;
  i?: number;
}

/** Grande tuile d'accueil : la vignette dessinée occupe presque tout, le titre est gros, un seul pictogramme. */
function Tile({ id, title, sub, icon: Icon, color, onClick, i = 0 }: TileProps) {
  return (
    <motion.button custom={i} variants={tile} initial="hidden" animate="show" whileHover="hover" whileTap={TAP} onClick={onClick} className={`sticker rounded-[1.75rem] ${color} text-left overflow-hidden flex flex-col`} aria-label={`${title} — ${sub}`}>
      <Vignette id={`tile-${id}`} paint={tilePainter(id)} ratio="4 / 3" className="w-full" />
      <span className="flex items-center gap-2 px-2.5 sm:px-4 py-2.5 sm:py-3">
        <span className="shrink-0 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-white/25 flex items-center justify-center" aria-hidden>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-base sm:text-2xl font-bold leading-tight line-clamp-2">{title}</span>
          <span className="block text-xs sm:text-sm font-semibold opacity-85 truncate">{sub}</span>
        </span>
      </span>
    </motion.button>
  );
}
