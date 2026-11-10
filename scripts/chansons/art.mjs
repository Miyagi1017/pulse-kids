/**
 * Le casting de « Nino range ses jouets » — dessins vectoriels originaux de Pulse Kids.
 *
 * Tout est paramétrique (position, échelle, bras, tête, bouche…) pour être animé image par image
 * sans moteur 3D : le même personnage reste identique d'un plan à l'autre, c'est la « bible »
 * verrouillée qui sert aussi de référence si on passe un jour à un modèle image→vidéo.
 */

export const C = {
  wall: '#FDF3E6',
  wallDot: '#F3DFC9',
  floor: '#EFD9BE',
  floorLine: '#D9BE9C',
  rug: '#F7C6D9',
  rugIn: '#FFE3EE',
  ink: '#3E3355',
  inkSoft: '#6B5F86',
  skin: '#FFE0C4',
  skinShade: '#F5C7A6',
  cap: '#E4572E',
  capDark: '#C4451F',
  hair: '#5B3A29',
  sweater: '#F2B441',
  sweaterDark: '#D99A2B',
  overall: '#4A7BB7',
  overallDark: '#3B6395',
  cat: '#FFF4E2',
  catPatch: '#F0A868',
  girlDress: '#F27DA8',
  girlDressDark: '#D9618C',
  girlLegging: '#F6D7E4',
  girlHair: '#6B4A2F',
  girlHairDark: '#4E3320',
  girlBow: '#F2B441',
  pink: '#FFB3C7',
  red: '#E4572E',
  yellow: '#F2B441',
  blue: '#4A7BB7',
  green: '#57B894',
  basket: '#C98A5B',
  basketDark: '#A96F45',
  basketLight: '#E0AE7F',
  white: '#FFFFFF',
  sky: '#BFE4FF',
  sun: '#FFD36B',
  leaf: '#7FB77E'
};

const r1 = (n) => Math.round(n * 10) / 10;

/* ------------------------------------------------------------------ */
/* Outils                                                             */
/* ------------------------------------------------------------------ */

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, p) => a + (b - a) * p;
export const smooth = (p) => (p <= 0 ? 0 : p >= 1 ? 1 : p * p * (3 - 2 * p));
export const easeOut = (p) => 1 - Math.pow(1 - clamp(p), 3);
export const easeIn = (p) => Math.pow(clamp(p), 3);
export const easeInOut = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
export const backOut = (p) => {
  const c = 1.70158;
  const q = clamp(p) - 1;
  return 1 + (c + 1) * q * q * q + c * q * q;
};
/** Progression entre deux instants, avec easing. */
export const seg = (t, a, b, ease = smooth) => ease(clamp((t - a) / (b - a)));
/** Petit flottement vivant. */
export const bob = (t, amp = 4, speed = 2.2, phase = 0) => Math.sin(t * speed + phase) * amp;

export function text(x, y, str, { size = 36, fill = C.ink, anchor = 'middle', weight = 700, family = "'Comic Sans MS', 'Segoe UI', sans-serif", opacity = 1, letter = 0 } = {}) {
  return `<text x="${r1(x)}" y="${r1(y)}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" opacity="${opacity}" letter-spacing="${letter}">${str}</text>`;
}

export function star(x, y, radius, fill, rot = 0, opacity = 1) {
  const pts = [];
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI / 4) * i + (rot * Math.PI) / 180;
    const rr = i % 2 === 0 ? radius : radius * 0.32;
    pts.push(`${r1(x + Math.cos(a) * rr)},${r1(y + Math.sin(a) * rr)}`);
  }
  return `<polygon points="${pts.join(' ')}" fill="${fill}" opacity="${opacity}" />`;
}

/* ------------------------------------------------------------------ */
/* Nino                                                               */
/* ------------------------------------------------------------------ */

export function nino({
  x = 0,
  y = 0,
  s = 1,
  armL = 0,
  armR = 0,
  tilt = 0,
  blink = 0,
  mouth = 'smile',
  look = 0,
  t = 0,
  walk = 0,
  scaleY = 1,
  girl = false
} = {}) {
  const bobY = bob(t, 2.4, 2.4);
  const eyeRy = 6.5 * (1 - 0.92 * blink);
  const top = girl ? C.girlDress : C.sweater;
  const topDark = girl ? C.girlDressDark : C.sweaterDark;
  const legs = girl ? C.girlLegging : C.overallDark;
  const mouthShape =
    mouth === 'open'
      ? `<ellipse cx="0" cy="-186" rx="11" ry="12" fill="#8C3B3B" /><ellipse cx="0" cy="-181" rx="7" ry="5" fill="#FF8FA8" />`
      : mouth === 'sad'
        ? `<path d="M-11 -184 Q0 -193 11 -184" fill="none" stroke="${C.ink}" stroke-width="4" stroke-linecap="round" />`
        : `<path d="M-12 -191 Q0 -181 12 -191" fill="none" stroke="${C.ink}" stroke-width="4.5" stroke-linecap="round" />`;
  const face = `
      <ellipse cx="-19" cy="-212" rx="5.6" ry="${r1(eyeRy)}" fill="${C.ink}" />
      <ellipse cx="19" cy="-212" rx="5.6" ry="${r1(eyeRy)}" fill="${C.ink}" />
      ${blink < 0.5 ? `<circle cx="-17.5" cy="-214.5" r="1.8" fill="#fff" /><circle cx="20.5" cy="-214.5" r="1.8" fill="#fff" />` : ''}
      <ellipse cx="-32" cy="-196" rx="7" ry="4" fill="${C.pink}" opacity="0.85" />
      <ellipse cx="32" cy="-196" rx="7" ry="4" fill="${C.pink}" opacity="0.85" />
      ${mouthShape}`;
  const head = girl
    ? `<g transform="translate(${r1(look)} 0)">
        <!-- couettes + nœuds -->
        <circle cx="-66" cy="-204" r="15" fill="${C.girlHair}" />
        <circle cx="66" cy="-204" r="15" fill="${C.girlHair}" />
        <path d="M-66 -216 l-13 -9 v18 z M-66 -216 l13 -9 v18 z" fill="${C.girlBow}" />
        <path d="M66 -216 l-13 -9 v18 z M66 -216 l13 -9 v18 z" fill="${C.girlBow}" />
        <circle cx="-52" cy="-208" r="9" fill="${C.skinShade}" />
        <circle cx="52" cy="-208" r="9" fill="${C.skinShade}" />
        <circle cx="0" cy="-210" r="55" fill="${C.skin}" />
        <!-- cheveux : calotte + frange + mèches sur les côtés -->
        <path d="M-56 -212 A 56 56 0 0 1 56 -212 Q34 -244 0 -246 Q-34 -244 -56 -212 Z" fill="${C.girlHair}" />
        <path d="M-56 -214 q-7 26 3 40 q9 -6 7 -26 z M56 -214 q7 26 -3 40 q-9 -6 -7 -26 z" fill="${C.girlHair}" />
        <path d="M-52 -236 q26 -12 52 0" fill="none" stroke="${C.girlHairDark}" stroke-width="3" stroke-linecap="round" opacity="0.55" />
        ${face}
      </g>`
    : `<g transform="translate(${r1(look)} 0)">
        <circle cx="-52" cy="-208" r="9" fill="${C.skinShade}" />
        <circle cx="52" cy="-208" r="9" fill="${C.skinShade}" />
        <circle cx="0" cy="-210" r="55" fill="${C.skin}" />
        <path d="M-56 -228 A 56 56 0 0 1 56 -228 L56 -238 Q0 -262 -56 -238 Z" fill="${C.cap}" />
        <ellipse cx="30" cy="-238" rx="29" ry="7" fill="${C.capDark}" transform="rotate(-10 30 -238)" />
        <path d="M-46 -246 Q-24 -262 -6 -252 Q-30 -246 -38 -236 Z" fill="${C.hair}" />
        <path d="M-44 -252 Q-30 -266 -18 -258" fill="none" stroke="${C.hair}" stroke-width="6" stroke-linecap="round" />
        ${face}
      </g>`;
  return `<g transform="translate(${r1(x)} ${r1(y)}) scale(${s}) rotate(${r1(tilt)} 0 -120)">
    <ellipse cx="0" cy="4" rx="${46 * scaleY}" ry="10" fill="${C.ink}" opacity="0.09" />
    <g transform="translate(0 ${r1(bobY)}) scale(1 ${scaleY})">
      ${walk ? `<g>${[-1, 1].map((side, i) => {
        const swing = Math.sin(t * 9 + i * Math.PI) * walk * 16;
        return `<g transform="rotate(${r1(swing)} ${side * 14} -92)"><rect x="${side * 14 - 11}" y="-92" width="22" height="86" rx="11" fill="${legs}" /><ellipse cx="${side * 14}" cy="-6" rx="15" ry="8" fill="${C.white}" /></g>`;
      }).join('')}</g>` : `<rect x="-25" y="-96" width="22" height="88" rx="11" fill="${legs}" /><rect x="3" y="-96" width="22" height="88" rx="11" fill="${legs}" /><ellipse cx="-14" cy="-6" rx="16" ry="8" fill="${C.white}" /><ellipse cx="14" cy="-6" rx="16" ry="8" fill="${C.white}" />`}

      <!-- corps -->
      ${girl
        ? `<path d="M-42 -168 Q0 -180 42 -168 L42 -120 L56 -92 Q0 -82 -56 -92 L-42 -120 Z" fill="${C.girlDress}" />
           <path d="M-42 -168 Q0 -180 42 -168 L42 -150 Q0 -160 -42 -150 Z" fill="${C.girlDressDark}" opacity="0.5" />
           <ellipse cx="0" cy="-168" rx="20" ry="9" fill="${C.white}" />
           <circle cx="-30" cy="-150" r="3.5" fill="${C.white}" />
           <circle cx="30" cy="-150" r="3.5" fill="${C.white}" />`
        : `<rect x="-42" y="-172" width="84" height="80" rx="26" fill="${C.sweater}" />
           <rect x="-30" y="-152" width="60" height="66" rx="16" fill="${C.overall}" />
           <rect x="-30" y="-158" width="10" height="24" rx="5" fill="${C.overallDark}" />
           <rect x="20" y="-158" width="10" height="24" rx="5" fill="${C.overallDark}" />
           <circle cx="-25" cy="-156" r="3.5" fill="${C.yellow}" />
           <circle cx="25" cy="-156" r="3.5" fill="${C.yellow}" />`}
      <rect x="-9" y="-170" width="18" height="14" rx="6" fill="${C.skin}" />

      <!-- bras (à l'extérieur du corps pour rester visibles) -->
      <g transform="rotate(${r1(armL)} -46 -150)">
        <rect x="-55" y="-152" width="19" height="76" rx="9.5" fill="${top}" />
        <rect x="-55" y="-90" width="19" height="14" rx="7" fill="${topDark}" />
        <circle cx="-45.5" cy="-72" r="10" fill="${C.skin}" />
      </g>
      <g transform="rotate(${r1(armR)} 46 -150)">
        <rect x="36" y="-152" width="19" height="76" rx="9.5" fill="${top}" />
        <rect x="36" y="-90" width="19" height="14" rx="7" fill="${topDark}" />
        <circle cx="45.5" cy="-72" r="10" fill="${C.skin}" />
      </g>

      <!-- tête -->
      ${head}
    </g>
  </g>`;
}

/** Nina, la petite fille : même squelette que Nino, avec robe, couettes et nœuds. */
export function nina(options = {}) {
  return nino({ ...options, girl: true });
}

/* ------------------------------------------------------------------ */
/* Mila, la chatte                                                    */
/* ------------------------------------------------------------------ */

export function mila({ x = 0, y = 0, s = 1, tail = 0, blink = 0, tilt = 0, t = 0, jump = 0, look = 0 } = {}) {
  const sway = Math.sin(t * 3.4 + tail) * 12;
  const eyeRy = 7.2 * (1 - 0.9 * blink);
  const outline = '#E6C9A9';
  const pupil = look * 0.2;
  return `<g transform="translate(${r1(x)} ${r1(y - jump)}) scale(${s}) rotate(${r1(tilt)} 0 -60)">
    <ellipse cx="0" cy="${r1(4 + jump * 0.4)}" rx="${44 - jump * 0.2}" ry="${9 - jump * 0.1}" fill="${C.ink}" opacity="${0.09 - jump * 0.002}" />
    <!-- queue touffue, bien visible -->
    <path d="M30 -44 C56 -48 ${r1(70 + sway)} -72 62 -92" fill="none" stroke="${outline}" stroke-width="19" stroke-linecap="round" />
    <path d="M30 -44 C56 -48 ${r1(70 + sway)} -72 62 -92" fill="none" stroke="${C.cat}" stroke-width="15" stroke-linecap="round" />
    <path d="M${r1(54 + sway)} -86 q10 2 12 -6" fill="none" stroke="${C.catPatch}" stroke-width="9" stroke-linecap="round" />
    <!-- corps -->
    <ellipse cx="0" cy="-50" rx="43" ry="39" fill="${C.cat}" stroke="${outline}" stroke-width="2" />
    <ellipse cx="18" cy="-56" rx="15" ry="20" fill="${C.catPatch}" opacity="0.5" />
    <ellipse cx="0" cy="-34" rx="22" ry="17" fill="#FFFDF7" />
    <ellipse cx="-17" cy="-9" rx="13" ry="8" fill="${C.cat}" stroke="${outline}" stroke-width="2" />
    <ellipse cx="17" cy="-9" rx="13" ry="8" fill="${C.cat}" stroke="${outline}" stroke-width="2" />
    <!-- tête -->
    <g transform="translate(0 -110) rotate(${r1(tilt)} 0 0)">
      <ellipse cx="0" cy="32" rx="20" ry="6" fill="${outline}" opacity="0.55" />
      <path d="M-40 -22 L-16 -54 L-2 -22 Z" fill="${C.cat}" stroke="${outline}" stroke-width="2" stroke-linejoin="round" />
      <path d="M40 -22 L16 -54 L2 -22 Z" fill="${C.cat}" stroke="${outline}" stroke-width="2" stroke-linejoin="round" />
      <path d="M-33 -25 L-18 -44 L-9 -25 Z" fill="${C.pink}" opacity="0.85" />
      <path d="M33 -25 L18 -44 L9 -25 Z" fill="${C.pink}" opacity="0.85" />
      <circle cx="0" cy="0" r="37" fill="${C.cat}" stroke="${outline}" stroke-width="2" />
      <path d="M-18 -30 q7 -7 14 0 M4 -30 q7 -7 14 0" fill="none" stroke="${C.catPatch}" stroke-width="4" stroke-linecap="round" opacity="0.65" />
      <ellipse cx="-13" cy="-4" rx="7" ry="${r1(eyeRy)}" fill="${C.ink}" />
      <ellipse cx="13" cy="-4" rx="7" ry="${r1(eyeRy)}" fill="${C.ink}" />
      ${blink < 0.5 ? `<circle cx="${r1(-11 + pupil)}" cy="-6.6" r="2.3" fill="#fff" /><circle cx="${r1(15 + pupil)}" cy="-6.6" r="2.3" fill="#fff" />` : ''}
      <ellipse cx="-25" cy="7" rx="6.5" ry="3.6" fill="${C.pink}" opacity="0.85" />
      <ellipse cx="25" cy="7" rx="6.5" ry="3.6" fill="${C.pink}" opacity="0.85" />
      <ellipse cx="-6" cy="4" rx="7" ry="5" fill="#FFFDF7" />
      <ellipse cx="6" cy="4" rx="7" ry="5" fill="#FFFDF7" />
      <path d="M-4 2 L4 2 L0 7 Z" fill="${C.pink}" />
      <path d="M0 7 Q-6 13 -11 8 M0 7 Q6 13 11 8" fill="none" stroke="${C.ink}" stroke-width="2.6" stroke-linecap="round" />
      <path d="M-42 2 L-24 5 M-42 10 L-24 10 M42 2 L24 5 M42 10 L24 10" stroke="${C.inkSoft}" stroke-width="2.2" stroke-linecap="round" opacity="0.7" />
    </g>
  </g>`;
}

/* ------------------------------------------------------------------ */
/* Décor                                                              */
/* ------------------------------------------------------------------ */

export function room({ tidy = 0, t = 0 } = {}) {
  const dots = [];
  for (let i = 0; i < 26; i++) {
    const x = 40 + ((i * 97) % 1200);
    const y = 60 + ((i * 53) % 420);
    dots.push(`<circle cx="${x}" cy="${y}" r="3" fill="${C.wallDot}" />`);
  }
  return `
    <rect x="-500" y="-500" width="2280" height="1720" fill="${C.wall}" />
    ${dots.join('')}
    <rect x="-500" y="560" width="2280" height="900" fill="${C.floor}" />
    <rect x="-500" y="552" width="2280" height="12" fill="${C.floorLine}" opacity="0.6" />
    <!-- fenêtre -->
    <g>
      <rect x="902" y="104" width="286" height="228" rx="18" fill="${C.white}" />
      <rect x="916" y="118" width="258" height="200" rx="12" fill="${C.sky}" />
      <circle cx="1110" cy="164" r="22" fill="${C.sun}" />
      <path d="M916 300 Q980 246 1046 292 Q1106 250 1174 300 L1174 318 L916 318 Z" fill="${C.leaf}" opacity="0.75" />
      <path d="M916 306 Q990 272 1050 302 Q1110 274 1174 306 L1174 318 L916 318 Z" fill="#5E9C63" opacity="0.7" />
      <line x1="1045" y1="118" x2="1045" y2="318" stroke="${C.white}" stroke-width="10" />
      <line x1="916" y1="218" x2="1174" y2="218" stroke="${C.white}" stroke-width="10" />
      <rect x="892" y="328" width="306" height="14" rx="7" fill="#EAD8C3" />
      <path d="M902 104 q-30 60 -10 110" fill="none" stroke="${C.pink}" stroke-width="14" opacity="0.5" stroke-linecap="round" />
      <path d="M1188 104 q30 60 10 110" fill="none" stroke="${C.pink}" stroke-width="14" opacity="0.5" stroke-linecap="round" />
    </g>
    <!-- étagère -->
    <g transform="translate(-70 0)">
      <rect x="92" y="336" width="250" height="16" rx="8" fill="#E2C9AC" />
      <rect x="108" y="352" width="10" height="16" fill="#D2B592" />
      <rect x="316" y="352" width="10" height="16" fill="#D2B592" />
      <rect x="112" y="300" width="18" height="36" rx="4" fill="${C.red}" />
      <rect x="134" y="292" width="18" height="44" rx="4" fill="${C.blue}" />
      <rect x="156" y="304" width="18" height="32" rx="4" fill="${C.green}" />
      <circle cx="220" cy="322" r="16" fill="${C.yellow}" />
      <rect x="256" y="306" width="34" height="30" rx="8" fill="${C.pink}" />
    </g>
    <!-- tapis -->
    <ellipse cx="600" cy="628" rx="368" ry="74" fill="${C.rug}" opacity="${0.95 - tidy * 0.05}" />
    <ellipse cx="600" cy="628" rx="300" ry="56" fill="${C.rugIn}" opacity="0.9" />
  `;
}

export function basket({ x = 1000, y = 620, s = 1, fill = 0, wobble = 0 } = {}) {
  const block = (dx, dy, rot, color) => `<g transform="translate(${dx} ${dy}) rotate(${rot})"><rect x="-20" y="-20" width="40" height="40" rx="7" fill="${color}" /><rect x="-13" y="-13" width="26" height="26" rx="5" fill="${C.white}" opacity="0.35" /></g>`;
  const peek = fill > 0 ? block(-24, -96, -8, C.red) + (fill > 1 ? block(6, -104, 10, C.yellow) : '') + (fill > 2 ? block(26, -92, 18, C.blue) : '') : '';
  return `<g transform="translate(${x} ${y}) scale(${s}) rotate(${r1(wobble)} 0 -40)">
    <ellipse cx="0" cy="2" rx="66" ry="12" fill="${C.ink}" opacity="0.09" />
    ${peek}
    <path d="M-58 -84 L58 -84 L46 0 L-46 0 Z" fill="${C.basket}" />
    <path d="M-58 -84 L58 -84 L54 -62 L-54 -62 Z" fill="${C.basketLight}" />
    ${[-40, -20, 0, 20, 40].map((dx) => `<line x1="${dx}" y1="-58" x2="${dx * 0.82}" y2="-4" stroke="${C.basketDark}" stroke-width="3" opacity="0.55" />`).join('')}
    <line x1="-52" y1="-32" x2="52" y2="-32" stroke="${C.basketDark}" stroke-width="3" opacity="0.5" />
    <ellipse cx="0" cy="-84" rx="60" ry="12" fill="${C.basketDark}" />
    <ellipse cx="0" cy="-86" rx="54" ry="9" fill="${C.basketLight}" />
  </g>`;
}

export function block({ x, y, s = 1, rot = 0, color = C.red, symbol = 'star' } = {}) {
  const glyph =
    symbol === 'star'
      ? star(0, 0, 12, C.white, 0, 0.9)
      : symbol === 'heart'
        ? `<path d="M0 10 C-14 0 -12 -10 -5 -10 C-1 -10 0 -6 0 -4 C0 -6 1 -10 5 -10 C12 -10 14 0 0 10 Z" fill="${C.white}" opacity="0.9" />`
        : `<circle cx="0" cy="0" r="9" fill="${C.white}" opacity="0.9" />`;
  return `<g transform="translate(${r1(x)} ${r1(y)}) rotate(${rot}) scale(${s})"><rect x="-22" y="-22" width="44" height="44" rx="8" fill="${color}" /><rect x="-16" y="-16" width="32" height="32" rx="6" fill="#000" opacity="0.06" />${glyph}</g>`;
}

export function ball({ x, y, s = 1, rot = 0 } = {}) {
  return `<g transform="translate(${r1(x)} ${r1(y)}) scale(${s})">
    <circle cx="0" cy="0" r="26" fill="${C.white}" />
    <path d="M-26 0 A26 26 0 0 1 26 0 Z" fill="${C.red}" transform="rotate(${r1(rot)} 0 0)" />
    <circle cx="0" cy="0" r="26" fill="none" stroke="${C.ink}" stroke-width="2" opacity="0.15" />
    <circle cx="-8" cy="-9" r="6" fill="#fff" opacity="0.7" />
  </g>`;
}

export function duck({ x, y, s = 1, rot = 0 } = {}) {
  return `<g transform="translate(${r1(x)} ${r1(y)}) rotate(${rot}) scale(${s})">
    <ellipse cx="0" cy="0" rx="26" ry="18" fill="${C.yellow}" />
    <circle cx="18" cy="-14" r="13" fill="${C.yellow}" />
    <path d="M28 -14 L42 -10 L28 -6 Z" fill="${C.red}" />
    <circle cx="22" cy="-17" r="2.6" fill="${C.ink}" />
    <path d="M-20 -2 Q0 8 16 0" fill="none" stroke="${C.sweaterDark}" stroke-width="3" opacity="0.6" />
  </g>`;
}

export function sparkle(x, y, s, opacity) {
  return star(x, y, 12 * s, C.sun, 0, opacity) + star(x + 14 * s, y - 10 * s, 6 * s, C.white, 20, opacity * 0.9);
}

/* ------------------------------------------------------------------ */
/* Palettes : la même scène, en rose (thème « fille ») ou en bleu      */
/* (thème « garçon »), comme les thèmes de l'app.                      */
/* ------------------------------------------------------------------ */

export const PALETTES = {
  fille: {
    wall: '#FFF2F7',
    wallDot: '#F6D8E6',
    floor: '#F2D9E2',
    floorLine: '#DDBBCB',
    rug: '#F7C6D9',
    rugIn: '#FFE3EE',
    sky: '#CBE5FF',
    leaf: '#7FB77E'
  },
  garcon: {
    wall: '#EDF5FF',
    wallDot: '#D3E2F4',
    floor: '#DCE7F4',
    floorLine: '#B7CBE4',
    rug: '#CFE0F5',
    rugIn: '#E7F1FF',
    sky: '#BFE4FF',
    leaf: '#6FAE8E'
  }
};

/** Applique une palette à tout le décor et aux personnages (les habits du casting ne changent pas). */
export function applyPalette(name) {
  Object.assign(C, PALETTES[name] ?? PALETTES.fille);
}
