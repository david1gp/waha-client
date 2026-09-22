import type { MessageSeenSendOptions } from "./messageSeenSendOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { chatIdSchema } from "../chats/chatIdSchema.js"
import { configSchema } from "../client/configSchema.js"
import { sessionOptionalSchema } from "../sessions/sessionOptionalSchema.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathApi } from "../client/wahaPathApi.js"
import { wahaRequest } from "../client/wahaRequest.js"

const messageSeenSendOptionsSchema = a.object({
  config: configSchema,
  session: sessionOptionalSchema,
  chatId: chatIdSchema,
  messageId: a.optional(a.string()),
  messageIds: a.optional(a.array(a.string())),
  participant: a.optional(a.string()),
})

export async function messageSeenSend(options: MessageSeenSendOptions): PromiseResult<unknown> {
  const op = "messageSeenSend"
  const parsed = a.safeParse(messageSeenSendOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, chatId, messageId, messageIds, participant } = parsed.output

  return wahaRequest({
    config,
    method: "POST",
    path: wahaPathApi("/sendSeen"),
    injectSession: true,
    body: bodyOmitUndefined({ session, chatId, messageId, messageIds, participant }),
  })
}
