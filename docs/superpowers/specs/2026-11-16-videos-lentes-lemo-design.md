# Toutes les vidéos de Pulse Kids, plus lentes, en styles « livre d'enfant » (A + B)

Date : 2026-11-16. Statut : à approuver.

## Intention

Les vidéos de l'app vont trop vite pour des enfants de 5 à 8 ans : 16 s de voix en médiane par vidéo
(titre + 4 phrases). L'utilisateur veut **tout** le contenu vidéo de l'app refait : plus lent, adapté aux
enfants, dans les styles de la bibliothèque Lemo-Opuscar, avec la voix de Christine (OpenVoice, PR #14),
de meilleures histoires, en se servant des outils vidéo du PC, et une fenêtre de terminal pour suivre chaque
chantier.

## Périmètre

- 50 vidéos du jour (`src/data/videos.ts`) + 66 dessins animés (`src/videos/capsules.ts`) = 116 vidéos.
- 6 films en code (`src/films/*`, hors « La Grosse Fraise Rouge » pour la voix, qui reste la prise ElevenLabs ;
  son image est refaite comme les autres).
- **Hors périmètre** (confirmé par l'utilisateur) : les contes, contes du soir et classiques ; l'interface
  (menus, jeux, activités).

## Objectifs

1. **Rythme lent** : 45 s à 1 min par vidéo. Une idée par plan, plans de 5 à 8 s, pause de 0,8 à 1,2 s après
   chaque phrase, mouvements doux (aucune coupe sous 3 s, pas de transitions « whip »), lecture du texte à l'écran
   possible pour un enfant qui apprend à lire.
2. **Meilleures histoires** : chaque vidéo passe de 4 phrases à 6 à 8 phrases, avec un vrai petit arc
   (un héros, un problème, un essai, une réussite, une question à l'enfant). Mêmes sujets et mêmes héros
   qu'aujourd'hui, pour que les quiz (`videoQuiz.ts`) restent justes.
3. **Styles « livre d'enfant »** inspirés de Lemo : crayon-book, paper-popup, watercolor, isometric-picture-book,
   papercut, shadow-puppet, rubber-hose, midcentury-toon, ink-wash (doux), urban-sketch. Un style par famille de
   sujets, pour qu'une suite de vidéos reste reconnaissable.
4. **Voix** : toutes les nouvelles phrases dites par Christine via `scripts/voix/redo_openvoice.py`.
   **La voix dit le prénom** (demande de l'utilisateur, 2026-11-17) : banque des ≈ 2 000 prénoms les plus donnés
   en France (fichier public INSEE) dite par Christine ; une phrase avec `{p}` est enregistrée en morceaux autour du
   prénom et jouée à la suite ; prénom absent de la banque → voix du navigateur pour le prénom seul ; dans les MP4,
   un silence à la place du prénom, que le lecteur remplit au bon moment. Vaut partout où l'app dit `{p}`.
5. **Deux versions de chaque vidéo** :
   - **B, en code dans l'app** (léger, hors ligne) : moteur `src/videos/videoScene.ts` refait au rythme lent ;
   - **A, film MP4 Lemo-Opuscar** : vrai film rendu sur le PC.
   Le lecteur joue le MP4 s'il existe et si l'appareil est en ligne, sinon la version en code.

## Anti-objectifs

- **Trop d'icônes** (demande de l'utilisateur) : pas d'emojis ni de pictogrammes plaqués à l'écran, ni dans les
  vidéos B ni dans les films A ; les objets sont dessinés dans le style de la scène, et le texte à l'écran se
  limite à la phrase dite. Les emojis des fichiers de données (`miniDefis.ts`, titres) ne sont pas affichés
  dans les vidéos.
- Une vidéo qui « clignote » ou coupe vite : échec, même si elle est belle.
- Des quiz qui ne correspondent plus à la vidéo.
- Une app qui ne marche plus hors ligne.
- Des publicités ou suggestions externes (YouTube exclu).

## Contraintes

- PC : Intel HD Graphics 520, 4 cœurs. Lemo paper-popup ≈ 0,25 s par image ; film de 3 min ≈ 35 min avec le montage.
  → 122 films d'environ 1 min ≈ 25 h de rendu, en plusieurs nuits, reprise possible.
- **MP4 dans le dépôt** (choix de l'utilisateur) : 720p, H.264, ≈ 4 à 8 Mo par minute → ≈ 0,6 à 1 Go en plus
  (dépôt actuel : 176 Mo). Fichiers dans `public/films-mp4/<id>.mp4` (servis par Vercel, `media-src 'self'`
  déjà autorisé). Le service worker **ne** met **pas** les MP4 en cache (trop lourds) : hors ligne = version B.
- Vercel : surveiller la taille du déploiement à chaque lot ; si une limite est atteinte, s'arrêter et revenir
  vers l'utilisateur (pas de bascule silencieuse vers un stockage externe).
- PR #12 (Video-Making) touchait le même moteur : fermée le 2026-11-16 avec l'accord de l'utilisateur
  (branche `videos-video-making` conservée, ses idées de calage voix/plan peuvent être reprises dans B).

## Approches envisagées

- **A seul** (tout en MP4 Lemo) : qualité maximale, mais app lourde et rien hors ligne.
- **B seul** (moteur en code refait) : léger et rapide à livrer, rendu moins riche.
- **C** (B pour tout + 4 à 6 courts-métrages A) : recommandée par Claude.
- **Choix de l'utilisateur : A et B pour tout.** B donne tout de suite le catalogue lent ; A arrive par lots et
  remplace B quand le MP4 est prêt.

## Outils

| Outil | Rôle | Statut |
|---|---|---|
| drama-skills (`short-drama-*`) | réécrire les histoires (arc, dialogue), relecture « moins de modèle » | installé |
| Lemo-Opuscar | rendu des films A | installé (`~/lemo-opuscar`) |
| OpenVoice V2 | voix de Christine | installé (WSL `~/openvoice-venv`) |
| openfilm | montage et titres des films A (film.html) | installé |
| rea-video | contrôle qualité : rythme, durée des plans, sous-titres | installé |
| video-shotcraft | non utilisé (fait pour des démos produit) | — |
| dramaclaw, printfilm | vidéo par IA générative, applis Docker avec clés payantes (OpenAI / ARK) | **non utilisés** : pas de clé (décision de l'utilisateur) |

Tout est donc fait en code, sur le PC, sans service payant (seule la voix de base edge-tts passe par Internet).

## Déroulé (par lots, chacun avec sa fenêtre de suivi)

1. **Histoires** : réécriture des 116 vidéos + 6 films (drama-skills), fichier `src/data/videos.ts` /
   `capsules.ts` étendus de 4 à 6-8 scènes ; quiz vérifiés. Validation par l'utilisateur sur un échantillon de 5.
2. **Voix** : nouvelles phrases → OpenVoice (≈ 800 phrases, ≈ 1 h).
3. **B** : moteur lent + styles livre d'enfant dans `videoScene.ts` ; tests ; PR.
4. **A pilote** : 3 films Lemo (un par style principal) ; contrôle rea-video ; validation par l'utilisateur.
5. **A en série** : lots de 20 films par nuit, une PR par lot (taille du dépôt et de Vercel vérifiées).

## Laissé au constructeur

Choix exact du style par famille de sujets, durées précises des plans, palette et typographie de chaque style,
format des fichiers d'histoire, découpage des PR.
