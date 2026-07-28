import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { serverHealth } from "../../serverHealth.js"
import { serverPing } from "../../serverPing.js"
import { serverStatusGet } from "../../serverStatusGet.js"
import { serverVersionGet } from "../../serverVersionGet.js"
import { type CliConfigFlags, cliConfigFlagParams } from "../cliConfig.js"
import { cliRunApi } from "../cliRun.js"

const pingCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => serverPing({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "Ping WAHA server" },
})

const healthCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => serverHealth({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "Server health check" },
})

const versionCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => serverVersionGet({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "WAHA server version" },
})

const statusCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => serverStatusGet({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "WAHA server status" },
})

export const serverCommands = buildRouteMap({
  routes: {
    ping: pingCommand,
    health: healthCommand,
    version: versionCommand,
    status: statusCommand,
  },
  docs: { brief: "Server observability" },
})
