# Draft narration for the explainer, made with the local Windows voice (SAPI "Microsoft Zira Desktop").
# This is a SYNTHETIC DRAFT for timing and review only. It is not professional narration; replace it
# with a recorded or neural read (see docs/video/growthprint-video-script.md) before a paid campaign.
#
# Writes one 48 kHz mono WAV per caption line to $OutDir and prints each clip's duration.
# Usage: powershell -File synthesize-draft.ps1 -OutDir <folder> [-Voice "Microsoft Zira Desktop"]
param(
  [Parameter(Mandatory = $true)][string]$OutDir,
  [string]$Voice = 'Microsoft Zira Desktop'
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech

$lines = Get-Content -Raw -Path (Join-Path $PSScriptRoot 'lines.json') | ConvertFrom-Json
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

$format = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(48000, [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen, [System.Speech.AudioFormat.AudioChannel]::Mono)
foreach ($line in $lines) {
  $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
  $synth.SelectVoice($Voice)
  $synth.Rate = [int]$line.rate
  $path = Join-Path $OutDir ("line-{0:D2}.wav" -f [int]$line.id)
  $synth.SetOutputToWaveFile($path, $format)
  # The spoken text can differ from the caption (e.g. "A P I") so the voice pronounces it correctly.
  $synth.Speak([string]$line.say)
  $synth.Dispose()
  $bytes = (Get-Item $path).Length - 44
  '{0:D2}  {1,5:N2}s  rate {2}' -f [int]$line.id, ($bytes / 96000), $line.rate
}
