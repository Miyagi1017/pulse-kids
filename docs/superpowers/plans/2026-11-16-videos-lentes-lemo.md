# Vidéos lentes en styles livre d'enfant (A + B) — plan de travail

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal :** les 116 vidéos et les 6 films de Pulse Kids, réécrits en histoires de 6 à 8 phrases, dits par Christine
(OpenVoice), joués lentement dans l'app (B, en code) et, quand il existe, en film MP4 Lemo-Opuscar (A).

**Architecture :** les histoires restent dans `src/data/videos.ts` et `src/videos/capsules.ts` (tableau `scenes`
de 6 à 8 phrases). Le moteur `src/videos/videoScene.ts` passe d'une grammaire figée à 5 plans à une grammaire
pour N plans, au rythme lent. Le lecteur `DailyVideo.tsx` choisit le MP4 (`public/films-mp4/<id>.mp4`, liste
dans `src/videos/mp4-index.json`) si l'appareil est en ligne, sinon le code. Les films A sont produits par **un
gabarit Lemo-Opuscar paramétré** (`video/lemo/pulse-film/`) qui lit l'histoire, le héros, le décor, le style et
les prises de voix d'une vidéo : on n'écrit pas 122 films à la main.

**Tech Stack :** TypeScript + React + Vite, tests `tsx --test` (`npm test`) ; Python 3.11 WSL (OpenVoice) ;
Lemo-Opuscar (`C:\Users\intel\lemo-opuscar`, Node + Python `.venv`, `PYTHONUTF8=1`) ; openfilm et rea-video
pour le montage du générique et le contrôle.

**Spec :** `docs/superpowers/specs/2026-11-16-videos-lentes-lemo-design.md`

## Global Constraints

- Public : 5 à 8 ans. Durée d'une vidéo : **45 s à 1 min**. Plans de **5 à 8 s**, **aucune coupe sous 3 s**,
  pause de **0,8 à 1,2 s** après chaque phrase, pas de transition `whip`.
- Histoires : **6 à 8 phrases**, une idée par phrase, ≤ 110 caractères, mêmes sujets et mêmes héros
  qu'aujourd'hui ; la dernière phrase s'adresse à l'enfant ; `{p}` = prénom (jamais enregistré).
- **Moins d'icônes** : aucun emoji ni pictogramme affiché dans les vidéos (B) et les films (A) ; aucun emoji
  dans les phrases.
- Styles : uniquement `crayon`, `watercolor`, `paper-popup`, `paper-lantern`, `papercut-red`, `shadow-puppet`,
  `rubber-hose`, `chalkboard` (styles « livre d'enfant » déjà présents dans `src/kits/styles.ts`) ; un style par
  famille de sujets.
- Voix : Christine, via `scripts/voix/redo_openvoice.py` ; « La Grosse Fraise Rouge » garde sa prise ElevenLabs.
- Hors périmètre : contes, contes du soir, classiques ; interface ; dramaclaw et printfilm (pas de clé) ;
  aucun service payant.
- MP4 : `public/films-mp4/<id>.mp4`, 1280×720, H.264 + AAC, ≤ 8 Mo par minute ; jamais mis en cache par le
  service worker ; hors ligne → version B.
- Chaque chantier long (voix, rendus) écrit un journal et ouvre une fenêtre de terminal qui le suit
  (`cmd.exe //c start "<titre>" wsl.exe -d Ubuntu -- bash -lc "tail -n +1 -f <log>"`).
- Une PR par tâche livrée ; on ne fusionne qu'avec l'accord de l'utilisateur.

## Review Focus

1. **Prénom vide ou absent** : une phrase « Et toi {p}, … » doit se lire « Et toi, … » à l'écran et dans la
   voix (aucun « Et toi , »). → test dans la tâche 1.
2. **Hors ligne alors qu'un MP4 existe** : la version en code doit jouer, sans écran noir. → test dans la tâche 4.
3. **MP4 qui échoue au chargement** (404, réseau coupé en cours) : bascule sur la version en code au même
   endroit de l'histoire. → test dans la tâche 4.
4. **Une prise de voix manquante ou en trop** après la réécriture (anciennes prises 05.mp3… restées sur le
   disque) : chaque scène a sa prise, aucune prise orpheline. → test dans la tâche 2.
5. **Enfant qui touche « suivant » pendant une pause** : on passe à la phrase suivante sans double lecture ni
   saut de deux phrases. → test dans la tâche 3.

---

### Task 1 : Les histoires réécrites (5 d'abord, puis toutes)

**Files :**
- Modify : `src/data/videos.ts` (format `Row` : le 4ᵉ champ reste `"phrase|phrase|…"`, 6 à 8 phrases),
  `src/videos/capsules.ts` (`Row` : les 4 phrases deviennent un tableau `string[]` de 6 à 8 phrases ;
  `emoji` reste dans les données mais n'est plus affiché), `src/films/*.ts` (texte des `beats`, même nombre de
  plans ou plus, sans changer l'image dans cette tâche)
- Create : `src/data/histoires.test.ts`
- Outil : skill `short-drama-write` (drama-skills) pour la réécriture et la passe « moins de modèle ».

**Interfaces :**
- Produces : `VIDEOS[i].scenes: string[]` et `CAPSULES[i].scenes: string[]` de longueur 6 à 8 ;
  `cleanName(s: string, name?: string): string` exportée par `src/voice/bank.ts` (réutilise `withoutName`
  quand `name` est vide).

- [ ] **Step 1 : Écrire les tests** dans `src/data/histoires.test.ts` :
  - `chaque histoire a 6 à 8 phrases` : pour `[...VIDEOS, ...CAPSULES]`, `scenes.length` ∈ [6, 8].
  - `phrases courtes et sans emoji` : chaque phrase ≤ 110 caractères et ne contient aucun
    `\p{Extended_Pictographic}`.
  - `la dernière phrase parle à l'enfant` : la dernière phrase contient `?` ou `!` et l'un de
    `toi|tu|{p}|peux|sais`.
  - `le quiz reste juste` : pour chaque id de `VIDEO_QUIZ`, au moins un mot de ≥ 5 lettres de la bonne réponse
    (`choices[answer]`, minuscules, sans accents) apparaît dans le texte des scènes.
  - `prénom vide` : `cleanName('Et toi {p}, tu sais sauter ?', '')` === `'Et toi, tu sais sauter ?'`.
- [ ] **Step 2 : Lancer** `npm test` → les 4 premiers tests échouent (4 phrases aujourd'hui).
- [ ] **Step 3 : Réécrire 5 histoires pilotes** (`video-animaux-01`, `video-espace-01`, `video-corps-01`,
  `capsule-03`, `capsule-10`) : arc héros → problème → essai → réussite → question à l'enfant.
- [ ] **Step 4 : Montrer les 5 à l'utilisateur** (texte dans le message) et attendre sa validation ;
  appliquer ses remarques à la consigne de réécriture.
- [ ] **Step 5 : Réécrire les 111 autres et les textes des 6 films** ; implémenter `cleanName`.
- [ ] **Step 6 : Lancer** `npm test` → tout passe.
- [ ] **Step 7 : Commit** `Histoires : 116 vidéos et 6 films réécrits en 6 à 8 phrases` ; PR.

### Task 2 : Les voix des nouvelles histoires

**Files :**
- Modify : `scripts/voix/all-lines.ts` (option `--media-only` : seulement films et vidéos),
  `src/videos/voice.test.ts`
- Run : `scripts/voix/redo_openvoice.py` (WSL), journal `~/ov/histoires.log` + fenêtre de suivi.

**Interfaces :**
- Consumes : `scenes` de la tâche 1.
- Produces : `src/assets/voix/<id>/00..NN.mp3` (00 = titre) et `src/assets/films/<id>/NN.mp3`.

- [ ] **Step 1 : Test** `aucune prise orpheline` dans `voice.test.ts` : pour chaque vidéo, le dossier
  `voix/<id>/` contient exactement `scenes.length + 1` fichiers mp3 ; aucun dossier `voix/<x>` sans vidéo.
- [ ] **Step 2 : Lancer** `npm test` → échoue (prises manquantes).
- [ ] **Step 3 : Générer** : `npx tsx scripts/voix/all-lines.ts --media-only > lines.json` ; vider
  `~/ov/fr_FR_DeniseNeural/{base,conv}/{voix,films}` (les textes ont changé) ; lancer la génération (≈ 800
  phrases, ≈ 45 min) avec la fenêtre de suivi ; supprimer les prises au-delà de `scenes.length`.
- [ ] **Step 4 : Lancer** `npm test` → passe.
- [ ] **Step 5 : Commit** `Voix de Christine pour les nouvelles histoires` ; PR.

### Task 2b : Christine dit le prénom

**Files :** Create `src/voice/names.ts` (`nameKey(name: string): string` — minuscules sans accents ;
`splitAtName(text: string): string[]` — morceaux autour de `{p}`, vides retirés), `src/voice/names.test.ts`,
`scripts/voix/names-lines.ts` (prénoms INSEE → `banque/prenom-<nameKey>`), lignes « morceaux » ajoutées à
`bank-lines.ts` et `all-lines.ts` (clé de chaque morceau = `sentenceKey(morceau)`) ; Modify `src/videos/voice.ts`
et `src/utils/soundEffects.ts` (jouer morceau, prénom, morceau ; prénom inconnu → `speakFrenchText(name)`).

- [ ] Tests : `splitAtName('Et toi {p}, tu sais ?')` → `['Et toi', 'tu sais ?']` ; `nameKey('Léa-Rose ')` →
  `'lea-rose'` ; `playlist(text, name, bankIndex)` renvoie `[clip('Et toi'), name('lea'), clip('tu sais')]` et,
  pour un prénom absent, `{ tts: 'Zébulon' }` à la place du prénom.
- [ ] Générer les ≈ 2 000 prénoms + tous les morceaux (fenêtre de suivi), tests verts, commit, PR.

### Task 3 : Le moteur lent (B)

**Files :**
- Create : `src/videos/pacing.ts`, `src/videos/pacing.test.ts`
- Modify : `src/films/engine.ts`, `src/films/films.test.ts`, `src/videos/videoScene.ts` (grammaire N plans, constantes lentes, plus d'emoji, styles livre
  d'enfant), `src/components/DailyVideo.tsx` (pause après chaque phrase, N scènes)

**Interfaces :**
- Produces (dans `pacing.ts`) :
  - `type Shot = 'titre' | 'decouverte' | 'action' | 'detail' | 'calme' | 'question'`
  - `shotFor(scene: number, count: number): Shot` — 0 → `titre`, dernier → `question`, 1 → `decouverte`,
    le plan du milieu → `action`, les autres alternent `detail` / `calme`.
  - `PACE = { minShot: 3, pauseAfterLine: 1.0, transition: 1.2 } as const` (secondes).
  - `SLOW_TRANSITIONS = ['iris', 'push', 'doors'] as const`.
  - `STORYBOOK_STYLES: StyleId[]` (les 8 styles des Global Constraints) et
    `storybookStyleFor(id: string): StyleId` — même famille de sujets (thème des vidéos du jour, groupe de 11
    pour les capsules) → même style.
  - `nextIndex(index: number, count: number, inPause: boolean): number` — un appui pendant la pause annule la
    pause et avance d'une seule phrase.
- `createVideoScene(video, style)` garde sa signature ; `render(ctx, scene, t)` accepte `scene` de 0 à
  `count` (0 = titre).

- [ ] **Step 1 : Tests** dans `pacing.test.ts` :
  - `shotFor(0, 8) === 'titre'`, `shotFor(8, 8) === 'question'`, `shotFor(1, 8) === 'decouverte'`, et pour
    `count` de 6 à 8, exactement un `action`.
  - `SLOW_TRANSITIONS` ne contient pas `'whip'` ; `PACE.minShot >= 3` ; `PACE.pauseAfterLine` ∈ [0.8, 1.2].
  - pour chaque vidéo, `STORYBOOK_STYLES.includes(storybookStyleFor(id))` ; deux vidéos du même thème → même style.
  - `nextIndex(2, 8, true) === 3` et `nextIndex(8, 8, false) === 8`.
- [ ] **Step 2 : Lancer** `npm test` → échoue (`pacing.ts` absent).
- [ ] **Step 3 : Implémenter `pacing.ts`**, puis brancher `videoScene.ts` dessus : remplacer les tests
  `scene === 0..4` par `shotFor(scene, count)` ; `TRANS = PACE.transition` ; supprimer l'arrêt sur image ;
  ralentir les mouvements de caméra (durées × 2) ; ne plus dessiner `video.emoji`. Dans `DailyVideo.tsx` :
  attendre `PACE.pauseAfterLine` après la fin de chaque prise ; navigation par `nextIndex`. Films en code
  (`src/films/engine.ts`) : même pause après chaque phrase et mouvements ralentis (test dans
  `src/films/films.test.ts` : chaque plan dure au moins `PACE.minShot`).
- [ ] **Step 4 : Lancer** `npm test` → passe ; `npm run build` → OK.
- [ ] **Step 5 : Vérifier à l'œil** (skill `run`) : 3 vidéos dans le navigateur, une capture par plan ;
  aucun emoji visible, aucun plan < 3 s.
- [ ] **Step 6 : Commit** `Dessins animés au rythme lent, styles livre d'enfant, sans icônes` ; PR.

### Task 4 : Le lecteur choisit le MP4 ou le code

**Files :**
- Create : `src/videos/source.ts`, `src/videos/source.test.ts`, `src/videos/mp4-index.json` (`[]` au départ)
- Modify : `src/components/DailyVideo.tsx`, `public/sw.js` (ne jamais mettre en cache `/films-mp4/`)

**Interfaces :**
- Produces : `pickSource(id: string, online: boolean, index: readonly string[]): 'mp4' | 'code'` ;
  `mp4Url(id: string): string` → `/films-mp4/<id>.mp4`.
- Le lecteur affiche `<video>` (contrôles maison existants, sous-titres = phrase dite) si `'mp4'` ; sur
  `error` ou `offline`, il passe à la version code **à la scène en cours** (scène déduite du temps grâce aux
  repères `<id>.json` à côté du MP4 : `{ scenes: number[] }`, début de chaque phrase en secondes).

- [ ] **Step 1 : Tests** : `pickSource('a', true, ['a']) === 'mp4'` ; `pickSource('a', false, ['a']) === 'code'` ;
  `pickSource('b', true, ['a']) === 'code'` ; `sceneAt(times: number[], t: number): number` renvoie la scène
  dont le début est le dernier ≤ t ; test de `public/sw.js` : la chaîne `films-mp4` y figure dans la règle
  « réseau seulement ».
- [ ] **Step 2 : Lancer** → échoue. **Step 3 : Implémenter.** **Step 4 : Lancer** → passe ; `npm run build`.
- [ ] **Step 5 : Commit** `Le lecteur joue le film MP4 quand il existe, sinon le dessin animé` ; PR.

### Task 5 : Le gabarit de film Lemo-Opuscar et 3 films pilotes (A)

**Files :**
- Create : `video/lemo/pulse-film/` (projet Lemo : `story.js` lit `story.json`, décors et personnages par style,
  `mix.py`, `build.sh`), `scripts/lemo/make_story.ts` (écrit `story.json` d'une vidéo : titre, scènes,
  héros, décor, style, chemins des prises, durées mesurées), `scripts/lemo/render.sh <id>…` (enchaîne
  make_story → build → copie `public/films-mp4/<id>.mp4` + `<id>.json` → ajoute l'id à `mp4-index.json`),
  `scripts/lemo/qa.sh <id>` (rea-video : durée des plans, plus court plan ≥ 3 s, voix présente, pas d'emoji
  détecté).
- Lire d'abord : `C:\Users\intel\lemo-opuscar\DIRECTOR.md`, `styles/crayon-book/STYLE.md`,
  `styles/paper-popup/STYLE.md`, `styles/watercolor/STYLE.md`, et le film `C:\Users\intel\noe-le-herisson`
  (modèle de build complet, voix FR, vitesses mesurées).

**Interfaces :**
- Consumes : `scenes`, prises de la tâche 2, `storybookStyleFor` de la tâche 3, `mp4-index.json` de la tâche 4.
- Produces : `public/films-mp4/<id>.mp4`, `public/films-mp4/<id>.json` (`{ scenes: number[] }`).

- [ ] **Step 1 : Gabarit** pour 3 styles (`paper-popup`, `crayon` ↔ Lemo `crayon-book`, `watercolor`) ;
  le rythme vient de la voix (chaque plan dure prise + pause), musique douce du tier music.
- [ ] **Step 2 : Rendre 3 pilotes** (`video-animaux-01`, `video-espace-01`, `capsule-03`) avec journal
  `~/lemo/pilotes.log` et fenêtre de suivi.
- [ ] **Step 3 : Contrôle** `scripts/lemo/qa.sh` sur les 3 → tout OK ; taille ≤ 8 Mo/min.
- [ ] **Step 4 : Montrer les 3 films à l'utilisateur** et attendre sa validation avant la série.
- [ ] **Step 5 : Commit** `Films Lemo-Opuscar : gabarit et 3 pilotes` ; PR.

### Task 6 : Les films en série (A)

**Files :** les styles restants du gabarit ; `scripts/lemo/render_all.sh` (lots de 20, reprend où il s'est
arrêté, journal `~/lemo/serie.log`, fenêtre de suivi).

- [ ] **Step 1 : Compléter le gabarit** pour les 5 autres styles livre d'enfant ; 1 film d'essai par style.
- [ ] **Step 2 : Lots de 20** (≈ 4 h par lot) ; après chaque lot : `qa.sh`, taille du dépôt (`du -sh .git`)
  et taille du déploiement Vercel ; **s'arrêter et prévenir** si une limite Vercel approche.
- [ ] **Step 3 : Une PR par lot**, `npm test` vert avant chaque PR.
- [ ] **Step 4 : Les 6 films en code** (`src/films/*`) : même gabarit, voix existantes, puis PR finale.
