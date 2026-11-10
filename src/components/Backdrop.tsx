import { memo } from 'react';
import { motion } from 'motion/react';
import type { Theme } from '../lib/theme';

/**
 * Décor de fond, derrière tout l'écran (ne capte aucun clic).
 *  - Kawaii : pétales de cerisier et feuilles pastel qui tombent en tournoyant, petits nuages souriants.
 *  - Aquarelle : grands cumulus qui dérivent lentement, feuilles d'automne qui tombent, collines peintes, grain de papier.
 * Animations CSS en transformations seules ; figées si l'appareil demande moins d'animations.
 */

const INK = '#47386b';
const armLoop = { duration: 0.9, repeat: Infinity, repeatType: 'mirror' as const, ease: 'easeInOut' as const };

/** Petite fille ou petit garçon kawaii, dessinés pour Pulse Kids : ils font coucou en se balançant. */
export function KawaiiKid({ kind, size = 110 }: { kind: 'fille' | 'garcon'; size?: number }) {
  const girl = kind === 'fille';
  const hair = girl ? '#8a5433' : '#4d3a2c';
  const cloth = girl ? '#ff9ec7' : '#6db8ff';
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 120 150" aria-hidden>
      <g stroke={INK} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
        {girl && (
          <>
            <circle cx="20" cy="46" r="15" fill={hair} />
            <circle cx="100" cy="46" r="15" fill={hair} />
          </>
        )}
        <rect x="42" y="118" width="13" height="24" rx="6" fill="#ffd9b8" />
        <rect x="65" y="118" width="13" height="24" rx="6" fill="#ffd9b8" />
        <ellipse cx="47" cy="143" rx="11" ry="5" fill={girl ? '#a08aff' : '#3cc49c'} />
        <ellipse cx="73" cy="143" rx="11" ry="5" fill={girl ? '#a08aff' : '#3cc49c'} />
        <motion.path d="M38 96 L16 76" fill="none" stroke="#ffd9b8" strokeWidth="11" style={{ originX: 1, originY: 1 }} animate={{ rotate: [-14, 12] }} transition={armLoop} />
        <motion.path d="M82 96 L104 72" fill="none" stroke="#ffd9b8" strokeWidth="11" style={{ originX: 0, originY: 1 }} animate={{ rotate: [-18, 18] }} transition={armLoop} />
        {girl ? <path d="M46 84 H74 L90 124 Q60 134 30 124 Z" fill={cloth} /> : <><rect x="40" y="84" width="40" height="30" rx="10" fill={cloth} /><path d="M40 108 H80 V124 H63 L60 116 L57 124 H40 Z" fill="#ffd36b" /></>}
        <circle cx="60" cy="48" r="36" fill="#ffe3c9" />
        {girl ? <path d="M24 50 C22 12 98 12 96 50 C86 34 74 30 60 32 C46 30 34 34 24 50 Z" fill={hair} /> : <path d="M25 44 C24 8 96 8 95 44 C84 34 70 30 60 34 C48 30 36 34 25 44 Z" fill={hair} />}
        {girl ? <path d="M84 20 l13 -9 v18 z M84 20 l-13 -9 v18 z" fill="#ff7fa3" transform="translate(4 2)" /> : <path d="M34 26 C40 2 82 2 88 26 C74 18 48 18 34 26 Z M86 24 Q104 26 108 34 Q94 34 82 30 Z" fill="#3cc49c" />}
      </g>
      <ellipse cx="46" cy="52" rx="4.5" ry="5.5" fill={INK} />
      <ellipse cx="74" cy="52" rx="4.5" ry="5.5" fill={INK} />
      <circle cx="47.5" cy="50" r="1.7" fill="#fff" />
      <circle cx="75.5" cy="50" r="1.7" fill="#fff" />
      <ellipse cx="37" cy="62" rx="6" ry="3.5" fill="#ff8fb1" opacity="0.6" />
      <ellipse cx="83" cy="62" rx="6" ry="3.5" fill="#ff8fb1" opacity="0.6" />
      <path d="M54 63 Q60 70 66 63" stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/** Petit nuage kawaii avec un visage. */
function FaceCloud({ size = 90 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 100 60" aria-hidden>
      <path d="M20 50 Q4 50 6 37 Q8 25 22 27 Q25 10 43 12 Q55 2 67 14 Q84 12 85 28 Q97 31 94 43 Q92 51 80 50 Z" fill="#ffffff" opacity="0.95" />
      <circle cx="42" cy="34" r="3" fill="#47386b" />
      <circle cx="60" cy="34" r="3" fill="#47386b" />
      <ellipse cx="35" cy="40" rx="5" ry="3" fill="#ff9ec7" opacity="0.6" />
      <ellipse cx="67" cy="40" rx="5" ry="3" fill="#ff9ec7" opacity="0.6" />
      <path d="M47 40 Q51 44 55 40" stroke="#47386b" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/** Cumulus peint : plusieurs bulles superposées, ombre bleutée en bas, flou léger d'aquarelle. */
function PaintedCloud({ width = 260 }: { width?: number }) {
  return (
    <svg width={width} height={width * 0.5} viewBox="0 0 260 130" aria-hidden style={{ filter: 'blur(0.6px)' }}>
      <g fill="#ffffff">
        <circle cx="70" cy="80" r="40" />
        <circle cx="115" cy="58" r="52" />
        <circle cx="170" cy="70" r="44" />
        <circle cx="210" cy="88" r="30" />
        <circle cx="40" cy="95" r="26" />
        <rect x="30" y="88" width="200" height="34" rx="17" />
      </g>
      <path d="M30 108 Q130 128 232 106 L232 122 L30 122 Z" fill="#c9dcec" opacity="0.7" />
    </svg>
  );
}

/** Feuilles qui tombent en tournoyant (deux formes : feuille ovale et feuille d'érable simplifiée). */
const LEAF_PATHS = [
  'M12 2 C20 7 21 16 12 22 C3 16 4 7 12 2 Z',
  'M12 2 L14 7 L19 5 L17 10 L22 12 L17 14 L19 19 L14 17 L12 22 L10 17 L5 19 L7 14 L2 12 L7 10 L5 5 L10 7 Z'
];

function Leaves({ colors, count }: { colors: string[]; count: number }) {
  const leaves = Array.from({ length: count }, (_, i) => ({
    left: (i * 53 + 17) % 100,
    delay: -((i * 2.7) % 18),
    dur: 14 + (i % 6) * 2.2,
    drift: (i % 2 ? 1 : -1) * (60 + (i % 5) * 30),
    size: 16 + (i % 4) * 6,
    color: colors[i % colors.length],
    shape: LEAF_PATHS[i % 3 === 0 ? 1 : 0]
  }));
  return (
    <>
      {leaves.map((l, i) => (
        <span
          key={`leaf-${i}`}
          className="petal"
          style={{ left: `${l.left}%`, animationDelay: `${l.delay}s, ${l.delay}s`, ['--dur' as string]: `${l.dur}s`, ['--drift' as string]: `${l.drift}px` }}
        >
          <svg width={l.size} height={l.size} viewBox="0 0 24 24">
            <path d={l.shape} fill={l.color} opacity="0.85" />
            <path d="M12 4 L12 21" stroke="#ffffff" strokeWidth="1" opacity="0.45" />
          </svg>
        </span>
      ))}
    </>
  );
}

const PETALS = Array.from({ length: 10 }, (_, i) => ({
  left: (i * 37 + 5) % 100,
  delay: -((i * 1.9) % 14),
  dur: 11 + (i % 5) * 1.6,
  drift: (i % 2 ? 1 : -1) * (40 + (i % 4) * 25),
  size: 12 + (i % 3) * 5
}));

function Kawaii() {
  return (
    <>
      <div className="cloud top-[6%] opacity-45" style={{ ['--dur' as string]: '140s', animationDelay: '-30s' }}>
        <div className="bob">
          <FaceCloud size={96} />
        </div>
      </div>
      <div className="cloud top-[30%] opacity-35" style={{ ['--dur' as string]: '190s', animationDelay: '-120s' }}>
        <div className="bob" style={{ animationDelay: '-2s' }}>
          <FaceCloud size={70} />
        </div>
      </div>
      {PETALS.map((p, i) => (
        <span
          key={i}
          className="petal"
          style={{ left: `${p.left}%`, animationDelay: `${p.delay}s, ${p.delay}s`, ['--dur' as string]: `${p.dur}s`, ['--drift' as string]: `${p.drift}px` }}
        >
          <svg width={p.size} height={p.size} viewBox="0 0 20 20">
            <path d="M10 1 C15 4 17 10 10 19 C3 10 5 4 10 1 Z" fill="#ffb7cf" />
            <path d="M10 4 L10 14" stroke="#ff8fb1" strokeWidth="1" opacity="0.5" />
          </svg>
        </span>
      ))}
      <Leaves colors={['#9be3c4', '#ffc9a8', '#ffe08a', '#b9e6a0']} count={8} />
    </>
  );
}

function Aquarelle() {
  return (
    <>
      {/* Soleil doux, halo doré */}
      <div className="absolute -top-24 right-[8%] w-72 h-72 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,236,170,0.85) 0%, rgba(255,236,170,0) 70%)' }} />
      <div className="cloud top-[4%]" style={{ ['--dur' as string]: '220s', animationDelay: '-60s' }}>
        <PaintedCloud width={300} />
      </div>
      <div className="cloud top-[22%] opacity-90" style={{ ['--dur' as string]: '280s', animationDelay: '-200s' }}>
        <PaintedCloud width={200} />
      </div>
      {/* Feuilles d'automne qui tombent devant le paysage */}
      <Leaves colors={['#e8913a', '#c9772b', '#d9a441', '#8fae5a', '#c45a3c']} count={14} />
      {/* Collines peintes, en trois plans (lointain bleuté → proche vert vif) */}
      <svg className="absolute bottom-0 left-0 w-full h-[34vh]" viewBox="0 0 1200 300" preserveAspectRatio="none" aria-hidden>
        <path d="M0 140 Q200 70 420 120 T860 100 T1200 120 L1200 300 L0 300 Z" fill="#a9c8b4" opacity="0.55" />
        <path d="M0 190 Q260 120 520 175 T1000 160 T1200 170 L1200 300 L0 300 Z" fill="#8dbb7f" opacity="0.6" />
        <path d="M0 240 Q300 190 640 235 T1200 225 L1200 300 L0 300 Z" fill="#7aad68" opacity="0.55" />
      </svg>
      {/* Grain de papier (calculé une seule fois, pas animé) */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.07] mix-blend-multiply" aria-hidden>
        <filter id="paper">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#paper)" />
      </svg>
    </>
  );
}

export const Backdrop = memo(function Backdrop({ theme }: { theme: Theme }) {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden>
      {theme === 'aquarelle' ? <Aquarelle /> : <Kawaii />}
      {(theme === 'fille' || theme === 'garcon') && (
        <div className="absolute bottom-1 left-2 bob">
          <KawaiiKid kind={theme} />
        </div>
      )}
    </div>
  );
});

/** Petit visage kawaii (yeux brillants, joues roses, sourire) à poser sur une tuile. */
export function KawaiiFace({ className = '', color = '#47386b' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 60 30" className={className} aria-hidden>
      <ellipse cx="18" cy="12" rx="4" ry="5" fill={color} />
      <ellipse cx="42" cy="12" rx="4" ry="5" fill={color} />
      <circle cx="19.5" cy="10" r="1.6" fill="#fff" />
      <circle cx="43.5" cy="10" r="1.6" fill="#fff" />
      <ellipse cx="9" cy="20" rx="6" ry="3.5" fill="#ff8fb1" opacity="0.65" />
      <ellipse cx="51" cy="20" rx="6" ry="3.5" fill="#ff8fb1" opacity="0.65" />
      <path d="M25 19 Q27.5 23 30 19 Q32.5 23 35 19" stroke={color} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
