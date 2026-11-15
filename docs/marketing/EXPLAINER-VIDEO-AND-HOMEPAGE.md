# GrowthPrint homepage, artwork and explainer video

Status date: 15 November 2026.

## What exists

| Asset | Path | Details |
|---|---|---|
| Hero sculpture | `public/images/growthprint-sculpture.webp`, `growthprint-sculpture-720.webp` | Original ray-marched 3D render with a transparent background. 1200 px is 63 KB; 720 px is 38 KB. |
| Explainer film | `public/media/growthprint-explainer.webm` | Real render: 58 s, 1920×1080, 30 fps, VP8, 13.1 MB. No audio track. |
| Poster | `public/media/growthprint-explainer-poster.webp` | The "Meet GrowthPrint" frame. |
| Captions | `public/media/captions/growthprint-en.vtt` | 14 English cues that carry the full voiceover script. |
| Share image | `public/images/growthprint-og.jpg` | 1200×630, used for Open Graph and Twitter cards. |
| Work screenshot | `public/images/work/growthprint-studio-dashboard.webp` | Current Studio dashboard in demo mode; the caption says so. |

All visuals are original: drawn in HTML/CSS/SVG or rendered by our own shader. The film contains no people, logos, client names, statistics, music or stock footage.

## How to re-render
```
node scripts/marketing-media/render-sculpture.mjs                # sculpture and WebP files (seconds)
node scripts/marketing-media/render-explainer.mjs                # full film and poster (about 3 to 4 minutes)
PREVIEW=1 node scripts/marketing-media/render-explainer.mjs      # one still per scene, for review
POSTER_ONLY=1 POSTER_AT=11 node scripts/marketing-media/render-explainer.mjs
```
`explainer.html` is the film. `window.renderAt(seconds)` lays out every frame, so renders are deterministic. Frames are captured by Playwright's Chromium and encoded by the ffmpeg build that ships with Playwright. No new dependencies are needed.

## Storyboard and voiceover script (as rendered)
| Time | Scene | On screen | Voiceover / captions |
|---|---|---|---|
| 0–7 s | The problem | Six disconnected tool windows drift apart, with broken links. Violet light trails then connect them. "Your business deserves better technology." | Every growing business faces challenges. Outdated websites, disconnected systems and repetitive manual work can slow progress. |
| 7–14 s | Introduction | Logo and wordmark, the sculpture turning slowly. "Meet GrowthPrint." "Your technology partner for digital growth." | GrowthPrint brings software engineering and intelligent automation together to help businesses move forward. |
| 14–22 s | Websites | A browser and a phone mock-up build up a page. "Build better digital experiences." | We design and build modern websites and digital applications that help businesses create better customer experiences. |
| 22–30 s | Integration | A hub connects Website, CRM, Payments, Inventory, Email and Reports, with data pulses travelling along the links. "Connect your technology." | From custom software to system integrations, we connect the technology your business depends on. |
| 30–39 s | Automation | A document travels from "Document received" through "AI reads the details" and "Person approves" to "Team is notified". "Make work smarter." | We also automate repetitive processes and integrate practical AI solutions, helping teams spend less time on manual work. |
| 39–47 s | Engineering | A system health dashboard. Bars and a response-time line are illustrative, with no figures. "Built to evolve with your business." | With engineering expertise and ongoing technical support, we help your digital systems evolve as your business grows. |
| 47–58 s | Close | The sculpture, "Build Smarter. Scale Without Limits.", "Let's build something meaningful together.", "Start Your Project" and the wordmark. | Whatever your next technology challenge, let's build the solution together. GrowthPrint. Build smarter. Scale without limits. |

## Not done yet (owner decisions)
1. **MP4 (H.264).** The bundled encoder only supports VP8/WebM. WebM plays in Chrome, Edge, Firefox and current Safari. Older Safari and iOS versions need an MP4 version.
   - To fix: install ffmpeg, then run `ffmpeg -i public/media/growthprint-explainer.webm -c:v libx264 -crf 20 -preset slow -pix_fmt yuv420p -movflags +faststart public/media/growthprint-explainer.mp4`.
   - Then add `{ src: '/media/growthprint-explainer.mp4', type: 'video/mp4' }` first in `EXPLAINER.sources` (`components/marketing/explainer-video/ExplainerVideo.tsx`).
2. **Voiceover audio.** None was recorded. The only voices available here (Windows David and Zira) sound robotic, which the brief rules out. The captions carry the full script. Options: record a human voice, or use a licensed voice service. Mux the audio with ffmpeg; the timings in the .vtt are the cue sheet.
3. **Music.** None, because no licensed track was available. Add only a track you hold a licence for.
4. **Real inquiry submission.** The form is tested against the backend contract with a stubbed API. A live submission is not tested because the backend was not running. Run `GP_E2E_BACKEND_WRITES=1 npx playwright test tests/public-inquiry.spec.ts` against an isolated database.
5. **Contact details.** Confirm that `contact@growthprint.agency` is monitored. The previous legal name, "GrowthPrint Technology Partners LLC", was removed from the footer until it is confirmed. No social links are shown because none have been verified.
6. **Case studies.** Only GrowthPrint's own platform is shown, labelled "Internal GrowthPrint product". Add client work only with the client's approval.
7. **Service categories.** The backend has five categories. "API & System Integration" is sent as `SOFTWARE_DEV`, and "Technical Consulting & Support" as `WEBSITE_MAINTENANCE`, with the exact service name in `projectType`. Adding real categories is a backend change; the CRM conversion uses the same values.
