/**
 * Natural narration for the explainer with an Azure AI Speech neural voice (licensed for commercial use).
 *
 *   AZURE_SPEECH_KEY=<key> AZURE_SPEECH_REGION=<region, e.g. eastus> \
 *   FFMPEG=<path to ffmpeg> node scripts/marketing-media/narration/synthesize-azure.mjs
 *
 * Then build the film with it:
 *   NARRATION_DIR=scripts/marketing-media/out/narration-azure node scripts/marketing-media/build-narrated-video.mjs
 *
 * Optional: AZURE_VOICE (default en-US-AvaMultilingualNeural; alternative en-US-JennyNeural).
 *
 * Each line in lines.json is read at the voice's natural pace. If a read would run into the next line, it is
 * re-read slightly faster, in 4% steps up to +16%, so it still sounds natural. If it still does not fit, the
 * script stops and says which line, rather than rushing it.
 *
 * The key is read from the environment only. It is never printed, logged or written to disk.
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(here, '../out/narration-azure');
const KEY = process.env.AZURE_SPEECH_KEY || process.env.SPEECH_KEY;
const REGION = process.env.AZURE_SPEECH_REGION || process.env.SPEECH_REGION;
const VOICE = process.env.AZURE_VOICE || 'en-US-AvaMultilingualNeural';
const FFMPEG = process.env.FFMPEG || 'ffmpeg';
const DURATION = 60;
const GAP = 0.12; // minimum silence before the next line starts, in seconds

if (!KEY || !REGION) {
  console.error('Set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION (from your Azure Speech resource, "Keys and Endpoint").');
  process.exit(1);
}
if (!/^[a-z0-9]+$/.test(REGION)) throw new Error('AZURE_SPEECH_REGION should look like "eastus" or "westeurope".');

const lines = JSON.parse(readFileSync(path.join(here, 'lines.json'), 'utf8'));
mkdirSync(outDir, { recursive: true });

const xml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// Neural voices read "API" correctly, so speak the caption text, not the letter-spaced SAPI spelling.
const spoken = (l) => (l.caption ?? l.say).replace(/A P I/g, 'API');

function ssml(text, ratePercent) {
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">`
    + `<voice name="${VOICE}"><prosody rate="${ratePercent >= 0 ? '+' : ''}${ratePercent}%">${xml(text)}</prosody></voice></speak>`;
}

async function synthesize(text, ratePercent) {
  const res = await fetch(`https://${REGION}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': KEY,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'riff-48khz-16bit-mono-pcm',
      'User-Agent': 'growthprint-explainer-build',
    },
    body: ssml(text, ratePercent),
  });
  if (res.status === 401 || res.status === 403) throw new Error(`Azure rejected the key or region (HTTP ${res.status}). Check AZURE_SPEECH_KEY and AZURE_SPEECH_REGION.`);
  if (!res.ok) throw new Error(`Azure Speech returned HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return Buffer.from(await res.arrayBuffer());
}

/** Length of the speech itself, with leading and trailing silence trimmed (same trim as the video build). */
function speechSeconds(file) {
  const trim = 'silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse';
  const r = spawnSync(FFMPEG, ['-hide_banner', '-i', file, '-af', trim, '-f', 'null', '-'], { encoding: 'utf8' });
  if (r.error || r.status !== 0) throw new Error(`ffmpeg could not measure ${file}. Set FFMPEG to a full ffmpeg build.`);
  const m = [...r.stderr.matchAll(/time=(\d+):(\d+):([\d.]+)/g)].pop();
  return m ? Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]) : 0;
}

const report = [];
for (const [i, line] of lines.entries()) {
  const slot = (i + 1 < lines.length ? lines[i + 1].start : DURATION) - line.start - GAP;
  const file = path.join(outDir, `line-${String(line.id).padStart(2, '0')}.wav`);
  let fitted = null;
  for (const rate of [0, 4, 8, 12, 16]) {
    writeFileSync(file, await synthesize(spoken(line), rate));
    const secs = speechSeconds(file);
    if (secs <= slot) { fitted = { rate, secs }; break; }
    fitted = { rate, secs, tooLong: true };
  }
  report.push({ id: line.id, text: spoken(line).slice(0, 48), slot: +slot.toFixed(2), speech: +fitted.secs.toFixed(2), rate: `+${fitted.rate}%`, fits: !fitted.tooLong });
}
console.log(`Voice: ${VOICE}`);
console.table(report);
const bad = report.filter((r) => !r.fits);
if (bad.length) {
  console.error(`Lines ${bad.map((r) => r.id).join(', ')} do not fit even at +16%. Move their start times in lines.json or shorten the script.`);
  process.exit(2);
}
console.log(`Wrote ${lines.length} lines to ${outDir}`);
