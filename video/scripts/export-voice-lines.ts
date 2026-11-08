/** Écrit dans .tts/lines.json toutes les phrases à faire dire à la voix off : { code: texte }. */
import { mkdirSync, writeFileSync } from 'node:fs';
import { VIDEO_ACTIVITIES } from '../src/activities';
import { BRAVO_LINE, COUNT_LINES, linesOf, voiceKey } from '../src/voice';

const texts = [BRAVO_LINE, ...COUNT_LINES, ...VIDEO_ACTIVITIES.flatMap(linesOf)];
const lines = Object.fromEntries(texts.map((t) => [voiceKey(t), t]));
mkdirSync('.tts', { recursive: true });
writeFileSync('.tts/lines.json', JSON.stringify(lines, null, 1));
console.log(`${Object.keys(lines).length} phrases uniques`);
