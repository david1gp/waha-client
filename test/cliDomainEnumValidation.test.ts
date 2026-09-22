import { describe, expect, test } from "bun:test"
import * as a from "valibot"
import { channelRoleFilterSchema } from "../src/channels/channelRoleFilter.js"
import { channelCommands } from "../src/channels/cli/channelCommands.js"
import { sessionExpandSchema } from "../src/sessions/sessionExpandSchema.js"

type RouteMap = {
  getAllEntries: () => readonly {
    name: { original: string }
    target: unknown
  }[]
}

type ParsedFlag = {
  parse: (value: string) => unknown
}

describe("CLI domain enum validation", () => {
  test("session expand accepts only values from sessionExpandSchema", () => {
    expect(a.safeParse(sessionExpandSchema, "apps").success).toBe(true)
    expect(a.safeParse(sessionExpandSchema, "invalid").success).toBe(false)
  })

  test("channel role CLI parser accepts only the channel role filter schema", () => {
    const entry = (channelCommands as RouteMap).getAllEntries().find((candidate) => candidate.name.original === "list")
    expect(entry).toBeDefined()
    if (entry === undefined) return

    const target = entry.target as { parameters: { flags: { role: ParsedFlag } } }
    expect(target.parameters.flags.role.parse("OWNER")).toBe("OWNER")
    expect(a.safeParse(channelRoleFilterSchema, "GUEST").success).toBe(false)
    expect(() => target.parameters.flags.role.parse("GUEST")).toThrow("Expected OWNER, ADMIN, or SUBSCRIBER")
  })
})
