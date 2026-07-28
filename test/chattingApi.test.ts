import { afterEach, describe, expect, mock, test } from "bun:test"
import { messageTextSend } from "../src/messageTextSend.js"
import { numberStatusCheck } from "../src/numberStatusCheck.js"
import { messageIdNewGet } from "../src/messageIdNewGet.js"
import { messageReactionSet } from "../src/messageReactionSet.js"
import { wahaClientConfig } from "../src/wahaClientConfig.js"

describe("chattingApi", () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  test("messageTextSend injects session from config", async () => {
    let sentBody: string | undefined
    globalThis.fetch = mock(async (_url, init) => {
      sentBody = init?.body as string
      return new Response(JSON.stringify({ id: "m1", timestamp: 1, from: "me", fromMe: true, to: "1" }), {
        status: 200,
      })
    }) as unknown as typeof fetch

    const configR = wahaClientConfig({
      baseUrl: "http://localhost:3000",
      session: "default",
      apiKey: "k",
    })
    expect(configR.success).toBe(true)
    if (!configR.success) return

    const r = await messageTextSend({
      config: configR.data,
      chatId: "111@c.us",
      text: "hi",
    })
    expect(r.success).toBe(true)

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    const [url, init] = calls[0] as [string, RequestInit]
    expect(url).toBe("http://localhost:3000/api/sendText")
    expect(init.method).toBe("POST")
    expect(JSON.parse(sentBody!)).toEqual({
      chatId: "111@c.us",
      text: "hi",
      session: "default",
    })
  })

  test("messageTextSend does not overwrite explicit session", async () => {
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

    await messageTextSend({
      config: configR.data,
      session: "other",
      chatId: "111@c.us",
      text: "hi",
    })
    expect(JSON.parse(sentBody!)).toEqual({
      session: "other",
      chatId: "111@c.us",
      text: "hi",
    })
  })

  test("numberStatusCheck GET with session query", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ numberExists: true, chatId: "121@c.us" }), { status: 200 })
    }) as unknown as typeof fetch

    const configR = wahaClientConfig({
      baseUrl: "http://localhost:3000",
      session: "default",
    })
    if (!configR.success) return

    const r = await numberStatusCheck({ config: configR.data, phone: "1213213213" })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data).toEqual({ numberExists: true, chatId: "121@c.us" })
    }

    const [url, init] = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls[0] as [string, RequestInit]
    expect(url).toBe("http://localhost:3000/api/checkNumberStatus?session=default&phone=1213213213")
    expect(init.method).toBe("GET")
  })

  test("numberStatusCheck errors when session missing", async () => {
    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000" })
    if (!configR.success) return
    const r = await numberStatusCheck({ config: configR.data, phone: "1" })
    expect(r.success).toBe(false)
  })

  test("messageIdNewGet path session", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ id: "ABC" }), { status: 200 })
    }) as unknown as typeof fetch

    const configR = wahaClientConfig({
      baseUrl: "http://localhost:3000",
      session: "my session",
    })
    if (!configR.success) return

    const r = await messageIdNewGet({ config: configR.data })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual({ id: "ABC" })

    const [url, init] = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls[0] as [string, RequestInit]
    expect(url).toBe("http://localhost:3000/api/my%20session/new-message-id")
    expect(init.method).toBe("GET")
  })

  test("messageReactionSet PUT injects session", async () => {
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

    await messageReactionSet({
      config: configR.data,
      messageId: "false_1@c.us_AAA",
      reaction: "👍",
    })

    const [url, init] = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls[0] as [string, RequestInit]
    expect(url).toBe("http://localhost:3000/api/reaction")
    expect(init.method).toBe("PUT")
    expect(JSON.parse(sentBody!)).toEqual({
      messageId: "false_1@c.us_AAA",
      reaction: "👍",
      session: "default",
    })
  })
})
