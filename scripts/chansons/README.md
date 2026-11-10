# Les chansons animées — pipeline 100 % local

Ce dossier fabrique les épisodes de « chansons » de Pulse Kids **sans aucun service en ligne** :
des dessins vectoriels originaux, une musique procédurale, une voix Windows, et ffmpeg pour l'encodage.

L'épisode livré : **« Nino et Nina rangent leurs jouets »**, 24 s, 1280×720, 30 i/s, ~1,6 Mo,
en **deux versions** : rose (thèmes *fille* et *kawaii*) et bleue (thème *garçon*).

## Ce qui compose l'épisode

| Fichier | Rôle |
|---|---|
| `art.mjs` | La **bible graphique** : Nino, Nina, Mila la chatte, la chambre, le panier, les jouets. Tout est paramétrique (position, bras, tête, clignement, bouche…). Contient aussi les **palettes** rose / bleue. |
| `timeline.mjs` | Le **storyboard** : 4 plans, la caméra, les actions (Nino prend deux cubes, Nina le troisième et le canard, Mila fait rouler le ballon, les deux applaudissent), la carte de titre et le générique. `frame(t)` renvoie l'image SVG à l'instant `t`. |
| `render.mjs` | Rend les 720 images (SVG → PNG via **sharp**) pour un thème donné, écrit l'affiche et les **sous-titres SRT**. |
| `audio.py` | La **musique** (boîte à musique, accords C / Am / F / G, 100 BPM) et le **mixage** voix + musique (numpy). Écrit aussi `timings.json`, qui cale les paroles de l'app sur la voix réelle. |
| `voices.ps1` | Les 5 répliques en français avec la voix SAPI **Microsoft Hortense** (Windows), sans réseau. |
| `build.ps1` | Enchaîne tout, **pour les deux thèmes** : voix → conversion → audio → images → MP4 + affiches + SRT → copie dans `public/videos/chansons/`. |

## Prérequis

- **Node 22+** et les dépendances du projet (`npm install` : `sharp` est déjà une devDependency).
- **ffmpeg** dans le `PATH`.
- **Python 3** avec `numpy` (`pip install numpy`).
- Pour la voix : Windows avec la voix française *Microsoft Hortense* (`Add-Type -AssemblyName System.Speech`).

## Régénérer l'épisode

```powershell
powershell -ExecutionPolicy Bypass -File scripts/chansons/build.ps1
```

Sortie : `public/videos/chansons/nino-nina-fille.mp4` et `nino-nina-garcon.mp4` (plus les affiches
`.jpg`, les sous-titres `.srt` et une copie de travail dans `song/` : images intermédiaires, mix audio, timings).

Pour ne rendre qu'un thème :

```powershell
node scripts/chansons/render.mjs --theme=garcon   # puis ffmpeg sur song/frames-garcon
```

## Remplacer tout ou partie par de l'IA open source

Le pipeline est volontairement découpé pour qu'on puisse **remplacer une étape sans toucher aux autres** :

1. **Décors et personnages** : sortir `art.mjs` en planches PNG (ou générer avec **FLUX.1 / SDXL + LoRA**
   du personnage), puis les utiliser comme calques dans `timeline.mjs` (`<image href="…">`).
   La « character sheet » produite ici sert de référence pour entraîner le LoRA.
2. **Animation** : remplacer certaines scènes par des clips image→vidéo (**Wan 2.2**, **HunyuanVideo**,
   **LTX-Video**) et les assembler avec le même montage ffmpeg.
3. **Voix** : remplacer SAPI par **Piper** (léger, hors ligne) ou **XTTS-v2**.
4. **Musique** : remplacer `audio.py` par **ACE-Step** ou **MusicGen** (open weights).
5. **Lip-sync** : **LatentSync** ou **Wav2Lip** sur les plans où l'on voit la bouche.

Dans tous les cas, garder : plans courts (3–6 s), un décor unique, quatre personnages maximum,
et une relecture humaine avant publication (contenu pour enfants).

## Licences

Tout ce qui est produit ici est **original** (dessins, musique, voix) et peut être publié avec le projet.
Les modèles cités plus haut ont leurs propres licences (Apache 2.0 pour Wan, HunyuanVideo, LTX-Video, Piper ;
à vérifier pour chaque poids et chaque usage commercial).
