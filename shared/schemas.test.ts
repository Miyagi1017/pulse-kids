import test from 'node:test';
import assert from 'node:assert/strict';
import { storySchema } from './schemas';
import { INITIAL_DAILY_STORIES } from '../src/data/dailyStories';

test('toutes les histoires embarquées respectent le schéma', () => {
  for (const story of INITIAL_DAILY_STORIES) {
    const r = storySchema.safeParse(story);
    assert.ok(r.success, `${story.id} : ${r.success ? '' : JSON.stringify(r.error.issues[0])}`);
  }
});

test('une histoire IA contenant du HTML est rejetée', () => {
  const evil = structuredClone(INITIAL_DAILY_STORIES[0]);
  evil.summary = '<img src=x onerror=alert(1)>';
  assert.equal(storySchema.safeParse(evil).success, false);
});

test('un quiz avec deux bonnes réponses est rejeté', () => {
  const s = structuredClone(INITIAL_DAILY_STORIES[0]);
  s.soundQuiz.options.forEach((o) => (o.isCorrect = true));
  assert.equal(storySchema.safeParse(s).success, false);
});
