"""
Bande-son de « Nino range ses jouets » — 100 % locale et open source.

- musique : boîte à musique procédurale (numpy), accords C / Am / F / G, 100 BPM ;
- voix : fichiers WAV produits par SAPI (voir voices.ps1), déjà rééchantillonnés à 44,1 kHz ;
- mixage : musique douce + voix, petite réverbération, normalisation ;
- sortie : song/audio/mix.wav + song/audio/timings.json (début et durée réels de chaque ligne).
"""
from __future__ import annotations

import json
import wave
from pathlib import Path

import numpy as np

SR = 44100
DUR = 24.0
N = int(SR * DUR)
HERE = Path(__file__).resolve().parent.parent.parent  # pk-work
AUDIO = HERE / "song" / "audio"
rng = np.random.default_rng(20261109)


def midi(m: int) -> float:
    return 440.0 * 2 ** ((m - 69) / 12)


def bell(f: float, dur: float = 1.5, amp: float = 1.0) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    env = np.exp(-t * 3.6) * np.minimum(1.0, t / 0.004)
    sig = (
        np.sin(2 * np.pi * f * t)
        + 0.30 * np.sin(2 * np.pi * 2.01 * f * t) * np.exp(-t * 2.0)
        + 0.09 * np.sin(2 * np.pi * 3.03 * f * t) * np.exp(-t * 3.2)
    )
    return amp * env * sig


def bass(f: float, dur: float = 1.0, amp: float = 0.5) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    env = np.exp(-t * 2.4) * np.minimum(1.0, t / 0.012)
    return amp * env * (np.sin(2 * np.pi * f * t) + 0.18 * np.sin(2 * np.pi * 2 * f * t))


def shaker(dur: float = 0.1, amp: float = 0.07) -> np.ndarray:
    n = int(dur * SR)
    noise = rng.standard_normal(n)
    noise = np.diff(noise, prepend=0.0)
    env = np.exp(-np.arange(n) / n * 7.0)
    return amp * noise * env


def add(track: np.ndarray, sig: np.ndarray, start: float, pan: float = 0.0) -> None:
    """Ajoute un signal dans une piste stéréo (N, 2) à l'instant donné, avec panoramique."""
    i = int(start * SR)
    if i >= len(track):
        return
    n = min(len(sig), len(track) - i)
    left = np.sqrt((1 - pan) / 2)
    right = np.sqrt((1 + pan) / 2)
    track[i : i + n, 0] += sig[:n] * left * 1.41
    track[i : i + n, 1] += sig[:n] * right * 1.41


def build_music() -> np.ndarray:
    track = np.zeros((N, 2), dtype=np.float64)
    bpm = 100.0
    beat = 60.0 / bpm
    bar = 4 * beat

    # C / Am / F / G, une mesure chacun, puis C pour finir.
    prog = [
        (48, [60, 64, 67]),
        (45, [57, 60, 64]),
        (41, [53, 57, 60]),
        (43, [55, 59, 62]),
        (48, [60, 64, 67]),
        (45, [57, 60, 64]),
        (41, [53, 57, 60]),
        (43, [55, 59, 62]),
        (48, [60, 64, 67]),
        (48, [60, 64, 67]),
    ]
    pattern = [0, 1, 2, 3, 2, 1, 2, 1]

    for b, (root, chord) in enumerate(prog):
        t0 = b * bar
        if t0 >= DUR:
            break
        # basse : temps 1 et 3
        add(track, bass(midi(root - 12)), t0, 0.0)
        add(track, bass(midi(root - 12), amp=0.32), t0 + 2 * beat, 0.0)

        # arpège de boîte à musique, croches
        for k, pat in enumerate(pattern):
            start = t0 + k * (beat / 2)
            if start >= DUR:
                break
            note = chord[pat % len(chord)]
            if pat == 3:
                note += 12
            amp = 0.24 if k % 4 == 0 else 0.18
            if b == 0 and k < 4:
                amp *= 0.55  # intro plus douce
            if b == 9:
                amp *= 0.8
            pan = -0.25 if k % 2 == 0 else 0.25
            add(track, bell(midi(note + 12), amp=amp), start, pan)

        # shaker sur les contretemps
        for k in range(2):
            add(track, shaker(), t0 + beat * (0.5 + k), 0.35 if k else -0.35)

    # petite fusée de notes quand la chambre est rangée
    for k, note in enumerate([72, 76, 79, 84]):
        add(track, bell(midi(note), amp=0.14, dur=1.2), 17.4 + k * 0.12, -0.3 + k * 0.2)

    # fin : accord tenu et fondu
    for k, note in enumerate([60, 64, 67, 72]):
        add(track, bell(midi(note), amp=0.20, dur=3.2), 21.0 + k * 0.06, 0.0)

    fade_start = int(22.6 * SR)
    track[fade_start:] *= np.linspace(1, 0, N - fade_start)[:, None]
    return track


def read_wav(path: Path) -> np.ndarray:
    with wave.open(str(path), "rb") as w:
        assert w.getsampwidth() == 2, "WAV 16 bits attendu"
        channels = w.getnchannels()
        frames = w.readframes(w.getnframes())
        data = np.frombuffer(frames, dtype="<i2").astype(np.float64) / 32768.0
        if channels > 1:
            data = data.reshape(-1, channels).mean(axis=1)
        return data


def reverb(x: np.ndarray, amount: float = 0.16) -> np.ndarray:
    """Réverbération minimaliste : quelques échos filtrés (suffisant pour une comptine)."""
    out = x.copy()
    for delay, gain in [(0.11, 0.30), (0.19, 0.20), (0.29, 0.13)]:
        d = int(delay * SR)
        out[d:] += gain * x[:-d]
    # léger passe-bas pour adoucir les échos (canal par canal)
    k = np.ones(24) / 24
    for ch in range(out.shape[1]):
        out[:, ch] = np.convolve(out[:, ch], k, mode="same")
    return out * (1 + amount) + x * 0.6


def main() -> None:
    music = build_music()
    music = reverb(music, 0.12)

    lines = sorted((AUDIO / "voice").glob("line*.wav"))
    if len(lines) != 5:
        raise SystemExit(f"5 lignes de voix attendues, {len(lines)} trouvées")
    voices = [read_wav(p) for p in lines]

    planned = [0.9, 4.9, 8.9, 12.9, 19.3]
    timings = []
    cursor = 0.0
    for i, v in enumerate(voices):
        dur = len(v) / SR
        start = max(planned[i], cursor + 0.12)
        cursor = start + dur
        timings.append({"start": round(start, 3), "duration": round(dur, 3)})
        print(f"ligne {i} : {start:5.2f} s -> {dur:4.2f} s")

    # si la dernière ligne débordait, on la décale un peu plus tôt au besoin
    if timings[4]["start"] + timings[4]["duration"] > 23.6:
        shift = 23.6 - (timings[4]["start"] + timings[4]["duration"])
        for i in range(4, 5):
            timings[i]["start"] = round(timings[i]["start"] + shift, 3)

    vocal = np.zeros((N, 2), dtype=np.float64)
    for t, v in zip(timings, voices):
        add(vocal, v * 0.95, t["start"], 0.0)

    mix = music * 0.34 + vocal
    # limiteur doux
    mix = np.tanh(mix * 1.05)
    peak = np.max(np.abs(mix))
    if peak > 0.92:
        mix *= 0.92 / peak

    out = AUDIO / "mix.wav"
    pcm = (np.clip(mix, -1, 1) * 32767).astype("<i2")
    with wave.open(str(out), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())

    (AUDIO / "timings.json").write_text(json.dumps(timings, indent=2), encoding="utf-8")
    print(f"écrit : {out} ({out.stat().st_size / 1024:.0f} Ko)")


if __name__ == "__main__":
    main()
