# Outstanding issues

Open items after the brand and website refresh, most important first.

| # | Issue | Impact | Owner / next step | Status |
|---|---|---|---|---|
| 1 | The explainer's narration is a **draft synthetic voice** (Windows "Microsoft Zira"). It is not professional narration. | It sounds robotic and weakens a first impression. | Founder chose the Azure neural voice en-US-AvaMultilingualNeural. Set `AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION`, then run `narration/synthesize-azure.mjs` and the build. | Blocked on the Azure key |
| 2 | The site's copy, brand and video have not been signed off. | Cannot release. | Founder review | Requires founder approval |
| 3 | The contact email on the site is not confirmed. | Inquiries could go to the wrong inbox. | Founder to confirm | Requires founder approval |
| 4 | App (Studio and portal) dark mode does not exist. About 1,600 hard-coded colour classes in 70 files need moving to tokens first. | The theme switch changes the public site only. | Separate migration | Blocked (planned work) |
| 5 | Dead components reachable only through the unused `ApplicationShell` | Maintenance noise; old styling | Delete in a separate change | Open |
| 6 | Portal Messages has no backend. | A visitor may expect it to work. | Hide it or label it "coming soon" | Open |
| 7 | The inquiry form's real submission path (`@backend` Playwright specs) was not run against a live backend in this pass. | The happy path is covered with a stubbed API only. | Run against a local backend | Not tested |
| 8 | No Lighthouse or real-device performance run | Unknown real-world scores | Run before release | Not tested |
| 9 | The video plays in Chromium in automated tests. Safari (MP4) and Firefox playback with sound were not checked on real browsers. | Low; standard codecs | Manual check | Not tested |
| 10 | Context7 documentation lookups were unavailable (the MCP server needs `/mcp` authorisation). | Library guidance came from the installed versions and their types. | Authorise if needed | Blocked |
| 11 | Scenes 4 to 6 of the film use illustrative interfaces. The brief asked for more realistic demonstrations. | Less concrete | Composite real, labelled screenshots during the final narration pass | Open |
