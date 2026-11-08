import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ExternalLink } from 'lucide-react';
import { EXTRA_THEMES, JAMY, youtubeUrl, type JamyTheme, type JamyVideo } from '../data/jamy';
import { VIDEO_THEMES } from '../data/videos';

const LABELS: Record<JamyTheme, { label: string; emoji: string }> = { ...VIDEO_THEMES, ...EXTRA_THEMES };
import { soundEffects } from '../utils/soundEffects';
import { PRESS, SPRING_SOFT } from '../lib/motion';

/**
 * « Avec Jamy sur YouTube » : des liens par thème vers les chaînes officielles.
 * Avant de quitter l'app, un petit écran demande d'appeler un adulte (YouTube montre des publicités
 * et d'autres vidéos). Aucune miniature n'est chargée depuis YouTube : seulement des emojis.
 */
export function JamyLinks({ theme }: { theme: string | null }) {
  const [pending, setPending] = useState<JamyVideo | null>(null);
  // Un thème choisi : ses vidéos. « Tout mélangé » : tous les thèmes, y compris sciences et vie quotidienne.
  const themes = (theme && theme in JAMY ? [theme] : Object.keys(JAMY)) as JamyTheme[];

  return (
    <section className="mt-8" aria-labelledby="jamy-title">
      <h2 id="jamy-title" className="text-2xl font-bold mb-1">
        ▶ Vidéos à regarder sur YouTube
      </h2>
      <p className="text-doux mb-4">Sciences, corps, bons gestes, planète, objets fabriqués… des vidéos de « C’est pas sorcier », du « Monde de Jamy » et de « Je t’explique comment », à regarder avec un adulte.</p>
      <div className="grid gap-5">
        {themes.map((t) => (
          <div key={t}>
            {themes.length > 1 && (
              <h3 className="font-bold text-lg mb-2">
                {LABELS[t].emoji} {LABELS[t].label}
              </h3>
            )}
            <ul className="grid sm:grid-cols-2 gap-2">
              {JAMY[t].map((v) => (
                <li key={v.id}>
                  <motion.button
                    whileTap={PRESS}
                    onClick={() => {
                      soundEffects.playPop();
                      setPending(v);
                    }}
                    className="w-full rounded-2xl bg-white shadow-bonbon p-3 flex items-center gap-3 text-left"
                  >
                    <span className="w-11 h-11 rounded-xl bg-corail text-white text-xl flex items-center justify-center shrink-0" aria-hidden>
                      ▶
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-semibold leading-snug">{v.title}</span>
                      <span className="block text-sm text-doux">
                        {v.channel} · {v.duration}
                      </span>
                    </span>
                  </motion.button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Petit écran « avec un adulte » avant d'ouvrir YouTube */}
      <AnimatePresence>
        {pending && (
          <motion.div
            className="fixed inset-0 z-40 bg-encre/40 flex items-end sm:items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPending(null)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="jamy-gate"
              className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-bonbon"
              initial={{ y: 40, scale: 0.96 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 40, scale: 0.96 }}
              transition={SPRING_SOFT}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-5xl mb-2" aria-hidden>
                🧑‍🧒
              </div>
              <h3 id="jamy-gate" className="text-xl font-bold mb-1">
                Demande à un adulte
              </h3>
              <p className="text-doux mb-1">« {pending.title} »</p>
              <p className="text-sm text-doux mb-5">La vidéo s’ouvre sur YouTube, qui peut montrer des publicités et d’autres vidéos.</p>
              <div className="flex flex-col gap-2">
                <a
                  href={youtubeUrl(pending.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setPending(null)}
                  className="press shadow-bonbon rounded-2xl bg-corail text-white py-3 font-bold flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-5 h-5" /> Ouvrir sur YouTube
                </a>
                <button onClick={() => setPending(null)} className="rounded-2xl py-3 font-semibold text-doux">
                  Rester dans Pulse Kids
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
