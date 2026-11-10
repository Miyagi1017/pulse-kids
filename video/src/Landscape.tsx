import { AbsoluteFill, useCurrentFrame } from 'remotion';

/**
 * Le décor de toutes les vidéos : un grand paysage ensoleillé, en couleurs un peu adoucies et en plans
 * superposés comme du papier découpé. Dessin original, entièrement calculé à chaque image.
 * `seed` varie la place des nuages et des maisons d'une activité à l'autre.
 */

const INK = '#47386b';
const LINE = '#4a3a30';
const inked = { stroke: LINE, strokeWidth: 3.4, strokeLinejoin: 'round', strokeLinecap: 'round' } as const;

function Face({ width }: { width: number }) {
  return (
    <svg viewBox="0 0 60 30" width={width}>
      <ellipse cx="18" cy="12" rx="4" ry="5" fill={INK} />
      <ellipse cx="42" cy="12" rx="4" ry="5" fill={INK} />
      <circle cx="19.5" cy="10" r="1.6" fill="#fff" />
      <circle cx="43.5" cy="10" r="1.6" fill="#fff" />
      <ellipse cx="9" cy="20" rx="6" ry="3.5" fill="#ff8fb1" opacity="0.65" />
      <ellipse cx="51" cy="20" rx="6" ry="3.5" fill="#ff8fb1" opacity="0.65" />
      <path d="M25 19 Q27.5 23 30 19 Q32.5 23 35 19" stroke={INK} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Sun({ frame }: { frame: number }) {
  return (
    <div style={{ position: 'absolute', right: 56, top: 28, width: 132, height: 132, transform: `translateY(${6 * Math.sin(frame / 24)}px)` }}>
      <div style={{ position: 'absolute', inset: -46, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,240,170,.75) 0%, rgba(255,240,170,0) 70%)' }} />
      <div style={{ position: 'absolute', inset: 0, transform: `rotate(${frame * 0.4}deg)` }}>
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} style={{ position: 'absolute', left: 58, top: -12, width: 16, height: 32, borderRadius: 8, background: '#fbc95a', border: `3px solid ${LINE}`, transform: `rotate(${i * 36}deg)`, transformOrigin: '8px 78px' }} />
        ))}
      </div>
      <div style={{ position: 'absolute', inset: 14, borderRadius: '50%', background: '#fcd96f', border: `3.5px solid ${LINE}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Face width={72} />
      </div>
    </div>
  );
}

function Cloud({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <svg width={190 * scale} height={92 * scale} viewBox="0 0 190 92" style={{ position: 'absolute', left: x, top: y, overflow: 'visible' }}>
      <path d="M36 84 Q6 84 8 60 Q10 40 34 42 Q40 14 74 18 Q96 -2 122 18 Q154 14 158 44 Q186 46 184 66 Q182 86 156 84 Z" fill="#ffffff" {...inked} />
    </svg>
  );
}

function Cottage({ x, y, roof, flip }: { x: number; y: number; roof: string; flip?: boolean }) {
  return (
    <svg width="150" height="130" viewBox="0 0 150 130" style={{ position: 'absolute', left: x, top: y, overflow: 'visible', transform: flip ? 'scaleX(-1)' : undefined }} {...inked}>
      <rect x="104" y="18" width="20" height="44" fill="#b5664a" />
      <rect x="24" y="56" width="102" height="72" rx="4" fill="#fff4dc" />
      <path d="M8 62 L75 8 L142 62 Z" fill={roof} />
      <rect x="62" y="88" width="28" height="40" rx="12" fill="#5bbdb5" />
      <rect x="36" y="76" width="20" height="20" rx="4" fill="#8fd3f0" />
      <rect x="98" y="76" width="20" height="20" rx="4" fill="#8fd3f0" />
    </svg>
  );
}

function Tree({ x, y, size, color, frame, phase }: { x: number; y: number; size: number; color: string; frame: number; phase: number }) {
  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 100 130" style={{ position: 'absolute', left: x, top: y, overflow: 'visible', transformOrigin: '50% 100%', transform: `rotate(${1.6 * Math.sin(frame / 26 + phase)}deg)` }} {...inked}>
      <rect x="42" y="84" width="16" height="46" rx="6" fill="#9a6b4a" />
      <circle cx="50" cy="48" r="42" fill={color} />
      <circle cx="26" cy="66" r="24" fill={color} />
      <circle cx="74" cy="66" r="24" fill={color} />
      <circle cx="38" cy="34" r="12" fill="#fff" opacity="0.22" stroke="none" />
    </svg>
  );
}

function Flower({ x, y, color, frame, phase }: { x: number; y: number; color: string; frame: number; phase: number }) {
  return (
    <svg width="46" height="70" viewBox="0 0 46 70" style={{ position: 'absolute', left: x, top: y, transformOrigin: '50% 100%', transform: `rotate(${6 * Math.sin(frame / 18 + phase)}deg)` }}>
      <path d="M23 26 Q20 48 23 70" stroke="#4f9a57" strokeWidth="4" fill="none" strokeLinecap="round" />
      {[0, 72, 144, 216, 288].map((a) => (
        <circle key={a} cx="23" cy="10" r="9" fill={color} stroke={LINE} strokeWidth="2" transform={`rotate(${a} 23 24)`} />
      ))}
      <circle cx="23" cy="24" r="8" fill="#ffe08a" stroke={LINE} strokeWidth="2" />
    </svg>
  );
}

function Butterfly({ frame, phase, color }: { frame: number; phase: number; color: string }) {
  const t = (frame + phase) / 30;
  const wing = 0.55 + 0.45 * Math.abs(Math.sin(t * 9));
  return (
    <svg width="44" height="36" viewBox="0 0 44 36" style={{ position: 'absolute', left: 120 + 150 * Math.sin(t * 0.5 + phase) + 150, top: 380 + 46 * Math.sin(t * 0.9 + phase) }}>
      <g transform={`translate(22 0) scale(${wing} 1) translate(-22 0)`}>
        <ellipse cx="12" cy="13" rx="11" ry="12" fill={color} />
        <ellipse cx="32" cy="13" rx="11" ry="12" fill={color} />
        <ellipse cx="14" cy="28" rx="7" ry="7" fill={color} opacity="0.8" />
        <ellipse cx="30" cy="28" rx="7" ry="7" fill={color} opacity="0.8" />
      </g>
      <rect x="20" y="6" width="4" height="26" rx="2" fill={INK} />
    </svg>
  );
}

const FLOWERS = [
  { x: 26, y: 640, color: '#f58fb0', phase: 0 },
  { x: 92, y: 660, color: '#ffffff', phase: 1 },
  { x: 168, y: 646, color: '#b79cf0', phase: 2 },
  { x: 268, y: 664, color: '#ffb36b', phase: 3 },
  { x: 372, y: 650, color: '#f58fb0', phase: 4 },
  { x: 1190, y: 650, color: '#ffffff', phase: 5 },
  { x: 1236, y: 666, color: '#b79cf0', phase: 6 }
];

export function Landscape({ seed }: { seed: number }) {
  const frame = useCurrentFrame();
  const flip = seed % 2 === 0;
  const cloud = (base: number, speed: number) => ((base + (seed % 300) + frame * speed) % 1560) - 220;

  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #8ed1ee 0%, #bfe6f4 42%, #fff1d8 72%)', overflow: 'hidden', filter: 'url(#hdScene)', transform: 'scale(1.04)' }}>
      <Sun frame={frame} />
      <Cloud x={cloud(90, 0.28)} y={46} scale={1} />
      <Cloud x={cloud(620, 0.18)} y={104} scale={0.7} />
      <Cloud x={cloud(1100, 0.34)} y={30} scale={0.85} />

      {/* Plans de collines, du lointain bleuté au proche */}
      <svg viewBox="0 0 1280 720" width="1280" height="720" style={{ position: 'absolute', inset: 0 }}>
        <path d="M0 330 Q200 240 430 310 T860 280 T1280 310 L1280 720 L0 720 Z" fill="#a9d8c0" {...inked} />
        <path d="M0 400 Q260 310 560 390 T1040 360 T1280 390 L1280 720 L0 720 Z" fill="#9bd38a" {...inked} />
      </svg>

      <Cottage x={flip ? 40 : 330} y={268} roof="#d9785a" flip={flip} />
      <Cottage x={flip ? 340 : 60} y={296} roof="#5bbdb5" flip={!flip} />
      <Tree x={flip ? 214 : 214} y={242} size={110} color="#6fbe7c" frame={frame} phase={0} />
      <Tree x={flip ? 468 : 468} y={272} size={84} color="#58ad86" frame={frame} phase={1.5} />
      <Tree x={1120} y={262} size={120} color="#6fbe7c" frame={frame} phase={3} />

      <svg viewBox="0 0 1280 720" width="1280" height="720" style={{ position: 'absolute', inset: 0 }}>
        <path d="M0 500 Q320 430 700 500 T1280 480 L1280 720 L0 720 Z" fill="#7fc76f" {...inked} />
        <g fill="none" stroke="#4f9a57" strokeWidth="3" strokeLinecap="round">
          {[70, 190, 330, 470, 640, 800, 950, 1100, 1220].map((x, i) => (
            <path key={x} d={`M${x} ${540 + (i % 3) * 18} q5 -16 12 -22 M${x + 12} ${542 + (i % 3) * 18} q3 -14 10 -18 M${x - 10} ${544 + (i % 3) * 18} q-3 -12 -10 -15`} />
          ))}
        </g>
      </svg>
      <svg viewBox="0 0 1280 720" width="1280" height="720" style={{ position: 'absolute', inset: 0 }}>
        <path d="M0 610 Q360 560 760 620 T1280 600 L1280 720 L0 720 Z" fill="#69b65f" {...inked} />
      </svg>

      {FLOWERS.map((f) => (
        <Flower key={f.x} {...f} frame={frame} />
      ))}
      <Butterfly frame={frame} phase={0} color="#f58fb0" />
      <Butterfly frame={frame} phase={2.4} color="#ffc65a" />
    </AbsoluteFill>
  );
}
