import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { messageStickerSend } from "../../messageStickerSend.js"
import { messageTextSend } from "../../messageTextSend.js"
import { type CliConfigFlags, cliConfigFlagParams } from "../cliConfig.js"
import { cliFail, cliRunApi } from "../cliRun.js"
import { messageStickerFileResolve } from "./messageStickerFileResolve.js"

const sendTextCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { chatId: string; text: string }) {
    await cliRunApi(this, flags, (config) =>
      messageTextSend({
        config,
        session: flags.session,
        chatId: flags.chatId,
        text: flags.text,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      chatId: {
        kind: "parsed",
        parse: String,
        brief: "Chat id (e.g. 123@c.us)",
      },
      text: {
        kind: "parsed",
        parse: String,
        brief: "Message text",
      },
    },
  },
  docs: { brief: "Send a text message" },
})

const sendStickerCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { chatId: string; file: string; reply_to?: string }) {
    const fileResult = await messageStickerFileResolve(flags.file)
    if (!fileResult.success) cliFail(fileResult)
    await cliRunApi(this, flags, (config) =>
      messageStickerSend({
        config,
        session: flags.session,
        chatId: flags.chatId,
        file: fileResult.data,
        reply_to: flags.reply_to,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      chatId: {
        kind: "parsed",
        parse: String,
        brief: "Chat id (e.g. 123@c.us)",
      },
      file: {
        kind: "parsed",
        parse: String,
        brief: "WebP file path or URL",
      },
      reply_to: {
        kind: "parsed",
        parse: String,
        optional: true,
        brief: "Message id to reply to",
      },
    },
  },
  docs: { brief: "Send a sticker message" },
})

export const messageCommands = buildRouteMap({
  routes: {
    "send-text": sendTextCommand,
    "send-sticker": sendStickerCommand,
  },
  docs: { brief: "Send messages" },
})
