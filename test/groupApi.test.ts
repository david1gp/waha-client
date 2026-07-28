import { afterEach, describe, expect, mock, test } from "bun:test"
import { groupCreate } from "../src/groupCreate.js"
import { groupList } from "../src/groupList.js"
import { wahaClientConfig } from "../src/wahaClientConfig.js"

describe("groupApi", () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  test("groupList GET /api/{session}/groups with query", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify([{ id: "1@g.us", subject: "G" }]), {
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

    const r = await groupList({
      config: configR.data,
      limit: 10,
      sortBy: "subject",
      exclude: ["participants"],
    })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data).toEqual([{ id: "1@g.us", subject: "G" }] as typeof r.data)
    }

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    expect(calls.length).toBe(1)
    const [url, init] = calls[0] as [string, RequestInit]
    expect(url).toBe("http://localhost:3000/api/default/groups?limit=10&sortBy=subject&exclude=participants")
    expect(init.method).toBe("GET")
    expect((init.headers as Record<string, string>)["X-Api-Key"]).toBe("k")
  })

  test("groupCreate POST body", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ id: "9@g.us", subject: "Team", participants: [] }), { status: 200 })
    }) as unknown as typeof fetch

    const configR = wahaClientConfig({
      baseUrl: "http://localhost:3000",
      session: "default",
    })
    if (!configR.success) return

    const r = await groupCreate({
      config: configR.data,
      name: "Team",
      participants: [{ id: "1@c.us" }],
    })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data).toEqual({ id: "9@g.us", subject: "Team", participants: [] } as unknown as typeof r.data)
    }

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    const [url, init] = calls[0] as [string, RequestInit]
    expect(url).toBe("http://localhost:3000/api/default/groups")
    expect(init.method).toBe("POST")
    expect(JSON.parse(init.body as string)).toEqual({
      name: "Team",
      participants: [{ id: "1@c.us" }],
    })
  })

  test("groupList errors when session missing", async () => {
    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000" })
    if (!configR.success) return
    const r = await groupList({ config: configR.data })
    expect(r.success).toBe(false)
  })
})
