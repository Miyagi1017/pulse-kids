/**
 * Les décors et les objets des comptines : dessins vectoriels originaux, dans le même style que
 * la chanson « Nino et Nina rangent leurs jouets » (scripts/chansons/art.mjs).
 *
 * Repère : image 1280 × 720, sol vers y = 560, personnages posés vers y = 642.
 * Les couleurs du décor suivent la palette du thème (C.sky, C.wall… changent entre rose et bleu).
 */
import { C, ball, block, duck, room, star } from '../../scripts/chansons/art.mjs';
import type { Decor, Objet } from '../data/comptines';

const r1 = (n: number) => Math.round(n * 10) / 10;

function cloud(x: number, y: number, s: number, opacity = 0.95) {
  return `<g transform="translate(${r1(x)} ${r1(y)}) scale(${s})" opacity="${opacity}">
    <ellipse cx="0" cy="0" rx="52" ry="26" fill="#fff" />
    <ellipse cx="-34" cy="8" rx="32" ry="20" fill="#fff" />
    <ellipse cx="36" cy="8" rx="34" ry="20" fill="#fff" />
    <ellipse cx="6" cy="-18" rx="30" ry="22" fill="#fff" />
  </g>`;
}

function sun(x: number, y: number, r: number, t: number) {
  const rays = Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * Math.PI * 2 + t * 0.25;
    return `<line x1="${r1(x + Math.cos(a) * (r + 10))}" y1="${r1(y + Math.sin(a) * (r + 10))}" x2="${r1(x + Math.cos(a) * (r + 24))}" y2="${r1(y + Math.sin(a) * (r + 24))}" stroke="${C.sun}" stroke-width="7" stroke-linecap="round" />`;
  }).join('');
  return `${rays}<circle cx="${x}" cy="${y}" r="${r}" fill="${C.sun}" />`;
}

function tree(x: number, y: number, s: number, leaf = C.leaf) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <rect x="-14" y="-120" width="28" height="124" rx="10" fill="#B07D52" />
    <circle cx="0" cy="-150" r="64" fill="${leaf}" />
    <circle cx="-46" cy="-118" r="42" fill="${leaf}" />
    <circle cx="48" cy="-120" r="44" fill="${leaf}" />
    <circle cx="-18" cy="-170" r="16" fill="#fff" opacity="0.18" />
  </g>`;
}

function pine(x: number, y: number, s: number, snow = false) {
  const g = '#4F8F6E';
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <rect x="-9" y="-30" width="18" height="34" fill="#9A6B45" />
    <path d="M0 -190 L-62 -70 L62 -70 Z M0 -140 L-76 -20 L76 -20 Z" fill="${g}" />
    ${snow ? '<path d="M0 -190 L-22 -148 Q0 -140 22 -148 Z M0 -140 L-30 -94 Q0 -86 30 -94 Z" fill="#fff" />' : ''}
  </g>`;
}

function flowerAt(x: number, y: number, color: string, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <line x1="0" y1="0" x2="0" y2="-30" stroke="#5E9C63" stroke-width="4" />
    ${[0, 72, 144, 216, 288].map((a) => `<circle cx="${r1(Math.cos((a * Math.PI) / 180) * 9)}" cy="${r1(-34 + Math.sin((a * Math.PI) / 180) * 9)}" r="7" fill="${color}" />`).join('')}
    <circle cx="0" cy="-34" r="6" fill="${C.sun}" />
  </g>`;
}

function house(x: number, y: number, w: number, h: number, color: string, lit = false, roof = '#D9776A') {
  const winFill = lit ? '#FFE58A' : '#DDF0FF';
  return `<g transform="translate(${x} ${y})">
    <rect x="0" y="${-h}" width="${w}" height="${h}" rx="6" fill="${color}" />
    <path d="M-10 ${-h} L${w / 2} ${-h - 46} L${w + 10} ${-h} Z" fill="${roof}" />
    <rect x="${w * 0.16}" y="${-h + 24}" width="${w * 0.26}" height="30" rx="5" fill="${winFill}" />
    <rect x="${w * 0.58}" y="${-h + 24}" width="${w * 0.26}" height="30" rx="5" fill="${winFill}" />
    <rect x="${w * 0.38}" y="-46" width="${w * 0.24}" height="46" rx="6" fill="#9A6B45" />
  </g>`;
}

function building(x: number, w: number, h: number, color: string) {
  const wins: string[] = [];
  for (let yy = 560 - h + 22; yy < 520; yy += 40) for (let xx = x + 16; xx < x + w - 24; xx += 34) wins.push(`<rect x="${xx}" y="${yy}" width="18" height="22" rx="3" fill="#fff" opacity="0.75" />`);
  return `<rect x="${x}" y="${560 - h}" width="${w}" height="${h}" rx="8" fill="${color}" />${wins.join('')}`;
}

/** Le fond de la scène, animé par le temps (nuages qui passent, vagues, flocons…). */
export function decor(name: Decor, t: number): string {
  switch (name) {
    case 'chambre':
      return room({ tidy: 1, t });

    case 'cuisine': {
      const tiles: string[] = [];
      for (let x = -40; x < 1320; x += 64) for (let y = 380; y < 470; y += 32) tiles.push(`<rect x="${x + ((y / 32) % 2) * 32}" y="${y}" width="60" height="28" rx="4" fill="#fff" opacity="0.55" />`);
      return `
        <rect x="-500" y="-500" width="2280" height="1720" fill="${C.wall}" />
        ${tiles.join('')}
        <rect x="-500" y="560" width="2280" height="900" fill="${C.floor}" />
        <rect x="-500" y="470" width="2280" height="90" fill="#E8D2B8" />
        <rect x="-500" y="462" width="2280" height="14" rx="6" fill="#D6BB9A" />
        <g><rect x="180" y="110" width="250" height="190" rx="16" fill="#fff" /><rect x="194" y="124" width="222" height="162" rx="10" fill="${C.sky}" />
          ${cloud(300 + Math.sin(t * 0.3) * 30, 190, 0.6)}<line x1="305" y1="124" x2="305" y2="286" stroke="#fff" stroke-width="8" /></g>
        <rect x="820" y="210" width="300" height="14" rx="7" fill="#D6BB9A" />
        <rect x="840" y="160" width="40" height="50" rx="10" fill="${C.red}" opacity="0.85" /><rect x="896" y="150" width="44" height="60" rx="10" fill="${C.green}" opacity="0.85" /><rect x="956" y="166" width="38" height="44" rx="10" fill="${C.yellow}" opacity="0.9" /><circle cx="1050" cy="186" r="22" fill="${C.pink}" />
        <rect x="1020" y="410" width="120" height="52" rx="10" fill="#B9C3CF" /><ellipse cx="1080" cy="410" rx="56" ry="10" fill="#9AA6B4" />`;
    }

    case 'jardin':
      return `
        <rect x="-500" y="-500" width="2280" height="1720" fill="${C.sky}" />
        ${sun(1090, 130, 50, t)}
        ${cloud(220 + ((t * 18) % 1500) - 200, 120, 0.9)}${cloud(760 + ((t * 11) % 1500) - 400, 200, 0.7)}
        <path d="M-500 470 Q200 400 640 450 Q1100 500 1780 430 L1780 1220 L-500 1220 Z" fill="#9FD38C" />
        <rect x="-500" y="560" width="2280" height="900" fill="#A8D98A" />
        ${tree(150, 520, 1.05)}${tree(1170, 540, 0.85)}
        ${Array.from({ length: 13 }, (_, i) => `<rect x="${270 + i * 66}" y="440" width="16" height="96" rx="6" fill="#fff" opacity="0.9" />`).join('')}
        <rect x="262" y="462" width="870" height="12" rx="6" fill="#fff" opacity="0.9" /><rect x="262" y="504" width="870" height="12" rx="6" fill="#fff" opacity="0.9" />
        ${flowerAt(300, 600, C.pink)}${flowerAt(360, 620, C.yellow, 0.9)}${flowerAt(1000, 610, C.red, 0.9)}${flowerAt(1080, 596, C.pink)}${flowerAt(1140, 624, C.blue, 0.8)}`;

    case 'foret':
      return `
        <rect x="-500" y="-500" width="2280" height="1720" fill="#DDF2E3" />
        ${Array.from({ length: 5 }, (_, i) => `<rect x="${i * 300 - 60 + ((t * 6) % 40)}" y="-200" width="70" height="900" fill="#fff" opacity="0.18" transform="rotate(12 ${i * 300} 0)" />`).join('')}
        ${pine(80, 520, 1.3)}${pine(300, 500, 1)}${pine(1000, 510, 1.1)}${pine(1210, 520, 1.35)}
        ${tree(560, 470, 0.9, '#6FAE8E')}${tree(800, 480, 0.8, '#7FB77E')}
        <rect x="-500" y="540" width="2280" height="900" fill="#8CC48A" />
        <path d="M-500 548 Q300 528 640 548 Q1000 566 1780 540" fill="none" stroke="#79B377" stroke-width="18" />
        <g transform="translate(250 600)"><rect x="-6" y="-20" width="12" height="22" rx="4" fill="#FFF4E2" /><path d="M-24 -18 Q0 -48 24 -18 Z" fill="${C.red}" /><circle cx="-8" cy="-28" r="3" fill="#fff" /><circle cx="8" cy="-24" r="3" fill="#fff" /></g>
        <g transform="translate(1060 616) scale(0.8)"><rect x="-6" y="-20" width="12" height="22" rx="4" fill="#FFF4E2" /><path d="M-24 -18 Q0 -48 24 -18 Z" fill="${C.red}" /><circle cx="-8" cy="-28" r="3" fill="#fff" /></g>`;

    case 'plage': {
      const wave = (y: number, amp: number, speed: number, color: string, op: number) => {
        let d = `M-500 ${y}`;
        for (let x = -500; x <= 1780; x += 40) d += ` L${x} ${r1(y + Math.sin(x / 70 + t * speed) * amp)}`;
        return `<path d="${d} L1780 ${y + 200} L-500 ${y + 200} Z" fill="${color}" opacity="${op}" />`;
      };
      return `
        <rect x="-500" y="-500" width="2280" height="1720" fill="${C.sky}" />
        ${sun(1050, 120, 46, t)}${cloud(300 + ((t * 14) % 1400) - 300, 140, 0.8)}
        ${wave(380, 8, 1.4, '#5BB6E8', 1)}${wave(410, 9, -1.1, '#4AA3DA', 1)}${wave(450, 10, 1.7, '#7CCBF0', 0.9)}
        <path d="M-500 520 Q640 470 1780 520 L1780 1220 L-500 1220 Z" fill="#F6DFA9" />
        <rect x="-500" y="560" width="2280" height="900" fill="#F3D79A" />
        <g transform="translate(180 600)"><line x1="0" y1="0" x2="20" y2="-190" stroke="#fff" stroke-width="8" /><path d="M-90 -170 Q20 -260 130 -200 Z" fill="${C.red}" /><path d="M-90 -170 Q-20 -235 20 -190 Z" fill="#fff" opacity="0.5" /></g>
        <g transform="translate(1120 610)"><path d="M-40 0 L40 0 L28 -40 L-28 -40 Z" fill="${C.yellow}" /><rect x="-36" y="-52" width="72" height="12" rx="5" fill="${C.red}" /></g>`;
    }

    case 'nuit': {
      const stars = Array.from({ length: 34 }, (_, i) => {
        const x = (i * 211) % 1500 - 100;
        const y = 30 + ((i * 97) % 360);
        const tw = 0.45 + 0.55 * Math.abs(Math.sin(t * (0.8 + (i % 5) * 0.3) + i));
        return star(x, y, 4 + (i % 3) * 2.5, '#FFF4C2', i * 7, tw);
      }).join('');
      return `
        <rect x="-500" y="-500" width="2280" height="1720" fill="#2D3A6E" />
        <rect x="-500" y="200" width="2280" height="400" fill="#38478A" opacity="0.6" />
        ${stars}
        <circle cx="1060" cy="140" r="58" fill="#FFF1B8" /><circle cx="1084" cy="124" r="56" fill="#38478A" opacity="0.0" />
        <circle cx="1040" cy="126" r="9" fill="#EADBA0" /><circle cx="1076" cy="160" r="12" fill="#EADBA0" />
        <path d="M-500 520 Q100 430 520 500 Q900 560 1780 470 L1780 1220 L-500 1220 Z" fill="#26325E" />
        ${house(160, 540, 150, 130, '#4B5A96', true, '#5E4C86')}${house(940, 540, 170, 150, '#4B5A96', true, '#5E4C86')}
        <rect x="-500" y="560" width="2280" height="900" fill="#3A4778" />`;
    }

    case 'neige': {
      const flakes = Array.from({ length: 40 }, (_, i) => {
        const x = ((i * 157) % 1400) - 60 + Math.sin(t * 1.2 + i) * 14;
        const y = (((i * 89) % 720) + t * (28 + (i % 4) * 9)) % 760 - 20;
        return `<circle cx="${r1(x)}" cy="${r1(y)}" r="${2.5 + (i % 3) * 1.5}" fill="#fff" opacity="0.9" />`;
      }).join('');
      return `
        <rect x="-500" y="-500" width="2280" height="1720" fill="#DDEBF7" />
        <path d="M-500 420 L-100 220 L240 420 Z M140 440 L520 200 L900 440 Z M760 430 L1120 230 L1780 430 Z" fill="#C7D9EC" />
        <path d="M420 262 L520 200 L620 262 Q520 280 420 262 Z M1050 270 L1120 230 L1190 270 Q1120 286 1050 270 Z" fill="#fff" />
        ${pine(120, 540, 1.1, true)}${pine(1180, 545, 1.2, true)}${pine(1040, 520, 0.8, true)}
        <path d="M-500 500 Q640 450 1780 510 L1780 1220 L-500 1220 Z" fill="#F4F9FF" />
        <rect x="-500" y="560" width="2280" height="900" fill="#FFFFFF" />
        <g transform="translate(300 600)"><circle cx="0" cy="-30" r="36" fill="#fff" stroke="#DDE7F2" stroke-width="3" /><circle cx="0" cy="-90" r="26" fill="#fff" stroke="#DDE7F2" stroke-width="3" /><path d="M0 -92 L22 -88 L0 -84 Z" fill="#F08A3C" /><circle cx="-8" cy="-98" r="3" fill="${C.ink}" /><circle cx="8" cy="-98" r="3" fill="${C.ink}" /><rect x="-22" y="-70" width="44" height="10" rx="5" fill="${C.red}" /></g>
        ${flakes}`;
    }

    case 'ville':
      return `
        <rect x="-500" y="-500" width="2280" height="1720" fill="${C.sky}" />
        ${sun(140, 110, 40, t)}${cloud(600 + ((t * 16) % 1500) - 500, 110, 0.8)}
        ${building(-40, 170, 300, '#F2B6A0')}${building(150, 140, 230, '#B8D3F0')}${building(310, 190, 330, '#F6D58E')}
        ${building(820, 160, 260, '#C9B8E8')}${building(1000, 150, 340, '#9FD3C0')}${building(1170, 160, 240, '#F2B6A0')}
        <rect x="-500" y="540" width="2280" height="40" fill="#C9CED6" />
        <rect x="-500" y="580" width="2280" height="900" fill="#8E96A3" />
        ${Array.from({ length: 7 }, (_, i) => `<rect x="${500 + i * 46}" y="590" width="28" height="120" fill="#fff" opacity="0.85" />`).join('')}
        <g transform="translate(760 540)"><rect x="-5" y="-150" width="10" height="150" fill="#4A4F5A" /><rect x="-22" y="-230" width="44" height="90" rx="10" fill="#3C414B" />
          <circle cx="0" cy="-212" r="11" fill="${Math.sin(t * 0.8) > 0 ? '#FF6B5B' : '#5A2F2F'}" /><circle cx="0" cy="-184" r="11" fill="#5A5A2F" /><circle cx="0" cy="-156" r="11" fill="${Math.sin(t * 0.8) > 0 ? '#2F5A3A' : '#5BD47A'}" /></g>`;
  }
}

/** Les objets qui apparaissent pendant la comptine (taille de base : ~60 px). */
export function objet(name: Objet, x: number, y: number, s = 1, rot = 0, t = 0): string {
  const g = (inner: string) => `<g transform="translate(${r1(x)} ${r1(y)}) rotate(${r1(rot)}) scale(${r1(s * 100) / 100})">${inner}</g>`;
  switch (name) {
    case 'etoile':
      return g(star(0, 0, 32, C.sun, 0) + star(0, 0, 14, '#fff', 20, 0.5));
    case 'coeur':
      return g(`<path d="M0 26 C-40 0 -34 -28 -14 -28 C-4 -28 0 -18 0 -14 C0 -18 4 -28 14 -28 C34 -28 40 0 0 26 Z" fill="#F2668B" /><ellipse cx="-14" cy="-14" rx="6" ry="4" fill="#fff" opacity="0.6" />`);
    case 'soleil':
      return g(`${Array.from({ length: 8 }, (_, i) => `<rect x="-4" y="-40" width="8" height="14" rx="4" fill="${C.sun}" transform="rotate(${i * 45 + t * 30})" />`).join('')}<circle r="22" fill="${C.sun}" /><circle cx="-7" cy="-3" r="2.6" fill="${C.ink}" /><circle cx="7" cy="-3" r="2.6" fill="${C.ink}" /><path d="M-7 6 Q0 12 7 6" fill="none" stroke="${C.ink}" stroke-width="2.5" stroke-linecap="round" />`);
    case 'lune':
      return g(`<path d="M10 -30 A32 32 0 1 0 10 30 A24 24 0 1 1 10 -30 Z" fill="#FFE58A" /><circle cx="-12" cy="-4" r="2.6" fill="${C.ink}" />`);
    case 'nuage':
      return g(cloud(0, 0, 0.55, 1));
    case 'goutte':
      return g(`<path d="M0 -30 Q22 0 18 12 A18 18 0 0 1 -18 12 Q-22 0 0 -30 Z" fill="#6BB8F2" /><ellipse cx="-6" cy="6" rx="4" ry="7" fill="#fff" opacity="0.6" />`);
    case 'fleur':
      return g(`${[0, 60, 120, 180, 240, 300].map((a) => `<ellipse cx="0" cy="-18" rx="10" ry="16" fill="#F59BBE" transform="rotate(${a})" />`).join('')}<circle r="12" fill="${C.sun}" />`);
    case 'pomme':
      return g(`<circle cx="-11" cy="4" r="20" fill="${C.red}" /><circle cx="11" cy="4" r="20" fill="${C.red}" /><rect x="-2" y="-30" width="4" height="14" rx="2" fill="#7A5236" /><ellipse cx="10" cy="-24" rx="10" ry="5" fill="#6FBF6A" transform="rotate(-20 10 -24)" /><ellipse cx="-12" cy="-4" rx="5" ry="8" fill="#fff" opacity="0.4" />`);
    case 'poisson':
      return g(`<path d="M24 0 L44 -16 L44 16 Z" fill="#F29A4A" /><ellipse cx="0" cy="0" rx="30" ry="20" fill="#F7B451" /><circle cx="-14" cy="-4" r="4" fill="${C.ink}" /><path d="M-2 -10 Q6 0 -2 10" fill="none" stroke="#E48A3A" stroke-width="3" />`);
    case 'ballon':
      return g(`<ellipse cx="0" cy="-8" rx="24" ry="30" fill="${C.blue}" /><path d="M-4 22 L4 22 L0 16 Z" fill="${C.blue}" /><path d="M0 22 Q-8 36 0 50 Q8 62 0 74" fill="none" stroke="${C.inkSoft}" stroke-width="2" /><ellipse cx="-9" cy="-18" rx="6" ry="9" fill="#fff" opacity="0.5" />`);
    case 'balle':
      return ball({ x, y, s: s * 1.1, rot: rot * 3 });
    case 'canard':
      return duck({ x, y, s: s * 1.2, rot: rot * 0.3 });
    case 'cube':
      return block({ x, y, s: s * 1.2, rot, color: [C.red, C.blue, C.green, C.yellow][Math.abs(Math.round(x)) % 4], symbol: 'star' });
    case 'feuille':
      return g(`<path d="M0 -32 Q30 -10 0 32 Q-30 -10 0 -32 Z" fill="#E59A3E" /><path d="M0 -26 L0 30" stroke="#B9702A" stroke-width="3" />`);
    case 'flocon':
      return g(`${[0, 60, 120].map((a) => `<g transform="rotate(${a})"><line x1="0" y1="-30" x2="0" y2="30" stroke="#9CCBF2" stroke-width="5" stroke-linecap="round" /><path d="M-8 -20 L0 -12 L8 -20 M-8 20 L0 12 L8 20" fill="none" stroke="#9CCBF2" stroke-width="4" stroke-linecap="round" /></g>`).join('')}`);
    case 'papillon': {
      const flap = 0.55 + 0.45 * Math.abs(Math.sin(t * 9));
      return g(`<g transform="scale(${r1(flap * 100) / 100} 1)"><ellipse cx="-18" cy="-10" rx="18" ry="16" fill="#B78CF2" /><ellipse cx="18" cy="-10" rx="18" ry="16" fill="#B78CF2" /><ellipse cx="-14" cy="12" rx="12" ry="10" fill="#F59BBE" /><ellipse cx="14" cy="12" rx="12" ry="10" fill="#F59BBE" /></g><rect x="-3" y="-20" width="6" height="40" rx="3" fill="${C.ink}" />`);
    }
    case 'oiseau': {
      const flap = Math.sin(t * 10) * 16;
      return g(`<ellipse cx="0" cy="0" rx="24" ry="18" fill="#6CB6E8" /><circle cx="18" cy="-12" r="12" fill="#6CB6E8" /><path d="M28 -12 L40 -8 L28 -4 Z" fill="${C.yellow}" /><circle cx="21" cy="-15" r="2.6" fill="${C.ink}" /><path d="M-6 -4 L-30 ${r1(-22 - flap)} L4 -10 Z" fill="#4E9CD3" />`);
    }
    case 'bateau':
      return g(`<path d="M-44 6 L44 6 L30 30 L-30 30 Z" fill="${C.red}" /><line x1="0" y1="6" x2="0" y2="-52" stroke="#7A5236" stroke-width="4" /><path d="M4 -50 L38 0 L4 0 Z" fill="#fff" /><path d="M-4 -40 L-30 0 L-4 0 Z" fill="${C.yellow}" />`);
    case 'carotte':
      return g(`<path d="M-14 -18 L14 -18 L0 36 Z" fill="#F08A3C" /><path d="M-6 -6 L4 -6 M-4 8 L4 8" stroke="#C96A28" stroke-width="3" /><path d="M0 -18 Q-14 -40 -8 -44 Q0 -32 0 -20 Q6 -40 14 -40 Q10 -26 2 -18 Z" fill="#5EB06A" />`);
    case 'note':
      return g(`<ellipse cx="-10" cy="20" rx="13" ry="10" fill="${C.ink}" transform="rotate(-20 -10 20)" /><rect x="0" y="-30" width="5" height="50" fill="${C.ink}" /><path d="M5 -30 Q30 -22 22 0 Q20 -14 5 -16 Z" fill="${C.ink}" />`);
    case 'voiture':
      return g(`<rect x="-44" y="-12" width="88" height="28" rx="10" fill="${C.red}" /><path d="M-26 -12 L-14 -34 L18 -34 L30 -12 Z" fill="${C.red}" /><path d="M-18 -14 L-10 -30 L0 -30 L0 -14 Z M6 -14 L6 -30 L14 -30 L22 -14 Z" fill="#DDF0FF" /><circle cx="-24" cy="18" r="11" fill="${C.ink}" /><circle cx="24" cy="18" r="11" fill="${C.ink}" /><circle cx="-24" cy="18" r="4" fill="#ccc" /><circle cx="24" cy="18" r="4" fill="#ccc" />`);
    case 'gateau':
      return g(`<rect x="-36" y="-6" width="72" height="34" rx="8" fill="#F7C6D9" /><rect x="-36" y="-10" width="72" height="12" rx="6" fill="#fff" /><rect x="-4" y="-34" width="8" height="24" rx="3" fill="${C.blue}" /><path d="M0 -46 Q7 -38 0 -34 Q-7 -38 0 -46 Z" fill="${C.sun}" /><circle cx="-20" cy="12" r="4" fill="${C.red}" /><circle cx="0" cy="14" r="4" fill="${C.red}" /><circle cx="20" cy="12" r="4" fill="${C.red}" />`);
    case 'bulle':
      return g(`<circle r="24" fill="#CFEAFF" opacity="0.45" stroke="#9CCBF2" stroke-width="3" /><ellipse cx="-9" cy="-9" rx="6" ry="4" fill="#fff" opacity="0.9" transform="rotate(-35 -9 -9)" />`);
    case 'brosse':
      return g(`<rect x="-6" y="-40" width="12" height="74" rx="6" fill="${C.blue}" transform="rotate(30)" /><rect x="-12" y="-52" width="24" height="18" rx="4" fill="#fff" transform="rotate(30)" /><rect x="-10" y="-62" width="20" height="10" rx="3" fill="#9CCBF2" transform="rotate(30)" />`);
    case 'fusee':
      return g(`<path d="M0 -50 Q22 -24 18 20 L-18 20 Q-22 -24 0 -50 Z" fill="#fff" stroke="#D6DDE8" stroke-width="2" /><circle cx="0" cy="-14" r="9" fill="#6CB6E8" stroke="#4E9CD3" stroke-width="3" /><path d="M-18 6 L-32 28 L-18 22 Z M18 6 L32 28 L18 22 Z" fill="${C.red}" /><path d="M-10 22 Q0 ${r1(52 + Math.sin(t * 20) * 8)} 10 22 Z" fill="#F7B451" />`);
  }
}
