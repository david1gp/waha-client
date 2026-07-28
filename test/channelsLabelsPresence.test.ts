import { afterEach, describe, expect, mock, test } from "bun:test"
import { channelList } from "../src/channelList.js"
import { channelCreate } from "../src/channelCreate.js"
import { labelList } from "../src/labelList.js"
import { labelCreate } from "../src/labelCreate.js"
import { presenceSet } from "../src/presenceSet.js"
import { presenceList } from "../src/presenceList.js"
import { wahaClientConfig } from "../src/wahaClientConfig.js"

describe("channels", () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  test("channelList GET /api/{session}/channels with role query", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify([{ id: "1@newsletter", name: "News", role: "SUBSCRIBER" }]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    }) as unknown as typeof fetch

    const configR = wahaClientConfig({
      baseUrl: "http://localhost:3000",
      apiKey: "k",
      session: "default",
    })
    expect(configR.success).toBe(true)
    if (!configR.success) return

    const r = await channelList({ config: configR.data, role: "OWNER" })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data).toEqual([{ id: "1@newsletter", name: "News", role: "SUBSCRIBER" }] as typeof r.data)
    }

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    expect(calls.length).toBe(1)
    const [url, init] = calls[0] as [string, RequestInit]
    expect(url).toBe("http://localhost:3000/api/default/channels?role=OWNER")
    expect(init.method).toBe("GET")
    expect((init.headers as Record<string, string>)["X-Api-Key"]).toBe("k")
  })

  test("channelCreate POST body", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ id: "9@newsletter", name: "My Channel", role: "OWNER" }), { status: 200 })
    }) as unknown as typeof fetch

    const configR = wahaClientConfig({
      baseUrl: "http://localhost:3000",
      session: "default",
    })
    if (!configR.success) return

    const r = await channelCreate({
      config: configR.data,
      name: "My Channel",
      description: "desc",
    })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data).toEqual({ id: "9@newsletter", name: "My Channel", role: "OWNER" } as typeof r.data)
    }

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    const [url, init] = calls[0] as [string, RequestInit]
    expect(url).toBe("http://localhost:3000/api/default/channels")
    expect(init.method).toBe("POST")
    expect(JSON.parse(init.body as string)).toEqual({
      name: "My Channel",
      description: "desc",
    })
  })
})

describe("labels", () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  test("labelList GET /api/{session}/labels", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify([{ id: "1", name: "Lead", color: 0, colorHex: "#ff9485" }]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    }) as unknown as typeof fetch

    const configR = wahaClientConfig({
      baseUrl: "http://localhost:3000",
      apiKey: "k",
      session: "default",
    })
    if (!configR.success) return

    const r = await labelList({ config: configR.data })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data).toEqual([{ id: "1", name: "Lead", color: 0, colorHex: "#ff9485" }])
    }

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    const [url, init] = calls[0] as [string, RequestInit]
    expect(url).toBe("http://localhost:3000/api/default/labels")
    expect(init.method).toBe("GET")
  })

  test("labelCreate POST body", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ id: "2", name: "Hot", color: 1, colorHex: "#64c4ff" }), { status: 200 })
    }) as unknown as typeof fetch

    const configR = wahaClientConfig({
      baseUrl: "http://localhost:3000",
      session: "default",
    })
    if (!configR.success) return

    const r = await labelCreate({
      config: configR.data,
      name: "Hot",
      colorHex: "#64c4ff",
    })
    expect(r.success).toBe(true)

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    const [url, init] = calls[0] as [string, RequestInit]
    expect(url).toBe("http://localhost:3000/api/default/labels")
    expect(init.method).toBe("POST")
    expect(JSON.parse(init.body as string)).toEqual({
      name: "Hot",
      colorHex: "#64c4ff",
    })
  })
})

describe("presence", () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  test("presenceSet POST /api/{session}/presence", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(null, { status: 204 })
    }) as unknown as typeof fetch

    const configR = wahaClientConfig({
      baseUrl: "http://localhost:3000",
      session: "default",
    })
    if (!configR.success) return

    const r = await presenceSet({
      config: configR.data,
      presence: "typing",
      chatId: "111@c.us",
    })
    expect(r.success).toBe(true)

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    const [url, init] = calls[0] as [string, RequestInit]
    expect(url).toBe("http://localhost:3000/api/default/presence")
    expect(init.method).toBe("POST")
    expect(JSON.parse(init.body as string)).toEqual({
      presence: "typing",
      chatId: "111@c.us",
    })
  })

  test("presenceList GET /api/{session}/presence", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(
        JSON.stringify([{ id: "111@c.us", presences: [{ participant: "111@c.us", lastKnownPresence: "online" }] }]),
        { status: 200 },
      )
    }) as unknown as typeof fetch

    const configR = wahaClientConfig({
      baseUrl: "http://localhost:3000",
      session: "default",
    })
    if (!configR.success) return

    const r = await presenceList({ config: configR.data })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data[0]?.id).toBe("111@c.us")
    }

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    const [url, init] = calls[0] as [string, RequestInit]
    expect(url).toBe("http://localhost:3000/api/default/presence")
    expect(init.method).toBe("GET")
  })
})
