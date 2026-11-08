import { memo, type ReactNode } from 'react';
import { motion } from 'motion/react';
import type { MoveAnim } from '../data/sport';
import type { Animal, Mood } from '../lib/mascots';
import { GESTURES, MOODS, type Mouth } from '../lib/mascotPoses';
import { ArmShape, INK, LegShape, LOOKS } from './mascotArt';

/**
 * La troupe de Pulse Kids : 8 animaux dessinés en SVG sur le même squelette, toujours de face
 * (tête, corps, deux pattes avant, deux pattes arrière), pour que le sens du corps reste juste.
 * Les pattes pivotent à l'épaule ou à la hanche. Vu de l'écran : patte gauche + = vers l'extérieur,
 * patte droite − = vers l'extérieur.
 */

/* ---------- Dessin ---------- */

const Limb = ({ x, y, keyframes, tempo, children }: { x: number; y: number; keyframes: number[]; tempo: number; children: ReactNode }) => (
  <g transform={`translate(${x} ${y})`}>
    <motion.g style={{ originX: 0.5, originY: 0 }} animate={{ rotate: keyframes }} transition={{ duration: tempo, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}>
      {children}
    </motion.g>
  </g>
);

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
