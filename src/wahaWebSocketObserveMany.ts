import { wahaWebSocketObservationCreate } from "./wahaWebSocketObservation.js"
import type { WahaWebSocketObserveManyObserver } from "./wahaWebSocketObserveManyObserver.js"
import type { WahaWebSocketObserveManyOptions } from "./wahaWebSocketObserveManyOptions.js"

/** Observe validated events continuously on one WebSocket connection. */
export function wahaWebSocketObserveMany<TPayload = unknown>(
  options: WahaWebSocketObserveManyOptions<TPayload>,
): WahaWebSocketObserveManyObserver {
  const observation = wahaWebSocketObservationCreate({
    ...options,
    eventHandler: options.onEvent,
  })
  return {
    ready: observation.ready,
    completed: observation.completed,
    close: observation.cancel,
  }
}
