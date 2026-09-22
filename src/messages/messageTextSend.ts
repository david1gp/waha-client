import type { MessageTextSendOptions } from "./messageTextSendOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { chatIdSchema } from "../chats/chatIdSchema.js"
import { configSchema } from "../client/configSchema.js"
import { sessionOptionalSchema } from "../sessions/sessionOptionalSchema.js"
import type { WAMessage } from "./waMessage.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathApi } from "../client/wahaPathApi.js"
import { wahaRequest } from "../client/wahaRequest.js"

const messageTextSendOptionsSchema = a.object({
  config: configSchema,
  session: sessionOptionalSchema,
  chatId: chatIdSchema,
  text: a.string(),
  id: a.optional(a.string()),
  mentions: a.optional(a.array(a.string())),
  reply_to: a.optional(a.string()),
  linkPreview: a.optional(a.boolean()),
  linkPreviewHighQuality: a.optional(a.boolean()),
})

export async function messageTextSend(options: MessageTextSendOptions): PromiseResult<WAMessage> {
  const op = "messageTextSend"
  const parsed = a.safeParse(messageTextSendOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, chatId, text, id, mentions, reply_to, linkPreview, linkPreviewHighQuality } = parsed.output

  return wahaRequest<WAMessage>({
    config,
    method: "POST",
    path: wahaPathApi("/sendText"),
    injectSession: true,
    body: bodyOmitUndefined({
      session,
      chatId,
      text,
      id,
      mentions,
      reply_to,
      linkPreview,
      linkPreviewHighQuality,
    }),
  })
}
