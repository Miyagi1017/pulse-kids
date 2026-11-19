#!/usr/bin/env python3
"""Sous-titres SRT d'un projet Video-Making : une réplique par phrase, minutée par align/words.json,
au texte exact de project.json (règle Video-Making : jamais retapé, jamais estimé)."""
import argparse, json
from pathlib import Path


def ts(s: float) -> str:
    ms = int(round(s * 1000))
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"


ap = argparse.ArgumentParser()
ap.add_argument("--project", required=True)
ap.add_argument("--out", required=True)
a = ap.parse_args()
root = Path(a.project)
lines = json.loads((root / "project.json").read_text())["lines"]
words = json.loads((root / "align/words.json").read_text())["words"]
cues = []
for li, text in enumerate(lines, 1):
    ws = [w for w in words if w["line_index"] == li]
    if ws:
        cues.append(f"{len(cues) + 1}\n{ts(ws[0]['start'])} --> {ts(ws[-1]['end'] + 0.3)}\n{text}\n")
Path(a.out).write_text("\n".join(cues), encoding="utf-8")
