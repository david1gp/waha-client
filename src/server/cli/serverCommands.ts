import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import type { PromiseResult } from "#result"
import { cliBinaryOutput } from "../../cli/cliBinaryOutput.js"
import { cliBinaryOutputFlagParams } from "../../cli/cliBinaryOutputFlagParams.js"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliConfigOrFail } from "../../cli/cliConfigOrFail.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import { cliWriteJson } from "../../cli/cliWriteJson.js"
import type { WahaClientConfig } from "../../client/wahaClientConfigSchema.js"
import { screenshotGet } from "../screenshotGet.js"
import { serverDebugBrowserTraceGet } from "../serverDebugBrowserTraceGet.js"
import { serverDebugCpuGet } from "../serverDebugCpuGet.js"
import { serverDebugHeapsnapshotGet } from "../serverDebugHeapsnapshotGet.js"
import { serverEnvironmentGet } from "../serverEnvironmentGet.js"
import { serverHealth } from "../serverHealth.js"
import { serverPing } from "../serverPing.js"
import { serverStatusGet } from "../serverStatusGet.js"
import { serverStop } from "../serverStop.js"
import { serverVersionGet } from "../serverVersionGet.js"

const serverSessionlessConfigFlagParams = {
  baseUrl: cliConfigFlagParams.baseUrl,
  apiKey: cliConfigFlagParams.apiKey,
}

type ServerSessionlessFlags = {
  baseUrl?: string
  apiKey?: string
}

const pingCommand = buildCommand({
  async func(this: CommandContext, flags: ServerSessionlessFlags) {
    await cliRunApi(this, flags, (config) => serverPing({ config }))
  },
  parameters: { flags: { ...serverSessionlessConfigFlagParams } },
  docs: { brief: "Ping WAHA server" },
})

const healthCommand = buildCommand({
  async func(this: CommandContext, flags: ServerSessionlessFlags) {
    await cliRunApi(this, flags, (config) => serverHealth({ config }))
  },
  parameters: { flags: { ...serverSessionlessConfigFlagParams } },
  docs: { brief: "Server health check" },
})

const versionCommand = buildCommand({
  async func(this: CommandContext, flags: ServerSessionlessFlags) {
    await cliRunApi(this, flags, (config) => serverVersionGet({ config }))
  },
  parameters: { flags: { ...serverSessionlessConfigFlagParams } },
  docs: { brief: "WAHA server version" },
})

const statusCommand = buildCommand({
  async func(this: CommandContext, flags: ServerSessionlessFlags) {
    await cliRunApi(this, flags, (config) => serverStatusGet({ config }))
  },
  parameters: { flags: { ...serverSessionlessConfigFlagParams } },
  docs: { brief: "WAHA server status" },
})

const stopCommand = buildCommand({
  async func(this: CommandContext, flags: ServerSessionlessFlags & { force?: boolean }) {
    await cliRunApi(this, flags, (config) => serverStop({ config, force: flags.force }))
  },
  parameters: {
    flags: { ...serverSessionlessConfigFlagParams, force: cliScalarFlagParams.optionalBoolean("Force server stop") },
  },
  docs: { brief: "Stop the WAHA server" },
})

const environmentCommand = buildCommand({
  async func(this: CommandContext, flags: ServerSessionlessFlags & { all?: boolean }) {
    await cliRunApi(this, flags, (config) => serverEnvironmentGet({ config, all: flags.all }))
  },
  parameters: {
    flags: {
      ...serverSessionlessConfigFlagParams,
      all: cliScalarFlagParams.optionalBoolean("Include all environment values"),
    },
  },
  docs: { brief: "Get server environment" },
})

const debugCpuCommand = buildCommand({
  async func(this: CommandContext, flags: ServerSessionlessFlags & { seconds?: number }) {
    await cliRunApi(this, flags, (config) => serverDebugCpuGet({ config, seconds: flags.seconds }))
  },
  parameters: {
    flags: {
      ...serverSessionlessConfigFlagParams,
      seconds: cliScalarFlagParams.optionalNumber("Profile duration in seconds"),
    },
  },
  docs: { brief: "Get a server CPU profile" },
})

async function serverRunBinary(
  ctx: CommandContext,
  flags: ServerSessionlessFlags & { output?: string },
  fn: (config: WahaClientConfig) => PromiseResult<Uint8Array>,
): Promise<void> {
  const config = cliConfigOrFail(flags)
  const result = await fn(config)
  if (!result.success) cliFail(result)
  const output = await cliBinaryOutput(result.data as Uint8Array, flags.output)
  if (!output.success) cliFail(output)
  if (output.data !== undefined) cliWriteJson(ctx, output.data)
}

const debugHeapsnapshotCommand = buildCommand({
  async func(this: CommandContext, flags: ServerSessionlessFlags & { output?: string }) {
    await serverRunBinary(this, flags, (config) => serverDebugHeapsnapshotGet({ config }))
  },
  parameters: { flags: { ...serverSessionlessConfigFlagParams, ...cliBinaryOutputFlagParams } },
  docs: { brief: "Get a server heap snapshot" },
})

const debugBrowserTraceCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { seconds: number; categories?: string[]; output?: string },
  ) {
    await serverRunBinary(this, flags, (config) =>
      serverDebugBrowserTraceGet({
        config,
        session: flags.session,
        seconds: flags.seconds,
        categories: flags.categories,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      seconds: cliScalarFlagParams.requiredNumber("Trace duration in seconds"),
      categories: cliScalarFlagParams.optionalStringList("Browser trace categories"),
      ...cliBinaryOutputFlagParams,
    },
  },
  docs: { brief: "Get a browser trace" },
})

const screenshotCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { output?: string }) {
    await serverRunBinary(this, flags, (config) => screenshotGet({ config, session: flags.session }))
  },
  parameters: { flags: { ...cliConfigFlagParams, ...cliBinaryOutputFlagParams } },
  docs: { brief: "Capture a session screenshot" },
})

export const serverCommands = buildRouteMap({
  routes: {
    ping: pingCommand,
    health: healthCommand,
    version: versionCommand,
    status: statusCommand,
    stop: stopCommand,
    environment: environmentCommand,
    "debug-cpu": debugCpuCommand,
    "debug-heapsnapshot": debugHeapsnapshotCommand,
    "debug-browser-trace": debugBrowserTraceCommand,
    screenshot: screenshotCommand,
  },
  docs: { brief: "Server observability" },
})
