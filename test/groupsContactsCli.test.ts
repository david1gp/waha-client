import { describe, expect, test } from "bun:test"
import { join } from "node:path"
import { lidCommands } from "../src/lids/cli/lidCommands.js"

const cliPath = join(import.meta.dir, "../src/cli.ts")

type CapturedRequest = { method: string; path: string; body: unknown }

async function runCli(args: string[]) {
  const proc = Bun.spawn(["bun", "run", cliPath, ...args], { stdout: "pipe", stderr: "pipe" })
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ])
  return { stdout, stderr, exitCode }
}

async function withMockWaha<T>(callback: (baseUrl: string, requests: CapturedRequest[]) => Promise<T>): Promise<T> {
  const requests: CapturedRequest[] = []
  const server = Bun.serve({
    port: 0,
    async fetch(request) {
      const url = new URL(request.url)
      requests.push({
        method: request.method,
        path: url.pathname + url.search,
        body: request.method === "GET" ? undefined : await request.json(),
      })
      if (request.method === "POST" && url.pathname.endsWith("/groups")) {
        return Response.json({ jid: "team@g.us", name: "Team", participants: [] })
      }
      if (request.method === "GET" && url.pathname.endsWith("/groups")) return Response.json([])
      return Response.json({ ok: true })
    },
  })

  try {
    return await callback(`http://127.0.0.1:${server.port}`, requests)
  } finally {
    await server.stop(true)
  }
}

describe("groups, contacts, and LIDs CLI adapters", () => {
  test("groups create parses nested participants JSON and forwards list exclusions", async () => {
    await withMockWaha(async (baseUrl, requests) => {
      const create = await runCli([
        "groups",
        "create",
        "--baseUrl",
        baseUrl,
        "--session",
        "cli-session",
        "--name",
        "Team",
        "--participantsJson",
        '[{"id":"1@c.us"}]',
      ])
      expect(create.exitCode).toBe(0)
      expect(requests[0]).toEqual({
        method: "POST",
        path: "/api/cli-session/groups",
        body: { name: "Team", participants: [{ id: "1@c.us" }] },
      })

      const list = await runCli([
        "groups",
        "list",
        "--baseUrl",
        baseUrl,
        "--session",
        "cli-session",
        "--exclude",
        "participants",
      ])
      expect(list.exitCode).toBe(0)
      const listRequest = requests[1]
      expect(listRequest).toBeDefined()
      if (!listRequest) return
      expect(listRequest.path).toContain("exclude=participants")
    })
  })

  test("contacts update forwards every required scalar option", async () => {
    await withMockWaha(async (baseUrl, requests) => {
      const result = await runCli([
        "contacts",
        "update",
        "--baseUrl",
        baseUrl,
        "--session",
        "cli-session",
        "--chatId",
        "123@c.us",
        "--firstName",
        "Ada",
        "--lastName",
        "Lovelace",
      ])
      expect(result.exitCode).toBe(0)
      expect(requests[0]).toEqual({
        method: "PUT",
        path: "/api/cli-session/contacts/123%40c.us",
        body: { firstName: "Ada", lastName: "Lovelace" },
      })
    })
  })

  test("invalid group JSON fails before making a request", async () => {
    await withMockWaha(async (baseUrl, requests) => {
      const result = await runCli([
        "groups",
        "participants-add",
        "--baseUrl",
        baseUrl,
        "--id",
        "team@g.us",
        "--participantsJson",
        "not-json",
      ])
      expect(result.exitCode).toBe(1)
      expect(requests).toHaveLength(0)
    })
  })

  test("LID route map is exported for root registration", () => {
    expect(lidCommands).toBeDefined()
  })
})
