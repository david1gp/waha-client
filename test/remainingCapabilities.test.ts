import { afterEach, describe, expect, mock, test } from "bun:test"
import { messageStickerSend } from "../src/messageStickerSend.js"
import { sessionCappingGet } from "../src/sessionCappingGet.js"
import { sessionTimelockGet } from "../src/sessionTimelockGet.js"
import { wahaClientConfig } from "../src/wahaClientConfig.js"

describe("remainingCapabilities", () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  test("messageStickerSend posts a WebP file and omits an undefined reply", async () => {
    const message = { id: "m1", timestamp: 1, from: "me", fromMe: true, to: "1" }
    let sentBody: string | undefined
    globalThis.fetch = mock(async (_url, init) => {
      sentBody = init?.body as string
      return new Response(JSON.stringify(message), { status: 200 })
    }) as unknown as typeof fetch

    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000", session: "default" })
    expect(configR.success).toBe(true)
    if (!configR.success) return

    const file = { mimetype: "image/webp", data: "webp-data" }
    const r = await messageStickerSend({ config: configR.data, session: "other", chatId: "111@c.us", file })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual(message)

    const [url, init] = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls[0] as [string, RequestInit]
    expect(url).toBe("http://localhost:3000/api/sendSticker")
    expect(init.method).toBe("POST")
    expect(JSON.parse(sentBody!)).toEqual({ session: "other", chatId: "111@c.us", file })
  })

  test("sessionCappingGet uses config session and returns capping data", async () => {
    const response = {
      cappingStatus: "FIRST_WARNING",
      totalQuota: 1000,
      usedQuota: 640,
      cycleStart: 1782874800,
      cycleEnd: 1785553199,
      mvStatus: "NOT_ELIGIBLE",
      oteStatus: null,
    }
    globalThis.fetch = mock(
      async () => new Response(JSON.stringify(response), { status: 200 }),
    ) as unknown as typeof fetch

    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000", session: "default" })
    if (!configR.success) return

    const r = await sessionCappingGet({ config: configR.data })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual(response)

    const [url, init] = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls[0] as [string, RequestInit]
    expect(url).toBe("http://localhost:3000/api/default/capping")
    expect(init.method).toBe("GET")
    expect(init.body).toBeUndefined()
  })

  test("sessionTimelockGet uses explicit encoded session and returns timelock data", async () => {
    const response = { enforcementType: "RESTRICT_ALL_COMPANIONS", isActive: true, timeEnforcementEnds: null }
    globalThis.fetch = mock(
      async () => new Response(JSON.stringify(response), { status: 200 }),
    ) as unknown as typeof fetch

    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000", session: "default" })
    if (!configR.success) return

    const r = await sessionTimelockGet({ config: configR.data, session: "my session" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual(response)

    const [url, init] = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls[0] as [string, RequestInit]
    expect(url).toBe("http://localhost:3000/api/my%20session/timelock")
    expect(init.method).toBe("GET")
    expect(init.body).toBeUndefined()
  })
})
