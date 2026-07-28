import { afterEach, describe, expect, mock, test } from "bun:test"
import { wahaClientConfig } from "../src/wahaClientConfig.js"
import { wahaClientFromEnv } from "../src/wahaClientFromEnv.js"
import { wahaPathApi, wahaPathSession } from "../src/wahaPath.js"
import { wahaRequest, wahaRequestBodyWithSession, wahaRequestQueryString, wahaRequestUrl } from "../src/wahaRequest.js"

describe("wahaRequestBodyWithSession", () => {
  test("injects session when missing", () => {
    expect(wahaRequestBodyWithSession({ chatId: "1" }, "default", true)).toEqual({
      chatId: "1",
      session: "default",
    })
  })

  test("does not overwrite existing session", () => {
    expect(wahaRequestBodyWithSession({ session: "other" }, "default", true)).toEqual({
      session: "other",
    })
  })

  test("skips when injectSession false", () => {
    expect(wahaRequestBodyWithSession({ chatId: "1" }, "default", false)).toEqual({ chatId: "1" })
  })

  test("skips when session null in body is treated as missing", () => {
    expect(wahaRequestBodyWithSession({ session: null, x: 1 }, "default", true)).toEqual({
      session: "default",
      x: 1,
    })
  })

  test("skips arrays and non-objects", () => {
    expect(wahaRequestBodyWithSession([1], "default", true)).toEqual([1])
    expect(wahaRequestBodyWithSession("x", "default", true)).toBe("x")
    expect(wahaRequestBodyWithSession(null, "default", true)).toBe(null)
  })
})

describe("wahaRequestQueryString / wahaRequestUrl", () => {
  test("builds query and skips null/undefined", () => {
    expect(wahaRequestQueryString({ a: 1, b: true, c: "x", d: null, e: undefined })).toBe("?a=1&b=true&c=x")
  })

  test("empty query", () => {
    expect(wahaRequestQueryString()).toBe("")
    expect(wahaRequestQueryString({})).toBe("")
  })

  test("joins base + path + query", () => {
    expect(wahaRequestUrl("http://localhost:3000", "/api/sessions", { limit: 10 })).toBe(
      "http://localhost:3000/api/sessions?limit=10",
    )
  })
})

describe("wahaPath", () => {
  test("wahaPathSession encodes session", () => {
    expect(wahaPathSession("my session", "/profile")).toBe("/api/my%20session/profile")
  })

  test("wahaPathApi", () => {
    expect(wahaPathApi("/sessions")).toBe("/api/sessions")
  })
})

describe("wahaClientConfig", () => {
  test("strips trailing slash on baseUrl", () => {
    const r = wahaClientConfig({ baseUrl: "http://localhost:3000/" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.baseUrl).toBe("http://localhost:3000")
  })

  test("accepts timeoutMs and retries", () => {
    const r = wahaClientConfig({
      baseUrl: "http://localhost:3000",
      timeoutMs: 5000,
      retries: 2,
    })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.timeoutMs).toBe(5000)
      expect(r.data.retries).toBe(2)
    }
  })
})

describe("wahaClientFromEnv", () => {
  test("requires WAHA_BASE_URL", () => {
    const r = wahaClientFromEnv({})
    expect(r.success).toBe(false)
  })

  test("loads env keys", () => {
    const r = wahaClientFromEnv({
      WAHA_BASE_URL: "http://localhost:3000/",
      WAHA_API_KEY: "key",
      WAHA_SESSION: "default",
      WAHA_TIMEOUT_MS: "10000",
      WAHA_RETRIES: "2",
    })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.baseUrl).toBe("http://localhost:3000")
      expect(r.data.apiKey).toBe("key")
      expect(r.data.session).toBe("default")
      expect(r.data.timeoutMs).toBe(10000)
      expect(r.data.retries).toBe(2)
    }
  })
})

describe("wahaRequest fetch", () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  test("success json path", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    }) as unknown as typeof fetch

    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000", apiKey: "secret" })
    expect(configR.success).toBe(true)
    if (!configR.success) return

    const r = await wahaRequest({
      config: configR.data,
      method: "GET",
      path: "/api/sessions",
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual({ ok: true })

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    expect(calls.length).toBe(1)
    const [url, init] = calls[0] as [string, RequestInit]
    expect(url).toBe("http://localhost:3000/api/sessions")
    expect(init.method).toBe("GET")
    expect((init.headers as Record<string, string>)["X-Api-Key"]).toBe("secret")
  })

  test("injects session into body", async () => {
    let sentBody: string | undefined
    globalThis.fetch = mock(async (_url, init) => {
      sentBody = init?.body as string
      return new Response("{}", { status: 200 })
    }) as unknown as typeof fetch

    const configR = wahaClientConfig({
      baseUrl: "http://localhost:3000",
      session: "default",
    })
    if (!configR.success) return

    await wahaRequest({
      config: configR.data,
      method: "POST",
      path: "/api/sendText",
      body: { chatId: "1", text: "hi" },
      injectSession: true,
    })
    expect(JSON.parse(sentBody!)).toEqual({
      chatId: "1",
      text: "hi",
      session: "default",
    })
  })

  test("4xx is not retried", async () => {
    let attempts = 0
    globalThis.fetch = mock(async () => {
      attempts++
      return new Response("nope", { status: 400, statusText: "Bad Request" })
    }) as unknown as typeof fetch

    const configR = wahaClientConfig({
      baseUrl: "http://localhost:3000",
      retries: 3,
    })
    if (!configR.success) return

    const r = await wahaRequest({
      config: configR.data,
      method: "GET",
      path: "/api/x",
    })
    expect(r.success).toBe(false)
    expect(attempts).toBe(1)
  })

  test("5xx is retried", async () => {
    let attempts = 0
    globalThis.fetch = mock(async () => {
      attempts++
      if (attempts < 3) {
        return new Response("err", { status: 503, statusText: "Unavailable" })
      }
      return new Response(JSON.stringify({ ok: 1 }), { status: 200 })
    }) as unknown as typeof fetch

    const configR = wahaClientConfig({
      baseUrl: "http://localhost:3000",
      retries: 2,
    })
    if (!configR.success) return

    const r = await wahaRequest({
      config: configR.data,
      method: "GET",
      path: "/api/x",
    })
    expect(r.success).toBe(true)
    expect(attempts).toBe(3)
  })

  test("bytes responseType", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(new Uint8Array([1, 2, 3]), { status: 200 })
    }) as unknown as typeof fetch

    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000" })
    if (!configR.success) return

    const r = await wahaRequest({
      config: configR.data,
      method: "GET",
      path: "/api/screenshot",
      responseType: "bytes",
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual(new Uint8Array([1, 2, 3]))
  })

  test("void / 204", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(null, { status: 204 })
    }) as unknown as typeof fetch

    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000" })
    if (!configR.success) return

    const r = await wahaRequest({
      config: configR.data,
      method: "DELETE",
      path: "/api/x",
      responseType: "void",
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toBeUndefined()
  })
})
