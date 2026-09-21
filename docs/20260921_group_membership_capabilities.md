# Group membership capabilities

## Goal
Expose the seven existing WAHA group endpoints for member-add mode, membership approval, and join-request management as typed client methods.

## Decisions and scope
- Keep existing public methods and generic `wahaRequest` unchanged.
- Follow current group-method naming, validation, session resolution, request handling, and export conventions.
- Use existing dependencies; do not add libraries.
- Match request and response types to the local server implementation at `/home/david/opensource/waha/src/api/groups.controller.ts` and `/home/david/opensource/waha/src/structures/groups.dto.ts`; inspect engine implementations where response contracts need clarification.
- No server changes, unrelated refactoring, publishing, or commits.

## Endpoints
Under `/api/{session}/groups/{id}`:
- GET/PUT `settings/security/member-add-mode`; PUT body `{ membersCanAddNewMember: boolean }`.
- GET/PUT `settings/security/membership-approval`; PUT body `{ newMembersApprovalRequired: boolean }`.
- GET `participants/join-requests`.
- POST `participants/join-requests/approve` and `participants/join-requests/reject`; body `{ participants: [{ id: string }] }`.

## Tasks
1. Implement seven methods, option/response types, and package-root exports. Verify type checking.
2. Add focused mocked-fetch tests for routing, bodies (including false), session handling, response mapping, and invalid inputs, following existing tests. Update existing API documentation if it enumerates group capabilities. Run targeted and full available checks.
3. Independently review endpoint contracts, exports, and regression results; fix any verified discrepancy.

## Status and current context
- Existing exports and authoritative server endpoints inspected; the quoted capability gap is confirmed.
- Task 1: completed; seven methods and public types/exports implemented.
- Task 2: completed; focused endpoint coverage added; existing README does not enumerate group capabilities.
- Task 3: completed; independent review confirmed server-contract alignment and public exports.
