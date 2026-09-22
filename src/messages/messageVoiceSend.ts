import type { MessageVoiceSendOptions } from "./messageVoiceSendOptions.js"

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

const messageVoiceSendOptionsSchema = a.object({
  config: configSchema,
  session: sessionOptionalSchema,
  chatId: chatIdSchema,
  file: wahaFileSchema,
  reply_to: a.optional(a.string()),
  convert: a.optional(a.boolean()),
})

export async function messageVoiceSend(options: MessageVoiceSendOptions): PromiseResult<WAMessage> {
  const op = "messageVoiceSend"
  const parsed = a.safeParse(messageVoiceSendOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, chatId, file, reply_to, convert } = parsed.output

  return wahaRequest<WAMessage>({
    config,
    method: "POST",
    path: wahaPathApi("/sendVoice"),
    injectSession: true,
    body: bodyOmitUndefined({ session, chatId, file, reply_to, convert }),
  })
}
