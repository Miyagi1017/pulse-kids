// Planche de contrôle (dev) : un dessin animé joué dans l'ordre, images clés de chaque plan. ?id=video-animaux-01
import '../src/films/fonts';
import { VIDEOS, createVideoScene } from '../src/videos/videoScene';
import { CAPSULES } from '../src/videos/capsules';
const id = new URLSearchParams(location.search).get('id') ?? 'video-animaux-01';
const v = [...VIDEOS, ...CAPSULES].find((x) => x.id === id)!;
await document.fonts.ready;
const vs = createVideoScene(v as never);
const work = document.createElement('canvas');
work.width = 960; work.height = 540;
const wg = work.getContext('2d')!;
const keep: [number, number[]][] = [[0, [0.4, 1.2, 2.4]], [1, [0.15, 0.3, 1, 2.8]], [2, [0.2, 0.6, 0.85, 1.6, 2.9, 3.8]], [3, [0.2, 0.4, 2.5]], [4, [0.25, 0.5, 1.3, 2.4]]];
for (const [scene, marks] of keep) {
  // On rend toutes les images à 24 i/s (la transition a besoin du plan précédent), on garde les images clés.
  for (let t = 0; t <= Math.max(...marks) + 0.001; t += 1 / 24) {
    vs.render(wg, scene, t);
    const hit = marks.find((m) => Math.abs(m - t) < 1 / 48);
    if (hit !== undefined) {
      const c = document.createElement('canvas'); c.width = 640; c.height = 360;
      c.getContext('2d')!.drawImage(work, 0, 0, 640, 360);
      const f = document.createElement('figure'); f.style.margin = '0';
      const cap = document.createElement('figcaption'); cap.textContent = `plan ${scene} · ${hit}s`;
      f.append(c, cap); document.body.append(f);
    }
  }
  // fin du plan : le suivant démarre
}
(window as any).done = true;
