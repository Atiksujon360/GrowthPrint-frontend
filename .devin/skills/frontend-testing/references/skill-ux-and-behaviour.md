# Skill UX, Communication & Behaviour

Guidelines for transcript logging, user communication, and required emissions. All commands and workflow steps must follow these rules.

---

## Config and secrets Resolution

### `{{CONTEXT_ROOT}}`

`{{CONTEXT_ROOT}}` = the root of the app/lib under test (where its `testskill.config.toml` sits, normally beside `package.json` / `pyproject.toml`).

**Resolution rule:** Walk up from the file/page in context to the first directory containing a `testskill.config.toml` — a monolith's project root, or one app/lib in a monorepo, not the repo root. If you hit the repo root with no config, or the context is ambiguous, stop immediately

**Secrets:** `testskill.secrets.toml` sits beside the config; it is optional and only needed for authenticated runtime analysis.

## Event Transcript

Every command, workflow, tool, and agent must emit at least 3, and up to 20, structured JSONL events for auditability

### Output path

- **Test context folder exists**: `<test_context_folder>/<outputs.transcript_filename>` (from `testskill.config.toml`)
- **No test context folder**: `<paths.test_context_root_folder>/logs/<outputs.transcript_filename>`

### Event schema

One JSON object per line. Required fields:

| Field        | Type   | Rule                                                                                                                                                                                                             |
| ------------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `timestamp`  | string | ISO 8601 UTC (`date -u +"%Y-%m-%dT%H:%M:%S.000Z"`)                                                                                                                                                               |
| `event_type` | string | One of: `flow_start`, `flow_end`, `command_start`, `command_end`, `agent_start`, `agent_end`, `subagent_start`, `subagent.{some phase}`, `subagent_end`, `mcp-tool-invoke`, `challenge`, `error`, `event`, `unusual`, `human_input` |
| `title`      | string | Human-readable description of what just happened                                                                                                                                                                 |

Emit for **every** occurrence. Use `{subagent}.{some phase}` for any action tried, `error` for failures or phase entries (e.g., record network requests), `unusual` for out-of-normal-flow, `human_input` when awaiting user input, `event` for other significant moments.

### How to emit

Append one JSON line using the **Edit** tool (no shell execution needed). Use **Write** to create the file with the first event; use **Edit** to append thereafter.

```json
{
  "timestamp": "2026-01-01T00:00:00.000Z",
  "event_type": "flow_start",
  "title": "Starting write-test flow for Teams page"
}
```

### Flow Summary

After `flow_end`, append a final `summary` event with a `data` object:

| `data` field     | Type                                              |
| ---------------- | ------------------------------------------------- |
| `status`         | `"success"` \| `"failure"` \| `"partial-success"` |
| `summary`        | Executive summary                                 |
| `key_challenges` | Challenges and difficulties encountered           |

```json
{
  "timestamp": "2026-01-01T00:01:00.000Z",
  "event_type": "event",
  "title": "Flow summary",
  "data": {
    "status": "partial-success",
    "summary": "Tests written for the Teams page happy path; coverage gate passed.",
    "key_challenges": "No SSO mock; had to stub at the network layer."
  }
}
```

---

## Session Greeting

On skill invocation and session conclusion, print the skill logo followed by the tagline:

```
⠀⠀⠀⢀⣠⠤⠖⠒⠒⠒⠒⠒⠶⢤⣀
⠀⡠⠚⠉⠀⠀⣠⡶⠖⠒⠶⣦⡀⠀⠀⠉⠒⢄
⠎⠀⠀⠀⢀⣾⠋⠀⣴⣶⣦⠀⠹⣦⠀⠀⠀⠀⢢   The test skill
⠆⠀⠀⠀⢸⣧⠀⠀⢿⣿⡿⠀⢀⣿⠃⠀⠀⠀⢀   is watching
⠈⠢⢀⠀⠀⠙⠳⣦⣄⣉⣤⡶⠟⠁⠀⠀⢀⠔⠁   your back
⠀⠀⠀⠙⠲⠤⣀⣀⣀⣀⣀⣀⡠⠤⠀⠊⠁
```

---

## Violation Formatting

When reporting a violation, include: **rule identifier** (e.g., A.3), **principle name**, and **emoji** if the rule has one.

Example: `🎯 A.3 The focused principle - Test exceeds max statements`

## Severe Violation Escalation

When a violation is severe or the workflow is fundamentally incomplete, print: `🔴 **Test skill needs your attention.**`