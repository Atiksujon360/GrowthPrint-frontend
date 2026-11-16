# GrowthPrint explainer: narration script

**Status:** the script is final. The film now carries a **draft synthetic narration** (the local Windows voice "Microsoft Zira"), timed to the captions. It is a placeholder for timing and review, **not professional narration**; replace it with a recorded or neural read before paid promotion. See the production report.

## Voice direction
- Natural, neutral international English. Warm and confident, not an advertising read.
- Moderate pace, about 135–145 words per minute, with a short pause at each line break below.
- Say "API" as letters (A-P-I) and "GrowthPrint" as one word, stressing "Growth".
- Deliver the closing tagline slower, with a beat between its two halves.
- **Delivery:** mono, 48 kHz, 24-bit WAV, dry (no music or reverb), one take per line, plus a full read.

## Script (60 s, timed to the picture)
The timings below are the source of truth in `scripts/marketing-media/narration/lines.json`, which also drives the captions.
| Time | Line |
|---|---|
| 0:00.40 | Every growing business depends on technology. |
| 0:03.05 | Managing websites, applications, systems and integrations can quickly become complicated. |
| 0:07.65 | That's where GrowthPrint comes in. |
| 0:09.50 | We're your technology partner, helping you build, manage and improve the technology behind your business. |
| 0:14.60 | From professional websites and custom software… |
| 0:22.40 | …to API integrations… |
| 0:30.40 | …intelligent automation… |
| 0:39.40 | …and ongoing support, we bring it together. |
| 0:47.40 | One partner. Better technology. More possibilities for growth. |
| 0:51.80 | GrowthPrint. Build smarter. Scale with confidence. |
| 0:56.90 | Let's build your next stage of growth together. |

The meaning and positioning are unchanged from the brief. The only edit is that the service list is split across the four service scenes, so each phrase lands with its picture.

## Natural voice (chosen): Azure neural, American female
The founder chose **en-US-AvaMultilingualNeural** (alternative: `AZURE_VOICE=en-US-JennyNeural`).
1. In the Azure portal, create a **Speech service** resource (the free F0 tier covers this script), then open "Keys and Endpoint".
2. In your own terminal, set the key and region as user environment variables. Do not paste the key into chat or into a file in the repo:
   `setx AZURE_SPEECH_KEY "<key>"` and `setx AZURE_SPEECH_REGION "<region, e.g. eastus>"`
3. `node scripts/marketing-media/narration/synthesize-azure.mjs`: reads each line naturally and speeds up only lines that would overlap, by 4% steps up to 16%.
4. `NARRATION_DIR=scripts/marketing-media/out/narration-azure NARRATION_LABEL="Azure neural voice en-US-AvaMultilingualNeural" node scripts/marketing-media/build-narrated-video.mjs`

## Replacing the draft voice with a recording
1. Record each line as `line-01.wav` … `line-11.wav` (mono, 48 kHz, 24-bit, dry). Each read must finish before the next line's start time above; the build checks this and stops if a line overlaps.
2. Run `KEEP_FRAMES=1 node scripts/marketing-media/render-explainer.mjs`, then `NARRATION_DIR=<folder> node scripts/marketing-media/build-narrated-video.mjs`.
3. The build trims silence, places each line, levels the mix to -16 LUFS (true peak -1.5 dBTP), and writes the WebM, the MP4 and the captions.
