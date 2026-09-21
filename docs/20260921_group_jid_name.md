# Group response jid/name

## Goal
Expose group information consistently as `jid` and `name`, close to GOWS naming. The user accepts the breaking replacement of `GroupInfo.id` and `GroupInfo.subject`. Commit using the commits skill, then release and verify GitHub Actions and npm publication.

## Decisions
- Scope is HTTP `GroupInfo` responses from groupList, groupGet, groupCreate, and groupJoinInfoGet.
- Accept GOWS `JID`/`Name`, existing WAHA `id`/`subject`, and normalized `jid`/`name` as input; return only `jid`/`name` for group identity/name.
- Use existing Valibot and Result/error conventions. Validate responses rather than asserting unknown JSON is GroupInfo.
- Keep request option IDs, wire sort fields, participant IDs, join results, and WebSocket envelopes unchanged. No unrelated API redesign.
- Preserve other existing GroupInfo fields, mapping their GOWS equivalents where necessary for truthful output. Fields legitimately omitted by server responses must be optional, not fabricated. Use source-backed participant/capability mappings only.
- Do not assume an empty string is missing. Prefer canonical client input fields, then canonical WAHA fields, then GOWS fields when present; validate types.
- Release target: 0.5.0, a breaking minor version in the existing pre-1.0 series.
- Preserve all pre-existing unrelated working-tree edits; commit only changes belonging to this task. No real group data queries required.
- Use installed libraries and code-style skill for TypeScript changes. No additional dependencies.

## Approach
Implement a small shared response-validation/normalization boundary and apply it to the four methods, preserving existing error handling. Cover GOWS and canonical WAHA fixtures, missing optional fields, invalid required fields, and list behavior. Update relevant public usage documentation and type tests. Independently review the change, then delegate commits and release in sequence.

## Tasks and status
1. Implement normalization, types, documentation and focused tests; run typecheck/tests/build. Status: completed.
2. Independently review scope, correctness and verification; resolve any findings. Status: completed.
3. Delegate a fresh Luna agent to load commits skill, create conventional commits and push task changes. Status: completed.
4. Delegate a fresh Luna agent to release 0.5.0, monitor GitHub Actions through completion, verify GitHub release and npm package; diagnose and correct failures and retry/re-release as necessary. Status: pending.

## Current context
- Working repository version is 0.4.1. The four group methods now share a Valibot response normalizer and expose jid/name.
- Deployed WAHA 2026.8.2 GOWS returns raw GOWS JSON for the four methods. Its OpenAPI does not provide concrete response schemas for these routes. The normalized GroupInfo schema is used for events instead.
- Relevant areas: src/groupTypes.ts, the four group method files, src/wahaRequest.ts, test/groupApi.test.ts, README.md, ops/release.sh and .github/workflows/publish.yml.
- Pre-existing edits include group capability work in README, CLI, index, tests and untracked capability files. Preserve and distinguish these from this task.
- The implementation baseline patch is /tmp/opencode/waha-client-baseline-20260921.patch; use it to distinguish pre-existing changes during review and commits.
- The implementation and independent review are complete. Commit only the group response normalization and its documentation/tests; leave the baseline capability work intact and uncommitted.
