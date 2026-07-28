import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { messageTextSend } from "../../messageTextSend.js"
import { type CliConfigFlags, cliConfigFlagParams } from "../cliConfig.js"
import { cliRunApi } from "../cliRun.js"

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

export const messageCommands = buildRouteMap({
  routes: {
    "send-text": sendTextCommand,
  },
  docs: { brief: "Send messages" },
})
