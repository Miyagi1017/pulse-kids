import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

const INK = '#47386b';

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

const RISING = ['💖', '🌸', '💕', '⭐'];
const MOCHIS = [
  { x: 40, size: 92, color: '#ffc4dc', phase: 0 },
  { x: 610, size: 74, color: '#c9f0dc', phase: 15 },
  { x: 1130, size: 86, color: '#fff0a8', phase: 30 }
];

/** Le fond animé kawaii de l'app, recalculé à chaque image (aucun hasard : les rendus sont identiques). */
export function KawaiiBackground() {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #ffe9f3 0%, #f3ecff 50%, #fff6fb 100%)', overflow: 'hidden' }}>
      {/* Soleil qui sourit */}
      <div style={{ position: 'absolute', right: 40, top: 26, width: 130, height: 130, transform: `translateY(${8 * Math.sin(frame / 22)}px)` }}>
        <div style={{ position: 'absolute', inset: 0, transform: `rotate(${frame * 0.5}deg)` }}>
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} style={{ position: 'absolute', left: 58, top: -8, width: 14, height: 30, borderRadius: 7, background: '#ffd76a', transform: `rotate(${i * 45}deg)`, transformOrigin: '7px 73px' }} />
          ))}
        </div>
        <div style={{ position: 'absolute', inset: 18, borderRadius: '50%', background: '#ffe48f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Face width={72} />
        </div>
      </div>

      {/* Cœurs et fleurs qui montent */}
      {Array.from({ length: 10 }, (_, i) => {
        const period = 300 + (i % 4) * 60;
        const p = ((frame + i * 47) % period) / period;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              // Uniquement du côté de la mascotte : le texte reste bien lisible à droite.
              left: 24 + i * 48 + 26 * Math.sin(p * Math.PI * 2),
              top: 760 - p * 860,
              fontSize: 40,
              opacity: interpolate(p, [0, 0.12, 0.85, 1], [0, 0.7, 0.7, 0])
            }}
          >
            {RISING[i % 4]}
          </div>
        );
      })}

      {/* Étoiles qui scintillent */}
      {Array.from({ length: 12 }, (_, i) => {
        const s = 0.5 + 0.5 * Math.sin(frame / (14 + (i % 3) * 5) + i);
        return (
          <div key={`s${i}`} style={{ position: 'absolute', left: `${(i * 37 + 3) % 38}%`, top: `${(i * 29 + 12) % 80}%`, color: '#ff9ec7', fontSize: 26, opacity: 0.2 + 0.7 * s, transform: `scale(${0.7 + 0.5 * s})` }}>
            ✦
          </div>
        );
      })}

      {/* Mochis qui rebondissent */}
      {MOCHIS.map((m) => {
        const p = ((frame + m.phase) % 45) / 45;
        const y = interpolate(p, [0, 0.45, 0.85, 1], [0, -30, 0, 0]);
        const sy = interpolate(p, [0, 0.45, 0.85, 1], [0.86, 1.08, 0.82, 0.86]);
        const sx = interpolate(p, [0, 0.45, 0.85, 1], [1.1, 0.95, 1.14, 1.1]);
        return (
          <div
            key={m.x}
            style={{
              position: 'absolute',
              left: m.x,
              bottom: 6,
              width: m.size,
              height: m.size * 0.78,
              background: m.color,
              borderRadius: '50% 50% 45% 45%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transformOrigin: '50% 100%',
              transform: `translateY(${y}px) scale(${sx}, ${sy})`
            }}
          >
            <Face width={m.size * 0.6} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
}
