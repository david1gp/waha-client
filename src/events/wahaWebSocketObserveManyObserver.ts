import type { PromiseResult } from "#result"

export type WahaWebSocketObserveManyObserver = {
  /** Resolves when the WebSocket is open, or with a Result error if it cannot become ready. */
  readonly ready: PromiseResult<void>
  /** Resolves when onEvent completes observation, or with a Result error. */
  readonly completed: PromiseResult<void>
  /** Cancel observation and close the WebSocket. This operation is idempotent. */
  close(): void
}
