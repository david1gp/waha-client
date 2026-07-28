import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { groupGet } from "../../groupGet.js"
import { groupList } from "../../groupList.js"
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
    },
  ) {
    await cliRunApi(this, flags, (config) =>
      groupList({
        config,
        session: flags.session,
        limit: flags.limit,
        offset: flags.offset,
        sortBy: flags.sortBy,
        sortOrder: flags.sortOrder as "asc" | "desc" | undefined,
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
        brief: "Max groups to return",
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
        brief: "Sort field",
      },
      sortOrder: {
        kind: "parsed",
        parse: String,
        optional: true,
        brief: "Sort order: asc | desc",
      },
    },
  },
  docs: { brief: "List groups" },
})

const getCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string }) {
    await cliRunApi(this, flags, (config) =>
      groupGet({
        config,
        session: flags.session,
        id: flags.id,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: {
        kind: "parsed",
        parse: String,
        brief: "Group id",
      },
    },
  },
  docs: { brief: "Get group by id" },
})

export const groupCommands = buildRouteMap({
  routes: {
    list: listCommand,
    get: getCommand,
  },
  docs: { brief: "Group operations" },
})
