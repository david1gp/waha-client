import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import {
  bodyOmitUndefined,
  chatIdSchema,
  configSchema,
  messageListMessageSchema,
  sessionOptionalSchema,
} from "./messageSchemas.js"
import type { MessageListMessage, WAMessage } from "./chattingTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathApi } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"

const messageListSendOptionsSchema = a.object({
  config: configSchema,
  session: sessionOptionalSchema,
  chatId: chatIdSchema,
  message: messageListMessageSchema,
  reply_to: a.optional(a.string()),
})

export type MessageListSendOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
  message: MessageListMessage
  reply_to?: string
}

export async function messageListSend(options: MessageListSendOptions): PromiseResult<WAMessage> {
  const op = "messageListSend"
  const parsed = a.safeParse(messageListSendOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, chatId, message, reply_to } = parsed.output

  return wahaRequest<WAMessage>({
    config,
    method: "POST",
    path: wahaPathApi("/sendList"),
    injectSession: true,
    body: bodyOmitUndefined({ session, chatId, message, reply_to }),
  })
}
