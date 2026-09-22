import { createResult, type Result } from "#result"
import type { WahaWebSocketEvent } from "./wahaWebSocketEvent.js"
import { wahaWebSocketObservationCreate } from "./wahaWebSocketObservationCreate.js"
import type { WahaWebSocketObserveOptions } from "./wahaWebSocketObserveOptions.js"
import type { WahaWebSocketObserver } from "./wahaWebSocketObserver.js"

/** Observe the first requested typed event without reconnecting. */
export function wahaWebSocketObserve<TPayload = unknown>(
  options: WahaWebSocketObserveOptions<TPayload>,
): WahaWebSocketObserver<TPayload> {
  let eventResolve: (result: Result<WahaWebSocketEvent<TPayload>>) => void = () => undefined
  const event = new Promise<Result<WahaWebSocketEvent<TPayload>>>((resolve) => {
    eventResolve = resolve
  })
  const observation = wahaWebSocketObservationCreate({
    ...options,
    eventHandler: (typedEvent) => {
      eventResolve(createResult(typedEvent))
      return "complete"
    },
  })
  void observation.completed.then((result) => {
    if (!result.success) eventResolve(result)
  })
  return {
    ready: observation.ready,
    event,
    close: observation.cancel,
  }
}
