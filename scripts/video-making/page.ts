/**
 * Page de rendu Video-Making d'un film Pulse Kids (contrat de ~/Video-Making : window.ready, window.init,
 * window.renderFrame(t) → { subtitleBoxes, activeWord, activeStart }).
 * L'image : le dessin animé de l'appli dans le style de la vidéo, avec la matière Lemo-Opuscar
 * (video/lemo/pulse-film/frame.ts), au minutage des prises OpenVoice de Christine (window.STORY, filmTimeline.ts).
 * Sous l'image, un bandeau de papier porte les sous-titres karaoké, minutés par l'aligneur de Video-Making.
 * Tout est une fonction pure du temps : n'importe quelle image se rend dans n'importe quel ordre.
 */
import '../../src/films/fonts';
// La police de l'appli (sous-titres) : Fredoka, OFL.
import '@fontsource/fredoka/latin-500.css';
import '@fontsource/fredoka/latin-600.css';
import { swatch } from '../../src/kits/styles';
import { videoStyleFor } from '../../src/videos/pacing';
import { filmFrame, type Story } from '../../video/lemo/pulse-film/frame';

interface Word {
  line_index: number;
  word: string;
  start: number;
  end: number;
}
interface Project {
  width: number;
  height: number;
  subtitles: {
    safe_top: number;
    safe_bottom: number;
    safe_side: number;
    font_px: number;
  };
}

const story = (window as unknown as { STORY: Story }).STORY;
const cv = document.getElementById('art') as HTMLCanvasElement;
const g = cv.getContext('2d')!;
let P: Project = {
  width: 1280,
  height: 720,
  subtitles: {
    safe_top: 0.81,
    safe_bottom: 0.985,
    safe_side: 0.05,
    font_px: 38
  }
};
let WORDS: Word[] = [];
/** Les mots tels que l'aligneur les rend : c'est eux que vérifie le contrôle des sous-titres (subtitle_qc.mjs). */
let RAW: Word[] = [];
export const DURATION = story.dur;
const sw = swatch(videoStyleFor(story.id));
const paper = {
  ...sw,
  paper: sw.dark ? '#14121c' : sw.paper,
  text: sw.dark ? '#fff8ea' : sw.text
};
const frame = filmFrame(story);
const work = document.createElement('canvas');
work.width = 1280;
work.height = 720;
const wg = work.getContext('2d')!;

function subtitles(t: number, W: number, H: number) {
  const S = P.subtitles,
    size = S.font_px,
    top = H * S.safe_top,
    bottom = H * S.safe_bottom,
    side = W * S.safe_side;
  const lines = [...new Set(WORDS.map((w) => w.line_index))];
  const cur = lines
    .filter((li) => {
      const ws = WORDS.filter((w) => w.line_index === li);
      return t >= ws[0].start - 0.1 && t <= ws[ws.length - 1].end + 0.3;
    })
    .pop();
  if (cur === undefined)
    return {
      subtitleBoxes: [] as number[][],
      activeWord: null as string | null,
      activeStart: null as number | null
    };
  const ws = WORDS.filter((w) => w.line_index === cur);
  const text = (w: Word) => w.word;
  g.font = `600 ${size}px Fredoka, "Patrick Hand", sans-serif`;
  g.textBaseline = 'alphabetic';
  g.textAlign = 'left';
  const space = g.measureText(' ').width,
    maxW = W - 2 * side - 24;
  const rows: (Word & { ww: number })[][] = [[]];
  let rowW = 0;
  for (const w of ws) {
    const ww = g.measureText(text(w)).width;
    if (rowW && rowW + space + ww > maxW) {
      rows.push([]);
      rowW = 0;
    }
    rows[rows.length - 1].push({ ...w, ww });
    rowW += (rowW ? space : 0) + ww;
  }
  const lineH = size * 1.3,
    y0 = (top + bottom) / 2 - (rows.length * lineH) / 2;
  let active: Word | null = null;
  for (const w of ws) if (t >= w.start) active = w;
  const boxes: number[][] = [];
  rows.forEach((row, r) => {
    const rw = row.reduce((a, w, i) => a + w.ww + (i ? space : 0), 0),
      x0 = W / 2 - rw / 2,
      y = y0 + r * lineH;
    boxes.push([x0 - 12, y, rw + 24, lineH]);
    let x = x0;
    for (const w of row) {
      const on = active && w.start === active.start,
        said = t >= w.start;
      // Mot en cours : couleur chaude et petit rebond (0,12 s) ; déjà dit : plein ; à venir : estompé.
      g.fillStyle = on ? (paper.dark ? '#ffd36e' : '#d97706') : said ? paper.text : paper.dark ? 'rgba(255,248,234,0.45)' : 'rgba(29,26,23,0.38)';
      g.save();
      const p = on ? Math.min(1, (t - w.start) / 0.12) : 1;
      const sc = on ? 1 + 0.08 * Math.sin(p * Math.PI) : 1;
      g.translate(x + w.ww / 2, y + lineH * 0.76);
      g.scale(sc, sc);
      g.fillText(text(w), -w.ww / 2, 0);
      g.restore();
      x += w.ww + space;
    }
  });
  let raw: Word | null = null;
  for (const w of RAW) if (w.line_index === cur && t >= w.start) raw = w;
  return {
    subtitleBoxes: boxes,
    activeWord: raw ? raw.word : null,
    activeStart: raw ? raw.start : null
  };
}

const win = window as unknown as Record<string, unknown>;
win.DURATION = DURATION;
win.ready = document.fonts.ready.then(() => Promise.all([...document.fonts].map((f) => f.load().catch(() => undefined))));
/**
 * L'aligneur rend des mots nettoyés (« Voici », « manchots » sans ponctuation, « sais-tu » en deux).
 * On affiche le texte exact de la phrase : chaque mot écrit prend le minutage de son premier morceau aligné,
 * un signe sans lettre (« … ») se colle au mot d'avant.
 */
function exactWords(lines: string[], aligned: Word[]): Word[] {
  const out: Word[] = [];
  lines.forEach((line, i) => {
    const li = i + 1;
    const parts = aligned.filter((w) => w.line_index === li);
    let k = 0;
    for (const tok of line.split(/\s+/).filter(Boolean)) {
      const n = [...tok.matchAll(/[\p{L}\p{N}]+(?:'[\p{L}\p{N}]+)?/gu)].filter((m) => /\p{L}/u.test(m[0])).length;
      const prev = out[out.length - 1];
      if (n === 0 || k >= parts.length) {
        if (prev && prev.line_index === li) prev.word += ` ${tok}`;
        continue;
      }
      const first = parts[k],
        last = parts[Math.min(parts.length - 1, k + n - 1)];
      out.push({
        line_index: li,
        word: tok,
        start: first.start,
        end: last.end
      });
      k += n;
    }
  });
  return out;
}

win.init = (d: { project: Project & { lines?: string[] }; words?: Word[] }) => {
  P = d.project;
  RAW = d.words ?? [];
  WORDS = d.project.lines ? exactWords(d.project.lines, d.words ?? []) : (d.words ?? []);
  cv.width = P.width;
  cv.height = P.height;
};
cv.width = P.width;
cv.height = P.height;

win.renderFrame = (t: number) => {
  const W = cv.width,
    H = cv.height;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = paper.paper;
  g.fillRect(0, 0, W, H);
  frame.render(wg, Math.min(t, DURATION - 1e-3));
  // L'image du film en haut, centrée (16:9), le bandeau des sous-titres dessous.
  const ch = Math.round(H * 0.8),
    cw = Math.round((ch * 16) / 9),
    cx = Math.round((W - cw) / 2);
  g.drawImage(work, cx, 0, cw, ch);
  return subtitles(t, W, H);
};
