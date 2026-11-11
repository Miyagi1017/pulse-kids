/**
 * Voix des films.
 * Si une prise enregistrée existe (src/assets/films/<id>/<n°>.mp3, voir scripts/split-film-voice.ts),
 * on la joue : c'est la voix de conteuse ElevenLabs, identique hors ligne. Sinon, la synthèse vocale du navigateur.
 */
import { speakFrenchText, stopSpeaking } from '../utils/soundEffects';

const CLIPS = import.meta.glob('../assets/films/*/*.mp3', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

export function clipFor(filmId: string, beat: number): string | undefined {
  return CLIPS[`../assets/films/${filmId}/${String(beat + 1).padStart(2, '0')}.mp3`];
}

export function hasRecordedVoice(filmId: string): boolean {
  return clipFor(filmId, 0) !== undefined;
}

let current: HTMLAudioElement | null = null;

/** Dit la phrase ; onEnd est appelé une seule fois (fin, erreur ou arrêt). */
export function sayLine(filmId: string, beat: number, text: string, onEnd: () => void, muted: boolean) {
  stopLine();
  let called = false;
  const end = () => {
    if (called) return;
    called = true;
    onEnd();
  };
  const url = clipFor(filmId, beat);
  if (url) {
    // Lu en entier via fetch (requête simple, sans « Range ») : le service worker peut le garder pour le hors ligne.
    const a = new Audio();
    a.muted = muted;
    current = a;
    a.onended = end;
    a.onerror = end;
    void fetch(url)
      .then((r) => r.blob())
      .then((b) => {
        if (current !== a) return;
        a.src = URL.createObjectURL(b);
        return a.play();
      })
      .catch(end);
    return;
  }
  if (muted) {
    end();
    return;
  }
  speakFrenchText(text, { rate: 0.82, onEnd: end, onError: end });
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) end();
}

export function stopLine() {
  if (current) {
    current.onended = null;
    current.onerror = null;
    current.pause();
    current = null;
  }
  stopSpeaking();
}
