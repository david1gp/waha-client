import { afterEach, describe, expect, mock, test } from "bun:test"
import { chatList } from "../src/chatList.js"
import { chatMessageList } from "../src/chatMessageList.js"
import { wahaClientConfig } from "../src/wahaClientConfig.js"

describe("chatApi", () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  test("chatList GET /api/{session}/chats with query", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify([{ id: "111@c.us", name: "Alice" }]), {
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

    const r = await chatList({
      config: configR.data,
      limit: 10,
      offset: 0,
      sortBy: "conversationTimestamp",
      sortOrder: "desc",
      merge: true,
    })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data).toEqual([{ id: "111@c.us", name: "Alice" }])
    }

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    expect(calls.length).toBe(1)
    const [url, init] = calls[0] as [string, RequestInit]
    expect(url).toBe(
      "http://localhost:3000/api/default/chats?limit=10&offset=0&sortBy=conversationTimestamp&sortOrder=desc&merge=true",
    )
    expect(init.method).toBe("GET")
    expect((init.headers as Record<string, string>)["X-Api-Key"]).toBe("k")
  })

  test("chatList uses session override and encodes path", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify([]), { status: 200 })
    }) as unknown as typeof fetch

    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000", session: "default" })
    if (!configR.success) return

    const r = await chatList({ config: configR.data, session: "my session" })
    expect(r.success).toBe(true)

    const [url] = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls[0] as [string]
    expect(url).toBe("http://localhost:3000/api/my%20session/chats")
  })

  test("chatList errors when session missing", async () => {
    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000" })
    if (!configR.success) return
    const r = await chatList({ config: configR.data })
    expect(r.success).toBe(false)
  })

  test("chatMessageList GET messages with filters", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify([{ id: "msg1", body: "hi" }]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    }) as unknown as typeof fetch

    const configR = wahaClientConfig({
      baseUrl: "http://localhost:3000",
      session: "default",
    })
    if (!configR.success) return

    const r = await chatMessageList({
      config: configR.data,
      chatId: "111@c.us",
      limit: 20,
      sortBy: "timestamp",
      sortOrder: "desc",
      downloadMedia: false,
      filterFromMe: true,
      filterAck: "READ",
      filterTimestampGte: 1000,
    })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data).toEqual([{ id: "msg1", body: "hi" }] as typeof r.data)
    }

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    const [url, init] = calls[0] as [string, RequestInit]
    expect(url).toBe(
      "http://localhost:3000/api/default/chats/111%40c.us/messages?limit=20&sortBy=timestamp&sortOrder=desc&downloadMedia=false&filter.timestamp.gte=1000&filter.fromMe=true&filter.ack=READ",
    )
    expect(init.method).toBe("GET")
  })

  test("chatMessageList errors when session missing", async () => {
    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000" })
    if (!configR.success) return
    const r = await chatMessageList({ config: configR.data, chatId: "111@c.us" })
    expect(r.success).toBe(false)
  })
})
