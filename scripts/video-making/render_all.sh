#!/usr/bin/env bash
# render_all.sh <dossier des projets> [filtre] : rend les dessins animés avec le pipeline de Video-Making, un à la fois.
#   voix de Christine -> alignement MMS_FA -> musique, sons et -14 LUFS -> images témoins -> rendu par parties
#   -> contrôle des sous-titres -> contrôle final ; le MP4 validé est copié dans video/out-video-making/.
# Reprise sûre : chaque étape se saute si rien n'a changé ; une vidéo déjà validée n'est pas refaite.
set -uo pipefail
PACK="${VSP_PACK:-$HOME/Video-Making}"
PY="$(cat "$PACK/.vsp-state/python" 2>/dev/null || echo python3)"
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="${1:?usage: render_all.sh <dossier des projets> [filtre]}"
FILTER="${2:-}"
OUT="$(cd "$HERE/../.." && pwd)/video/out-video-making"
mkdir -p "$OUT"
export VSP_CACHE="${VSP_CACHE:-$HOME/.cache/video-skill-pack}" TORCH_HOME="${TORCH_HOME:-$HOME/.cache/video-skill-pack/torch}"
LOG="$ROOT/render_all.log"
ok=0; failed=()
for P in "$ROOT"/*/; do
  P="${P%/}"; id="$(basename "$P")"
  [[ "$id" == _* || "$id" != *"$FILTER"* || ! -f "$P/project.json" ]] && continue
  if [[ -f "$OUT/$id.mp4" && -f "$P/out/qc/qc_final.json" ]] && grep -q '"overall": "PASS"' "$P/out/qc/qc_final.json"; then ok=$((ok+1)); continue; fi
  echo "== $(date +%T) $id" | tee -a "$LOG"
  if "$PY" "$HERE/prep_voice.py" --project "$P" >>"$LOG" 2>&1 \
    && "$PY" "$PACK/scripts/align_words.py" --project "$P" >>"$LOG" 2>&1 \
    && "$PY" "$PACK/scripts/make_audio.py" --project "$P" >>"$LOG" 2>&1 \
    && node "$PACK/scripts/stills.mjs" --project "$P" --n 10 --scan >>"$LOG" 2>&1 \
    && node "$PACK/scripts/render.mjs" --project "$P" >>"$LOG" 2>&1 \
    && node "$PACK/scripts/subtitle_qc.mjs" --project "$P" >>"$LOG" 2>&1 \
    && "$PY" "$PACK/scripts/qc_final.py" --project "$P" >>"$LOG" 2>&1; then
    cp "$P/out/$id.mp4" "$OUT/$id.mp4"
    # Sous-titres pour YouTube : un bloc par phrase, minuté par l'alignement.
    "$PY" "$HERE/srt.py" --project "$P" --out "$OUT/$id.srt" >>"$LOG" 2>&1
    rm -rf "$P/out/parts"   # parties vérifiées et assemblées : on libère la place
    ok=$((ok+1)); echo "   PASS" | tee -a "$LOG"
  else
    failed+=("$id"); echo "   FAIL (voir $LOG)" | tee -a "$LOG"
  fi
done
echo "terminé : $ok validée(s), ${#failed[@]} en échec ${failed[*]:-}" | tee -a "$LOG"
