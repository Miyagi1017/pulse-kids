// Planche de contrôle (dev seulement) : la même scène dans les 66 styles. ?only=id pour un seul style.
import '../src/films/fonts';
import { STYLE_IDS, materialFor, styleLabel } from '../src/kits/styles';
import { decor, kid, objet, cat } from '../src/kits/library';
import { place } from '../src/kits/geom';
const only = new URLSearchParams(location.search).get('only');
const t = Number(new URLSearchParams(location.search).get('t') ?? 1.3);
await document.fonts.ready;
const ids = only ? [only] : STYLE_IDS;
for (const id of ids) {
  const f = document.createElement('figure');
  const cv = document.createElement('canvas');
  cv.width = only ? 960 : 320; cv.height = only ? 540 : 180;
  if (only) cv.style.cssText = 'width:960px;height:540px';
  const cap = document.createElement('figcaption'); cap.textContent = `${id} — ${styleLabel(id as never)}`;
  f.append(cv, cap); document.body.append(f);
  const m = materialFor(id as never);
  const t0 = performance.now();
  m.begin({ t });
  m.draw(decor('jardin', t));
  m.draw(place(objet('soleil', t), { x: 820, y: 100, s: 1.2 }));
  m.draw(place(objet('papillon', t, 2), { x: 640, y: 210, s: 1 }));
  m.draw(place(objet('fleur', t, 3), { x: 180, y: 380, s: 1 }));
  m.draw(place(kid(true, { t }, 3), { x: 470, y: 481, s: 0.75 }));
  m.draw(place(kid(false, { t }, 4), { x: 620, y: 481, s: 0.75 }));
  m.draw(place(cat({ t }, 7), { x: 330, y: 493, s: 0.71 }));
  m.end();
  m.title('Le jardin', 1);
  m.caption('Voici le jardin : les fleurs poussent au soleil.');
  m.badge('★ 3');
  const g = cv.getContext('2d')!;
  g.setTransform(cv.width / 960, 0, 0, cv.height / 540, 0, 0);
  m.present(g);
  cap.textContent += ` (${Math.round(performance.now() - t0)} ms)`;
  m.dispose();
}
(window as any).done = true;
