import { memo, type ReactNode } from 'react';
import { motion, type Transition } from 'motion/react';
import type { MoveAnim } from '../data/sport';
import type { Animal, Mood } from '../lib/mascots';
import { BREATHE, calmLoop, hopLoop, type Loop, punchLoop, runLoop, stretchLoop, sway } from '../lib/motion';

/**
 * La troupe de Pulse Kids : 8 animaux dessinés en SVG sur le même squelette, toujours de face
 * (tête, corps, deux pattes avant, deux pattes arrière), pour que le sens du corps reste juste.
 * Les pattes pivotent à l'épaule ou à la hanche. Vu de l'écran : patte gauche + = vers l'extérieur,
 * patte droite − = vers l'extérieur.
 */

const INK = '#3b2c28';

type Arm = 'patte' | 'aile' | 'nageoire';
type Leg = 'patte' | 'fine' | 'courte' | 'queue';

interface Look {
  fur: string;
  belly: string;
  arm: Arm;
  armTip?: string;
  leg: Leg;
  foot: string;
  /** Pas de bouche dessinée : le bec fait office de bouche. */
  beak?: boolean;
  back?: ReactNode;
  tail?: ReactNode;
  front?: ReactNode;
  coat?: ReactNode;
}

const LOOKS: Record<Animal, Look> = {
  tigre: {
    fur: '#f59a3c',
    belly: '#fff3df',
    arm: 'patte',
    leg: 'patte',
    foot: '#fff3df',
    tail: <path d="M140 170 C184 176 190 130 170 118" fill="none" stroke="#f59a3c" strokeWidth="14" strokeLinecap="round" />,
    back: (
      <>
        <circle cx="58" cy="30" r="17" fill="#f59a3c" />
        <circle cx="142" cy="30" r="17" fill="#f59a3c" />
        <circle cx="58" cy="31" r="8" fill="#ffc9a8" stroke="none" />
        <circle cx="142" cy="31" r="8" fill="#ffc9a8" stroke="none" />
      </>
    ),
    front: (
      <>
        <ellipse cx="100" cy="88" rx="30" ry="21" fill="#fff3df" stroke="none" />
        <g stroke={INK} strokeWidth="5" strokeLinecap="round" fill="none">
          <path d="M100 24 v14" />
          <path d="M84 27 l4 12" />
          <path d="M116 27 l-4 12" />
          <path d="M48 62 h13" />
          <path d="M50 78 h12" />
          <path d="M152 62 h-13" />
          <path d="M150 78 h-12" />
        </g>
        <path d="M92 76 h16 l-8 9 z" fill="#d9636b" stroke="none" />
      </>
    ),
    coat: (
      <g stroke={INK} strokeWidth="5" strokeLinecap="round" fill="none">
        <path d="M58 136 h12" />
        <path d="M60 156 h12" />
        <path d="M142 136 h-12" />
        <path d="M140 156 h-12" />
      </g>
    )
  },
  ours: {
    fur: '#a9744a',
    belly: '#ecd2ae',
    arm: 'patte',
    leg: 'patte',
    foot: '#ecd2ae',
    back: (
      <>
        <circle cx="56" cy="28" r="19" fill="#a9744a" />
        <circle cx="144" cy="28" r="19" fill="#a9744a" />
        <circle cx="56" cy="29" r="9" fill="#ecd2ae" stroke="none" />
        <circle cx="144" cy="29" r="9" fill="#ecd2ae" stroke="none" />
      </>
    ),
    front: (
      <>
        <ellipse cx="100" cy="86" rx="27" ry="21" fill="#ecd2ae" stroke="none" />
        <ellipse cx="100" cy="76" rx="10" ry="7" fill={INK} stroke="none" />
      </>
    )
  },
  singe: {
    fur: '#8c5a3c',
    belly: '#f3cfa6',
    arm: 'patte',
    leg: 'patte',
    foot: '#f3cfa6',
    tail: <path d="M138 172 C186 182 190 124 160 124 C146 124 146 144 160 142" fill="none" stroke="#8c5a3c" strokeWidth="11" strokeLinecap="round" />,
    back: (
      <>
        <circle cx="42" cy="70" r="19" fill="#f3cfa6" />
        <circle cx="158" cy="70" r="19" fill="#f3cfa6" />
      </>
    ),
    front: (
      <>
        <path d="M100 42 C116 26 150 44 142 74 C150 108 118 112 100 112 C82 112 50 108 58 74 C50 44 84 26 100 42 Z" fill="#f3cfa6" stroke="none" />
        <circle cx="95" cy="80" r="2.6" fill={INK} stroke="none" />
        <circle cx="105" cy="80" r="2.6" fill={INK} stroke="none" />
      </>
    )
  },
  cerf: {
    fur: '#c98f58',
    belly: '#f7e6cc',
    arm: 'patte',
    leg: 'patte',
    foot: '#6d4a33',
    back: (
      <>
        <g fill="none" stroke="#7a553a" strokeWidth="8" strokeLinecap="round">
          <path d="M74 28 C68 12 62 4 56 -6" />
          <path d="M66 14 C58 14 52 12 46 6" />
          <path d="M126 28 C132 12 138 4 144 -6" />
          <path d="M134 14 C142 14 148 12 154 6" />
        </g>
        <ellipse cx="44" cy="54" rx="20" ry="11" fill="#c98f58" transform="rotate(-20 44 54)" />
        <ellipse cx="156" cy="54" rx="20" ry="11" fill="#c98f58" transform="rotate(20 156 54)" />
      </>
    ),
    front: (
      <>
        <ellipse cx="100" cy="90" rx="25" ry="19" fill="#f7e6cc" stroke="none" />
        <ellipse cx="100" cy="79" rx="9" ry="6" fill={INK} stroke="none" />
        <circle cx="100" cy="36" r="4" fill="#f7e6cc" stroke="none" />
        <circle cx="86" cy="40" r="3" fill="#f7e6cc" stroke="none" />
        <circle cx="114" cy="40" r="3" fill="#f7e6cc" stroke="none" />
      </>
    ),
    coat: (
      <g fill="#f7e6cc" stroke="none">
        <circle cx="62" cy="134" r="5" />
        <circle cx="66" cy="156" r="4" />
        <circle cx="138" cy="134" r="5" />
        <circle cx="134" cy="156" r="4" />
      </g>
    )
  },
  grue: {
    fur: '#fbfbf7',
    belly: '#eef0ee',
    arm: 'aile',
    armTip: '#3b3f4a',
    leg: 'fine',
    foot: '#e8953a',
    beak: true,
    front: (
      <>
        <ellipse cx="100" cy="26" rx="20" ry="9" fill="#e0475a" stroke="none" />
        <path d="M90 78 L110 78 L100 112 Z" fill="#e8953a" />
      </>
    )
  },
  hibou: {
    fur: '#8b6fb3',
    belly: '#e6daf2',
    arm: 'aile',
    armTip: '#6a5292',
    leg: 'courte',
    foot: '#f2b13e',
    beak: true,
    back: (
      <>
        <path d="M50 44 L46 6 L84 28 Z" fill="#8b6fb3" />
        <path d="M150 44 L154 6 L116 28 Z" fill="#8b6fb3" />
      </>
    ),
    front: (
      <>
        <circle cx="78" cy="62" r="23" fill="#ffe08a" stroke="none" />
        <circle cx="122" cy="62" r="23" fill="#ffe08a" stroke="none" />
        <path d="M92 80 h16 l-8 13 z" fill="#f2b13e" />
      </>
    ),
    coat: (
      <g fill="none" stroke="#b49bd1" strokeWidth="4" strokeLinecap="round">
        <path d="M84 134 q6 7 12 0 q6 7 12 0 q5 6 9 0" />
        <path d="M86 154 q6 7 12 0 q6 7 12 0" />
      </g>
    )
  },
  pingouin: {
    fur: '#34405e',
    belly: '#fbfbf7',
    arm: 'nageoire',
    leg: 'courte',
    foot: '#f2913e',
    beak: true,
    front: (
      <>
        <path d="M100 40 C112 22 150 34 146 72 C146 100 120 110 100 110 C80 110 54 100 54 72 C50 34 88 22 100 40 Z" fill="#fbfbf7" stroke="none" />
        <path d="M88 78 h24 l-12 13 z" fill="#f2913e" />
      </>
    )
  },
  dauphin: {
    fur: '#5aa7d9',
    belly: '#eaf5fc',
    arm: 'nageoire',
    leg: 'queue',
    foot: '#5aa7d9',
    back: <path d="M84 28 Q102 -14 120 28 Z" fill="#4a8fc0" />,
    front: <ellipse cx="100" cy="92" rx="31" ry="18" fill="#bfe0f4" stroke="none" />
  }
};

/* ---------- Mouvements ---------- */

type Mouth = 'sourire' | 'parle' | 'joie' | 'oh' | 'aucune';

interface Pose {
  armL: number[];
  armR: number[];
  legL?: number[];
  legR?: number[];
  head: number[];
  /** Durée d'un aller, en secondes. */
  tempo: number;
  body: Loop;
  closed?: boolean;
  mouth: Mouth;
}

const STILL: Loop = BREATHE as Loop;

const MOODS: Record<Mood, Pose> = {
  idle: { armL: [6, 12], armR: [-6, -12], head: [-3, 3], tempo: 1.8, body: STILL, mouth: 'sourire' },
  talk: { armL: [8, 14], armR: [-20, -62], head: [-4, 4], tempo: 0.7, body: STILL, mouth: 'parle' },
  cheer: { armL: [120, 150], armR: [-120, -150], head: [-6, 6], tempo: 0.35, body: hopLoop(22, 0.7), mouth: 'joie' },
  hint: { armL: [6, 10], armR: [-95, -112], head: [6, 12], tempo: 0.5, body: sway(3, 1), mouth: 'sourire' },
  oops: { armL: [25, 36], armR: [-25, -36], head: [-10, 10], tempo: 0.42, body: STILL, mouth: 'oh' },
  sleep: { armL: [4, 6], armR: [-4, -6], head: [10, 14], tempo: 3.6, body: calmLoop(3.6), closed: true, mouth: 'aucune' }
};

/** Tourner sur soi-même : on écrase la largeur et on passe de l'autre côté, sans jamais se retrouver la tête en bas. */
const SPIN_IN_PLACE: Loop = { animate: { scaleX: [1, 0.15, -1, 0.15, 1] }, transition: { duration: 2.4, repeat: Infinity, ease: 'linear' } };

const GESTURES: Record<MoveAnim, Pose> = {
  saut: { armL: [30, 140], armR: [-30, -140], legL: [0, 14], legR: [0, -14], head: [-3, 3], tempo: 0.42, body: hopLoop(44, 0.85), mouth: 'joie' },
  balance: { armL: [85, 96], armR: [-85, -96], legL: [0, 2], legR: [-58, -66], head: [-3, 3], tempo: 1.5, body: sway(5, 1.5), mouth: 'sourire' },
  course: { armL: [-35, 35], armR: [35, -35], legL: [32, -32], legR: [-32, 32], head: [-3, 3], tempo: 0.34, body: runLoop(0.34), mouth: 'joie' },
  etire: { armL: [118, 146], armR: [-118, -146], head: [-3, 3], tempo: 2.4, body: stretchLoop(2.4), mouth: 'sourire' },
  tourne: { armL: [80, 100], armR: [-80, -100], head: [0, 0], tempo: 0.8, body: SPIN_IN_PLACE, mouth: 'joie' },
  calme: { armL: [10, 30], armR: [-10, -30], head: [-2, 2], tempo: 3.6, body: calmLoop(3.6), closed: true, mouth: 'sourire' },
  frappe: { armL: [70, 12], armR: [-12, -85], head: [-3, 3], tempo: 0.55, body: punchLoop(0.9), mouth: 'sourire' }
};

/* ---------- Dessin ---------- */

const Limb = ({ x, y, keyframes, tempo, children }: { x: number; y: number; keyframes: number[]; tempo: number; children: ReactNode }) => (
  <g transform={`translate(${x} ${y})`}>
    <motion.g style={{ originX: 0.5, originY: 0 }} animate={{ rotate: keyframes }} transition={{ duration: tempo, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}>
      {children}
    </motion.g>
  </g>
);

function ArmShape({ look }: { look: Look }) {
  if (look.arm === 'aile')
    return (
      <>
        <path d="M0 -2 C22 12 20 48 0 66 C-20 48 -22 12 0 -2 Z" fill={look.fur} />
        <path d="M-13 44 C-8 54 -4 61 0 66 C4 61 8 54 13 44 C5 50 -5 50 -13 44 Z" fill={look.armTip} stroke="none" />
      </>
    );
  if (look.arm === 'nageoire') return <path d="M0 -2 C16 8 18 36 3 52 C-1 56 -9 54 -11 46 C-16 28 -12 6 0 -2 Z" fill={look.fur} />;
  return (
    <>
      <rect x="-12" y="-2" width="24" height="58" rx="12" fill={look.fur} />
      <ellipse cx="0" cy="50" rx="10" ry="7" fill={look.belly} stroke="none" />
    </>
  );
}

function LegShape({ look }: { look: Look }) {
  if (look.leg === 'queue') return <path d="M0 -6 C-6 16 -18 28 -36 32 C-18 42 -6 40 0 32 C6 40 18 42 36 32 C18 28 6 16 0 -6 Z" fill={look.fur} />;
  if (look.leg === 'fine')
    return (
      <>
        <rect x="-3.5" y="0" width="7" height="38" rx="3.5" fill={look.foot} />
        <ellipse cx="0" cy="40" rx="15" ry="6" fill={look.foot} />
      </>
    );
  if (look.leg === 'courte')
    return (
      <>
        <rect x="-8" y="0" width="16" height="14" rx="6" fill={look.foot} />
        <ellipse cx="0" cy="17" rx="19" ry="8" fill={look.foot} />
      </>
    );
  return (
    <>
      <rect x="-14" y="0" width="28" height="38" rx="13" fill={look.fur} />
      <ellipse cx="0" cy="38" rx="18" ry="9" fill={look.foot} />
    </>
  );
}

function Eyes({ animal, closed }: { animal: Animal; closed?: boolean }) {
  const [lx, rx, y, r] = animal === 'hibou' ? [78, 122, 62, 10] : [80, 120, 62, 7.5];
  if (closed)
    return (
      <g fill="none" stroke={INK} strokeWidth="4.5" strokeLinecap="round">
        <path d={`M${lx - 9} ${y} q9 8 18 0`} />
        <path d={`M${rx - 9} ${y} q9 8 18 0`} />
      </g>
    );
  return (
    <motion.g animate={{ scaleY: [1, 1, 0.1, 1, 1] }} transition={{ duration: 4.2, times: [0, 0.9, 0.94, 0.98, 1], repeat: Infinity }}>
      {[lx, rx].map((cx) => (
        <g key={cx} stroke="none">
          <ellipse cx={cx} cy={y} rx={r} ry={r * 1.15} fill={INK} />
          <circle cx={cx + r * 0.3} cy={y - r * 0.4} r={r * 0.34} fill="#fff" />
        </g>
      ))}
    </motion.g>
  );
}

function MouthShape({ kind }: { kind: Mouth }) {
  if (kind === 'aucune') return null;
  if (kind === 'parle') return <motion.ellipse cx="100" cy="97" rx="9" ry="8" fill="#a8434f" stroke="none" animate={{ scaleY: [0.35, 1] }} transition={{ duration: 0.22, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }} />;
  if (kind === 'joie') return <path d="M86 92 Q100 92 114 92 Q112 110 100 110 Q88 110 86 92 Z" fill="#a8434f" stroke="none" />;
  if (kind === 'oh') return <ellipse cx="100" cy="98" rx="6" ry="7" fill="#a8434f" stroke="none" />;
  return <path d="M88 94 Q100 105 112 94" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />;
}

export const Mascot = memo(function Mascot({ animal, mood = 'idle', gesture, size = 160, className = '' }: { animal: Animal; mood?: Mood; gesture?: MoveAnim; size?: number; className?: string }) {
  const look = LOOKS[animal];
  const pose = gesture ? GESTURES[gesture] : MOODS[mood];
  const finned = look.leg === 'queue';
  const legY = look.leg === 'courte' ? 180 : 172;

  return (
    <motion.span className={`inline-block ${className}`} style={{ width: size, originY: 1 }} animate={pose.body.animate} transition={pose.body.transition} aria-hidden>
      <svg viewBox="-12 -16 224 246" className="block w-full h-auto overflow-visible" strokeLinejoin="round">
        <g stroke={INK} strokeWidth="3.5">
          {look.tail}

          {finned ? (
            <Limb x={100} y={178} keyframes={(pose.legL ?? [-8, 8]).map((a) => a * 0.5)} tempo={pose.tempo}>
              <LegShape look={look} />
            </Limb>
          ) : (
            <>
              <Limb x={80} y={legY} keyframes={pose.legL ?? [0, 0]} tempo={pose.tempo}>
                <LegShape look={look} />
              </Limb>
              <Limb x={120} y={legY} keyframes={pose.legR ?? [0, 0]} tempo={pose.tempo}>
                <LegShape look={look} />
              </Limb>
            </>
          )}

          <ellipse cx="100" cy="138" rx="50" ry="50" fill={look.fur} />
          <ellipse cx="100" cy="148" rx="32" ry="35" fill={look.belly} stroke="none" />
          {look.coat}

          <Limb x={56} y={116} keyframes={pose.armL} tempo={pose.tempo}>
            <ArmShape look={look} />
          </Limb>
          <Limb x={144} y={116} keyframes={pose.armR} tempo={pose.tempo}>
            <ArmShape look={look} />
          </Limb>

          <motion.g style={{ originX: 0.5, originY: 1 }} animate={{ rotate: pose.head }} transition={{ duration: pose.tempo, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}>
            {look.back}
            <ellipse cx="100" cy="68" rx="56" ry="50" fill={look.fur} />
            {look.front}
            <circle cx="62" cy="86" r="8" fill="#ff9aa2" opacity="0.5" stroke="none" />
            <circle cx="138" cy="86" r="8" fill="#ff9aa2" opacity="0.5" stroke="none" />
            <Eyes animal={animal} closed={pose.closed} />
            {!look.beak && <MouthShape kind={pose.mouth} />}
          </motion.g>
        </g>

        {!gesture && mood === 'sleep' && (
          <motion.text x="160" y="24" fontSize="30" fontWeight="700" fill="#a9b4f5" animate={{ y: [0, -22], opacity: [0, 1, 0] }} transition={{ duration: 2.6, repeat: Infinity, ease: 'easeOut' }}>
            z
          </motion.text>
        )}
      </svg>
    </motion.span>
  );
});
