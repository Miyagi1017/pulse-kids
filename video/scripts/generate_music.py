"""Compose la petite musique de fond des vidéos (composition originale, sans droits à payer).

Un ukulélé synthétisé joue des arpèges sur 4 accords, avec une mélodie de clochettes.
Tout est calculé à partir d'une graine fixe : le fichier produit est toujours le même.
"""
import pathlib

import numpy as np
import soundfile as sf

RATE = 22050
BPM = 92
EIGHTH = 60 / BPM / 2
DURATION = 130  # plus long que la plus longue vidéo

ROOT = pathlib.Path(__file__).resolve().parent.parent
rng = np.random.default_rng(11)


def freq(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def pluck(midi, length=1.3):
    """Corde pincée : quelques harmoniques qui s'éteignent, les aiguës plus vite."""
    t = np.arange(int(length * RATE)) / RATE
    sound = np.zeros_like(t)
    for h, amp in enumerate([1.0, 0.5, 0.28, 0.14, 0.07], start=1):
        sound += amp * np.sin(2 * np.pi * freq(midi) * h * t) * np.exp(-t * (3.2 + h * 1.5))
    attack = np.minimum(1, t / 0.004)
    return sound * attack


def bell(midi, length=1.8):
    """Clochette douce."""
    t = np.arange(int(length * RATE)) / RATE
    sound = np.sin(2 * np.pi * freq(midi) * t) + 0.3 * np.sin(2 * np.pi * freq(midi) * 2.76 * t) * np.exp(-t * 6)
    return sound * np.exp(-t * 2.6) * np.minimum(1, t / 0.006)


CHORDS = [
    [48, 60, 64, 67],  # do
    [45, 60, 64, 69],  # la mineur
    [41, 60, 65, 69],  # fa
    [43, 59, 62, 67],  # sol
]
ARPEGGIO = [0, 2, 1, 3, 2, 3, 1, 2]
SCALE = [72, 74, 76, 79, 81, 84]  # pentatonique : aucune note ne sonne faux

track = np.zeros(int((DURATION + 3) * RATE))


def place(start, sound, gain):
    i = int(start * RATE)
    end = min(len(track), i + len(sound))
    track[i:end] += gain * sound[: end - i]


# Une mélodie courte, répétée avec de petites variations, reste facile à écouter en boucle.
motif = rng.integers(0, len(SCALE), 8)
beat = 0
while beat * EIGHTH < DURATION:
    bar = beat // 8
    chord = CHORDS[bar % 4]
    step = beat % 8
    place(beat * EIGHTH, pluck(chord[ARPEGGIO[step]]), 0.3)
    if step == 0:
        place(beat * EIGHTH, pluck(chord[0] - 12 if chord[0] > 45 else chord[0], 2.0), 0.3)
    if step % 2 == 0 and (bar % 8) >= 2:
        note = motif[(step // 2 + bar // 4) % 8]
        if rng.random() < 0.72:
            place(beat * EIGHTH, bell(SCALE[note]), 0.15)
    beat += 1

track = track[: int(DURATION * RATE)]
track = track / np.abs(track).max() * 0.7
(ROOT / "public").mkdir(exist_ok=True)
sf.write(ROOT / "public/music.wav", track, RATE)
print(f"public/music.wav prêt ({DURATION} s)")
