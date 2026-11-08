import test from 'node:test';
import assert from 'node:assert/strict';
import { ANIMALS, MOVE_MASCOT, mascotForMove, mascotForScene, SCENE_MASCOT } from './mascots';
import { WUSHU } from '../data/wushu';

const FORBIDDEN = /<[^>]+>|https?:\/\/|mort|tuer|sang|guerre|arme|monstre méchant/i;
const NO_STRIKES = /\bcoups?\b|frappe|combat|poing|\bcogn/i;

test('chaque thème et chaque type de mouvement a une mascotte qui existe', () => {
  for (const [theme, animal] of Object.entries(SCENE_MASCOT)) assert.ok(ANIMALS.includes(animal), theme);
  for (const [anim, animal] of Object.entries(MOVE_MASCOT)) assert.ok(ANIMALS.includes(animal), anim);
  assert.equal(mascotForScene('mer'), 'dauphin');
  assert.equal(mascotForScene('nuit'), 'hibou');
});

test('l’animal imposé par une séance passe avant celui du mouvement', () => {
  assert.equal(mascotForMove({ anim: 'saut' }), 'singe');
  assert.equal(mascotForMove({ anim: 'saut', mascotte: 'cerf' }), 'cerf');
});

test('wushu : 5 animaux, 3 mouvements expliqués chacun, doux et sans coups', () => {
  assert.equal(WUSHU.length, 5);
  assert.equal(new Set(WUSHU.map((s) => s.id)).size, 5);
  for (const s of WUSHU) {
    assert.equal(s.moves.length, 3, s.id);
    for (const m of s.moves) {
      assert.equal(m.mascotte, s.mascotte);
      assert.equal(m.cues?.length, 3, `${s.id} : 3 consignes`);
      assert.notEqual(m.anim, 'frappe', `${s.id} : pas de geste de frappe`);
      assert.ok(m.seconds >= 10 && m.seconds <= 30, s.id);
      for (const t of [m.text, ...(m.cues ?? [])]) {
        assert.ok(!FORBIDDEN.test(t), `${s.id} : contenu interdit dans « ${t} »`);
        assert.ok(!NO_STRIKES.test(t), `${s.id} : geste de combat dans « ${t} »`);
      }
    }
  }
});
