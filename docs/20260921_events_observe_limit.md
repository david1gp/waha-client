# Bounded CLI event observation

## Goal
Add `events observe --limit N`, defaulting to 10 emitted events, then close successfully. This increment does not implement the remaining HTTP CLI methods.

## Decisions
- Preserve existing CLI commands and single-event library observer behavior.
- Use one continuous WebSocket connection; reconnecting per event would lose events.
- Print each validated event envelope as one compact JSON line, accepting arbitrary payloads.
- Accept only positive integer limits; reject invalid values before connecting.
- Reuse existing configuration, session selection, Result errors, dependencies, and observation timeout behavior.
- Close on limit, failures, timeout, or interruption; do not add new timeout/filter flags.

## Approach
Introduce the smallest reusable streaming support needed around the existing WebSocket implementation while preserving single-event callers. Register the CLI route with the existing CLI library. Avoid duplicate WebSocket protocol/validation logic. Use installed dependencies and project code-style guidance.

## Tasks
1. Implement continuous multi-event observation support with focused tests preserving the existing observer contract.
2. Implement and document the CLI command using that support; test limits, JSON lines, errors, connection cleanup, and configuration.
3. Independently verify behavior and regression tests.

## Status
- Task 1: completed.
- Task 2: completed.
- Task 3: completed.

## Current context
`wahaWebSocketObserveMany` shares the observation core with the preserved single-event API. Its synchronous `onEvent` callback returns `"continue"` or `"complete"`; callers await `ready` and `completed`, and cancel with `close()`. The default observation timeout remains 30 seconds.
The CLI route is registered, accepts a positive safe integer limit with default 10, emits JSON lines, and closes the observation on signals. README usage is included.
