# Étape 1 : voix de base française (Piper « siwis »), une prise wav par phrase.
import json, os, sys, wave
from piper import PiperVoice, SynthesisConfig
D = '/tmp/claude-0/ov/vits-piper-fr_FR-siwis-medium/'
v = PiperVoice.load(D + 'fr_FR-siwis-medium.onnx', config_path=D + 'fr_FR-siwis-medium.onnx.json')
cfg = SynthesisConfig(length_scale=1.12, noise_scale=0.6, noise_w_scale=0.8)
L = json.load(open(os.environ.get('LINES', '/tmp/claude-0/ov/gen/lines.json')))
only = sys.argv[1:]
n = 0
for l in L:
    if only and l['key'] not in only: continue
    out = f"/tmp/claude-0/ov/base/{l['key']}.wav"
    if os.path.exists(out): continue
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with wave.open(out, 'wb') as w:
        v.synthesize_wav(l['text'].replace('’', "'"), w, syn_config=cfg)
    n += 1
print('ok', n)
