import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { contactExistsCheck } from "../../contactExistsCheck.js"
import { contactListAll } from "../../contactListAll.js"
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
      contactListAll({
        config,
        session: flags.session,
        limit: flags.limit,
        offset: flags.offset,
        sortBy: flags.sortBy as "id" | "name" | undefined,
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
        brief: "Max contacts to return",
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
        brief: "Sort field: id | name",
      },
      sortOrder: {
        kind: "parsed",
        parse: String,
        optional: true,
        brief: "Sort order: asc | desc",
      },
    },
  },
  docs: { brief: "List all contacts" },
})

const checkExistsCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { phone: string }) {
    await cliRunApi(this, flags, (config) =>
      contactExistsCheck({
        config,
        session: flags.session,
        phone: flags.phone,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      phone: {
        kind: "parsed",
        parse: String,
        brief: "Phone number to check",
      },
    },
  },
  docs: { brief: "Check if phone number exists on WhatsApp" },
})

export const contactCommands = buildRouteMap({
  routes: {
    list: listCommand,
    "check-exists": checkExistsCommand,
  },
  docs: { brief: "Contact operations" },
})
