import { useCurrentFrame, useVideoConfig } from 'remotion';
import type { SportMove } from '../../src/data/sport';

/**
 * Des signes dessinés autour de la mascotte pour montrer le geste sans savoir lire :
 * flèches, trait de vitesse, flèche qui tourne, souffle…
 */

const LINE = '#4a3a30';
const CORAL = '#f47a68';
const TEAL = '#5bbdb5';
const SUN = '#fbc95a';

export type Sign = SportMove['anim'] | 'pousse' | 'baisse';

/** Le texte de la consigne précise le geste quand l'animation seule ne suffit pas. */
export function signFor(move: Pick<SportMove, 'anim' | 'text'>): Sign {
  if (/pousse/i.test(move.text)) return 'pousse';
  if (/accroupis|plie les genoux|baisse|redescend|ramasse/i.test(move.text) && move.anim !== 'saut') return 'baisse';
  return move.anim;
}

/** Le mot d'indication affiché au-dessus de la mascotte. */
export const SIGN_LABELS: Record<Sign, string> = {
  saut: 'Saute !',
  balance: 'En équilibre',
  course: 'Bouge vite !',
  etire: 'Grandis-toi !',
  tourne: 'Tourne !',
  calme: 'Respire',
  frappe: 'En avant !',
  pousse: 'Pousse !',
  baisse: 'Plie les genoux'
};

const ink = { stroke: LINE, strokeWidth: 3.5, strokeLinejoin: 'round', strokeLinecap: 'round' } as const;
const ARROW = 'M0 -42 L27 -8 L10 -8 L10 40 L-10 40 L-10 -8 L-27 -8 Z';

function Arrow({ x, y, angle = 0, scale = 1, color = CORAL, opacity = 1 }: { x: number; y: number; angle?: number; scale?: number; color?: string; opacity?: number }) {
  return <path d={ARROW} fill={color} opacity={opacity} transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`} {...ink} />;
}

export function MoveSigns({ move }: { move: Pick<SportMove, 'anim' | 'text'> }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const pulse = (period: number, phase = 0) => 0.5 - 0.5 * Math.cos((2 * Math.PI * (t + phase)) / period);
  const sign = signFor(move);

  let content = null;
  switch (sign) {
    case 'saut': {
      const up = pulse(0.84);
      content = (
        <>
          <Arrow x={34} y={230 - 34 * up} />
          <Arrow x={406} y={230 - 34 * up} color={TEAL} />
          <g fill="none" {...ink} strokeWidth={5} opacity={1 - up}>
            <path d="M120 446 l-26 12 M220 452 v16 M320 446 l26 12" />
          </g>
        </>
      );
      break;
    }
    case 'balance': {
      const rock = 9 * Math.sin((2 * Math.PI * t) / 3);
      content = (
        <g transform={`rotate(${rock} 220 300)`}>
          <path d="M92 74 Q220 -26 348 74" fill="none" stroke={LINE} strokeWidth={15} strokeLinecap="round" />
          <path d="M92 74 Q220 -26 348 74" fill="none" stroke={SUN} strokeWidth={9} strokeLinecap="round" />
          <path d="M60 104 L78 50 L120 88 Z" fill={SUN} {...ink} />
          <path d="M380 104 L362 50 L320 88 Z" fill={SUN} {...ink} />
        </g>
      );
      break;
    }
    case 'course': {
      const shift = (i: number) => ((t * 1.7 + i * 0.33) % 1) * 46;
      content = (
        <>
          <g fill="none" {...ink} strokeWidth={6}>
            {[170, 240, 310].map((y, i) => (
              <path key={y} d={`M${70 - shift(i)} ${y} h-46`} opacity={1 - shift(i) / 60} />
            ))}
          </g>
          <Arrow x={392} y={290} scale={0.72} color={SUN} opacity={0.35 + 0.65 * pulse(0.92)} />
          <Arrow x={392} y={378} scale={0.72} color={CORAL} opacity={0.35 + 0.65 * pulse(0.92, 0.46)} />
        </>
      );
      break;
    }
    case 'etire': {
      const up = pulse(4.8);
      content = (
        <>
          <Arrow x={46} y={150 - 34 * up} angle={-16} />
          <Arrow x={394} y={150 - 34 * up} angle={16} color={TEAL} />
        </>
      );
      break;
    }
    case 'pousse': {
      const p = pulse(2.4);
      content = <Arrow x={372 + 26 * p} y={250} angle={90} scale={1.05} />;
      break;
    }
    case 'baisse': {
      const d = pulse(2.8);
      content = (
        <>
          <Arrow x={44} y={210 + 36 * d} angle={180} color={TEAL} />
          <Arrow x={396} y={210 + 36 * d} angle={180} />
        </>
      );
      break;
    }
    case 'tourne': {
      const a = ((t / 3.2) % 1) * 2 * Math.PI;
      const hx = 220 + 196 * Math.cos(a);
      const hy = 300 + 44 * Math.sin(a);
      const dir = (Math.atan2(44 * Math.cos(a), -196 * Math.sin(a)) * 180) / Math.PI + 90;
      content = (
        <>
          <ellipse cx="220" cy="300" rx="196" ry="44" fill="none" stroke={TEAL} strokeWidth={8} strokeDasharray="4 22" strokeLinecap="round" />
          <Arrow x={hx} y={hy} angle={dir} scale={0.7} />
        </>
      );
      break;
    }
    case 'calme': {
      const breath = pulse(7.2);
      content = (
        <>
          <circle cx="396" cy="130" r={18 + 26 * breath} fill="#cdeaf6" {...ink} />
          <g fill="none" {...ink} strokeWidth={5} opacity={1 - breath}>
            <path d="M322 196 q18 -14 36 0 t36 0" />
            <path d="M332 226 q15 -12 30 0 t30 0" />
          </g>
        </>
      );
      break;
    }
    case 'frappe': {
      content = <Arrow x={380 + 18 * pulse(1.1)} y={240} angle={90} scale={0.9} color={SUN} />;
      break;
    }
  }

  return (
    <svg viewBox="0 0 440 470" width="440" height="470" style={{ position: 'absolute', left: 0, bottom: -6, overflow: 'visible', filter: 'url(#hdPaper)' }}>
      {content}
    </svg>
  );
}
