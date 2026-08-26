import type { PromiseResult } from "#result"
import type { WahaWebSocketEvent } from "./wahaWebSocketEvent.js"

export type WahaWebSocketObserver<TPayload> = {
  /** Resolves when the WebSocket is open, or with a Result error if it cannot become ready. */
  readonly ready: PromiseResult<void>
  /** Resolves with the first requested event whose payload and optional predicate pass validation. */
  readonly event: PromiseResult<WahaWebSocketEvent<TPayload>>
  /** Cancel observation and close the WebSocket. This operation is idempotent. */
  close(): void
}
