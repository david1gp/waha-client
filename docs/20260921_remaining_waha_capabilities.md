# Remaining WAHA capabilities

## Goal
Add confirmed missing library and CLI capabilities against local WAHA 2026.8.2 source at `/home/david/opensource/waha`.

## Decisions and scope
- Existing seven group-membership methods remain unchanged. GOWS join-request HTTP responses are already normalized by the server; do not add speculative normalization.
- Leave eventCancel unchanged: the local server route is commented out and the client already warns about upstream availability.
- Use existing dependencies and Result/session/request conventions. No dependencies or unrelated refactors.
- Sticker files must already be WebP; no conversion feature.

## Approach
- Export messageStickerSend and MessageStickerSendOptions. POST /api/sendSticker with session, chatId, file and optional reply_to, returning WAMessage like messageImageSend.
- Export sessionCappingGet and its options plus MessageCappingData. GET /api/{session}/capping. Fields: cappingStatus string (open set), totalQuota number, usedQuota number, cycleStart and cycleEnd number|null (Unix seconds), mvStatus and oteStatus string|null.
- Export sessionTimelockGet and its options plus ReachoutTimelockData. GET /api/{session}/timelock. Fields: enforcementType string (open set), isActive boolean, timeEnforcementEnds number|null (Unix seconds).
- Preserve default/explicit session resolution and existing error behavior. Add focused mocked-fetch tests for routes, bodies, optional-field omission, response handling and session resolution.
- CLI: add `messages send-sticker --chatId <id> --file <path-or-url> [--reply_to <message-id>]`, `sessions capping`, and `sessions timelock` using existing shared authentication/session flags and JSON/error handling. Sticker URLs become WahaFile URL inputs; local WebP files become base64 with image/webp MIME type and filename. No conversion or new dependencies.
- Test CLI help, HTTP routes/bodies, optional reply handling, local-file input, and explicit session override. Document command examples in the existing CLI documentation.

## Tasks and status
1. Complete: implement three methods, types, exports and focused tests; verify focused tests.
2. Complete: independently review contracts against server source and run full tests/typecheck/build available in package scripts.
3. Complete: expose the three library methods through CLI commands, add focused tests and usage documentation.
4. Complete: independently review CLI changes and run full tests/typecheck/build.

## Current context
The three library methods and CLI commands, types, tests and usage documentation are complete and independently reviewed. Existing group capability work is documented separately in docs/20260921_group_membership_capabilities.md. No release or commit requested.
