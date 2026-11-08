import test from 'node:test';
import assert from 'node:assert/strict';
import { PHYSIQUES, PHYSIQUE_CATS, VIDEOS_SPORT } from './physiques';
import { MINI_DEFIS } from './miniDefis';

const FORBIDDEN = /<[^>]+>|https?:\/\/|mort|tuer|sang|guerre|arme|monstre méchant/i;
const DANGER = /\bcoups?\b|combat|frappe|sur (la|une) (table|chaise)|\bcanapé\b|\blit\b/i;

test('60 activités physiques : 4 catégories de 15, ids et titres uniques, environ 1 minute, sûres', () => {
  assert.equal(PHYSIQUES.length, 60);
  assert.equal(new Set(PHYSIQUES.map((a) => a.id)).size, 60);
  assert.equal(new Set(PHYSIQUES.map((a) => a.title)).size, 60);
  const minis = new Set(MINI_DEFIS.map((d) => d.title));
  for (const c of Object.keys(PHYSIQUE_CATS)) assert.equal(PHYSIQUES.filter((a) => a.categorie === c).length, 15, c);
  for (const a of PHYSIQUES) {
    assert.ok(!minis.has(a.title), `${a.title} existe déjà dans les mini-défis`);
    assert.equal(a.moves.length, 3, a.id);
    const total = a.moves.reduce((t, m) => t + m.seconds, 0);
    assert.ok(total >= 40 && total <= 70, `${a.id} : ${total} s`);
    for (const m of a.moves) {
      assert.ok(m.text.length <= 75, `${a.id} : consigne trop longue (${m.text})`);
      assert.ok(!FORBIDDEN.test(m.text), `${a.id} : contenu interdit (${m.text})`);
      assert.ok(!DANGER.test(m.text), `${a.id} : consigne à risque (${m.text})`);
      assert.equal(m.cues?.length, 3, a.id);
    }
  }
});

test('les vidéos de sport ont un identifiant YouTube valide', () => {
  assert.equal(VIDEOS_SPORT.length, 2);
  for (const v of VIDEOS_SPORT) assert.match(v.id, /^[\w-]{11}$/);
});
