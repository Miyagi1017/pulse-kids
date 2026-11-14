/**
 * Les « peaux » des jeux : les cartes, panneaux et textes prennent la matière du style du thème,
 * pour que le jeu et son décor (src/kits/themeScene.ts) racontent le même univers.
 *  pop-up : carte en papier découpé (large bord blanc, tranche grise, ombre portée), un peu de travers ;
 *  crayon : papier crème, contour indigo bossu, écriture à la main ;
 *  aquarelle : papier chaud taché de lavis, serif italique ;
 *  tableau blanc : feutre noir, coin d'aimant, écriture de tableau ;
 *  briques : brique de couleur avec ses tenons, ombre de contact ;
 *  cartoon années 30 : crème, encre épaisse, ombre décalée noire, titres d'époque ;
 *  ombres : cuir sombre, filet doré, la lumière chaude autour.
 * Les états (bonne réponse, erreur, indice) restent les mêmes partout : ils gardent leurs couleurs franches.
 */
import type { CSSProperties } from 'react';
import type { FilmStyle } from '../films/engine';
import { SPECS, isSpecStyle, swatch, type StyleId } from './styles';

export interface Skin {
  style: StyleId;
  /** Carte de jeu au repos (choix, carte mémoire, objet à trouver). i : rang, pour varier. */
  card: (i: number) => CSSProperties;
  /** Dos d'une carte mémoire. */
  back: (i: number) => CSSProperties;
  /** Panneau d'affichage (ce qu'il faut compter, la suite, la consigne). */
  panel: CSSProperties;
  /** Police et couleur des mots sous les cartes. */
  word: CSSProperties;
  /** Police de la question. */
  question: CSSProperties;
  /** Étiquette de la famille de jeu. */
  chip: CSSProperties;
}

const FONT = {
  hand: '"Patrick Hand", "Fredoka", sans-serif',
  board: '"Architects Daughter", "Fredoka", sans-serif',
  serif: '"Cormorant Garamond", Georgia, serif',
  period: '"IM Fell English SC", Georgia, serif',
  round: '"Fredoka", sans-serif'
};

const BRICKS = ['#c91a09', '#0055bf', '#f2cd37', '#237841', '#fe8a18', '#8e5597'];
const studs = 'radial-gradient(circle at 25% 13%, rgba(255,255,255,0.5) 0 5%, rgba(0,0,0,0.12) 5.5% 8%, transparent 8.5%), radial-gradient(circle at 75% 13%, rgba(255,255,255,0.5) 0 5%, rgba(0,0,0,0.12) 5.5% 8%, transparent 8.5%)';

export const SKINS: Record<FilmStyle, Skin> = {
  'paper-popup': {
    style: 'paper-popup',
    card: (i) => ({ background: '#fffaf0', border: '6px solid #fff', borderRadius: '1.4rem', boxShadow: '0 3px 0 #a39a8a, 7px 11px 14px rgba(45,28,12,0.28)', rotate: `${((i % 3) - 1) * 1.6}deg` }),
    back: (i) => ({ background: 'repeating-linear-gradient(45deg, #e2574c 0 10px, #ea6e62 10px 20px)', border: '6px solid #fff', borderRadius: '1.4rem', boxShadow: '0 3px 0 #a39a8a, 7px 11px 14px rgba(45,28,12,0.28)', rotate: `${((i % 3) - 1) * 1.6}deg` }),
    panel: { background: '#fffaf0', border: '6px solid #fff', borderRadius: '1.6rem', boxShadow: '0 3px 0 #a39a8a, 8px 12px 16px rgba(45,28,12,0.25)' },
    word: { fontFamily: FONT.round, color: '#4a2e1f', fontWeight: 600 },
    question: { fontFamily: FONT.round, color: '#4a2e1f', textShadow: '0 0 4px #fff6e0, 0 0 10px #fff6e0, 0 0 18px #fff6e0' },
    chip: { background: '#fff6e0', color: '#4a2e1f', boxShadow: '0 2px 0 #a39a8a' }
  },
  crayon: {
    style: 'crayon',
    card: (i) => ({ background: '#f6f1e4', border: '3px solid #2e2a6b', borderRadius: i % 2 ? '22px 16px 26px 14px / 16px 24px 14px 22px' : '16px 24px 14px 22px / 22px 14px 24px 16px', boxShadow: '3px 4px 0 rgba(46,42,107,0.22)' }),
    back: (i) => ({ background: 'repeating-linear-gradient(-35deg, #7fb0e6 0 4px, #f6f1e4 4px 8px)', border: '3px solid #2e2a6b', borderRadius: i % 2 ? '22px 16px 26px 14px / 16px 24px 14px 22px' : '16px 24px 14px 22px / 22px 14px 24px 16px' }),
    panel: { background: '#f6f1e4', border: '3px solid #2e2a6b', borderRadius: '26px 18px 30px 16px / 18px 28px 16px 26px', boxShadow: '3px 4px 0 rgba(46,42,107,0.18)' },
    word: { fontFamily: FONT.hand, color: '#2e2a6b', fontSize: '1.15em' },
    question: { fontFamily: FONT.hand, color: '#2e2a6b', fontWeight: 400, letterSpacing: '0.01em', textShadow: '0 0 4px #f6f1e4, 0 0 10px #f6f1e4, 0 0 18px #f6f1e4' },
    chip: { background: '#f6f1e4', color: '#2e2a6b', border: '2px solid #2e2a6b', fontFamily: FONT.hand }
  },
  watercolor: {
    style: 'watercolor',
    card: (i) => ({
      background: `radial-gradient(circle at ${30 + (i % 3) * 20}% 28%, rgba(122,166,90,0.20), transparent 58%), radial-gradient(circle at 72% ${70 + (i % 2) * 10}%, rgba(232,137,45,0.16), transparent 55%), #fbf7ee`,
      borderRadius: '2rem',
      boxShadow: '0 6px 18px rgba(59,42,32,0.14)'
    }),
    back: () => ({ background: 'radial-gradient(circle at 40% 40%, rgba(79,143,214,0.55), rgba(79,143,214,0.25) 60%, rgba(79,143,214,0.1)), #fbf7ee', borderRadius: '2rem' }),
    panel: { background: 'radial-gradient(circle at 25% 30%, rgba(241,194,50,0.18), transparent 60%), #fbf7ee', borderRadius: '2rem', boxShadow: '0 6px 18px rgba(59,42,32,0.12)' },
    word: { fontFamily: FONT.serif, fontStyle: 'italic', fontWeight: 600, color: '#3b2a20', fontSize: '1.15em' },
    question: { fontFamily: FONT.serif, fontStyle: 'italic', fontWeight: 600, color: '#3b2a20', textShadow: '0 0 4px #fbf7ee, 0 0 10px #fbf7ee, 0 0 18px #fbf7ee' },
    chip: { background: '#fbf7ee', color: '#3b2a20', fontFamily: FONT.serif, fontStyle: 'italic' }
  },
  whiteboard: {
    style: 'whiteboard',
    card: () => ({ background: '#fbfaf6', border: '3px solid #23262c', borderRadius: '14px', boxShadow: '0 3px 8px rgba(0,0,0,0.12)' }),
    back: () => ({ background: 'radial-gradient(circle at 50% 50%, #2a5cb3 0 18%, transparent 19%), #fbfaf6', border: '3px solid #23262c', borderRadius: '14px' }),
    panel: { background: '#fbfaf6', border: '3px solid #23262c', borderRadius: '16px', boxShadow: '0 3px 8px rgba(0,0,0,0.12)' },
    word: { fontFamily: FONT.board, color: '#23262c' },
    question: { fontFamily: FONT.board, color: '#23262c', fontWeight: 400, textShadow: '0 0 4px #fbfaf6, 0 0 10px #fbfaf6, 0 0 18px #fbfaf6' },
    chip: { background: '#fbfaf6', color: '#23262c', border: '2px solid #23262c', fontFamily: FONT.board }
  },
  'brick-toy': {
    style: 'brick-toy',
    card: (i) => ({ background: `${studs}, ${BRICKS[i % BRICKS.length]}`, borderRadius: '10px', boxShadow: 'inset 0 -9px 0 rgba(0,0,0,0.22), inset 0 2px 0 rgba(255,255,255,0.35), 0 6px 0 rgba(0,0,0,0.25)' }),
    back: (i) => ({ background: `${studs}, ${BRICKS[(i + 3) % BRICKS.length]}`, borderRadius: '10px', boxShadow: 'inset 0 -9px 0 rgba(0,0,0,0.22), 0 6px 0 rgba(0,0,0,0.25)' }),
    panel: { background: `${studs}, #f2f2ee`, borderRadius: '12px', boxShadow: 'inset 0 -10px 0 rgba(0,0,0,0.12), 0 6px 0 rgba(0,0,0,0.2)' },
    word: { fontFamily: FONT.round, color: '#ffffff', fontWeight: 700, textShadow: '0 1px 2px rgba(0,0,0,0.5)' },
    question: { fontFamily: FONT.round, color: '#1b2a34', textShadow: '0 0 4px #f2f2ee, 0 0 10px #f2f2ee, 0 0 18px #f2f2ee' },
    chip: { background: '#1b2a34', color: '#ffffff' }
  },
  'rubber-hose': {
    style: 'rubber-hose',
    card: () => ({ background: '#f4f1ea', border: '3px solid #141210', borderRadius: '28px', boxShadow: '5px 6px 0 #141210' }),
    back: () => ({ background: 'repeating-radial-gradient(circle at 50% 50%, #141210 0 6px, #f4f1ea 6px 12px)', border: '3px solid #141210', borderRadius: '28px', boxShadow: '5px 6px 0 #141210' }),
    panel: { background: '#f4f1ea', border: '3px solid #141210', borderRadius: '26px', boxShadow: '6px 7px 0 #141210' },
    word: { fontFamily: FONT.period, color: '#141210', fontSize: '1.3em', lineHeight: 1.1 },
    question: { fontFamily: FONT.period, color: '#141210', fontWeight: 400, textShadow: '0 0 4px #f4f1ea, 0 0 10px #f4f1ea, 0 0 18px #f4f1ea' },
    chip: { background: '#16130f', color: '#f4f1ea', fontFamily: FONT.period, outline: '1.5px solid #f4f1ea', outlineOffset: '-5px' }
  },
  'shadow-puppet': {
    style: 'shadow-puppet',
    card: () => ({ background: 'radial-gradient(circle at 50% 40%, #ffd28a, #f4a24a 65%, #b5591f)', border: '3px solid #2a110b', borderRadius: '18px', boxShadow: '0 0 0 3px #c9a14a, 0 10px 24px rgba(60,20,0,0.45)' }),
    back: () => ({ background: '#26180f', border: '3px solid #2a110b', borderRadius: '18px', boxShadow: '0 0 0 3px #c9a14a' }),
    panel: { background: 'radial-gradient(circle at 50% 40%, #ffd28a, #f4a24a 70%, #b5591f)', borderRadius: '18px', boxShadow: '0 0 0 3px #c9a14a, 0 10px 24px rgba(60,20,0,0.4)' },
    word: { fontFamily: FONT.serif, fontWeight: 600, color: '#26180f', fontSize: '1.1em' },
    question: { fontFamily: FONT.serif, fontWeight: 600, color: '#f3e3c3', textShadow: '0 0 6px #26180f, 0 0 14px #26180f' },
    chip: { background: '#1c0b06', color: '#f3e3c3', fontFamily: FONT.serif, boxShadow: '0 0 0 1.5px #c9a14a' }
  }
};

const CSS_FONT: Record<string, string> = {
  hand: FONT.hand,
  board: FONT.board,
  serif: FONT.serif,
  period: FONT.period,
  round: FONT.round
};

/** Police CSS d'une fiche de style (la fiche donne la police du canvas). */
function cssFont(font: string): CSSProperties {
  const fam = font.replace(/^(italic )?(\d00 )?\{s\}px /, '');
  const out: CSSProperties = { fontFamily: fam };
  if (font.startsWith('italic')) out.fontStyle = 'italic';
  const w = /(\d00) /.exec(font);
  if (w) out.fontWeight = Number(w[1]);
  void CSS_FONT;
  return out;
}

/**
 * Peau d'un des 66 styles. Les 7 styles faits main gardent leur peau dessinée ci-dessus ;
 * les 59 autres la tirent de leur fiche : papier, encre, police, ombre portée, trame, coins carrés en pixel.
 */
export function skinFor(id: StyleId): Skin {
  if (!isSpecStyle(id)) return SKINS[id as FilmStyle];
  const s = SPECS[id] as import('./styles').StyleSpec;
  const sw = swatch(id);
  const a = sw.accents;
  const paper = sw.dark ? '#fbf6ec' : s.paper;
  const ink = sw.dark ? '#1d1a17' : s.text;
  const radius = s.pixel ? '0px' : s.fill === 'facet' ? '6px' : s.box === 'band' ? '12px' : '22px';
  const border = s.outline > 0 ? `${Math.min(5, Math.max(2, Math.round(s.outline)))}px ${s.dash ? 'dashed' : 'solid'} ${s.ink}` : '0';
  const shadow = s.fill === 'glow' ? `0 0 0 2px ${a[0]}, 0 0 18px ${a[0]}` : s.shadow ? `${s.shadow[0]}px ${s.shadow[1]}px 0 ${s.shadow[2]}` : '0 6px 16px rgba(0,0,0,0.16)';
  const texture =
    s.fill === 'dots' || s.fill === 'riso'
      ? `radial-gradient(${a[0]}33 1.4px, transparent 1.6px) 0 0 / 9px 9px, `
      : s.fill === 'hatch'
        ? `repeating-linear-gradient(45deg, ${s.ink}14 0 1.5px, transparent 1.5px 6px), `
        : s.bg === 'grid'
          ? `linear-gradient(${a[0]}18 1px, transparent 1px) 0 0 / 24px 24px, linear-gradient(90deg, ${a[0]}18 1px, transparent 1px) 0 0 / 24px 24px, `
          : '';
  const font = cssFont(s.font);
  const card = (i: number): CSSProperties => ({
    background: `${texture}${paper}`,
    border,
    borderRadius: radius,
    boxShadow: shadow,
    rotate: s.wobble && s.wobble > 0.7 ? `${((i % 3) - 1) * 1.2}deg` : undefined
  });
  return {
    style: id,
    card,
    back: (i) => ({ background: `repeating-linear-gradient(${s.pixel ? 0 : 45}deg, ${a[i % a.length]} 0 10px, ${a[(i + 1) % a.length]} 10px 20px)`, border, borderRadius: radius, boxShadow: shadow }),
    panel: card(0),
    word: { ...font, color: ink, fontSize: s.pixel ? '0.7em' : '1.1em', lineHeight: 1.2 },
    question: { ...font, color: sw.dark ? '#fff8ea' : s.text, fontSize: s.pixel ? '0.6em' : undefined, lineHeight: 1.25, textShadow: sw.dark ? `0 0 6px ${s.paper}, 0 0 14px ${s.paper}` : `0 0 4px ${s.paper}, 0 0 10px ${s.paper}, 0 0 18px ${s.paper}` },
    chip: { ...font, background: s.box === 'band' ? (s.boxBg ?? s.ink) : paper, color: s.box === 'band' ? (s.boxInk ?? '#fff') : ink, border: s.box === 'band' ? undefined : border, fontSize: s.pixel ? '0.65em' : undefined }
  };
}
