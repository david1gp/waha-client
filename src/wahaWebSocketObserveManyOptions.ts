import type { WahaWebSocketEvent } from "./wahaWebSocketEvent.js"
import type { WahaWebSocketObserveOptions } from "./wahaWebSocketObserveOptions.js"

export type WahaWebSocketObserveManyOptions<TPayload = unknown> = WahaWebSocketObserveOptions<TPayload> & {
  /** Runs synchronously for each validated event. Return complete to close successfully. */
  onEvent: (event: WahaWebSocketEvent<TPayload>) => "continue" | "complete"
}
