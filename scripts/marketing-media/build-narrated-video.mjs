/**
 * Adds the narration to the explainer film and encodes the release files.
 *
 *   1. KEEP_FRAMES=1 node scripts/marketing-media/render-explainer.mjs   (frames -> out/explainer.mjpeg)
 *   2. node scripts/marketing-media/build-narrated-video.mjs
 *
 * Narration source, in order of preference:
 *   NARRATION_DIR=<folder>  recorded (or neural) lines named line-01.wav ... line-11.wav, one per entry in
 *                           narration/lines.json. Leading and trailing silence is trimmed automatically.
 *   NARRATION_LABEL=<text>  optional, stored in the file metadata (e.g. "Azure neural voice en-US-AvaMultilingualNeural").
 *   (default)               a SYNTHETIC DRAFT made with the local Windows voice (narration/synthesize-draft.ps1).
 *                           It is for timing and review only and must not be described as professional narration.
 *
 * Writes:
 *   public/videos/growthprint-explainer.webm   VP9 + Opus, for the website
 *   public/videos/growthprint-explainer.mp4    H.264 High + AAC-LC, faststart, for Safari and as a fallback
 *   public/captions/growthprint-explainer-en.vtt  captions, timed from narration/lines.json
 *   out/growthprint-explainer-master.mp4       high-bitrate H.264 master (not shipped; git-ignored)
 *   out/narration-mix.wav                      the levelled narration track (git-ignored)
 *
 * Needs a full ffmpeg build (libx264, libopus, loudnorm). Set FFMPEG=<path> if it is not on PATH.
 * The narration is levelled to -16 LUFS integrated with a -1.5 dBTP ceiling (two-pass EBU R128 loudnorm).
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const out = path.join(here, 'out');
const FFMPEG = process.env.FFMPEG || 'ffmpeg';
const FPS = 30;
const DURATION = 60; // must match window.DURATION in explainer.html
const TARGET_LUFS = -16;
const TRUE_PEAK = -1.5;

// Encode to a temporary file next to the target and swap it in when complete, so a running dev server
// never serves a half-written video.
function encode(target, args) {
  const ext = path.extname(target);
  const part = target.slice(0, -ext.length) + '.part' + ext;
  run([...args, '-y', part]);
  renameSync(part, target);
}

function run(args, { capture = false } = {}) {
  const res = spawnSync(FFMPEG, ['-hide_banner', ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: capture ? 'pipe' : ['ignore', 'inherit', 'inherit'] });
  if (res.error) throw new Error(`Could not run ffmpeg (${FFMPEG}): ${res.error.message}. Set FFMPEG to a full ffmpeg build.`);
  if (res.status !== 0) throw new Error(`ffmpeg failed:\n${(res.stderr || '').slice(-2000)}`);
  return res.stderr || '';
}

// --- 0. checks -----------------------------------------------------------------------------------
const encoders = spawnSync(FFMPEG, ['-hide_banner', '-encoders'], { encoding: 'utf8' }).stdout || '';
for (const need of ['libx264', 'libopus', 'libvpx-vp9']) {
  if (!encoders.includes(need)) throw new Error(`ffmpeg at "${FFMPEG}" has no ${need} encoder. Install a full build (e.g. winget install Gyan.FFmpeg).`);
}
const frames = path.join(out, 'explainer.mjpeg');
if (!existsSync(frames)) throw new Error('out/explainer.mjpeg is missing. Run: KEEP_FRAMES=1 node scripts/marketing-media/render-explainer.mjs');
const lines = JSON.parse(readFileSync(path.join(here, 'narration/lines.json'), 'utf8'));

// --- 1. narration clips --------------------------------------------------------------------------
let clipDir = process.env.NARRATION_DIR;
const isDraft = !clipDir;
if (isDraft) {
  clipDir = path.join(out, 'narration-draft');
  const ps = spawnSync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', path.join(here, 'narration/synthesize-draft.ps1'), '-OutDir', clipDir], { stdio: 'inherit' });
  if (ps.status !== 0) throw new Error('Draft narration failed (needs Windows with the Microsoft Zira Desktop voice).');
}
const clips = lines.map((l) => {
  const file = path.join(clipDir, `line-${String(l.id).padStart(2, '0')}.wav`);
  if (!existsSync(file)) throw new Error(`Missing narration clip ${file}`);
  return { ...l, file };
});

// --- 2. place each line at its start time and mix -------------------------------------------------
const trim = 'silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse';
const chains = clips.map((c, i) => `[${i}:a]aformat=sample_rates=48000:channel_layouts=mono,${trim},adelay=${Math.round(c.start * 1000)}:all=1[a${i}]`);
const mixGraph = `${chains.join(';')};${clips.map((_, i) => `[a${i}]`).join('')}amix=inputs=${clips.length}:normalize=0:dropout_transition=0,`
  + `highpass=f=80,apad=whole_dur=${DURATION},atrim=0:${DURATION}[mix]`;
const rawMix = path.join(out, 'narration-raw.wav');
run([...clips.flatMap((c) => ['-i', c.file]), '-filter_complex', mixGraph, '-map', '[mix]', '-ar', '48000', '-c:a', 'pcm_s24le', '-y', rawMix]);

// Check that no line runs past the next line's start (a too-long read would overlap).
const report = [];
for (const [i, c] of clips.entries()) {
  const stderr = run(['-i', c.file, '-af', trim, '-f', 'null', '-'], { capture: true });
  const m = [...stderr.matchAll(/time=(\d+):(\d+):([\d.]+)/g)].pop();
  const dur = m ? Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]) : 0;
  const ends = c.start + dur;
  const limit = i + 1 < clips.length ? clips[i + 1].start : DURATION;
  report.push({ id: c.id, start: c.start, speech: Number(dur.toFixed(2)), ends: Number(ends.toFixed(2)), fits: ends <= limit - 0.05 });
}
console.table(report);
const overlap = report.filter((r) => !r.fits);
if (overlap.length) throw new Error(`Lines ${overlap.map((r) => r.id).join(', ')} run into the next line. Re-read them shorter or adjust narration/lines.json.`);

// --- 3. two-pass loudness normalisation (EBU R128) ------------------------------------------------
const pass1 = run(['-i', rawMix, '-af', `loudnorm=I=${TARGET_LUFS}:TP=${TRUE_PEAK}:LRA=11:print_format=json`, '-f', 'null', '-'], { capture: true });
const measured = JSON.parse(pass1.slice(pass1.lastIndexOf('{'), pass1.lastIndexOf('}') + 1));
const mix = path.join(out, 'narration-mix.wav');
run(['-i', rawMix, '-af', `loudnorm=I=${TARGET_LUFS}:TP=${TRUE_PEAK}:LRA=11:measured_I=${measured.input_i}:measured_TP=${measured.input_tp}`
  + `:measured_LRA=${measured.input_lra}:measured_thresh=${measured.input_thresh}:offset=${measured.target_offset}:linear=true`,
  '-ar', '48000', '-c:a', 'pcm_s24le', '-y', mix]);

// --- 4. encode -------------------------------------------------------------------------------------
mkdirSync(path.join(root, 'public/videos'), { recursive: true });
// The JPEG frames are full-range ("pc") colour. Chrome's VP9 decoder rejects full-range VP9 with a decode error, and
// players disagree on full-range H.264, so convert to standard (limited, "tv") range BT.709 for every output.
const video = ['-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', frames, '-i', mix, '-map', '0:v', '-map', '1:a', '-t', String(DURATION),
  '-vf', 'scale=out_range=tv:out_color_matrix=bt709,format=yuv420p',
  '-color_range', 'tv', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709'];
const meta = ['-metadata', 'title=GrowthPrint overview', '-metadata', `comment=${isDraft ? 'Draft synthetic narration (Windows voice), not final' : (process.env.NARRATION_LABEL || 'Narration')}`];
const webm = path.join(root, 'public/videos/growthprint-explainer.webm');
const mp4 = path.join(root, 'public/videos/growthprint-explainer.mp4');
const master = path.join(out, 'growthprint-explainer-master.mp4');

console.log('encoding WebM (VP9 + Opus)…');
encode(webm, ['-loglevel', 'error', ...video, '-c:v', 'libvpx-vp9', '-crf', '31', '-b:v', '0', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '2',
  '-pix_fmt', 'yuv420p', '-c:a', 'libopus', '-b:a', '96k', '-ar', '48000', ...meta]);
console.log('encoding MP4 (H.264 + AAC)…');
encode(mp4, ['-loglevel', 'error', ...video, '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-profile:v', 'high', '-level', '4.1', '-pix_fmt', 'yuv420p',
  '-c:a', 'aac', '-b:a', '160k', '-ar', '48000', '-movflags', '+faststart', ...meta]);
console.log('encoding master MP4…');
encode(master, ['-loglevel', 'error', ...video, '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-profile:v', 'high', '-pix_fmt', 'yuv420p',
  '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-movflags', '+faststart', ...meta]);

// --- 5. captions from the same timings --------------------------------------------------------------
const ts = (s) => {
  const ms = Math.round(s * 1000);
  const h = Math.floor(ms / 3_600_000), m = Math.floor(ms / 60_000) % 60, sec = Math.floor(ms / 1000) % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${String(ms % 1000).padStart(3, '0')}`;
};
const vtt = ['WEBVTT', 'Kind: captions', 'Language: en', '',
  `NOTE GrowthPrint explainer, ${DURATION} seconds. Generated by scripts/marketing-media/build-narrated-video.mjs from narration/lines.json.`, '',
  ...lines.flatMap((l) => [String(l.id), `${ts(l.start)} --> ${ts(l.end)}`, l.caption ?? l.say, ''])].join('\n');
writeFileSync(path.join(root, 'public/captions/growthprint-explainer-en.vtt'), vtt);

console.log(JSON.stringify({ narration: isDraft ? 'draft (synthetic)' : 'supplied', loudnessIn: measured.input_i, webm, mp4, master }, null, 2));
