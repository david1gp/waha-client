import { afterEach, describe, expect, mock, test } from "bun:test"
import { apiKeyList } from "../src/apiKeyList.js"
import { appList } from "../src/appList.js"
import { wahaClientConfig } from "../src/wahaClientConfig.js"

describe("api keys + apps + storage", () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  test("apiKeyList", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(
        JSON.stringify([
          {
            id: "key_id",
            key: "key_secret",
            isActive: true,
            isAdmin: false,
            session: null,
            actions: null,
          },
        ]),
        { status: 200, headers: { "Content-Type": "application/json" } },
      )
    }) as unknown as typeof fetch

    const configR = wahaClientConfig({
      baseUrl: "http://localhost:3000",
      apiKey: "secret",
    })
    expect(configR.success).toBe(true)
    if (!configR.success) return

    const r = await apiKeyList({ config: configR.data })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data).toHaveLength(1)
      expect(r.data[0]?.id).toBe("key_id")
    }

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    expect(calls.length).toBe(1)
    const [url, init] = calls[0] as [string, RequestInit]
    expect(url).toBe("http://localhost:3000/api/keys")
    expect(init.method).toBe("GET")
    expect((init.headers as Record<string, string>)["X-Api-Key"]).toBe("secret")
  })

  test("appList sends session query from config.session", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    }) as unknown as typeof fetch

    const configR = wahaClientConfig({
      baseUrl: "http://localhost:3000",
      apiKey: "secret",
      session: "default",
    })
    if (!configR.success) return

    const r = await appList({ config: configR.data })
    expect(r.success).toBe(true)

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    const [url, init] = calls[0] as [string, RequestInit]
    expect(url).toBe("http://localhost:3000/api/apps?session=default")
    expect(init.method).toBe("GET")
  })

  test("appList sends options.session over config.session", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    }) as unknown as typeof fetch

    const configR = wahaClientConfig({
      baseUrl: "http://localhost:3000",
      session: "default",
    })
    if (!configR.success) return

    const r = await appList({ config: configR.data, session: "other" })
    expect(r.success).toBe(true)

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    const [url] = calls[0] as [string, RequestInit]
    expect(url).toBe("http://localhost:3000/api/apps?session=other")
  })

  test("appList errors when session missing", async () => {
    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000" })
    if (!configR.success) return
    const r = await appList({ config: configR.data })
    expect(r.success).toBe(false)
  })
})
