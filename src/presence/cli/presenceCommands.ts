import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import type { PromiseResult } from "#result"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import type { WahaClientConfig } from "../../client/wahaClientConfigSchema.js"
import { presenceGet } from "../presenceGet.js"
import { presenceList } from "../presenceList.js"
import { presenceSet } from "../presenceSet.js"
import { presenceSubscribe } from "../presenceSubscribe.js"
import { typingStart } from "../typingStart.js"
import { typingStop } from "../typingStop.js"
import type { WahaPresenceStatus } from "../wahaPresenceStatus.js"

const chatIdFlag = {
  kind: "parsed" as const,
  parse: String,
  brief: "Chat id",
}

const setCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { presence: string; chatId?: string }) {
    await cliRunApi(this, flags, (config) =>
      presenceSet({
        config,
        session: flags.session,
        presence: flags.presence as WahaPresenceStatus,
        chatId: flags.chatId,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      presence: {
        kind: "parsed",
        parse: String,
        brief: "Presence: offline | online | typing | recording | paused",
      },
      chatId: { ...chatIdFlag, optional: true },
    },
  },
  docs: { brief: "Set presence" },
})

function chatCommand(
  fn: (config: WahaClientConfig, flags: CliConfigFlags & { chatId: string }) => PromiseResult<unknown>,
) {
  return buildCommand({
    async func(this: CommandContext, flags: CliConfigFlags & { chatId: string }) {
      await cliRunApi(this, flags, (config) => fn(config, flags))
    },
    parameters: { flags: { ...cliConfigFlagParams, chatId: chatIdFlag } },
    docs: { brief: "Run presence operation" },
  })
}

const listCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => presenceList({ config, session: flags.session }))
  },
  parameters: { flags: cliConfigFlagParams },
  docs: { brief: "List presence" },
})

const getCommand = chatCommand((config, flags) => presenceGet({ config, session: flags.session, chatId: flags.chatId }))
const subscribeCommand = chatCommand((config, flags) =>
  presenceSubscribe({ config, session: flags.session, chatId: flags.chatId }),
)
const typingStartCommand = chatCommand((config, flags) =>
  typingStart({ config, session: flags.session, chatId: flags.chatId }),
)
const typingStopCommand = chatCommand((config, flags) =>
  typingStop({ config, session: flags.session, chatId: flags.chatId }),
)

export const presenceCommands = buildRouteMap({
  routes: {
    set: setCommand,
    list: listCommand,
    get: getCommand,
    subscribe: subscribeCommand,
    "typing-start": typingStartCommand,
    "typing-stop": typingStopCommand,
  },
  docs: { brief: "Presence operations" },
})
