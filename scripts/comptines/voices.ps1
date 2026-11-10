# Voix des comptines — 100 % local (SAPI5 « Microsoft Hortense », fr-FR).
# Lit song/comptines/lines.json ([{ file, text }]) et écrit un WAV par ligne (les fichiers déjà faits sont gardés).
# À lancer avec un accès complet (la synthèse vocale Windows est bloquée en bac à sable).
param([string]$Json)
Add-Type -AssemblyName System.Speech
$items = Get-Content -Raw -Encoding UTF8 $Json | ConvertFrom-Json

$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.SelectVoice('Microsoft Hortense Desktop')
$synth.Rate = -1
$made = 0
foreach ($it in $items) {
  if (Test-Path $it.file) { continue }
  New-Item -ItemType Directory -Force (Split-Path -Parent $it.file) | Out-Null
  $escaped = [System.Security.SecurityElement]::Escape($it.text)
  $ssml = "<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='fr-FR'><prosody rate='$($it.rate)' pitch='+8%'>$escaped</prosody></speak>"
  $synth.SetOutputToWaveFile($it.file)
  $synth.SpeakSsml($ssml)
  $made++
}
$synth.SetOutputToNull()
$synth.Dispose()
Write-Output "voix : $made nouvelles lignes ($($items.Count) au total)"
