#!/usr/bin/env python3
"""Minutage mot à mot des prises de Christine (50 vidéos + 66 dessins animés).

Méthode Video-Making (scripts/align_words.py) : alignement forcé MMS_FA (torchaudio), jamais d'estimation
par la longueur des mots. Les poids MMS_FA sont sous licence CC-BY-NC 4.0 (usage non commercial).

Entrée : la liste JSON de scripts/voix/lines.ts (texte exact de chaque prise).
Sortie : src/videos/timing.json = { "<id>": [ { "d": durée, "w": [[début, fin] | null, ...] }, ... ] }
  une entrée par scène, une paire par mot séparé par des espaces (null : signe sans lettre, « … »).

Usage (dans WSL, avec le Python de Video-Making) :
  npx tsx scripts/voix/lines.ts > /tmp/lines.json
  ~/Video-Making/.venv/bin/python scripts/voix/align_videos.py /tmp/lines.json
"""
import json, os, re, subprocess, sys, unicodedata
from pathlib import Path

os.environ.setdefault("TORCH_HOME", str(Path.home() / ".cache/video-skill-pack/torch"))
import numpy as np
import torch, torchaudio

ROOT = Path(__file__).resolve().parents[2]
SR = 16000


def norm(w: str) -> str:
    w = unicodedata.normalize("NFKD", w).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z]", "", w)


def load(path: Path) -> np.ndarray:
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


def main():
    lines = [x for x in json.loads(Path(sys.argv[1]).read_text(encoding="utf-8-sig")) if x["key"].startswith("voix/")]
    torch.set_num_threads(max(1, min(4, os.cpu_count() or 1)))
    bundle = torchaudio.pipelines.MMS_FA
    model = bundle.get_model().to("cpu")
    tokenizer, aligner = bundle.get_tokenizer(), bundle.get_aligner()
    out: dict[str, list] = {}
    total = matched = 0
    weak = []
    for n, item in enumerate(lines, 1):
        _, vid, scene = item["key"].split("/")
        audio = load(ROOT / "src/assets" / f"{item['key']}.mp3")
        words = item["text"].split()
        # Chaque mot affiché peut contenir plusieurs morceaux à aligner (« l’éléphant » → l, elephant).
        parts = [[norm(p) for p in re.findall(r"[^\W_]+", w) if norm(p)] for w in words]
        flat = [p for ps in parts for p in ps]
        with torch.inference_mode():
            emission, _ = model(torch.from_numpy(audio).unsqueeze(0))
        emission = emission[0]
        spans = aligner(emission, tokenizer(flat))
        step = len(audio) / SR / emission.shape[0]
        timed, k = [], 0
        for ps in parts:
            if not ps:
                timed.append(None)
                continue
            ss = spans[k: k + len(ps)]
            k += len(ps)
            score = float(np.mean([s.score for sp in ss for s in sp]))
            if score < 0.2:
                weak.append((item["key"], " ".join(ps), round(score, 2)))
            timed.append([round(ss[0][0].start * step, 3), round(ss[-1][-1].end * step, 3)])
        total += len(parts)
        matched += sum(1 for t in timed if t)
        starts = [t[0] for t in timed if t]
        assert starts == sorted(starts), f"{item['key']}: débuts de mots non croissants"
        out.setdefault(vid, []).append({"i": int(scene), "d": round(len(audio) / SR, 3), "w": timed})
        if n % 50 == 0:
            print(f"{n}/{len(lines)} prises", flush=True)
    for vid in out:
        out[vid] = [{"d": s["d"], "w": s["w"]} for s in sorted(out[vid], key=lambda s: s["i"])]
    dest = ROOT / "src/videos/timing.json"
    dest.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"{len(lines)} prises, {matched}/{total} mots minutés, {len(weak)} mots peu sûrs (score < 0,2)")
    for w in weak[:20]:
        print("  peu sûr :", *w)


if __name__ == "__main__":
    main()
