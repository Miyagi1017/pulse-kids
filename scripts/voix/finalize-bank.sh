#!/usr/bin/env bash
# Banque de phrases : encode chaque prise convertie en mp3 (32 kb/s mono, assez pour la voix),
# la range dans public/banque/<fichier>.mp3 et réécrit public/banque/index.json (liste des prises prêtes).
set -euo pipefail
SRC=${1:-/tmp/claude-0/ov/conv/banque}
ROOT=$(cd "$(dirname "$0")/../.." && pwd)
DEST=$ROOT/public/banque
mkdir -p "$DEST"
find "$SRC" -name '*.wav' -mmin +0.2 | while read -r f; do
  id=$(basename "$f" .wav)
  out="$DEST/$id.mp3"
  [ -f "$out" ] && continue
  ffmpeg -nostdin -hide_banner -loglevel error -y -i "$f" \
    -af "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,apad=pad_dur=0.12,loudnorm=I=-18:TP=-2:LRA=9,afade=t=in:d=0.02" \
    -ar 22050 -ac 1 -b:a 32k "$out"
done
(cd "$DEST" && ls *.mp3 2>/dev/null | sed 's/\.mp3$//' | python3 -c 'import sys,json; print(json.dumps(sorted(l.strip() for l in sys.stdin if l.strip())))' > index.json)
echo "$(python3 -c "import json;print(len(json.load(open('$DEST/index.json'))))") prises dans la banque"
