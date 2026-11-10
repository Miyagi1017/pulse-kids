import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, Pause, Play, RotateCcw, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { EXPLICATIONS, EXPLAIN_THEMES, explicationOfTheDay, type Explication, type ExplainTheme } from '../data/explications';
import { AGE_INFO, narrationRate, stepText, type AgeBand } from '../lib/age';
import { personalize } from '../data/format';
import { BigQuiz } from './Quiz';
import { ExplainAnim } from './ExplainAnim';
import { TopBar } from './ui';
import { burst, pointOf } from './fx';
import { soundEffects, speakFrenchText, stopSpeaking } from '../utils/soundEffects';
import { PRESS } from '../lib/motion';

/**
 * L'espace « Explications animées » : une grande question d'enfant, une réponse en 3 étapes
 * dessinées et animées, puis une petite question pour vérifier qu'on a compris.
 * Tout est embarqué : ça marche sans réseau, et l'âge (5–6 / 7–8) choisit la longueur des textes
 * et la vitesse de la voix.
 */

const THEME_BG: Record<ExplainTheme, string> = {
  ciel: 'bg-ciel-clair',
  terre: 'bg-soleil-clair',
  nature: 'bg-menthe-clair',
  corps: 'bg-rose-clair',
  technique: 'bg-lavande-clair'
};

/* ------------------------------------------------------------------ */
/* La liste                                                           */
/* ------------------------------------------------------------------ */

export function ExplicationsList({ done, age, onBack, onPick }: { done: Set<string>; age: AgeBand; onBack: () => void; onPick: (id: string) => void }) {
  const [theme, setTheme] = useState<ExplainTheme | null>(null);
  const today = explicationOfTheDay(new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(new Date()));
  const items = theme ? EXPLICATIONS.filter((e) => e.theme === theme) : EXPLICATIONS;
  const present = (Object.keys(EXPLAIN_THEMES) as ExplainTheme[]).filter((t) => EXPLICATIONS.some((e) => e.theme === t));
  const doneCount = EXPLICATIONS.filter((e) => done.has(e.id)).length;

  const pick = (id: string, e?: MouseEvent<Element>) => {
    soundEffects.playPop();
    if (e) {
      const p = pointOf(e);
      burst(p.x, p.y, ['💡', '✨', '⭐'], 8);
    }
    onPick(id);
  };

  return (
    <div className="min-h-dvh">
      <TopBar title="Les explications" emoji="💡" onBack={onBack} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pb-10 pt-2">
        <p className="text-doux mb-4">
          {doneCount > 0 ? `${doneCount} sur ${EXPLICATIONS.length} déjà comprises. ` : ''}
          Une grande question, une réponse en <strong>3 étapes animées</strong>, et une petite question à la fin.
        </p>

        {/* La question du jour */}
        <motion.button
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={PRESS}
          onClick={(e) => pick(today.id, e)}
          className="sticker press w-full rounded-[2rem] bg-white p-4 sm:p-5 mb-5 text-left flex items-center gap-4 relative overflow-hidden"
        >
          <span className={`shrink-0 w-28 sm:w-36 h-28 sm:h-36 rounded-2xl ${THEME_BG[today.theme]} overflow-hidden`}>
            <ExplainAnim anim={today.anim} className="w-full h-full" />
          </span>
          <span className="flex-1 min-w-0">
            <span className="inline-block bg-ciel-clair text-ciel rounded-full px-3 py-1 text-sm font-bold mb-2">🌟 La question du jour</span>
            <span className="block text-xl sm:text-2xl font-bold leading-tight">{today.question}</span>
            <span className="block mt-1 font-medium text-doux">
              {EXPLAIN_THEMES[today.theme].emoji} {EXPLAIN_THEMES[today.theme].label} · {today.steps.length} étapes à découvrir
            </span>
          </span>
        </motion.button>

        {/* Filtres par thème */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-2 -mx-4 px-4" role="tablist" aria-label="Thèmes">
          {[null, ...present].map((t) => {
            const active = theme === t;
            const info = t ? EXPLAIN_THEMES[t] : { label: 'Tout mélangé', emoji: '🎲' };
            return (
              <button
                key={t ?? 'all'}
                role="tab"
                aria-selected={active}
                onClick={() => {
                  soundEffects.playPop();
                  setTheme(t);
                }}
                className={`press shrink-0 rounded-full px-4 py-2 font-semibold whitespace-nowrap ${active ? 'bg-ciel text-white shadow-bonbon' : 'bg-white text-encre'}`}
              >
                {info.emoji} {info.label}
              </button>
            );
          })}
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {items.map((e, i) => (
            <motion.li key={e.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 10) * 0.04 }}>
              <button onClick={(ev) => pick(e.id, ev)} className="press shadow-bonbon relative w-full h-full rounded-3xl bg-white p-3 text-left flex items-center gap-3">
                {done.has(e.id) && (
                  <span className="absolute top-2 right-2 w-7 h-7 rounded-full bg-menthe text-white text-sm font-bold flex items-center justify-center" aria-label="Déjà comprise">
                    ✓
                  </span>
                )}
                <span className={`shrink-0 w-20 h-20 rounded-2xl ${THEME_BG[e.theme]} overflow-hidden`}>
                  <ExplainAnim anim={e.anim} className="w-full h-full" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-xs font-bold text-doux">
                    {EXPLAIN_THEMES[e.theme].emoji} {EXPLAIN_THEMES[e.theme].label}
                  </span>
                  <span className="block font-semibold leading-snug">{e.question}</span>
                  <span className="block text-sm text-doux mt-0.5">{e.title}</span>
                </span>
              </button>
            </motion.li>
          ))}
        </ul>

        <p className="text-center text-sm text-doux mt-8">💡 {EXPLICATIONS.length} questions, {EXPLICATIONS.length * 3} étapes animées • explications adaptées {AGE_INFO[age].label}</p>
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Le lecteur d'une explication                                       */
/* ------------------------------------------------------------------ */

type Phase = 'steps' | 'quiz' | 'done';

export function ExplicationPlayer({
  explication,
  name,
  age,
  onBack,
  onDone,
  onNext
}: {
  explication: Explication;
  name: string;
  age: AgeBand;
  onBack: () => void;
  onDone: () => void;
  onNext: () => void;
}) {
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<Phase>('steps');
  const [playing, setPlaying] = useState(true);
  const [tick, setTick] = useState(0);
  const [showMore, setShowMore] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const current = explication.steps[step];
  const isLast = step === explication.steps.length - 1;
  const spoken = personalize(stepText(current, age), name);
  const more = current.more ? personalize(current.more, name) : '';

  // La voix raconte l'étape, puis la suivante s'enchaîne doucement.
  useEffect(() => {
    if (phase !== 'steps') return;
    clearTimeout(timer.current);
    if (!playing) return;
    let cancelled = false;
    const after = () => {
      if (cancelled) return;
      timer.current = setTimeout(() => {
        if (cancelled) return;
        if (isLast) setPhase('quiz');
        else setStep((s) => s + 1);
      }, 3200);
    };
    speakFrenchText(`${current.title}. ${spoken}`, { rate: narrationRate(age), pitch: AGE_INFO[age].pitch, onEnd: after, onError: after });
    if (!('speechSynthesis' in window)) after();
    return () => {
      cancelled = true;
      clearTimeout(timer.current);
      stopSpeaking();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, phase, playing, tick, age, spoken, current.title, isLast]);

  useEffect(() => () => stopSpeaking(), []);

  const goTo = (i: number) => {
    soundEffects.playWhoosh();
    stopSpeaking();
    clearTimeout(timer.current);
    setShowMore(false);
    setStep(i);
    setPlaying(true);
  };

  const startQuiz = () => {
    soundEffects.playSparkle();
    stopSpeaking();
    clearTimeout(timer.current);
    setPhase('quiz');
  };

  const solved = () => {
    confetti({ particleCount: 90, spread: 90, origin: { y: 0.6 } });
    soundEffects.playStarChime();
    onDone();
    setPhase('done');
  };

  const restart = () => {
    stopSpeaking();
    setStep(0);
    setPhase('steps');
    setShowMore(false);
    setPlaying(true);
  };

  return (
    <div className="min-h-dvh flex flex-col">
      <TopBar
        title={explication.title}
        emoji={explication.emoji}
        onBack={onBack}
        right={
          <span className="hidden sm:inline rounded-full bg-white shadow-bonbon px-3 py-1.5 text-sm font-semibold text-doux">
            {AGE_INFO[age].emoji} {AGE_INFO[age].label}
          </span>
        }
      />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 pb-8 flex flex-col gap-3">
        <div className="flex justify-center">
          <p className="inline-block rounded-2xl bg-white/90 px-4 py-1.5 text-lg sm:text-xl font-bold text-center text-encre shadow-sm">
            <span aria-hidden>❓</span> {explication.question}
          </p>
        </div>

        <div className={`rounded-[2rem] p-3 sm:p-4 shadow-bonbon ${THEME_BG[explication.theme]}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${phase}-${step}`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.22 }}
            >
              {phase === 'steps' && (
                <div className="rounded-[1.6rem] bg-white/75 p-3 sm:p-4">
                  <div className="mx-auto w-full max-w-[18rem] aspect-square">
                    <ExplainAnim anim={explication.anim} className="w-full h-full" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold mt-2 text-center">
                    <span aria-hidden className="mr-1">
                      {current.emoji}
                    </span>
                    {current.title}
                  </h2>
                  <p className="text-lg sm:text-xl leading-snug mt-2 text-center" aria-live="polite">
                    {personalize(current.text, name)}
                  </p>

                  {more &&
                    (age === 'grand' ? (
                      <p className="mt-3 rounded-2xl bg-ciel-clair/80 px-4 py-3 text-base leading-snug">🔎 {more}</p>
                    ) : (
                      <div className="mt-3 text-center">
                        <button
                          onClick={() => {
                            soundEffects.playPop();
                            if (!showMore) speakFrenchText(more, { rate: narrationRate(age), pitch: AGE_INFO[age].pitch });
                            setShowMore((v) => !v);
                          }}
                          className="press rounded-full bg-ciel-clair text-ciel px-4 py-2 font-bold text-sm"
                          aria-expanded={showMore}
                        >
                          💡 {AGE_INFO[age].moreLabel}
                        </button>
                        {showMore && (
                          <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mt-2 rounded-2xl bg-white px-4 py-3 text-base leading-snug">
                            {more}
                          </motion.p>
                        )}
                      </div>
                    ))}
                </div>
              )}

              {phase === 'quiz' && (
                <div className="rounded-[1.6rem] bg-white p-4 sm:p-5">
                  <div className="flex items-center gap-2 justify-center mb-2">
                    <span className={`w-12 h-12 rounded-2xl ${THEME_BG[explication.theme]} overflow-hidden shrink-0`}>
                      <ExplainAnim anim={explication.anim} className="w-full h-full" />
                    </span>
                    <p className="text-sm font-bold text-doux uppercase tracking-wide">Et toi, tu as compris ?</p>
                  </div>
                  <BigQuiz quiz={explication.quiz} tone="light" onSolved={solved} />
                </div>
              )}

              {phase === 'done' && (
                <div className="rounded-[1.6rem] bg-white p-4 sm:p-5 text-center">
                  <div className="text-6xl" aria-hidden>
                    🏅
                  </div>
                  <h2 className="text-2xl font-bold mt-1">Bravo {name} !</h2>
                  <p className="mt-3 rounded-2xl bg-menthe-clair px-4 py-3 text-lg font-semibold">📌 {explication.retiens}</p>
                  <p className="mt-3 rounded-2xl bg-soleil-clair px-4 py-3 text-left">🧪 <strong>À toi d’essayer :</strong> {explication.experience}</p>
                  <div className="flex flex-wrap justify-center gap-3 mt-4">
                    <button onClick={restart} className="press shadow-bonbon bg-white border-4 border-creme px-5 py-3 rounded-2xl text-lg font-bold flex items-center gap-2">
                      <RotateCcw className="w-5 h-5" /> Revoir
                    </button>
                    <button onClick={onNext} className="press shadow-bonbon bg-ciel text-white px-5 py-3 rounded-2xl text-lg font-bold">
                      Explication suivante ➜
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {phase === 'steps' && (
          <>
            <div className="flex gap-1.5" aria-label={`Étape ${step + 1} sur ${explication.steps.length}`}>
              {explication.steps.map((_, i) => (
                <span key={i} className="h-2.5 flex-1 rounded-full bg-encre/10 overflow-hidden">
                  <span className={`block h-full bg-ciel transition-all duration-500 ${i < step ? 'w-full' : i === step ? 'w-1/2' : 'w-0'}`} />
                </span>
              ))}
            </div>

            <nav className="flex items-center justify-center gap-4" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
              <button onClick={() => goTo(Math.max(0, step - 1))} disabled={step === 0} className="press shadow-bonbon w-14 h-14 rounded-full bg-white flex items-center justify-center disabled:opacity-30" aria-label="Étape précédente">
                <ArrowLeft className="w-6 h-6" strokeWidth={3} />
              </button>
              <button
                onClick={() => {
                  if (playing) soundEffects.playPop();
                  setPlaying((p) => !p);
                }}
                className="press shadow-bonbon w-16 h-16 rounded-full bg-ciel text-white flex items-center justify-center"
                aria-label={playing ? 'Mettre en pause' : 'Écouter'}
              >
                {playing ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-0.5" />}
              </button>
              <button
                onClick={() => {
                  soundEffects.playSparkle();
                  setTick((t) => t + 1);
                }}
                className="press shadow-bonbon w-14 h-14 rounded-full bg-white flex items-center justify-center"
                aria-label="Écouter encore"
              >
                <Volume2 className="w-6 h-6" />
              </button>
              {isLast ? (
                <button onClick={startQuiz} className="press shadow-bonbon h-14 px-5 rounded-2xl bg-menthe text-white text-lg font-bold">
                  Et toi ? ➜
                </button>
              ) : (
                <button onClick={() => goTo(step + 1)} className="press shadow-bonbon h-14 px-5 rounded-2xl bg-white text-encre text-lg font-bold">
                  Suivant ➜
                </button>
              )}
            </nav>
          </>
        )}

        {phase === 'quiz' && (
          <button onClick={() => setPhase('steps')} className="press self-center rounded-full bg-white px-5 py-2.5 font-semibold text-doux shadow-bonbon">
            ↩ Revoir l’explication
          </button>
        )}
      </main>
    </div>
  );
}

/** Petite aide : l'explication qui correspond à un identifiant (jamais d'écran vide). */
export function safeExplication(id: string): Explication {
  return EXPLICATIONS.find((e) => e.id === id) ?? EXPLICATIONS[0];
}
