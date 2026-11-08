import { memo } from 'react';
import { motion } from 'motion/react';
import { KawaiiFace } from './Backdrop';

/**
 * Décor animé des vidéos éducatives, différent pour chaque thème.
 * Discret (transparence) pour ne pas gêner la lecture ; uniquement des transformations (fluide sur tablette).
 * Les animations s'arrêtent d'elles-mêmes si l'appareil demande moins d'animations (MotionConfig).
 */

export type SceneTheme = 'animaux' | 'nature' | 'espace' | 'metiers' | 'corps' | 'monde' | 'journal' | 'mer' | 'neige' | 'pluie' | 'fete' | 'nuit' | 'kawaii' | 'kawaiiFille' | 'kawaiiGarcon';

const loop = (duration: number, delay = 0) => ({ duration, delay, repeat: Infinity, ease: 'easeInOut' as const });

function Animaux() {
  return (
    <>
      {/* Des traces de pattes qui avancent le long du sol */}
      {Array.from({ length: 6 }, (_, i) => (
        <motion.span
          key={i}
          className="absolute text-3xl"
          style={{ left: `${8 + i * 15}%`, bottom: i % 2 ? '7%' : '11%', rotate: 90 }}
          animate={{ opacity: [0, 0.6, 0.6, 0] }}
          transition={{ duration: 4.2, delay: i * 0.55, repeat: Infinity, times: [0, 0.1, 0.7, 1] }}
        >
          🐾
        </motion.span>
      ))}
      {/* Herbe qui ondule */}
      {[6, 30, 62, 88].map((left, i) => (
        <motion.span key={`g${i}`} className="absolute bottom-0 text-4xl" style={{ left: `${left}%`, originY: 1 }} animate={{ rotate: [-8, 8, -8] }} transition={loop(2.6, i * 0.4)}>
          🌿
        </motion.span>
      ))}
    </>
  );
}

function Nature() {
  return (
    <>
      <motion.span className="absolute top-4 right-6 text-6xl" animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}>
        🌞
      </motion.span>
      {Array.from({ length: 6 }, (_, i) => (
        <motion.span
          key={i}
          className="absolute text-3xl"
          style={{ left: `${10 + i * 15}%`, top: '-8%' }}
          animate={{ y: ['0vh', '75vh'], x: [0, i % 2 ? 40 : -40, 0], rotate: [0, 200, 360], opacity: [0, 0.8, 0] }}
          transition={{ duration: 8 + (i % 3), delay: i * 1.3, repeat: Infinity, ease: 'linear' }}
        >
          {i % 2 ? '🍂' : '🍃'}
        </motion.span>
      ))}
      {[15, 45, 75].map((left, i) => (
        <motion.span key={`s${i}`} className="absolute bottom-0 text-4xl" style={{ left: `${left}%`, originY: 1 }} animate={{ scale: [0.4, 1, 1, 0.4] }} transition={{ duration: 6, delay: i * 1.2, repeat: Infinity, times: [0, 0.4, 0.8, 1] }}>
          🌱
        </motion.span>
      ))}
    </>
  );
}

function Espace() {
  return (
    <>
      {Array.from({ length: 12 }, (_, i) => (
        <motion.span
          key={i}
          className="absolute text-xl"
          style={{ left: `${(i * 37 + 7) % 95}%`, top: `${(i * 53 + 5) % 90}%` }}
          animate={{ opacity: [0.15, 0.9, 0.15], scale: [0.7, 1.15, 0.7] }}
          transition={loop(2.4 + (i % 4) * 0.6, i * 0.3)}
        >
          ✦
        </motion.span>
      ))}
      {/* Une planète en orbite */}
      <motion.div className="absolute left-1/2 top-1/2 w-0 h-0" animate={{ rotate: 360 }} transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}>
        <span className="absolute text-4xl" style={{ transform: 'translate(38vw, -10px)' }}>
          🪐
        </span>
      </motion.div>
      {/* Étoile filante */}
      <motion.span className="absolute text-2xl" style={{ top: '8%', left: '-10%' }} animate={{ x: ['0vw', '120vw'], y: [0, 120], opacity: [0, 1, 0] }} transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 5, ease: 'easeIn' }}>
        🌠
      </motion.span>
    </>
  );
}

function Metiers() {
  return (
    <>
      <motion.span className="absolute -top-4 -left-4 text-7xl" animate={{ rotate: 360 }} transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}>
        ⚙️
      </motion.span>
      <motion.span className="absolute top-10 left-14 text-5xl" animate={{ rotate: -360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}>
        ⚙️
      </motion.span>
      <motion.span className="absolute -bottom-4 -right-4 text-7xl" animate={{ rotate: -360 }} transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}>
        ⚙️
      </motion.span>
      {['🔧', '🔨', '🧰', '📏'].map((e, i) => (
        <motion.span key={e} className="absolute text-3xl" style={{ left: `${20 + i * 18}%`, bottom: '6%' }} animate={{ y: [0, -12, 0], rotate: [-6, 6, -6] }} transition={loop(1.8, i * 0.35)}>
          {e}
        </motion.span>
      ))}
    </>
  );
}

function Corps() {
  return (
    <>
      {/* Un cœur qui bat : boum-boum, pause */}
      <motion.span className="absolute top-5 right-6 text-6xl" animate={{ scale: [1, 1.25, 1, 1.18, 1, 1] }} transition={{ duration: 1.2, repeat: Infinity, times: [0, 0.12, 0.25, 0.37, 0.5, 1] }}>
        ❤️
      </motion.span>
      {/* L'air qu'on respire : des bulles qui montent */}
      {Array.from({ length: 7 }, (_, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full border-2 border-white/60"
          style={{ left: `${8 + i * 13}%`, bottom: '-5%', width: 14 + (i % 3) * 8, height: 14 + (i % 3) * 8 }}
          animate={{ y: [0, -420], opacity: [0, 0.8, 0] }}
          transition={{ duration: 6 + (i % 3), delay: i * 0.8, repeat: Infinity, ease: 'easeOut' }}
        />
      ))}
    </>
  );
}

function Monde() {
  return (
    <>
      <motion.span className="absolute top-4 left-5 text-6xl" animate={{ rotate: [0, 10, -10, 0] }} transition={loop(6)}>
        🌍
      </motion.span>
      <motion.span className="absolute text-3xl" style={{ top: '14%', left: '-10%' }} animate={{ x: ['0vw', '120vw'] }} transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}>
        ✈️
      </motion.span>
      {/* Les vagues de l'océan */}
      <motion.svg className="absolute bottom-0 left-0 w-[200%] h-16 opacity-50" viewBox="0 0 800 60" preserveAspectRatio="none" animate={{ x: ['0%', '-50%'] }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}>
        <path d="M0 30 Q50 10 100 30 T200 30 T300 30 T400 30 T500 30 T600 30 T700 30 T800 30 V60 H0 Z" fill="#ffffff" />
      </motion.svg>
    </>
  );
}

function Journal() {
  return (
    <>
      <motion.div className="absolute top-3 right-4 text-6xl" animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}>
        ☀️
      </motion.div>
      {[0, 1].map((i) => (
        <motion.span key={i} className="absolute text-5xl opacity-70" style={{ top: `${10 + i * 22}%`, left: '-15%' }} animate={{ x: ['0vw', '120vw'] }} transition={{ duration: 26 + i * 8, delay: -i * 10, repeat: Infinity, ease: 'linear' }}>
          ☁️
        </motion.span>
      ))}
    </>
  );
}

function Mer() {
  return (
    <>
      {['🐠', '🐟', '🐡'].map((e, i) => (
        <motion.span key={e} className="absolute text-3xl" style={{ top: `${30 + i * 18}%`, left: '-10%' }} animate={{ x: ['0vw', '115vw'], y: [0, -10, 0, 10, 0] }} transition={{ x: { duration: 16 + i * 4, delay: -i * 5, repeat: Infinity, ease: 'linear' }, y: loop(3, i * 0.5) }}>
          {e}
        </motion.span>
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <motion.span key={`b${i}`} className="absolute rounded-full border-2 border-white/60" style={{ left: `${10 + i * 15}%`, bottom: '0%', width: 10 + (i % 3) * 6, height: 10 + (i % 3) * 6 }} animate={{ y: [0, -380], opacity: [0, 0.8, 0] }} transition={{ duration: 6 + (i % 3), delay: i * 0.9, repeat: Infinity, ease: 'easeOut' }} />
      ))}
      <motion.svg className="absolute bottom-0 left-0 w-[200%] h-14 opacity-50" viewBox="0 0 800 60" preserveAspectRatio="none" animate={{ x: ['0%', '-50%'] }} transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}>
        <path d="M0 30 Q50 10 100 30 T200 30 T300 30 T400 30 T500 30 T600 30 T700 30 T800 30 V60 H0 Z" fill="#ffffff" />
      </motion.svg>
    </>
  );
}

function Neige() {
  return (
    <>
      {Array.from({ length: 14 }, (_, i) => (
        <motion.span key={i} className="absolute text-xl text-white" style={{ left: `${(i * 31 + 4) % 96}%`, top: '-6%' }} animate={{ y: ['0vh', '80vh'], x: [0, i % 2 ? 25 : -25, 0], rotate: [0, 180], opacity: [0, 1, 0.8] }} transition={{ duration: 7 + (i % 4), delay: i * 0.6, repeat: Infinity, ease: 'linear' }}>
          ❄
        </motion.span>
      ))}
      <motion.span className="absolute bottom-1 right-6 text-5xl" animate={{ rotate: [-4, 4, -4] }} transition={loop(3)}>
        ⛄
      </motion.span>
    </>
  );
}

function Pluie() {
  return (
    <>
      {[0, 1].map((i) => (
        <motion.span key={i} className="absolute text-5xl" style={{ top: `${4 + i * 10}%`, left: `${15 + i * 45}%` }} animate={{ x: [0, 30, 0] }} transition={loop(6, i)}>
          🌧️
        </motion.span>
      ))}
      {Array.from({ length: 16 }, (_, i) => (
        <motion.span key={`d${i}`} className="absolute w-0.5 h-4 rounded-full bg-white/70" style={{ left: `${(i * 23 + 6) % 95}%`, top: '10%' }} animate={{ y: [0, 380], opacity: [0, 1, 0] }} transition={{ duration: 1.1 + (i % 3) * 0.2, delay: (i % 7) * 0.25, repeat: Infinity, ease: 'easeIn' }} />
      ))}
    </>
  );
}

function Fete() {
  return (
    <>
      {['🎈', '🎈', '🎈', '🎵', '🎶'].map((e, i) => (
        <motion.span key={i} className="absolute text-4xl" style={{ left: `${8 + i * 20}%`, bottom: '-12%' }} animate={{ y: [0, -460], x: [0, i % 2 ? 20 : -20, 0], opacity: [0, 1, 0] }} transition={{ duration: 9 + i, delay: i * 1.4, repeat: Infinity, ease: 'easeOut' }}>
          {e}
        </motion.span>
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <motion.span key={`c${i}`} className="absolute text-lg" style={{ left: `${(i * 37 + 9) % 95}%`, top: `${(i * 29 + 5) % 60}%` }} animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5], rotate: [0, 90] }} transition={loop(2.2, i * 0.4)}>
          ✨
        </motion.span>
      ))}
    </>
  );
}

/** La nuit des contes du soir : une lune qui luit doucement, des étoiles, des lucioles. */
function Nuit() {
  return (
    <>
      <motion.span className="absolute top-4 right-6 text-6xl" animate={{ scale: [1, 1.06, 1], opacity: [0.85, 1, 0.85] }} transition={loop(5)}>
        🌙
      </motion.span>
      {Array.from({ length: 14 }, (_, i) => (
        <motion.span key={i} className="absolute text-sm text-white" style={{ left: `${(i * 41 + 3) % 96}%`, top: `${(i * 23 + 4) % 70}%` }} animate={{ opacity: [0.2, 1, 0.2] }} transition={loop(3 + (i % 4), i * 0.4)}>
          ✦
        </motion.span>
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <motion.span key={`f${i}`} className="absolute w-2 h-2 rounded-full bg-yellow-200 shadow-[0_0_10px_4px_rgba(254,240,138,0.7)]" style={{ left: `${10 + i * 15}%`, top: `${55 + (i % 3) * 10}%` }} animate={{ x: [0, 30, -20, 0], y: [0, -25, 10, 0], opacity: [0.2, 1, 0.4, 0.2] }} transition={loop(7 + i, i * 0.8)} />
      ))}
      <motion.span className="absolute text-xl" style={{ top: '6%', left: '-10%' }} animate={{ x: ['0vw', '120vw'], y: [0, 90], opacity: [0, 1, 0] }} transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 9, ease: 'easeIn' }}>
        🌠
      </motion.span>
    </>
  );
}

const MOCHIS = [
  { left: '6%', color: '#ffc4dc', size: 76, delay: 0 },
  { left: '42%', color: '#c9f0dc', size: 60, delay: 0.5 },
  { left: '76%', color: '#fff0a8', size: 70, delay: 1 }
];

/** Le fond kawaii : soleil qui sourit, cœurs qui montent, étoiles qui scintillent, petits mochis qui rebondissent. */
function KawaiiScene({ kid }: { kid?: 'fille' | 'garcon' }) {
  const rising = kid === 'fille' ? ['🌸', '🦋', '💖', '🎀'] : kid === 'garcon' ? ['⭐', '🚀', '⚽', '🦕'] : ['💖', '🌸', '💕', '⭐'];
  return (
    <>
      <motion.div className="absolute top-20 right-4 w-24 h-24" animate={{ y: [0, -8, 0], rotate: [-4, 4, -4] }} transition={loop(4)}>
        <motion.div className="absolute inset-0" animate={{ rotate: 360 }} transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}>
          {Array.from({ length: 8 }, (_, i) => (
            <span key={i} className="absolute left-1/2 top-1/2 w-2.5 h-5 -ml-[5px] -mt-[58px] rounded-full bg-[#ffd76a]" style={{ transform: `rotate(${i * 45}deg)`, transformOrigin: '5px 58px' }} />
          ))}
        </motion.div>
        <div className="absolute inset-3 rounded-full bg-[#ffe48f] flex items-center justify-center">
          <KawaiiFace className="w-14" />
        </div>
      </motion.div>
      {Array.from({ length: 9 }, (_, i) => (
        <motion.span
          key={i}
          className="absolute text-3xl"
          style={{ left: `${6 + i * 11}%`, bottom: '-8%' }}
          animate={{ y: ['0vh', '-105vh'], x: [0, i % 2 ? 26 : -26, 0], scale: [0.7, 1.1, 0.8], opacity: [0, 0.9, 0.9, 0] }}
          transition={{ duration: 10 + (i % 4) * 2, delay: i * 1.1, repeat: Infinity, ease: 'linear' }}
        >
          {rising[i % 4]}
        </motion.span>
      ))}
      {Array.from({ length: 10 }, (_, i) => (
        <motion.span
          key={`s${i}`}
          className="absolute text-xl text-[#ff9ec7]"
          style={{ left: `${(i * 37 + 9) % 94}%`, top: `${(i * 29 + 12) % 80}%` }}
          animate={{ opacity: [0.15, 1, 0.15], scale: [0.7, 1.2, 0.7] }}
          transition={loop(2.2 + (i % 3) * 0.7, i * 0.3)}
        >
          ✦
        </motion.span>
      ))}
      {MOCHIS.map((m) => (
        <motion.div
          key={m.left}
          className="absolute bottom-1 rounded-[50%_50%_45%_45%] flex items-center justify-center"
          style={{ left: m.left, width: m.size, height: m.size * 0.78, background: m.color, originY: 1 }}
          animate={{ y: [0, -26, 0, 0], scaleY: [0.86, 1.08, 0.82, 0.86], scaleX: [1.1, 0.95, 1.14, 1.1] }}
          transition={{ duration: 1.5, delay: m.delay, repeat: Infinity, times: [0, 0.45, 0.85, 1], ease: 'easeInOut' }}
        >
          <KawaiiFace className="w-3/5" />
        </motion.div>
      ))}
    </>
  );
}

const SCENES: Record<SceneTheme, () => React.JSX.Element> = { animaux: Animaux, nature: Nature, espace: Espace, metiers: Metiers, corps: Corps, monde: Monde, journal: Journal, mer: Mer, neige: Neige, pluie: Pluie, fete: Fete, nuit: Nuit, kawaii: () => <KawaiiScene />, kawaiiFille: () => <KawaiiScene kid="fille" />, kawaiiGarcon: () => <KawaiiScene kid="garcon" /> };

/** Choisit le décor d'après les mots d'un texte (titre, page, question…). */
const RULES: [RegExp, SceneTheme][] = [
  [/fusée|espace|planète|astronaute|étoile filante|comète|extraterrestre|soucoupe/i, 'espace'],
  [/mer|vague|baleine|poisson|océan|plage|dauphin|corail|pieuvre|crabe|coquillage|sirène|bateau|marée/i, 'mer'],
  [/neige|hiver|flocon|banquise|pingouin|manchot|bonhomme de neige|luge|glace/i, 'neige'],
  [/pluie|orage|nuage|parapluie|flaque/i, 'pluie'],
  [/fête|anniversaire|musique|chanson|danse|cirque|ballon|spectacle|gâteau/i, 'fete'],
  [/cœur|corps|dent|respire|muscle|docteur|sommeil|manger/i, 'corps'],
  [/pompier|boulanger|métier|facteur|cuisinier|maîtresse|travail|fermier|tracteur|construi/i, 'metiers'],
  [/forêt|arbre|feuille|fleur|jardin|graine|printemps|automne|champignon|potager|verger|nature/i, 'nature'],
  [/ferme|vache|cochon|poule|mouton|lapin|renard|ours|lion|loup|chat|chien|cheval|grenouille|souris|animal|oiseau|canard/i, 'animaux'],
  [/terre|monde|pays|voyage|globe/i, 'monde']
];

export function sceneFor(text: string, fallback: SceneTheme = 'nature'): SceneTheme {
  for (const [re, theme] of RULES) if (re.test(text)) return theme;
  return fallback;
}

export const ThemeScene = memo(function ThemeScene({ theme }: { theme: SceneTheme }) {
  const Scene = SCENES[theme];
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-70" aria-hidden>
      <Scene />
    </div>
  );
});
