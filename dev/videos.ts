// Planche de contrôle (dev) : les 50 vidéos du jour. ?scene=0..4&t=secondes&only=id
import '../src/films/fonts';
import { VIDEOS, createVideoScene } from '../src/videos/videoScene';
import { CAPSULES } from '../src/videos/capsules';
import { styleLabel } from '../src/kits/styles';
const q = new URLSearchParams(location.search);
const scene = Number(q.get('scene') ?? 2), t = Number(q.get('t') ?? 3), only = q.get('only');
await document.fonts.ready;
const list = q.get('set') === 'capsules' ? CAPSULES : VIDEOS;
for (const v of (list as { id: string; title: string }[]).filter((v) => !only || v.id === only)) {
  const f = document.createElement('figure');
  const cv = document.createElement('canvas');
  cv.width = only ? 960 : 384; cv.height = only ? 540 : 216;
  if (only) cv.style.cssText = 'width:960px;height:540px';
  const cap = document.createElement('figcaption');
  f.append(cv, cap); document.body.append(f);
  const s = createVideoScene(v);
  cap.textContent = `${v.title} — ${styleLabel(s.style)}`;
  const g = cv.getContext('2d')!;
  g.setTransform(cv.width / 960, 0, 0, cv.height / 540, 0, 0);
  try { s.render(g, scene, t, true); } catch (e) { cap.textContent += ' ERREUR ' + e; }
  s.dispose();
}
(window as any).done = true;
