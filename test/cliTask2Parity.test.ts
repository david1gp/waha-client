import { describe, expect, test } from "bun:test"
import { mkdtemp, readFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

const cliPath = join(import.meta.dir, "../src/cli.ts")

type RequestRecord = { method: string; path: string; body: unknown }

async function runCli(args: string[]): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const proc = Bun.spawn(["bun", "run", cliPath, ...args], { stdout: "pipe", stderr: "pipe" })
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ])
  return { stdout, stderr, exitCode }
}

async function withMockApi<T>(callback: (baseUrl: string, requests: RequestRecord[]) => Promise<T>): Promise<T> {
  const requests: RequestRecord[] = []
  const server = Bun.serve({
    port: 0,
    async fetch(request) {
      const url = new URL(request.url)
      requests.push({
        method: request.method,
        path: `${url.pathname}${url.search}`,
        body: request.method === "GET" ? undefined : await request.json(),
      })
      if (url.pathname.endsWith("/auth/qr")) return new Response(new Uint8Array([1, 2, 3]))
      return Response.json({ id: "mock-result" })
    },
  })
  try {
    return await callback(`http://127.0.0.1:${server.port}`, requests)
  } finally {
    await server.stop(true)
  }
}

describe("task 2 CLI parity", () => {
  test("exposes the assigned route maps and parity flags", async () => {
    for (const [domain, routes] of [
      ["sessions", ["update", "start-all", "stop-all", "logout-all"]],
      ["auth", ["passkey-challenge", "passkey-confirmation", "passkey-confirm", "passkey-post"]],
      ["profile", ["name-set", "status-set", "picture-set", "picture-delete"]],
      ["server", ["stop", "environment", "debug-cpu", "debug-heapsnapshot", "debug-browser-trace", "screenshot"]],
      ["events", ["observe-one", "create", "cancel"]],
    ] as const) {
      const result = await runCli([domain, "--help"])
      expect(result.exitCode).toBe(0)
      for (const route of routes) expect(result.stdout).toContain(route)
    }
    const observeOneHelp = await runCli(["events", "observe-one", "--help"])
    expect(observeOneHelp.stdout).toContain("--timeoutMs")
  })

  test("does not advertise session on sessionless library operations", async () => {
    const commands = [
      ["sessions", "list"],
      ["sessions", "create"],
      ["api-keys", "create"],
      ["api-keys", "list"],
      ["api-keys", "update"],
      ["api-keys", "delete"],
      ["apps", "create"],
      ["apps", "get"],
      ["apps", "update"],
      ["apps", "delete"],
      ["apps", "chatwoot-locales"],
      ["server", "ping"],
      ["server", "health"],
      ["server", "version"],
      ["server", "status"],
      ["storage", "s3-object-get"],
    ]
    const results = await Promise.all(commands.map((command) => runCli([...command, "--help"])))

    for (const result of results) {
      expect(result.exitCode).toBe(0)
      expect(result.stdout).not.toMatch(/--session(?:\s|\]|$)/)
    }
  })

  test("forwards session JSON and event JSON without reshaping payloads", async () => {
    await withMockApi(async (baseUrl, requests) => {
      const session = await runCli([
        "sessions",
        "create",
        "--baseUrl",
        baseUrl,
        "--name",
        "cli-session",
        "--sessionConfigJson",
        '{"engine":"NOWEB"}',
        "--appsJson",
        '[{"id":"app"}]',
      ])
      const event = await runCli([
        "events",
        "create",
        "--baseUrl",
        baseUrl,
        "--session",
        "cli-session",
        "--chatId",
        "123@c.us",
        "--eventJson",
        '{"name":"Launch","startTime":1}',
      ])

      expect(session.exitCode).toBe(0)
      expect(event.exitCode).toBe(0)
      expect(requests).toEqual([
        {
          method: "POST",
          path: "/api/sessions",
          body: { name: "cli-session", config: { engine: "NOWEB" }, apps: [{ id: "app" }] },
        },
        {
          method: "POST",
          path: "/api/cli-session/events",
          body: { chatId: "123@c.us", event: { name: "Launch", startTime: 1 } },
        },
      ])
    })
  })

  test("writes image QR bytes to --output and rejects unknown formats", async () => {
    const directory = await mkdtemp(join(tmpdir(), "waha-cli-task2-"))
    const output = join(directory, "qr.png")
    try {
      await withMockApi(async (baseUrl, requests) => {
        const image = await runCli([
          "auth",
          "qr",
          "--baseUrl",
          baseUrl,
          "--session",
          "s1",
          "--format",
          "image",
          "--output",
          output,
        ])
        const invalid = await runCli(["auth", "qr", "--baseUrl", baseUrl, "--session", "s1", "--format", "svg"])

        expect(image).toMatchObject({ exitCode: 0, stdout: "", stderr: "" })
        expect(new Uint8Array(await readFile(output))).toEqual(new Uint8Array([1, 2, 3]))
        expect(invalid.exitCode).toBe(1)
        expect(JSON.parse(invalid.stderr)).toEqual({
          success: false,
          op: "authQr",
          errorMessage: 'Format must be "raw" or "image"',
        })
        expect(requests).toHaveLength(1)
      })
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  })
})
