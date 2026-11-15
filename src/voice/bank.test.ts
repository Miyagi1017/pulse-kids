import assert from 'node:assert/strict';
import { test } from 'node:test';
import { keyFile, sentenceKey, splitSentences } from './bank';

test('découpe en phrases et clés stables', () => {
  assert.deepEqual(splitSentences('Le Petit Chaperon rouge. Il était une fois… une fillette ! « Bonjour », dit-elle.'), ['Le Petit Chaperon rouge.', 'Il était une fois…', 'une fillette !', '« Bonjour », dit-elle.']);
  assert.equal(sentenceKey('Partez !'), 'partez');
  assert.equal(sentenceKey('Et toi Lina, tu sautes ?', 'Lina'), sentenceKey('Et toi {p}, tu sautes ?'));
  assert.equal(keyFile(sentenceKey('Youpi !')), keyFile('youpi'));
});
