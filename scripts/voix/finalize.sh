#!/usr/bin/env bash
# Étape 3 : coupe le silence de début (la fin est gardée : la dernière syllabe est souvent douce), met au même volume que les prises ElevenLabs,
# encode en mp3 mono et range : films → src/assets/films/<id>/NN.mp3, vidéos → src/assets/voix/<id>/NN.mp3.
set -euo pipefail
SRC=${1:-/tmp/claude-0/ov/conv}
DEST=$(cd "$(dirname "$0")/../.." && pwd)/src/assets
find "$SRC" -name '*.wav' | while read -r f; do
  rel=${f#"$SRC"/}; rel=${rel%.wav}
  out="$DEST/$rel.mp3"
  [ -f "$out" ] && continue
  mkdir -p "$(dirname "$out")"
  ffmpeg -nostdin -hide_banner -loglevel error -y -i "$f" \
    -af "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,apad=pad_dur=0.15,loudnorm=I=-18:TP=-2:LRA=9,afade=t=in:d=0.02" \
    -ar 22050 -ac 1 -b:a 48k "$out"
done
