import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COMPTINES, COMPTINE_THEMES, type Decor, type Objet } from '../data/comptines';
import { THEME_STYLE } from './comptineScene';
import { cat, decor, kid, objet } from './library';
import type { Figure } from './geom';

const finite = (f: Figure, what: string) => {
  assert.ok(f.shapes.length > 0, `${what} : au moins une forme`);
  for (const s of f.shapes) for (const [x, y] of s.pts) assert.ok(Number.isFinite(x) && Number.isFinite(y), `${what} : coordonnées valides`);
};

test('chaque thème de comptine a son style', () => {
  for (const th of Object.keys(COMPTINE_THEMES)) assert.ok(THEME_STYLE[th as keyof typeof THEME_STYLE], th);
  // Au moins 6 styles différents : on reconnaît la famille d'une comptine à son style.
  assert.ok(new Set(Object.values(THEME_STYLE)).size >= 6);
});

test('tous les décors, objets et personnages des comptines se construisent', () => {
  const decors = new Set<Decor>(COMPTINES.map((c) => c.decor));
  const objets = new Set<Objet>(COMPTINES.flatMap((c) => c.objets));
  for (const d of decors) for (const t of [0, 3.7]) finite(decor(d, t), `décor ${d}`);
  for (const o of objets) finite(objet(o, 1.2, 3), `objet ${o}`);
  for (const girl of [false, true]) finite(kid(girl, { armL: 150, armR: -40, tilt: 8, walk: 1, t: 2 }), girl ? 'Nina' : 'Nino');
  finite(cat({ t: 1, tail: 4, tilt: 3 }), 'Mila');
});

test('chaque style de décor a sa peau de jeu', async () => {
  const { SCENE_STYLE } = await import('./themeScene');
  const { SKINS } = await import('./skins');
  for (const [scene, spec] of Object.entries(SCENE_STYLE)) {
    const skin = SKINS[spec.style];
    assert.ok(skin, scene);
    assert.ok(skin.card(0).background && skin.back(1).background, `${scene} : cartes et dos`);
  }
});
