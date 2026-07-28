import { afterEach, describe, expect, mock, test } from "bun:test"
import { callReject } from "../src/callReject.js"
import { statusTextSend } from "../src/statusTextSend.js"
import { wahaClientConfig } from "../src/wahaClientConfig.js"

describe("statusCalls", () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  test("statusTextSend POST /api/{session}/status/text", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    }) as unknown as typeof fetch

    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000", apiKey: "k", session: "default" })
    expect(configR.success).toBe(true)
    if (!configR.success) return

    const r = await statusTextSend({
      config: configR.data,
      text: "hello status",
      backgroundColor: "#38b42f",
    })
    expect(r.success).toBe(true)

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    expect(calls.length).toBe(1)
    const [url, init] = calls[0] as [string, RequestInit]
    expect(url).toBe("http://localhost:3000/api/default/status/text")
    expect(init.method).toBe("POST")
    expect((init.headers as Record<string, string>)["X-Api-Key"]).toBe("k")
    expect(JSON.parse(init.body as string)).toEqual({
      text: "hello status",
      backgroundColor: "#38b42f",
    })
  })

  test("statusTextSend errors when session missing", async () => {
    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000" })
    if (!configR.success) return

    const r = await statusTextSend({ config: configR.data, text: "x" })
    expect(r.success).toBe(false)
  })

  test("callReject POST /api/{session}/calls/reject", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(null, { status: 201 })
    }) as unknown as typeof fetch

    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000", session: "default" })
    if (!configR.success) return

    const r = await callReject({
      config: configR.data,
      from: "1234567890@c.us",
      id: "CALLID123",
    })
    expect(r.success).toBe(true)

    const [url, init] = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls[0] as [string, RequestInit]
    expect(url).toBe("http://localhost:3000/api/default/calls/reject")
    expect(init.method).toBe("POST")
    expect(JSON.parse(init.body as string)).toEqual({
      from: "1234567890@c.us",
      id: "CALLID123",
    })
  })

  test("callReject encodes session and requires fields", async () => {
    globalThis.fetch = mock(async () => new Response(null, { status: 201 })) as unknown as typeof fetch

    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000" })
    if (!configR.success) return

    const missing = await callReject({
      config: configR.data,
      session: "my session",
      from: "1@c.us",
      id: "x",
    })
    expect(missing.success).toBe(true)
    const [url] = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls[0] as [string]
    expect(url).toBe("http://localhost:3000/api/my%20session/calls/reject")

    const noSession = await callReject({
      config: configR.data,
      from: "1@c.us",
      id: "x",
    })
    expect(noSession.success).toBe(false)
  })
})
