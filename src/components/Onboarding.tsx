import { useState } from 'react';
import { motion } from 'motion/react';
import { Volume2 } from 'lucide-react';
import { AVATARS, cleanName, type Profile } from '../lib/profile';
import { soundEffects, speakFrenchText } from '../utils/soundEffects';
import { markGreeted } from './fx';

/** Premier lancement (ou changement de prénom) : grand champ, avatars, un seul bouton. */
export function Onboarding({ initial, onDone }: { initial?: Profile | null; onDone: (p: Profile) => void }) {
  const [name, setName] = useState(initial?.name ?? '');
  const [avatar, setAvatar] = useState(initial?.avatar ?? AVATARS[0]);
  const valid = cleanName(name).length > 0;

  return (
    <main className="min-h-dvh flex items-center justify-center p-5">
      <motion.form
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={(e) => {
          e.preventDefault();
          if (!valid) return;
          soundEffects.playFanfare();
          const clean = cleanName(name);
          speakFrenchText(`Bonjour ${clean} ! Bienvenue dans Pulse Kids !`, { rate: 0.9, pitch: 1.15 });
          markGreeted();
          onDone({ name: clean, avatar });
        }}
        className="w-full max-w-md bg-white rounded-[2rem] shadow-bonbon p-6 sm:p-8 text-center space-y-6"
      >
        <div className="text-7xl float" aria-hidden>
          {avatar}
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Bonjour ! 👋</h1>
          <div className="flex items-center justify-center gap-2 text-lg text-doux">
            <span>Comment tu t’appelles ?</span>
            <button
              type="button"
              onClick={() => speakFrenchText('Bonjour ! Comment tu t’appelles ?', { rate: 0.9, pitch: 1.15 })}
              className="press w-10 h-10 rounded-full bg-ciel-clair text-ciel flex items-center justify-center"
              aria-label="Écouter la question"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="relative">
        <input
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 20))}
          placeholder="Ton prénom"
          autoComplete="off"
          autoCapitalize="words"
          enterKeyHint="go"
          maxLength={20}
          className="w-full text-center text-3xl font-semibold rounded-2xl border-4 border-soleil-clair focus:border-soleil outline-none py-4 px-14 bg-creme"
          aria-label="Ton prénom"
        />
        {valid && (
          <motion.button
            type="button"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileTap={{ scale: 0.85 }}
            onClick={() => speakFrenchText(cleanName(name), { rate: 0.85, pitch: 1.15 })}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-soleil text-encre flex items-center justify-center"
            aria-label="Écouter mon prénom"
          >
            <Volume2 className="w-5 h-5" />
          </motion.button>
        )}
        </div>

        <div>
          <p className="text-doux mb-3">Choisis ton ami :</p>
          <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label="Choisis ton avatar">
            {AVATARS.map((a) => (
              <button
                type="button"
                key={a}
                role="radio"
                aria-checked={avatar === a}
                onClick={() => {
                  soundEffects.playPop();
                  setAvatar(a);
                }}
                className={`press aspect-square rounded-2xl text-3xl sm:text-4xl flex items-center justify-center transition-colors ${
                  avatar === a ? 'bg-soleil ring-4 ring-soleil-clair scale-105' : 'bg-creme'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={!valid}
          className="press shadow-bonbon w-full py-4 rounded-2xl bg-menthe text-white text-2xl font-bold disabled:opacity-40 disabled:shadow-none"
        >
          C’est parti ! 🚀
        </button>
        <p className="text-xs text-doux">Ton prénom reste uniquement sur cet appareil.</p>
      </motion.form>
    </main>
  );
}
