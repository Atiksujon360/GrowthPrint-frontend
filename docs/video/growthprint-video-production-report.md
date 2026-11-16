# GrowthPrint explainer: production report

Date: 16 November 2026.

## Status
| Item | Status |
|---|---|
| Picture (7 scenes, 60 s, 1920×1080, 30 fps) | Implemented, visually reviewed |
| Narration | **Draft synthetic voice**, labelled as such. Requires founder approval, or replacement with a recorded or neural read. |
| WebM (VP9 + Opus) and MP4 (H.264 + AAC) | Implemented, tested (plays with audio in Chromium) |
| Captions (11 cues, generated from the same timings as the audio) | Implemented, tested |
| Poster | Implemented |
| Safari and Firefox playback with sound | Not tested on real browsers |

## Narration
- **Voice:** "Microsoft Zira Desktop", the local Windows SAPI voice. It is not a neural voice and it is **not professional narration**. Its job is to lock timing and let the founder hear the script against the picture. The file metadata says "Draft synthetic narration (Windows voice), not final".
- **Script and voice direction:** `growthprint-video-script.md`.
- **Timing:** `scripts/marketing-media/narration/lines.json`. Each line is placed at its start time, and the build stops if any read runs into the next line. Measured fit for the draft voice:

| Line | Start (s) | Speech (s) | Ends (s) | Next line (s) |
|---|---|---|---|---|
| 1 | 0.40 | 2.43 | 2.83 | 3.05 |
| 2 | 3.05 | 4.35 | 7.40 | 7.65 |
| 3 | 7.65 | 1.67 | 9.32 | 9.50 |
| 4 | 9.50 | 4.81 | 14.31 | 14.60 |
| 5 | 14.60 | 2.71 | 17.31 | 22.40 |
| 6 | 22.40 | 1.59 | 23.99 | 30.40 |
| 7 | 30.40 | 1.27 | 31.67 | 39.40 |
| 8 | 39.40 | 2.61 | 42.01 | 47.40 |
| 9 | 47.40 | 4.03 | 51.43 | 51.80 |
| 10 | 51.80 | 4.71 | 56.51 | 56.90 |
| 11 | 56.90 | 2.33 | 59.23 | end 60.00 |

- Lines 2, 4 and 9 are read slightly faster (SAPI rate +2) to fit the picture. The end card was extended from 58 s to 60 s so the closing tagline is not rushed.

## Audio processing
1. Each line is trimmed of leading and trailing silence and placed at its start time.
2. High-pass at 80 Hz.
3. Two-pass EBU R128 loudness normalisation to −16 LUFS integrated, −1.5 dBTP ceiling (linear mode).

Measured on the published files (ffmpeg `ebur128`):

| File | Integrated | Loudness range | True peak |
|---|---|---|---|
| `growthprint-explainer.webm` | −16.0 LUFS | 6.4 LU | −1.3 dBFS |
| `growthprint-explainer.mp4` | −16.0 LUFS | 6.3 LU | (same mix) |

The Opus encoder adds about 0.2 dB of overshoot above the −1.5 dB ceiling. That is within normal web delivery tolerance (below −1 dBTP).

## Files
| File | Format | Size | Use |
|---|---|---|---|
| `public/videos/growthprint-explainer.webm` | VP9 Profile 0, BT.709 limited range + Opus 48 kHz mono | 3.9 MB | Website, first choice |
| `public/videos/growthprint-explainer.mp4` | H.264 High, BT.709 limited range + AAC-LC 48 kHz mono, faststart | 8.5 MB | Safari and fallback; sharing |
| `scripts/marketing-media/out/growthprint-explainer-master.mp4` | H.264 High CRF 14 + AAC 256 kb/s | 20.8 MB | Master for social and editing; git-ignored, regenerate with the build |
| `public/captions/growthprint-explainer-en.vtt` | WebVTT, 11 cues | | Captions available, off by default |
| `public/videos/growthprint-explainer-poster.webp` | WebP | 51 KB | Poster |

The player (`components/marketing/explainer-video/ExplainerVideo.tsx`) lists the WebM first and the MP4 second. It shows "can't play" only if the last source fails.

## Issue found and fixed: Chrome decode error
The first narrated build failed in Chrome with `PIPELINE_ERROR_DECODE: video decode error!` and the site showed "This browser can't play the video format". The cause was that the captured JPEG frames are full-range colour, and that flag was carried into the VP9 stream, which Chrome's decoder rejects. A 3-second test confirmed it: the full-range sample failed and the limited-range sample played. Every output is now converted to limited-range BT.709. The build also writes to a temporary `.part` file and swaps it in when complete, so a running dev server never serves a half-written video.

## How to rebuild
```
KEEP_FRAMES=1 node scripts/marketing-media/render-explainer.mjs
FFMPEG=<path to ffmpeg> node scripts/marketing-media/build-narrated-video.mjs
```
Add `NARRATION_DIR=<folder>` with `line-01.wav` … `line-11.wav` to use a recorded voice instead of the draft. The build needs a full ffmpeg (libx264, libopus, libvpx-vp9); on this machine that is ffmpeg 9.0.2 from `winget install Gyan.FFmpeg`. It is a machine tool, not a project dependency.

## Verification
- `ffprobe`: both files are 60.000 s and limited range BT.709, with one mono 48 kHz audio stream.
- Chromium (dev server): both files play, `currentTime` advances, and `webkitAudioDecodedByteCount` is above 0.
- Playwright `marketing-home.spec.ts` checks the duration (60 s), that the WebM is chosen, that audio decodes, that the MP4 is served as `video/mp4`, and the 11 caption cues.
