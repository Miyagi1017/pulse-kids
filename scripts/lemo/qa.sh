#!/usr/bin/env bash
# Contrôle d'un film Lemo-Opuscar rendu (public/films-mp4/<id>.mp4) :
#  - durée de 45 s à 1 min 15 (carton de fin compris), poids ≤ 8 Mo par minute, piste son présente ;
#  - chronologie (<id>.json) : aucun plan sous 3 s ;
#  - rea-video (découpage en plans, sur le PC, sans clé) : aucune coupe sèche ne laisse un plan de moins de 3 s
#    (hors ouverture en fondu et carton de fin).
# Usage : bash scripts/lemo/qa.sh <id> [<id>…]   → « OK <id> » ou « ÉCHEC <id> : … » ; code de sortie 1 si un échec.
set -uo pipefail
REPO=$(cd "$(dirname "$0")/../.." && pwd)
REA=${REA:-$HOME/.rea-video/bin/rea-video}
WORK=${WORK:-C:/Users/intel/lemo-pulse}
fail=0
for id in "$@"; do
  f="$REPO/public/films-mp4/$id.mp4"; j="$REPO/public/films-mp4/$id.json"; why=()
  [ -f "$f" ] || { echo "ÉCHEC $id : pas de film"; fail=1; continue; }
  dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f")
  size=$(stat -c %s "$f")
  audio=$(ffprobe -v error -select_streams a -show_entries stream=codec_type -of csv=p=0 "$f" | head -1)
  awk -v d="$dur" 'BEGIN{exit !(d>=45 && d<=75)}' || why+=("durée ${dur}s hors 45-75 s")
  awk -v s="$size" -v d="$dur" 'BEGIN{exit !(s/1048576 <= 8*d/60)}' || why+=("trop lourd ($((size/1048576)) Mo)")
  [ "$audio" = "audio" ] || why+=("pas de son")
  node -e "const c=require(process.argv[1]);const s=c.scenes;for(let i=1;i<s.length;i++)if(s[i]-s[i-1]<3)process.exit(1)" "$j" || why+=("plan de moins de 3 s dans la chronologie")
  if [ -x "$REA" ] || command -v "$REA" >/dev/null; then
    out="$WORK/$id/rea"; mkdir -p "$out"
    if PYTHONUTF8=1 "$REA" decompose "$f" -o "$out" --no-vlm --no-whole --no-ocr --no-packaging --no-stems --lang en >/dev/null 2>&1 && [ -f "$out/breakdown.json" ]; then
      # L'ouverture en fondu (début < 1 s) et le carton de fin (2,5 s) ne sont pas des plans de l'histoire.
      short=$(node -e "const b=require(process.argv[1]),d=+process.argv[2];const sh=(b.shots||[]).map(s=>[s.start??s.t0,s.end??s.t1]).filter(([a,e])=>a>=1&&a<d-3.2).map(([a,e])=>e-a);console.log(sh.length?Math.min(...sh).toFixed(2):'')" "$out/breakdown.json" "$dur")
      [ -n "$short" ] && { awk -v s="$short" 'BEGIN{exit !(s>=3)}' || why+=("plan détecté de ${short}s (rea-video)"); }
    else echo "  ($id : rea-video n'a pas pu découper le film, contrôle des plans sur la chronologie seulement)"; fi
  fi
  if [ ${#why[@]} -eq 0 ]; then echo "OK $id ($(printf %.0f "$dur") s, $((size/1024)) Ko)"; else echo "ÉCHEC $id : ${why[*]}"; fail=1; fi
done
exit $fail
