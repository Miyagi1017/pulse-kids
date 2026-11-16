# Refait des prises de la banque avec OpenVoice V2 (MIT), à partir d'une voix de base neuronale.
#   1. voix de base : edge-tts « fr-FR-DeniseNeural » (plus naturelle que Piper « siwis ») ;
#   2. timbre de Christine appliqué par le convertisseur OpenVoice V2 (appris sur film-fraise/*.mp3) ;
#   3. encodage mp3 comme finalize-bank.sh, en écrasant la prise existante.
# Usage (WSL) : LINES=lines.json REPO=/mnt/c/.../pulse-kids python redo_openvoice.py [clé ...]
# lines.json = [{ "key": "banque/<fichier>", "text": "..." }] (voir bank-lines.ts).
import asyncio, glob, json, os, subprocess, sys
import torch, librosa, soundfile as sf
import edge_tts

OV = os.environ.get('OPENVOICE', os.path.expanduser('~/OpenVoice'))
WORK = os.environ.get('WORK', os.path.expanduser('~/ov'))
REPO = os.environ['REPO']
VOICE = os.environ.get('BASE_VOICE', 'fr-FR-DeniseNeural')
RATE = os.environ.get('BASE_RATE', '-8%')
TAU = float(os.environ.get('TAU', '0.3'))
sys.path.insert(0, OV)
from openvoice import utils
from openvoice.models import SynthesizerTrn
from openvoice.mel_processing import spectrogram_torch

torch.set_num_threads(4)
C = f'{WORK}/ckpt/converter/'
hps = utils.get_hparams_from_file(C + 'config.json')
model = SynthesizerTrn(len(getattr(hps, 'symbols', [])), hps.data.filter_length // 2 + 1, n_speakers=hps.data.n_speakers, **hps.model)
ck = torch.load(C + 'checkpoint.pth', map_location='cpu', weights_only=True)
model.load_state_dict(ck['model'], strict=False)
model.eval()
SR = hps.data.sampling_rate


def spec(path):
    a, _ = librosa.load(path, sr=SR)
    y = torch.FloatTensor(a).unsqueeze(0)
    return spectrogram_torch(y, hps.data.filter_length, SR, hps.data.hop_length, hps.data.win_length, center=False)


def se(paths):
    with torch.no_grad():
        return torch.stack([model.ref_enc(spec(p).transpose(1, 2)).unsqueeze(-1) for p in paths]).mean(0)


async def base(text, out):
    await edge_tts.Communicate(text.replace('’', "'"), VOICE, rate=RATE).save(out)


L = json.load(open(os.environ['LINES']))
only = sys.argv[1:]
if only:
    L = [l for l in L if l['key'] in only]
tag = VOICE.replace('-', '_')
for d in ('base', 'conv'):
    os.makedirs(f'{WORK}/{tag}/{d}/banque', exist_ok=True)

# Voix de base
for i, l in enumerate(L):
    out = f"{WORK}/{tag}/base/{l['key']}.mp3"
    if not os.path.exists(out):
        for attempt in range(3):
            try:
                asyncio.run(base(l['text'], out)); break
            except Exception as e:
                print('edge-tts retry', l['key'], e, flush=True)
    if (i + 1) % 50 == 0: print('base', i + 1, flush=True)

# Empreintes : Christine (cible) et la voix de base (source)
tgt_p, src_p = f'{WORK}/tgt_se.pt', f'{WORK}/{tag}/src_se.pt'
if not os.path.exists(tgt_p):
    torch.save(se(sorted(glob.glob(f'{REPO}/src/assets/films/film-fraise/*.mp3'))), tgt_p)
if not os.path.exists(src_p):
    torch.save(se(sorted(glob.glob(f'{WORK}/{tag}/base/banque/*.mp3'))[:40]), src_p)
tgt, src = torch.load(tgt_p), torch.load(src_p)

# Conversion + encodage
dest = f'{REPO}/public/banque'
for i, l in enumerate(L):
    wav = f"{WORK}/{tag}/conv/{l['key']}.wav"
    if not os.path.exists(wav):
        s = spec(f"{WORK}/{tag}/base/{l['key']}.mp3")
        with torch.no_grad():
            a = model.voice_conversion(s, torch.LongTensor([s.size(-1)]), sid_src=src, sid_tgt=tgt, tau=TAU)[0][0, 0].numpy()
        sf.write(wav, a, SR)
    mp3 = f"{dest}/{os.path.basename(l['key'])}.mp3"
    subprocess.run(['ffmpeg', '-nostdin', '-hide_banner', '-loglevel', 'error', '-y', '-i', wav, '-af',
                    'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,apad=pad_dur=0.12,loudnorm=I=-18:TP=-2:LRA=9,afade=t=in:d=0.02',
                    '-ar', '22050', '-ac', '1', '-b:a', '32k', mp3], check=True)
    if (i + 1) % 50 == 0: print('conv', i + 1, flush=True)
print('ok', len(L))
