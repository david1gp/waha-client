# Communities for WAHA (fork) + waha-client

## Goal

Full WhatsApp Communities support across the stack, replacing the one-off standalone
whatsmeow Go bypass built in `wamessenger/ops/community-link/` (paired extra device,
used once to link 255 groups into 54 communities on Leo's account):

1. WAHA backend: our forks under `~/adaptive`, engines **GOWS + NOWEB** only.
2. `waha-client`: typed ops + CLI mirroring the new WAHA endpoints.
3. Deploy: switch our instance `~/cs/waha` to the fork, build, deploy, live-verify.
4. Maintain: timer in `~/ds` keeps the forks updated from upstream.

Feature ceiling = **what whatsmeow supports**. Where whatsmeow has no typed API,
the feature is out of scope (listed under Excluded), even if Baileys could do it.

## Status

Tasks 1–7 plus the raw-IQ fix are deployed (gows-plus `master`=`13ba9e3`,
release `v1.0.49.2`; waha `core`=`d7711669`; waha-client `main`=`5cad98b` + this
doc `c940e10`; plan-status edits after `c940e10` stay uncommitted until the
final wrap-up commit). Task 8 confirms community creation, subgroup reads,
linked-participant reads, link, unlink, and subgroup creation live. Membership
routing is deployed in gows-plus `v1.0.49.3` (`6404401`) and WAHA `d1c1aca2`:
ordinary members are added to the announcement/default subgroup, never the
community parent. `TEST9` proves create-time seeding and that parent-addressed
adds resolve to the default subgroup. Next: Task 9 upstream-update timer in
`~/ds` and final wrap-up.
Runtime is x86_64, so the missing `gows-arm64` asset does not block deployment.

## Decisions

- Forks: `david1gp/waha` → `~/adaptive/waha` (base: tag `2026.10.1`, `core@c42f68a`,
  matches deployed instance and waha-client 2026.10 targeting) and
  `david1gp/gows-plus` → `~/adaptive/gows-plus` (base: `v1.0.49`, the ref pinned in
  WAHA `waha.config.json`). GOWS is a separate Go/gRPC repo — no GOWS community op
  exists without forking it too.
- Branch `feat/communities` in both forks and in waha-client; implementation in
  mktemp git worktrees; merge to each repo's mainline (`core` / fork default / `main`)
  only after verification.
- **No new `/communities` controller.** A community is a group with `isParent`; all
  existing WAHA group endpoints (subject, description, picture, participants add/remove,
  promote/demote, invite-code, join-requests, security settings, leave) already address
  a `…@g.us` id and stay the single path. New surface is only the community-specific
  delta below. This keeps the fork diff small for upstream sync + a future upstream PR
  against devlikeapro/waha#638.
- **Community membership routing.** A parent group's participants are its admins.
  Ordinary member adds, including participants supplied when creating a community,
  go to the announcement/default subgroup for both GOWS and NOWEB. The explicit
  participant-add endpoint also routes parent-JID adds there; remove/promote/demote
  remain addressed to the JID the caller supplied.
- WEBJS/WPP: new session methods default-throw `NotImplementedByEngineError` (501)
  in `session.abc.ts` — zero code, clean failure.
- NOWEB must not call Baileys `communityMetadata()` (broken, WhiskeySockets/Baileys#2753:
  server returns `<group>`, extractor expects `<community>`). Reads go via
  `groupMetadata()`. Do not unify whatsmeow `group_join` vs Baileys `community_join`
  inner tags without live evidence; each engine keeps its library's stanza.
- No live writes on Leo's real groups/communities during development. Live verify
  (Task 8) uses one disposable test community + group and leaves both afterwards.

## WAHA API contract (new/changed only)

Base `/api/{session}`. `id` = community `…@g.us`. DTO style mirrors `groups.dto.ts`.

| Method + path | Change | Engine backing |
|---|---|---|
| `POST /groups` | body += `isParent?: boolean`, `linkedParentId?: string` (mutually exclusive, validated) | whatsmeow `CreateGroup{GroupParent.IsParent}` / `{GroupLinkedParent.LinkedParentJID}`; Baileys `communityCreate` / `communityCreateGroup` (plain: existing `groupCreate`) |
| `POST /groups/{id}/link` | body `{groupId}` | whatsmeow `LinkGroup(parent=id, child=groupId)`; Baileys `communityLinkGroup(groupId, id)` |
| `POST /groups/{id}/unlink` | body `{groupId}` | whatsmeow `UnlinkGroup`; Baileys `communityUnlinkGroup` |
| `GET /groups/{id}/subgroups` | → `[{id, name, isDefaultSubGroup}]` | whatsmeow `GetSubGroups` (`GroupLinkTarget`); Baileys `communityFetchLinkedGroups` |
| `GET /groups/{id}/linked-participants` | → participant id list (union over subgroups) | whatsmeow `GetLinkedGroupsParticipants`; NOWEB: derive via subgroups + `groupMetadata` union, else default-throw with plan-update note |
| `GET /groups`, `GET /groups/{id}` | `GroupInfo` += `isParent`, `linkedParentId?`, `isDefaultSubGroup` | whatsmeow `GroupInfo.IsParent/LinkedParentJID/IsDefaultSubGroup`; Baileys `GroupMetadata.isCommunity/linkedParent/isCommunityAnnounce` (mapped in both `ToGroupInfo`) |

Session layer (`session.abc.ts`): `linkGroup(id, groupId)`, `unlinkGroup(id, groupId)`,
`getSubGroups(id)`, `getLinkedGroupsParticipants(id)`, `createGroup` request extended.
GOWS proto: `rpc LinkGroup`, `rpc UnlinkGroup`, `rpc GetSubGroups`,
`rpc GetLinkedGroupsParticipants`, `CreateGroupRequest` += parent fields,
group-info message += `is_parent`, `linked_parent_jid`, `is_default_sub_group`.
Announcement group = subgroup with `isDefaultSubGroup`; server auto-creates it.

## waha-client contract

Mirror 1:1, existing conventions (one export per file under `src/groups/`,
`*Options.ts` + Valibot + `wahaResolveSession` + `Result`, index export, CLI command
— `cliOperationCoverage` enforces CLI parity):

- `groupCreate` request += `isParent?`, `linkedParentId?` (+ CLI flags).
- New ops: `groupLink`, `groupUnlink`, `groupSubgroupList`, `groupLinkedParticipantList`
  (+ Options/response types as needed). CLI: `groups link|unlink|subgroups|linked-participants`.
- `GroupInfo` += `isParent?`, `linkedParentId?`, `isDefaultSubGroup?`;
  `groupInfoResponseNormalize` maps GOWS raw fields (verify exact wire names from
  WAHA `types.group.ts` during Task 5).
- Tests: mock-fetch style of `test/groupApi.test.ts` (URL/method/body, session override,
  invalid-input no-fetch) + CLI round-trip. README endpoint lists updated.

## Excluded (no whatsmeow typed API)

Deactivate/delete community; non-admin subgroup-creation toggle; `create_general_chat`
flags; member share-history setter for communities; atomic create-with-description/picture
(use existing `PUT …/description` / `…/picture` after create); list-communities endpoint
(filter `GET /groups` by `isParent`); webhook link/unlink event mapping
(`ToGroupV2UpdateEvent` follow-up, note in PR description only).

## Tasks

Each task is one delegated increment: smallest correct change, return changed files +
verification commands/results only. No e2e suites except where a task says so.

1. **Forks + baselines.** `gh repo fork devlikeapro/waha` and `devlikeapro/gows-plus`
   (owner `david1gp`), clone to `~/adaptive/waha` + `~/adaptive/gows-plus`, remotes
   `origin`=fork / `upstream`=devlikeapro, branch `feat/communities` from `2026.10.1`
   resp. `v1.0.49`. mktemp worktrees for all three repos (waha-client from `main`,
   copy `.env*` if present). Baselines: WAHA `yarn install` + `yarn build` + unit project;
   gows-plus `go build ./...` (+ inspect its release workflow: how `gows-<arch>` release
   assets are produced — needed by Task 2); waha-client `bun install` + targeted group tests.
2. **gows-plus Go.** Proto additions above; handlers in `src/server/groups.go` calling
   whatsmeow; `CreateGroup` plumbs `IsParent`/`LinkedParentJID`; group-info conversion
   preserves parent fields (verify `Storage.Groups` cache type keeps them, fix if dropped).
   Verify: `go build ./...`, `go vet`, existing Go tests. Release manually on the fork
   (upstream CI publish step is commented out + targets devlikeapro with a secret we
   don't have): tag `v1.0.49.1` (fork-distinct, avoids colliding with a future upstream
   `v1.0.50`), `gh release create` + upload `gows-amd64`, `gows-arm64`, `gows.proto`.
3. **WAHA shared layer.** Step 0: unblock `yarn install` with a checksum-only refresh
   of the wa-js lockfile entry (same pinned commit; separate commit; stop and report if
   the lockfile diff is not confined to that entry). Then `session.abc.ts` methods (default-throw), `groups.dto.ts`
   (`CreateGroupRequest` fields + validation, `GroupInfo` fields, subgroup DTO),
   `groups.controller.ts` routes (same guard/`SessionApiParam` pattern). Verify: `yarn build`, `yarn lint`.
4. **WAHA engines.** GOWS: bump `waha.config.json` gows repo/ref to Task 2 release,
   regen stubs (`yarn gows:proto` / `make proto-gows`), implement methods in
   `session.gows.core.ts` (promisify pattern), extend `ToGroupInfo` (`groups.gows.ts`,
   `types.group.ts`). NOWEB: implement methods in `session.noweb.core.ts` via
   `this.sock.community*`, extend `ToGroupInfo` (`groups.noweb.ts`), check NOWEB group
   store cache retains new metadata fields. Add jest unit tests for both `ToGroupInfo`
   mappers (no group tests exist today). Verify: `yarn build`, `yarn lint`, `yarn test` (unit project only).
5. **waha-client.** Contract above. Verify targeted test files during work;
   `bun run check` + `bun run build` once at the end.
6. **Merge + push.** Commits skill per repo; merge `feat/communities` to mainlines;
   push forks + waha-client; remove worktrees/branches; upstream PRs are *not* opened
   in this plan (separate user decision) but commit messages reference waha#638.
7. **Deploy `~/cs/waha`.** First inspect (read-only) how the instance is built/run
   (compose/Dockerfile/image refs, env, data volumes). Switch build to `~/adaptive/waha`
   fork; keep previous image tag as rollback. Build (both engine images if the setup
   splits `build-gows`/`build-noweb`), deploy with the instance's existing mechanism,
   confirm sessions (`Leo`/`Leo3`) come back `WORKING` and new routes answer
   (authenticated `GET …/groups/{any}/subgroups` not 404).
8. **Live verify.** Via waha-client CLI against the deployed instance, GOWS session:
   create disposable community (`isParent`) → read back `isParent=true` → create
   disposable group → `groups link` → `groups subgroups` contains it (+ group read shows
   `linkedParentId`) → `linked-participants` returns members → create subgroup via
   `linkedParentId` → unlink first group → leave/delete all test artifacts.
   NOWEB: same smoke only if a NOWEB session exists on the instance; else record
   NOWEB as unit-verified only. Pace writes (~5s apart), stop on first unexpected error.
9. **Timer in `~/ds`.** First inspect existing `~/ds` timer patterns (units/scripts/naming).
   Add waha following the same pattern: fetch upstream `core` → merge into fork `core`
   (and gows-plus upstream → fork), build/test gate if the pattern has one, fail loudly
   on merge conflict (never force). Dry-run/show next-fire before enabling.

## Risks / open checks for implementers

- Server error codes for link/unlink (non-admin, already-linked, quota ≤100 subgroups)
  are untyped `IQError`s in whatsmeow — WAHA handlers surface the engine error as today;
  do not invent a mapping without live evidence.
- GOWS cache staleness was observed in Leo's run (WAHA showed parent for 30/255 after
  external linking). Linking *through* WAHA should update its own cache; Task 8 read-back
  is the proof — if stale, use existing `POST /groups/refresh` and record behavior.
- gows-plus fork release mechanics (Task 1 inspection) gate Task 4's config bump;
  if no CI builds assets, build binaries locally with `gh release create` uploads.
