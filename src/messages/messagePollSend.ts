import type { MessagePollSendOptions } from "./messagePollSendOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { chatIdSchema } from "../chats/chatIdSchema.js"
import { configSchema } from "../client/configSchema.js"
import { messagePollSchema } from "./messagePollSchema.js"
import { sessionOptionalSchema } from "../sessions/sessionOptionalSchema.js"
import type { MessagePoll } from "./messagePoll.js"
import type { WAMessage } from "./waMessage.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathApi } from "../client/wahaPathApi.js"
import { wahaRequest } from "../client/wahaRequest.js"

const messagePollSendOptionsSchema = a.object({
  config: configSchema,
  session: sessionOptionalSchema,
  chatId: chatIdSchema,
  poll: messagePollSchema,
  id: a.optional(a.string()),
  reply_to: a.optional(a.string()),
})

export async function messagePollSend(options: MessagePollSendOptions): PromiseResult<WAMessage> {
  const op = "messagePollSend"
  const parsed = a.safeParse(messagePollSendOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, chatId, poll, id, reply_to } = parsed.output

  return wahaRequest<WAMessage>({
    config,
    method: "POST",
    path: wahaPathApi("/sendPoll"),
    injectSession: true,
    body: bodyOmitUndefined({ session, chatId, poll, id, reply_to }),
  })
}
