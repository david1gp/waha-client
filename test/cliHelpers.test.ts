import { describe, expect, test } from "bun:test"
import { mkdtemp, readFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { cliBinaryOutput } from "../src/cli/cliBinaryOutput.js"
import { cliBinaryOutputFlagParams } from "../src/cli/cliBinaryOutputFlagParams.js"
import { cliJsonFlagParam } from "../src/cli/cliJsonFlagParam.js"
import { cliJsonParse } from "../src/cli/cliJsonParse.js"
import { cliScalarFlagParams } from "../src/cli/cliScalarFlagParams.js"

describe("CLI adapter helpers", () => {
  test("parses nested JSON without changing its shape", () => {
    const result = cliJsonParse('{"participants":[{"id":"1"}]}', "groupCreate", "participants-json")

    expect(result).toEqual({ success: true, data: { participants: [{ id: "1" }] } })
  })

  test("returns a Result error for invalid JSON", () => {
    const result = cliJsonParse("{", "groupCreate", "participants-json")

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.op).toBe("groupCreate")
      expect(result.errorMessage).toBe("Invalid JSON for --participants-json")
    }
  })

  test("encodes bytes as base64 JSON by default", async () => {
    const result = await cliBinaryOutput(new Uint8Array([0, 1, 255]))

    expect(result).toEqual({ success: true, data: { encoding: "base64", data: "AAH/" } })
  })

  test("writes bytes to the requested output file", async () => {
    const directory = await mkdtemp(join(tmpdir(), "waha-cli-helper-"))
    const output = join(directory, "result.bin")

    try {
      const result = await cliBinaryOutput(new Uint8Array([1, 2, 3]), output)

      expect(result).toEqual({ success: true, data: undefined })
      expect(new Uint8Array(await readFile(output))).toEqual(new Uint8Array([1, 2, 3]))
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  })

  test("provides declarative scalar, JSON, and binary flag descriptors", () => {
    expect(cliScalarFlagParams.optionalNumber("Limit")).toMatchObject({ kind: "parsed", optional: true })
    expect(cliJsonFlagParam("JSON body")).toMatchObject({ kind: "parsed", optional: true })
    expect(cliJsonFlagParam("Required JSON body", false)).toMatchObject({ kind: "parsed" })
    expect(cliBinaryOutputFlagParams.output).toMatchObject({ kind: "parsed", optional: true })
  })
})
