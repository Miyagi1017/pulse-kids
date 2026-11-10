import type { Look } from '../../src/components/mascotArt';

/**
 * L'enfant qui bouge avec la mascotte dans les vidéos : même gabarit et mêmes articulations que les animaux,
 * donc mêmes gestes. Dessin original, décliné pour que toutes les vidéos ne montrent pas le même enfant.
 */

const SKINS = ['#f7cfa8', '#c98f5f', '#e8b282', '#8a5a3a'];
const HAIRS = ['#6b4226', '#2f2320', '#a8622c', '#1f1a1a'];
const SHIRTS = ['#5bbdb5', '#ff8f6b', '#ffcb57', '#8d9bf0'];
const SHOES = ['#f4f1e6', '#e4574c', '#4d7fd1', '#f4f1e6'];

const fringe = 'M45 60 C44 8 156 8 155 60 C142 42 124 36 104 44 C88 36 62 42 45 60 Z';

function hairBack(hair: string, ribbon: string, tails: boolean) {
  if (!tails) return <path d="M40 66 C36 2 164 2 160 66 Z" fill={hair} />;
  return (
    <>
      <path d="M40 66 C36 2 164 2 160 66 Z" fill={hair} />
      <circle cx="30" cy="74" r="22" fill={hair} />
      <circle cx="170" cy="74" r="22" fill={hair} />
      <circle cx="44" cy="56" r="8" fill={ribbon} />
      <circle cx="156" cy="56" r="8" fill={ribbon} />
    </>
  );
}

function shirt(color: string, accent: string) {
  return (
    <>
      <ellipse cx="100" cy="138" rx="50" ry="50" fill={color} />
      <path d="M100 124 l6 13 14 2 -10 10 3 14 -13 -7 -13 7 3 -14 -10 -10 14 -2 Z" fill={accent} stroke="none" />
    </>
  );
}

export function kidLook(seed: number): Look {
  const skin = SKINS[seed % SKINS.length];
  const hair = HAIRS[(seed >> 2) % HAIRS.length];
  const color = SHIRTS[(seed >> 4) % SHIRTS.length];
  return {
    fur: skin,
    belly: skin,
    arm: 'patte',
    leg: 'patte',
    foot: SHOES[(seed >> 6) % SHOES.length],
    back: hairBack(hair, SHIRTS[((seed >> 4) + 1) % SHIRTS.length], (seed >> 8) % 2 === 0),
    front: <path d={fringe} fill={hair} />,
    coat: shirt(color, '#fff8ec')
  };
}
