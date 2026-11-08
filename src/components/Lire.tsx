import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Check, Play, Square } from 'lucide-react';
import { LECTURES, NIVEAUX, type Lecture, type Niveau } from '../data/lectures';
import { personalize } from '../data/format';
import { definitionOf } from '../data/dictionnaire';
import { soundEffects, speakFrenchText, stopSpeaking } from '../utils/soundEffects';
import { LIFT, PRESS, SPRING_SOFT } from '../lib/motion';
import { TopBar } from './ui';
import { burst, pointOf } from './fx';

/** Liste des 200 textes, par niveau. */
export function LireLibrary({ done, onBack, onPick }: { done: Set<string>; onBack: () => void; onPick: (id: string) => void }) {
  const [niveau, setNiveau] = useState<Niveau>(1);
  const list = LECTURES.filter((l) => l.niveau === niveau);
  return (
    <div className="min-h-dvh">
      <TopBar title="Apprendre à lire" emoji="📚" onBack={onBack} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pb-10 pt-2">
        <div className="flex gap-2 overflow-x-auto pb-3 mb-2 -mx-4 px-4" role="tablist" aria-label="Niveaux">
          {([1, 2, 3] as Niveau[]).map((n) => (
            <button
              key={n}
              role="tab"
              aria-selected={niveau === n}
              onClick={() => {
                soundEffects.playPop();
                setNiveau(n);
              }}
              className={`press shrink-0 rounded-full px-4 py-2 font-semibold whitespace-nowrap ${niveau === n ? 'bg-ciel text-white shadow-bonbon' : 'bg-white text-encre'}`}
            >
              {NIVEAUX[n].emoji} {NIVEAUX[n].label}
            </button>
          ))}
        </div>
        <p className="text-doux mb-4">
          {NIVEAUX[niveau].hint} {list.filter((l) => done.has(l.id)).length} sur {list.length} déjà lus.
        </p>
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {list.map((l, i) => (
            <motion.li key={l.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 16) * 0.02 }}>
              <motion.button whileHover={LIFT} whileTap={PRESS} onClick={() => (soundEffects.playPop(), onPick(l.id))} className="relative w-full h-full rounded-3xl bg-white shadow-bonbon p-4 text-left flex flex-col gap-2">
                {done.has(l.id) && (
                  <span className="absolute top-2 right-2 w-7 h-7 rounded-full bg-menthe text-white flex items-center justify-center" aria-label="Déjà lu">
                    <Check className="w-4 h-4" strokeWidth={3} />
                  </span>
                )}
                <span className="w-14 h-14 rounded-2xl bg-ciel-clair flex items-center justify-center text-3xl" aria-hidden>
                  {l.emoji}
                </span>
                <span className="font-semibold leading-snug">{l.title}</span>
              </motion.button>
            </motion.li>
          ))}
        </ul>
      </main>
    </div>
  );
}

interface Token {
  word: string; // tel qu'affiché (avec la ponctuation)
  spoken: string; // sans ponctuation, pour le lire seul
  line: number;
  start: number; // position dans le texte complet lu par la voix
}

/** Découpe le texte en mots, en gardant leur position dans la phrase lue à voix haute. */
function tokenize(lines: string[]): { text: string; tokens: Token[] } {
  const tokens: Token[] = [];
  let text = '';
  lines.forEach((line, li) => {
    for (const word of line.split(/\s+/).filter(Boolean)) {
      if (text) text += ' ';
      tokens.push({ word, spoken: word.replace(/[«»"“”.,!?;:…]/g, ''), line: li, start: text.length });
      text += word;
    }
  });
  return { text, tokens };
}

/**
 * Lecteur : grosses lettres, chaque mot s'allume pendant que la voix lit (« Écouter »),
 * ou l'enfant lit seul et touche un mot pour l'entendre (« Je lis »).
 */
export function LireReader({ lecture, name, onBack, onDone, onNext }: { lecture: Lecture; name: string; onBack: () => void; onDone: () => void; onNext: () => void }) {
  const lines = useMemo(() => lecture.lines.map((l) => personalize(l, name)), [lecture, name]);
  const { text, tokens } = useMemo(() => tokenize(lines), [lines]);
  const [current, setCurrent] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [finished, setFinished] = useState(false);
  const [def, setDef] = useState<{ word: string; emoji: string; text: string } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const gotBoundary = useRef(false);

  const stop = () => {
    clearTimeout(timer.current);
    stopSpeaking();
    setPlaying(false);
    setCurrent(-1);
  };
  useEffect(() => () => stop(), []); // eslint-disable-line react-hooks/exhaustive-deps

  const finish = () => {
    clearTimeout(timer.current);
    setPlaying(false);
    setCurrent(-1);
    setFinished(true);
    soundEffects.playStarChime();
    onDone();
  };

  /** Repli si la voix ne signale pas les mots : on avance au rythme moyen d'une lecture lente. */
  const stepByTime = (i: number) => {
    if (i >= tokens.length) return;
    setCurrent(i);
    const w = tokens[i].word;
    const pause = /[.!?…]$/.test(w) ? 450 : /[,;:]$/.test(w) ? 220 : 0;
    timer.current = setTimeout(() => stepByTime(i + 1), 120 + w.length * 70 + pause);
  };

  const listen = () => {
    if (playing) return stop();
    soundEffects.playPop();
    setPlaying(true);
    setFinished(false);
    gotBoundary.current = false;
    speakFrenchText(text, {
      rate: 0.8,
      pitch: 1.05,
      onWord: (_w, charIndex) => {
        gotBoundary.current = true;
        clearTimeout(timer.current);
        let idx = 0;
        for (let i = 0; i < tokens.length; i++) if (tokens[i].start <= charIndex) idx = i;
        setCurrent(idx);
      },
      onEnd: finish,
      onError: () => {
        clearTimeout(timer.current);
        setPlaying(false);
        setCurrent(-1);
      }
    });
    // Certaines voix (souvent celles en ligne) ne signalent pas les mots : on suit alors le temps.
    timer.current = setTimeout(() => {
      if (!gotBoundary.current) stepByTime(0);
    }, 700);
  };

  /** Toucher un mot : on l'entend ; s'il est dans le dictionnaire, on explique aussi ce qu'il veut dire. */
  const sayWord = (i: number, e: React.MouseEvent<HTMLButtonElement>) => {
    if (playing) stop();
    const p = pointOf(e);
    burst(p.x, p.y, ['✨'], 4);
    setCurrent(i);
    const d = definitionOf(tokens[i].word);
    setDef(d);
    const text = d ? `${tokens[i].spoken}. ${d.text}` : tokens[i].spoken;
    speakFrenchText(text, { rate: d ? 0.88 : 0.75, pitch: 1.05, onEnd: () => setCurrent(-1) });
  };
  const hasDef = useMemo(() => tokens.map((t) => definitionOf(t.word) !== null), [tokens]);

  const big = lecture.niveau === 1 ? 'text-4xl sm:text-5xl' : lecture.niveau === 2 ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl';

  return (
    <div className="min-h-dvh flex flex-col">
      <TopBar title={lecture.title} emoji={lecture.emoji} onBack={onBack} />
      <main className="flex-1 max-w-3xl w-full mx-auto px-5 py-6 flex flex-col items-center gap-6">
        <span className="rounded-full bg-white shadow-bonbon px-4 py-1.5 font-semibold text-doux">
          {NIVEAUX[lecture.niveau].emoji} {NIVEAUX[lecture.niveau].label}
        </span>
        <div className="text-7xl" aria-hidden>
          {lecture.emoji}
        </div>

        {/* Le texte : chaque mot est un bouton (le toucher le fait lire) */}
        <div className={`w-full rounded-[2rem] bg-white shadow-bonbon p-6 sm:p-8 ${big} font-semibold leading-relaxed ${lecture.niveau === 3 ? 'text-center' : ''}`} lang="fr">
          {lines.map((_, li) => (
            <p key={li} className="mb-2 last:mb-0">
              {tokens.map((t, i) =>
                t.line === li ? (
                  <motion.button
                    key={i}
                    onClick={(e) => sayWord(i, e)}
                    animate={{ scale: current === i ? 1.08 : 1 }}
                    transition={SPRING_SOFT}
                    className={`inline-block rounded-xl px-1 mx-0.5 my-0.5 transition-colors ${current === i ? 'bg-soleil text-encre' : 'hover:bg-ciel-clair'} ${hasDef[i] ? 'underline decoration-dotted decoration-ciel decoration-[3px] underline-offset-[6px]' : ''}`}
                  >
                    {t.word}
                  </motion.button>
                ) : null
              )}
            </p>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <motion.button whileTap={PRESS} onClick={listen} className={`shadow-bonbon px-7 py-4 rounded-2xl text-xl font-bold flex items-center gap-2 ${playing ? 'bg-white text-corail' : 'bg-corail text-white'}`}>
            {playing ? <Square className="w-6 h-6" /> : <Play className="w-6 h-6" />} {playing ? 'Stop' : '🔊 Écouter'}
          </motion.button>
          <motion.button whileTap={PRESS} onClick={(e) => (burst(pointOf(e).x, pointOf(e).y, ['⭐', '📖', '✨'], 8), finish())} className="shadow-bonbon px-6 py-4 rounded-2xl bg-menthe text-white text-xl font-bold">
            📖 J’ai lu tout seul !
          </motion.button>
        </div>
        <p className="text-doux text-center">Touche un mot pour l’entendre. Les mots soulignés en pointillés ont une explication.</p>

        {/* Bulle d'explication du mot touché */}
        {def && (
          <motion.div
            key={def.word}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={SPRING_SOFT}
            className="w-full rounded-3xl bg-ciel-clair shadow-bonbon p-4 flex items-start gap-4"
            role="note"
          >
            <span className="text-5xl shrink-0" aria-hidden>
              {def.emoji}
            </span>
            <span className="flex-1">
              <span className="block text-sm font-bold text-ciel uppercase tracking-wide">Le mot « {def.word} »</span>
              <span className="block text-xl font-semibold leading-snug">{def.text}</span>
            </span>
            <button onClick={() => setDef(null)} className="text-doux text-2xl leading-none px-2" aria-label="Fermer l’explication">
              ×
            </button>
          </motion.div>
        )}

        {finished && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={SPRING_SOFT} className="flex flex-col items-center gap-3">
            <p className="text-2xl font-bold text-menthe">Bravo {name} ! ⭐</p>
            <button onClick={onNext} className="press shadow-bonbon px-8 py-4 rounded-2xl bg-ciel text-white text-xl font-bold">
              Texte suivant ➜
            </button>
          </motion.div>
        )}
      </main>
    </div>
  );
}
