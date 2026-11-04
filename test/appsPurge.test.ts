import { afterEach, describe, expect, mock, test } from "bun:test"
import { appPurge } from "../src/apps/appPurge.js"
import { appSessionPurge } from "../src/apps/appSessionPurge.js"
import { phoneNumbersCacheDbGet } from "../src/apps/phoneNumbersCacheDbGet.js"
import { phoneNumbersCacheMemoryGet } from "../src/apps/phoneNumbersCacheMemoryGet.js"
import { phoneNumbersCachePurge } from "../src/apps/phoneNumbersCachePurge.js"
import { phoneNumbersCacheStatsGet } from "../src/apps/phoneNumbersCacheStatsGet.js"
import * as publicApi from "../src/index.js"
import { sessionLogout } from "../src/sessions/sessionLogout.js"
import { wahaClientConfig } from "../src/client/wahaClientConfig.js"

describe("appsPurge", () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  function config() {
    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000", apiKey: "k", session: "default" })
    expect(configR.success).toBe(true)
    if (!configR.success) throw new Error("config must validate")
    return configR.data
  }

  test("exposes WAHA purge and phone-number cache operations", () => {
    expect(publicApi.appPurge).toBe(appPurge)
    expect(publicApi.appSessionPurge).toBe(appSessionPurge)
    expect(publicApi.phoneNumbersCacheDbGet).toBe(phoneNumbersCacheDbGet)
    expect(publicApi.phoneNumbersCacheMemoryGet).toBe(phoneNumbersCacheMemoryGet)
    expect(publicApi.phoneNumbersCacheStatsGet).toBe(phoneNumbersCacheStatsGet)
    expect(publicApi.phoneNumbersCachePurge).toBe(phoneNumbersCachePurge)
  })

  test("appPurge POST /api/apps/{id}/purge", async () => {
    globalThis.fetch = mock(async () => new Response(null, { status: 201 })) as unknown as typeof fetch

    const r = await appPurge({ config: config(), id: "app/1" })
    expect(r.success).toBe(true)

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    const [url, init] = calls[0] as [string, RequestInit]
    expect(url).toBe("http://localhost:3000/api/apps/app%2F1/purge")
    expect(init.method).toBe("POST")
  })

  test("appSessionPurge POST /api/apps/{app}/{session}/purge with config session", async () => {
    globalThis.fetch = mock(async () => new Response(null, { status: 201 })) as unknown as typeof fetch

    const r = await appSessionPurge({ config: config(), app: "chatwoot" })
    expect(r.success).toBe(true)

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    const [url, init] = calls[0] as [string, RequestInit]
    expect(url).toBe("http://localhost:3000/api/apps/chatwoot/default/purge")
    expect(init.method).toBe("POST")
  })

  test("appSessionPurge honors an explicit session", async () => {
    globalThis.fetch = mock(async () => new Response(null, { status: 201 })) as unknown as typeof fetch

    const r = await appSessionPurge({ config: config(), app: "phone-numbers", session: "other" })
    expect(r.success).toBe(true)

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    const [url] = calls[0] as [string, RequestInit]
    expect(url).toBe("http://localhost:3000/api/apps/phone-numbers/other/purge")
  })

  test("phoneNumbersCacheDbGet defaults to phone-numbers and omits empty query", async () => {
    const entries = [{ input: "5215500000000", output: "5215500000000@c.us" }]
    globalThis.fetch = mock(
      async () => new Response(JSON.stringify(entries), { status: 200 }),
    ) as unknown as typeof fetch

    const r = await phoneNumbersCacheDbGet({ config: config() })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual(entries)

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    const [url, init] = calls[0] as [string, RequestInit]
    expect(url).toBe("http://localhost:3000/api/apps/phone-numbers/default/cache/db")
    expect(init.method).toBe("GET")
  })

  test("phoneNumbersCacheDbGet supports app variants with pagination", async () => {
    globalThis.fetch = mock(async () => new Response(JSON.stringify([]), { status: 200 })) as unknown as typeof fetch

    const r = await phoneNumbersCacheDbGet({
      config: config(),
      session: "other",
      app: "brazilian-phone-numbers",
      limit: 10,
      offset: 5,
    })
    expect(r.success).toBe(true)

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    const [url] = calls[0] as [string, RequestInit]
    expect(url).toBe("http://localhost:3000/api/apps/brazilian-phone-numbers/other/cache/db?limit=10&offset=5")
  })

  test("phoneNumbersCacheDbGet rejects unknown apps", async () => {
    const r = await phoneNumbersCacheDbGet({ config: config(), app: "chatwoot" as "phone-numbers" })
    expect(r.success).toBe(false)
  })

  test("phoneNumbersCacheMemoryGet GET memory tier", async () => {
    globalThis.fetch = mock(async () => new Response(JSON.stringify([]), { status: 200 })) as unknown as typeof fetch

    const r = await phoneNumbersCacheMemoryGet({ config: config(), app: "mexican-phone-numbers" })
    expect(r.success).toBe(true)

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    const [url] = calls[0] as [string, RequestInit]
    expect(url).toBe("http://localhost:3000/api/apps/mexican-phone-numbers/default/cache/memory")
  })

  test("phoneNumbersCacheStatsGet GET stats", async () => {
    const stats = { memory: { size: 1 }, db: null }
    globalThis.fetch = mock(async () => new Response(JSON.stringify(stats), { status: 200 })) as unknown as typeof fetch

    const r = await phoneNumbersCacheStatsGet({ config: config(), app: "argentine-phone-numbers" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual(stats)

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    const [url] = calls[0] as [string, RequestInit]
    expect(url).toBe("http://localhost:3000/api/apps/argentine-phone-numbers/default/cache/stats")
  })

  test("phoneNumbersCachePurge DELETE cache", async () => {
    globalThis.fetch = mock(async () => new Response(null, { status: 200 })) as unknown as typeof fetch

    const r = await phoneNumbersCachePurge({ config: config() })
    expect(r.success).toBe(true)

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    const [url, init] = calls[0] as [string, RequestInit]
    expect(url).toBe("http://localhost:3000/api/apps/phone-numbers/default/cache/purge")
    expect(init.method).toBe("DELETE")
  })

  test("sessionLogout sends no body by default", async () => {
    globalThis.fetch = mock(
      async () => new Response(JSON.stringify({ name: "default", status: "STOPPED" }), { status: 200 }),
    ) as unknown as typeof fetch

    const r = await sessionLogout({ config: config() })
    expect(r.success).toBe(true)

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    const [url, init] = calls[0] as [string, RequestInit]
    expect(url).toBe("http://localhost:3000/api/sessions/default/logout")
    expect(init.method).toBe("POST")
    expect(init.body).toBeUndefined()
  })

  test("sessionLogout forwards apps.purge", async () => {
    globalThis.fetch = mock(
      async () => new Response(JSON.stringify({ name: "default", status: "STOPPED" }), { status: 200 }),
    ) as unknown as typeof fetch

    const r = await sessionLogout({ config: config(), apps: { purge: true } })
    expect(r.success).toBe(true)

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    const [, init] = calls[0] as [string, RequestInit]
    expect(JSON.parse(init.body as string)).toEqual({ apps: { purge: true } })
  })
})
