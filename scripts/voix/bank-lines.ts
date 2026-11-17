// Inventaire de toutes les phrases fixes que l'app peut dire (hors films et vidéos, déjà enregistrés).
// Sortie : JSON [{ key, file, text, prio }] ; prio 1 = dit le plus souvent (accueil, sport, jeux), 3 = contes longs.
import * as contes from '../../src/data/contes';
import * as contesPlus from '../../src/data/contesPlus';
import * as soir from '../../src/data/contesDuSoir';
import * as soirPlus from '../../src/data/contesDuSoirPlus';
import * as classiques from '../../src/data/classiques';
import * as activites from '../../src/data/activites';
import * as aventures from '../../src/data/aventures';
import * as explications from '../../src/data/explications';
import * as lectures from '../../src/data/lectures';
import * as sport from '../../src/data/sport';
import * as mini from '../../src/data/miniDefis';
import * as physiques from '../../src/data/physiques';
import * as wushu from '../../src/data/wushu';
import * as programmes from '../../src/data/programmes';
import * as quiz from '../../src/data/videoQuiz';
import * as jeux from '../../src/data/jeux';
import * as jeuxI from '../../src/data/jeuxInteractifs';
import * as dico from '../../src/data/dictionnaire';
import { keyFile, sentenceKey, splitSentences, withoutName } from '../../src/voice/bank';
import { splitAtName } from '../../src/voice/names';

const SOURCES: [unknown, number][] = [
  [programmes, 1], [sport, 1], [mini, 1], [physiques, 1], [wushu, 1], [jeux, 1], [jeuxI, 1], [activites, 1], [quiz, 1],
  [explications, 2], [aventures, 2], [dico, 2], [lectures, 2],
  [contes, 3], [contesPlus, 3], [soir, 3], [soirPlus, 3], [classiques, 3]
];
// Phrases écrites dans les composants (accueil, sport, petits mots du compagnon).
const UI = [
  'Bonjour ! Comment tu t’appelles ?', 'Bienvenue dans Pulse Kids !', 'Bonjour !', 'Bonsoir !', 'Coucou {p} !', 'Hi hi, ça chatouille !', 'On joue, {p} ?', 'Youpi !',
  'Encore, encore !', 'Tu es mon meilleur ami, {p} !', 'Cinq ou six ans', 'Sept ou huit ans', 'Le conseil du jour.', 'Prêt ?', 'Partez !', 'Un', 'Deux', 'Trois', 'Quatre', 'Cinq', 'Six', 'Sept', 'Huit', 'Neuf', 'Dix', 'Bravo !', 'Super !'
];
const out = new Map<string, { key: string; file: string; text: string; prio: number }>();
const isText = (s: string) => /\p{L}{2,}/u.test(s) && !/^[a-z0-9]+(-[a-z0-9]+)+$/.test(s) && !/^https?:|\.(png|webp|mp3|jpg|svg)$|^#[0-9a-f]{3,8}$/i.test(s) && !/^[a-z]+[A-Z]\w*$/.test(s);
const clean = (s: string) => s.replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu, '').replace(/\s+/g, ' ').trim();
function add(text: string, prio: number) {
  for (const sent of splitSentences(clean(text))) {
    // Phrase avec prénom : on enregistre aussi les morceaux autour, pour que Christine dise le prénom (voice/names.ts).
    if (sent.includes('{p}')) for (const seg of splitAtName(sent)) add(seg, prio);
    const t = withoutName(sent);
    const key = sentenceKey(t);
    if (!key || key.length < 1) continue;
    const prev = out.get(key);
    if (!prev || prev.prio > prio) out.set(key, { key, file: keyFile(key), text: t, prio });
  }
}
const seen = new Set<unknown>();
function walk(v: unknown, prio: number, words: boolean) {
  if (typeof v === 'string') {
    if (!isText(v)) return;
    add(v, prio);
    // Lire : chaque mot est aussi dit tout seul quand l'enfant le touche.
    if (words) for (const w of clean(v).split(/\s+/)) add(w.replace(/[«»"“”.,!?;:…()]/g, ''), prio);
    return;
  }
  if (!v || typeof v !== 'object' || seen.has(v)) return;
  seen.add(v);
  for (const x of Object.values(v as object)) walk(x, prio, words);
}
for (const [mod, prio] of SOURCES) walk(mod, prio, mod === lectures || mod === dico);
for (const u of UI) add(u, 1);
const list = [...out.values()].sort((a, b) => a.prio - b.prio);
console.log(JSON.stringify(list));
