/**
 * Sons des petits films, tous synthétisés (Web Audio) : aucun fichier, fonctionne hors ligne.
 * Palette inspirée des fiches de style : boîte à musique et glockenspiel pour le crayon,
 * tuba, piano bastringue et sifflet à coulisse pour le cartoon des années 30, papier et pizzicato pour le pop-up.
 */

type Wave = OscillatorType;

export class FilmAudio {
  readonly ctx: AudioContext | null;
  private master: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private noiseBuf: AudioBuffer | null = null;
  muted = false;
  /** Silence de l'orchestre (la grille continue, la musique reprend sur le bon temps). */
  hold = false;

  constructor() {
    const Ctx = typeof window !== 'undefined' ? window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext : undefined;
    this.ctx = Ctx ? new Ctx() : null;
    if (!this.ctx) return;
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.9;
    // Petit compresseur : les notes synthétisées ne font jamais de pic qui surprend.
    const comp = this.ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 4;
    this.master.connect(comp).connect(this.ctx.destination);
    this.musicBus = this.ctx.createGain();
    this.musicBus.gain.value = 0.32;
    this.musicBus.connect(this.master);
    this.sfxBus = this.ctx.createGain();
    this.sfxBus.gain.value = 0.7;
    this.sfxBus.connect(this.master);
    const len = this.ctx.sampleRate;
    this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = this.noiseBuf.getChannelData(0);
    let seed = 12345;
    for (let i = 0; i < len; i++) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      d[i] = (seed / 0x7fffffff) * 2 - 1;
    }
  }

  get now() {
    return this.ctx?.currentTime ?? 0;
  }

  resume() {
    if (this.ctx?.state === 'suspended') void this.ctx.resume();
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(m ? 0 : 0.9, this.ctx.currentTime, 0.05);
  }

  /** Baisse la musique sous la voix (de ~9 dB), puis la remonte doucement. */
  duck(on: boolean) {
    if (!this.musicBus || !this.ctx) return;
    this.musicBus.gain.setTargetAtTime(on ? 0.11 : 0.32, this.ctx.currentTime, on ? 0.08 : 0.5);
  }

  close() {
    void this.ctx?.close();
  }

  /* ───────────── Briques ───────────── */

  private env(at: number, dur: number, peak: number, attack = 0.005, bus: 'music' | 'sfx' = 'sfx') {
    const g = this.ctx!.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), at + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    g.connect(bus === 'music' ? this.musicBus! : this.sfxBus!);
    return g;
  }

  tone(freq: number, at: number, dur: number, opts: { wave?: Wave; gain?: number; attack?: number; bus?: 'music' | 'sfx'; to?: number; lp?: number; detune?: number } = {}) {
    if (!this.ctx || this.muted) return;
    const o = this.ctx.createOscillator();
    o.type = opts.wave ?? 'sine';
    o.frequency.setValueAtTime(freq, at);
    if (opts.to) o.frequency.exponentialRampToValueAtTime(opts.to, at + dur);
    if (opts.detune) o.detune.value = opts.detune;
    const g = this.env(at, dur, opts.gain ?? 0.2, opts.attack ?? 0.005, opts.bus);
    if (opts.lp) {
      const f = this.ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = opts.lp;
      o.connect(f).connect(g);
    } else o.connect(g);
    o.start(at);
    o.stop(at + dur + 0.05);
  }

  noise(at: number, dur: number, opts: { type?: BiquadFilterType; freq?: number; to?: number; q?: number; gain?: number; attack?: number; bus?: 'music' | 'sfx' } = {}) {
    if (!this.ctx || this.muted || !this.noiseBuf) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    src.loop = true;
    const f = this.ctx.createBiquadFilter();
    f.type = opts.type ?? 'bandpass';
    f.frequency.setValueAtTime(opts.freq ?? 1200, at);
    if (opts.to) f.frequency.exponentialRampToValueAtTime(opts.to, at + dur);
    f.Q.value = opts.q ?? 1;
    const g = this.env(at, dur, opts.gain ?? 0.2, opts.attack ?? 0.01, opts.bus);
    src.connect(f).connect(g);
    src.start(at, (at * 7.3) % 0.9);
    src.stop(at + dur + 0.05);
  }

  /* ───────────── Instruments ───────────── */

  /** Boîte à musique : sinus brillant + partiel métallique qui s'éteint vite. */
  musicBox(midi: number, at: number, vel = 1) {
    const f = mtof(midi);
    this.tone(f, at, 1.6, { gain: 0.16 * vel, bus: 'music', attack: 0.002 });
    this.tone(f * 4.01, at, 0.35, { gain: 0.035 * vel, bus: 'music', attack: 0.001 });
  }

  glock(midi: number, at: number, vel = 1, bus: 'music' | 'sfx' = 'music') {
    const f = mtof(midi);
    this.tone(f, at, 1.1, { gain: 0.14 * vel, bus, attack: 0.001 });
    this.tone(f * 2.76, at, 0.4, { gain: 0.05 * vel, bus, attack: 0.001 });
  }

  /** Tuba « oum » : triangle grave filtré. */
  tuba(midi: number, at: number, dur = 0.3) {
    this.tone(mtof(midi), at, dur, { wave: 'triangle', gain: 0.32, bus: 'music', attack: 0.02, lp: 700 });
    this.tone(mtof(midi) * 2, at, dur * 0.8, { wave: 'sine', gain: 0.08, bus: 'music', attack: 0.02 });
  }

  /** Piano bastringue : deux cordes légèrement désaccordées. */
  piano(midis: number[], at: number, dur = 0.35, vel = 1) {
    for (const m of midis) {
      this.tone(mtof(m), at, dur, { wave: 'triangle', gain: 0.07 * vel, bus: 'music', attack: 0.003, detune: -9 });
      this.tone(mtof(m), at, dur, { wave: 'triangle', gain: 0.07 * vel, bus: 'music', attack: 0.003, detune: 9 });
    }
  }

  clarinet(midi: number, at: number, dur: number, vel = 1) {
    this.tone(mtof(midi), at, dur, { wave: 'square', gain: 0.05 * vel, bus: 'music', attack: 0.03, lp: 1600 });
  }

  /** Pizzicato doux (cordes pincées). */
  pizz(midi: number, at: number, vel = 1) {
    this.tone(mtof(midi), at, 0.28, { wave: 'triangle', gain: 0.15 * vel, bus: 'music', attack: 0.002, lp: 2200 });
  }

  /** Flûte (berceuse) : sinus avec attaque douce. */
  flute(midi: number, at: number, dur: number, vel = 1) {
    this.tone(mtof(midi), at, dur, { wave: 'sine', gain: 0.1 * vel, bus: 'music', attack: 0.08 });
  }

  brush(at: number, vel = 1) {
    this.noise(at, 0.12, { type: 'highpass', freq: 4000, gain: 0.05 * vel, bus: 'music' });
  }

  woodblock(at: number, vel = 1) {
    this.tone(1200, at, 0.08, { gain: 0.18 * vel, attack: 0.001, to: 900 });
  }

  /* ───────────── Bruitages ───────────── */

  /** Crayon de cire sur papier grainé : bruit filtré, grain irrégulier. */
  crayon(at: number, dur = 0.5, vel = 1) {
    for (let i = 0; i < dur / 0.09; i++) this.noise(at + i * 0.09, 0.08, { freq: 2600 + (i % 3) * 500, q: 3, gain: 0.05 * vel });
  }

  chime(at: number, notes = [84, 88, 91, 96]) {
    notes.forEach((m, i) => this.glock(m, at + i * 0.09, 0.8, 'sfx'));
  }

  sparkle(at: number) {
    [96, 100, 103].forEach((m, i) => this.tone(mtof(m), at + i * 0.05, 0.5, { gain: 0.05, attack: 0.001 }));
  }

  boing(at: number) {
    if (!this.ctx || this.muted) return;
    const o = this.ctx.createOscillator();
    const lfo = this.ctx.createOscillator();
    const lg = this.ctx.createGain();
    o.frequency.setValueAtTime(180, at);
    o.frequency.exponentialRampToValueAtTime(420, at + 0.35);
    lfo.frequency.value = 22;
    lg.gain.value = 40;
    lfo.connect(lg).connect(o.frequency);
    const g = this.env(at, 0.45, 0.2);
    o.connect(g);
    o.start(at);
    lfo.start(at);
    o.stop(at + 0.5);
    lfo.stop(at + 0.5);
  }

  slideWhistle(at: number, up = false, dur = 0.6) {
    this.tone(up ? 500 : 1500, at, dur, { gain: 0.12, to: up ? 1600 : 450, attack: 0.03 });
  }

  /** Papier : froissement / page qui passe. */
  paper(at: number, dur = 0.35, vel = 1) {
    this.noise(at, dur, { freq: 3000, to: 1500, q: 0.8, gain: 0.08 * vel, attack: 0.02 });
  }

  /** Pop-up qui se déplie : petit balayage + froissé. */
  snap(at: number, vel = 1) {
    this.tone(500, at, 0.09, { gain: 0.12 * vel, to: 1400, attack: 0.002 });
    this.noise(at, 0.1, { freq: 3500, q: 1.5, gain: 0.07 * vel });
  }

  /** « Clic » satisfaisant (le pont-levis qui se verrouille). */
  click(at: number) {
    this.tone(2200, at, 0.04, { gain: 0.25, attack: 0.001, to: 1600 });
    this.tone(320, at, 0.12, { gain: 0.18, attack: 0.001, to: 140 });
  }

  thump(at: number, vel = 1) {
    this.tone(120, at, 0.18, { gain: 0.3 * vel, to: 60, attack: 0.002 });
    this.noise(at, 0.08, { type: 'lowpass', freq: 600, gain: 0.08 * vel });
  }

  step(at: number) {
    this.noise(at, 0.05, { freq: 1800, q: 2, gain: 0.05 });
  }

  /** Ronron de projecteur (cartoon années 30), en boucle. */
  projector(at: number, dur: number) {
    for (let i = 0; i < dur * 24; i++) this.noise(at + i / 24, 0.02, { freq: 900, q: 4, gain: 0.012, bus: 'music' });
  }
}

export const mtof = (m: number) => 440 * 2 ** ((m - 69) / 12);

/**
 * Programmateur de musique : appelle play(pas, temps) un peu en avance pour chaque pas de la grille,
 * jusqu'à l'arrêt. Les mesures se répètent : la musique dure le temps du film, quelle que soit la voix.
 */
export function loop(audio: FilmAudio, stepSec: number, play: (step: number, at: number) => void): () => void {
  if (!audio.ctx) return () => {};
  let step = 0;
  let next = audio.now + 0.15;
  const tick = () => {
    while (next < audio.now + 0.4) {
      play(step, next);
      step++;
      next += stepSec;
    }
  };
  tick();
  const id = window.setInterval(tick, 100);
  return () => window.clearInterval(id);
}
