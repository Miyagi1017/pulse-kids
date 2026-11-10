import { AbsoluteFill } from 'remotion';

/** Le décor des vidéos : un fond uni très doux et un tapis de sport dessiné, pour que l'œil reste sur le geste. */

const LINE = '#4a3a30';
const MATS = [
  ['#9a6fd6', '#8558c4'],
  ['#ee8fa6', '#de768f'],
  ['#5cc0b6', '#46aba1'],
  ['#f5b35e', '#e89d44']
];

export function Studio({ seed }: { seed: number }) {
  const [top, front] = MATS[seed % MATS.length];
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #c3e2f4 0%, #aed3ea 100%)', filter: 'url(#hdScene)' }}>
      <div style={{ position: 'absolute', top: 262, left: 0, right: 0, textAlign: 'center', fontSize: 104, fontWeight: 700, letterSpacing: 8, color: 'rgba(255,255,255,.3)' }}>PULSE KIDS</div>
      <svg viewBox="0 0 1280 720" width="1280" height="720" style={{ position: 'absolute', inset: 0 }}>
        <path d="M60 642 L1220 642 L1220 656 L60 656 Z" fill={front} stroke={LINE} strokeWidth="4" strokeLinejoin="round" />
        <path d="M150 520 L1130 520 L1220 642 L60 642 Z" fill={top} stroke={LINE} strokeWidth="4" strokeLinejoin="round" />
      </svg>
    </AbsoluteFill>
  );
}
