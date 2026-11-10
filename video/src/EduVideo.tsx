import { TransitionSeries } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import type { ReactNode } from 'react';
import { AbsoluteFill, Audio, staticFile } from 'remotion';
import type { SportMove, SportTip } from '../../src/data/sport';
import type { Mood } from '../../src/lib/mascots';
import { BYE_LINE, CHOICE_LINE, EDU_SCRIPTS, type EduScript, type EduStep, QUESTION_LINE } from './eduScripts';
import { FONT } from './fonts';
import { HandDrawnFilters, PaperTexture } from './HandDrawn';
import { MoveSigns } from './MoveSigns';
import { Camera, Duo, END_PAUSE, FPS, framesOf, GlossTitle, musicVolumeFor, shotFor, type Spoken, timing, TRANSITION, usePop, VOICE_DELAY, Voices } from './SportVideo';
import { seedOf } from './voice';

/** Vidéo au format éducatif : titre, ce qu'on apprend, étapes numérotées, sécurité, histoire, question. */

const INK = '#47386b';
const PAUSE = 3 * FPS; // le temps de faire le geste, ou de répondre
const GAP = 14;

type Scene =
  | { kind: 'title' | 'learn' | 'safety' | 'story' | 'end'; frames: number; lines: Spoken[] }
  | { kind: 'step'; frames: number; lines: Spoken[]; step: EduStep; index: number };

const endOf = (lines: Spoken[]) => Math.max(...lines.map((l) => l.from + framesOf(l.text)));

function spokenScene(kind: 'title' | 'learn' | 'safety' | 'story', texts: string[], minSeconds: number): Scene {
  let at = VOICE_DELAY;
  const lines = texts.map((text) => {
    const line = { text, from: at };
    at += framesOf(text) + GAP;
    return line;
  });
  return { kind, lines, frames: Math.max(minSeconds * FPS, endOf(lines) + END_PAUSE) };
}

/** L'étape, puis une pause pour faire le geste ; on la redit tant qu'il reste du temps. */
function stepScene(step: EduStep, index: number, seconds: number): Scene {
  const frames = Math.max(seconds * FPS, VOICE_DELAY + framesOf(step.text) + PAUSE);
  const texts = step.also ? [step.text, step.also] : [step.text];
  const lines: Spoken[] = [];
  let at = VOICE_DELAY;
  for (let i = 0; ; i++) {
    const text = texts[i % texts.length];
    if (i > 0 && (step.once || at + framesOf(text) + 2 * FPS > frames)) break;
    lines.push({ text, from: at });
    at += framesOf(text) + PAUSE;
  }
  return { kind: 'step', step, index, lines, frames };
}

function endScene(): Scene {
  const question = { text: QUESTION_LINE, from: VOICE_DELAY };
  const choice = { text: CHOICE_LINE, from: question.from + framesOf(QUESTION_LINE) + PAUSE };
  const bye = { text: BYE_LINE, from: choice.from + framesOf(CHOICE_LINE) + GAP };
  const lines = [question, choice, bye];
  return { kind: 'end', lines, frames: Math.max(10 * FPS, endOf(lines) + END_PAUSE) };
}

function scenesOf(s: EduScript): Scene[] {
  return [spokenScene('title', [s.intro], 5), spokenScene('learn', [s.learn], 10), ...s.steps.map((step, i) => stepScene(step, i, s.stepSeconds)), spokenScene('safety', s.safety, 10), spokenScene('story', [s.story], 10), endScene()];
}

export const eduVideoFrames = (tip: SportTip): number => {
  const scenes = scenesOf(EDU_SCRIPTS[tip.id]);
  return scenes.reduce((a, b) => a + b.frames, 0) - TRANSITION * (scenes.length - 1);
};

/** Trois mots au plus, pour l'adulte ou l'enfant qui commence à lire. */
function Label({ text }: { text: string }) {
  const pop = usePop();
  return (
    <div style={{ position: 'absolute', top: 34, left: 0, right: 0, textAlign: 'center', transform: `scale(${pop})` }}>
      <GlossTitle size={76} outline="#2f7fd0">
        {text}
      </GlossTitle>
    </div>
  );
}

function StepNumber({ n }: { n: number }) {
  const pop = usePop();
  return (
    <div style={{ position: 'absolute', top: 20, left: 545, width: 190, height: 190, boxSizing: 'border-box', borderRadius: '50%', background: '#fffdf2', border: '12px solid #16c7c0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 132, fontWeight: 700, color: '#2b2333', transform: `scale(${pop})`, filter: 'url(#hdPaper)' }}>
      {n}
    </div>
  );
}

function Star() {
  const pop = usePop();
  return (
    <svg viewBox="0 0 200 200" style={{ position: 'absolute', top: 16, left: 510, width: 260, height: 260, transform: `scale(${pop})`, filter: 'url(#hdPaper)' }}>
      <path d="M100 14 L125 72 L188 78 L140 120 L155 182 L100 149 L45 182 L60 120 L12 78 L75 72 Z" fill="#ffd36b" stroke="#4a3a30" strokeWidth="9" strokeLinejoin="round" />
    </svg>
  );
}

function SceneView({ scene, script, tip }: { scene: Scene; script: EduScript; tip: SportTip }) {
  const seed = seedOf(tip);
  let overlay: ReactNode = null;
  let mood: Mood | undefined;
  let gesture: SportMove['anim'] | undefined;
  let signs: ReactNode;
  let shot = { zoom: 1, originX: 50, kidFirst: true };
  if (scene.kind === 'title') {
    overlay = (
      <div style={{ position: 'absolute', top: 34, left: 0, right: 0, textAlign: 'center' }}>
        <GlossTitle size={tip.title.length > 18 ? 72 : 96} outline="#d9534f">
          {tip.title}
        </GlossTitle>
      </div>
    );
    mood = 'cheer';
  } else if (scene.kind === 'learn') {
    overlay = <Label text={script.learnLabel} />;
    mood = 'talk';
    shot = { zoom: 1.15, originX: 50, kidFirst: false };
  } else if (scene.kind === 'step') {
    const move: SportMove = { emoji: '⭐', text: scene.step.text, seconds: script.stepSeconds, anim: scene.step.anim };
    overlay = <StepNumber n={scene.index + 1} />;
    gesture = scene.step.anim;
    mood = scene.step.mood;
    signs = <MoveSigns move={move} />;
    shot = shotFor(move, scene.index);
  } else if (scene.kind === 'safety') {
    overlay = (
      <>
        <Label text={script.safetyLabel} />
        <div style={{ position: 'absolute', top: 280, left: 0, right: 0, textAlign: 'center', fontSize: 150 }}>{script.safetyEmoji}</div>
      </>
    );
    mood = 'hint';
  } else if (scene.kind === 'story') {
    mood = 'idle';
    shot = { zoom: 1.3, originX: 50, kidFirst: true };
  } else {
    overlay = <Star />;
    mood = 'cheer';
  }
  return (
    <AbsoluteFill style={{ fontFamily: FONT, color: INK }}>
      <Voices lines={scene.lines} />
      <Camera shot={shot} duration={scene.frames} seed={seed}>
        <Duo animal={script.animal} seed={seed} kidFirst={shot.kidFirst} gesture={gesture} kidMood={mood} animalMood={mood} signs={signs} />
      </Camera>
      {overlay}
    </AbsoluteFill>
  );
}

export function EduVideo({ tip }: { tip: SportTip }) {
  const script = EDU_SCRIPTS[tip.id];
  const scenes = scenesOf(script);
  let start = 0;
  const speech = scenes.flatMap((s) => {
    const at = start;
    start += s.frames - TRANSITION;
    return s.lines.map((l): [number, number] => [at + l.from, at + l.from + framesOf(l.text)]);
  });
  return (
    <AbsoluteFill>
      <Audio src={staticFile('music.wav')} volume={musicVolumeFor(speech, eduVideoFrames(tip))} />
      <HandDrawnFilters />
      <TransitionSeries>
        {scenes.flatMap((scene, i) => [
          ...(i > 0 ? [<TransitionSeries.Transition key={`t${i}`} presentation={fade()} timing={timing} />] : []),
          <TransitionSeries.Sequence key={`s${i}`} durationInFrames={scene.frames}>
            <SceneView scene={scene} script={script} tip={tip} />
          </TransitionSeries.Sequence>
        ])}
      </TransitionSeries>
      <PaperTexture />
    </AbsoluteFill>
  );
}
