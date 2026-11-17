/**
 * Lecture de la banque de voix : si toutes les phrases d'un texte ont leur prise (voix de Christine),
 * on les enchaîne ; sinon on laisse la voix du navigateur dire le texte entier (jamais deux voix
 * dans la même réplique). Les prises sont dans public/banque/<fichier>.mp3, la liste dans index.json,
 * chargée une fois au démarrage (petite, mise en cache par le service worker).
 */
import { keyFile, sentenceKey, splitSentences } from './bank';
import { namePlaylist } from './names';

let manifest: Set<string> | null = null;
let loading: Promise<void> | null = null;

export function loadVoiceBank(): Promise<void> {
  if (manifest || loading) return loading ?? Promise.resolve();
  loading = fetch('/banque/index.json')
    .then((r) => (r.ok ? r.json() : []))
    .then((ids: string[]) => {
      manifest = new Set(ids);
    })
    .catch(() => {
      manifest = new Set();
    });
  return loading;
}

export function profileName(): string | null {
  try {
    const raw = localStorage.getItem('pulse_kids_profile_v3');
    return raw ? ((JSON.parse(raw) as { name?: string }).name ?? null) : null;
  } catch {
    return null;
  }
}

interface Part {
  url: string;
  text: string;
  start: number;
  /** Pause après cette prise (ms) : 140 entre deux phrases, 0 entre les morceaux autour du prénom. */
  gap: number;
}

/** Vrai si la prise `file` est dans la banque (chargée). */
export const bankHas = (file: string) => !!manifest?.has(file);

/** Les prises d'un texte, ou null s'il en manque une (ou si la banque n'est pas encore chargée). */
export function bankParts(text: string): Part[] | null {
  if (!manifest || manifest.size === 0) return null;
  const m = manifest;
  return partsFor(text, profileName(), (f) => m.has(f));
}

/** Les prises d'un texte où le prénom est écrit : morceau, prénom, morceau (Christine dit le prénom) ; null sinon. */
export function nameParts(text: string): Part[] | null {
  const list = namePlaylist(text, profileName(), bankHas);
  if (!list) return null;
  let at = 0;
  return list.map((p, i) => {
    const part = { url: `/banque/${p.file}.mp3`, text: p.text, start: at, gap: i === list.length - 1 ? 140 : 0 };
    at += p.text.length;
    return part;
  });
}

/**
 * Les prises d'un texte d'après la liste `has` : chaque phrase a sa prise ; une phrase qui contient le prénom
 * est dite en morceaux autour du prénom (Christine le dit) si toutes ces prises existent, sinon sans le prénom.
 */
export function partsFor(text: string, name: string | null, has: (file: string) => boolean): Part[] | null {
  const parts: Part[] = [];
  let from = 0;
  for (const s of splitSentences(text)) {
    const start = Math.max(0, text.indexOf(s, from));
    from = start + s.length;
    const withName = namePlaylist(s, name, has);
    if (withName) {
      let at = start;
      withName.forEach((p, i) => {
        parts.push({ url: `/banque/${p.file}.mp3`, text: p.text, start: at, gap: i === withName.length - 1 ? 140 : 0 });
        at += p.text.length;
      });
      continue;
    }
    const file = keyFile(sentenceKey(s, name));
    if (!has(file)) return null;
    parts.push({ url: `/banque/${file}.mp3`, text: s, start, gap: 140 });
  }
  return parts.length ? parts : null;
}

let run = 0;
let audio: HTMLAudioElement | null = null;
let timers: ReturnType<typeof setTimeout>[] = [];

export function stopBank() {
  run++;
  timers.forEach(clearTimeout);
  timers = [];
  if (audio) {
    audio.onended = audio.onerror = null;
    audio.pause();
    audio = null;
  }
}

const blobOf = (url: string) =>
  fetch(url)
    .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
    .then((b) => URL.createObjectURL(b));

/** Enchaîne les prises ; onWord est donné à peu près (mots répartis sur la durée de chaque phrase). */
export function playBank(parts: Part[], opts: { onWord?: (word: string, charIndex: number) => void; onEnd?: () => void; onError?: () => void }) {
  stopBank();
  const id = run;
  let i = 0;
  let next: Promise<string> | null = blobOf(parts[0].url);
  const step = () => {
    if (id !== run) return;
    if (i >= parts.length) {
      opts.onEnd?.();
      return;
    }
    const part = parts[i];
    const current = next!;
    next = i + 1 < parts.length ? blobOf(parts[i + 1].url) : null;
    current
      .then((src) => {
        if (id !== run) return;
        const a = new Audio(src);
        audio = a;
        a.onended = () => {
          URL.revokeObjectURL(src);
          i++;
          timers.push(setTimeout(step, part.gap));
        };
        a.onerror = () => id === run && opts.onError?.();
        a.onloadedmetadata = () => {
          if (!opts.onWord || !isFinite(a.duration)) return;
          const words = [...part.text.matchAll(/[\p{L}\p{N}'’-]+/gu)];
          for (const w of words) {
            const at = (w.index! / Math.max(1, part.text.length)) * a.duration * 1000;
            timers.push(setTimeout(() => id === run && opts.onWord?.(w[0], part.start + w.index!), at));
          }
        };
        return a.play();
      })
      .catch(() => id === run && opts.onError?.());
  };
  step();
}
