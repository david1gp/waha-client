import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { authCodeRequest } from "../../authCodeRequest.js"
import { authQrGet } from "../../authQrGet.js"
import { type CliConfigFlags, cliConfigFlagParams, cliConfigLoad } from "../cliConfig.js"
import { cliFail, cliResultOrFail, cliWriteJson } from "../cliRun.js"

type AuthFlags = CliConfigFlags

const qrCommand = buildCommand({
  async func(this: CommandContext, flags: AuthFlags & { format?: string }) {
    const configResult = cliConfigLoad(flags)
    if (!configResult.success) cliFail(configResult)
    const format = flags.format === "image" ? "image" : "raw"
    if (format === "raw") {
      const result = await authQrGet({
        config: configResult.data,
        session: flags.session,
        format: "raw",
      })
      cliWriteJson(this, cliResultOrFail(result))
      return
    }
    const result = await authQrGet({
      config: configResult.data,
      session: flags.session,
      format: "image",
    })
    const bytes = cliResultOrFail(result)
    cliWriteJson(this, {
      format: "image",
      encoding: "base64",
      data: Buffer.from(bytes).toString("base64"),
    })
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      format: {
        kind: "parsed",
        parse: String,
        optional: true,
        brief: 'QR format: "raw" (default) or "image" (base64 PNG JSON)',
      },
    },
  },
  docs: { brief: "Get session QR code for auth" },
})

const requestCodeCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: AuthFlags & {
      phoneNumber: string
      method?: string
      localeLanguage?: string
      localeCountry?: string
    },
  ) {
    const configResult = cliConfigLoad(flags)
    if (!configResult.success) cliFail(configResult)
    const result = await authCodeRequest({
      config: configResult.data,
      session: flags.session,
      phoneNumber: flags.phoneNumber,
      method: flags.method,
      localeLanguage: flags.localeLanguage,
      localeCountry: flags.localeCountry,
    })
    cliWriteJson(this, cliResultOrFail(result))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      phoneNumber: {
        kind: "parsed",
        parse: String,
        brief: "Phone number (E.164 without +)",
      },
      method: {
        kind: "parsed",
        parse: String,
        optional: true,
        brief: "Auth method",
      },
      localeLanguage: {
        kind: "parsed",
        parse: String,
        optional: true,
        brief: "Locale language",
      },
      localeCountry: {
        kind: "parsed",
        parse: String,
        optional: true,
        brief: "Locale country",
      },
    },
  },
  docs: { brief: "Request pairing code for phone number" },
})

export const authCommands = buildRouteMap({
  routes: {
    qr: qrCommand,
    "request-code": requestCodeCommand,
  },
  docs: { brief: "Session authentication" },
})
