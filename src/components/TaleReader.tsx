import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { personalize, type Tale } from '../data/format';
import { soundEffects, speakFrenchText, stopSpeaking } from '../utils/soundEffects';
import { SpeakButton, TopBar } from './ui';
import { TaleScene } from './TaleScene';
import { sceneFor, ThemeScene } from './ThemeScene';
import { Mascot } from './Mascot';
import { mascotForScene } from '../lib/mascots';

/**
 * Lecteur de conte page par page : gros emoji animé, texte large, lecture à voix haute
 * (enchaînement automatique des pages en mode écoute). Version « soir » : fond nuit,
 * voix plus lente, pas de confettis, berceuse à la fin.
 */
export function TaleReader({ tale, name, onBack, onFinished, onNext }: { tale: Tale; name: string; onBack: () => void; onFinished: () => void; onNext: () => void }) {
  const night = tale.kind === 'soir';
  const [page, setPage] = useState(0);
  const [listening, setListening] = useState(false);
  const pages = tale.pages.map((p) => personalize(p, name));
  const title = personalize(tale.title, name);
  const isEnd = page >= pages.length;
  // Décor : d'après la page en cours, sinon d'après toute l'histoire.
  const taleTheme = sceneFor(`${tale.title} ${pages.join(' ')}`, night ? 'nuit' : 'nature');
  const pageTheme = isEnd ? taleTheme : sceneFor(pages[page], taleTheme);
  const animal = night ? 'hibou' : mascotForScene(pageTheme);

  useEffect(() => () => stopSpeaking(), []);

  // Mode écoute : lit la page puis passe à la suivante toute seule.
  useEffect(() => {
    if (!listening) return;
    if (isEnd) {
      setListening(false);
      return;
    }
    const text = page === 0 ? `${title}. ${pages[0]}` : pages[page];
    speakFrenchText(text, {
      rate: night ? 0.75 : 0.88,
      pitch: night ? 1.0 : 1.12,
      onEnd: () => setTimeout(() => setPage((p) => p + 1), night ? 900 : 500),
      onError: () => setListening(false)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listening, page]);

  useEffect(() => {
    if (!isEnd) return;
    onFinished();
    if (night) {
      soundEffects.playGentleLullaby();
    } else {
      soundEffects.playFanfare();
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEnd]);

  const go = (delta: number) => {
    soundEffects.playWhoosh();
    stopSpeaking();
    setListening(false);
    soundEffects.playPop();
    setPage((p) => Math.max(0, Math.min(pages.length, p + delta)));
  };

  return (
    <div className={`min-h-dvh flex flex-col ${night ? 'bg-nuit text-white' : ''}`}>
      {/* Décor animé de la scène : la nuit pour les contes du soir, plus le thème de la page */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
        {night && <ThemeScene theme="nuit" />}
        {/* La nuit, pas de décor avec un soleil (nature, journal) : seulement la nuit */}
        {pageTheme !== 'nuit' && !(night && (pageTheme === 'nature' || pageTheme === 'journal')) && (
          <AnimatePresence mode="wait">
            <motion.div key={pageTheme} className={`absolute inset-0 ${night ? 'opacity-50' : ''}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
              <ThemeScene theme={pageTheme} />
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      <TopBar
        title={title}
        emoji={tale.emoji}
        onBack={onBack}
        dark={night}
        right={
          !isEnd && (
            <SpeakButton
              dark={night}
              speaking={listening}
              label="Écoute"
              onClick={() => {
                soundEffects.playPop();
                if (listening) {
                  stopSpeaking();
                  setListening(false);
                } else setListening(true);
              }}
            />
          )
        }
      />

      <main className="relative z-10 flex-1 max-w-2xl w-full mx-auto px-5 flex flex-col">
        <AnimatePresence mode="wait">
          {!isEnd ? (
            <motion.section
              key={page}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: night ? 0.5 : 0.3 }}
              className="flex-1 flex flex-col items-center justify-center text-center gap-6 py-4"
            >
              <TaleScene tale={tale} page={page} />
              <p className={`text-2xl sm:text-3xl leading-relaxed font-medium ${night ? 'text-white/95' : ''}`}>{pages[page]}</p>
            </motion.section>
          ) : (
            <motion.section key="fin" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center text-center gap-6 py-6">
              <div className="text-8xl" aria-hidden>
                {night ? '😴' : '🌟'}
              </div>
              <h2 className="text-4xl font-bold">{night ? `Bonne nuit, ${name} !` : `Bravo, ${name} !`}</h2>
              <p className={`text-xl ${night ? 'text-white/80' : 'text-doux'}`}>{night ? 'Fais de beaux rêves…' : 'Tu as écouté tout le conte !'}</p>
              <div className="flex flex-wrap justify-center gap-3">
                <button onClick={() => setPage(0)} className={`press shadow-bonbon px-6 py-3 rounded-2xl font-semibold ${night ? 'bg-white/15' : 'bg-white'}`}>
                  🔁 Relire
                </button>
                <button onClick={onNext} className={`press shadow-bonbon px-6 py-3 rounded-2xl font-semibold text-white ${night ? 'bg-lavande' : 'bg-menthe'}`}>
                  Un autre conte ➜
                </button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* La mascotte du thème accompagne l'histoire ; le soir, le hibou finit par s'endormir */}
        <div className="flex justify-center pb-2">
          <AnimatePresence mode="wait">
            <motion.div key={animal} initial={{ scale: 0, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0, y: 20 }} transition={{ type: 'spring', stiffness: 300, damping: 18 }}>
              <Mascot animal={animal} mood={isEnd ? (night ? 'sleep' : 'cheer') : listening ? 'talk' : 'idle'} size={92} />
            </motion.div>
          </AnimatePresence>
        </div>

        {!isEnd && (
          <nav className="flex items-center justify-between gap-4 pb-8" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
            <button onClick={() => go(-1)} disabled={page === 0} className={`press shadow-bonbon w-16 h-16 rounded-full flex items-center justify-center disabled:opacity-30 ${night ? 'bg-white/15' : 'bg-white'}`} aria-label="Page précédente">
              <ChevronLeft className="w-9 h-9" strokeWidth={3} />
            </button>
            <div className="flex gap-2" aria-label={`Page ${page + 1} sur ${pages.length}`}>
              {pages.map((_, i) => (
                <span key={i} className={`h-3 rounded-full transition-all ${i === page ? `w-8 ${night ? 'bg-white' : 'bg-soleil'}` : `w-3 ${night ? 'bg-white/30' : 'bg-encre/15'}`}`} />
              ))}
            </div>
            <button onClick={() => go(1)} className={`press shadow-bonbon w-16 h-16 rounded-full flex items-center justify-center ${night ? 'bg-lavande text-white' : 'bg-soleil text-encre'}`} aria-label="Page suivante">
              <ChevronRight className="w-9 h-9" strokeWidth={3} />
            </button>
          </nav>
        )}
      </main>
    </div>
  );
}
