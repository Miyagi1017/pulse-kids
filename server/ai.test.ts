import test from 'node:test';
import assert from 'node:assert/strict';
import { availableProviders, extractJson } from './ai';

test('extractJson lit du JSON nu, dans un bloc ```json ou entouré de texte', () => {
  assert.deepEqual(extractJson('{"a":1}'), { a: 1 });
  assert.deepEqual(extractJson('```json\n{"a":2}\n```'), { a: 2 });
  assert.deepEqual(extractJson('Voici : {"a":3} bonne journée'), { a: 3 });
  assert.throws(() => extractJson('pas de json'));
});

test('les fournisseurs sont activés par les variables d’environnement, Gemini en premier', () => {
  const saved = { ...process.env };
  try {
    delete process.env.GEMINI_API_KEY;
    delete process.env.AI_BASE_URL;
    delete process.env.AI_MODEL;
    assert.equal(availableProviders().length, 0);

    process.env.AI_BASE_URL = 'https://api.groq.com/openai/v1/';
    process.env.AI_MODEL = 'llama-3.3-70b-versatile';
    assert.deepEqual(availableProviders().map((p) => p.name), ['openai-compatible:api.groq.com:llama-3.3-70b-versatile']);

    process.env.GEMINI_API_KEY = 'test';
    assert.equal(availableProviders()[0].name.startsWith('gemini:'), true);
    assert.equal(availableProviders().length, 2);
  } finally {
    process.env = saved;
  }
});
