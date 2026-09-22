import type { MessageListSendOptions } from "./messageListSendOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { chatIdSchema } from "../chats/chatIdSchema.js"
import { configSchema } from "../client/configSchema.js"
import { messageListMessageSchema } from "./messageListMessageSchema.js"
import { sessionOptionalSchema } from "../sessions/sessionOptionalSchema.js"
import type { MessageListMessage } from "./messageListMessage.js"
import type { WAMessage } from "./waMessage.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathApi } from "../client/wahaPathApi.js"
import { wahaRequest } from "../client/wahaRequest.js"

const messageListSendOptionsSchema = a.object({
  config: configSchema,
  session: sessionOptionalSchema,
  chatId: chatIdSchema,
  message: messageListMessageSchema,
  reply_to: a.optional(a.string()),
})

export async function messageListSend(options: MessageListSendOptions): PromiseResult<WAMessage> {
  const op = "messageListSend"
  const parsed = a.safeParse(messageListSendOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, chatId, message, reply_to } = parsed.output

  return wahaRequest<WAMessage>({
    config,
    method: "POST",
    path: wahaPathApi("/sendList"),
    injectSession: true,
    body: bodyOmitUndefined({ session, chatId, message, reply_to }),
  })
}
