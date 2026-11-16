# Launch readiness: GrowthPrint brand and website refresh

Date: 16 November 2026. Nothing has been committed, merged, deployed or published.

**Verdict: not ready to release yet.** The engineering checks pass. Release waits on founder approval of the brand, copy and video, and on replacing the draft narration with the natural Azure voice the founder chose.

## Checks run on this working tree
| Check | Command | Result |
|---|---|---|
| Type check | `npm run lint` (`tsc --noEmit`) | Exit 0 |
| Unit tests | `npm test` | 178 tests, 178 pass, 0 fail |
| Production build | `npm run build` with mock API and preview routes off | Exit 0 |
| End-to-end (no backend) | `PW_PORT=3200 npx playwright test --grep-invert "@backend"`, on a fresh `next start` | 33 passed, 16 skipped (the `@backend` specs need a local API) |
| Video files | `ffprobe` and `ebur128` | 60.0 s; VP9/Opus and H.264/AAC; limited-range BT.709; −16.0 LUFS; true peak −1.3 dBFS |
| Video in Chrome | Dev server, both sources | Both play; audio decodes |

The first end-to-end run had one failure: the MP4 returned 404. The server had been started before the MP4 existed, and `next start` reads the public file list at startup. After a rebuild and restart, the test passes.

## Item status
| Item | Status |
|---|---|
| Design audit (`docs/design/growthprint-design-audit.md`) | Implemented |
| One official logo, icons, favicon, manifest (`public/brand/`, `app/icon.svg`, `app/manifest.ts`) | Implemented, tested (build), visually reviewed |
| Brand guidelines, design system, theme guidelines | Implemented |
| Typography aligned: Poppins headlines and Inter interface text; Hanken and Schibsted removed | Implemented, visually reviewed |
| Shared wordmark (`.gp-wordmark`) on site, sign-in, Studio, portal | Implemented, visually reviewed (site, sign-in) |
| Site titles and descriptions on the new positioning | Implemented, tested (build) |
| Dark and light themes with switcher, persistence, no flash, keyboard | Implemented, tested, visually reviewed |
| Website copy: headline, CTAs, five services, six steps, six engagement models | Implemented, tested; requires founder approval |
| Admin Studio brand consistency (palette, mark) | Implemented, visually reviewed |
| Client Portal: real data only (no invented hours or figures) | Implemented, tested |
| Explainer picture, captions, poster, WebM + MP4 | Implemented, tested, visually reviewed |
| Narration | **Draft Windows voice in place. Natural Azure neural voice (en-US-AvaMultilingualNeural, American female) chosen; script ready, waiting on the Azure key.** |
| App (Studio and portal) dark mode | Blocked: needs a migration of about 1,600 hard-coded colour classes |
| Release docs (this report, checklist, outstanding issues, UI consistency report, video production report) | Implemented |

## Before release
1. Founder sets `AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION`, then rebuilds the narration (`docs/video/growthprint-video-script.md`) and listens to the result.
2. Founder approves brand, copy, contact email and video.
3. Run the `@backend` specs against a local backend, a Lighthouse pass, and a Safari and Firefox playback check.
4. Commit on a branch, open a pull request, and deploy only after review.

See `release-checklist.md` and `outstanding-issues.md`.
