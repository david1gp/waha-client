import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { createResultError } from "#result"
import { cliBinaryOutput } from "../../cli/cliBinaryOutput.js"
import { cliBinaryOutputFlagParams } from "../../cli/cliBinaryOutputFlagParams.js"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliConfigLoad } from "../../cli/cliConfigLoad.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import { cliWriteJson } from "../../cli/cliWriteJson.js"
import { mediaVideoConvert } from "../mediaVideoConvert.js"
import { mediaVoiceConvert } from "../mediaVoiceConvert.js"

type ConvertFlags = CliConfigFlags & { url?: string; data?: string; output?: string }

const runConversion = async (
  ctx: CommandContext,
  flags: ConvertFlags,
  operation: string,
  convert: (
    config: Parameters<typeof mediaVoiceConvert>[0]["config"],
    options: { session?: string; url?: string; data?: string },
  ) => ReturnType<typeof mediaVoiceConvert>,
) => {
  if ((flags.url === undefined || flags.url === "") && (flags.data === undefined || flags.data === "")) {
    cliFail(createResultError(operation, "Either --url or --data is required"))
  }
  const configResult = cliConfigLoad(flags)
  if (!configResult.success) cliFail(configResult)
  const result = await convert(configResult.data, {
    session: flags.session,
    url: flags.url,
    data: flags.data,
  })
  if (!result.success) cliFail(result)
  const outputResult = await cliBinaryOutput(result.data, flags.output)
  if (!outputResult.success) cliFail(outputResult)
  if (outputResult.data !== undefined) cliWriteJson(ctx, outputResult.data)
}

const voiceConvertCommand = buildCommand({
  async func(this: CommandContext, flags: ConvertFlags) {
    await runConversion(this, flags, "mediaVoiceConvert", (config, options) =>
      mediaVoiceConvert({ config, ...options }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      url: cliScalarFlagParams.optionalString("Remote media URL"),
      data: cliScalarFlagParams.optionalString("Base64 media data"),
      ...cliBinaryOutputFlagParams,
    },
  },
  docs: { brief: "Convert media to a voice message" },
})

const videoConvertCommand = buildCommand({
  async func(this: CommandContext, flags: ConvertFlags) {
    await runConversion(this, flags, "mediaVideoConvert", (config, options) =>
      mediaVideoConvert({ config, ...options }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      url: cliScalarFlagParams.optionalString("Remote media URL"),
      data: cliScalarFlagParams.optionalString("Base64 media data"),
      ...cliBinaryOutputFlagParams,
    },
  },
  docs: { brief: "Convert media to a video message" },
})

export const mediaCommands = buildRouteMap({
  routes: {
    "voice-convert": voiceConvertCommand,
    "video-convert": videoConvertCommand,
  },
  docs: { brief: "Media conversion operations" },
})
