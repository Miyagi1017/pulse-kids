import test from 'node:test';
import assert from 'node:assert/strict';
import { CONTES } from './contes';
import { CONTES_DU_SOIR } from './contesDuSoir';
import { ACTIVITES } from './activites';
import { JEUX } from './jeux';
import { ambienceFor } from './ambience';
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

test('chaque conte a une ambiance animée adaptée à son sujet', () => {
  assert.deepEqual(ambienceFor(CONTES.find((t) => t.title.includes('Baleine'))!).motion, 'rise');
  assert.deepEqual(ambienceFor(CONTES.find((t) => t.title.includes('bonhomme de neige'))!).motion, 'fall');
  for (const t of [...CONTES, ...CONTES_DU_SOIR]) assert.ok(ambienceFor(t).particles.length > 0, t.id);
});

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

test('activités : 50 classiques + 60 jeux d’apprentissage = 110, ids uniques, jouables', () => {
  assert.equal(ACTIVITES.length, 110);
  assert.equal(new Set(ACTIVITES.map((a) => a.id)).size, 110);
  assert.equal(ACTIVITES.filter((a) => a.id.startsWith('jeu-')).length, 60);
  for (const a of ACTIVITES) {
    if (a.kind === 'devinette') {
      assert.equal(a.choices.length, 3, a.id);
      assert.equal(new Set(a.choices).size, 3, `${a.id} : choix en double`);
    } else if (a.kind === 'compte') {
      assert.ok(a.count >= 1 && a.count <= 9, a.id);
    } else if (a.kind === 'intrus') {
      assert.equal(a.items.length, 4, a.id);
      assert.equal(new Set(a.items).size, 4, `${a.id} : intrus en double`);
    } else if (a.kind === 'ordre') {
      assert.ok(a.steps.length >= 3 && a.steps.length <= 4, a.id);
      assert.equal(new Set(a.steps).size, a.steps.length, `${a.id} : étapes en double`);
    } else {
      assert.ok(a.statement.length > 0, a.id);
    }
    assert.ok(a.bravo.length > 0 && !FORBIDDEN.test(a.bravo), a.id);
  }
});

test('les 60 jeux couvrent les 5 thèmes (12 chacun) et sont bien mélangés', () => {
  for (const t of ['langue', 'etre', 'vivre', 'ia', 'discipline'] as const) {
    assert.equal(JEUX.filter((j) => j.theme === t).length, 12, t);
  }
  // Mélange : jamais 3 activités de la même catégorie d'affilée.
  for (let i = 2; i < ACTIVITES.length; i++) {
    const [a, b, c] = [ACTIVITES[i - 2], ACTIVITES[i - 1], ACTIVITES[i]].map((x) => x.category);
    assert.ok(!(a === b && b === c), `trois « ${c} » d’affilée à la position ${i}`);
  }
  // Les vrai/faux ont des réponses des deux sortes (pas toujours « oui »).
  const vf = JEUX.filter((j) => j.kind === 'vf');
  assert.ok(vf.some((j) => j.kind === 'vf' && j.answer) && vf.some((j) => j.kind === 'vf' && !j.answer));
});
