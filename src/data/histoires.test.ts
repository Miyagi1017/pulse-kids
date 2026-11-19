import test from 'node:test';
import assert from 'node:assert/strict';
import { VIDEOS } from './videos';
import { VIDEO_QUIZ } from './videoQuiz';
import { cleanName } from '../voice/bank';

const ALL = VIDEOS;
const plain = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

test('chaque histoire a 6 à 8 phrases', () => {
  for (const v of ALL) assert.ok(v.scenes.length >= 6 && v.scenes.length <= 8, `${v.id} : ${v.scenes.length} phrases`);
});

test('phrases courtes et sans emoji', () => {
  for (const v of ALL)
    for (const s of v.scenes) {
      assert.ok(s.length <= 110, `${v.id} : phrase trop longue (${s.length}) « ${s} »`);
      assert.ok(!/\p{Extended_Pictographic}/u.test(s), `${v.id} : emoji dans « ${s} »`);
    }
});

test("la dernière phrase parle à l'enfant", () => {
  for (const v of ALL) {
    const last = v.scenes[v.scenes.length - 1];
    assert.ok(/[?!]/.test(last) && /\b(toi|tu|peux|sais)\b|\{p\}/i.test(last), `${v.id} : « ${last} »`);
  }
});

test('le quiz reste juste', () => {
  for (const [id, q] of Object.entries(VIDEO_QUIZ)) {
    const v = ALL.find((x) => x.id === id);
    assert.ok(v, `${id} : vidéo introuvable`);
    const text = plain(v.scenes.join(' '));
    // Mots de 5 lettres ou plus, et les nombres ; pour une réponse courte (« Sept », « Le 18 »), les mots de 4 lettres (de 3 pour « L’eau »).
    const ans = plain(q.choices[q.answer]);
    const long = ans.match(/\p{L}{5,}|\d+/gu) ?? [];
    const mid = ans.match(/\p{L}{4,}/gu) ?? [];
    const words = long.length ? long : mid.length ? mid : (ans.match(/\p{L}{3,}/gu) ?? []);
    assert.ok(words.some((w) => text.includes(w)), `${id} : la bonne réponse « ${q.choices[q.answer]} » n'est plus dans l'histoire`);
  }
});

test('prénom vide', () => {
  assert.equal(cleanName('Et toi {p}, tu sais sauter ?', ''), 'Et toi, tu sais sauter ?');
  assert.equal(cleanName('Bravo {p} !', ''), 'Bravo !');
  assert.equal(cleanName('Et toi {p}, tu sais sauter ?', 'Léa'), 'Et toi Léa, tu sais sauter ?');
});
