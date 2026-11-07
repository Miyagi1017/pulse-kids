import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { Onboarding } from './components/Onboarding';
import { Home } from './components/Home';
import { Library } from './components/Library';
import { TaleReader } from './components/TaleReader';
import { ActivityPlayer } from './components/ActivityPlayer';
import { VideoPlayer } from './components/DailyVideo';
import { buildPlaylist, TODAY_ID } from './lib/playlist';
import { VIDEO_THEMES } from './data/videos';
import type { Section } from './components/ui';
import { CONTES } from './data/contes';
import { CONTES_DU_SOIR } from './data/contesDuSoir';
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
  | { name: 'activity'; id: string };

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

  const playlist = useMemo(() => buildPlaylist(today), [today]);

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
      <Onboarding
        initial={profile}
        onDone={(p) => {
          setProfile(p);
          home();
        }}
      />
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
        view.section === 'activites' ? ACTIVITES : (view.section === 'contes' ? CONTES : CONTES_DU_SOIR).map((t) => ({ ...t, image: illustrationFor(t.id) }));
      screen = (
        <Library
          section={view.section}
          items={items}
          done={done}
          categories={view.section === 'activites' ? CATEGORY_INFO : undefined}
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
          today={today}
          counts={counts}
          offline={!online}
          onOpen={(s: Section) => setView(s === 'video' ? { name: 'video' } : { name: 'library', section: s })}
          onEditProfile={() => setView({ name: 'profile' })}
        />
      );
  }

  const viewKey = view.name === 'tale' || view.name === 'activity' ? `${view.name}-${'id' in view ? view.id : ''}` : view.name === 'library' ? `lib-${view.section}` : view.name;

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait">
        <motion.div key={viewKey} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          {screen}
        </motion.div>
      </AnimatePresence>
    </MotionConfig>
  );
}
