/**
 * Web Audio API synthesized sound effects and Speech Synthesis utilities
 * 100% offline-compatible, no external audio assets required.
 */

import { pickVoice, softTone } from './voice';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public playPop() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  /** Petit « oups » doux (deux notes qui descendent) : une erreur, sans jamais faire peur. */
  public playOops() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    [523.25, 392].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime + i * 0.13;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.23);
    });
  }

  /** « Fffuit » de page qui tourne (bruit filtré qui glisse). */
  public playWhoosh() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.3), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.exponentialRampToValueAtTime(2400, now + 0.25);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start(now);
  }

  /** « Tic » court : les dernières secondes d'un chrono. */
  public playTick() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    osc.type = 'square';
    osc.frequency.setValueAtTime(1200, now);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  /** « Boing » élastique : quand on touche la mascotte. */
  public playBoing() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.12);
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.3);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.36);
  }

  /** Petite pluie de notes aiguës : quand on touche une image. */
  public playSparkle() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    [1318.5, 1568, 2093].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime + idx * 0.05;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq * (0.97 + Math.random() * 0.06), now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.21);
    });
  }

  public playStarChime() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime + idx * 0.08;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.36);
    });
  }

  public playFanfare() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const arpeggio = [440, 554.37, 659.25, 880];
    arpeggio.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime + i * 0.12;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (i === arpeggio.length - 1 ? 0.6 : 0.25));

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.7);
    });
  }

  public playSteamClick() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // "Clic-clic" sound (2 clicks)
    [0, 0.15].forEach((delay) => {
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      clickOsc.type = 'square';
      clickOsc.frequency.setValueAtTime(1400, now + delay);
      clickOsc.frequency.exponentialRampToValueAtTime(300, now + delay + 0.04);

      clickGain.gain.setValueAtTime(0.3, now + delay);
      clickGain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.04);

      clickOsc.connect(clickGain);
      clickGain.connect(ctx.destination);

      clickOsc.start(now + delay);
      clickOsc.stop(now + delay + 0.05);
    });

    // "... Pschhhh!" (Filtered white noise steam puff)
    const bufferSize = ctx.sampleRate * 0.6;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2200, now + 0.35);
    filter.Q.setValueAtTime(2, now + 0.35);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.01, now + 0.35);
    noiseGain.gain.linearRampToValueAtTime(0.35, now + 0.42);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.95);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noise.start(now + 0.35);
    noise.stop(now + 0.96);
  }

  public playTractor() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    for (let i = 0; i < 6; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + i * 0.1;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(75, t);
      osc.frequency.linearRampToValueAtTime(95, t + 0.05);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.095);
    }
  }

  public playWrench() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.setValueAtTime(650, now + 0.06);
    osc.frequency.setValueAtTime(900, now + 0.12);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  public playAnimal(type: 'cow' | 'sheep' | 'pig' | 'chicken') {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'cow') {
      // Meuhhh! Low pitch with warm vibrato
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(130, now);
      osc.frequency.linearRampToValueAtTime(110, now + 0.8);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.85);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.86);
    } else if (type === 'sheep') {
      // Bêêê! Modulated vibrato
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.linearRampToValueAtTime(230, now + 0.7);

      // Tremolo
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 14;
      lfoGain.gain.value = 25;
      lfo.connect(osc.frequency);
      lfo.start(now);
      lfo.stop(now + 0.7);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0.28, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.72);
    } else if (type === 'pig') {
      // Groin-groin! Double short staccato grunts
      [0, 0.22].forEach((delay) => {
        const grunt = ctx.createOscillator();
        const gGain = ctx.createGain();
        grunt.type = 'sawtooth';
        grunt.frequency.setValueAtTime(90, now + delay);
        grunt.frequency.linearRampToValueAtTime(65, now + delay + 0.16);

        gGain.gain.setValueAtTime(0.3, now + delay);
        gGain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.16);

        grunt.connect(gGain);
        gGain.connect(ctx.destination);
        grunt.start(now + delay);
        grunt.stop(now + delay + 0.17);
      });
    } else if (type === 'chicken') {
      // Cot-cot-cot!
      [0, 0.12, 0.25, 0.45].forEach((delay, idx) => {
        const cluck = ctx.createOscillator();
        const cGain = ctx.createGain();
        cluck.type = 'sine';
        const f = idx === 3 ? 550 : 680;
        cluck.frequency.setValueAtTime(f, now + delay);
        cluck.frequency.exponentialRampToValueAtTime(320, now + delay + 0.09);

        cGain.gain.setValueAtTime(0.25, now + delay);
        cGain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.09);

        cluck.connect(cGain);
        cGain.connect(ctx.destination);
        cluck.start(now + delay);
        cluck.stop(now + delay + 0.1);
      });
    }
  }

  public playGentleLullaby() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    // Twinkle twinkle opening notes
    const notes = [261.63, 261.63, 392.0, 392.0, 440.0, 440.0, 392.0];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = ctx.currentTime + i * 0.4;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.58);
    });
  }

  public playSessionEndAlert() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    // Gentle 3-tone chime for bedtime / screen time transition
    const tones = [523.25, 440, 349.23];
    tones.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = ctx.currentTime + idx * 0.35;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.65);
    });
  }
}

export const soundEffects = new SoundEngine();

// Speech synthesis controller with word-by-word tracking
export interface SpeakOptions {
  rate?: number; // default ~0.85 for 5yo
  pitch?: number; // 1.1 for bright voice
  onWord?: (word: string, charIndex: number) => void;
  onEnd?: () => void;
  onError?: () => void;
}

let activeUtterance: SpeechSynthesisUtterance | null = null;

/** La voix la plus douce disponible ; recalculée quand le navigateur charge ses voix (souvent après coup). */
let cachedVoice: SpeechSynthesisVoice | undefined;
function frenchVoice(): SpeechSynthesisVoice | undefined {
  if (!cachedVoice) cachedVoice = pickVoice(window.speechSynthesis.getVoices());
  return cachedVoice;
}
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.addEventListener?.('voiceschanged', () => {
    cachedVoice = pickVoice(window.speechSynthesis.getVoices());
  });
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    activeUtterance = null;
  }
}

export function isSpeaking(): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
  return window.speechSynthesis.speaking;
}

export function speakFrenchText(text: string, options: SpeakOptions = {}) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (options.onEnd) options.onEnd();
    return;
  }

  // Cancel any ongoing speech
  stopSpeaking();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'fr-FR';
  // Voix de conteuse : douce, posée, jamais criarde (voir utils/voice.ts).
  const tone = softTone(options.rate, options.pitch);
  utterance.rate = tone.rate;
  utterance.pitch = tone.pitch;
  utterance.volume = tone.volume;

  const voice = frenchVoice();
  if (voice) {
    utterance.voice = voice;
  }

  utterance.onboundary = (event) => {
    if (event.name === 'word' && options.onWord) {
      const charIndex = event.charIndex;
      const remaining = text.slice(charIndex);
      const match = remaining.match(/^\w+/);
      const word = match ? match[0] : '';
      options.onWord(word, charIndex);
    }
  };

  utterance.onend = () => {
    activeUtterance = null;
    if (options.onEnd) options.onEnd();
  };

  utterance.onerror = () => {
    activeUtterance = null;
    if (options.onError) options.onError();
  };

  activeUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}
