#!/usr/bin/env bash
# Rend les films Lemo-Opuscar des vidéos données : regroupe le gabarit (esbuild), prépare chaque film
# (make_story.ts), compose la musique, mixe, filme la page (Lemo video.mjs), assemble (mux.sh), puis copie
# public/films-mp4/<id>.mp4 + <id>.json et ajoute l'id à src/videos/mp4-index.json. Reprend où il s'est arrêté
# (un film déjà dans public/films-mp4 est sauté ; FORCE=1 pour le refaire).
# Usage (Git Bash, depuis le dépôt) : bash scripts/lemo/render.sh <id> [<id>…]   — journal : $LOG
set -euo pipefail
REPO=$(cd "$(dirname "$0")/../.." && pwd)
LIB=${LIB:-C:/Users/intel/lemo-opuscar}
WORK=${WORK:-C:/Users/intel/lemo-pulse}
PY="$LIB/.venv/Scripts/python.exe"; [ -x "$PY" ] || PY="$LIB/.venv/bin/python"
export LIB PYTHONUTF8=1
cd "$REPO"
npx esbuild video/lemo/pulse-film/entry.ts --bundle --format=esm --outfile=video/lemo/pulse-film/film.js \
  --loader:.woff2=dataurl --loader:.woff=dataurl --log-level=warning
for id in "$@"; do
  out="$REPO/public/films-mp4/$id.mp4"
  if [ -f "$out" ] && [ -z "${FORCE:-}" ]; then echo "[$(date +%T)] $id : déjà fait"; continue; fi
  d="$WORK/$id"; rm -rf "$d"; mkdir -p "$d"
  echo "[$(date +%T)] $id : préparation"
  npx tsx scripts/lemo/make_story.ts "$id" "$d"
  "$PY" "$d/score.py" "$d"
  "$PY" "$d/mix.py" "$d"
  echo "[$(date +%T)] $id : rendu des images"
  (cd "$LIB" && node core/render/video.mjs "$d" --fps 24 --workers 2 --size 1280x720 --out "$d/out/video.mp4")
  # Grain 0 : le gabarit a déjà son grain de papier. Puis H.264 standard (yuv420p) réglé pour le dessin animé.
  (cd "$LIB" && sh core/render/mux.sh "$d/out/video.mp4" "$d/out/mix.wav" "$d/out/master.mp4" 24 0)
  ffmpeg -nostdin -loglevel error -y -i "$d/out/master.mp4" -c:v libx264 -preset slow -tune animation -crf 24     -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 96k "$d/out/film.mp4"
  mkdir -p "$REPO/public/films-mp4"
  cp "$d/out/film.mp4" "$out"
  cp "$d/cues.json" "$REPO/public/films-mp4/$id.json"
  node -e "const f='src/videos/mp4-index.json',fs=require('fs');const l=JSON.parse(fs.readFileSync(f,'utf8'));if(!l.includes(process.argv[1]))l.push(process.argv[1]);fs.writeFileSync(f,JSON.stringify(l.sort(),null,1)+'\n')" "$id"
  echo "[$(date +%T)] $id : fini ($(du -h "$out" | cut -f1))"
done
