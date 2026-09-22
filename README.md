# @adaptive-ds/waha-client

TypeScript client library and CLI for [WAHA](https://waha.devlike.pro/) (WhatsApp HTTP API).

Full endpoint coverage, `Result`-typed errors, Valibot validation, session defaults, and binary responses as `Uint8Array`.

## Features

- **Full WAHA coverage** — sessions, auth (QR / code / passkey), profile, chatting, chats, groups, channels, contacts, lids, labels, presence, status, calls, media convert, events, API keys, apps, storage, server, screenshot
- **Result type** — every fallible call returns `Result<T>` / `PromiseResult<T>` via [`@adaptive-ds/result`](https://github.com/david1gp/result)
- **Valibot-validated** — request options checked at the edge; no silent `any`
- **Session defaults** — set `session` once on the client config; override per call
- **Binary as `Uint8Array`** — QR images, screenshots, media files (not raw `Response`)
- **Library + CLI** — import functions or run `waha-client` from the shell

## Install

```bash
bun add @adaptive-ds/waha-client
```

## Library

```ts
import {
  wahaClientFromEnv,
  wahaClientConfig,
  sessionList,
  authQrGet,
  messageTextSend,
} from "@adaptive-ds/waha-client"

// From env (WAHA_BASE_URL, WAHA_API_KEY, WAHA_SESSION, …)
const fromEnv = wahaClientFromEnv()
if (!fromEnv.success) throw new Error(fromEnv.errorMessage)
const config = fromEnv.data

// Or explicit config
// const cfg = wahaClientConfig({ baseUrl: "http://localhost:3000", apiKey: "…", session: "default" })
// if (!cfg.success) throw new Error(cfg.errorMessage)

const sessions = await sessionList({ config })
if (!sessions.success) throw new Error(sessions.errorMessage)

const qr = await authQrGet({ config }) // Uint8Array PNG by default
if (!qr.success) throw new Error(qr.errorMessage)

const sent = await messageTextSend({
  config,
  chatId: "1234567890@c.us",
  text: "hello",
})
if (!sent.success) throw new Error(sent.errorMessage)
```

### Group responses

HTTP group info methods (`groupList`, `groupGet`, `groupCreate`, and `groupJoinInfoGet`) return `GroupInfo` with `jid` and
`name`. The former `id` and `subject` response fields are not returned.

### WebSocket events

`wahaWebSocketObserve` observes one typed WAHA event, then closes the connection. Supply a Valibot `payloadSchema` so
the event payload is validated at runtime. An optional typed `predicate` runs after validation; returning `false`
ignores that event and keeps observation open. Predicate exceptions return the stable redacted error
`WebSocket event predicate failed`. It uses `config.session` by default, accepts an explicit session override, and uses
`config.timeoutMs` for cleanup. Await `ready` before triggering delivery, then await `event`; call `close()` to cancel.

```ts
import * as a from "valibot"
import { wahaWebSocketObserve } from "@adaptive-ds/waha-client"

const observation = wahaWebSocketObserve({
  config,
  session: "default",
  events: ["message"],
  payloadSchema: a.object({ body: a.string() }),
  predicate: (event) => event.payload.body === "target code",
})
const ready = await observation.ready
if (!ready.success) throw new Error(ready.errorMessage)

const event = await observation.event
if (!event.success) throw new Error(event.errorMessage)
console.log(event.data.payload.body)
```

## Environment

- `WAHA_BASE_URL` (required) — WAHA server base URL (e.g. `http://localhost:3000`)
- `WAHA_API_KEY` (optional) — sent as `X-Api-Key`
- `WAHA_SESSION` (optional) — default session name for session-scoped endpoints
- `WAHA_TIMEOUT_MS` (optional) — request timeout
- `WAHA_RETRIES` (optional) — retry count

Bun loads `.env` automatically when you run via `bun`.

## CLI

```bash
export WAHA_BASE_URL=http://localhost:3000
export WAHA_API_KEY=your-key
export WAHA_SESSION=default

# or: bunx waha-client … / bun run src/cli.ts …
waha-client --help
waha-client version
waha-client sessions list|get|create|update|start|stop|logout|restart|delete|me|capping|timelock|start-all|stop-all|logout-all
waha-client auth qr|request-code|passkey-challenge|passkey-confirmation|passkey-confirm|passkey-post
waha-client profile get|name-set|status-set|picture-set|picture-delete
waha-client server ping|health|version|status|stop|environment|debug-cpu|debug-heapsnapshot|debug-browser-trace|screenshot
waha-client events observe|observe-one|create|cancel
waha-client messages send-text|send-sticker|send-image|send-file|send-voice|send-video|send-link-custom-preview|send-buttons|send-list|forward|send-seen|set-reaction|set-star|send-poll|vote-poll|send-location|send-contact-vcard|reply-buttons|reply|send-link-preview|number-status|message-id-new|list
waha-client chats list|overview|overview-post|delete|picture|messages|messages-delete-all|message-read|message-get|message-delete|message-edit|message-pin|message-unpin|archive|unarchive|unread
waha-client groups list|get|create|count|refresh|join-info|join|delete|leave|picture|picture-set|picture-delete|description-set|subject-set|info-admin-only|info-admin-only-set|messages-admin-only|messages-admin-only-set|member-add-mode|member-add-mode-set|membership-approval|membership-approval-set|invite-code|invite-code-revoke|participants|participants-v2|participants-add|participants-remove|join-requests|join-requests-approve|join-requests-reject|admin-promote|admin-demote
waha-client contacts list|list-one|check-exists|about|profile-picture|block|unblock|get|update
waha-client lids list|count|get|by-phone
waha-client channels list|create|get|delete|message-preview|follow|unfollow|mute|unmute|search-by-view|search-by-text|search-views|search-countries|search-categories
waha-client labels list|create|update|delete|chat-list|chat-set|chats-by-label
waha-client presence set|list|get|subscribe|typing-start|typing-stop
waha-client status send-text|send-image|send-voice|send-video|delete|message-id-new
waha-client calls reject
waha-client media voice-convert|video-convert
waha-client storage file-get|file-delete|s3-object-get
waha-client api-keys create|list|media-create|control-create|update|delete
waha-client apps list|create|get|update|delete|chatwoot-locales

# Examples
waha-client sessions get --session default
waha-client sessions create --name default --sessionConfigJson '{"engine":"NOWEB"}' --start
waha-client auth qr --format image --output qr.png
waha-client messages send-text --chatId 123@c.us --text "hello"
waha-client messages send-sticker --chatId 123@c.us --file ./sticker.webp --reply_to message-id
waha-client events observe --limit 25
```

Override env per call with `--baseUrl`, `--apiKey`, `--session`.

Stdout is pretty JSON on success for regular commands. Errors are Result JSON on stderr with exit code 1.

Nested records and arrays are passed as JSON flags and are forwarded without reshaping. The main JSON inputs are
`--sessionConfigJson`, `--appsJson`, `--responseJson`, `--eventJson`, `--previewJson`, `--buttonsJson`, `--messageJson`,
`--pollJson`, `--contactsJson`, `--paginationJson`, `--filterJson`, `--participantsJson`, `--pictureJson`, `--labelsJson`,
`--bodyJson`, and `--headerImageJson`. Use `waha-client <domain> <command> --help` for each command's required fields.

`--file` accepts a local file, remote URL, or file JSON where the operation expects a `WahaFile`. Commands returning
bytes (`auth qr --format image`, server diagnostics, `screenshot`, storage gets, and media conversion) accept
`--output PATH`; with no output path they print `{ "encoding": "base64", "data": "..." }`, and with a path they write
the bytes and print no success JSON.

`events observe` prints each validated event envelope as one compact JSON line, observes 10 events by default, and
accepts a positive integer `--limit N`. It uses the `WAHA_TIMEOUT_MS` timeout (30 seconds by default), with no separate
CLI timeout flag, and closes successfully after reaching the limit.

## WAHA

Talks to a running [WAHA](https://github.com/devlikeapro/waha) instance. See the [WAHA docs](https://waha.devlike.pro/) for server setup.

## License

MIT © David Siewert
