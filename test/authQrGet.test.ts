import { afterEach, describe, expect, mock, test } from "bun:test"
import { authQrGet } from "../src/authQrGet.js"
import { wahaClientConfig } from "../src/wahaClientConfig.js"

describe("authQrGet", () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  test("image format returns bytes and hits correct path", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(new Uint8Array([0x89, 0x50, 0x4e, 0x47]), { status: 200 })
    }) as unknown as typeof fetch

    const configR = wahaClientConfig({
      baseUrl: "http://localhost:3000",
      apiKey: "secret",
      session: "default",
    })
    expect(configR.success).toBe(true)
    if (!configR.success) return

    const r = await authQrGet({ config: configR.data })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual(new Uint8Array([0x89, 0x50, 0x4e, 0x47]))

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    expect(calls.length).toBe(1)
    const [url, init] = calls[0] as [string, RequestInit]
    expect(url).toBe("http://localhost:3000/api/default/auth/qr?format=image")
    expect(init.method).toBe("GET")
    expect((init.headers as Record<string, string>)["X-Api-Key"]).toBe("secret")
  })

  test("raw format returns json value", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ value: "2@abc,1,2" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    }) as unknown as typeof fetch

    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000", session: "s1" })
    if (!configR.success) return

    const r = await authQrGet({ config: configR.data, format: "raw" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual({ value: "2@abc,1,2" })

    const [url] = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls[0] as [string]
    expect(url).toBe("http://localhost:3000/api/s1/auth/qr?format=raw")
  })

  test("session override wins over config.session", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(new Uint8Array([1]), { status: 200 })
    }) as unknown as typeof fetch

    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000", session: "default" })
    if (!configR.success) return

    await authQrGet({ config: configR.data, session: "other" })
    const [url] = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls[0] as [string]
    expect(url).toBe("http://localhost:3000/api/other/auth/qr?format=image")
  })

  test("errors when session missing", async () => {
    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000" })
    if (!configR.success) return

    const r = await authQrGet({ config: configR.data })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.errorMessage).toContain("session is required")
  })
})
