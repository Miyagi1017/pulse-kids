import { test } from 'node:test';
import assert from 'node:assert/strict';
import { moveGuide, repetitions, speechSeconds } from './guide';
import { SPORT_TIPS } from '../data/sport';
import { PHYSIQUES } from '../data/physiques';
import { POSES, poseFor } from './poses';

test('guide : on reconnaît le nombre de répétitions demandé', () => {
  assert.equal(repetitions('Plie les genoux dix fois, tout doucement'), 10);
  assert.equal(repetitions('Fais 5 petits sauts sur place'), 5);
  assert.equal(repetitions('Respire doucement par le nez, cinq fois.'), 5);
  assert.equal(repetitions('Respire lentement, 3 grandes fois'), 3);
  assert.equal(repetitions('Cours le plus vite possible sur place, 10 secondes'), null);
  assert.equal(repetitions('Danse, danse, danse !'), null);
});

test('guide : chaque mouvement est guidé à voix haute, sans phrases qui se chevauchent', () => {
  const all = [...SPORT_TIPS, ...PHYSIQUES];
  let comptes = 0;
  for (const tip of all) {
    tip.moves.forEach((m, i) => {
      const g = moveGuide(m, i, tip.moves.length, m.cues ?? POSES[poseFor(m)].cues);
      assert.ok(g.seconds >= m.seconds, `${tip.id} #${i} : la durée doit être allongée (${g.seconds} < ${m.seconds})`);
      assert.ok(g.seconds <= 60, `${tip.id} #${i} : mouvement trop long (${g.seconds} s)`);
      assert.ok(g.intro.includes(`Mouvement ${i + 1} sur ${tip.moves.length}`), `${tip.id} #${i} : annonce du mouvement`);
      assert.ok(g.events.length >= 3, `${tip.id} #${i} : la voix guide pendant le mouvement`);
      let prev = -1;
      for (const e of g.events) {
        assert.ok(e.at >= prev, `${tip.id} #${i} : événements dans l'ordre`);
        assert.ok(e.at <= g.seconds, `${tip.id} #${i} : « ${e.say} » après la fin`);
        prev = e.at;
      }
      if (g.mode === 'libre') {
        const talk = g.events.filter((e) => !e.count && e.say !== 'Stop !');
        for (let k = 1; k < talk.length; k++) assert.ok(talk[k].at >= talk[k - 1].at + speechSeconds(talk[k - 1].say), `${tip.id} #${i} : deux phrases se chevauchent`);
      }
      if (g.mode === 'compte') comptes++;
    });
  }
  assert.ok(comptes >= 5, `des mouvements comptés à voix haute (${comptes})`);
});
