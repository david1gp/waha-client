import type { MessageVideoSendOptions } from "./messageVideoSendOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { chatIdSchema } from "../chats/chatIdSchema.js"
import { configSchema } from "../client/configSchema.js"
import { sessionOptionalSchema } from "../sessions/sessionOptionalSchema.js"
import { wahaFileSchema } from "../media/wahaFileSchema.js"
import type { WAMessage } from "./waMessage.js"
import type { WahaFile } from "../media/wahaFile.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathApi } from "../client/wahaPathApi.js"
import { wahaRequest } from "../client/wahaRequest.js"

const messageVideoSendOptionsSchema = a.object({
  config: configSchema,
  session: sessionOptionalSchema,
  chatId: chatIdSchema,
  file: wahaFileSchema,
  caption: a.optional(a.string()),
  mentions: a.optional(a.array(a.string())),
  reply_to: a.optional(a.string()),
  asNote: a.optional(a.boolean()),
  convert: a.optional(a.boolean()),
})

export async function messageVideoSend(options: MessageVideoSendOptions): PromiseResult<WAMessage> {
  const op = "messageVideoSend"
  const parsed = a.safeParse(messageVideoSendOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, chatId, file, caption, mentions, reply_to, asNote, convert } = parsed.output

  return wahaRequest<WAMessage>({
    config,
    method: "POST",
    path: wahaPathApi("/sendVideo"),
    injectSession: true,
    body: bodyOmitUndefined({ session, chatId, file, caption, mentions, reply_to, asNote, convert }),
  })
}
