import { useState } from 'react';
import { motion } from 'motion/react';
import { conseilDuJour, HABITUDES } from '../data/programmes';
import { speakFrenchText, stopSpeaking } from '../utils/soundEffects';
import { PRESS, SPRING_SOFT } from '../lib/motion';

/** Les bonnes habitudes d'un enfant qui grandit : une tuile par habitude, lue à voix haute quand on la touche. */
export function Habitudes({ day }: { day: string }) {
  const conseil = conseilDuJour(day);
  const [speaking, setSpeaking] = useState<string | null>(null);
  const say = (key: string, text: string) => {
    if (speaking === key) {
      stopSpeaking();
      setSpeaking(null);
      return;
    }
    setSpeaking(key);
    speakFrenchText(text, { rate: 0.9, pitch: 1.1, onEnd: () => setSpeaking(null), onError: () => setSpeaking(null) });
  };

  return (
    <section aria-labelledby="habitudes-title" className="mb-4">
      <h2 id="habitudes-title" className="text-2xl font-bold mb-3">
        🌱 Les bonnes habitudes
      </h2>
      {/* Le conseil du jour : change chaque jour, lu à voix haute */}
      <motion.button
        whileTap={PRESS}
        onClick={() => say('conseil', `Le conseil du jour. ${conseil.text}`)}
        className={`sticker w-full rounded-3xl p-4 mb-3 flex items-center gap-4 text-left ${speaking === 'conseil' ? 'bg-ciel text-white' : 'bg-soleil-clair'}`}
        aria-label={`Le conseil du jour : ${conseil.text}`}
      >
        <span className="text-5xl shrink-0" aria-hidden>
          {conseil.emoji}
        </span>
        <span className="flex-1">
          <span className="block text-sm font-bold opacity-80">💡 Le conseil du jour</span>
          <span className="block text-lg font-semibold leading-snug">{conseil.text}</span>
        </span>
        <span className="text-2xl shrink-0" aria-hidden>
          🔊
        </span>
      </motion.button>
      <ul className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {HABITUDES.map((h, i) => (
          <motion.li key={h.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING_SOFT, delay: 0.3 + i * 0.05 }}>
            <motion.button
              whileTap={PRESS}
              onClick={() => say(h.title, `${h.title}. ${h.text}`)}
              className={`sticker w-full h-full rounded-3xl p-3 flex flex-col items-center gap-1 text-center ${speaking === h.title ? 'bg-ciel text-white' : 'bg-white'}`}
              aria-label={`${h.title} : ${h.text}`}
            >
              <span className="text-4xl" aria-hidden>
                {h.emoji}
              </span>
              <span className="font-bold leading-tight">{h.title}</span>
              <span className={`text-xs leading-snug ${speaking === h.title ? 'opacity-90' : 'text-doux'}`}>{h.text}</span>
            </motion.button>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
