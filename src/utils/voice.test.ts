import test from 'node:test';
import assert from 'node:assert/strict';
import { pickVoice, softTone, voiceScore } from './voice';

test('la voix naturelle féminine passe avant les voix classiques', () => {
  const voices = [
    { name: 'Microsoft Paul - French (France)', lang: 'fr-FR' },
    { name: 'Microsoft Julie - French (France)', lang: 'fr-FR' },
    { name: 'Google français', lang: 'fr-FR' },
    { name: 'Microsoft Denise Online (Natural) - French (France)', lang: 'fr-FR' },
    { name: 'Google US English', lang: 'en-US' }
  ];
  assert.equal(pickVoice(voices)?.name, 'Microsoft Denise Online (Natural) - French (France)');
});

test('sans voix naturelle : Google français, jamais une voix masculine', () => {
  const voices = [
    { name: 'Microsoft Paul - French (France)', lang: 'fr-FR' },
    { name: 'Microsoft Hortense - French (France)', lang: 'fr-FR' },
    { name: 'Google français', lang: 'fr-FR' }
  ];
  assert.equal(pickVoice(voices)?.name, 'Google français');
  assert.ok(voiceScore(voices[0]) < voiceScore(voices[1]));
});

test('une voix non française n’est jamais choisie', () => {
  assert.equal(pickVoice([{ name: 'Samantha', lang: 'en-US' }]), undefined);
});

test('le ton reste doux : jamais trop aigu ni trop rapide', () => {
  for (const [rate, pitch] of [[1, 1.3], [0.9, 1.15], [1.5, 2], [0.5, 0.5]]) {
    const t = softTone(rate, pitch);
    assert.ok(t.pitch >= 0.95 && t.pitch <= 1.12, `pitch ${t.pitch}`);
    assert.ok(t.rate >= 0.72 && t.rate <= 0.92, `rate ${t.rate}`);
  }
});
