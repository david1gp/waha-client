import { afterEach, describe, expect, test } from "bun:test"
import type { CommandContext } from "@stricli/core"
import { callCommands } from "../src/calls/cli/callCommands.js"
import { mediaCommands } from "../src/media/cli/mediaCommands.js"
import { storageCommands } from "../src/media/cli/storageCommands.js"
import { presenceCommands } from "../src/presence/cli/presenceCommands.js"
import { statusCommands } from "../src/status/cli/statusCommands.js"

type RouteMap = { getAllEntries: () => readonly { name: { original: string }; target: unknown }[] }

type CommandFunction = (this: CommandContext, flags: Record<string, unknown>) => Promise<void>

function routeNames(routeMap: RouteMap): string[] {
  return routeMap.getAllEntries().map((entry) => entry.name.original)
}

async function invoke(routeMap: RouteMap, name: string, flags: Record<string, unknown>): Promise<string> {
  const entry = routeMap.getAllEntries().find((candidate) => candidate.name.original === name)
  if (entry === undefined) throw new Error(`Missing route ${name}`)
  let stdout = ""
  const context = { process: { stdout: { write: (value: string) => (stdout += value) } } } as unknown as CommandContext
  const command = (await (entry.target as { loader: () => Promise<unknown> }).loader()) as CommandFunction
  await command.call(context, flags)
  return stdout
}

describe("presence, status, calls, and media CLI adapters", () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  test("exports every requested domain route", () => {
    expect(routeNames(presenceCommands)).toEqual(["set", "list", "get", "subscribe", "typing-start", "typing-stop"])
    expect(routeNames(statusCommands)).toEqual([
      "send-text",
      "send-image",
      "send-voice",
      "send-video",
      "delete",
      "message-id-new",
    ])
    expect(routeNames(callCommands)).toEqual(["reject"])
    expect(routeNames(mediaCommands)).toEqual(["voice-convert", "video-convert"])
    expect(routeNames(storageCommands)).toEqual(["file-get", "file-delete", "s3-object-get"])
  })

  test("forwards optional presence chatId and status text options", async () => {
    let requestUrl = ""
    let requestBody = ""
    globalThis.fetch = (async (input: string | Request | URL, init?: RequestInit) => {
      requestUrl = String(input)
      requestBody = String(init?.body)
      return Response.json({ id: "status-1" })
    }) as unknown as typeof fetch

    await invoke(presenceCommands, "set", {
      baseUrl: "http://localhost:3000",
      session: "cli-session",
      presence: "typing",
    })
    expect(requestUrl).toBe("http://localhost:3000/api/cli-session/presence")
    expect(JSON.parse(requestBody)).toEqual({ presence: "typing" })

    await invoke(statusCommands, "send-text", {
      baseUrl: "http://localhost:3000",
      session: "cli-session",
      text: "hello",
      backgroundColor: "#fff",
      font: 2,
      linkPreview: true,
      linkPreviewHighQuality: true,
      id: "status-1",
      contacts: "111,222",
    })
    expect(JSON.parse(requestBody)).toEqual({
      text: "hello",
      backgroundColor: "#fff",
      font: 2,
      linkPreview: true,
      linkPreviewHighQuality: true,
      id: "status-1",
      contacts: ["111", "222"],
    })
  })

  test("uses binary output helpers for media conversion and storage", async () => {
    let requestUrl = ""
    globalThis.fetch = (async (input: string | Request | URL) => {
      requestUrl = String(input)
      return new Response(new Uint8Array([1, 2, 255]))
    }) as unknown as typeof fetch

    const converted = await invoke(mediaCommands, "voice-convert", {
      baseUrl: "http://localhost:3000",
      session: "cli-session",
      url: "https://example.com/input.ogg",
    })
    expect(JSON.parse(converted)).toEqual({ encoding: "base64", data: "AQL/" })
    expect(requestUrl).toBe("http://localhost:3000/api/cli-session/media/convert/voice")

    const stored = await invoke(storageCommands, "file-get", {
      baseUrl: "http://localhost:3000",
      session: "cli-session",
      pathPart: ["folder", "name with spaces.bin"],
    })
    expect(JSON.parse(stored)).toEqual({ encoding: "base64", data: "AQL/" })
    expect(requestUrl).toBe("http://localhost:3000/api/files/cli-session/folder/name%20with%20spaces.bin")
  })

  test("forwards call rejection as a void operation", async () => {
    let requestBody = ""
    globalThis.fetch = (async (_input: string | Request | URL, init?: RequestInit) => {
      requestBody = String(init?.body)
      return new Response(null, { status: 204 })
    }) as unknown as typeof fetch

    const stdout = await invoke(callCommands, "reject", {
      baseUrl: "http://localhost:3000",
      session: "cli-session",
      from: "123@c.us",
      id: "call-1",
    })
    expect(stdout).toBe("undefined\n")
    expect(JSON.parse(requestBody)).toEqual({ from: "123@c.us", id: "call-1" })
  })
})
