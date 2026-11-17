"""Petite musique douce d'un film Pulse Kids (instruments de Lemo-Opuscar) : boîte à musique et guitare nylon,
72 BPM, une mélodie pentatonique tirée de l'id de la vidéo (reproductible), tonalité selon le style.
Usage : <LIB>/.venv/Scripts/python.exe score.py <dossier du film>  → <dossier>/music/score.wav (48 kHz stéréo)"""
import json, os, sys, zlib
LIB = os.environ.get('LIB') or os.path.join(os.path.expanduser('~'), 'lemo-opuscar')
sys.path.insert(0, LIB)
import numpy as np, soundfile as sf
from core.audio import pluck as P
from core.audio.sfx import SR, add

HERE = sys.argv[1]
story = json.load(open(os.path.join(HERE, 'story.json'), encoding='utf-8'))
DUR = story['dur']; N = int((DUR + 2) * SR)
rnd = np.random.default_rng(zlib.crc32(story['id'].encode()))
# Tonalité par style : majeur doux ; les styles du soir un ton plus grave.
KEYS = {'paper-lantern': 'F', 'shadow-puppet': 'D', 'chalkboard': 'G'}
key = KEYS.get(story.get('style', ''), 'C')
NOTES = {'C': ['C', 'D', 'E', 'G', 'A'], 'D': ['D', 'E', 'F#', 'A', 'B'], 'F': ['F', 'G', 'A', 'C', 'D'], 'G': ['G', 'A', 'B', 'D', 'E']}[key]
CHORDS = {'C': [['C3', 'E3', 'G3'], ['A2', 'C3', 'E3'], ['F2', 'A2', 'C3'], ['G2', 'B2', 'D3']],
          'D': [['D3', 'F#3', 'A3'], ['B2', 'D3', 'F#3'], ['G2', 'B2', 'D3'], ['A2', 'C#3', 'E3']],
          'F': [['F2', 'A2', 'C3'], ['D3', 'F3', 'A3'], ['A#2', 'D3', 'F3'], ['C3', 'E3', 'G3']],
          'G': [['G2', 'B2', 'D3'], ['E3', 'G3', 'B3'], ['C3', 'E3', 'G3'], ['D3', 'F#3', 'A3']]}[key]
BEAT = 60 / 72; BAR = BEAT * 4
buf = np.zeros((N, 2), np.float32)
# Une phrase de 2 mesures, répétée et variée légèrement : on la reconnaît d'un film à l'autre du même style.
phrase = [(NOTES[rnd.integers(0, 5)] + str(5 if rnd.random() < .7 else 4), b) for b in [1, 1, .5, .5, 1, 2, 1, 1]]
t = 0.0; bar = 0
while t < DUR:
    ch = CHORDS[bar % 4]
    add(buf, P.strum('nylon_guitar', ch, 1.6, vel=.32, spread=.03) * .45, t, 1.0, -.2)
    add(buf, P.strum('nylon_guitar', ch, 1.6, vel=.25, spread=.03, up=True) * .35, t + 2 * BEAT, 1.0, -.2)
    t += BAR; bar += 1
t = BAR; i = 0
while t < DUR - 1:
    p, b = phrase[i % len(phrase)]
    if rnd.random() > .15:
        add(buf, P.pluck('music_box', p, None, vel=.38) * .35, t, 1.0, .25)
    t += b * BEAT; i += 1
# Fondu de fin.
f = int(2.5 * SR); end = int(DUR * SR)
buf[end - f:end] *= np.linspace(1, 0, f)[:, None]; buf[end:] = 0
os.makedirs(os.path.join(HERE, 'music'), exist_ok=True)
sf.write(os.path.join(HERE, 'music', 'score.wav'), buf / max(1e-6, np.abs(buf).max()) * .5, SR)
print('score', round(DUR, 1), 's', key)
