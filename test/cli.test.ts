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
