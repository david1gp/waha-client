# CLI method parity

## Goal
Expose every public library operation through a discoverable CLI command. Exclude types, constants, configuration, request/path utilities, and internal helpers. Preserve existing CLI behavior and current worktree changes.

## Decisions
- Use the existing Stricli framework, Result handling, configuration flags, and installed libraries.
- Provide explicit domain commands, not only a generic API passthrough.
- Follow existing scalar flag conventions; complex objects/arrays may use documented JSON flags. No interactive input or confirmation requirements.
- Preserve library validation, session resolution, payloads, query options, and binary response semantics. Expose eventCancel even though upstream support may be unavailable.
- Include bulk session methods, both contact list variants, and both WebSocket observation methods.
- Load code-style instructions for TypeScript changes. Avoid unrelated refactoring and dependencies.

## Approach
First establish small shared CLI construction/parsing helpers only if useful and a precise command inventory. Then implement independent bounded-context adapters. Integrate registration, documentation, and a public-operation coverage regression test. Verify via local mocked requests and CLI help; do not invoke destructive live endpoints.

## Tasks
1. Establish shared adapter conventions/helpers and exact operation inventory with command mapping. Do not implement all domains in this step.
2. Implement session, auth, profile, server, and event missing commands.
3. Implement messages, chats, presence, status, calls, media, and storage missing commands.
4. Implement groups, contacts, LIDs, channels, and labels missing commands.
5. Implement API-key/app commands; integrate all route registration, user documentation, and complete operation coverage tests.
6. Independently verify parity, payload/option forwarding, help discoverability, existing compatibility, tests, and build; fix scoped issues if found.

## Status
- Task 1: completed.
- Tasks 2–4: completed.
- Task 5: completed.
- Task 6: completed.

## Current context
Public operations are exported from src/index.ts; domain commands live under src/<domain>/cli and root registration is src/cli/cliApp.ts. Existing worktree contains a broad source reorganization; preserve it and do not reset or commit changes. Existing commands cover only a subset of sessions/auth/profile/server/messages/chats/groups/contacts/events.
Task 1 inventory and exact mappings are in docs/20260922_cli_method_inventory.md. Shared helpers provide scalar descriptors, JSON Result parsing, and binary output. Domain agents own only their assigned directories/tests; root registration remains task 5.
All domain adapters and root routes are implemented, including API keys/apps. README contains the command catalog and JSON/binary usage. test/cliOperationCoverage.test.ts derives operations from public exports and checks explicit adapters and runtime route reachability. Sessionless operations omit unsupported session flags; observer commands expose timeout handling and close connections on failure. Implementation and independent review are complete.
