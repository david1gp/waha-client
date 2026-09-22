import { afterEach, describe, expect, test } from "bun:test"
import type { CommandContext } from "@stricli/core"
import { channelCommands } from "../src/channels/cli/channelCommands.js"
import { labelCommands } from "../src/labels/cli/labelCommands.js"

type RouteMap = {
  getAllEntries: () => readonly {
    name: { original: string }
    target: unknown
  }[]
}

type CommandFunction = (this: CommandContext, flags: Record<string, unknown>) => Promise<void>

function routeNames(routeMap: RouteMap): string[] {
  return routeMap.getAllEntries().map((entry) => entry.name.original)
}

async function invokeCommand(routeMap: RouteMap, name: string, flags: Record<string, unknown>): Promise<string> {
  const entry = routeMap.getAllEntries().find((candidate) => candidate.name.original === name)
  if (entry === undefined) throw new Error(`Missing route ${name}`)

  let stdout = ""
  const context = {
    process: { stdout: { write: (value: string) => (stdout += value) } },
  } as unknown as CommandContext
  const target = entry.target as { loader: () => Promise<unknown> }
  const command = (await target.loader()) as CommandFunction
  await command.call(context, flags)
  return stdout
}

describe("channel and label CLI routes", () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  test("exports every channel and label operation as a discoverable route", () => {
    expect(routeNames(channelCommands)).toEqual([
      "list",
      "create",
      "get",
      "delete",
      "message-preview",
      "follow",
      "unfollow",
      "mute",
      "unmute",
      "search-by-view",
      "search-by-text",
      "search-views",
      "search-countries",
      "search-categories",
    ])
    expect(routeNames(labelCommands)).toEqual([
      "list",
      "create",
      "update",
      "delete",
      "chat-list",
      "chat-set",
      "chats-by-label",
    ])
  })

  test("channel create parses pictureJson and forwards the nested WahaFile", async () => {
    let requestUrl: string | undefined
    let requestMethod: string | undefined
    let requestBody: RequestInit["body"]
    globalThis.fetch = (async (input: string | Request | URL, init: RequestInit | undefined) => {
      requestUrl = String(input)
      requestMethod = init?.method
      requestBody = init?.body
      return Response.json({ id: "channel-1", name: "News", role: "OWNER" })
    }) as unknown as typeof fetch

    const stdout = await invokeCommand(channelCommands, "create", {
      baseUrl: "http://localhost:3000",
      session: "cli-session",
      name: "News",
      description: "Updates",
      pictureJson: JSON.stringify({ mimetype: "image/png", url: "https://example.com/news.png" }),
    })

    expect(JSON.parse(stdout)).toEqual({ id: "channel-1", name: "News", role: "OWNER" })
    expect(requestUrl).toBe("http://localhost:3000/api/cli-session/channels")
    expect(requestMethod).toBe("POST")
    expect(JSON.parse(requestBody as string)).toEqual({
      name: "News",
      description: "Updates",
      picture: { mimetype: "image/png", url: "https://example.com/news.png" },
    })
  })

  test("label chat-set parses labelsJson and forwards the nested label IDs", async () => {
    let requestUrl: string | undefined
    let requestMethod: string | undefined
    let requestBody: RequestInit["body"]
    globalThis.fetch = (async (input: string | Request | URL, init: RequestInit | undefined) => {
      requestUrl = String(input)
      requestMethod = init?.method
      requestBody = init?.body
      return Response.json({ success: true })
    }) as unknown as typeof fetch

    const stdout = await invokeCommand(labelCommands, "chat-set", {
      baseUrl: "http://localhost:3000",
      session: "cli-session",
      chatId: "123@c.us",
      labelsJson: JSON.stringify([{ id: "label-1" }, { id: "label-2" }]),
    })

    expect(JSON.parse(stdout)).toEqual({ success: true })
    expect(requestUrl).toBe("http://localhost:3000/api/cli-session/labels/chats/123%40c.us")
    expect(requestMethod).toBe("PUT")
    expect(JSON.parse(requestBody as string)).toEqual({ labels: [{ id: "label-1" }, { id: "label-2" }] })
  })
})
