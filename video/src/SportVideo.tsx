import { linearTiming, TransitionSeries } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';
import { AbsoluteFill, getStaticFiles, interpolate, OffthreadVideo, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import type { SportMove, SportTip } from '../../src/data/sport';
import { mascotForMove } from '../../src/lib/mascots';
import { POSES, poseFor } from '../../src/lib/poses';
import { FONT } from './fonts';
import { FrameMascot } from './FrameMascot';
import { KawaiiBackground } from './KawaiiBackground';

export const FPS = 30;
export const WIDTH = 1280;
export const HEIGHT = 720;

const INTRO_FILE = 'intro.mp4';
const INTRO = 75; // générique HTML rendu avec HyperFrames (facultatif)
const TITLE = 105;
const BRAVO = 120;
const TRANSITION = 12;

const INK = '#47386b';
const CORAL = '#ff7fa3';
const SOFT = '#8577a6';

const hasIntro = () => getStaticFiles().some((f) => f.name === INTRO_FILE);
const moveFrames = (m: SportMove) => m.seconds * FPS;

function segments(tip: SportTip): number[] {
  return [...(hasIntro() ? [INTRO] : []), TITLE, ...tip.moves.map(moveFrames), BRAVO];
}

export function sportVideoFrames(tip: SportTip): number {
  const s = segments(tip);
  return s.reduce((a, b) => a + b, 0) - TRANSITION * (s.length - 1);
}

function usePop(delay = 0) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping: 11, stiffness: 170 } });
}

const card = { background: 'white', borderRadius: 36, boxShadow: '0 12px 30px -14px rgba(71,56,107,.45)' } as const;

function TitleScene({ tip }: { tip: SportTip }) {
  const pop = usePop();
  return (
    <AbsoluteFill style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 56, padding: 60, fontFamily: FONT, color: INK }}>
      <div style={{ transform: `scale(${pop})` }}>
        <FrameMascot animal={mascotForMove(tip.moves[0])} mood="cheer" size={360} />
      </div>
      <div style={{ maxWidth: 680 }}>
        <div style={{ fontSize: 34, fontWeight: 500, color: SOFT, opacity: pop }}>C’est l’heure de bouger !</div>
        <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.08, margin: '10px 0 22px', transform: `translateY(${(1 - pop) * 40}px)` }}>{tip.title}</div>
        <div style={{ ...card, padding: '20px 28px', fontSize: 32, fontWeight: 500, lineHeight: 1.25, opacity: pop }}>💡 {tip.tip}</div>
        <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
          {tip.moves.map((m, i) => (
            <ChipEmoji key={i} emoji={m.emoji} delay={18 + i * 8} />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
}

function ChipEmoji({ emoji, delay }: { emoji: string; delay: number }) {
  const pop = usePop(delay);
  return <div style={{ ...card, width: 92, height: 92, borderRadius: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 50, transform: `scale(${pop})` }}>{emoji}</div>;
}

function Countdown({ left, total, progress }: { left: number; total: number; progress: number }) {
  const r = 44;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: 130, height: 130, color: CORAL }} aria-label={`${total}`}>
      <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
        <circle cx="50" cy="50" r={r} fill="white" stroke="currentColor" strokeOpacity={0.18} strokeWidth="10" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * progress} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 54, fontWeight: 700 }}>{left}</div>
    </div>
  );
}

function MoveScene({ move, index, count }: { move: SportMove; index: number; count: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = usePop();
  const total = moveFrames(move);
  const left = Math.max(1, Math.ceil((total - frame) / fps));
  const cues = move.cues ?? POSES[poseFor(move)].cues;
  const cue = Math.min(cues.length - 1, Math.floor((frame / total) * cues.length));

  return (
    <AbsoluteFill style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 44, padding: '40px 70px', fontFamily: FONT, color: INK }}>
      <div style={{ position: 'relative', width: 440, display: 'flex', justifyContent: 'center', transform: `scale(${pop})` }}>
        <FrameMascot animal={mascotForMove(move)} gesture={move.anim} size={380} />
        <div style={{ ...card, position: 'absolute', right: 0, bottom: 10, width: 112, height: 112, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 62 }}>{move.emoji}</div>
      </div>
      <div style={{ width: 660 }}>
        <div style={{ display: 'inline-block', ...card, borderRadius: 999, padding: '8px 26px', fontSize: 28, fontWeight: 500, color: SOFT }}>
          Mouvement {index + 1} / {count}
        </div>
        <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.14, margin: '18px 0 22px', opacity: pop, transform: `translateY(${(1 - pop) * 30}px)` }}>{move.text}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
          <Countdown left={left} total={move.seconds} progress={interpolate(frame, [0, total], [0, 1], { extrapolateRight: 'clamp' })} />
          <div style={{ flex: 1, display: 'grid', gap: 8 }}>
            {cues.map((c, i) => (
              <div key={i} style={{ background: i === cue ? 'white' : 'rgba(255,255,255,.65)', borderRadius: 18, padding: '7px 16px', fontSize: 24, fontWeight: 500, lineHeight: 1.18, opacity: i === cue ? 1 : 0.62 }}>
                {c}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}

const CONFETTI = ['#ff7fa3', '#ffd36b', '#3cc49c', '#6db8ff', '#a08aff'];

function BravoScene({ tip }: { tip: SportTip }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = usePop();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', fontFamily: FONT, color: INK }}>
      {Array.from({ length: 48 }, (_, i) => {
        const a = (i * 137.5 * Math.PI) / 180;
        const speed = 340 + (i % 7) * 70;
        const x = Math.cos(a) * speed * t;
        const y = Math.sin(a) * speed * t * 0.8 + 0.5 * 620 * t * t;
        return <div key={i} style={{ position: 'absolute', left: 640, top: 300, width: 16, height: 24, borderRadius: 4, background: CONFETTI[i % 5], transform: `translate(${x}px, ${y}px) rotate(${t * (180 + i * 18)}deg)` }} />;
      })}
      <div style={{ transform: `scale(${pop})` }}>
        <FrameMascot animal={mascotForMove(tip.moves[tip.moves.length - 1])} mood="cheer" size={340} />
      </div>
      <div style={{ fontSize: 92, fontWeight: 700, marginTop: 6, transform: `scale(${pop})` }}>Bravo !</div>
      <div style={{ ...card, padding: '8px 28px', fontSize: 36, fontWeight: 500, color: SOFT, opacity: pop }}>Pense à boire un verre d’eau 💧</div>
    </AbsoluteFill>
  );
}

const timing = linearTiming({ durationInFrames: TRANSITION });

export function SportVideo({ tip }: { tip: SportTip }) {
  const intro = hasIntro();
  return (
    <AbsoluteFill>
      <KawaiiBackground />
      <TransitionSeries>
        {intro && (
          <>
            <TransitionSeries.Sequence durationInFrames={INTRO}>
              <OffthreadVideo src={staticFile(INTRO_FILE)} muted />
            </TransitionSeries.Sequence>
            <TransitionSeries.Transition presentation={fade()} timing={timing} />
          </>
        )}
        <TransitionSeries.Sequence durationInFrames={TITLE}>
          <TitleScene tip={tip} />
        </TransitionSeries.Sequence>
        {tip.moves.flatMap((move, i) => [
          <TransitionSeries.Transition key={`t${i}`} presentation={slide({ direction: 'from-right' })} timing={timing} />,
          <TransitionSeries.Sequence key={`m${i}`} durationInFrames={moveFrames(move)}>
            <MoveScene move={move} index={i} count={tip.moves.length} />
          </TransitionSeries.Sequence>
        ])}
        <TransitionSeries.Transition presentation={fade()} timing={timing} />
        <TransitionSeries.Sequence durationInFrames={BRAVO}>
          <BravoScene tip={tip} />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
}
