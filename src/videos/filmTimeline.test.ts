import test from 'node:test';
import assert from 'node:assert/strict';
import { FILM_PACE, filmTimeline } from './filmTimeline';
import { PACE } from './pacing';

const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-6, `${a} ≠ ${b}`);

test('chaque plan dure au moins son minimum, et la voix laisse la pause après la phrase', () => {
  const tl = filmTimeline([[{ src: 't.mp3', dur: 1.2 }], [{ src: '1.mp3', dur: 6 }], [{ src: '2.mp3', dur: 1 }]]);
  close(tl.scenes[0], 0);
  close(tl.scenes[1], FILM_PACE.titleMin); // titre court : 4,5 s
  close(tl.scenes[2], tl.scenes[1] + FILM_PACE.lead + 6 + PACE.pauseAfterLine + FILM_PACE.tail); // phrase longue
  close(tl.dur, tl.scenes[2] + FILM_PACE.shotMin + FILM_PACE.end); // phrase courte : 5 s, puis le carton de fin
  for (let i = 1; i < tl.scenes.length; i++) assert.ok(tl.scenes[i] - tl.scenes[i - 1] >= PACE.minShot);
});

test('la voix de chaque phrase commence après une courte respiration', () => {
  const tl = filmTimeline([[{ src: 't.mp3', dur: 1 }], [{ src: '1.mp3', dur: 2 }]]);
  close(tl.voices[0].at, FILM_PACE.titleLead);
  close(tl.voices[1].at, tl.scenes[1] + FILM_PACE.lead);
});

test('le prénom : un silence entre les deux morceaux, noté dans names', () => {
  const tl = filmTimeline([[{ src: 't.mp3', dur: 1 }], [{ src: 'a.mp3', dur: 0.8 }, { name: true }, { src: 'b.mp3', dur: 2 }]]);
  const a = tl.voices.find((v) => v.src === 'a.mp3')!,
    b = tl.voices.find((v) => v.src === 'b.mp3')!;
  assert.equal(tl.names.length, 1);
  close(tl.names[0], a.at + 0.8);
  close(b.at, tl.names[0] + FILM_PACE.nameGap);
});
