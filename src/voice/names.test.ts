import test from 'node:test';
import assert from 'node:assert/strict';
import { keyFile, sentenceKey } from './bank';
import { nameFile, nameKey, namePlaylist, splitAtName, templateSegments } from './names';

test('nameKey : minuscules, sans accents ni espaces autour', () => {
  assert.equal(nameKey(' Léa-Rose '), 'lea-rose');
  assert.equal(nameKey('ZOÉ'), 'zoe');
  assert.equal(nameFile('Léa'), 'prenom-lea');
});

test('splitAtName : les morceaux autour du gabarit {p}', () => {
  assert.deepEqual(splitAtName('Et toi {p}, tu sais sauter ?'), ['Et toi', 'tu sais sauter ?']);
  assert.deepEqual(splitAtName('Bravo {p} !'), ['Bravo']);
  assert.deepEqual(splitAtName('Bonjour {p}, voici les nouvelles du jour !'), ['Bonjour', 'voici les nouvelles du jour !']);
});

test('templateSegments : les clés à enregistrer pour une phrase avec prénom', () => {
  assert.deepEqual(templateSegments('Et toi {p}, tu sais sauter ?'), ['et toi', 'tu sais sauter']);
  assert.deepEqual(templateSegments('Sans prénom.'), []);
});

const all = () => true;

test('namePlaylist : morceau, prénom, morceau', () => {
  assert.deepEqual(namePlaylist('Et toi Léa, tu sais sauter ?', 'Léa', all), [
    { file: keyFile(sentenceKey('Et toi')), text: 'Et toi ' },
    { file: 'prenom-lea', text: 'Léa' },
    {
      file: keyFile(sentenceKey(', tu sais sauter ?')),
      text: ', tu sais sauter ?'
    }
  ]);
});

test('namePlaylist : prénom en fin de phrase', () => {
  const p = namePlaylist('Bravo Tom !', 'Tom', all);
  assert.deepEqual(
    p?.map((x) => x.file),
    [keyFile('bravo'), 'prenom-tom']
  );
});

test('namePlaylist : rien à faire sans prénom, ou si une prise manque', () => {
  assert.equal(namePlaylist('Et toi, tu sais ?', null, all), null);
  assert.equal(namePlaylist('Et toi, tu sais ?', 'Léa', all), null);
  assert.equal(
    namePlaylist('Et toi Zébulon, tu sais ?', 'Zébulon', (f) => f !== 'prenom-zebulon'),
    null
  );
  assert.equal(
    namePlaylist('Et toi Léa, tu sais ?', 'Léa', (f) => f === 'prenom-lea'),
    null
  );
});
