import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import { statusDelete } from "../statusDelete.js"
import { statusImageSend } from "../statusImageSend.js"
import { statusMessageIdNewGet } from "../statusMessageIdNewGet.js"
import { statusTextSend } from "../statusTextSend.js"
import { statusVideoSend } from "../statusVideoSend.js"
import { statusVoiceSend } from "../statusVoiceSend.js"
import { statusFileResolve } from "./statusFileResolve.js"

type ContactsFlags = { contacts?: string }

const contacts = (value?: string) =>
  value
    ?.split(",")
    .map((contact) => contact.trim())
    .filter(Boolean)

const sendTextCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & {
      text: string
      backgroundColor?: string
      font?: number
      linkPreview?: boolean
      linkPreviewHighQuality?: boolean
      id?: string
    } & ContactsFlags,
  ) {
    await cliRunApi(this, flags, (config) =>
      statusTextSend({
        config,
        session: flags.session,
        text: flags.text,
        backgroundColor: flags.backgroundColor,
        font: flags.font,
        linkPreview: flags.linkPreview,
        linkPreviewHighQuality: flags.linkPreviewHighQuality,
        id: flags.id,
        contacts: contacts(flags.contacts),
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      text: cliScalarFlagParams.requiredString("Status text"),
      backgroundColor: cliScalarFlagParams.optionalString("Background color"),
      font: cliScalarFlagParams.optionalNumber("Font number"),
      linkPreview: cliScalarFlagParams.optionalBoolean("Include link preview"),
      linkPreviewHighQuality: cliScalarFlagParams.optionalBoolean("Use high-quality link preview"),
      id: cliScalarFlagParams.optionalString("Status id"),
      contacts: cliScalarFlagParams.optionalString("Comma-separated contact ids"),
    },
  },
  docs: { brief: "Send a text status" },
})

const sendImageCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { file: string; caption?: string; id?: string } & ContactsFlags,
  ) {
    const fileResult = await statusFileResolve(flags.file, "image/jpeg")
    if (!fileResult.success) cliFail(fileResult)
    await cliRunApi(this, flags, (config) =>
      statusImageSend({
        config,
        session: flags.session,
        file: fileResult.data,
        caption: flags.caption,
        id: flags.id,
        contacts: contacts(flags.contacts),
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      file: cliScalarFlagParams.requiredString("Image file path or URL"),
      caption: cliScalarFlagParams.optionalString("Status caption"),
      id: cliScalarFlagParams.optionalString("Status id"),
      contacts: cliScalarFlagParams.optionalString("Comma-separated contact ids"),
    },
  },
  docs: { brief: "Send an image status" },
})

const sendVoiceCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { file: string; backgroundColor?: string; convert?: boolean; id?: string } & ContactsFlags,
  ) {
    const fileResult = await statusFileResolve(flags.file, "audio/ogg")
    if (!fileResult.success) cliFail(fileResult)
    await cliRunApi(this, flags, (config) =>
      statusVoiceSend({
        config,
        session: flags.session,
        file: fileResult.data,
        backgroundColor: flags.backgroundColor,
        convert: flags.convert,
        id: flags.id,
        contacts: contacts(flags.contacts),
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      file: cliScalarFlagParams.requiredString("Voice file path or URL"),
      backgroundColor: cliScalarFlagParams.optionalString("Background color"),
      convert: cliScalarFlagParams.optionalBoolean("Convert audio"),
      id: cliScalarFlagParams.optionalString("Status id"),
      contacts: cliScalarFlagParams.optionalString("Comma-separated contact ids"),
    },
  },
  docs: { brief: "Send a voice status" },
})

const sendVideoCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { file: string; caption?: string; convert?: boolean; id?: string } & ContactsFlags,
  ) {
    const fileResult = await statusFileResolve(flags.file, "video/mp4")
    if (!fileResult.success) cliFail(fileResult)
    await cliRunApi(this, flags, (config) =>
      statusVideoSend({
        config,
        session: flags.session,
        file: fileResult.data,
        caption: flags.caption,
        convert: flags.convert,
        id: flags.id,
        contacts: contacts(flags.contacts),
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      file: cliScalarFlagParams.requiredString("Video file path or URL"),
      caption: cliScalarFlagParams.optionalString("Status caption"),
      convert: cliScalarFlagParams.optionalBoolean("Convert video"),
      id: cliScalarFlagParams.optionalString("Status id"),
      contacts: cliScalarFlagParams.optionalString("Comma-separated contact ids"),
    },
  },
  docs: { brief: "Send a video status" },
})

const deleteCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string } & ContactsFlags) {
    await cliRunApi(this, flags, (config) =>
      statusDelete({ config, session: flags.session, id: flags.id, contacts: contacts(flags.contacts) }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("Status id"),
      contacts: cliScalarFlagParams.optionalString("Comma-separated contact ids"),
    },
  },
  docs: { brief: "Delete a status" },
})

const messageIdNewCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => statusMessageIdNewGet({ config, session: flags.session }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "Get a new status message id" },
})

export const statusCommands = buildRouteMap({
  routes: {
    "send-text": sendTextCommand,
    "send-image": sendImageCommand,
    "send-voice": sendVoiceCommand,
    "send-video": sendVideoCommand,
    delete: deleteCommand,
    "message-id-new": messageIdNewCommand,
  },
  docs: { brief: "Status operations" },
})
