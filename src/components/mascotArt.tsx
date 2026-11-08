import type { ReactNode } from 'react';
import type { Animal } from '../lib/mascots';

/** Le dessin des 8 mascottes : partagé entre l'app (components/Mascot.tsx) et les vidéos (dossier video/). */

export const INK = '#3b2c28';

type Arm = 'patte' | 'aile' | 'nageoire';
type Leg = 'patte' | 'fine' | 'courte' | 'queue';

export interface Look {
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

export const LOOKS: Record<Animal, Look> = {
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

export function ArmShape({ look }: { look: Look }) {
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

export function LegShape({ look }: { look: Look }) {
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

