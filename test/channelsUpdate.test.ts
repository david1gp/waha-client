import { afterEach, describe, expect, mock, test } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { unlink, writeFile } from "node:fs/promises"
import type { CommandContext } from "@stricli/core"
import { channelUpdate } from "../src/channels/channelUpdate.js"
import { channelCommands } from "../src/channels/cli/channelCommands.js"
import { wahaClientConfig } from "../src/client/wahaClientConfig.js"

type RouteMap = {
  getAllEntries: () => readonly {
    name: { original: string }
    target: unknown
  }[]
}

type CommandFunction = (this: CommandContext, flags: Record<string, unknown>) => Promise<void>

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

describe("channelUpdate", () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  test("PATCH /api/{session}/channels/{id} with name only", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ id: "1@newsletter", name: "Renamed", role: "OWNER" }), { status: 200 })
    }) as unknown as typeof fetch

    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000", session: "default" })
    if (!configR.success) return

    const r = await channelUpdate({ config: configR.data, id: "1@newsletter", name: "Renamed" })
    expect(r.success).toBe(true)

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    expect(calls.length).toBe(1)
    const [url, init] = calls[0] as [string, RequestInit]
    expect(url).toBe("http://localhost:3000/api/default/channels/1%40newsletter")
    expect(init.method).toBe("PATCH")
    expect(JSON.parse(init.body as string)).toEqual({ name: "Renamed" })
  })

  test("empty description clears (sent as empty string)", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ id: "1@newsletter", name: "News", role: "OWNER" }), { status: 200 })
    }) as unknown as typeof fetch

    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000", session: "default" })
    if (!configR.success) return

    const r = await channelUpdate({ config: configR.data, id: "1@newsletter", description: "" })
    expect(r.success).toBe(true)

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    const [, init] = calls[0] as [string, RequestInit]
    expect(init.method).toBe("PATCH")
    expect(JSON.parse(init.body as string)).toEqual({ description: "" })
  })

  test("picture WahaFile forwarded, null removes", async () => {
    const seen: unknown[] = []
    globalThis.fetch = mock(async (_input: unknown, init: RequestInit | undefined) => {
      seen.push(JSON.parse(init?.body as string))
      return new Response(JSON.stringify({ id: "1@newsletter", name: "News", role: "OWNER" }), { status: 200 })
    }) as unknown as typeof fetch

    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000", session: "default" })
    if (!configR.success) return

    const picture = { mimetype: "image/png", url: "https://example.com/news.png" }
    const setR = await channelUpdate({ config: configR.data, id: "1@newsletter", picture })
    expect(setR.success).toBe(true)

    const removeR = await channelUpdate({ config: configR.data, id: "1@newsletter", picture: null })
    expect(removeR.success).toBe(true)

    expect(seen).toEqual([{ picture }, { picture: null }])
  })

  test("empty id fails validation without fetching", async () => {
    globalThis.fetch = mock(async () => {
      return new Response("{}", { status: 200 })
    }) as unknown as typeof fetch

    const configR = wahaClientConfig({ baseUrl: "http://localhost:3000", session: "default" })
    if (!configR.success) return

    const r = await channelUpdate({ config: configR.data, id: "", name: "Nope" })
    expect(r.success).toBe(false)

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    expect(calls.length).toBe(0)
  })
})

describe("channels update CLI", () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  test("update forwards name/description via PATCH", async () => {
    let requestUrl: string | undefined
    let requestMethod: string | undefined
    let requestBody: RequestInit["body"]
    globalThis.fetch = (async (input: string | Request | URL, init: RequestInit | undefined) => {
      requestUrl = String(input)
      requestMethod = init?.method
      requestBody = init?.body
      return Response.json({ id: "1@newsletter", name: "Renamed", role: "OWNER" })
    }) as unknown as typeof fetch

    const stdout = await invokeCommand(channelCommands, "update", {
      baseUrl: "http://localhost:3000",
      session: "cli-session",
      id: "1@newsletter",
      name: "Renamed",
      description: "Fresh",
    })

    expect(JSON.parse(stdout)).toEqual({ id: "1@newsletter", name: "Renamed", role: "OWNER" })
    expect(requestUrl).toBe("http://localhost:3000/api/cli-session/channels/1%40newsletter")
    expect(requestMethod).toBe("PATCH")
    expect(JSON.parse(requestBody as string)).toEqual({ name: "Renamed", description: "Fresh" })
  })

  test("update --picture resolves a local file to a base64 WahaFile", async () => {
    const tmpFile = join(tmpdir(), `channel-picture-${Date.now()}.jpg`)
    await writeFile(tmpFile, Buffer.from([0xff, 0xd8, 0xff, 0x00, 0x01]))
    try {
      let requestBody: RequestInit["body"]
      globalThis.fetch = (async (_input: string | Request | URL, init: RequestInit | undefined) => {
        requestBody = init?.body
        return Response.json({ id: "1@newsletter", name: "News", role: "OWNER" })
      }) as unknown as typeof fetch

      await invokeCommand(channelCommands, "update", {
        baseUrl: "http://localhost:3000",
        session: "cli-session",
        id: "1@newsletter",
        picture: tmpFile,
      })

      const body = JSON.parse(requestBody as string) as {
        picture: { mimetype: string; filename: string; data: string }
      }
      expect(body.picture.mimetype).toBe("image/jpeg")
      expect(body.picture.filename).toBe(tmpFile.split("/").at(-1) ?? "")
      expect(typeof body.picture.data).toBe("string")
      expect(Buffer.from(body.picture.data, "base64").length).toBe(5)
    } finally {
      await unlink(tmpFile)
    }
  })

  test("update --remove-picture sends picture null", async () => {
    let requestBody: RequestInit["body"]
    globalThis.fetch = (async (_input: string | Request | URL, init: RequestInit | undefined) => {
      requestBody = init?.body
      return Response.json({ id: "1@newsletter", name: "News", role: "OWNER" })
    }) as unknown as typeof fetch

    await invokeCommand(channelCommands, "update", {
      baseUrl: "http://localhost:3000",
      session: "cli-session",
      id: "1@newsletter",
      removePicture: true,
    })

    expect(JSON.parse(requestBody as string)).toEqual({ picture: null })
  })

  test("update --pictureJson null sends picture null", async () => {
    let requestBody: RequestInit["body"]
    globalThis.fetch = (async (_input: string | Request | URL, init: RequestInit | undefined) => {
      requestBody = init?.body
      return Response.json({ id: "1@newsletter", name: "News", role: "OWNER" })
    }) as unknown as typeof fetch

    await invokeCommand(channelCommands, "update", {
      baseUrl: "http://localhost:3000",
      session: "cli-session",
      id: "1@newsletter",
      pictureJson: "null",
    })

    expect(JSON.parse(requestBody as string)).toEqual({ picture: null })
  })
})
