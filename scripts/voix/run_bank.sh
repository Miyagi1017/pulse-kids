#!/usr/bin/env bash
# Enchaîne les priorités 1, 2, 3 : voix de base puis timbre de Christine (reprend où il s'est arrêté).
cd /tmp/claude-0/ov/gen
for p in 1 2 3; do
  LINES=/tmp/claude-0/ov/gen/bank$p.json python3 base_tts.py > /dev/null 2>&1
  echo "base $p faite $(date +%T)"
  LINES=/tmp/claude-0/ov/gen/bank$p.json python3 convert.py 2>&1 | grep -E "^ok"
  echo "priorité $p faite $(date +%T)"
done
