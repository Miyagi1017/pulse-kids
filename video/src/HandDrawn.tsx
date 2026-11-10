import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';

/**
 * Le rendu « dessiné à la main » : des filtres qui rendent les traits irréguliers (ils changent doucement,
 * quelques fois par seconde) et des textures de lavis et de papier posées sur tout.
 */

const BOIL_EVERY = 10; // le trait ne change que 3 fois par seconde : vivant, sans gêner le mouvement

export function HandDrawnFilters() {
  const frame = useCurrentFrame();
  const boil = (Math.floor(frame / BOIL_EVERY) % 6) + 1;
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
      <defs>
        <filter id="hdLine" x="-8%" y="-8%" width="116%" height="116%">
          <feTurbulence type="fractalNoise" baseFrequency="0.028" numOctaves="2" seed={boil} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="hdScene" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="2" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="10" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="hdPaper" x="-4%" y="-4%" width="108%" height="108%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="1" seed="9" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="3.5" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}

/** Lavis d'aquarelle et grain du papier, par-dessus toute l'image. */
export function PaperTexture() {
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <Img src={staticFile('texture-wash.jpg')} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', mixBlendMode: 'multiply', opacity: 0.38 }} />
      <Img src={staticFile('texture-grain.jpg')} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', mixBlendMode: 'multiply', opacity: 0.42 }} />
    </AbsoluteFill>
  );
}
