import { linearTiming, TransitionSeries } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';
import type { ReactNode } from 'react';
import { AbsoluteFill, Audio, Easing, getStaticFiles, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import type { SportMove, SportTip } from '../../src/data/sport';
import type { Animal, Mood } from '../../src/lib/mascots';
import { mascotForMove } from '../../src/lib/mascots';
import { FONT } from './fonts';
import { FrameMascot } from './FrameMascot';
import { HandDrawnFilters, PaperTexture } from './HandDrawn';
import { kidLook } from './kids';
import { MoveSigns, SIGN_LABELS, signFor } from './MoveSigns';
import { Studio } from './Studio';
import { BRAVO_LINE, COUNT_LINES, cueOf, helpLine, problemLine, refrainOf, seedOf, voiceDuration, voiceFile } from './voice';

export const FPS = 30;
export const WIDTH = 1280;
export const HEIGHT = 720;

const INTRO_FILE = 'intro.mp4';
const INTRO = 75; // générique HTML rendu avec HyperFrames (facultatif)
const TITLE = 105;
const BRAVO = 120;
const TRANSITION = 18;

const INK = '#47386b';
const TEAL_RING = '#16c7c0';
const BRAVO_OUTLINE = '#2f7fd0';

const hasIntro = () => getStaticFiles().some((f) => f.name === INTRO_FILE);

const VOICE_DELAY = 10;
const GAP = 14;
const BREATH = 24; // silence minimal entre deux refrains : la musique reprend le dessus
const COUNTDOWN = 3 * FPS;
const END_PAUSE = 24;

const framesOf = (text: string) => Math.ceil((voiceDuration(text) ?? 0) * FPS);

interface Spoken {
  text: string;
  from: number;
}

/** Les phrases à la suite, séparées d'une petite pause. */
function inSequence(texts: string[]): Spoken[] {
  let at = VOICE_DELAY;
  return texts.map((text) => {
    const line = { text, from: at };
    at += framesOf(text) + GAP;
    return line;
  });
}

const endOf = (lines: Spoken[]) => Math.max(...lines.map((l) => l.from + framesOf(l.text)));

const titleSpoken = (tip: SportTip) => inSequence([problemLine(tip), helpLine(tip)]);
const bravoSpoken = () => inSequence([BRAVO_LINE]);
const titleFrames = (tip: SportTip) => Math.max(TITLE, endOf(titleSpoken(tip)) + END_PAUSE);
const bravoFrames = () => Math.max(BRAVO, endOf(bravoSpoken()) + END_PAUSE);

/**
 * Le déroulé d'un mouvement : la consigne, une instruction, le refrain répété, puis « Trois, deux, un ».
 * Le mouvement dure le temps prévu, et s'allonge seulement si la voix a besoin de plus de temps.
 */
export function moveTimeline(move: SportMove) {
  const head = inSequence([move.text, cueOf(move)]);
  const refrain = refrainOf(move);
  const song = framesOf(refrain);
  const headEnd = endOf(head);
  const total = Math.max(move.seconds * FPS, headEnd + BREATH + song + BREATH + COUNTDOWN + 12);
  const room = total - COUNTDOWN - 12 - headEnd;
  const repeats = Math.max(1, Math.min(3, Math.floor(room / (song + BREATH))));
  const slot = room / repeats;
  const refrains = Array.from({ length: repeats }, (_, i) => ({ text: refrain, from: Math.round(headEnd + i * slot + (slot - song) / 2) }));
  const count = COUNT_LINES.map((text, i) => ({ text, from: total - (3 - i) * FPS }));
  return { total, spoken: [...head, ...refrains, ...count] };
}

const moveFrames = (m: SportMove) => moveTimeline(m).total;

function segments(tip: SportTip): number[] {
  return [...(hasIntro() ? [INTRO] : []), titleFrames(tip), ...tip.moves.map(moveFrames), bravoFrames()];
}

export function sportVideoFrames(tip: SportTip): number {
  const s = segments(tip);
  return s.reduce((a, b) => a + b, 0) - TRANSITION * (s.length - 1);
}

/** Les moments où la voix parle, sur toute la vidéo. */
function speechIntervals(tip: SportTip): [number, number][] {
  const perScene = [...(hasIntro() ? [[]] : []), titleSpoken(tip), ...tip.moves.map((m) => moveTimeline(m).spoken), bravoSpoken()] as Spoken[][];
  const lengths = segments(tip);
  let start = 0;
  return perScene.flatMap((lines, i) => {
    const at = start;
    start += lengths[i] - TRANSITION;
    return lines.map((l): [number, number] => [at + l.from, at + l.from + framesOf(l.text)]);
  });
}

function Voices({ lines }: { lines: Spoken[] }) {
  return (
    <>
      {lines
        .filter((l) => voiceDuration(l.text) !== null)
        .map((l) => (
          <Sequence key={`${l.from}`} from={l.from} layout="none">
            <Audio src={staticFile(voiceFile(l.text))} />
          </Sequence>
        ))}
    </>
  );
}

const CAPTION_MAX = 42;

/** Une phrase longue passe en plusieurs morceaux, pour ne jamais dépasser une ligne. */
function captionChunks(text: string): string[] {
  const chunks: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    if (line && `${line} ${word}`.length > CAPTION_MAX) {
      chunks.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  return [...chunks, line];
}

/** Le sous-titre : une ligne blanche en bas, le temps de la phrase. */
function Caption({ lines }: { lines: Spoken[] }) {
  const frame = useCurrentFrame();
  const current = lines.find((l) => frame >= l.from && frame < l.from + framesOf(l.text) + 4);
  if (!current) return null;
  const chunks = captionChunks(current.text);
  const totalChars = chunks.reduce((sum, c) => sum + c.length, 0);
  const position = ((frame - current.from) / Math.max(1, framesOf(current.text))) * totalChars;
  let seen = 0;
  const shown = chunks.find((c) => (seen += c.length) > position) ?? chunks[chunks.length - 1];
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 20, textAlign: 'center', fontFamily: FONT, fontSize: 46, fontWeight: 600, color: '#fffdf2', WebkitTextStroke: '9px #3a2c50', paintOrder: 'stroke fill' }}>
      {shown}
    </div>
  );
}

interface Shot {
  zoom: number;
  originX: number;
  kidFirst: boolean;
}

const FLOOR = 112; // les personnages restent au-dessus du sous-titre

/** Plan large, moyen, serré. Quand les jambes comptent, on ne s'approche pas trop pour les garder à l'image. */
function shotFor(move: SportMove, index: number): Shot {
  const legsMatter = ['saut', 'course', 'tourne'].includes(move.anim);
  const kind = index % 3;
  if (kind === 0) return { zoom: 1, originX: 50, kidFirst: true };
  if (kind === 1) return { zoom: 1.2, originX: 40, kidFirst: false };
  return { zoom: legsMatter ? 1.2 : 1.45, originX: 60, kidFirst: true };
}

/** Le décor et les personnages bougent ensemble ; le léger travelling évite un plan figé. */
function Camera({ shot, duration, seed, children }: { shot: Pick<Shot, 'zoom' | 'originX'>; duration: number; seed: number; children: ReactNode }) {
  const frame = useCurrentFrame();
  const drift = 1 + 0.035 * interpolate(frame, [0, duration], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `scale(${shot.zoom * drift})`, transformOrigin: `${shot.originX}% 84%` }}>
        <Studio seed={seed} />
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

const SLOT_WIDTH = 440;
const CHARACTER = 330;

function Slot({ first, children }: { first: boolean; children: ReactNode }) {
  return <div style={{ position: 'absolute', bottom: FLOOR, left: first ? 180 : 660, width: SLOT_WIDTH, display: 'flex', justifyContent: 'center' }}>{children}</div>;
}

/** L'enfant et la mascotte côte à côte ; l'enfant part une fraction de seconde après, comme s'il imitait. */
function Duo({ animal, seed, kidFirst, gesture, kidMood, animalMood, signs }: { animal: Animal; seed: number; kidFirst: boolean; gesture?: SportMove['anim']; kidMood?: Mood; animalMood?: Mood; signs?: ReactNode }) {
  return (
    <>
      <Slot first={kidFirst}>
        <FrameMascot animal="ours" costume={kidLook(seed)} gesture={gesture} mood={kidMood} size={CHARACTER} phase={0.12} />
      </Slot>
      <Slot first={!kidFirst}>
        <FrameMascot animal={animal} gesture={gesture} mood={animalMood} size={CHARACTER} />
        {signs}
      </Slot>
    </>
  );
}

function usePop(delay = 0) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping: 11, stiffness: 170 } });
}

/** Le nom du geste en haut à gauche : gros, sombre, lisible d'un coup d'œil. */
function PoseName({ name, detail, pop }: { name: string; detail?: string; pop: number }) {
  return (
    <div style={{ position: 'absolute', top: 26, left: 36, maxWidth: 820, color: '#2b2333', transform: `scale(${pop})`, transformOrigin: '0 0', filter: 'url(#hdPaper)', WebkitTextStroke: '10px #eef7fb', paintOrder: 'stroke fill' }}>
      <div style={{ fontSize: name.length > 22 ? 58 : 72, fontWeight: 700, lineHeight: 1.04 }}>{name}</div>
      {detail && <div style={{ fontSize: 32, fontWeight: 600, marginTop: 4 }}>{detail}</div>}
    </div>
  );
}

/** Gros titre brillant : lettres blanches, contour de couleur, relief. */
function GlossTitle({ children, size, outline }: { children: string; size: number; outline: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        filter: 'url(#hdPaper)',
        maxWidth: 1180,
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1.08,
        color: '#fffdf2',
        WebkitTextStroke: `${size * 0.17}px ${outline}`,
        paintOrder: 'stroke fill',
        textShadow: `0 ${size * 0.08}px 0 rgba(60,40,30,.32)`
      }}
    >
      {children}
    </span>
  );
}

function TitleScene({ tip }: { tip: SportTip }) {
  const frame = useCurrentFrame();
  const pop = usePop();
  const lines = titleSpoken(tip);
  const helped = frame >= lines[1].from;
  const seed = seedOf(tip);
  return (
    <AbsoluteFill style={{ fontFamily: FONT, color: INK }}>
      <Voices lines={lines} />
      <Camera shot={{ zoom: 1.08, originX: 50 }} duration={titleFrames(tip)} seed={seed}>
        <Duo animal={mascotForMove(tip.moves[0])} seed={seed} kidFirst kidMood={helped ? 'cheer' : 'oops'} animalMood={helped ? 'cheer' : 'hint'} />
      </Camera>
      <PoseName name={tip.title} pop={pop} />
      <Caption lines={lines} />
    </AbsoluteFill>
  );
}

function Countdown({ left, progress }: { left: number; progress: number }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'absolute', top: 24, right: 32, width: 128, height: 128, color: TEAL_RING }}>
      <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
        <circle cx="50" cy="50" r={r} fill="white" stroke="currentColor" strokeOpacity={0.2} strokeWidth="14" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="14" strokeLinecap="butt" strokeDasharray={c} strokeDashoffset={c * progress} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52, fontWeight: 700, color: '#2b2333' }}>{left}</div>
    </div>
  );
}

function MoveScene({ move, index, count, seed }: { move: SportMove; index: number; count: number; seed: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = usePop();
  const { total, spoken } = moveTimeline(move);
  const left = Math.max(1, Math.ceil((total - frame) / fps));
  const shot = shotFor(move, index);

  return (
    <AbsoluteFill style={{ fontFamily: FONT, color: INK }}>
      <Voices lines={spoken} />
      <Camera shot={shot} duration={total} seed={seed}>
        <Duo animal={mascotForMove(move)} seed={seed} kidFirst={shot.kidFirst} gesture={move.anim} signs={<MoveSigns move={move} />} />
      </Camera>
      <PoseName name={SIGN_LABELS[signFor(move)]} detail={`${move.emoji}  ${index + 1} / ${count}`} pop={pop} />
      <Countdown left={left} progress={interpolate(frame, [0, total], [0, 1], { extrapolateRight: 'clamp' })} />
      <Caption lines={spoken} />
    </AbsoluteFill>
  );
}

const CONFETTI = ['#ff7fa3', '#ffd36b', '#3cc49c', '#6db8ff', '#a08aff'];

function BravoScene({ tip }: { tip: SportTip }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = usePop();
  const t = frame / fps;
  const lines = bravoSpoken();
  const seed = seedOf(tip);
  return (
    <AbsoluteFill style={{ fontFamily: FONT, color: INK }}>
      <Voices lines={lines} />
      <Camera shot={{ zoom: 1.25, originX: 50 }} duration={bravoFrames()} seed={seed}>
        <Duo animal={mascotForMove(tip.moves[tip.moves.length - 1])} seed={seed} kidFirst kidMood="cheer" animalMood="cheer" />
      </Camera>
      {Array.from({ length: 48 }, (_, i) => {
        const a = (i * 137.5 * Math.PI) / 180;
        const speed = 340 + (i % 7) * 70;
        const x = Math.cos(a) * speed * t;
        const y = Math.sin(a) * speed * t * 0.8 + 0.5 * 620 * t * t;
        return <div key={i} style={{ position: 'absolute', left: 640, top: 250, width: 16, height: 24, borderRadius: 4, background: CONFETTI[i % 5], transform: `translate(${x}px, ${y}px) rotate(${t * (180 + i * 18)}deg)` }} />;
      })}
      <div style={{ position: 'absolute', top: 20, left: 0, right: 0, textAlign: 'center', transform: `scale(${pop})` }}>
        <GlossTitle size={124} outline={BRAVO_OUTLINE}>
          Bravo !
        </GlossTitle>
      </div>
      <Caption lines={lines} />
    </AbsoluteFill>
  );
}

const timing = linearTiming({ durationInFrames: TRANSITION, easing: Easing.inOut(Easing.cubic) });

const MUSIC_UNDER_VOICE = 0.13; // assez bas pour que la voix reste bien au premier plan
const MUSIC_ALONE = 0.3; // la musique respire entre les phrases
const MUSIC_DUCK = 12;
const MUSIC_FADE = 45;

export function SportVideo({ tip }: { tip: SportTip }) {
  const intro = hasIntro();
  const total = sportVideoFrames(tip);
  const speech = speechIntervals(tip);
  const seed = seedOf(tip);
  const musicVolume = (f: number) => {
    const distance = speech.reduce((best, [a, b]) => Math.min(best, f < a ? a - f : f > b ? f - b : 0), MUSIC_DUCK);
    const level = interpolate(distance, [0, MUSIC_DUCK], [MUSIC_UNDER_VOICE, MUSIC_ALONE]);
    return level * interpolate(f, [0, MUSIC_FADE, total - MUSIC_FADE, total], [0, 1, 1, 0], { extrapolateRight: 'clamp' });
  };
  return (
    <AbsoluteFill>
      <Audio src={staticFile('music.wav')} volume={musicVolume} />
      <HandDrawnFilters />
      <TransitionSeries>
        {intro && (
          <>
            <TransitionSeries.Sequence durationInFrames={INTRO}>
              <OffthreadVideo src={staticFile(INTRO_FILE)} muted />
            </TransitionSeries.Sequence>
            <TransitionSeries.Transition presentation={fade()} timing={timing} />
          </>
        )}
        <TransitionSeries.Sequence durationInFrames={titleFrames(tip)}>
          <TitleScene tip={tip} />
        </TransitionSeries.Sequence>
        {tip.moves.flatMap((move, i) => [
          <TransitionSeries.Transition key={`t${i}`} presentation={slide({ direction: 'from-right' })} timing={timing} />,
          <TransitionSeries.Sequence key={`m${i}`} durationInFrames={moveFrames(move)}>
            <MoveScene move={move} index={i} count={tip.moves.length} seed={seed} />
          </TransitionSeries.Sequence>
        ])}
        <TransitionSeries.Transition presentation={fade()} timing={timing} />
        <TransitionSeries.Sequence durationInFrames={bravoFrames()}>
          <BravoScene tip={tip} />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <PaperTexture />
    </AbsoluteFill>
  );
}
