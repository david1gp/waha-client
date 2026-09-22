import { afterEach, describe, expect, test } from "bun:test"
import type { CommandContext } from "@stricli/core"
import { chatCommands } from "../src/chats/cli/chatCommands.js"
import { messageCommands } from "../src/messages/cli/messageCommands.js"

type RouteMap = { getAllEntries: () => readonly { name: { original: string }; target: unknown }[] }

function routeNames(routeMap: RouteMap): string[] {
  return routeMap.getAllEntries().map((entry) => entry.name.original)
}

async function invoke(routeMap: RouteMap, name: string, flags: Record<string, unknown>): Promise<string> {
  const entry = routeMap.getAllEntries().find((candidate) => candidate.name.original === name)
  if (entry === undefined) throw new Error(`Missing route ${name}`)
  let stdout = ""
  const context = { process: { stdout: { write: (value: string) => (stdout += value) } } } as unknown as CommandContext
  const command = (await (entry.target as { loader: () => Promise<unknown> }).loader()) as (
    this: CommandContext,
    flags: Record<string, unknown>,
  ) => Promise<void>
  await command.call(context, flags)
  return stdout
}

describe("message and chat CLI routes", () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  test("exports every message and chat operation route", () => {
    expect(routeNames(messageCommands)).toEqual([
      "send-text",
      "send-sticker",
      "send-image",
      "send-file",
      "send-voice",
      "send-video",
      "send-link-custom-preview",
      "send-buttons",
      "send-list",
      "forward",
      "send-seen",
      "set-reaction",
      "set-star",
      "send-poll",
      "vote-poll",
      "send-location",
      "send-contact-vcard",
      "reply-buttons",
      "reply",
      "send-link-preview",
      "number-status",
      "message-id-new",
      "list",
    ])
    expect(routeNames(chatCommands)).toEqual([
      "list",
      "overview",
      "overview-post",
      "delete",
      "picture",
      "messages",
      "messages-delete-all",
      "message-read",
      "message-get",
      "message-delete",
      "message-edit",
      "message-pin",
      "message-unpin",
      "archive",
      "unarchive",
      "unread",
    ])
  })

  test("forwards send-image file and message options in the request body", async () => {
    let requestBody = ""
    globalThis.fetch = (async (_input: unknown, init?: { body?: unknown }) => {
      requestBody = String(init?.body)
      return Response.json({ id: "message-1" })
    }) as unknown as typeof fetch

    const stdout = await invoke(messageCommands, "send-image", {
      baseUrl: "http://localhost:3000",
      session: "cli-session",
      chatId: "123@c.us",
      file: "https://example.com/a.jpg",
      caption: "hello",
      mentions: ["123"],
      reply_to: "old-message",
    })

    expect(JSON.parse(stdout)).toEqual({ id: "message-1" })
    expect(JSON.parse(requestBody)).toEqual({
      session: "cli-session",
      chatId: "123@c.us",
      file: { mimetype: "image/jpeg", url: "https://example.com/a.jpg" },
      caption: "hello",
      mentions: ["123"],
      reply_to: "old-message",
    })
  })

  test("forwards all amended send-text options", async () => {
    let requestBody = ""
    globalThis.fetch = (async (_input: unknown, init?: { body?: unknown }) => {
      requestBody = String(init?.body)
      return Response.json({ id: "message-2" })
    }) as unknown as typeof fetch

    await invoke(messageCommands, "send-text", {
      baseUrl: "http://localhost:3000",
      session: "cli-session",
      chatId: "123@c.us",
      text: "hello",
      id: "message-2",
      mentions: ["123"],
      reply_to: "old-message",
      linkPreview: true,
      linkPreviewHighQuality: true,
    })

    expect(JSON.parse(requestBody)).toEqual({
      session: "cli-session",
      chatId: "123@c.us",
      text: "hello",
      id: "message-2",
      mentions: ["123"],
      reply_to: "old-message",
      linkPreview: true,
      linkPreviewHighQuality: true,
    })
  })

  test("parses overview-post JSON inputs without flattening them", async () => {
    let requestBody = ""
    globalThis.fetch = (async (_input: unknown, init?: { body?: unknown }) => {
      requestBody = String(init?.body)
      return Response.json([])
    }) as unknown as typeof fetch

    await invoke(chatCommands, "overview-post", {
      baseUrl: "http://localhost:3000",
      session: "cli-session",
      paginationJson: '{"limit":2,"merge":true}',
      filterJson: '{"ids":["123@c.us"]}',
    })

    expect(JSON.parse(requestBody)).toEqual({
      pagination: { limit: 2, merge: true },
      filter: { ids: ["123@c.us"] },
    })
  })
})
