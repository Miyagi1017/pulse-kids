import test from 'node:test';
import assert from 'node:assert/strict';
import { full, GROUND, poseFor, POSES, skeleton } from './poses';
import { SPORT_TIPS } from '../data/sport';
import { ESSENTIELS } from '../data/programmes';
import { MINI_DEFIS } from '../data/miniDefis';

test('chaque mouvement (sport du jour + programmes) a une posture et 3 consignes', () => {
  for (const s of [...SPORT_TIPS, ...ESSENTIELS, ...MINI_DEFIS]) {
    for (const m of s.moves) {
      const p = poseFor(m);
      assert.ok(POSES[p], `${s.id} : ${m.text}`);
      assert.equal(POSES[p].cues.length, 3);
    }
  }
});

test('les postures clés sont bien reconnues', () => {
  const cases: [string, string][] = [
    ['À quatre pattes, fais le dos rond comme un chat fâché', 'chat'],
    ['Mains et pieds au sol, fesses en l’air : le chien qui s’étire', 'chien'],
    ['L’arbre sur le pied droit, bras en l’air comme des branches', 'unPied'],
    ['Pieds écartés, genoux pliés : la posture du cavalier', 'cavalier'],
    ['Lève le genou bien haut, puis pousse le pied devant toi, doucement', 'coupDePied'],
    ['Assieds-toi sur une chaise invisible, 5 secondes', 'accroupi'],
    ['Marche sur une ligne imaginaire, un pied devant l’autre', 'marche']
  ];
  for (const [text, pose] of cases) assert.equal(poseFor({ text, anim: 'calme' }), pose, text);
});

test('le bonhomme est toujours posé au sol (ou au-dessus quand il saute) et reste dans le cadre', () => {
  for (const [name, def] of Object.entries(POSES)) {
    for (const f of def.frames) {
      const a = full(f);
      const k = skeleton(a);
      const pts = [k.hip, k.neck, k.elbowL, k.handL, k.elbowR, k.handR, k.kneeL, k.footL, k.kneeR, k.footR];
      const lowest = Math.max(...pts.map((p) => p[1]), k.head[1] + 16);
      assert.ok(Math.abs(lowest + 5 + a.lift - GROUND) < 0.01, `${name} : pas posé au sol`);
      for (const p of pts) assert.ok(p[0] > 0 && p[0] < 200 && p[1] > 0 && p[1] < 200, `${name} : sort du cadre`);
    }
  }
});

test('la posture correspond au geste décrit (bras devant, flexion, boule…)', () => {
  const cases: [string, string][] = [
    ['Penche-toi en avant, tête en bas, doucement', 'flexion'],
    ['Penche-toi et touche le sol', 'flexion'],
    ['Dessine un grand arc-en-ciel avec tes bras', 'brasHaut'],
    ['Le serpent se dresse : bras tendu, main en tête de serpent', 'pousser'],
    ['Allongé sur le ventre, mains sous les épaules, soulève la tête : sss', 'cobra'],
    ['Debout sur le pied droit, les bras écartés', 'unPied'],
    ['Recule doucement, une main devant, une main derrière', 'marche'],
    ['Fais des vagues avec tes bras au-dessus de ta tête', 'brasHaut'],
    ['Jambes écartées, tire la corde d’un arc imaginaire', 'guerrier']
  ];
  for (const [text, pose] of cases) assert.equal(poseFor({ text, anim: 'calme' }), pose, text);
});

import { facingOf, type PoseName } from './poses';

test('le sens déclaré de chaque posture correspond au dessin (tête / genoux du bon côté)', () => {
  for (const name of Object.keys(POSES) as PoseName[]) {
    const facing = facingOf(name);
    if (facing === 'face') continue;
    for (const fr of POSES[name].frames) {
      const k = skeleton(full(fr));
      // Allongé (tête à hauteur du bassin) : le « devant » est le plafond, ce contrôle horizontal ne s'applique pas.
      if (Math.abs(k.head[1] - k.hip[1]) < 15) continue;
      const forward = facing === 'droite' ? 1 : -1;
      const headAhead = (k.head[0] - k.hip[0]) * forward > 2;
      const kneesAhead = ((k.kneeL[0] + k.kneeR[0]) / 2 - k.hip[0]) * forward > 2;
      const handsAhead = ((k.handL[0] + k.handR[0]) / 2 - k.hip[0]) * forward > 2;
      assert.ok(headAhead || kneesAhead || handsAhead, `${name} : regarde vers la ${facing} mais rien n'est devant`);
    }
  }
});

/**
 * Amplitudes articulaires plausibles pour un enfant (repères d'anatomie, avec un peu de marge).
 * De profil vers la droite : « devant » = angle positif. Vers la gauche : tout est inversé.
 */
test('anatomie : genoux, coudes, hanches, épaules et cou restent dans des amplitudes humaines', () => {
  const problems: string[] = [];
  for (const name of Object.keys(POSES) as PoseName[]) {
    const facing = facingOf(name);
    POSES[name].frames.forEach((fr, i) => {
      const a = full(fr);
      const s = facing === 'gauche' ? -1 : 1; // miroir pour les postures tournées vers la gauche
      const bad = (what: string, v: number, min: number, max: number) => {
        if (v < min || v > max) problems.push(`${name}[${i}] ${what}=${v.toFixed(0)} (attendu ${min}…${max})`);
      };
      bad('cou', a.nk * s, -70, 70);
      if (facing === 'face') {
        // De face : le coude se plie vers le milieu du corps, le genou s'ouvre vers l'extérieur.
        bad('coude gauche', a.eL, -5, 160);
        bad('coude droit', -a.eR, -5, 160);
        bad('genou gauche', a.kL, -5, 160);
        bad('genou droit', -a.kR, -5, 160);
        bad('écart jambe gauche', -a.hL, -30, 90);
        bad('écart jambe droite', a.hR, -30, 90);
      } else {
        // De profil : le genou ne plie que vers l'arrière, le coude que vers l'avant.
        bad('genou gauche', a.kL * s, -160, 5);
        bad('genou droit', a.kR * s, -160, 5);
        bad('coude gauche', a.eL * s, -5, 160);
        bad('coude droit', a.eR * s, -5, 160);
        // Hanche : angle de la cuisse par rapport au tronc (flexion devant, petite extension derrière)
        bad('hanche gauche', (a.hL - a.t) * s, -40, 140);
        bad('hanche droite', (a.hR - a.t) * s, -40, 140);
        bad('épaule gauche', a.aL * s, -70, 215);
        bad('épaule droite', a.aR * s, -70, 215);
      }
    });
  }
  assert.deepEqual(problems, []);
});

test('mini-défis : le dessin correspond à la consigne (cas vérifiés)', () => {
  const cases: [string, string][] = [
    ['L’arbre : sur un pied, les mains posées sur le cœur', 'unPied'],
    ['Posture du cavalier, genoux pliés, mains sur les hanches', 'cavalier'],
    ['Allongé sur le dos, attrape tes pieds et roule doucement', 'bebeHeureux'],
    ['Inspire quand la mer monte, souffle quand elle descend', 'respire'],
    ['Danse, puis statue sur un pied quand je dis stop !', 'unPied'],
    ['Fais l’étoile, ferme-toi, puis refais l’étoile', 'etoile']
  ];
  for (const [text, pose] of cases) assert.equal(poseFor({ text, anim: 'calme' }), pose, text);
});
