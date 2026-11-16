# Release checklist: brand and website refresh

Tick each item before this work is merged and deployed. Nothing here has been committed, merged or deployed yet.

## Founder approval
- [ ] Brand: the official mark, wordmark and colour palette (`docs/design/brand-guidelines.md`, `public/brand/`)
- [ ] Website copy: headline "Build Smarter. Scale With Confidence.", the five services, the six-step process, the six engagement models, and the FAQ
- [ ] Contact email shown on the site is the correct one
- [ ] Explainer video picture and script (`docs/video/`)
- [ ] Narration: the film currently has a **draft synthetic voice**. Choose one:
  - [ ] Replace it with a recorded or neural read (`docs/video/growthprint-video-script.md`, "Replacing the draft voice"), or
  - [ ] Ship the draft knowingly, or
  - [ ] Ship silent with captions (re-render with `render-explainer.mjs` only)

## Checks (re-run on the final commit)
- [ ] `npm run lint` exits 0
- [ ] `npm test` passes
- [ ] `npm run build` (production, no preview or mock flags) exits 0
- [ ] `npx playwright test --grep-invert "@backend"` passes
- [ ] `@backend` Playwright specs pass against a local backend (not the shared Render database)
- [ ] Visual review in dark and light at 1440 px and 390 px: home, services, inquiry form; Studio; portal; sign-in
- [ ] The video plays with sound in Chrome, Firefox and Safari (Safari uses the MP4)
- [ ] Lighthouse on the home page: performance, accessibility, best practices, SEO

## Safety
- [ ] Mock API mode is off in the production build and cannot be turned on there
- [ ] No secrets, tokens or `.env` values in the diff
- [ ] No API, auth or authorization changes in the diff
- [ ] `git status` shows only the intended files; large media files are expected (`public/videos/`, `public/brand/`)

## Deploy (only after approval)
- [ ] Merge through a reviewed pull request, not directly to `main`
- [ ] Deploy the frontend; confirm `/`, `/manifest.webmanifest`, `/icon.svg` and the video URLs return 200
- [ ] Share preview: check the Open Graph image in a link-preview tool
- [ ] Roll back by redeploying the previous build if anything regresses
