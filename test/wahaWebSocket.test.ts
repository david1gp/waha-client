import { afterEach, describe, expect, test } from "bun:test"
import * as a from "valibot"
import { wahaClientConfig, wahaWebSocketObserve, wahaWebSocketObserveMany } from "../src/index.js"

type WebSocketEventType = "open" | "message" | "error" | "close"
type WebSocketEventListener = (() => void) | ((event: { data: unknown }) => void)

class MockWebSocket {
  static instances: MockWebSocket[] = []
  static constructionError: Error | undefined
  static listenerError: Error | undefined

  readonly url: string
  closeCalls = 0
  private readonly listeners: Record<WebSocketEventType, WebSocketEventListener[]> = {
    open: [],
    message: [],
    error: [],
    close: [],
  }

  constructor(url: string) {
    if (MockWebSocket.constructionError) throw MockWebSocket.constructionError
    this.url = url
    MockWebSocket.instances.push(this)
  }

  addEventListener(type: "message", listener: (event: { data: unknown }) => void): void
  addEventListener(type: "open" | "error" | "close", listener: () => void): void
  addEventListener(type: WebSocketEventType, listener: WebSocketEventListener): void {
    if (MockWebSocket.listenerError) throw MockWebSocket.listenerError
    this.listeners[type].push(listener)
  }

  close(): void {
    this.closeCalls++
  }

  open(): void {
    for (const listener of this.listeners.open) (listener as () => void)()
  }

  message(data: unknown): void {
    for (const listener of this.listeners.message) (listener as (event: { data: unknown }) => void)({ data })
  }

  error(): void {
    for (const listener of this.listeners.error) (listener as () => void)()
  }

  closeFromServer(): void {
    for (const listener of this.listeners.close) (listener as () => void)()
  }
}

const originalWebSocket = globalThis.WebSocket
const payloadSchema = a.object({ body: a.string() })

afterEach(() => {
  globalThis.WebSocket = originalWebSocket
  MockWebSocket.instances = []
  MockWebSocket.constructionError = undefined
  MockWebSocket.listenerError = undefined
})

function useMockWebSocket(): void {
  globalThis.WebSocket = MockWebSocket as unknown as typeof WebSocket
}

function configCreate(input: Parameters<typeof wahaClientConfig>[0]) {
  const result = wahaClientConfig(input)
  expect(result.success).toBe(true)
  if (!result.success) throw new Error(result.errorMessage)
  return result.data
}

function latestSocket(): MockWebSocket {
  const socket = MockWebSocket.instances.at(-1)
  if (!socket) throw new Error("Mock WebSocket was not constructed")
  return socket
}

function eventPayload(body: string): string {
  return JSON.stringify({ event: "message", session: "default", payload: { body } })
}

describe("wahaWebSocketObserve", () => {
  test("does not deliver before ready and delivers a typed matching event after open", async () => {
    useMockWebSocket()
    const observation = wahaWebSocketObserve({
      config: configCreate({ baseUrl: "https://waha.example.test/", apiKey: "key + value" }),
      payloadSchema,
      events: ["message.any", "message waiting", "*"],
    })
    const socket = latestSocket()

    const order: string[] = []
    void observation.ready.then(() => {
      order.push("ready")
    })
    let delivered = false
    void observation.event.then(() => {
      order.push("event")
      delivered = true
    })
    socket.message(eventPayload("before-ready"))
    await Promise.resolve()
    expect(delivered).toBe(false)

    expect(socket.url).toBe(
      "wss://waha.example.test/ws?x-api-key=key+%2B+value&events=message.any&events=message+waiting&events=*",
    )
    socket.open()
    const ready = await observation.ready
    expect(ready).toEqual({ success: true, data: undefined })

    socket.message(eventPayload("hello"))
    const event = await observation.event
    expect(event.success).toBe(true)
    if (event.success) expect(event.data.payload.body).toBe("hello")
    expect(order).toEqual(["ready", "event"])
    expect(socket.closeCalls).toBe(1)
  })

  test("uses the config session and omits the session query when none is configured", async () => {
    useMockWebSocket()
    const observation = wahaWebSocketObserve({
      config: configCreate({ baseUrl: "http://waha.example.test", session: "default" }),
      payloadSchema,
    })
    expect(latestSocket().url).toBe("ws://waha.example.test/ws?session=default")
    latestSocket().open()
    latestSocket().message(eventPayload("configured"))
    expect((await observation.event).success).toBe(true)

    const allSessionsObservation = wahaWebSocketObserve({
      config: configCreate({ baseUrl: "http://waha.example.test" }),
      payloadSchema,
    })
    expect(latestSocket().url).toBe("ws://waha.example.test/ws")
    latestSocket().open()
    latestSocket().message(JSON.stringify({ event: "message", session: "any", payload: { body: "any-session" } }))
    expect((await allSessionsObservation.event).success).toBe(true)
  })

  test("returns a stable redacted error for a wrong payload shape", async () => {
    useMockWebSocket()
    const observation = wahaWebSocketObserve({
      config: configCreate({ baseUrl: "http://waha.example.test" }),
      payloadSchema,
    })
    const socket = latestSocket()
    socket.open()
    socket.message(
      JSON.stringify({ event: "message", session: "default", payload: { body: 123, secret: "OTP-123456" } }),
    )

    const result = await observation.event
    expect(result).toEqual({
      success: false,
      op: "wahaWebSocketObserve",
      errorMessage: "Invalid WebSocket event payload",
    })
    expect(JSON.stringify(result)).not.toContain("OTP-123456")
  })

  test("ignores envelopes outside requested event names before validating their payload", async () => {
    useMockWebSocket()
    const observation = wahaWebSocketObserve({
      config: configCreate({ baseUrl: "http://waha.example.test" }),
      payloadSchema,
      events: ["message"],
    })
    const socket = latestSocket()
    socket.open()

    let delivered = false
    void observation.event.then(() => {
      delivered = true
    })
    socket.message(JSON.stringify({ event: "presence.update", payload: { body: "OTP-ignored" } }))
    await Promise.resolve()
    expect(delivered).toBe(false)

    socket.message(eventPayload("requested"))
    const result = await observation.event
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.payload.body).toBe("requested")
  })

  test("keeps observing after a valid event rejected by the predicate", async () => {
    useMockWebSocket()
    const seenBodies: string[] = []
    const observation = wahaWebSocketObserve({
      config: configCreate({ baseUrl: "http://waha.example.test" }),
      payloadSchema,
      predicate: (event) => {
        seenBodies.push(event.payload.body)
        return event.payload.body === "matching"
      },
    })
    const socket = latestSocket()
    socket.open()

    let delivered = false
    void observation.event.then(() => {
      delivered = true
    })
    socket.message(eventPayload("unrelated"))
    await Promise.resolve()
    expect(delivered).toBe(false)
    expect(socket.closeCalls).toBe(0)

    socket.message(eventPayload("matching"))
    const result = await observation.event
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.payload.body).toBe("matching")
    expect(seenBodies).toEqual(["unrelated", "matching"])
    expect(socket.closeCalls).toBe(1)
  })

  test("returns a stable redacted error when the predicate throws", async () => {
    useMockWebSocket()
    const observation = wahaWebSocketObserve({
      config: configCreate({ baseUrl: "http://waha.example.test" }),
      payloadSchema,
      predicate: (event) => {
        throw new Error(event.payload.body)
      },
    })
    const socket = latestSocket()
    socket.open()
    socket.message(eventPayload("OTP-123456"))

    const result = await observation.event
    expect(result).toEqual({
      success: false,
      op: "wahaWebSocketObserve",
      errorMessage: "WebSocket event predicate failed",
    })
    expect(JSON.stringify(result)).not.toContain("OTP-123456")
    expect(socket.closeCalls).toBe(1)
  })

  test("redacts parse, construction, and listener errors", async () => {
    useMockWebSocket()
    const parseObservation = wahaWebSocketObserve({
      config: configCreate({ baseUrl: "https://user:password@waha.example.test", apiKey: "api-secret" }),
      payloadSchema,
    })
    const parseSocket = latestSocket()
    parseSocket.open()
    parseSocket.message('{"event":"message","payload":"OTP-123456"')
    const parseResult = await parseObservation.event
    expect(parseResult).toEqual({
      success: false,
      op: "wahaWebSocketObserve",
      errorMessage: "Invalid WebSocket message",
    })
    expect(JSON.stringify(parseResult)).not.toContain("OTP-123456")
    expect(JSON.stringify(parseResult)).not.toContain("api-secret")
    expect(JSON.stringify(parseResult)).not.toContain("password")

    MockWebSocket.constructionError = new Error(
      "wss://user:password@waha.example.test/ws?x-api-key=api-secret OTP-123456",
    )
    const constructionObservation = wahaWebSocketObserve({
      config: configCreate({ baseUrl: "https://waha.example.test", apiKey: "api-secret" }),
      payloadSchema,
    })
    const constructionResult = await constructionObservation.event
    expect(constructionResult).toEqual({
      success: false,
      op: "wahaWebSocketObserve",
      errorMessage: "WebSocket construction failed",
    })
    expect(JSON.stringify(constructionResult)).not.toContain("api-secret")
    expect(JSON.stringify(constructionResult)).not.toContain("OTP-123456")

    MockWebSocket.constructionError = undefined
    MockWebSocket.listenerError = new Error("listener OTP-123456")
    const listenerObservation = wahaWebSocketObserve({
      config: configCreate({ baseUrl: "https://waha.example.test", apiKey: "api-secret" }),
      payloadSchema,
    })
    const listenerResult = await listenerObservation.event
    expect(listenerResult).toEqual({
      success: false,
      op: "wahaWebSocketObserve",
      errorMessage: "WebSocket listener setup failed",
    })
    expect(JSON.stringify(listenerResult)).not.toContain("api-secret")
    expect(JSON.stringify(listenerResult)).not.toContain("OTP-123456")
  })

  test("cancels and closes idempotently", async () => {
    useMockWebSocket()
    const observation = wahaWebSocketObserve({
      config: configCreate({ baseUrl: "http://waha.example.test" }),
      payloadSchema,
    })
    const socket = latestSocket()

    observation.close()
    observation.close()
    const ready = await observation.ready
    const event = await observation.event
    expect(ready).toEqual({
      success: false,
      op: "wahaWebSocketObserve",
      errorMessage: "WebSocket observation cancelled",
    })
    expect(event).toEqual({
      success: false,
      op: "wahaWebSocketObserve",
      errorMessage: "WebSocket observation cancelled",
    })
    expect(socket.closeCalls).toBe(1)
  })

  test("returns a stable timeout Result and closes the socket", async () => {
    useMockWebSocket()
    const observation = wahaWebSocketObserve({
      config: configCreate({ baseUrl: "http://waha.example.test", timeoutMs: 1 }),
      payloadSchema,
    })
    const socket = latestSocket()
    const result = await observation.event
    expect(result).toEqual({
      success: false,
      op: "wahaWebSocketObserve",
      errorMessage: "WebSocket observation timed out",
    })
    expect(socket.closeCalls).toBe(1)
  })

  test("returns a Result when the server closes before a matching event", async () => {
    useMockWebSocket()
    const observation = wahaWebSocketObserve({
      config: configCreate({ baseUrl: "http://waha.example.test" }),
      payloadSchema,
    })
    const socket = latestSocket()
    socket.open()
    expect((await observation.ready).success).toBe(true)
    socket.closeFromServer()

    const result = await observation.event
    expect(result).toEqual({
      success: false,
      op: "wahaWebSocketObserve",
      errorMessage: "WebSocket closed before a matching event was received",
    })
    expect(socket.closeCalls).toBe(0)
  })

  test("delivers a burst on one connection and completes at the requested count", async () => {
    useMockWebSocket()
    const bodies: string[] = []
    const observation = wahaWebSocketObserveMany({
      config: configCreate({ baseUrl: "http://waha.example.test" }),
      payloadSchema,
      onEvent: (event) => {
        bodies.push(event.payload.body)
        return bodies.length === 3 ? "complete" : "continue"
      },
    })
    const socket = latestSocket()
    socket.open()
    expect(await observation.ready).toEqual({ success: true, data: undefined })

    socket.message(eventPayload("one"))
    socket.message(eventPayload("two"))
    socket.message(eventPayload("three"))
    socket.message(eventPayload("ignored-after-completion"))

    expect(await observation.completed).toEqual({ success: true, data: undefined })
    expect(bodies).toEqual(["one", "two", "three"])
    expect(MockWebSocket.instances).toHaveLength(1)
    expect(socket.closeCalls).toBe(1)
  })

  test("closes continuously after a validation error", async () => {
    useMockWebSocket()
    const observation = wahaWebSocketObserveMany({
      config: configCreate({ baseUrl: "http://waha.example.test" }),
      payloadSchema,
      onEvent: () => "continue",
    })
    const socket = latestSocket()
    socket.open()
    socket.message(JSON.stringify({ event: "message", session: "default", payload: { body: 123 } }))

    expect(await observation.completed).toEqual({
      success: false,
      op: "wahaWebSocketObserve",
      errorMessage: "Invalid WebSocket event payload",
    })
    expect(socket.closeCalls).toBe(1)
  })

  test("cancels a continuous observation idempotently", async () => {
    useMockWebSocket()
    const observation = wahaWebSocketObserveMany({
      config: configCreate({ baseUrl: "http://waha.example.test" }),
      payloadSchema,
      onEvent: () => "continue",
    })
    const socket = latestSocket()

    observation.close()
    observation.close()

    expect(await observation.ready).toEqual({
      success: false,
      op: "wahaWebSocketObserve",
      errorMessage: "WebSocket observation cancelled",
    })
    expect(await observation.completed).toEqual({
      success: false,
      op: "wahaWebSocketObserve",
      errorMessage: "WebSocket observation cancelled",
    })
    expect(socket.closeCalls).toBe(1)
  })

  test("times out a continuous observation and closes the socket", async () => {
    useMockWebSocket()
    const observation = wahaWebSocketObserveMany({
      config: configCreate({ baseUrl: "http://waha.example.test", timeoutMs: 1 }),
      payloadSchema,
      onEvent: () => "continue",
    })
    const socket = latestSocket()

    expect(await observation.completed).toEqual({
      success: false,
      op: "wahaWebSocketObserve",
      errorMessage: "WebSocket observation timed out",
    })
    expect(socket.closeCalls).toBe(1)
  })
})
