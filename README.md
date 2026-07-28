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

waha-client sessions list
waha-client sessions get --session default
waha-client sessions create --name default --start
waha-client sessions start|stop|logout|restart|delete|me

waha-client auth qr
waha-client auth request-code --phoneNumber 491701234567

waha-client chats list
waha-client messages send-text --chatId 123@c.us --text "hello"
waha-client contacts list
waha-client contacts check-exists --phone 491701234567
waha-client groups list
waha-client groups get --id 120363@g.us
waha-client server ping|health|version|status
waha-client profile get
```

Override env per call with `--baseUrl`, `--apiKey`, `--session`.

Stdout is pretty JSON on success. Errors are Result JSON on stderr with exit code 1.

## WAHA

Talks to a running [WAHA](https://github.com/devlikeapro/waha) instance. See the [WAHA docs](https://waha.devlike.pro/) for server setup.

## License

MIT © David Siewert
