import { memo, type ComponentProps } from 'react';
import { motion } from 'motion/react';
import type { AnimId } from '../data/explications';

/**
 * Les illustrations animées des explications : un petit dessin vectoriel qui bouge,
 * dessiné avec les couleurs du thème (aucune image à télécharger, tout tient en quelques ko).
 *
 * Règles :
 *  - viewBox 200 × 200, formes simples et grosses, lisibles sur une tablette ;
 *  - uniquement des transformations et des attributs SVG (fluide, même sur un vieux téléphone) ;
 *  - les animations s'arrêtent d'elles-mêmes si l'appareil demande « réduire les animations »
 *    (MotionConfig est déjà enveloppé autour de toute l'app).
 */

const loop = (duration: number, delay = 0, repeatDelay = 0) => ({ duration, delay, repeat: Infinity, repeatDelay, ease: 'easeInOut' as const });
const flow = (duration: number, delay = 0) => ({ duration, delay, repeat: Infinity, ease: 'linear' as const });

type CircleProps = ComponentProps<typeof motion.circle>;

/**
 * motion.circle qui part de la première image de son animation.
 * Sans valeur de départ explicite, motion écrit cx/cy/r = "undefined" sur la première frame
 * (erreurs SVG dans la console et un cercle qui saute).
 */
function MCircle({ animate, initial, ...props }: CircleProps) {
  const start =
    animate && typeof animate === 'object' && !Array.isArray(animate)
      ? Object.fromEntries(Object.entries(animate).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]))
      : {};
  const init = initial && typeof initial === 'object' && !Array.isArray(initial) ? { ...start, ...initial } : initial ?? start;
  return <motion.circle {...props} initial={init as CircleProps['initial']} animate={animate} />;
}

/** Un soleil tout simple, avec un halo qui respire. */
function Sun({ x = 160, y = 40, r = 18 }: { x?: number; y?: number; r?: number }) {
  return (
    <g>
      <MCircle cx={x} cy={y} r={r} fill="var(--color-soleil)" opacity={0.35} animate={{ r: [r, r + 7], opacity: [0.4, 0] }} transition={loop(3)} />
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={x - 2} y={y - r - 9} width={4} height={7} rx={2} fill="var(--color-soleil)" transform={`rotate(${i * 45} ${x} ${y})`} />
      ))}
      <circle cx={x} cy={y} r={r} fill="var(--color-soleil)" />
    </g>
  );
}

/** L'orbite d'un astre autour d'un point (points pré-calculés : pas de transform-origin à deviner). */
function orbitPoints(cx: number, cy: number, radius: number, count = 25) {
  return Array.from({ length: count }, (_, i) => {
    const a = (i / (count - 1)) * Math.PI * 2;
    return { x: cx + Math.cos(a) * radius, y: cy + Math.sin(a) * radius };
  });
}

const CLOUD = 'M70 78 Q64 52 92 52 Q104 34 128 44 Q150 40 152 62 Q176 64 172 84 Z';

function Pluie() {
  return (
    <>
      <path d="M0 150 Q25 132 50 150 T100 150 T150 150 T200 150 V200 H0 Z" fill="var(--color-ciel)" opacity={0.55} />
      <Sun x={46} y={40} r={16} />
      {/* l'eau s'évapore et monte */}
      {[76, 102, 128].map((x, i) => (
        <MCircle key={x} cx={x} cy={148} r={3.5} fill="var(--color-ciel)" animate={{ cy: [148, 96], opacity: [0, 0.9, 0] }} transition={{ duration: 3.2, delay: i * 0.9, repeat: Infinity, ease: 'easeOut' }} />
      ))}
      {/* le nuage */}
      <motion.path d={CLOUD} fill="#e7f2fe" stroke="#c6e1fb" strokeWidth={2} animate={{ x: [-5, 5] }} transition={loop(5)} />
      {/* la pluie */}
      {[88, 106, 124, 142, 96, 132].map((x, i) => (
        <motion.line
          key={i}
          x1={x}
          y1={92}
          x2={x - 5}
          y2={112}
          stroke="var(--color-ciel)"
          strokeWidth={4.5}
          strokeLinecap="round"
          animate={{ y: [0, 40], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.1, delay: (i % 5) * 0.24, repeat: Infinity, ease: 'easeIn' }}
        />
      ))}
    </>
  );
}

function Graine() {
  return (
    <>
      <rect y={146} width={200} height={54} fill="#d9a679" />
      <rect y={146} width={200} height={6} fill="#c18a5c" opacity={0.6} />
      <Sun x={162} y={38} r={16} />
      {/* graine puis racines */}
      <ellipse cx={100} cy={156} rx={9} ry={6.5} fill="#8f5a2e" />
      {[
        'M100 158 C96 170 86 174 76 184',
        'M100 158 C104 170 114 176 124 186',
        'M100 160 C100 172 100 178 100 188'
      ].map((d, i) => (
        <motion.path key={d} d={d} fill="none" stroke="#6b3f1d" strokeWidth={3} strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6, delay: i * 0.25, repeat: Infinity, repeatDelay: 3.4, ease: 'easeOut' }} />
      ))}
      {/* tige */}
      <motion.path d="M100 158 C100 136 100 124 100 108" fill="none" stroke="var(--color-menthe)" strokeWidth={6} strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, delay: 0.6, repeat: Infinity, repeatDelay: 3, ease: 'easeOut' }} />
      {/* feuille */}
      <motion.ellipse cx={114} cy={124} rx={15} ry={8} fill="var(--color-menthe)" transform="rotate(-25 114 124)" animate={{ scale: [0, 1, 1] }} transition={{ duration: 2.6, times: [0, 0.6, 1], repeat: Infinity, repeatDelay: 2.4 }} style={{ transformBox: 'fill-box', transformOrigin: 'center' }} />
      {/* fleur */}
      <motion.g animate={{ scale: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }} transition={{ duration: 3.6, times: [0, 0.55, 0.85, 1], repeat: Infinity, repeatDelay: 1.6 }} style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
        {Array.from({ length: 6 }, (_, i) => {
          const a = (i / 6) * Math.PI * 2;
          return <circle key={i} cx={100 + Math.cos(a) * 10} cy={104 + Math.sin(a) * 10} r={7.5} fill="var(--color-rose)" />;
        })}
        <circle cx={100} cy={104} r={6} fill="var(--color-soleil)" />
      </motion.g>
      {/* gouttes d'arrosage */}
      {[64, 78].map((x, i) => (
        <MCircle key={x} cx={x} cy={60} r={3.5} fill="var(--color-ciel)" animate={{ cy: [60, 150], opacity: [0, 1, 0] }} transition={{ duration: 2.4, delay: i * 0.9, repeat: Infinity, repeatDelay: 1.6, ease: 'easeIn' }} />
      ))}
    </>
  );
}

const SCATTER: [number, number][] = [
  [-28, -44],
  [22, -50],
  [46, -22],
  [52, 14],
  [30, 46],
  [-18, 52],
  [-48, 26],
  [-52, -14],
  [8, -64]
];

function Ciel() {
  return (
    <>
      <rect width={200} height={200} fill="var(--color-ciel)" opacity={0.18} />
      <Sun x={34} y={100} r={20} />
      {/* le rayon de lumière qui traverse l'air */}
      <motion.line x1={56} y1={100} x2={196} y2={100} stroke="var(--color-soleil)" strokeWidth={5} strokeLinecap="round" opacity={0.5} animate={{ opacity: [0.28, 0.6, 0.28] }} transition={loop(3)} />
      {/* les petites bulles d'air */}
      {Array.from({ length: 10 }, (_, i) => {
        const x = 60 + ((i * 47) % 120);
        const y = 30 + ((i * 61) % 140);
        return (
          <MCircle key={i} cx={x} cy={y} r={4} fill="#ffffff" opacity={0.85} animate={{ cx: [x, x + 3, x - 3, x], cy: [y, y - 3, y + 3, y] }} transition={{ duration: 3 + (i % 3), repeat: Infinity, ease: 'easeInOut' }} />
        );
      })}
      {/* la lumière bleue éparpillée dans tous les sens */}
      {SCATTER.map(([dx, dy], i) => (
        <MCircle
          key={i}
          cx={118}
          cy={100}
          r={4.5}
          fill="var(--color-ciel)"
          animate={{ cx: [118, 118 + dx], cy: [100, 100 + dy], opacity: [0, 1, 0], r: [6, 3] }}
          transition={{ duration: 2.2, delay: i * 0.16, repeat: Infinity, repeatDelay: 0.6, ease: 'easeOut' }}
        />
      ))}
      <circle cx={118} cy={100} r={7} fill="var(--color-soleil)" />
    </>
  );
}

const RAINBOW = ['#ff6b6b', '#ffa552', '#ffd93d', '#6ee7a8', '#4aa8ff', '#6f7bf7', '#b07af7'];

function ArcEnCiel() {
  return (
    <>
      <rect width={200} height={200} fill="var(--color-ciel)" opacity={0.14} />
      <Sun x={36} y={34} r={15} />
      {/* la pluie */}
      {[120, 140, 160, 178].map((x, i) => (
        <motion.line key={x} x1={x} y1={40} x2={x - 3} y2={58} stroke="var(--color-ciel)" strokeWidth={3.5} strokeLinecap="round" animate={{ y: [0, 26], opacity: [0, 1, 0] }} transition={{ duration: 1.3, delay: i * 0.3, repeat: Infinity, ease: 'easeIn' }} />
      ))}
      {/* les sept arcs */}
      {/* une version très pâle, toujours visible : même si les animations sont coupées, l'arc-en-ciel reste lisible */}
      {RAINBOW.map((color, i) => {
        const r = 78 - i * 7;
        return <path key={`ghost-${color}`} d={`M ${100 - r} 158 A ${r} ${r} 0 0 1 ${100 + r} 158`} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" opacity={0.16} />;
      })}
      {RAINBOW.map((color, i) => {
        const r = 78 - i * 7;
        return (
          <motion.path
            key={color}
            d={`M ${100 - r} 158 A ${r} ${r} 0 0 1 ${100 + r} 158`}
            fill="none"
            stroke={color}
            strokeWidth={6}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.1, delay: 0.15 + i * 0.12, repeat: Infinity, repeatDelay: 3.2, ease: 'easeOut' }}
          />
        );
      })}
      {/* les nuages aux deux pieds de l'arc */}
      <ellipse cx={26} cy={162} rx={26} ry={16} fill="#e7f2fe" stroke="#c6e1fb" strokeWidth={2} />
      <ellipse cx={174} cy={162} rx={26} ry={16} fill="#e7f2fe" stroke="#c6e1fb" strokeWidth={2} />
      <MCircle cx={100} cy={190} r={4} fill="var(--color-soleil)" animate={{ opacity: [0, 1, 0], scale: [0.5, 1.4, 0.5] }} transition={loop(2.4)} style={{ transformBox: 'fill-box', transformOrigin: 'center' }} />
    </>
  );
}

const ORBIT = orbitPoints(100, 100, 70);

function Saisons() {
  return (
    <>
      <circle cx={100} cy={100} r={76} fill="none" stroke="var(--color-lavande)" strokeWidth={2} strokeDasharray="5 7" opacity={0.5} />
      <Sun x={100} y={100} r={26} />
      {/* la Terre, penchée, qui tourne autour du Soleil */}
      <MCircle cx={ORBIT[0].x} cy={ORBIT[0].y} r={14} fill="var(--color-ciel)" animate={{ cx: ORBIT.map((p) => p.x), cy: ORBIT.map((p) => p.y) }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} />
      <motion.g animate={{ x: ORBIT.map((p) => p.x - ORBIT[0].x), y: ORBIT.map((p) => p.y - ORBIT[0].y) }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}>
        <line x1={ORBIT[0].x} y1={ORBIT[0].y - 21} x2={ORBIT[0].x} y2={ORBIT[0].y + 21} stroke="#ffffff" strokeWidth={2} strokeLinecap="round" transform={`rotate(-23 ${ORBIT[0].x} ${ORBIT[0].y})`} />
        <ellipse cx={ORBIT[0].x + 5} cy={ORBIT[0].y - 4} rx={6} ry={4} fill="var(--color-menthe)" opacity={0.9} />
      </motion.g>
      {/* les quatre saisons, qui s'allument à tour de rôle */}
      {[
        { emoji: '🌸', x: 158, y: 32 },
        { emoji: '☀️', x: 162, y: 174 },
        { emoji: '🍂', x: 34, y: 176 },
        { emoji: '❄️', x: 30, y: 30 }
      ].map((s, i) => (
        <motion.text key={s.emoji} x={s.x} y={s.y} fontSize={26} textAnchor="middle" animate={{ opacity: [0.15, 1, 0.15], scale: [0.8, 1.15, 0.8] }} transition={{ duration: 4.8, delay: i * 1.2, repeat: Infinity }} style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
          {s.emoji}
        </motion.text>
      ))}
    </>
  );
}

const MOON_ORBIT = orbitPoints(64, 96, 44);

function Lune() {
  return (
    <>
      <rect width={200} height={200} fill="var(--color-nuit)" opacity={0.12} />
      {/* le Soleil, qui éclaire toujours une moitié de la Lune */}
      <circle cx={8} cy={62} r={26} fill="var(--color-soleil)" opacity={0.4} />
      {/* l'orbite de la Lune autour de la Terre */}
      <circle cx={64} cy={96} r={44} fill="none" stroke="#ffffff" strokeWidth={1.5} strokeDasharray="4 6" opacity={0.55} />
      {/* étoiles */}
      {Array.from({ length: 9 }, (_, i) => (
        <MCircle key={i} cx={12 + ((i * 43) % 180)} cy={10 + ((i * 31) % 96)} r={1.8} fill="#ffffff" animate={{ opacity: [0.2, 1, 0.2] }} transition={loop(2.6 + (i % 3), i * 0.35)} />
      ))}
      {/* la Terre */}
      <circle cx={64} cy={96} r={24} fill="var(--color-ciel)" />
      <ellipse cx={72} cy={90} rx={10} ry={7} fill="var(--color-menthe)" opacity={0.85} />
      <ellipse cx={56} cy={106} rx={7} ry={5} fill="var(--color-menthe)" opacity={0.7} />
      {/* la Lune qui tourne */}
      <motion.g animate={{ x: MOON_ORBIT.map((p) => p.x - MOON_ORBIT[0].x), y: MOON_ORBIT.map((p) => p.y - MOON_ORBIT[0].y) }} transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}>
        <circle cx={MOON_ORBIT[0].x} cy={MOON_ORBIT[0].y} r={11} fill="#f7f0cf" />
        <circle cx={MOON_ORBIT[0].x - 3} cy={MOON_ORBIT[0].y - 3} r={2.5} fill="#d9cf9f" />
        <circle cx={MOON_ORBIT[0].x + 4} cy={MOON_ORBIT[0].y + 3} r={2} fill="#d9cf9f" />
      </motion.g>
      {/* les quatre formes de la Lune */}
      {[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(${46 + i * 36} 172)`}>
          <circle cx={0} cy={0} r={9} fill="#f7f0cf" />
          <circle cx={0} cy={0} r={9} fill="var(--color-nuit)" opacity={i === 3 ? 0 : 0.92} transform={`translate(${i === 0 ? 0 : i === 1 ? 5 : 9} 0)`} />
        </g>
      ))}
    </>
  );
}

function Volcan() {
  return (
    <>
      <path d="M14 182 L92 62 L116 62 L188 182 Z" fill="#9a8fb5" />
      <path d="M92 62 L116 62 L132 88 L78 88 Z" fill="#7d7199" />
      <ellipse cx={104} cy={63} rx={11} ry={4.5} fill="#6b5d86" />
      {/* la lave qui monte dans la cheminée */}
      <motion.path d="M104 168 V70" stroke="#ff8a3d" strokeWidth={10} strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 0.6, ease: 'easeInOut' }} />
      {/* la coulée de lave */}
      <motion.path d="M116 96 C126 118 128 146 146 178" stroke="#ff8a3d" strokeWidth={6} strokeLinecap="round" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2.2, delay: 0.8, repeat: Infinity, repeatDelay: 1.2, ease: 'easeOut' }} />
      {/* les projections */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <MCircle
          key={i}
          cx={104 + (i - 2.5) * 12}
          cy={60}
          r={3.5}
          fill="#ffb054"
          animate={{ cy: [60, 22 - (i % 2) * 8, 52], cx: [104 + (i - 2.5) * 12, 88 + i * 7, 84 + i * 9], opacity: [1, 1, 0] }}
          initial={{ opacity: 0 }}
          transition={{ duration: 1.8, delay: i * 0.18, repeat: Infinity, repeatDelay: 0.4, ease: 'easeOut' }}
        />
      ))}
      {/* la fumée */}
      {[0, 1, 2].map((i) => (
        <MCircle key={`s${i}`} cx={104} cy={52} r={6} fill="#ffffff" opacity={0.7} animate={{ cy: [52, 8], r: [6, 18], opacity: [0.7, 0] }} transition={{ duration: 3, delay: i * 0.9, repeat: Infinity, ease: 'easeOut' }} />
      ))}
      <rect y={182} width={200} height={18} fill="var(--color-menthe)" opacity={0.35} />
    </>
  );
}

const HEART = 'M100 152 C44 112 30 74 58 52 C78 36 96 50 100 64 C104 50 122 36 142 52 C170 74 156 112 100 152 Z';

function Coeur() {
  return (
    <>
      <rect width={200} height={200} fill="var(--color-rose)" opacity={0.16} />
      {/* les vaisseaux : le sang part et revient */}
      <motion.path d="M56 96 C30 92 22 72 18 46" fill="none" stroke="var(--color-corail)" strokeWidth={7} strokeLinecap="round" strokeDasharray="7 9" animate={{ strokeDashoffset: [0, -32] }} transition={flow(1.2)} />
      <motion.path d="M144 96 C170 92 178 72 182 46" fill="none" stroke="var(--color-ciel)" strokeWidth={7} strokeLinecap="round" strokeDasharray="7 9" animate={{ strokeDashoffset: [0, 32] }} transition={flow(1.2)} />
      <motion.path d={HEART} fill="var(--color-corail)" animate={{ scale: [1, 1.07, 1] }} transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }} style={{ transformBox: 'fill-box', transformOrigin: 'center' }} />
      <path d="M78 74 C88 66 100 74 100 86" fill="none" stroke="#ffffff" strokeWidth={5} strokeLinecap="round" opacity={0.55} />
      {/* le rythme : boum… boum */}
      {[0, 1].map((i) => (
        <MCircle key={i} cx={100} cy={100} r={40} fill="none" stroke="var(--color-corail)" strokeWidth={3} animate={{ r: [40, 84], opacity: [0.7, 0] }} transition={{ duration: 1.2, delay: i * 0.16, repeat: Infinity, ease: 'easeOut' }} />
      ))}
    </>
  );
}

const FOOD = [
  { x: 100, y: 40 },
  { x: 95, y: 58 },
  { x: 102, y: 80 },
  { x: 95, y: 104 },
  { x: 104, y: 126 },
  { x: 99, y: 148 },
  { x: 100, y: 168 }
];

function Digestion() {
  return (
    <>
      <rect x={62} y={16} width={76} height={168} rx={38} fill="var(--color-rose)" opacity={0.16} />
      {/* le tube digestif */}
      <path d="M100 34 C100 56 88 62 100 82 C112 102 88 108 100 128 C112 148 96 152 100 172" fill="none" stroke="#e09a6d" strokeWidth={13} strokeLinecap="round" opacity={0.55} />
      <path d="M100 34 C100 56 88 62 100 82 C112 102 88 108 100 128 C112 148 96 152 100 172" fill="none" stroke="#f6cfae" strokeWidth={6} strokeLinecap="round" />
      {/* l'estomac qui malaxe */}
      <motion.ellipse cx={102} cy={108} rx={20} ry={14} fill="var(--color-corail)" opacity={0.3} animate={{ scale: [1, 1.14, 1] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }} style={{ transformBox: 'fill-box', transformOrigin: 'center' }} />
      {/* le morceau de pomme qui descend */}
      <MCircle
        cx={FOOD[0].x}
        cy={FOOD[0].y}
        r={6}
        fill="var(--color-corail)"
        animate={{ cx: FOOD.map((p) => p.x), cy: FOOD.map((p) => p.y), opacity: [1, 1, 1, 1, 1, 1, 0.2] }}
        transition={{ duration: 7, times: [0, 0.16, 0.33, 0.5, 0.66, 0.83, 1], repeat: Infinity, repeatDelay: 0.6, ease: 'easeInOut' }}
      />
      {/* les petits morceaux qui nourrissent le corps */}
      {[0, 1, 2].map((i) => (
        <MCircle key={i} cx={100} cy={150} r={3} fill="var(--color-menthe)" initial={{ opacity: 0 }} animate={{ cx: [100, 70 + i * 30], cy: [150, 60 + i * 26], opacity: [0, 1, 0] }} transition={{ duration: 3, delay: i * 0.7, repeat: Infinity, ease: 'easeOut' }} />
      ))}
    </>
  );
}

function Aimant() {
  return (
    <>
      <rect width={200} height={200} fill="var(--color-ciel)" opacity={0.12} />
      <path d="M66 152 V88 A34 34 0 0 1 134 88 V152" fill="none" stroke="var(--color-corail)" strokeWidth={22} strokeLinecap="round" />
      <rect x={55} y={132} width={22} height={26} rx={5} fill="var(--color-ciel)" />
      <rect x={123} y={132} width={22} height={26} rx={5} fill="var(--color-ciel)" />
      {/* le champ magnétique */}
      <motion.path d="M78 158 Q100 190 122 158" fill="none" stroke="var(--color-soleil)" strokeWidth={3} strokeDasharray="6 7" animate={{ opacity: [0.2, 1, 0.2], strokeDashoffset: [0, -26] }} transition={loop(2.4)} />
      <motion.path d="M78 120 Q100 84 122 120" fill="none" stroke="var(--color-soleil)" strokeWidth={3} strokeDasharray="6 7" animate={{ opacity: [1, 0.2, 1], strokeDashoffset: [0, 26] }} transition={loop(2.4)} />
      {/* les trombones qui viennent à l'aimant */}
      {[
        { from: [176, 168], to: [122, 150], delay: 0 },
        { from: [30, 166], to: [78, 152], delay: 0.6 },
        { from: [186, 96], to: [130, 118], delay: 1.2 },
        { from: [18, 100], to: [70, 116], delay: 1.8 }
      ].map((c, i) => (
        <motion.rect
          key={i}
          x={-9}
          y={-3}
          width={18}
          height={6}
          rx={3}
          fill="none"
          stroke="var(--color-encre)"
          strokeWidth={2.5}
          animate={{ x: [c.from[0], c.to[0]], y: [c.from[1], c.to[1]], rotate: [i * 90, i * 45], opacity: [0.9, 1] }}
          transition={{ duration: 1.6, delay: c.delay, repeat: Infinity, repeatDelay: 1.1, ease: 'easeOut' }}
        />
      ))}
    </>
  );
}

function Son() {
  return (
    <>
      <rect width={200} height={200} fill="var(--color-lavande)" opacity={0.12} />
      {/* le tambour */}
      <path d="M26 112 L30 148 Q60 160 90 148 L94 112 Z" fill="var(--color-corail)" />
      <ellipse cx={60} cy={110} rx={34} ry={12} fill="#ffe9d6" />
      <ellipse cx={60} cy={110} rx={34} ry={12} fill="none" stroke="var(--color-corail)" strokeWidth={3} />
      {/* la baguette qui tape */}
      <motion.line x1={86} y1={34} x2={70} y2={92} stroke="#b07a4b" strokeWidth={6} strokeLinecap="round" animate={{ y: [0, 8, 0] }} transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }} />
      {/* les ondes sonores */}
      {[0, 1, 2, 3].map((i) => (
        <MCircle key={i} cx={60} cy={110} r={18} fill="none" stroke="var(--color-soleil)" strokeWidth={4} animate={{ r: [18, 92], opacity: [0.9, 0] }} transition={{ duration: 2, delay: i * 0.5, repeat: Infinity, ease: 'easeOut' }} />
      ))}
      {/* l'enfant qui écoute */}
      <motion.g animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }} style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
        {/* oreille */}
        <ellipse cx={146} cy={107} rx={8} ry={12} fill="#ffe0c4" stroke="var(--color-encre)" strokeWidth={3} />
        <path d="M145 102 C149 104 149 110 145 112" fill="none" stroke="var(--color-encre)" strokeWidth={2.5} strokeLinecap="round" opacity={0.6} />
        {/* tête */}
        <circle cx={168} cy={104} r={27} fill="#ffe8d2" stroke="var(--color-encre)" strokeWidth={3} />
        <path d="M146 88 Q160 72 184 84" fill="none" stroke="var(--color-encre)" strokeWidth={5} strokeLinecap="round" opacity={0.75} />
        <circle cx={177} cy={99} r={2.6} fill="var(--color-encre)" />
        <path d="M172 113 Q177 117 183 112" fill="none" stroke="var(--color-encre)" strokeWidth={2.6} strokeLinecap="round" />
      </motion.g>
    </>
  );
}

function Abeille() {
  return (
    <>
      <rect width={200} height={200} fill="var(--color-menthe)" opacity={0.1} />
      <Sun x={170} y={30} r={13} />
      {/* la fleur */}
      <path d="M46 178 V126" stroke="var(--color-menthe)" strokeWidth={5} strokeLinecap="round" />
      <motion.ellipse cx={34} cy={150} rx={12} ry={6} fill="var(--color-menthe)" transform="rotate(-20 34 150)" />
      {Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return <circle key={i} cx={46 + Math.cos(a) * 11} cy={116 + Math.sin(a) * 11} r={8} fill="var(--color-rose)" />;
      })}
      <circle cx={46} cy={116} r={8} fill="var(--color-soleil)" />
      {/* la ruche */}
      <ellipse cx={152} cy={116} rx={34} ry={38} fill="var(--color-soleil)" />
      <path d="M120 104 Q152 96 184 104 M120 124 Q152 132 184 124 M130 84 Q152 76 174 84" fill="none" stroke="#e0a728" strokeWidth={3} opacity={0.7} />
      <circle cx={152} cy={140} r={8} fill="#6b4a12" opacity={0.8} />
      {/* l'abeille qui butine */}
      <motion.g animate={{ x: [0, 34, 78, 34, 0], y: [0, -34, -8, -30, 0], rotate: [0, -8, 6, -6, 0] }} transition={{ duration: 7, times: [0, 0.28, 0.55, 0.8, 1], repeat: Infinity, ease: 'easeInOut' }}>
        <ellipse cx={62} cy={96} rx={10} ry={7} fill="var(--color-soleil)" />
        <line x1={58} y1={90} x2={58} y2={102} stroke="#4a3d6b" strokeWidth={2.5} />
        <line x1={65} y1={90} x2={65} y2={102} stroke="#4a3d6b" strokeWidth={2.5} />
        <motion.ellipse cx={58} cy={89} rx={9} ry={5} fill="#e8f7ff" stroke="#a9d9f7" strokeWidth={1.5} animate={{ scaleY: [1, 0.35, 1] }} transition={{ duration: 0.22, repeat: Infinity }} style={{ transformBox: 'fill-box', transformOrigin: 'center' }} />
        <circle cx={72} cy={95} r={2} fill="#4a3d6b" />
      </motion.g>
      {/* le pollen qui vole */}
      {[0, 1, 2, 3].map((i) => (
        <MCircle key={i} cx={74 + i * 8} cy={140} r={2.2} fill="var(--color-soleil)" animate={{ cy: [140, 108], opacity: [0, 1, 0] }} transition={{ duration: 2.8, delay: i * 0.5, repeat: Infinity, ease: 'easeOut' }} />
      ))}
    </>
  );
}

const ANIMS: Record<AnimId, () => React.JSX.Element> = {
  pluie: Pluie,
  graine: Graine,
  ciel: Ciel,
  arcenciel: ArcEnCiel,
  saisons: Saisons,
  lune: Lune,
  volcan: Volcan,
  coeur: Coeur,
  digestion: Digestion,
  aimant: Aimant,
  son: Son,
  abeille: Abeille
};

/**
 * L'illustration animée d'une explication.
 * `className` gère la taille (carré, pleine largeur…) : le dessin s'adapte au cadre.
 */
export const ExplainAnim = memo(function ExplainAnim({ anim, className = '' }: { anim: AnimId; className?: string }) {
  const Scene = ANIMS[anim];
  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet">
      <Scene />
    </svg>
  );
});
