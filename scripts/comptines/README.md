# Les 100 comptines animées — pipeline 100 % local

Les comptines réutilisent les dessins de la chanson vidéo (`scripts/chansons/art.mjs` : Nino, Nina, Mila),
mais **l'animation est dessinée en direct dans le navigateur** : seule la bande-son (voix + musique) est
un fichier, ~150 Ko par comptine (15 Mo pour les 100), au lieu de 200 vidéos MP4 (~300 Mo).

| Fichier | Rôle |
|---|---|
| `src/data/comptines.ts` | Les **paroles** (4 lignes + cri final), le décor, les objets, un geste par ligne, la phrase à retenir. |
| `src/comptines/decor.ts` | 8 **décors** (chambre, jardin, plage, nuit, neige, forêt, cuisine, ville) et 25 **objets** animés. |
| `src/comptines/stage.ts` | La **mise en scène générique** : titre, entrée des enfants, gestes, objets, caméra, karaoké, fin. `comptineFrame(c, timing, t, palette)` renvoie le SVG de l'instant `t`. |
| `src/comptines/ComptineStage.tsx` | Redessine la scène à chaque image en lisant l'heure de l'audio (toujours synchronisé). |
| `scripts/comptines/voices.ps1` | Les 500 lignes lues par la voix SAPI **Microsoft Hortense** (Windows, sans réseau). |
| `scripts/comptines/build.ts` | Conversion des voix, **musique procédurale** (boîte à musique, marimba ou ukulélé ; tempo, tonalité et accords tirés de l'identifiant ; plus lente et douce pour les comptines du soir), mixage, encodage AAC → `public/comptines/<id>.m4a`, horaires réels → `src/data/comptinesTimings.json`. |
| `scripts/comptines/preview.ts` | Planche PNG de contrôle (7 images) pour une comptine. |

## Régénérer

```powershell
npx tsx scripts/comptines/build.ts            # les 100 (les voix déjà faites sont gardées dans song/comptines/)
npx tsx scripts/comptines/build.ts lapin      # seulement les comptines dont l'id contient « lapin »
```

Prérequis : Windows (voix Hortense), **ffmpeg** dans le `PATH`, Node 22+. Après avoir changé une ligne,
supprimer ses fichiers `song/comptines/raw/<id>-*.wav` et `voice/<id>-*.wav` pour refaire la voix.

Ajouter une comptine : une ligne `c(...)` dans `src/data/comptines.ts`, puis `build.ts <motif>` ; le test
`src/data/extensions.test.ts` vérifie paroles, objets, décor, horaires, bande-son et images.
