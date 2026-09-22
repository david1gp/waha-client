import { afterEach, describe, expect, test } from "bun:test"
import type { CommandContext } from "@stricli/core"
import { apiKeyCommands } from "../src/apiKeys/cli/apiKeyCommands.js"
import { appCommands } from "../src/apps/cli/appCommands.js"

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

function responseFor(path: string, method: string): Response {
  if (method === "DELETE" && path === "/api/apps/app%2F1") return new Response(null, { status: 204 })
  if (method === "DELETE") return Response.json({ deleted: true })
  if (path === "/api/apps/chatwoot/locales") return Response.json([{ code: "en", name: "English" }])
  return Response.json({ path, method })
}

describe("API key and app CLI routes", () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  test("exports all API-key and app operations as discoverable routes", () => {
    expect(routeNames(apiKeyCommands)).toEqual(["create", "list", "media-create", "control-create", "update", "delete"])
    expect(routeNames(appCommands)).toEqual(["list", "create", "get", "update", "delete", "chatwoot-locales"])
  })

  test("forwards API-key JSON bodies, IDs, and session-scoped creation", async () => {
    const requests: { url: string; method: string; body?: unknown }[] = []
    globalThis.fetch = (async (input: string | Request | URL, init: RequestInit | undefined) => {
      requests.push({
        url: String(input),
        method: init?.method ?? "",
        body: init?.body === undefined ? undefined : JSON.parse(String(init.body)),
      })
      return Response.json({ ok: true })
    }) as unknown as typeof fetch

    await invokeCommand(apiKeyCommands, "create", {
      baseUrl: "http://localhost:3000",
      bodyJson: JSON.stringify({ isAdmin: true, actions: { read: true } }),
    })
    await invokeCommand(apiKeyCommands, "update", {
      baseUrl: "http://localhost:3000",
      id: "key/1",
      bodyJson: JSON.stringify({ isActive: false }),
    })
    await invokeCommand(apiKeyCommands, "media-create", {
      baseUrl: "http://localhost:3000",
      session: "media-session",
    })
    await invokeCommand(apiKeyCommands, "control-create", {
      baseUrl: "http://localhost:3000",
      session: "control-session",
    })

    expect(requests).toEqual([
      {
        url: "http://localhost:3000/api/keys",
        method: "POST",
        body: { isAdmin: true, actions: { read: true } },
      },
      {
        url: "http://localhost:3000/api/keys/key%2F1",
        method: "PUT",
        body: { isActive: false },
      },
      {
        url: "http://localhost:3000/api/keys/media",
        method: "POST",
        body: { session: "media-session" },
      },
      {
        url: "http://localhost:3000/api/keys/control",
        method: "POST",
        body: { session: "control-session" },
      },
    ])
  })

  test("forwards app JSON bodies, IDs, session query, and void delete", async () => {
    const requests: { url: string; method: string; body?: unknown }[] = []
    globalThis.fetch = (async (input: string | Request | URL, init: RequestInit | undefined) => {
      requests.push({
        url: String(input),
        method: init?.method ?? "",
        body: init?.body === undefined ? undefined : JSON.parse(String(init.body)),
      })
      return responseFor(new URL(String(input)).pathname, init?.method ?? "")
    }) as unknown as typeof fetch

    await invokeCommand(appCommands, "list", {
      baseUrl: "http://localhost:3000",
      session: "app-session",
    })
    await invokeCommand(appCommands, "create", {
      baseUrl: "http://localhost:3000",
      bodyJson: JSON.stringify({ id: "app-1", session: "app-session", app: "chatwoot", config: { url: "x" } }),
    })
    await invokeCommand(appCommands, "get", { baseUrl: "http://localhost:3000", id: "app/1" })
    await invokeCommand(appCommands, "update", {
      baseUrl: "http://localhost:3000",
      id: "app/1",
      bodyJson: JSON.stringify({ id: "app-1", session: "app-session", app: "chatwoot", config: { url: "y" } }),
    })
    await invokeCommand(appCommands, "delete", { baseUrl: "http://localhost:3000", id: "app/1" })
    const locales = await invokeCommand(appCommands, "chatwoot-locales", { baseUrl: "http://localhost:3000" })

    expect(requests).toEqual([
      { url: "http://localhost:3000/api/apps?session=app-session", method: "GET" },
      {
        url: "http://localhost:3000/api/apps",
        method: "POST",
        body: { id: "app-1", session: "app-session", app: "chatwoot", config: { url: "x" } },
      },
      { url: "http://localhost:3000/api/apps/app%2F1", method: "GET" },
      {
        url: "http://localhost:3000/api/apps/app%2F1",
        method: "PUT",
        body: { id: "app-1", session: "app-session", app: "chatwoot", config: { url: "y" } },
      },
      { url: "http://localhost:3000/api/apps/app%2F1", method: "DELETE" },
      { url: "http://localhost:3000/api/apps/chatwoot/locales", method: "GET" },
    ])
    expect(locales).toBe('[\n  {\n    "code": "en",\n    "name": "English"\n  }\n]\n')
  })

  test("rejects invalid nested JSON before making an API-key request", async () => {
    let requestCount = 0
    globalThis.fetch = (async () => {
      requestCount += 1
      return Response.json({ ok: true })
    }) as unknown as typeof fetch

    const originalExit = process.exit
    process.exit = ((code?: number) => {
      throw new Error(`exit ${code ?? 0}`)
    }) as never

    try {
      await expect(
        invokeCommand(apiKeyCommands, "create", {
          baseUrl: "http://localhost:3000",
          bodyJson: "{invalid",
        }),
      ).rejects.toThrow("exit 1")
    } finally {
      process.exit = originalExit
    }

    expect(requestCount).toBe(0)
  })
})
