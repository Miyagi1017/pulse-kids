import test from 'node:test';
import assert from 'node:assert/strict';
import { spacePhotoSchema, THEMES, themeForDay } from './space';

const valid = {
  date: '2026-11-07',
  title: 'Saturne et ses anneaux',
  caption: 'Une légende.',
  emoji: '🪐',
  imageUrl: 'https://images-assets.nasa.gov/image/PIA1/PIA1~medium.jpg',
  originalTitle: 'Saturn',
  credit: 'NASA',
  source: 'nasa-library' as const,
  link: 'https://images.nasa.gov/details/PIA1'
};

test('le thème change chaque jour et reste stable dans la journée', () => {
  assert.equal(themeForDay('2026-11-07'), themeForDay('2026-11-07'));
  assert.notEqual(themeForDay('2026-11-07'), themeForDay('2026-11-08'));
  const seen = new Set(Array.from({ length: THEMES.length }, (_, i) => themeForDay(`2026-12-${String(i + 1).padStart(2, '0')}`).query));
  assert.equal(seen.size, THEMES.length, 'tous les thèmes passent en un cycle');
});

test('seules les images NASA sont acceptées', () => {
  assert.equal(spacePhotoSchema.safeParse(valid).success, true);
  assert.equal(spacePhotoSchema.safeParse({ ...valid, imageUrl: 'https://apod.nasa.gov/apod/image/x.jpg' }).success, true);
  assert.equal(spacePhotoSchema.safeParse({ ...valid, imageUrl: 'https://evil.example/x.jpg' }).success, false);
  assert.equal(spacePhotoSchema.safeParse({ ...valid, imageUrl: 'javascript:alert(1)' }).success, false);
});

test('chaque légende est courte et adaptée (pas de HTML)', () => {
  for (const t of THEMES) {
    assert.ok(t.caption.length <= 300, t.query);
    assert.ok(!/<[^>]+>/.test(t.caption + t.title), t.query);
  }
});
