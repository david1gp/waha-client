import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import {
  bodyOmitUndefined,
  chatIdSchema,
  configSchema,
  messagePollSchema,
  sessionOptionalSchema,
} from "./messageSchemas.js"
import type { MessagePoll, WAMessage } from "./chattingTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathApi } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"

const messagePollSendOptionsSchema = a.object({
  config: configSchema,
  session: sessionOptionalSchema,
  chatId: chatIdSchema,
  poll: messagePollSchema,
  id: a.optional(a.string()),
  reply_to: a.optional(a.string()),
})

export type MessagePollSendOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
  poll: MessagePoll
  id?: string
  reply_to?: string
}

export async function messagePollSend(options: MessagePollSendOptions): PromiseResult<WAMessage> {
  const op = "messagePollSend"
  const parsed = a.safeParse(messagePollSendOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, chatId, poll, id, reply_to } = parsed.output

  return wahaRequest<WAMessage>({
    config,
    method: "POST",
    path: wahaPathApi("/sendPoll"),
    injectSession: true,
    body: bodyOmitUndefined({ session, chatId, poll, id, reply_to }),
  })
}
