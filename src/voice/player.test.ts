import test from 'node:test';
import assert from 'node:assert/strict';
import { keyFile, sentenceKey } from './bank';
import { partsFor } from './player';

const f = (s: string) => keyFile(sentenceKey(s));

test('partsFor : le prénom est dit par Christine quand sa prise existe', () => {
  const have = new Set([f('Bravo'), 'prenom-lea', f('Tu as gagné.')]);
  const parts = partsFor('Bravo Léa ! Tu as gagné.', 'Léa', (x) => have.has(x));
  assert.deepEqual(
    parts?.map((p) => p.url),
    ['/banque/' + f('Bravo') + '.mp3', '/banque/prenom-lea.mp3', '/banque/' + f('Tu as gagné.') + '.mp3']
  );
});

test('partsFor : prénom inconnu → la phrase sans prénom, toujours avec Christine', () => {
  const have = new Set([f('Bravo !'), f('Tu as gagné.')]);
  const parts = partsFor('Bravo Zébulon ! Tu as gagné.', 'Zébulon', (x) => have.has(x));
  assert.deepEqual(
    parts?.map((p) => p.url),
    ['/banque/' + f('Bravo !') + '.mp3', '/banque/' + f('Tu as gagné.') + '.mp3']
  );
});

test('partsFor : une phrase sans prise → null (voix du navigateur pour tout)', () => {
  assert.equal(
    partsFor('Phrase inconnue.', null, () => false),
    null
  );
});

test('partsFor : pas de pause entre les morceaux autour du prénom, une pause entre les phrases', () => {
  const have = new Set([f('Bravo'), 'prenom-lea', f('Tu as gagné.')]);
  const parts = partsFor('Bravo Léa ! Tu as gagné.', 'Léa', (x) => have.has(x))!;
  assert.deepEqual(
    parts.map((p) => p.gap),
    [0, 140, 140]
  );
});
