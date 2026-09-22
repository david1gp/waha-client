import * as a from "valibot"
import { createResult, createResultError, type PromiseResult, type Result } from "#result"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import type { WahaWebSocketEvent } from "./wahaWebSocketEvent.js"
import type { WahaWebSocketObserveOptions } from "./wahaWebSocketObserveOptions.js"

const DEFAULT_TIMEOUT_MS = 30_000
const OP = "wahaWebSocketObserve"

const wahaWebSocketObserveOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((value) => typeof value === "object" && value !== null),
  payloadSchema: a.custom<a.GenericSchema>((value) => wahaWebSocketSchemaIsValid(value)),
  session: a.optional(a.pipe(a.string(), a.minLength(1))),
  events: a.optional(a.array(a.pipe(a.string(), a.minLength(1)))),
  predicate: a.optional(
    a.custom<(event: WahaWebSocketEvent<unknown>) => boolean>((value) => typeof value === "function"),
  ),
  eventHandler: a.custom<(event: WahaWebSocketEvent<unknown>) => WahaWebSocketEventAction>(
    (value) => typeof value === "function",
  ),
})

const wahaWebSocketEventEnvelopeSchema = a.looseObject({
  id: a.optional(a.string()),
  timestamp: a.optional(a.number()),
  event: a.pipe(a.string(), a.minLength(1)),
  session: a.pipe(a.string(), a.minLength(1)),
  metadata: a.optional(a.record(a.string(), a.unknown())),
  me: a.optional(a.unknown()),
  payload: a.unknown(),
  environment: a.optional(a.unknown()),
  engine: a.optional(a.string()),
})

const ERRORS = {
  cancelled: "WebSocket observation cancelled",
  closedBeforeEvent: "WebSocket closed before a matching event was received",
  closedBeforeReady: "WebSocket closed before ready",
  construction: "WebSocket construction failed",
  envelope: "Invalid WebSocket event envelope",
  listener: "WebSocket listener setup failed",
  message: "Invalid WebSocket message",
  options: "Invalid WebSocket observation options",
  payload: "Invalid WebSocket event payload",
  predicate: "WebSocket event predicate failed",
  protocol: "WAHA WebSocket URL must use http or https",
  unavailable: "WebSocket is unavailable",
  timeout: "WebSocket observation timed out",
  webSocketError: "WebSocket error",
  url: "Invalid WAHA base URL",
} as const

type WahaWebSocketEnvelope = WahaWebSocketEvent<unknown>
type WahaWebSocketEventAction = "continue" | "complete"

type WahaWebSocketObservationOptions<TPayload> = WahaWebSocketObserveOptions<TPayload> & {
  eventHandler: (event: WahaWebSocketEvent<TPayload>) => WahaWebSocketEventAction
}

type WahaWebSocketObservation = {
  readonly ready: PromiseResult<void>
  readonly completed: PromiseResult<void>
  cancel(): void
}

function wahaWebSocketSchemaIsValid(value: unknown): value is a.GenericSchema {
  if (typeof value !== "object" || value === null) return false

  try {
    return "~run" in value && typeof value["~run"] === "function"
  } catch {
    return false
  }
}

function wahaWebSocketError(message: string): WahaWebSocketObservation {
  const result = createResultError(OP, message)
  return {
    ready: Promise.resolve(result),
    completed: Promise.resolve(result),
    cancel: () => undefined,
  }
}

function wahaWebSocketUrl(
  config: WahaClientConfig,
  session: string | undefined,
  events: readonly string[] | undefined,
): Result<string> {
  try {
    if (typeof config.baseUrl !== "string") return createResultError(OP, ERRORS.url)

    const url = new URL(config.baseUrl)
    if (url.protocol !== "http:" && url.protocol !== "https:") return createResultError(OP, ERRORS.protocol)

    url.protocol = url.protocol === "https:" ? "wss:" : "ws:"
    url.pathname = `${url.pathname.replace(/\/+$/, "")}/ws`
    url.hash = ""

    if (typeof config.apiKey === "string" && config.apiKey !== "") url.searchParams.set("x-api-key", config.apiKey)

    const resolvedSession = session ?? config.session
    if (typeof resolvedSession === "string" && resolvedSession !== "") url.searchParams.set("session", resolvedSession)

    for (const event of events ?? []) url.searchParams.append("events", event)

    return createResult(url.toString())
  } catch {
    return createResultError(OP, ERRORS.url)
  }
}

function wahaWebSocketEnvelopeParse(
  data: unknown,
  events: readonly string[] | undefined,
): Result<WahaWebSocketEnvelope | undefined> {
  if (typeof data !== "string") return createResultError(OP, ERRORS.message)

  let value: unknown
  try {
    value = JSON.parse(data)
  } catch {
    return createResultError(OP, ERRORS.message)
  }

  try {
    if (events !== undefined && typeof value === "object" && value !== null && !Array.isArray(value)) {
      const eventName = (value as Record<string, unknown>).event
      if (typeof eventName === "string" && !wahaWebSocketEventRequested(eventName, events))
        return createResult(undefined)
    }

    const parsed = a.safeParse(wahaWebSocketEventEnvelopeSchema, value)
    if (!parsed.success) return createResultError(OP, ERRORS.envelope)
    return createResult(parsed.output as WahaWebSocketEnvelope)
  } catch {
    return createResultError(OP, ERRORS.envelope)
  }
}

function wahaWebSocketPayloadParse<TPayload>(
  payloadSchema: a.GenericSchema<unknown, TPayload>,
  payload: unknown,
): Result<TPayload> {
  try {
    const parsed = a.safeParse(payloadSchema, payload)
    if (!parsed.success) return createResultError(OP, ERRORS.payload)
    return createResult(parsed.output)
  } catch {
    return createResultError(OP, ERRORS.payload)
  }
}

function wahaWebSocketEventPredicateRun<TPayload>(
  predicate: ((event: WahaWebSocketEvent<TPayload>) => boolean) | undefined,
  event: WahaWebSocketEvent<TPayload>,
): Result<boolean> {
  if (predicate === undefined) return createResult(true)

  try {
    const accepted = predicate(event)
    if (typeof accepted !== "boolean") return createResultError(OP, ERRORS.predicate)
    return createResult(accepted)
  } catch {
    return createResultError(OP, ERRORS.predicate)
  }
}

function wahaWebSocketEventRequested(event: string, events: readonly string[] | undefined): boolean {
  if (events === undefined) return true
  return events.includes("*") || events.includes(event)
}

export function wahaWebSocketObservationCreate<TPayload>(
  options: WahaWebSocketObservationOptions<TPayload>,
): WahaWebSocketObservation {
  let parsedOptions: a.SafeParseResult<typeof wahaWebSocketObserveOptionsSchema>
  try {
    parsedOptions = a.safeParse(wahaWebSocketObserveOptionsSchema, options)
  } catch {
    return wahaWebSocketError(ERRORS.options)
  }
  if (!parsedOptions.success) return wahaWebSocketError(ERRORS.options)

  const { config, session, events, payloadSchema, predicate, eventHandler } =
    parsedOptions.output as WahaWebSocketObservationOptions<TPayload>
  const urlR = wahaWebSocketUrl(config, session, events)
  if (!urlR.success) return wahaWebSocketError(urlR.errorMessage)

  let WebSocketConstructor: typeof WebSocket
  try {
    WebSocketConstructor = globalThis.WebSocket
  } catch {
    return wahaWebSocketError(ERRORS.unavailable)
  }
  if (typeof WebSocketConstructor !== "function") return wahaWebSocketError(ERRORS.unavailable)

  let socket: WebSocket
  try {
    socket = new WebSocketConstructor(urlR.data)
  } catch {
    return wahaWebSocketError(ERRORS.construction)
  }

  let readyResolve: (result: Result<void>) => void = () => undefined
  let completedResolve: (result: Result<void>) => void = () => undefined
  const ready = new Promise<Result<void>>((resolve) => {
    readyResolve = resolve
  })
  const completed = new Promise<Result<void>>((resolve) => {
    completedResolve = resolve
  })

  let opened = false
  let readySettled = false
  let completedSettled = false
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  const closeSocket = (): void => {
    try {
      socket.close()
    } catch {
      // Preserve the original Result and keep close idempotent.
    }
  }

  const settleReady = (result: Result<void>): void => {
    if (readySettled) return
    readySettled = true
    readyResolve(result)
  }

  const settleCompleted = (result: Result<void>, shouldClose: boolean): void => {
    if (completedSettled) return
    completedSettled = true
    if (timeoutId !== undefined) clearTimeout(timeoutId)
    if (shouldClose) closeSocket()
    completedResolve(result)
  }

  const fail = (message: string, shouldClose: boolean): void => {
    const error = createResultError(OP, message)
    if (!readySettled) settleReady(error)
    settleCompleted(error, shouldClose)
  }

  const complete = (): void => {
    settleCompleted(createResult(undefined), true)
  }

  const cancel = (): void => {
    if (completedSettled) return
    fail(ERRORS.cancelled, true)
  }

  try {
    socket.addEventListener("open", () => {
      try {
        opened = true
        settleReady(createResult(undefined))
      } catch {
        fail(ERRORS.listener, true)
      }
    })
    socket.addEventListener("message", (message) => {
      try {
        if (!opened || completedSettled) return

        const envelopeR = wahaWebSocketEnvelopeParse(message.data, events)
        if (!envelopeR.success) {
          fail(envelopeR.errorMessage, true)
          return
        }
        if (envelopeR.data === undefined) return

        const payloadR = wahaWebSocketPayloadParse(payloadSchema, envelopeR.data.payload)
        if (!payloadR.success) {
          fail(payloadR.errorMessage, true)
          return
        }

        const typedEvent = { ...envelopeR.data, payload: payloadR.data }
        const predicateR = wahaWebSocketEventPredicateRun(predicate, typedEvent)
        if (!predicateR.success) {
          fail(predicateR.errorMessage, true)
          return
        }
        if (!predicateR.data) return

        const action = eventHandler(typedEvent)
        if (action === "complete") complete()
        else if (action !== "continue") fail(ERRORS.listener, true)
      } catch {
        fail(ERRORS.listener, true)
      }
    })
    socket.addEventListener("error", () => {
      try {
        fail(ERRORS.webSocketError, true)
      } catch {
        // Result settlement must not expose listener exceptions.
      }
    })
    socket.addEventListener("close", () => {
      try {
        if (!completedSettled) fail(opened ? ERRORS.closedBeforeEvent : ERRORS.closedBeforeReady, false)
      } catch {
        // Result settlement must not expose listener exceptions.
      }
    })

    const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS
    timeoutId = setTimeout(() => {
      try {
        fail(ERRORS.timeout, true)
      } catch {
        // Result settlement must not expose timer exceptions.
      }
    }, timeoutMs)
    if (completedSettled) {
      clearTimeout(timeoutId)
      timeoutId = undefined
    }
  } catch {
    fail(ERRORS.listener, true)
  }

  return { ready, completed, cancel }
}
