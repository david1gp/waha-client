import { describe, expect, test } from "bun:test"
import { join } from "node:path"
import { PACKAGE_VERSION } from "../src/index.js"

const cliPath = join(import.meta.dir, "../src/cli.ts")

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
    const proc = Bun.spawn(["bun", "run", cliPath, "sessions", "--help"], {
      stdout: "pipe",
      stderr: "pipe",
    })
    const [stdout, exitCode] = await Promise.all([new Response(proc.stdout).text(), proc.exited])
    expect(exitCode).toBe(0)
    expect(stdout).toContain("list")
    expect(stdout).toContain("start")
  })

  test("--help lists top-level routes", async () => {
    const proc = Bun.spawn(["bun", "run", cliPath, "--help"], {
      stdout: "pipe",
      stderr: "pipe",
    })
    const [stdout, exitCode] = await Promise.all([new Response(proc.stdout).text(), proc.exited])
    expect(exitCode).toBe(0)
    expect(stdout).toContain("sessions")
    expect(stdout).toContain("messages")
    expect(stdout).toContain("server")
  })
})
