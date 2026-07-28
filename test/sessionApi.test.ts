import { afterEach, describe, expect, mock, test } from "bun:test"
import { sessionList } from "../src/sessionList.js"
import { sessionStart } from "../src/sessionStart.js"
import { wahaClientConfig } from "../src/wahaClientConfig.js"

describe("sessionApi", () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  test("sessionList GET /api/sessions with query", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify([{ name: "default", status: "WORKING" }]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    }) as unknown as typeof fetch

    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000", apiKey: "k" })
    expect(configR.success).toBe(true)
    if (!configR.success) return

    const r = await sessionList({ config: configR.data, all: true, expand: ["apps"] })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data).toEqual([{ name: "default", status: "WORKING" }] as typeof r.data)
    }

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    expect(calls.length).toBe(1)
    const [url, init] = calls[0] as [string, RequestInit]
    expect(url).toBe("http://localhost:3000/api/sessions?all=true&expand=apps")
    expect(init.method).toBe("GET")
    expect((init.headers as Record<string, string>)["X-Api-Key"]).toBe("k")
  })

  test("sessionStart POST path with encodeURIComponent", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ name: "my session", status: "STARTING" }), {
        status: 200,
      })
    }) as unknown as typeof fetch

    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000" })
    if (!configR.success) return

    const r = await sessionStart({ config: configR.data, session: "my session" })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data).toEqual({ name: "my session", status: "STARTING" })
    }

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    const [url, init] = calls[0] as [string, RequestInit]
    expect(url).toBe("http://localhost:3000/api/sessions/my%20session/start")
    expect(init.method).toBe("POST")
  })

  test("sessionStart uses config.session when session omitted", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ name: "default", status: "WORKING" }), { status: 200 })
    }) as unknown as typeof fetch

    const configR = wahaClientConfig({
      baseUrl: "http://localhost:3000",
      session: "default",
    })
    if (!configR.success) return

    const r = await sessionStart({ config: configR.data })
    expect(r.success).toBe(true)

    const [url] = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls[0] as [string]
    expect(url).toBe("http://localhost:3000/api/sessions/default/start")
  })

  test("sessionStart errors when session missing", async () => {
    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000" })
    if (!configR.success) return

    const r = await sessionStart({ config: configR.data })
    expect(r.success).toBe(false)
  })
})
