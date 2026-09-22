import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { createResultError } from "#result"
import { cliBinaryOutput } from "../../cli/cliBinaryOutput.js"
import { cliBinaryOutputFlagParams } from "../../cli/cliBinaryOutputFlagParams.js"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliConfigLoad } from "../../cli/cliConfigLoad.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import { cliWriteJson } from "../../cli/cliWriteJson.js"
import { fileDelete } from "../fileDelete.js"
import { fileGet } from "../fileGet.js"
import { s3ObjectGet } from "../s3ObjectGet.js"

type PathFlags = { pathPart?: string[] }
type SessionlessFlags = { baseUrl?: string; apiKey?: string }

const sessionlessConfigFlagParams = {
  baseUrl: cliConfigFlagParams.baseUrl,
  apiKey: cliConfigFlagParams.apiKey,
}

const pathParts = (value: string[] | undefined, operation: string) => {
  if (value === undefined || value.length === 0)
    return createResultError(operation, "At least one --pathPart value is required")
  return { success: true as const, data: value }
}

const runBinary = async (
  ctx: CommandContext,
  flags: CliConfigFlags & { output?: string },
  operation: (config: Parameters<typeof fileGet>[0]["config"]) => ReturnType<typeof fileGet>,
) => {
  const configResult = cliConfigLoad(flags)
  if (!configResult.success) cliFail(configResult)
  const result = await operation(configResult.data)
  if (!result.success) cliFail(result)
  const outputResult = await cliBinaryOutput(result.data, flags.output)
  if (!outputResult.success) cliFail(outputResult)
  if (outputResult.data !== undefined) cliWriteJson(ctx, outputResult.data)
}

const fileGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & PathFlags & { output?: string }) {
    const parts = pathParts(flags.pathPart, "fileGet")
    if (!parts.success) cliFail(parts)
    await runBinary(this, flags, (config) => fileGet({ config, session: flags.session, pathParts: parts.data }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      pathPart: cliScalarFlagParams.optionalStringList("File path part (repeat for nested paths)"),
      ...cliBinaryOutputFlagParams,
    },
  },
  docs: { brief: "Get a stored file" },
})

const fileDeleteCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & PathFlags) {
    const parts = pathParts(flags.pathPart, "fileDelete")
    if (!parts.success) cliFail(parts)
    await cliRunApi(this, flags, (config) => fileDelete({ config, session: flags.session, pathParts: parts.data }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      pathPart: cliScalarFlagParams.optionalStringList("File path part (repeat for nested paths)"),
    },
  },
  docs: { brief: "Delete a stored file" },
})

const s3ObjectGetCommand = buildCommand({
  async func(this: CommandContext, flags: SessionlessFlags & PathFlags & { bucket: string; output?: string }) {
    const parts = pathParts(flags.pathPart, "s3ObjectGet")
    if (!parts.success) cliFail(parts)
    await runBinary(this, flags, (config) => s3ObjectGet({ config, bucket: flags.bucket, pathParts: parts.data }))
  },
  parameters: {
    flags: {
      ...sessionlessConfigFlagParams,
      bucket: cliScalarFlagParams.requiredString("S3 bucket"),
      pathPart: cliScalarFlagParams.optionalStringList("Object path part (repeat for nested paths)"),
      ...cliBinaryOutputFlagParams,
    },
  },
  docs: { brief: "Get an S3 object" },
})

export const storageCommands = buildRouteMap({
  routes: {
    "file-get": fileGetCommand,
    "file-delete": fileDeleteCommand,
    "s3-object-get": s3ObjectGetCommand,
  },
  docs: { brief: "Storage operations" },
})
