import type * as a from "valibot"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import type { WahaWebSocketEvent } from "./wahaWebSocketEvent.js"

export type WahaWebSocketObserveOptions<TPayload = unknown> = {
  config: WahaClientConfig
  /** Valibot schema used to validate and type the matching event payload. */
  payloadSchema: a.GenericSchema<unknown, TPayload>
  /** Overrides config.session. Omit to observe events from all sessions. */
  session?: string
  /** WAHA event names to subscribe to. Omit to use WAHA's default event set. */
  events?: readonly string[]
  /** Runs after validation; return false to keep observing without delivering the event. */
  predicate?: (event: WahaWebSocketEvent<TPayload>) => boolean
}
