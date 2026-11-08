import type { CSSProperties } from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { ArmShape, INK, LegShape, LOOKS } from '../../src/components/mascotArt';
import type { MoveAnim } from '../../src/data/sport';
import type { Animal, Mood } from '../../src/lib/mascots';
import { GESTURES, MOODS, type Mouth } from '../../src/lib/mascotPoses';
import { jump } from '../../src/lib/motion';

/**
 * La même mascotte que dans l'app, mais pilotée image par image : tout est une fonction du temps,
 * donc chaque rendu est identique. Les pattes partent avec un léger décalage pour éviter l'effet « bloc ».
 */

/** Aller-retour doux entre deux angles. */
const swing = (keys: number[], t: number, tempo: number) => keys[0] + (keys[1] - keys[0]) * (0.5 - 0.5 * Math.cos((Math.PI * t) / tempo));

const loopOf = (t: number, period: number) => (t % period) / period;

function hop(t: number, height: number, duration: number): CSSProperties {
  const j = jump(height, duration);
  const times = (j.transition as { times: number[] }).times;
  const p = loopOf(t, duration + 0.08) * ((duration + 0.08) / duration);
  const at = (values: number[]) => interpolate(Math.min(p, 1), times, values);
  return { transform: `translateY(${at(j.y)}px) scale(${at(j.scaleX)}, ${at(j.scaleY)})` };
}

function bodyStyle(gesture: MoveAnim | undefined, mood: Mood, t: number, scale: number): CSSProperties {
  const wave = (period: number) => Math.sin((2 * Math.PI * t) / period);
  const mirror = (tempo: number) => 0.5 - 0.5 * Math.cos((Math.PI * t) / tempo);
  const kind = gesture ?? mood;
  switch (kind) {
    case 'saut':
      return hop(t, 44 * scale, 0.85);
    case 'cheer':
      return hop(t, 22 * scale, 0.7);
    case 'balance':
      return { transform: `rotate(${5 * wave(3)}deg)` };
    case 'hint':
      return { transform: `rotate(${3 * wave(2)}deg)` };
    case 'course': {
      const b = Math.abs(Math.sin((Math.PI * t) / 0.34));
      return { transform: `translateY(${-14 * scale * b}px) scale(1, ${0.95 + 0.09 * b}) rotate(${4 * wave(0.68)}deg)` };
    }
    case 'etire': {
      const m = mirror(2.4);
      return { transform: `translateY(${-6 * m}px) scale(${1 - 0.08 * m}, ${1 + 0.18 * m})` };
    }
    case 'tourne':
      return { transform: `scaleX(${Math.cos((2 * Math.PI * t) / 2.4)})` };
    case 'calme':
    case 'sleep': {
      const m = mirror(3.6);
      return { transform: `translateY(${-4 * m}px) scale(${1 + 0.08 * m})` };
    }
    case 'frappe':
      return { transform: `translateX(${10 * wave(1.1)}px)` };
    default: {
      const m = mirror(1.8);
      return { transform: `scale(${1 - 0.015 * m}, ${1 + 0.04 * m})` };
    }
  }
}

function Mouth({ kind, t }: { kind: Mouth; t: number }) {
  if (kind === 'aucune') return null;
  if (kind === 'parle') return <ellipse cx="100" cy="97" rx="9" ry={4 + 4 * Math.abs(Math.sin(t * 7))} fill="#a8434f" stroke="none" />;
  if (kind === 'joie') return <path d="M86 92 Q100 92 114 92 Q112 110 100 110 Q88 110 86 92 Z" fill="#a8434f" stroke="none" />;
  if (kind === 'oh') return <ellipse cx="100" cy="98" rx="6" ry="7" fill="#a8434f" stroke="none" />;
  return <path d="M88 94 Q100 105 112 94" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />;
}

function Eyes({ animal, closed, t }: { animal: Animal; closed?: boolean; t: number }) {
  const [lx, rx, y, r] = animal === 'hibou' ? [78, 122, 62, 10] : [80, 120, 62, 7.5];
  if (closed)
    return (
      <g fill="none" stroke={INK} strokeWidth="4.5" strokeLinecap="round">
        <path d={`M${lx - 9} ${y} q9 8 18 0`} />
        <path d={`M${rx - 9} ${y} q9 8 18 0`} />
      </g>
    );
  const blink = interpolate(loopOf(t, 4.2), [0, 0.9, 0.94, 0.98, 1], [1, 1, 0.1, 1, 1]);
  return (
    <g>
      {[lx, rx].map((cx) => (
        <g key={cx} stroke="none" transform={`translate(0 ${y * (1 - blink)}) scale(1 ${blink})`}>
          <ellipse cx={cx} cy={y} rx={r} ry={r * 1.15} fill={INK} />
          <circle cx={cx + r * 0.3} cy={y - r * 0.4} r={r * 0.34} fill="#fff" />
        </g>
      ))}
    </g>
  );
}

export function FrameMascot({ animal, mood = 'idle', gesture, size }: { animal: Animal; mood?: Mood; gesture?: MoveAnim; size: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const look = LOOKS[animal];
  const pose = gesture ? GESTURES[gesture] : MOODS[mood];
  const finned = look.leg === 'queue';
  const legY = look.leg === 'courte' ? 180 : 172;
  const angle = (keys: number[], delay = 0) => swing(keys, t - delay, pose.tempo);

  return (
    <div style={{ width: size, transformOrigin: '50% 100%', ...bodyStyle(gesture, mood, t, size / 200) }}>
      <svg viewBox="-12 -16 224 246" style={{ display: 'block', width: '100%', height: 'auto', overflow: 'visible' }} strokeLinejoin="round">
        <g stroke={INK} strokeWidth="3.5">
          {look.tail}
          {finned ? (
            <g transform={`translate(100 178) rotate(${angle((pose.legL ?? [-8, 8]).map((a) => a * 0.5))})`}>
              <LegShape look={look} />
            </g>
          ) : (
            <>
              <g transform={`translate(80 ${legY}) rotate(${angle(pose.legL ?? [0, 0])})`}>
                <LegShape look={look} />
              </g>
              <g transform={`translate(120 ${legY}) rotate(${angle(pose.legR ?? [0, 0], 0.03)})`}>
                <LegShape look={look} />
              </g>
            </>
          )}
          <ellipse cx="100" cy="138" rx="50" ry="50" fill={look.fur} />
          <ellipse cx="100" cy="148" rx="32" ry="35" fill={look.belly} stroke="none" />
          {look.coat}
          <g transform={`translate(56 116) rotate(${angle(pose.armL)})`}>
            <ArmShape look={look} />
          </g>
          <g transform={`translate(144 116) rotate(${angle(pose.armR, 0.05)})`}>
            <ArmShape look={look} />
          </g>
          <g transform={`rotate(${angle(pose.head, -0.04)} 100 118)`}>
            {look.back}
            <ellipse cx="100" cy="68" rx="56" ry="50" fill={look.fur} />
            {look.front}
            <circle cx="62" cy="86" r="8" fill="#ff9aa2" opacity="0.5" stroke="none" />
            <circle cx="138" cy="86" r="8" fill="#ff9aa2" opacity="0.5" stroke="none" />
            <Eyes animal={animal} closed={pose.closed} t={t} />
            {!look.beak && <Mouth kind={pose.mouth} t={t} />}
          </g>
        </g>
      </svg>
    </div>
  );
}
