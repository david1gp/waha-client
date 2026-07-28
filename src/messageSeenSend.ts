import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined, chatIdSchema, configSchema, sessionOptionalSchema } from "./messageSchemas.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathApi } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"

const messageSeenSendOptionsSchema = a.object({
  config: configSchema,
  session: sessionOptionalSchema,
  chatId: chatIdSchema,
  messageId: a.optional(a.string()),
  messageIds: a.optional(a.array(a.string())),
  participant: a.optional(a.string()),
})

export type MessageSeenSendOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
  messageId?: string
  messageIds?: string[]
  participant?: string
}

export async function messageSeenSend(options: MessageSeenSendOptions): PromiseResult<unknown> {
  const op = "messageSeenSend"
  const parsed = a.safeParse(messageSeenSendOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, chatId, messageId, messageIds, participant } = parsed.output

  return wahaRequest({
    config,
    method: "POST",
    path: wahaPathApi("/sendSeen"),
    injectSession: true,
    body: bodyOmitUndefined({ session, chatId, messageId, messageIds, participant }),
  })
}
