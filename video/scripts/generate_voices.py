"""Génère la voix off française des vidéos avec Kokoro (local, sans service en ligne).

Lit .tts/lines.json, écrit public/voice/<code>.wav et src/voices.json (durées en secondes).
Les phrases déjà générées sont conservées : on peut interrompre et relancer.
"""
import json
import pathlib
import sys

import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = pathlib.Path(__file__).resolve().parent.parent
VOICE = "ff_siwis"
SPEED = 0.9  # un peu plus lent, pour des enfants de 5 ans

lines = json.loads((ROOT / ".tts/lines.json").read_text(encoding="utf-8"))
out = ROOT / "public/voice"
out.mkdir(parents=True, exist_ok=True)
manifest_path = ROOT / "src/voices.json"
manifest = json.loads(manifest_path.read_text(encoding="utf-8"))

kokoro = Kokoro(str(ROOT / ".tts/kokoro-v1.0.int8.onnx"), str(ROOT / ".tts/voices-v1.0.bin"))

todo = [(k, t) for k, t in lines.items() if not (k in manifest and (out / f"{k}.wav").exists())]
print(f"{len(todo)} phrases à générer sur {len(lines)}", flush=True)
for i, (key, text) in enumerate(todo, 1):
    samples, rate = kokoro.create(text.replace("’", "'"), voice=VOICE, speed=SPEED, lang="fr-fr")
    sf.write(out / f"{key}.wav", samples, rate)
    manifest[key] = round(len(samples) / rate, 3)
    if i % 10 == 0 or i == len(todo):
        manifest_path.write_text(json.dumps(manifest, indent=0, sort_keys=True) + "\n", encoding="utf-8")
        print(f"{i}/{len(todo)}", flush=True)

manifest_path.write_text(json.dumps(manifest, indent=0, sort_keys=True) + "\n", encoding="utf-8")
print("Terminé", flush=True)
sys.exit(0)
