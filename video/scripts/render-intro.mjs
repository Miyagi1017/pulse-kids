/**
 * Rend l'intro HTML (video/intro) en public/intro.mp4.
 * HyperFrames capture chaque image ; le ffmpeg fourni avec Remotion les encode.
 * (`hyperframes render` a besoin d'un ffmpeg complet, absent de cette machine.)
 */
import { execFileSync, execSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readdirSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, join, resolve } from 'node:path';

const FPS = 30;
const FRAMES = 75;
const intro = resolve('intro');
const ffmpegDir = resolve('node_modules/@remotion/compositor-win32-x64-msvc');
const env = { ...process.env, HYPERFRAMES_NO_TELEMETRY: '1', DO_NOT_TRACK: '1', PATH: `${ffmpegDir}${delimiter}${process.env.PATH}` };

const times = Array.from({ length: FRAMES }, (_, i) => (i / FPS).toFixed(4)).join(',');
execSync(`npx --yes hyperframes snapshot --at ${times}`, { cwd: intro, env, stdio: 'inherit' });

const root = join(intro, '.hyperframes/artifacts/snapshots');
const latest = readdirSync(root).map((d) => join(root, d)).sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)[0];
const atOf = (f) => Number(/at-([\d.]+)s/.exec(f)[1]);
const frames = readdirSync(latest).filter((f) => /^frame-.*\.png$/.test(f)).sort((a, b) => atOf(a) - atOf(b)).slice(0, FRAMES);
if (frames.length !== FRAMES) throw new Error(`${frames.length} images capturées au lieu de ${FRAMES}`);

const tmp = mkdtempSync(join(tmpdir(), 'pulse-intro-'));
frames.forEach((f, i) => copyFileSync(join(latest, f), join(tmp, `${String(i).padStart(4, '0')}.png`)));
mkdirSync('public', { recursive: true });
execFileSync('ffmpeg', ['-y', '-framerate', String(FPS), '-i', join(tmp, '%04d.png'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', resolve('public/intro.mp4')], { env, stdio: 'inherit' });
rmSync(tmp, { recursive: true, force: true });
console.log('public/intro.mp4 prêt');
