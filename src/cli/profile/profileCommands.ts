import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { profileGet } from "../../profileGet.js"
import { type CliConfigFlags, cliConfigFlagParams } from "../cliConfig.js"
import { cliRunApi } from "../cliRun.js"

const getCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => profileGet({ config, session: flags.session }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "Get my profile" },
})

export const profileCommands = buildRouteMap({
  routes: {
    get: getCommand,
  },
  docs: { brief: "Profile operations" },
})
