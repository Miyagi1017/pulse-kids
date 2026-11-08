import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { Onboarding } from './components/Onboarding';
import { Home } from './components/Home';
import { Library } from './components/Library';
import { TaleReader } from './components/TaleReader';
import { ActivityPlayer } from './components/ActivityPlayer';
import { VideoPlayer } from './components/DailyVideo';
import { JamyLinks } from './components/JamyLinks';
import { BurstLayer } from './components/fx';
import { Backdrop } from './components/Backdrop';
import { kawaiiScene, useTheme } from './lib/theme';
import { SportPlayer } from './components/SportPlayer';
import { SPORT_TIPS, sportOfTheDay } from './data/sport';
import { SportHub } from './components/SportHub';
import { ESSENTIELS, isEssential } from './data/programmes';
import { MINI_DEFIS, isMiniDefi } from './data/miniDefis';
import { MiniDefis } from './components/MiniDefis';
import { WUSHU, isWushu } from './data/wushu';
import { PHYSIQUES, isPhysique } from './data/physiques';
import { ActivitesPhysiques } from './components/ActivitesPhysiques';
import { LireLibrary, LireReader } from './components/Lire';
import { LECTURES } from './data/lectures';
import { AventureScene, AventuresList } from './components/Aventures';
import { AVENTURES } from './data/aventures';
import { buildPlaylist, TODAY_ID } from './lib/playlist';
import { FACTS } from '../shared/dailyContent';
import { sceneFor, ThemeScene } from './components/ThemeScene';
import { VIDEO_THEMES } from './data/videos';
import type { Section } from './components/ui';
import { CONTES as CONTES_PULSE } from './data/contes';
import { CLASSIQUES } from './data/classiques';

/** Les contes de journée : les grands classiques d'abord, puis les contes Pulse Kids. */
const CONTES = [...CLASSIQUES, ...CONTES_PULSE];
const CONTES_CATEGORIES = { classiques: { label: 'Les grands classiques', emoji: '📜' }, pulse: { label: 'Les contes Pulse Kids', emoji: '✨' } };
import { CONTES_DU_SOIR } from './data/contesDuSoir';
import { personalize } from './data/format';
import { ACTIVITES, CATEGORY_INFO } from './data/activites';
import { illustrationFor } from './data/illustrations';
import { purgeLegacyStorage, useDone, useProfile } from './lib/profile';
import { cachedToday, fetchToday } from './lib/today';
import { stopSpeaking } from './utils/soundEffects';
import type { Today } from '../shared/schemas';

type View =
  | { name: 'home' }
  | { name: 'profile' }
  | { name: 'video' }
  | { name: 'player'; index: number }
  | { name: 'library'; section: 'contes' | 'activites' | 'soir' }
  | { name: 'tale'; section: 'contes' | 'soir'; id: string }
  | { name: 'activity'; id: string }
  | { name: 'sportHub' }
  | { name: 'minis' }
  | { name: 'physiques' }
  | { name: 'lire' }
  | { name: 'aventures' }
  | { name: 'aventure'; id: string }
  | { name: 'lecture'; id: string }
  | { name: 'sport'; id: string; from?: 'home' };

function useOnline() {
  const [online, setOnline] = useState(() => navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  return online;
}

export default function App() {
  const { profile, setProfile } = useProfile();
  const { done, markDone } = useDone();
  const [view, setViewState] = useState<View>({ name: 'home' });
  const [today, setToday] = useState<Today>(cachedToday);
  const online = useOnline();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    purgeLegacyStorage();
    fetchToday().then((t) => t && setToday(t));
  }, []);

  const setView = (v: View) => {
    stopSpeaking();
    window.scrollTo({ top: 0 });
    setViewState(v);
  };
  const home = () => setView({ name: 'home' });

  // « Le savais-tu ? » tiré au sort à chaque chargement : le journal change à chaque visite.
  const [fact] = useState(() => FACTS[Math.floor(Math.random() * FACTS.length)]);
  const journal = useMemo(
    () => ({ ...today, scenes: today.scenes.map((s) => (s.text.startsWith('Le savais-tu') ? { ...s, emoji: fact[0], text: `Le savais-tu ? ${fact[1]}` } : s)) }),
    [today, fact]
  );
  const playlist = useMemo(() => buildPlaylist(journal), [journal]);
  // Vidéo mise en avant sur l'accueil : tirée au sort à chaque chargement (journal compris).
  const [videoPick] = useState(() => Math.random());
  const featuredIndex = Math.floor(videoPick * playlist.length);
  // Jeu surprise de l'onglet Activités : une aventure ou un jeu, tiré au sort à chaque chargement.
  const [surprisePick] = useState(() => Math.random());
  const sportToday = useMemo(() => sportOfTheDay(today.date), [today.date]);
  // Défi de l'accueil : tiré au sort à chaque chargement (défis + mini-défis), stable pendant la visite.
  const [sportPick] = useState(() => {
    const all = [...SPORT_TIPS, ...MINI_DEFIS, ...PHYSIQUES];
    return all[Math.floor(Math.random() * all.length)];
  });

  const counts = useMemo(() => {
    const c = (ids: { id: string }[]) => ({ total: ids.length, done: ids.filter((i) => done.has(i.id)).length });
    return { contes: c(CONTES), activites: c(ACTIVITES), soir: c(CONTES_DU_SOIR) };
  }, [done]);

  /** Prochain contenu de la liste (en priorité un pas encore fait). */
  const nextId = (list: { id: string }[], current: string) => {
    const start = list.findIndex((i) => i.id === current);
    for (let k = 1; k <= list.length; k++) {
      const cand = list[(start + k) % list.length];
      if (!done.has(cand.id)) return cand.id;
    }
    return list[(start + 1) % list.length].id;
  };

  if (!profile || view.name === 'profile') {
    return (
      <>
        <Backdrop theme={theme} />
        <Onboarding
          initial={profile}
          onDone={(p) => {
            setProfile(p);
            home();
          }}
        />
      </>
    );
  }

  let screen: React.ReactNode;
  switch (view.name) {
    case 'video': {
      const [journal, ...videos] = playlist;
      screen = (
        <Library
          section="video"
          items={videos.map((v) => ({ id: v.id, emoji: v.emoji, title: v.title, image: v.thumb, category: v.category }))}
          done={done}
          categories={VIDEO_THEMES}
          onBack={home}
          onPick={(id) => setView({ name: 'player', index: playlist.findIndex((p) => p.id === id) })}
          action={{ label: '▶ Tout regarder', onClick: () => setView({ name: 'player', index: 0 }) }}
          footer={(theme) => <JamyLinks theme={theme} />}
          intro={
            <button
              onClick={() => setView({ name: 'player', index: 0 })}
              className="press shadow-bonbon w-full mb-5 rounded-[2rem] bg-corail text-white p-4 sm:p-5 flex items-center gap-4 text-left"
            >
              {journal.thumb ? (
                <img src={journal.thumb} alt="" className="w-28 sm:w-36 aspect-[4/3] object-cover rounded-2xl border-4 border-white/60" />
              ) : (
                <span className="text-6xl">{journal.emoji}</span>
              )}
              <span className="flex-1">
                <span className="block text-sm font-semibold opacity-90">📰 Le journal du jour {done.has(TODAY_ID) ? '✓' : ''}</span>
                <span className="block text-xl sm:text-2xl font-bold leading-tight">{journal.title}</span>
                <span className="block mt-1 opacity-90">Puis {videos.length} vidéos à la suite ▶</span>
              </span>
            </button>
          }
        />
      );
      break;
    }
    case 'player':
      screen = <VideoPlayer playlist={playlist} startIndex={Math.max(0, view.index)} name={profile.name} onBack={() => setView({ name: 'video' })} onWatched={markDone} />;
      break;
    case 'library': {
      const items =
        view.section === 'activites'
          ? ACTIVITES
          : (view.section === 'contes' ? CONTES : CONTES_DU_SOIR).map((t) => ({ ...t, title: personalize(t.title, profile.name), image: illustrationFor(t.id), category: t.id.startsWith('classique-') ? 'classiques' : 'pulse' }));
      screen = (
        <Library
          section={view.section}
          items={items}
          done={done}
          categories={view.section === 'activites' ? CATEGORY_INFO : view.section === 'contes' ? CONTES_CATEGORIES : undefined}
          intro={
            view.section === 'activites' ? (
              <>
              {/* Jeu surprise : une aventure ou un jeu tiré au sort à chaque chargement, avec son décor animé */}
              {(() => {
                const all = [...AVENTURES.map((a) => ({ id: a.id, emoji: a.emoji, title: a.title, text: `${a.title} ${a.story}`, adv: true })), ...ACTIVITES.map((a) => ({ id: a.id, emoji: a.emoji, title: a.title, text: a.title, adv: false }))];
                const pick = all[Math.floor(surprisePick * all.length)];
                return (
                  <button
                    onClick={() => setView(pick.adv ? { name: 'aventure', id: pick.id } : { name: 'activity', id: pick.id })}
                    className="press sticker relative overflow-hidden w-full mb-4 rounded-[2rem] bg-gradient-to-r from-violet-300 to-pink-300 text-encre p-4 sm:p-5 flex items-center gap-4 text-left"
                  >
                    <ThemeScene theme={sceneFor(pick.text, 'fete')} />
                    <span className="relative text-6xl" aria-hidden>
                      🎲
                    </span>
                    <span className="relative flex-1">
                      <span className="block text-sm font-bold opacity-80">Le jeu surprise</span>
                      <span className="block text-2xl font-bold leading-tight">
                        {pick.emoji} {pick.title}
                      </span>
                      <span className="block font-medium opacity-80">{pick.adv ? 'Une aventure à explorer' : 'Un jeu à jouer'} · touche pour jouer !</span>
                    </span>
                  </button>
                );
              })()}
              <button
                onClick={() => setView({ name: 'aventures' })}
                className="press sticker w-full mb-5 rounded-[2rem] bg-gradient-to-r from-emerald-300 to-sky-300 text-encre p-4 sm:p-5 flex items-center gap-4 text-left"
              >
                <span className="text-6xl" aria-hidden>
                  🗺️
                </span>
                <span className="flex-1">
                  <span className="block text-2xl font-bold leading-tight">Les aventures à explorer</span>
                  <span className="block font-medium opacity-80">
                    {AVENTURES.length} scènes : touche les objets pour retrouver ce qui est caché ! {AVENTURES.filter((a) => done.has(a.id)).length > 0 ? `· ${AVENTURES.filter((a) => done.has(a.id)).length} ✓` : ''}
                  </span>
                </span>
              </button>
              </>
            ) : undefined
          }
          onBack={home}
          onPick={(id) => setView(view.section === 'activites' ? { name: 'activity', id } : { name: 'tale', section: view.section as 'contes' | 'soir', id })}
        />
      );
      break;
    }
    case 'tale': {
      const list = view.section === 'contes' ? CONTES : CONTES_DU_SOIR;
      const tale = list.find((t) => t.id === view.id) ?? list[0];
      screen = (
        <TaleReader
          key={tale.id}
          tale={tale}
          name={profile.name}
          onBack={() => setView({ name: 'library', section: view.section })}
          onFinished={() => markDone(tale.id)}
          onNext={() => setView({ name: 'tale', section: view.section, id: nextId(list, tale.id) })}
        />
      );
      break;
    }
    case 'sportHub':
      screen = (
        <SportHub
          daily={sportToday}
          done={done}
          onBack={home}
          onPlay={(id) => setView({ name: 'sport', id })}
          onMinis={() => setView({ name: 'minis' })}
          onPhysiques={() => setView({ name: 'physiques' })}
        />
      );
      break;
    case 'aventures':
      screen = <AventuresList done={done} onBack={() => setView({ name: 'library', section: 'activites' })} onPick={(id) => setView({ name: 'aventure', id })} />;
      break;
    case 'aventure': {
      const aventure = AVENTURES.find((a) => a.id === view.id) ?? AVENTURES[0];
      screen = (
        <AventureScene
          key={aventure.id}
          aventure={aventure}
          name={profile.name}
          onBack={() => setView({ name: 'aventures' })}
          onDone={() => markDone(aventure.id)}
          onNext={() => setView({ name: 'aventure', id: nextId(AVENTURES, aventure.id) })}
        />
      );
      break;
    }
    case 'lire':
      screen = <LireLibrary name={profile.name} done={done} onBack={home} onPick={(id) => setView({ name: 'lecture', id })} />;
      break;
    case 'lecture': {
      const lecture = LECTURES.find((l) => l.id === view.id) ?? LECTURES[0];
      const sameLevel = LECTURES.filter((l) => l.niveau === lecture.niveau);
      screen = (
        <LireReader
          key={lecture.id}
          lecture={lecture}
          name={profile.name}
          onBack={() => setView({ name: 'lire' })}
          onDone={() => markDone(lecture.id)}
          onNext={() => setView({ name: 'lecture', id: nextId(sameLevel, lecture.id) })}
        />
      );
      break;
    }
    case 'physiques':
      screen = <ActivitesPhysiques scene={kawaiiScene(theme)} done={done} onBack={() => setView({ name: 'sportHub' })} onPlay={(id) => setView({ name: 'sport', id })} />;
      break;
    case 'minis':
      screen = <MiniDefis done={done} onBack={() => setView({ name: 'sportHub' })} onPlay={(id) => setView({ name: 'sport', id })} />;
      break;
    case 'sport': {
      const essential = isEssential(view.id);
      const mini = isMiniDefi(view.id);
      const wushu = isWushu(view.id);
      const physique = isPhysique(view.id);
      const sportList = essential ? ESSENTIELS : mini ? MINI_DEFIS : wushu ? WUSHU : physique ? PHYSIQUES : SPORT_TIPS;
      const tip = sportList.find((t) => t.id === view.id) ?? sportToday;
      screen = (
        <SportPlayer
          key={tip.id}
          tip={tip}
          name={profile.name}
          onBack={() => (view.from === 'home' ? home() : setView({ name: mini ? 'minis' : physique ? 'physiques' : 'sportHub' }))}
          onDone={() => markDone(tip.id)}
          onAnother={() => setView({ name: 'sport', id: nextId(sportList, tip.id) })}
          {...(essential && { title: 'Les essentiels', headerEmoji: '🌱', anotherLabel: 'Essentiel suivant ➜' })}
          {...(mini && { title: 'Mini-défi', headerEmoji: '🎯', anotherLabel: 'Mini-défi suivant ➜' })}
          {...(physique && { title: 'Activité physique', headerEmoji: '🤸', anotherLabel: 'Activité suivante ➜', scene: kawaiiScene(theme) })}
          {...(wushu && { title: 'Le yoga des animaux', headerEmoji: '🐾', anotherLabel: 'Animal suivant ➜', rule: 'Fais de la place et bouge lentement.' })}
        />
      );
      break;
    }
    case 'activity': {
      const activity = ACTIVITES.find((a) => a.id === view.id) ?? ACTIVITES[0];
      screen = (
        <ActivityPlayer
          key={activity.id}
          activity={activity}
          name={profile.name}
          onBack={() => setView({ name: 'library', section: 'activites' })}
          onSolved={() => markDone(activity.id)}
          onNext={() => setView({ name: 'activity', id: nextId(ACTIVITES, activity.id) })}
        />
      );
      break;
    }
    default:
      screen = (
        <Home
          profile={profile}
          today={journal}
          counts={counts}
          offline={!online}
          onOpen={(s: Section) => setView(s === 'video' ? { name: 'video' } : { name: 'library', section: s })}
          onEditProfile={() => setView({ name: 'profile' })}
          sport={sportPick}
          sportDone={done.has(sportPick.id)}
          onSport={() => setView({ name: 'sport', id: sportPick.id, from: 'home' })}
          featured={playlist[featuredIndex]}
          onFeatured={() => setView({ name: 'player', index: featuredIndex })}
          onSportHub={() => setView({ name: 'sportHub' })}
          onLire={() => setView({ name: 'lire' })}
          lireCount={{ total: LECTURES.length, done: LECTURES.filter((l) => done.has(l.id)).length }}
          theme={theme}
          onTheme={setTheme}
        />
      );
  }

  const viewKey = view.name === 'tale' || view.name === 'activity' || view.name === 'sport' ? `${view.name}-${'id' in view ? view.id : ''}` : view.name === 'lecture' ? `lecture-${view.id}` : view.name === 'aventure' ? `aventure-${view.id}` : view.name === 'sportHub' ? 'hub' : view.name === 'library' ? `lib-${view.section}` : view.name;

  return (
    <MotionConfig reducedMotion="user">
      <Backdrop theme={theme} />
      <AnimatePresence mode="wait">
        <motion.div
          key={viewKey}
          initial={{ opacity: 0, y: 14, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 26 } }}
          exit={{ opacity: 0, scale: 0.99, transition: { duration: 0.15, ease: 'easeIn' } }}
        >
          {screen}
        </motion.div>
      </AnimatePresence>
      <BurstLayer />
    </MotionConfig>
  );
}
