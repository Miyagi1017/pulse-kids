# Les voix de Pulse Kids

Les narrations des films, des 50 vidéos du jour et des 66 dessins animés sont dites avec la voix de Christine.

- **La Grosse Fraise Rouge** : la prise ElevenLabs d'origine, découpée en 6 phrases (`npm run films:voice`).
- **Tout le reste** : le timbre de Christine est prolongé avec [OpenVoice V2](https://github.com/myshell-ai/OpenVoice) (MIT).
  1. `lines.ts` liste toutes les phrases (sans le prénom, qui reste affiché à l'écran) :
     `npx tsx scripts/voix/lines.ts > lines.json`
  2. `base_tts.py` les dit avec la voix française Piper « siwis » (CC BY 4.0) : `pip install piper-tts`.
  3. `convert.py` applique le timbre de Christine, appris sur sa prise de référence (`src/assets/films/film-fraise/*.mp3`),
     avec le convertisseur OpenVoice V2 (`checkpoints_v2/converter`), chargé en mode `weights_only`.
  4. `finalize.sh` coupe les silences, met au volume des prises ElevenLabs et range les mp3 :
     films → `src/assets/films/<id>/NN.mp3`, vidéos → `src/assets/voix/<id>/NN.mp3` (NN = n° de scène, 00 = titre).

Une phrase sans prise est dite par la voix du navigateur. Pour remplacer une prise par une vraie prise ElevenLabs,
il suffit d'écraser le mp3 correspondant.

**Refaire des prises de la banque** (ex. les 335 phrases des mini-défis) : `redo_openvoice.py` dit chaque phrase avec la voix
neuronale edge-tts « fr-FR-DeniseNeural », lui applique le timbre de Christine avec OpenVoice V2 et écrase le mp3 de `public/banque/`.
`LINES=lignes.json REPO=<dépôt> python redo_openvoice.py` (réglages : `TAU`, `BASE_RATE`, `BASE_VOICE`).

**Toutes les voix de l'app** (banque, films, vidéos ; sauf La Grosse Fraise Rouge, prise de référence) :
`npx tsx scripts/voix/bank-lines.ts > bank.json && npx tsx scripts/voix/all-lines.ts bank.json > lines.json`, puis
`LINES=lines.json REPO=<dépôt> python redo_openvoice.py` dans WSL (7 492 phrases ≈ 6 h 30 sur ce PC, reprend où il s'est arrêté).
