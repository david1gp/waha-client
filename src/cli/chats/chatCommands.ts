import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { chatList } from "../../chatList.js"
import { type CliConfigFlags, cliConfigFlagParams } from "../cliConfig.js"
import { cliRunApi } from "../cliRun.js"

const listCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & {
      limit?: number
      offset?: number
      sortBy?: string
      sortOrder?: string
      merge?: boolean
    },
  ) {
    await cliRunApi(this, flags, (config) =>
      chatList({
        config,
        session: flags.session,
        limit: flags.limit,
        offset: flags.offset,
        sortBy: flags.sortBy as "conversationTimestamp" | "id" | "name" | undefined,
        sortOrder: flags.sortOrder as "asc" | "desc" | undefined,
        merge: flags.merge,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      limit: {
        kind: "parsed",
        parse: Number,
        optional: true,
        brief: "Max chats to return",
      },
      offset: {
        kind: "parsed",
        parse: Number,
        optional: true,
        brief: "Offset for pagination",
      },
      sortBy: {
        kind: "parsed",
        parse: String,
        optional: true,
        brief: "Sort field: conversationTimestamp | id | name",
      },
      sortOrder: {
        kind: "parsed",
        parse: String,
        optional: true,
        brief: "Sort order: asc | desc",
      },
      merge: {
        kind: "boolean",
        optional: true,
        brief: "Merge chat list",
      },
    },
  },
  docs: { brief: "List chats" },
})

export const chatCommands = buildRouteMap({
  routes: {
    list: listCommand,
  },
  docs: { brief: "Chat operations" },
})
