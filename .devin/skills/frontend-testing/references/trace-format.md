# Trace File Format Reference

Playwright and Vitest browser-mode produce the same trace format — a zip or extracted directory with JSONL data files and a `resources/` folder.

## Extracting a Trace

Traces are typically `.trace.zip` files (or already-extracted directories). To extract:

```bash
unzip {trace-path}.zip -d {trace-dir}
```

## File Structure

| File | Content |
|------|---------|
| `test.trace` | Test runner perspective: hooks, fixtures, assertions, errors, stdout/stderr |
| `trace.trace` (or `0-trace.trace`) | Browser perspective: API calls, DOM snapshots, console logs, screenshots |
| `trace.network` (or `0-trace.network`) | Network: HAR-format request/response entries |
| `trace.stacks` (or `0-trace.stacks`) | Stack trace index (single JSON object, not JSONL) |
| `resources/` | Response bodies, screenshots, source files |

Not all files are guaranteed present in every trace. Vitest-browser-mode traces often omit `test.trace`. When a `0-` prefix is used, multiple browser contexts produce `1-trace.*`, `2-trace.*`, etc. Always check which files are present before reading.

## Data Format

All files except `trace.stacks` are **JSONL** — one JSON object per line. The first line in trace files is always a `context-options` header.

### test.trace

Events: `before`/`after` (step lifecycle), `stdout`/`stderr`, `error`. Steps are paired by `callId` — `before` has `startTime`, `after` has `endTime` (and optionally `error`). Steps nest via `parentId` (e.g. a hook contains fixtures, which contain API calls). Each `before` event has a `title` field with a human-readable action description (e.g. `Navigate to "/page"`, `Expect "toBeVisible"`).

```jsonl
{"version":8,"type":"context-options","origin":"testRunner","playwrightVersion":"1.58.2","platform":"linux"}
{"type":"before","callId":"pw:api@107","stepId":"pw:api@107","parentId":"hook@1","startTime":9347.5,"class":"Test","method":"pw:api","title":"Navigate to \"/page\"","params":{"url":"https://example.com/page"}}
{"type":"after","callId":"expect@109","endTime":30339.5,"error":{"message":"expect(locator).toBeVisible failed\nLocator: getByRole('alert')"}}
```

### trace.trace

Events: `before`/`after` (browser API calls), `frame-snapshot` (DOM tree as nested arrays), `console` (browser console), `screencast-frame` (periodic screenshots), `log`, `event`. Same `before`/`after` pairing by `callId` as `test.trace` — failures appear as an `error` field on the `after` event. `before` events have a `title` field describing the action.

Console events have a `messageType` field: `"error"`, `"warning"`, or `"log"`. To find console errors, grep for `"messageType":"error"`.

```jsonl
{"type":"context-options","origin":"library","contextId":"browser-context@d5d3cf51","title":"my test name"}
{"type":"before","callId":"call@39","class":"Frame","method":"goto","params":{"url":"https://example.com"},"pageId":"page@e286ba60","beforeSnapshot":"before@call@39","title":"Navigate to \"https://example.com\""}
{"type":"after","callId":"call@39","endTime":10007.4,"result":{"response":"<Response>"}}
{"type":"console","messageType":"error","text":"Failed to load resource: 401","location":{"url":"https://example.com/api/me"},"pageId":"page@e286ba60"}
```

### trace.network

Every line is a `resource-snapshot` — a HAR entry with full request/response details. Response bodies are stored in `resources/` and referenced by `_sha1`. For POST requests, the request body is also in `resources/` via `postData._sha1`.

```jsonl
{"type":"resource-snapshot","snapshot":{"request":{"method":"GET","url":"https://example.com/page"},"response":{"status":200,"content":{"mimeType":"text/html","_sha1":"10fc0900.html"}},"timings":{"dns":23.8,"connect":53.0,"wait":174.2,"receive":10.4}}}
{"type":"resource-snapshot","snapshot":{"request":{"method":"POST","url":"https://example.com/api/track","postData":{"mimeType":"application/json","_sha1":"041f7177.json"}},"response":{"status":200,"content":{"_sha1":"16549028.json"}}}}
```

### trace.stacks

Single JSON object mapping call IDs to stack frames: `{"files":["path/to/file.ts",...],"stacks":[[callIdNum,[[fileIdx,line,col,"funcName"],...]],...]}`. The `callIdNum` matches the numeric part of `call@N` in `trace.trace`.

## Resources Folder

- `{sha1}.html/.css/.json/.png/.woff2/...` — cached response bodies (referenced by `_sha1` in network snapshots)
- `page@{pageId}-{wallTime}.jpeg` — screencast screenshots
- `src@{sha1}.txt` — test source files (not always present)

## How Files Link Together

- `test.trace` step `callId` (e.g. `pw:api@107`) matches `trace.trace` `stepId` — connects test steps to browser actions
- `trace.trace` `beforeSnapshot`/`afterSnapshot` references point to `frame-snapshot` events — DOM state before/after actions
- `trace.network` `_sha1` values point to files in `resources/` — actual response body content
- Timestamps are **monotonic milliseconds** from process start; `wallTime` fields are epoch ms

## Quick Error Investigation

To find errors quickly:
- In `test.trace`: grep for `"error"` — shows assertion failures and step errors
- In `trace.trace`: grep for `"messageType":"error"` — shows browser console errors (missing mocks, auth failures, runtime exceptions)
- In `trace.network`: grep for `"status":4` or `"status":5` — shows failed HTTP requests

To reconstruct what happened before a failure: read the `before` events' `title` fields in order — they form the action sequence the test executed.

## Finding the DOM Snapshot for a Failed Action

1. In `trace.trace`, a failed action produces an `after` event with an `error` field — e.g. `callId: call@43`
2. DOM snapshots (`frame-snapshot` events) are named using the pattern `before@call@43`, `after@call@43` — the `callId` is embedded in the `snapshotName`
3. To find the page state at failure: find `after` events with `error` → extract their `callId` → find `frame-snapshot` events whose `snapshotName` contains that `callId`
