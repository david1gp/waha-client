import { describe, expect, test } from "bun:test"
import { mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { PACKAGE_VERSION } from "../src/index.js"

const cliPath = join(import.meta.dir, "../src/cli.ts")

type CliResult = {
  stdout: string
  stderr: string
  exitCode: number
}

type CapturedRequest = {
  method: string
  path: string
  body: unknown
}

type EventServerMode = "burst" | "close" | "hold"

type EventServerState = {
  connectionCount: number
  closeCount: number
  requestUrl?: URL
}

async function runCli(args: string[], env: Record<string, string> = {}): Promise<CliResult> {
  const proc = Bun.spawn(["bun", "run", cliPath, ...args], {
    env: { ...process.env, ...env },
    stdout: "pipe",
    stderr: "pipe",
  })
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
        path: url.pathname,
        body: request.method === "GET" ? undefined : await request.json(),
      })
      if (url.pathname.endsWith("/capping")) {
        return Response.json({ cappingStatus: "OPEN", totalQuota: 100, usedQuota: 5 })
      }
      if (url.pathname.endsWith("/timelock")) {
        return Response.json({ enforcementType: "NONE", isActive: false, timeEnforcementEnds: null })
      }
      return Response.json({ id: "message-1" })
    },
  })

  try {
    return await callback(`http://127.0.0.1:${server.port}`, requests)
  } finally {
    await server.stop(true)
  }
}

async function withMockEventWaha<T>(
  mode: EventServerMode,
  events: readonly unknown[],
  callback: (baseUrl: string, state: EventServerState) => Promise<T>,
): Promise<T> {
  const state: EventServerState = { connectionCount: 0, closeCount: 0 }
  const server = Bun.serve({
    port: 0,
    fetch(request, server) {
      state.requestUrl = new URL(request.url)
      if (server.upgrade(request)) return
      return new Response("not found", { status: 404 })
    },
    websocket: {
      open(socket) {
        state.connectionCount += 1
        if (mode === "close") {
          socket.close()
          return
        }
        if (mode === "burst") {
          for (const event of events) socket.send(JSON.stringify(event))
        }
      },
      message() {},
      close() {
        state.closeCount += 1
      },
    },
  })

  try {
    return await callback(`http://127.0.0.1:${server.port}`, state)
  } finally {
    await server.stop(true)
  }
}

function eventCreate(index: number, session = "default") {
  return { event: "message", session, payload: { body: `event-${index}` } }
}

describe("cli", () => {
  test("version prints package version", async () => {
    const proc = Bun.spawn(["bun", "run", cliPath, "version"], {
      stdout: "pipe",
      stderr: "pipe",
    })
    const [stdout, stderr, exitCode] = await Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
      proc.exited,
    ])
    expect(exitCode).toBe(0)
    expect(stderr).toBe("")
    expect(stdout.trim()).toBe(PACKAGE_VERSION)
  })

  test("--version prints package version", async () => {
    const proc = Bun.spawn(["bun", "run", cliPath, "--version"], {
      stdout: "pipe",
      stderr: "pipe",
    })
    const [stdout, stderr, exitCode] = await Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
      proc.exited,
    ])
    expect(exitCode).toBe(0)
    expect(stderr).toBe("")
    expect(stdout.trim()).toBe(PACKAGE_VERSION)
  })

  test("version --verbose prints local package and runtime metadata", async () => {
    const proc = Bun.spawn(["bun", "run", cliPath, "version", "--verbose"], {
      env: { ...process.env, WAHA_BASE_URL: "not-a-url" },
      stdout: "pipe",
      stderr: "pipe",
    })
    const [stdout, stderr, exitCode] = await Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
      proc.exited,
    ])
    expect(exitCode).toBe(0)
    expect(stderr).toBe("")
    expect(stdout).toContain(`${PACKAGE_VERSION}\n`)
    expect(stdout).toContain(`user agent: @adaptive-ds/waha-client/${PACKAGE_VERSION}`)
    expect(stdout).toContain(`version: ${PACKAGE_VERSION}`)
    expect(stdout).toContain("description: TypeScript client and CLI for the WAHA (WhatsApp HTTP API).")
    expect(stdout).toContain("author: unavailable")
    expect(stdout).toContain("license: MIT")
    expect(stdout).toContain("project: https://github.com/david1gp/waha-client")
    expect(stdout).toContain("installation type: development checkout")
    expect(stdout).toContain("runtime: bun ")
    expect(stdout).toContain("runtime requirements: unavailable")
    expect(stdout).toContain(`platform: ${process.platform} ${process.arch} (OS release `)
    expect(stdout).not.toContain("build details:")
  })

  test("sessions --help exits 0", async () => {
    const result = await runCli(["sessions", "--help"])
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain("list")
    expect(result.stdout).toContain("start")
    expect(result.stdout).toContain("capping")
    expect(result.stdout).toContain("timelock")
  })

  test("messages --help lists send-sticker", async () => {
    const result = await runCli(["messages", "--help"])
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain("send-text")
    expect(result.stdout).toContain("send-sticker")
  })

  test("events observe defaults to ten compact JSON lines on one connection", async () => {
    await withMockEventWaha(
      "burst",
      Array.from({ length: 12 }, (_, index) => eventCreate(index)),
      async (baseUrl, state) => {
        const result = await runCli(["events", "observe", "--baseUrl", baseUrl])
        const lines = result.stdout.trim().split("\n")

        expect(result.exitCode).toBe(0)
        expect(result.stderr).toBe("")
        expect(lines).toHaveLength(10)
        expect(lines.every((line) => JSON.stringify(JSON.parse(line)) === line)).toBe(true)
        expect(state.connectionCount).toBe(1)
        expect(state.closeCount).toBeGreaterThanOrEqual(1)
      },
    )
  })

  test("events observe uses a custom limit and configured session and API key", async () => {
    await withMockEventWaha(
      "burst",
      [eventCreate(1, "cli-session"), eventCreate(2, "cli-session"), eventCreate(3, "cli-session")],
      async (baseUrl, state) => {
        const result = await runCli(
          [
            "events",
            "observe",
            "--baseUrl",
            baseUrl,
            "--apiKey",
            "cli-key",
            "--session",
            "cli-session",
            "--limit",
            "2",
          ],
          { WAHA_BASE_URL: "http://invalid.example", WAHA_API_KEY: "env-key", WAHA_SESSION: "env-session" },
        )

        expect(result.exitCode).toBe(0)
        expect(result.stderr).toBe("")
        expect(result.stdout.trim().split("\n")).toHaveLength(2)
        expect(state.connectionCount).toBe(1)
        expect(state.requestUrl?.searchParams.get("x-api-key")).toBe("cli-key")
        expect(state.requestUrl?.searchParams.get("session")).toBe("cli-session")
      },
    )
  })

  test("events observe rejects invalid limits before opening a connection", async () => {
    await withMockEventWaha("hold", [], async (baseUrl, state) => {
      for (const limit of ["0", "-1", "1.5", "Infinity", "NaN", "invalid"]) {
        const result = await runCli(["events", "observe", "--baseUrl", baseUrl, "--limit", limit])
        expect(result.exitCode).toBe(1)
        expect(result.stdout).toBe("")
        expect(JSON.parse(result.stderr)).toEqual({
          success: false,
          op: "eventsObserve",
          errorMessage: "Limit must be a positive integer",
        })
      }
      expect(state.connectionCount).toBe(0)
    })
  })

  test("events observe reports an early WebSocket close", async () => {
    await withMockEventWaha("close", [], async (baseUrl, state) => {
      const result = await runCli(["events", "observe", "--baseUrl", baseUrl, "--limit", "1"])

      expect(result.exitCode).toBe(1)
      expect(result.stdout).toBe("")
      expect(JSON.parse(result.stderr)).toEqual({
        success: false,
        op: "wahaWebSocketObserve",
        errorMessage: "WebSocket closed before a matching event was received",
      })
      expect(state.connectionCount).toBe(1)
    })
  })

  test("events observe preserves the configured observation timeout and closes", async () => {
    await withMockEventWaha("hold", [], async (baseUrl, state) => {
      const result = await runCli(["events", "observe", "--baseUrl", baseUrl, "--limit", "1"], {
        WAHA_TIMEOUT_MS: "50",
      })

      expect(result.exitCode).toBe(1)
      expect(JSON.parse(result.stderr)).toEqual({
        success: false,
        op: "wahaWebSocketObserve",
        errorMessage: "WebSocket observation timed out",
      })
      expect(state.connectionCount).toBe(1)
      expect(state.closeCount).toBeGreaterThanOrEqual(1)
    })
  })

  test("messages send-sticker sends a remote WebP URL and reply", async () => {
    await withMockWaha(async (baseUrl, requests) => {
      const result = await runCli(
        [
          "messages",
          "send-sticker",
          "--baseUrl",
          baseUrl,
          "--session",
          "cli-session",
          "--chatId",
          "123@c.us",
          "--file",
          "https://example.com/sticker.webp",
          "--reply_to",
          "message-0",
        ],
        { WAHA_BASE_URL: "http://invalid.example" },
      )
      expect(result.exitCode).toBe(0)
      expect(result.stderr).toBe("")
      expect(JSON.parse(result.stdout)).toEqual({ id: "message-1" })
      expect(requests).toEqual([
        {
          method: "POST",
          path: "/api/sendSticker",
          body: {
            session: "cli-session",
            chatId: "123@c.us",
            file: { mimetype: "image/webp", url: "https://example.com/sticker.webp" },
            reply_to: "message-0",
          },
        },
      ])
    })
  })

  test("messages send-sticker reads a local WebP as base64 and omits reply", async () => {
    const directory = await mkdtemp(join(tmpdir(), "waha-cli-"))
    const filePath = join(directory, "sticker.webp")
    const fileData = Buffer.from(
      "UklGRjwAAABXRUJQVlA4IDAAAADQAQCdASoBAAEAAgA0JaACdLoB+AADsAD+8MQL/yC5YXXI1/8gP+QH/ID/+PIAAAA=",
      "base64",
    )
    await writeFile(filePath, fileData)

    try {
      await withMockWaha(async (baseUrl, requests) => {
        const result = await runCli([
          "messages",
          "send-sticker",
          "--baseUrl",
          baseUrl,
          "--session",
          "local-session",
          "--chatId",
          "123@c.us",
          "--file",
          filePath,
        ])
        expect(result.exitCode).toBe(0)
        expect(result.stderr).toBe("")
        expect(requests[0]).toEqual({
          method: "POST",
          path: "/api/sendSticker",
          body: {
            session: "local-session",
            chatId: "123@c.us",
            file: {
              mimetype: "image/webp",
              filename: "sticker.webp",
              data: fileData.toString("base64"),
            },
          },
        })
      })
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  })

  test("session capping and timelock use an explicit session override", async () => {
    await withMockWaha(async (baseUrl, requests) => {
      const capping = await runCli(["sessions", "capping", "--baseUrl", baseUrl, "--session", "my session"])
      const timelock = await runCli(["sessions", "timelock", "--baseUrl", baseUrl, "--session", "my session"])

      expect(capping.exitCode).toBe(0)
      expect(timelock.exitCode).toBe(0)
      expect(requests).toEqual([
        { method: "GET", path: "/api/my%20session/capping", body: undefined },
        { method: "GET", path: "/api/my%20session/timelock", body: undefined },
      ])
    })
  })

  test("--help lists top-level routes", async () => {
    const result = await runCli(["--help"])
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain("sessions")
    expect(result.stdout).toContain("messages")
    expect(result.stdout).toContain("server")
  })
})
