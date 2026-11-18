// Planche de contrôle (dev) : une comptine, images clés de chaque ligne. ?i=0 (rang dans la liste)
import '../src/films/fonts';
import { COMPTINES } from '../src/data/comptines';
import { estimateTiming } from '../src/comptines/stage';
import { createComptineScene } from '../src/kits/comptineScene';
import { styleLabel } from '../src/kits/styles';
const i = Number(new URLSearchParams(location.search).get('i') ?? 0);
const c = COMPTINES[i];
const timing = estimateTiming(c);
await document.fonts.ready;
const sc = createComptineScene(c, timing);
const marks = [0.3, 1.2, ...timing.lines.flatMap(([s, e]) => [s + 0.05, s + 0.3, s + 0.6, (s + e) / 2]), timing.lines[4][0] + 1.5];
for (const t of marks) {
  const cv = document.createElement('canvas'); cv.width = 640; cv.height = 360;
  const g = cv.getContext('2d')!; g.setTransform(640 / 960, 0, 0, 360 / 540, 0, 0);
  sc.render(g, t, true);
  const f = document.createElement('figure'); const cap = document.createElement('figcaption');
  cap.textContent = `${c.title} · ${styleLabel(sc.style)} · ${t.toFixed(2)}s`;
  f.append(cv, cap); document.body.append(f);
}
(window as any).done = true;
