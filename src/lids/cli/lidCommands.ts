import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import { lidByPhoneGet } from "../lidByPhoneGet.js"
import { lidCountGet } from "../lidCountGet.js"
import { lidGet } from "../lidGet.js"
import { lidList } from "../lidList.js"

const listCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { limit?: number; offset?: number }) {
    await cliRunApi(this, flags, (config) =>
      lidList({ config, session: flags.session, limit: flags.limit, offset: flags.offset }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      limit: cliScalarFlagParams.optionalNumber("Max LIDs to return"),
      offset: cliScalarFlagParams.optionalNumber("Offset for pagination"),
    },
  },
  docs: { brief: "List LID mappings" },
})

const countCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => lidCountGet({ config, session: flags.session }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "Count LID mappings" },
})

const getCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { lid: string }) {
    await cliRunApi(this, flags, (config) => lidGet({ config, session: flags.session, lid: flags.lid }))
  },
  parameters: { flags: { ...cliConfigFlagParams, lid: cliScalarFlagParams.requiredString("LID") } },
  docs: { brief: "Get a LID mapping" },
})

const byPhoneCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { phoneNumber: string }) {
    await cliRunApi(this, flags, (config) =>
      lidByPhoneGet({ config, session: flags.session, phoneNumber: flags.phoneNumber }),
    )
  },
  parameters: { flags: { ...cliConfigFlagParams, phoneNumber: cliScalarFlagParams.requiredString("Phone number") } },
  docs: { brief: "Get a LID mapping by phone number" },
})

export const lidCommands = buildRouteMap({
  routes: {
    list: listCommand,
    count: countCommand,
    get: getCommand,
    "by-phone": byPhoneCommand,
  },
  docs: { brief: "LID operations" },
})
