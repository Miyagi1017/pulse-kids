# Fabrique la chanson animée en deux thèmes (rose « fille », bleu « garçon »), sans réseau.
# Usage : powershell -ExecutionPolicy Bypass -File scripts/chansons/build.ps1
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

Write-Host '1/6 — voix (SAPI français)' -ForegroundColor Cyan
powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'voices.ps1')

Write-Host '2/6 — conversion des voix (44,1 kHz, timbre un peu plus clair)' -ForegroundColor Cyan
New-Item -ItemType Directory -Force (Join-Path $root 'song\audio\voice') | Out-Null
for ($i = 0; $i -lt 5; $i++) {
  ffmpeg -y -loglevel error -i (Join-Path $root "song/audio/raw/line$i.wav") `
    -af 'asetrate=22050*1.10,atempo=0.90909,aresample=44100' -ac 1 `
    (Join-Path $root "song/audio/voice/line$i.wav")
}

Write-Host '3/6 — musique et mixage (numpy)' -ForegroundColor Cyan
python (Join-Path $PSScriptRoot 'audio.py')

$themes = @('fille', 'garcon')
foreach ($theme in $themes) {
  Write-Host "4/6 — images, thème $theme (sharp)" -ForegroundColor Cyan
  node (Join-Path $PSScriptRoot 'render.mjs') "--theme=$theme"

  Write-Host "5/6 — encodage MP4, thème $theme" -ForegroundColor Cyan
  ffmpeg -y -loglevel error -framerate 30 -i (Join-Path $root "song/frames-$theme/f%05d.png") `
    -i (Join-Path $root 'song/audio/mix.wav') `
    -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p -c:a aac -b:a 160k `
    -movflags +faststart -shortest (Join-Path $root "song/nino-nina-$theme.mp4")
}

Write-Host '6/6 — publication dans public/videos/chansons' -ForegroundColor Cyan
$out = Join-Path $root 'public\videos\chansons'
New-Item -ItemType Directory -Force $out | Out-Null
foreach ($theme in $themes) {
  Copy-Item (Join-Path $root "song/nino-nina-$theme.mp4") (Join-Path $out "nino-nina-$theme.mp4") -Force
  Copy-Item (Join-Path $root "song/poster-$theme.jpg") (Join-Path $out "nino-nina-$theme.jpg") -Force
}
Copy-Item (Join-Path $root 'song/nino-nina.srt') (Join-Path $out 'nino-nina.srt') -Force

foreach ($theme in $themes) {
  $size = [math]::Round((Get-Item (Join-Path $out "nino-nina-$theme.mp4")).Length / 1MB, 2)
  Write-Host "Terminé : public/videos/chansons/nino-nina-$theme.mp4 ($size Mo)" -ForegroundColor Green
}
