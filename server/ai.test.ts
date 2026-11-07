import test from 'node:test';
import assert from 'node:assert/strict';
import { availableProviders, extractJson } from './ai';

test('extractJson lit du JSON nu, dans un bloc ```json ou entouré de texte', () => {
  assert.deepEqual(extractJson('{"a":1}'), { a: 1 });
  assert.deepEqual(extractJson('```json\n{"a":2}\n```'), { a: 2 });
  assert.deepEqual(extractJson('Voici : {"a":3} bonne journée'), { a: 3 });
  assert.throws(() => extractJson('pas de json'));
});

test('ordre des fournisseurs : open source d’abord (Hugging Face, OpenAI-compatible), Gemini en dernier', () => {
  const saved = { ...process.env };
  try {
    for (const k of ['HF_TOKEN', 'HF_TEXT_MODEL', 'GEMINI_API_KEY', 'AI_BASE_URL', 'AI_MODEL']) delete process.env[k];
    assert.equal(availableProviders().length, 0);

    process.env.GEMINI_API_KEY = 'test';
    process.env.AI_BASE_URL = 'http://localhost:11434/v1/';
    process.env.AI_MODEL = 'qwen2.5:7b';
    process.env.HF_TOKEN = 'hf_test';
    const names = availableProviders().map((p) => p.name);
    assert.equal(names.length, 3);
    assert.ok(names[0].startsWith('huggingface:router.huggingface.co:'), names[0]);
    assert.equal(names[1], 'openai-compatible:localhost:11434:qwen2.5:7b');
    assert.ok(names[2].startsWith('gemini:'));
  } finally {
    process.env = saved;
  }
});
