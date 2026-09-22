import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliBinaryOutput } from "../../cli/cliBinaryOutput.js"
import { cliBinaryOutputFlagParams } from "../../cli/cliBinaryOutputFlagParams.js"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliConfigLoad } from "../../cli/cliConfigLoad.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliJsonFlagParam } from "../../cli/cliJsonFlagParam.js"
import { cliJsonParse } from "../../cli/cliJsonParse.js"
import { cliResultOrFail } from "../../cli/cliResultOrFail.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import { cliWriteJson } from "../../cli/cliWriteJson.js"
import { authCodeRequest } from "../authCodeRequest.js"
import { authPasskeyChallengeGet } from "../authPasskeyChallengeGet.js"
import { authPasskeyConfirm } from "../authPasskeyConfirm.js"
import { authPasskeyConfirmationGet } from "../authPasskeyConfirmationGet.js"
import { authPasskeyPost } from "../authPasskeyPost.js"
import { authQrGet } from "../authQrGet.js"

type AuthFlags = CliConfigFlags

function authRequiredJsonFlag(brief: string) {
  return cliJsonFlagParam(brief, false) as { kind: "parsed"; parse: typeof String; brief: string }
}

const qrCommand = buildCommand({
  async func(this: CommandContext, flags: AuthFlags & { format?: string; output?: string }) {
    const configResult = cliConfigLoad(flags)
    if (!configResult.success) cliFail(configResult)
    if (flags.format !== undefined && flags.format !== "raw" && flags.format !== "image") {
      cliFail({ success: false, op: "authQr", errorMessage: 'Format must be "raw" or "image"' })
    }
    const format = flags.format ?? "raw"
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
    const output = await cliBinaryOutput(bytes, flags.output)
    if (!output.success) cliFail(output)
    if (output.data !== undefined) cliWriteJson(this, output.data)
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
      ...cliBinaryOutputFlagParams,
    },
  },
  docs: { brief: "Get session QR code for auth" },
})

const passkeyChallengeCommand = buildCommand({
  async func(this: CommandContext, flags: AuthFlags) {
    await cliRunApi(this, flags, (config) => authPasskeyChallengeGet({ config, session: flags.session }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "Get a passkey challenge" },
})

const passkeyConfirmationCommand = buildCommand({
  async func(this: CommandContext, flags: AuthFlags) {
    await cliRunApi(this, flags, (config) => authPasskeyConfirmationGet({ config, session: flags.session }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "Get passkey confirmation options" },
})

const passkeyConfirmCommand = buildCommand({
  async func(this: CommandContext, flags: AuthFlags) {
    await cliRunApi(this, flags, (config) => authPasskeyConfirm({ config, session: flags.session }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "Confirm passkey authentication" },
})

const passkeyPostCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: AuthFlags & { id: string; rawId: string; type: string; responseJson: string },
  ) {
    const responseResult = cliJsonParse(flags.responseJson, "authPasskeyPost", "responseJson")
    if (!responseResult.success) cliFail(responseResult)
    await cliRunApi(this, flags, (config) =>
      authPasskeyPost({
        config,
        session: flags.session,
        id: flags.id,
        rawId: flags.rawId,
        type: flags.type,
        response: responseResult.data as {
          clientDataJSON: string
          authenticatorData: string
          signature: string
          userHandle?: string
        },
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("Credential id"),
      rawId: cliScalarFlagParams.requiredString("Raw credential id"),
      type: cliScalarFlagParams.requiredString("Credential type"),
      responseJson: authRequiredJsonFlag("Passkey response JSON"),
    },
  },
  docs: { brief: "Post a passkey assertion" },
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
    "passkey-challenge": passkeyChallengeCommand,
    "passkey-confirmation": passkeyConfirmationCommand,
    "passkey-confirm": passkeyConfirmCommand,
    "passkey-post": passkeyPostCommand,
  },
  docs: { brief: "Session authentication" },
})
