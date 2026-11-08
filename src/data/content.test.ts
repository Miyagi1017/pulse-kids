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

for (const [label, list, expected] of [['contes', CONTES, 200], ['contes du soir', CONTES_DU_SOIR, 50]] as const) {
  test(`${label} : exactement ${expected}, ids uniques, 3 à 6 pages courtes`, () => {
    assert.equal(list.length, expected);
    assert.equal(new Set(list.map((t) => t.id)).size, expected);
    assert.equal(new Set(list.map((t) => t.title)).size, expected, 'titres uniques');
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

test('activités : 50 classiques + 60 jeux d’apprentissage + 160 jeux interactifs = 270, ids uniques, jouables', () => {
  assert.equal(ACTIVITES.length, 270);
  assert.equal(new Set(ACTIVITES.map((a) => a.id)).size, 270);
  assert.equal(ACTIVITES.filter((a) => a.id.startsWith('ji-')).length, 160);
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
    } else if (a.kind === 'memoire') {
      assert.ok(a.pairs.length >= 3 && a.pairs.length <= 4, `${a.id} : 3 ou 4 paires`);
      assert.equal(new Set(a.pairs).size, a.pairs.length, `${a.id} : paires en double`);
    } else if (a.kind === 'suite') {
      assert.ok(a.sequence.length >= 4, a.id);
      assert.ok(a.choices.includes(a.answer), `${a.id} : la réponse est dans les choix`);
      assert.equal(new Set(a.choices).size, a.choices.length, `${a.id} : choix en double`);
    } else if (a.kind === 'trouve') {
      assert.ok(a.targets.length >= 2 && a.others.length >= 4, a.id);
      assert.ok(!a.targets.some((x) => a.others.includes(x)), `${a.id} : une cible est aussi un piège`);
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

import { LECTURES } from './lectures';

test('apprendre à lire : 200 textes (70 + 70 + 60), ids et titres uniques, lignes courtes et sûres', () => {
  assert.equal(LECTURES.length, 200);
  assert.deepEqual([1, 2, 3].map((n) => LECTURES.filter((l) => l.niveau === n).length), [70, 70, 60]);
  assert.equal(new Set(LECTURES.map((l) => l.id)).size, 200);
  for (const n of [1, 2, 3]) {
    const titles = LECTURES.filter((l) => l.niveau === n).map((l) => l.title);
    assert.equal(new Set(titles).size, titles.length, `niveau ${n} : titres uniques`);
  }
  for (const l of LECTURES) {
    assert.ok(l.lines.length >= 3 && l.lines.length <= 6, `${l.id} : ${l.lines.length} lignes`);
    for (const line of l.lines) {
      assert.ok(line.length <= (l.niveau === 1 ? 45 : 70), `${l.id} : ligne trop longue (${line})`);
      assert.ok(!FORBIDDEN.test(line), `${l.id} : contenu interdit`);
    }
  }
});

import { AVENTURES } from './aventures';

test('aventures à explorer : 12 scènes, 3 cachettes chacune, objets dans la scène', () => {
  assert.equal(AVENTURES.length, 12);
  assert.equal(new Set(AVENTURES.map((a) => a.id)).size, 12);
  for (const a of AVENTURES) {
    assert.equal(a.spots.filter((s) => s.hides).length, 3, `${a.id} : 3 cachettes`);
    assert.ok(a.spots.length >= 7, `${a.id} : assez d'objets à toucher`);
    for (const s of a.spots) {
      assert.ok(s.x >= 8 && s.x <= 92 && s.y >= 8 && s.y <= 92, `${a.id} : ${s.emoji} sort de la scène`);
      assert.ok(s.say.length > 0 && !FORBIDDEN.test(s.say), `${a.id} : phrase`);
    }
  }
});

import { definitionOf, DICTIONNAIRE } from './dictionnaire';

test('dictionnaire : des explications simples, retrouvées même avec l’, le pluriel ou la ponctuation', () => {
  assert.ok(Object.keys(DICTIONNAIRE).length >= 120);
  for (const [word, [emoji, text]] of Object.entries(DICTIONNAIRE)) {
    assert.ok(emoji && text.length >= 20 && text.length <= 160, `${word} : explication`);
    assert.ok(!FORBIDDEN.test(text), `${word} : contenu interdit`);
  }
  assert.equal(definitionOf('crinière.')?.word, 'crinière');
  assert.equal(definitionOf('L’abeille')?.word, 'abeille');
  assert.equal(definitionOf('nénuphars')?.word, 'nénuphar');
  assert.equal(definitionOf('coraux')?.word, 'corail');
  assert.equal(definitionOf('maison'), null);
  // Une bonne partie des textes à lire contient au moins un mot expliqué.
  const withDef = LECTURES.filter((l) => l.lines.join(' ').split(/\s+/).some((w) => definitionOf(w)));
  assert.ok(withDef.length >= 100, `${withDef.length} textes ont un mot expliqué`);
});

import { CLASSIQUES } from './classiques';

test('grands classiques : 26 contes adaptés, l’auteur cité, pages courtes et douces', () => {
  assert.equal(CLASSIQUES.length, 26);
  assert.equal(new Set(CLASSIQUES.map((t) => t.id)).size, 26);
  for (const t of CLASSIQUES) {
    assert.ok(t.pages.length >= 5 && t.pages.length <= 7, `${t.id} : ${t.pages.length} pages`);
    assert.match(t.pages[0], /(fable|conte)/i, `${t.id} : la 1re page dit d’où vient l’histoire`);
    for (const p of t.pages) {
      assert.ok(p.length <= 240, `${t.id} : page trop longue (${p.length})`);
      assert.ok(!FORBIDDEN.test(p), `${t.id} : contenu interdit`);
    }
  }
  assert.equal(CLASSIQUES.filter((t) => /La Fontaine/.test(t.pages[0])).length, 12, '12 fables de La Fontaine');
});

import { sceneFor } from '../components/ThemeScene';

test('décor animé : choisi d’après les mots du texte, avec un repli', () => {
  assert.equal(sceneFor('La baleine chante dans l’océan'), 'mer');
  assert.equal(sceneFor('Un petit flocon tombe sur le bonhomme de neige'), 'neige');
  assert.equal(sceneFor('La fusée décolle vers la planète'), 'espace');
  assert.equal(sceneFor('Le renard se promène dans la forêt'), 'nature');
  assert.equal(sceneFor('Il pleut, j’ai mon parapluie'), 'pluie');
  assert.equal(sceneFor('Bonne nuit, petit cœur', 'nuit'), 'corps');
  assert.equal(sceneFor('Un mot sans indice', 'nuit'), 'nuit');
  // Chaque conte du soir a un décor (au moins la nuit).
  for (const t of CONTES_DU_SOIR) assert.ok(sceneFor(`${t.title} ${t.pages.join(' ')}`, 'nuit'));
});
