import test from 'node:test';
import assert from 'node:assert/strict';
import { ANIM_IDS, EXPLICATIONS, EXPLAIN_THEMES, explicationOf, explicationOfTheDay } from './explications';
import { VIDEO_QUIZ, quizFor } from './videoQuiz';
import { VIDEOS } from './videos';
import { AGE_BANDS, AGE_INFO, isAgeBand, narrationRate, otherAge, readAge, stepText } from '../lib/age';
import { shuffled } from '../lib/shuffle';
import { existsSync } from 'node:fs';
import { CHANSONS } from './chansons';

/**
 * Les garde-fous des contenus ajoutés pour les 5–8 ans.
 * On reste volontairement strict sur la forme (longueurs, ids, réponses) pour que
 * les données restent faciles à enrichir sans casser un écran.
 */

// Même esprit que le test des contes. « sang » est autorisé ici : expliquer la circulation
// du sang à un enfant de 7 ans n'est pas un contenu violent, c'est de la science.
const FORBIDDEN = /<[^>]+>|https?:\/\/|mort|tuer|guerre|arme|monstre méchant|démon|sorcière/i;

test('explications : 12 grandes questions, 3 étapes chacune, ids et titres uniques', () => {
  assert.equal(EXPLICATIONS.length, 12);
  assert.equal(new Set(EXPLICATIONS.map((e) => e.id)).size, 12, 'ids uniques');
  assert.equal(new Set(EXPLICATIONS.map((e) => e.title)).size, 12, 'titres uniques');
  assert.equal(new Set(EXPLICATIONS.map((e) => e.question)).size, 12, 'questions uniques');
  assert.equal(ANIM_IDS.length, 12);

  for (const e of EXPLICATIONS) {
    assert.ok(e.question.trim().endsWith('?'), `${e.id} : la question finit par ?`);
    assert.ok(e.question.length <= 60, `${e.id} : question trop longue (${e.question.length})`);
    assert.ok(e.title.length <= 24, `${e.id} : titre trop long`);
    assert.ok(e.emoji.length > 0);
    assert.ok(e.theme in EXPLAIN_THEMES, `${e.id} : thème inconnu`);
    assert.ok(ANIM_IDS.includes(e.anim), `${e.id} : animation inconnue`);
    assert.equal(e.steps.length, 3, `${e.id} : 3 étapes`);
    assert.ok(!FORBIDDEN.test(e.question + e.title + e.retiens + e.experience), `${e.id} : contenu interdit`);
    assert.ok(e.retiens.length >= 20 && e.retiens.length <= 130, `${e.id} : « à retenir » (${e.retiens.length})`);
    assert.ok(e.experience.length >= 30 && e.experience.length <= 220, `${e.id} : expérience (${e.experience.length})`);
    assert.match(e.experience, /[.!]$/, `${e.id} : l’expérience finit par une phrase`);

    for (const s of e.steps) {
      assert.ok(s.emoji.length > 0 && s.title.length > 0, `${e.id} : étape incomplète`);
      assert.ok(s.title.length <= 40, `${e.id} : titre d’étape trop long`);
      // 5–6 ans : une phrase courte, lisible à voix haute.
      assert.ok(s.text.length >= 40 && s.text.length <= 190, `${e.id} / ${s.title} : texte 5–6 ans (${s.text.length})`);
      // 7–8 ans : un complément un peu plus riche, mais toujours court.
      assert.ok(s.more.length >= 40 && s.more.length <= 230, `${e.id} / ${s.title} : complément 7–8 ans (${s.more.length})`);
      assert.ok(!FORBIDDEN.test(s.text + s.more), `${e.id} : contenu interdit dans l’étape`);
    }
  }
});

test('chaque explication a une question de compréhension jouable', () => {
  for (const e of EXPLICATIONS) {
    const q = e.quiz;
    assert.ok(q.q.length > 10 && q.q.endsWith('?'), `${e.id} : question de quiz`);
    assert.equal(q.choices.length, 3, `${e.id} : 3 choix`);
    assert.equal(new Set(q.choices).size, 3, `${e.id} : choix en double`);
    assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer <= 2, `${e.id} : réponse hors des choix`);
    assert.ok(q.choices.every((c) => c.length > 0 && c.length <= 60), `${e.id} : un choix est trop long`);
    assert.ok(q.why.length >= 30 && q.why.length <= 180, `${e.id} : explication (${q.why.length})`);
    assert.ok(!FORBIDDEN.test(q.q + q.choices.join(' ') + q.why), `${e.id} : contenu interdit dans le quiz`);
  }
});

test('les 50 mini-vidéos ont toutes une question, et rien de plus', () => {
  assert.equal(Object.keys(VIDEO_QUIZ).length, VIDEOS.length, 'une question par vidéo, sans doublon');
  for (const v of VIDEOS) {
    const q = quizFor(v.id);
    assert.ok(q, `${v.id} : question manquante`);
    assert.ok(q.q.endsWith('?'), `${v.id} : la question finit par ?`);
    assert.ok(q.q.length <= 80, `${v.id} : question trop longue`);
    assert.equal(q.choices.length, 3, `${v.id} : 3 choix`);
    assert.equal(new Set(q.choices).size, 3, `${v.id} : choix en double`);
    assert.ok(q.answer >= 0 && q.answer <= 2, `${v.id} : réponse hors des choix`);
    assert.ok(q.why.length >= 25 && q.why.length <= 180, `${v.id} : explication (${q.why.length})`);
    assert.ok(!FORBIDDEN.test(q.q + q.choices.join(' ') + q.why), `${v.id} : contenu interdit`);
    // La bonne réponse doit être une des trois propositions, évidemment.
    assert.ok(q.choices[q.answer].length > 0);
  }
  // Pas de question orpheline (une vidéo supprimée laisserait une clé morte).
  for (const id of Object.keys(VIDEO_QUIZ)) assert.ok(VIDEOS.some((v) => v.id === id), `${id} : vidéo inconnue`);
});

test('l’âge adapte la voix et le texte, avec des valeurs sûres', () => {
  assert.deepEqual(AGE_BANDS, ['petit', 'grand']);
  assert.equal(readAge('grand'), 'grand');
  assert.equal(readAge('petit'), 'petit');
  assert.equal(readAge(undefined), 'petit');
  assert.equal(readAge('ado'), 'petit');
  assert.equal(readAge(7), 'petit');
  assert.ok(isAgeBand('grand') && !isAgeBand('grand '));
  assert.ok(narrationRate('petit') < narrationRate('grand'), 'la voix des petits est plus lente');
  assert.ok(narrationRate('petit') >= 0.7 && narrationRate('grand') <= 0.95, 'vitesses raisonnables');
  assert.equal(otherAge('petit'), 'grand');
  assert.equal(otherAge('grand'), 'petit');
  assert.equal(AGE_INFO.petit.short, '5-6');
  assert.equal(AGE_INFO.grand.short, '7-8');

  const step = { text: 'Une phrase simple.', more: 'Un complément plus précis.' };
  assert.equal(stepText(step, 'petit'), 'Une phrase simple.');
  assert.equal(stepText(step, 'grand'), 'Une phrase simple. Un complément plus précis.');
  // Sans complément, pas de « undefined » qui traîne à l’écran.
  assert.equal(stepText({ text: 'Seul.' }, 'grand'), 'Seul.');
});

test('chansons animées : vidéo et affiche présentes, paroles ordonnées, quiz jouable', () => {
  assert.ok(CHANSONS.length >= 1, 'au moins une chanson');
  assert.equal(new Set(CHANSONS.map((c) => c.id)).size, CHANSONS.length, 'ids uniques');
  for (const c of CHANSONS) {
    assert.ok(c.duration >= 10 && c.duration <= 120, `${c.id} : durée (${c.duration})`);
    for (const theme of ['fille', 'garcon'] as const) {
      const media = c.medias![theme];
      assert.match(media.video, /^\/videos\/chansons\/[a-z0-9-]+\.mp4$/, `${c.id} : chemin vidéo (${theme})`);
      assert.match(media.poster, /^\/videos\/chansons\/[a-z0-9-]+\.jpg$/, `${c.id} : affiche (${theme})`);
      assert.ok(existsSync(`public${media.video}`), `${c.id} : le MP4 ${theme} n'est pas dans public/`);
      assert.ok(existsSync(`public${media.poster}`), `${c.id} : l'affiche ${theme} n'est pas dans public/`);
    }
    assert.notEqual(c.medias!.fille.video, c.medias!.garcon.video, `${c.id} : deux vidéos distinctes`);

    assert.ok(c.lyrics.length >= 3, `${c.id} : paroles`);
    let previous = -1;
    for (const l of c.lyrics) {
      assert.ok(l.start > previous, `${c.id} : paroles non ordonnées`);
      assert.ok(l.end > l.start, `${c.id} : fin avant début`);
      assert.ok(l.end <= c.duration + 0.25, `${c.id} : paroles après la fin`);
      assert.ok(l.text.trim().length > 0 && l.text.length <= 60, `${c.id} : ligne trop longue`);
      previous = l.start;
    }

    const q = c.quiz;
    assert.ok(q.q.endsWith('?'), `${c.id} : question`);
    assert.equal(q.choices.length, 3);
    assert.equal(new Set(q.choices).size, 3, `${c.id} : choix en double`);
    assert.ok(q.answer >= 0 && q.answer <= 2);
    assert.ok(q.why.length >= 20 && !FORBIDDEN.test(q.q + q.choices.join(' ') + q.why), `${c.id} : quiz`);
    assert.ok(c.retiens.length >= 20 && c.geste.length >= 30, `${c.id} : à retenir / geste`);
  }
});

test('les propositions des quiz sont mélangées, sans abîmer la liste d’origine', () => {
  const input = ['a', 'b', 'c'];
  const out = shuffled(input);
  assert.deepEqual([...out].sort(), ['a', 'b', 'c'], 'même contenu');
  assert.deepEqual(input, ['a', 'b', 'c'], 'la liste d’origine n’est pas modifiée');
  assert.notEqual(out, input, 'une nouvelle liste est renvoyée');
  // Sur 200 tirages, les 6 permutations apparaissent (échec quasi impossible).
  const seen = new Set(Array.from({ length: 200 }, () => shuffled(input).join('')));
  assert.equal(seen.size, 6, 'l’ordre change vraiment');
});

test('trouver une explication ne renvoie jamais rien, et la question du jour change', () => {
  assert.equal(explicationOf(EXPLICATIONS[0].id)?.id, EXPLICATIONS[0].id);
  assert.equal(explicationOf('inconnu'), undefined);
  const a = explicationOfTheDay('2026-01-01');
  const b = explicationOfTheDay('2026-01-02');
  assert.notEqual(a.id, b.id, 'la question du jour change d’un jour à l’autre');
  assert.ok(EXPLICATIONS.includes(a) && EXPLICATIONS.includes(b));
});

test('comptines : 100 comptines complètes, jouables et accompagnées de leur bande-son', async () => {
  const { COMPTINES, GESTE_INFO } = await import('./comptines');
  const { COMPTINES_CHANSONS } = await import('./chansons');
  const { decor, objet } = await import('../comptines/decor');
  const { comptineFrame } = await import('../comptines/stage');
  assert.equal(COMPTINES.length, 100, '100 comptines');
  assert.equal(new Set(COMPTINES.map((c) => c.id)).size, 100, 'ids uniques');
  assert.equal(new Set(COMPTINES.map((c) => c.title)).size, 100, 'titres uniques');
  for (const c of COMPTINES) {
    for (const l of [...c.lines, c.shout]) assert.ok(l.trim().length >= 3 && l.length <= 52, `${c.id} : ligne trop longue ou vide « ${l} »`);
    for (const g of c.gestes) assert.ok(GESTE_INFO[g], `${c.id} : geste inconnu ${g}`);
    assert.ok(c.objets.length >= 1, `${c.id} : au moins un objet`);
    for (const o of c.objets) assert.ok(objet(o, 0, 0).length > 20, `${c.id} : objet inconnu ${o}`);
    assert.ok(decor(c.decor, 0).length > 100, `${c.id} : décor inconnu ${c.decor}`);
    assert.ok(c.retiens.length > 10, `${c.id} : phrase à retenir`);
  }
  for (const ch of COMPTINES_CHANSONS) {
    const a = ch.comptine!;
    assert.equal(a.timing.lines.length, 5, `${ch.id} : 4 lignes + cri final`);
    let prev = 0;
    for (const [s, e] of a.timing.lines) {
      assert.ok(s >= prev && e > s, `${ch.id} : horaires ordonnés`);
      prev = e;
    }
    assert.ok(a.timing.duration > prev, `${ch.id} : la fin vient après le cri final`);
    assert.ok(existsSync(`public${a.audio}`), `${ch.id} : bande-son absente (npx tsx scripts/comptines/build.ts)`);
    const q = ch.quiz;
    assert.equal(new Set(q.choices).size, 3, `${ch.id} : 3 réponses différentes`);
    assert.ok(q.choices.every((x) => x.length > 0), `${ch.id} : réponse vide`);
    assert.ok(q.answer >= 0 && q.answer < 3, `${ch.id} : index de réponse`);
    for (const t of [0.5, a.timing.lines[2][0] + 0.3, a.timing.lines[4][0] + 0.5, a.timing.duration - 0.2]) {
      const svg = comptineFrame(a.spec, a.timing, t, 'garcon');
      assert.ok(svg.startsWith('<svg') && !/NaN|undefined/.test(svg), `${ch.id} : image invalide à ${t.toFixed(1)} s`);
    }
  }
});
