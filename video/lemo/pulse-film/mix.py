"""Mixage d'un film Pulse Kids : les prises de Christine posées à leur moment (story.json : voices),
la musique baissée sous la voix (−11 dB, transitions de 0,25 s), silence aux moments du prénom.
Usage : <LIB>/.venv/Scripts/python.exe mix.py <dossier du film>  → <dossier>/out/mix.wav"""
import json, os, subprocess, sys
import numpy as np, soundfile as sf
from scipy.ndimage import uniform_filter1d
SR = 48000
HERE = sys.argv[1]
story = json.load(open(os.path.join(HERE, 'story.json'), encoding='utf-8'))
N = int(story['dur'] * SR)
voice = np.zeros(N, np.float32)
def load(path):
    raw = subprocess.run(['ffmpeg', '-nostdin', '-loglevel', 'error', '-i', path, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32)
for v in story['voices']:
    a = load(os.path.join(HERE, v['file'])); i = int(v['at'] * SR); a = a[:max(0, N - i)]
    voice[i:i + len(a)] += a
music, sr = sf.read(os.path.join(HERE, 'music', 'score.wav'), dtype='float32')
music = music[:N] if len(music) >= N else np.pad(music, ((0, N - len(music)), (0, 0)))
active = uniform_filter1d((np.abs(voice) > 1e-3).astype(np.float32), int(.6 * SR)) > 0
duck = uniform_filter1d(np.where(active, 10 ** (-11 / 20), 1.0).astype(np.float32), int(.25 * SR))
mix = music * duck[:, None] * .55 + voice[:, None] * .9
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), np.clip(mix, -1, 1), SR)
print('mix', round(story['dur'], 1), 's,', len(story['voices']), 'prises')
