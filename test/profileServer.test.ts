import { afterEach, describe, expect, mock, test } from "bun:test"
import { profileGet } from "../src/profileGet.js"
import { screenshotGet } from "../src/screenshotGet.js"
import { serverPing } from "../src/serverPing.js"
import { wahaClientConfig } from "../src/wahaClientConfig.js"

describe("profile + server endpoints", () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  test("profileGet", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ id: "me@c.us", name: "Alice", picture: null }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    }) as unknown as typeof fetch

    const configR = wahaClientConfig({
      baseUrl: "http://localhost:3000",
      apiKey: "secret",
      session: "default",
    })
    expect(configR.success).toBe(true)
    if (!configR.success) return

    const r = await profileGet({ config: configR.data })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data).toEqual({ id: "me@c.us", name: "Alice", picture: null })
    }

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    expect(calls.length).toBe(1)
    const [url, init] = calls[0] as [string, RequestInit]
    expect(url).toBe("http://localhost:3000/api/default/profile")
    expect(init.method).toBe("GET")
    expect((init.headers as Record<string, string>)["X-Api-Key"]).toBe("secret")
  })

  test("profileGet errors when session missing", async () => {
    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000" })
    if (!configR.success) return
    const r = await profileGet({ config: configR.data })
    expect(r.success).toBe(false)
  })

  test("serverPing", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ message: "pong" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    }) as unknown as typeof fetch

    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000" })
    if (!configR.success) return

    const r = await serverPing({ config: configR.data })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual({ message: "pong" })

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    const [url, init] = calls[0] as [string, RequestInit]
    expect(url).toBe("http://localhost:3000/ping")
    expect(init.method).toBe("GET")
  })

  test("screenshotGet bytes", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(new Uint8Array([0xff, 0xd8, 0xff]), {
        status: 200,
        headers: { "Content-Type": "image/jpeg" },
      })
    }) as unknown as typeof fetch

    const configR = wahaClientConfig({
      baseUrl: "http://localhost:3000",
      session: "default",
    })
    if (!configR.success) return

    const r = await screenshotGet({ config: configR.data })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual(new Uint8Array([0xff, 0xd8, 0xff]))

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    const [url] = calls[0] as [string, RequestInit]
    expect(url).toBe("http://localhost:3000/api/screenshot?session=default")
  })
})
