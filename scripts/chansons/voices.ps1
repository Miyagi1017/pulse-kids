# Voix de la chanson — 100 % local (SAPI5 « Microsoft Hortense », fr-FR).
# À lancer avec un accès complet (la synthèse vocale Windows est bloquée en bac à sable).
Add-Type -AssemblyName System.Speech
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$out = Join-Path $root 'song\audio\raw'
New-Item -ItemType Directory -Force $out | Out-Null

$lines = @(
  'Range, range, range les jouets,',
  'Un, deux, trois, dans le panier !',
  'Range, range, range les jouets,',
  'La chambre est toute rangée !',
  'Bravo !'
)

$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.SelectVoice('Microsoft Hortense Desktop')
$synth.Rate = -1

for ($i = 0; $i -lt $lines.Count; $i++) {
  $escaped = [System.Security.SecurityElement]::Escape($lines[$i])
  $ssml = "<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='fr-FR'><prosody rate='-6%' pitch='+8%'>$escaped</prosody></speak>"
  $file = Join-Path $out ("line{0}.wav" -f $i)
  $synth.SetOutputToWaveFile($file)
  $synth.SpeakSsml($ssml)
  Write-Output ("ligne {0} : {1} octets" -f $i, (Get-Item $file).Length)
}
$synth.Dispose()
