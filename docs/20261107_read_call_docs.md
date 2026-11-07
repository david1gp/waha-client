# Read-call docs: live fetch vs cached read

## Goal

Make it clear in waha-client that read ops are real calls into WAHA, whose
engine (GOWS / NOWEB / WEBJS) serves many reads from its own store/cache —
so results can be stale — while other reads force a live WhatsApp fetch.
Each read op gets a 1-line JSDoc for fast lookup (IDE hover, `.d.ts`), and
the README gets a short banner section explaining the model.

Out of scope per user decision: mutations (POST/PUT/DELETE writes such as
`messageTextSend`, `groupCreate`) get no new docs — live/cached only makes
sense for fetches.

## Facts (from delegated exploration, 2026-11-07)

- ~188 public ops (186 HTTP + 2 WebSocket observers), one export per file
  under `src/{domain}/`, all funneling through `src/client/wahaRequest.ts`
  (`fetch`, `X-Api-Key`, 30 s timeout, `Result` errors). Zero JSDoc on HTTP
  ops today (only `@deprecated` on 3 session ops).
- waha-client itself caches **nothing**: no Map/localStorage/memo anywhere
  in `src/`; config is only `{ baseUrl, apiKey?, session?, timeoutMs?,
  retries? }`. Every op = exactly one HTTP fetch to WAHA.
- Caching is downstream in WAHA/engine (proven from WAHA + gows-plus code):
  - GOWS groups: 24 h group-info cache (`storage_groups_cache.go`,
    `refreshInterval = 24 * time.Hour`); served from store unless forced.
    Leo's run saw this: WAHA showed parent for only 30/255 after external
    linking (see `docs/20261107_communities.md`). Remedy:
    `POST /groups/refresh` (`groupRefresh`).
  - Profile/chat pictures: WAHA `NodeCache` 24 h TTL; `refresh=true` forces
    live fetch; WAHA warns refresh can hit rate limits.
  - NOWEB: persistent store serves groups from DB until `refreshGroups`;
    in-memory store fetches participating groups live per call; single
    `getGroup` is store-only (throws on miss). WEBJS reads go through the
    wa-js in-page store; `refreshGroups` is a no-op there.
  - Live reads (proven): number checks (`CheckPhones` / `onWhatsApp`),
    picture with `refresh=true`, invite info (`groupGetInviteInfo`),
    auth QR/code.
- No ban-risk wording exists in waha-client or WAHA docs — do not invent
  one. The only source-backed caution is the picture-refresh rate limit.

## Decisions (user, upfront Q&A)

- Form: 1-line JSDoc above each read op + short README banner section.
  No separate lookup table (drift risk).
- Scope: reads/fetches only — all `GET` ops plus read-only `POST` queries
  (chat overview POST, channel search POSTs). `groupRefresh` (POST) is
  included as the cache-busting fetch trigger. Mutations untouched.
  WebSocket observers keep their existing JSDoc.
- Tags (exactly one per read op):
  - `Cached read` — WAHA/engine may serve from store/cache; may be stale.
  - `Live fetch` — forces a live WhatsApp query via the engine.
  - `WAHA-local read` — answered by WAHA itself; no WhatsApp call
    (server/session records, apiKeys, apps, storage, media inspect).
  - Picture GETs: `Cached read (24h)` + note `refresh=true` forces live
    fetch, rate-limit risk.
  - Where engine backing was not traced for all engines, say "engine
    store/cache" generically — never claim a per-engine TTL that was not
    proven (only GOWS groups 24 h and pictures 24 h are proven).

## JSDoc format

One line, directly above `export async function <op>`:

```
/** <Tag> · <METHOD> <resolved WAHA path> — <short purpose>[; staleness/refresh note]. */
```

Examples:

- `/** Cached read · GET /api/{session}/groups — list joined groups from engine store/cache (may be stale; see groupRefresh). */`
- `/** Live fetch · GET /api/checkNumberStatus — live-check if a phone number is on WhatsApp. */`
- `/** Cached read (24h) · GET /api/{session}/chats/{chatId}/picture — chat picture; refresh=true forces live fetch (rate-limit risk). */`
- `/** WAHA-local read · GET /api/server/version — WAHA server version; no WhatsApp call. */`

Path form: resolved form (`/api/{session}/…` for `wahaPathSession`,
`/api/…` for `wahaPathApi`, verbatim `/ping` / `/health`).
Docs only — no signature, logic, or export changes. Keep existing
`@deprecated` lines intact.

## README banner

Short section (under `## Library`), working title `### Reads: live vs
cached`: waha-client caches nothing (1 op = 1 WAHA fetch); WAHA's engine
(GOWS/NOWEB/WEBJS) may serve reads from its store/cache, so reads can be
stale; proven caches: GOWS groups 24 h, pictures 24 h; use `groupRefresh`
/ `refresh=true` to force live data (pictures: rate-limit caution); each
read op's JSDoc carries its tag. Writes are always live WhatsApp actions
on the paired account (one sentence — that's the user's "real WhatsApp
API calls" point).

## Tasks

1. Worktree (mktemp, branch off `main` @ `419a2d0`, bun install, baseline
   `bun run check`) + classification table: every read op (file, METHOD,
   resolved path, tag, 1-line purpose). No `src/` edits. Main agent
   reviews the table before implementation.
2. JSDoc implementation per domain batch in the worktree, using the
   approved table verbatim; disjoint folders may run in parallel; no
   format/build runs until the verify task.
3. README banner section.
4. Verify in worktree: `bun run check` (biome format check + type-check +
   tests) and `bun run build` (confirm JSDoc survives into `dist/*.d.ts`,
   spot-check 3 ops). Fix, then commits skill → merge to `main` → cleanup
   worktree/branch → push.

## Current status

- Exploration + user decisions done. Task 1 done: worktree
  `/tmp/waha-client-read-docs-8mcP1J/waha-client` (branch
  `docs/read-call-docs` @ `419a2d0`), baseline `bun run check` PASS
  (175 tests). Classification: 78 reads (74 GET + 4 POST), 108 mutations
  excluded, 2 WS observers already documented. 78 + 108 = 186 ✓.
- All 78 read ops annotated (Cached read 37, Live fetch 12(+2 overload
  lines on `authQrGet`), WAHA-local read 29) + README banner. Presence
  wording uses generic "engine presence cache" (1 h TTL proven for GOWS
  only).
- 11 initially-uncertain tags resolved from WAHA source: Live fetch —
  `contactAboutGet` (WEBJS/WPP only), `groupInviteCodeGet`,
  `groupParticipantJoinRequestList`, `channelMessagePreviewGet`,
  `channelSearchByView/ByText`; WAHA-local — `sessionMe` (session
  state), `authPasskeyConfirmationGet` (GOWS pairing state),
  `channelSearchViewsGet/CountriesGet/CategoriesGet` (static WAHA
  constants). Pre-existing `@deprecated` on `numberStatusCheck` /
  `messagesGet` sits on their option schemas, not the exports — no
  merge needed.
- Verified in worktree: `bun run check` PASS (biome clean, 0 type
  errors, 175 tests), `bun run build` PASS, JSDoc present in generated
  `dist/*.d.ts` (spot-checked incl. `authQrGet` overloads), diff
  insertions-only. Remaining: commits, merge to `main`, push, cleanup.
- Untracked `docs/20261107_communities.md` in main checkout is a separate
  thread's plan — leave it untouched; the worktree starts from committed
  `main`, this plan file is copied in for subagents.
