import type { CSSProperties } from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { ArmShape, INK, LegShape, type Look, LOOKS } from '../../src/components/mascotArt';
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
const smooth = (k: number) => k * k * (3 - 2 * k);
const clamp01 = (k: number) => Math.min(1, Math.max(0, k));

export interface BodyMotion {
  x: number;
  y: number;
  sx: number;
  sy: number;
  rotate: number;
}

const REST: BodyMotion = { x: 0, y: 0, sx: 1, sy: 1, rotate: 0 };

/** Saut continu : on s'accroupit, on monte, on redescend en arc, on amortit ; l'étirement suit la vitesse. */
function hop(t: number, height: number, period: number): BodyMotion {
  const p = loopOf(t, period);
  const q = clamp01((p - 0.14) / 0.72);
  const toGround = Math.min(p, 1 - p);
  const crouch = smooth(clamp01(1 - toGround / 0.2));
  const sy = 1 - 0.13 * crouch + 0.1 * Math.sin(2 * Math.PI * q) ** 2;
  return { ...REST, y: -height * Math.sin(Math.PI * q) ** 2, sy, sx: 1 / Math.sqrt(sy) };
}

/** Mouvement du corps à l'instant t : toutes les courbes sont continues, sans à-coup. */
export function bodyMotion(gesture: MoveAnim | undefined, mood: Mood, t: number, scale: number, tempo: number): BodyMotion {
  const wave = (period: number) => Math.sin((2 * Math.PI * t) / period);
  const mirror = (duration: number) => 0.5 - 0.5 * Math.cos((Math.PI * t) / duration);
  switch (gesture ?? mood) {
    case 'saut':
      return hop(t, 44 * scale, tempo * 2);
    case 'cheer':
      return hop(t, 22 * scale, tempo * 2);
    case 'balance':
      return { ...REST, rotate: 5 * wave(3) };
    case 'hint':
      return { ...REST, rotate: 3 * wave(2) };
    case 'course': {
      const b = 0.5 - 0.5 * Math.cos((2 * Math.PI * t) / tempo);
      return { ...REST, y: -13 * scale * b, sy: 0.97 + 0.06 * b, sx: 1.015 - 0.03 * b, rotate: 3.5 * wave(tempo * 2) };
    }
    case 'etire': {
      const m = mirror(2.4);
      return { ...REST, y: -6 * m, sx: 1 - 0.08 * m, sy: 1 + 0.18 * m };
    }
    case 'tourne': {
      // Jamais tout à fait plate : la mascotte reste visible au milieu du demi-tour.
      const c = Math.cos((2 * Math.PI * t) / 3.2);
      return { ...REST, sx: (c < 0 ? -1 : 1) * Math.max(0.42, Math.abs(c)) };
    }
    case 'calme':
    case 'sleep': {
      const m = mirror(3.6);
      return { ...REST, y: -4 * m, sx: 1 + 0.08 * m, sy: 1 + 0.08 * m };
    }
    case 'frappe':
      return { ...REST, x: 10 * wave(1.1) };
    default: {
      const m = mirror(1.8);
      return { ...REST, sx: 1 - 0.015 * m, sy: 1 + 0.04 * m };
    }
  }
}

function bodyStyle(m: BodyMotion): CSSProperties {
  return { transform: `translate(${m.x}px, ${m.y}px) rotate(${m.rotate}deg) scale(${m.sx}, ${m.sy})` };
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

export function FrameMascot({ animal, mood = 'idle', gesture, size, costume, phase = 0 }: { animal: Animal; mood?: Mood; gesture?: MoveAnim; size: number; costume?: Look; phase?: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps + phase;
  const look = costume ?? LOOKS[animal];
  const pose = gesture ? GESTURES[gesture] : MOODS[mood];
  const finned = look.leg === 'queue';
  const legY = look.leg === 'courte' ? 180 : 172;
  // La course est un peu ralentie : c'est plus lisible et plus souple pour un enfant.
  const tempo = gesture === 'course' ? 0.46 : pose.tempo;
  const angle = (keys: number[], delay = 0) => swing(keys, t - delay, tempo);

  return (
    <div style={{ position: 'relative', width: size }}>
      {/* Ombre au sol : la mascotte est posée sur l'herbe */}
      <div style={{ position: 'absolute', left: '20%', right: '20%', bottom: -4, height: size * 0.075, borderRadius: '50%', background: 'rgba(40,70,30,.32)' }} />
      <div style={{ transformOrigin: '50% 100%', ...bodyStyle(bodyMotion(gesture, mood, t, size / 200, tempo)) }}>
      <svg viewBox="-12 -16 224 246" style={{ display: 'block', width: '100%', height: 'auto', overflow: 'visible', filter: 'url(#hdLine)' }} strokeLinejoin="round">
        <defs>
          {/* Ombre au crayon : des hachures qui ne couvrent que le côté bas et droit */}
          <pattern id="pkHatch" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
            <line x1="0" y1="0" x2="0" y2="9" stroke="#3b2c28" strokeWidth="2.6" strokeOpacity="0.34" strokeLinecap="round" />
          </pattern>
          <radialGradient id="pkFade" cx="34%" cy="26%" r="84%">
            <stop offset="58%" stopColor="#000" />
            <stop offset="84%" stopColor="#fff" />
          </radialGradient>
          <mask id="pkShade" maskContentUnits="objectBoundingBox">
            <rect width="1" height="1" fill="url(#pkFade)" />
          </mask>
        </defs>
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
          <ellipse cx="100" cy="138" rx="48" ry="48" fill="url(#pkHatch)" stroke="none" mask="url(#pkShade)" />
          <g transform={`translate(56 116) rotate(${angle(pose.armL)})`}>
            <ArmShape look={look} />
          </g>
          <g transform={`translate(144 116) rotate(${angle(pose.armR, 0.07)})`}>
            <ArmShape look={look} />
          </g>
          <g transform={`rotate(${angle(pose.head, 0.1)} 100 118)`}>
            {look.back}
            <ellipse cx="100" cy="68" rx="56" ry="50" fill={look.fur} />
            <ellipse cx="100" cy="68" rx="54" ry="48" fill="url(#pkHatch)" stroke="none" mask="url(#pkShade)" />
            {look.front}
            <circle cx="62" cy="86" r="8" fill="#ff9aa2" opacity="0.5" stroke="none" />
            <circle cx="138" cy="86" r="8" fill="#ff9aa2" opacity="0.5" stroke="none" />
            <Eyes animal={animal} closed={pose.closed} t={t} />
            {!look.beak && <Mouth kind={pose.mouth} t={t} />}
          </g>
        </g>
      </svg>
      </div>
    </div>
  );
}
