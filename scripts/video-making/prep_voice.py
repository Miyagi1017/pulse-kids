#!/usr/bin/env python3
"""Pose les prises de Christine sur la ligne de temps d'un projet Video-Making (à la place de make_voice.py).

Chaque prise commence au début de son plan (comme dans le lecteur de l'appli). Écrit, au format de Video-Making :
audio/line_NN.wav, audio/voice.wav et audio/voice_meta.json (décalages, durées, mots par minute, part de silence).
Usage : python prep_voice.py --project DIR
"""
import argparse, hashlib, json, re, subprocess
from pathlib import Path

import numpy as np
import soundfile as sf

SR = 48000


def load(path: str) -> np.ndarray:
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--project", required=True)
    a = ap.parse_args()
    root = Path(a.project)
    cfg = json.loads((root / "project.json").read_text())
    pk = cfg["pulse"]
    key = hashlib.sha256(json.dumps([cfg["lines"], pk["offsets"], pk["shots"],
                                     [Path(c).stat().st_size for c in pk["clips"]]]).encode()).hexdigest()[:16]
    meta_path = root / "audio/voice_meta.json"
    if meta_path.exists() and json.loads(meta_path.read_text()).get("key") == key and (root / "audio/voice.wav").exists():
        print("voice: up to date, skipped")
        return
    (root / "audio").mkdir(exist_ok=True)
    total = pk["duration"]
    out = np.zeros(int(round(total * SR)) + 1, np.float32)
    durs, speech = [], 0.0
    for i, (clip, off) in enumerate(zip(pk["clips"], pk["offsets"]), 1):
        x = load(clip)
        sf.write(root / f"audio/line_{i:02d}.wav", x, SR)
        s = int(round(off * SR))
        n = min(len(x), len(out) - s)
        out[s:s + n] += x[:n]
        durs.append(len(x) / SR)
        # Parole réelle : on retire les silences de début et de fin de la prise.
        loud = np.flatnonzero(np.abs(x) > 0.01)
        speech += (loud[-1] - loud[0]) / SR if len(loud) else 0
    sf.write(root / "audio/voice.wav", out, SR)
    # Même découpage que l'aligneur de Video-Making (align_words.py), pour que le taux de mots alignés soit juste.
    words = sum(1 for l in cfg["lines"] for m in re.finditer(r"[^\W_]+(?:'[^\W_]+)?", l) if re.search(r"[^\W\d_]", m.group()))
    meta = {"key": key, "engine": "christine (prises enregistrées)", "voice": "christine", "speed": 1.0,
            "lines": cfg["lines"], "line_durations": durs, "offsets": pk["offsets"], "duration": total,
            "word_count": words, "speech_duration": speech, "wpm_overall": words / total * 60,
            "wpm_speech": words / max(speech, 1e-6) * 60, "pause_fraction": 1 - speech / total}
    meta_path.write_text(json.dumps(meta, indent=2, ensure_ascii=False) + "\n")
    print(f"voice: {len(durs)} prises, {total:.2f} s, {meta['wpm_overall']:.0f} mots/min")


if __name__ == "__main__":
    main()
