import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COMPTINES, type Decor, type Objet } from '../data/comptines';
import { styleForComptine } from './comptineScene';
import { SPECS, STYLE_IDS, colorMapper, isStyle } from './styles';
import { cat, decor, kid, objet } from './library';
import type { Figure } from './geom';

const finite = (f: Figure, what: string) => {
  assert.ok(f.shapes.length > 0, `${what} : au moins une forme`);
  for (const s of f.shapes) for (const [x, y] of s.pts) assert.ok(Number.isFinite(x) && Number.isFinite(y), `${what} : coordonnées valides`);
};

test('10 styles, tous différents et reconnus', () => {
  assert.equal(STYLE_IDS.length, 10);
  assert.equal(new Set(STYLE_IDS).size, 10);
  for (const id of STYLE_IDS) assert.ok(isStyle(id), id);
  assert.equal(Object.keys(SPECS).length, 7);
});

test('les fiches transforment toutes les couleurs en couleurs valides', () => {
  for (const [id, spec] of Object.entries(SPECS)) {
    const map = colorMapper(spec);
    for (const c of ['#FFE0C4', '#4A7BB7', '#3E3355', '#FFFFFF', '#A8D98A']) assert.match(map(c), /^#[0-9a-f]{6}$/, id);
  }
});

test('deux comptines voisines n’ont jamais le même style', () => {
  const styles = COMPTINES.map(styleForComptine);
  for (let i = 1; i < styles.length; i++) assert.notEqual(styles[i], styles[i - 1]);
  assert.ok(new Set(styles).size >= Math.min(10, COMPTINES.length));
});

test('tous les décors, objets et personnages des comptines se construisent', () => {
  const decors = new Set<Decor>(COMPTINES.map((c) => c.decor));
  const objets = new Set<Objet>(COMPTINES.flatMap((c) => c.objets));
  for (const d of decors) for (const t of [0, 3.7]) finite(decor(d, t), `décor ${d}`);
  for (const o of objets) finite(objet(o, 1.2, 3), `objet ${o}`);
  for (const girl of [false, true]) finite(kid(girl, { armL: 150, armR: -40, tilt: 8, walk: 1, t: 2 }), girl ? 'Nina' : 'Nino');
  finite(cat({ t: 1, tail: 4, tilt: 3 }), 'Mila');
});

test('chacun des 10 styles a sa peau de jeu', async () => {
  const { skinFor } = await import('./skins');
  for (const id of STYLE_IDS) {
    const skin = skinFor(id);
    assert.ok(skin, id);
    assert.ok(skin.card(0).background && skin.back(1).background && skin.question.fontFamily, `${id} : cartes, dos et police`);
  }
});
