import test from 'node:test';
import assert from 'node:assert/strict';
import { CONTES } from './contes';
import { CONTES_DU_SOIR } from './contesDuSoir';
import { ACTIVITES } from './activites';
import { personalize } from './format';
import { cleanName } from '../lib/profile';

const FORBIDDEN = /<[^>]+>|https?:\/\/|mort|tuer|sang|guerre|arme|monstre méchant/i;

for (const [label, list] of [['contes', CONTES], ['contes du soir', CONTES_DU_SOIR]] as const) {
  test(`${label} : exactement 50, ids uniques, 3 à 6 pages courtes`, () => {
    assert.equal(list.length, 50);
    assert.equal(new Set(list.map((t) => t.id)).size, 50);
    assert.equal(new Set(list.map((t) => t.title)).size, 50, 'titres uniques');
    for (const t of list) {
      assert.ok(t.pages.length >= 3 && t.pages.length <= 6, `${t.id} : ${t.pages.length} pages`);
      for (const p of t.pages) {
        assert.ok(p.length <= 220, `${t.id} : page trop longue`);
        assert.ok(!FORBIDDEN.test(p), `${t.id} : contenu interdit`);
      }
      assert.ok(t.emoji.length > 0 && t.title.length > 0);
    }
  });
}

test('le prénom personnalise les textes, avec un repli', () => {
  assert.equal(personalize('Bonne nuit, {p} !', 'Léa'), 'Bonne nuit, Léa !');
  assert.equal(personalize('Bonne nuit, {p} !', ''), 'Bonne nuit, petit curieux !');
  assert.ok(CONTES_DU_SOIR.filter((t) => t.pages.some((p) => p.includes('{p}'))).length >= 20, 'beaucoup de contes du soir sont personnalisés');
});

test('nettoyage du prénom : lettres seulement, majuscule, 20 caractères max', () => {
  assert.equal(cleanName('  léa  '), 'Léa');
  assert.equal(cleanName('<script>alert(1)</script>'), 'Scriptalertscript');
  assert.equal(cleanName('Jean-Marc'), 'Jean-Marc');
  assert.equal(cleanName('1234'), '');
  assert.ok(cleanName('a'.repeat(50)).length <= 20);
});

test('activités : exactement 50, ids uniques, jouables', () => {
  assert.equal(ACTIVITES.length, 50);
  assert.equal(new Set(ACTIVITES.map((a) => a.id)).size, 50);
  for (const a of ACTIVITES) {
    if (a.kind === 'devinette') {
      assert.equal(a.choices.length, 3, a.id);
      assert.equal(new Set(a.choices).size, 3, `${a.id} : choix en double`);
    } else if (a.kind === 'compte') {
      assert.ok(a.count >= 1 && a.count <= 9, a.id);
    } else {
      assert.equal(a.items.length, 4, a.id);
      assert.equal(new Set(a.items).size, 4, `${a.id} : intrus en double`);
    }
    assert.ok(a.bravo.length > 0);
  }
});
