import { useEffect, type MouseEvent } from 'react';
import { motion } from 'motion/react';
import { Pencil, WifiOff } from 'lucide-react';
import type { Profile } from '../lib/profile';
import type { Today } from '../../shared/schemas';
import type { SportTip } from '../data/sport';
import type { Playable } from '../lib/playlist';
import { sceneFor, ThemeScene, type SceneTheme } from './ThemeScene';
import { Mascot as AnimalMascot } from './Mascot';
import { mascotForScene } from '../lib/mascots';
import type { Theme } from '../lib/theme';
import { KawaiiFace } from './Backdrop';
import { Habitudes } from './Habitudes';
import { personalize } from '../data/format';
import { SECTION_STYLE, type Section } from './ui';
import { soundEffects } from '../utils/soundEffects';
import { burst, Mascot, pointOf, sayHello } from './fx';
import { jump, LIFT, PRESS, wiggle as wiggleMove } from '../lib/motion';

interface HomeProps {
  profile: Profile;
  today: Today;
  counts: Record<Exclude<Section, 'video'>, { total: number; done: number }>;
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
}

function greeting(): string {
  const h = Number(new Intl.DateTimeFormat('fr-FR', { hour: 'numeric', hour12: false, timeZone: 'Europe/Paris' }).format(new Date()));
  return h >= 18 || h < 5 ? 'Bonsoir' : 'Bonjour';
}

const TILE_LABEL: Record<Exclude<Section, 'video'>, string> = { contes: 'Contes', activites: 'Activités', soir: 'Contes du soir' };

const tile = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  show: (i: number) => ({ opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 140, damping: 16, delay: 0.08 * i } }),
  hover: LIFT
};

/** L'emoji de la tuile se tortille (amorti) et grossit un peu quand on la survole. */
const wiggle = { hover: { ...wiggleMove(16, 0.8), scale: 1.15 } };
const TAP = PRESS;
const sportHop = jump(26, 0.8);

/** Résumé d'une vidéo : les scènes du milieu (sans le bonjour ni l'au revoir), une phrase chacune. */
function journalSummary(today: Pick<Today, 'scenes'>, name: string): { emoji: string; text: string }[] {
  const middle = today.scenes.length > 2 ? today.scenes.slice(1, -1) : today.scenes;
  return middle.slice(0, 3).map((s) => {
    const parts = personalize(s.text, name).split(/(?<=[.!?])\s/);
    const first = parts[0].length < 20 && parts[1] ? `${parts[0]} ${parts[1]}` : parts[0];
    return { emoji: s.emoji, text: first.length > 90 ? `${first.slice(0, 87)}…` : first };
  });
}

export function Home({ profile, today, counts, offline, onOpen, onEditProfile, sport, sportDone, onSport, onSportHub, onLire, lireCount, featured, onFeatured, theme, onTheme }: HomeProps) {
  const kawaii = theme === 'kawaii';
  const open = (s: Section, e: MouseEvent<HTMLButtonElement>, emojis: string[]) => {
    soundEffects.playPop();
    const p = pointOf(e);
    burst(p.x, p.y, emojis, 9);
    onOpen(s);
  };
  const isEvening = greeting() === 'Bonsoir';

  // La voix dit le prénom en arrivant (une fois par visite ; muet si le navigateur bloque l'audio avant un geste).
  useEffect(() => {
    const t = setTimeout(() => sayHello(greeting(), profile.name, { once: true }), 600);
    return () => clearTimeout(t);
  }, [profile.name]);
  const small: Exclude<Section, 'video'>[] = isEvening ? ['soir', 'contes', 'activites'] : ['contes', 'activites', 'soir'];

  return (
    <main className="min-h-dvh max-w-3xl mx-auto px-4 sm:px-6 pb-10" style={{ paddingTop: 'max(1.25rem, env(safe-area-inset-top))' }}>
      {/* Accueil personnalisé */}
      <header className="flex items-center gap-4 mb-6">
        <div className="text-6xl">
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
                burst(p.x, p.y, ['💛', '✨', '⭐'], 8);
                sayHello(greeting(), profile.name);
              }}
              className="max-w-full truncate text-left"
              aria-label={`Écouter : ${greeting()} ${profile.name}`}
            >
              {profile.name} !
            </motion.button>
          </h1>
        </div>
        {/* Choix du thème : 🌸 kawaii ↔ 🍃 aquarelle */}
        <motion.button
          whileTap={PRESS}
          onClick={(e) => {
            soundEffects.playSparkle();
            const p = pointOf(e);
            burst(p.x, p.y, kawaii ? ['🍃', '☁️', '🌿'] : ['🌸', '💮', '✨'], 8);
            onTheme(kawaii ? 'aquarelle' : 'kawaii');
          }}
          className="h-11 px-3 rounded-2xl bg-white shadow-bonbon flex items-center gap-1.5 font-semibold text-doux"
          aria-label={kawaii ? 'Passer au thème aquarelle' : 'Passer au thème kawaii'}
        >
          <span className="text-xl" aria-hidden>
            {kawaii ? '🌸' : '🍃'}
          </span>
          <span className="hidden sm:inline">{kawaii ? 'Kawaii' : 'Aquarelle'}</span>
        </motion.button>
        <button onClick={onEditProfile} className="press w-11 h-11 rounded-2xl bg-white shadow-bonbon flex items-center justify-center text-doux" aria-label="Changer de prénom">
          <Pencil className="w-5 h-5" />
        </button>
      </header>

      {offline && (
        <p role="status" className="mb-4 flex items-center gap-2 rounded-2xl bg-ciel-clair text-ciel px-4 py-2 font-medium">
          <WifiOff className="w-5 h-5" /> Pas d’internet ? Pas de souci, tout marche quand même !
        </p>
      )}

      {/* Le sport du jour : en premier plan */}
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
          burst(p.x, p.y, [sport.emoji, '💪', '⭐', '✨'], 9);
          onSport();
        }}
        className="sticker w-full rounded-[2rem] bg-soleil text-encre p-5 sm:p-6 text-left relative overflow-hidden mb-4 flex items-center gap-4"
      >
        <motion.span
          className="text-7xl sm:text-8xl leading-none shrink-0"
          style={{ originY: 1 }}
          animate={{ y: sportHop.y, scaleY: sportHop.scaleY, scaleX: sportHop.scaleX }}
          transition={{ ...sportHop.transition, delay: 0.6, repeat: 2, repeatDelay: 1.4 }}
          aria-hidden
        >
          {sport.emoji}
        </motion.span>
        <span className="flex-1 min-w-0">
          <span className="inline-block bg-white/60 rounded-full px-3 py-1 text-sm font-semibold mb-2">🎲 Ton défi sport {sportDone ? '✓' : ''}</span>
          <span className="block text-2xl sm:text-3xl font-bold leading-tight">{sport.title}</span>
          <span className="block mt-1 font-medium opacity-80 line-clamp-2">💡 {sport.tip}</span>
        </span>
        <span className="hidden sm:inline-flex shrink-0 items-center gap-2 bg-corail text-white rounded-full px-5 py-2 text-lg font-bold">C’est parti ➜</span>
      </motion.button>
      <div className="flex justify-end -mt-2 mb-4">
        <button onClick={() => (soundEffects.playPop(), onSportHub())} className="text-sm font-semibold text-doux underline underline-offset-4 decoration-2 px-2 py-1">
          🌱 Tous les défis, mini-défis et essentiels ➜
        </button>
      </div>

      {/* Vidéo du jour : la grande tuile */}
      <motion.button
        custom={1}
        variants={tile}
        initial="hidden"
        animate="show"
        whileHover="hover"
        whileTap={TAP}
        onClick={(e) => {
          soundEffects.playPop();
          const p = pointOf(e);
          burst(p.x, p.y, [featured.emoji, '🎬', '⭐', '✨'], 9);
          onFeatured();
        }}
        className="sticker w-full rounded-[2rem] bg-corail text-white p-6 sm:p-8 text-left relative overflow-hidden mb-1"
      >
        {/* Décor animé du thème de la vidéo */}
        <ThemeScene theme={(featured.category as SceneTheme | undefined) ?? sceneFor(featured.title, 'journal')} />
        <motion.span variants={wiggle} className="absolute right-2 bottom-2" aria-hidden>
          <AnimalMascot animal={mascotForScene((featured.category as SceneTheme | undefined) ?? sceneFor(featured.title, 'journal'))} size={88} />
        </motion.span>
        <span className="relative inline-block bg-white/25 rounded-full px-3 py-1 text-sm font-semibold mb-3">🎬 {featured.title === today.title ? 'Le journal du jour' : 'Ta vidéo surprise'}</span>
        <span className="relative block text-2xl sm:text-3xl font-bold leading-tight max-w-[85%]">{featured.title}</span>
        {/* Aperçu : ce que raconte le journal aujourd'hui */}
        <span className="mt-3 grid gap-1.5 max-w-[92%]">
          {journalSummary(featured, profile.name).map((s, i) => (
            <span key={i} className="flex items-start gap-2 bg-white/15 rounded-2xl px-3 py-1.5">
              <span className="text-xl leading-tight shrink-0" aria-hidden>
                {s.emoji}
              </span>
              <span className="text-sm sm:text-base font-medium leading-snug">{s.text}</span>
            </span>
          ))}
        </span>
        <span className="mt-4 inline-flex items-center gap-2 bg-white text-corail rounded-full px-5 py-2 text-lg font-bold">▶ Regarder</span>
        <span className="relative block mt-2 text-sm font-semibold opacity-90">Puis les autres vidéos s’enchaînent</span>
      </motion.button>
      <div className="flex justify-end mb-4">
        <button onClick={(e) => open('video', e, ['🎬', '⭐'])} className="text-sm font-semibold text-doux underline underline-offset-4 decoration-2 px-2 py-1">
          🎬 Toutes les vidéos et le journal ➜
        </button>
      </div>

      {/* Les 3 bibliothèques */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {small.map((s, i) => {
          const st = SECTION_STYLE[s];
          const c = counts[s];
          return (
            <motion.button
              key={s}
              custom={i + 2}
              variants={tile}
              initial="hidden"
              animate="show"
              whileHover="hover"
              whileTap={TAP}
              onClick={(e) => open(s, e, [st.emoji, '✨', '⭐'])}
              className={`sticker relative rounded-[2rem] ${st.strong} ${s === 'soir' || s === 'activites' ? 'text-white' : 'text-encre'} p-5 text-left flex sm:flex-col items-center sm:items-start gap-4`}
            >
              <motion.span variants={wiggle} className="relative text-5xl sm:text-6xl inline-block" aria-hidden>
                {st.emoji}
                {kawaii && <KawaiiFace className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-10" color={s === 'contes' ? '#47386b' : '#ffffff'} />}
              </motion.span>
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

      {/* Apprendre à lire : 200 textes et poèmes */}
      <motion.button
        custom={5}
        variants={tile}
        initial="hidden"
        animate="show"
        whileHover="hover"
        whileTap={TAP}
        onClick={(e) => {
          soundEffects.playPop();
          const p = pointOf(e);
          burst(p.x, p.y, ['📚', '🔤', '⭐'], 8);
          onLire();
        }}
        className="sticker w-full rounded-[2rem] bg-ciel text-white p-5 mt-4 text-left flex items-center gap-4"
      >
        <motion.span variants={wiggle} className="text-6xl leading-none" aria-hidden>
          📚
        </motion.span>
        <span className="flex-1">
          <span className="block text-2xl font-bold leading-tight">Apprendre à lire</span>
          <span className="block opacity-90 font-medium">
            {lireCount.total} textes et poèmes à lire ou à écouter {lireCount.done > 0 ? `· ${lireCount.done} ✓` : ''}
          </span>
        </span>
        <span className="hidden sm:inline-flex bg-white text-ciel rounded-full px-4 py-2 font-bold">Lire ➜</span>
      </motion.button>

      {/* Les bonnes habitudes, en première page */}
      <div className="mt-6">
        <Habitudes day={today.date} />
      </div>

      <footer className="text-center text-sm text-doux mt-10">Pulse Kids • sans publicité • ton prénom reste sur cet appareil</footer>
    </main>
  );
}
