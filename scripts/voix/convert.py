# Étape 2 : OpenVoice V2 (MIT) — le timbre de la voix de Christine (prise ElevenLabs de référence)
# est appliqué à chaque prise de base. Code repris de openvoice/api.py (ToneColorConverter),
# poids chargés en mode « données seulement » (weights_only=True).
import glob, json, os, sys, torch, librosa, soundfile as sf
sys.path.insert(0, '/home/claude/myshell-ai/OpenVoice')
from openvoice import utils
from openvoice.models import SynthesizerTrn
from openvoice.mel_processing import spectrogram_torch
torch.set_num_threads(2)
C = '/tmp/claude-0/ov/ckpt/converter/'
hps = utils.get_hparams_from_file(C + 'config.json')
model = SynthesizerTrn(len(getattr(hps, 'symbols', [])), hps.data.filter_length // 2 + 1, n_speakers=hps.data.n_speakers, **hps.model)
ck = torch.load(C + 'checkpoint.pth', map_location='cpu', weights_only=True)
print(model.load_state_dict(ck['model'], strict=False))
model.eval()
SR = hps.data.sampling_rate

def spec(path):
    a, _ = librosa.load(path, sr=SR)
    y = torch.FloatTensor(a).unsqueeze(0)
    return spectrogram_torch(y, hps.data.filter_length, SR, hps.data.hop_length, hps.data.win_length, center=False)

def se(paths):
    with torch.no_grad():
        return torch.stack([model.ref_enc(spec(p).transpose(1, 2)).unsqueeze(-1) for p in paths]).mean(0)

if not os.path.exists('/tmp/claude-0/ov/tgt_se.pt'):
    tgt = se(sorted(glob.glob('/home/claude/pulse-kids/src/assets/films/film-fraise/*.mp3')))
    src = se(sorted(glob.glob('/tmp/claude-0/ov/base/voix/video-*/0[1-4].wav'))[:40])
    torch.save(tgt, '/tmp/claude-0/ov/tgt_se.pt'); torch.save(src, '/tmp/claude-0/ov/src_se.pt')
tgt = torch.load('/tmp/claude-0/ov/tgt_se.pt'); src = torch.load('/tmp/claude-0/ov/src_se.pt')
tau = float(os.environ.get('TAU', '0.3'))
L = json.load(open('/tmp/claude-0/ov/gen/lines.json'))
only = sys.argv[1:]
n = 0
for l in L:
    if only and l['key'] not in only: continue
    out = f"/tmp/claude-0/ov/conv/{l['key']}.wav"
    if os.path.exists(out): continue
    os.makedirs(os.path.dirname(out), exist_ok=True)
    s = spec(f"/tmp/claude-0/ov/base/{l['key']}.wav")
    with torch.no_grad():
        a = model.voice_conversion(s, torch.LongTensor([s.size(-1)]), sid_src=src, sid_tgt=tgt, tau=tau)[0][0, 0].numpy()
    sf.write(out, a, SR)
    n += 1
    if n % 25 == 0: print(n, flush=True)
print('ok', n)
