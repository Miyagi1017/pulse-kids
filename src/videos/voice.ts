/**
 * Voix des vidéos du jour et des 66 dessins animés.
 * Prises enregistrées dans src/assets/voix/<id>/<n° de scène>.mp3 : voix de Christine (ElevenLabs),
 * prolongée par clonage de timbre OpenVoice V2 (MIT) sur une voix française Piper (scripts/voix-openvoice.md).
 * Sans prise, la synthèse vocale du navigateur prend le relais.
 * Le prénom n'est pas enregistré : il reste affiché à l'écran.
 */
import { speakFrenchText, stopSpeaking } from '../utils/soundEffects';

const CLIPS = import.meta.glob('../assets/voix/*/*.mp3', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

export function videoClip(id: string, scene: number): string | undefined {
  return CLIPS[`../assets/voix/${id}/${String(scene).padStart(2, '0')}.mp3`];
}

let current: HTMLAudioElement | null = null;

/** Dit la scène (prise enregistrée si elle existe) ; onEnd une seule fois ; onError si rien ne peut être dit. */
export function sayScene(id: string, scene: number, text: string, opts: { rate: number; pitch?: number; onEnd: () => void; onError: () => void }) {
  stopVoice();
  const url = videoClip(id, scene);
  if (!url) {
    speakFrenchText(text, { rate: opts.rate, pitch: opts.pitch, onEnd: opts.onEnd, onError: opts.onError });
    return;
  }
  const a = new Audio();
  current = a;
  let done = false;
  const end = (ok: boolean) => {
    if (done) return;
    done = true;
    (ok ? opts.onEnd : opts.onError)();
  };
  a.onended = () => end(true);
  a.onerror = () => end(false);
  // Lu en entier via fetch : le service worker peut le garder pour le hors ligne.
  void fetch(url)
    .then((r) => r.blob())
    .then((b) => {
      if (current !== a) return;
      a.src = URL.createObjectURL(b);
      return a.play();
    })
    .catch(() => end(false));
}

/** Avancement de la prise en cours (0 → 1), ou null si aucune prise ne joue (voix du navigateur). */
export function voiceProgress(): number | null {
  if (!current || !isFinite(current.duration) || current.duration <= 0) return null;
  return Math.min(1, current.currentTime / current.duration);
}

/** Instant de la prise en cours, en secondes (pour allumer les mots au moment où Christine les dit), ou null. */
export function voiceTime(): number | null {
  if (!current || current.paused && current.currentTime === 0) return null;
  return current.currentTime;
}

export function stopVoice() {
  if (current) {
    current.onended = null;
    current.onerror = null;
    current.pause();
    current = null;
  }
  stopSpeaking();
}
