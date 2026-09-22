import type { MessageReplyOptions } from "./messageReplyOptions.js"

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

/** @deprecated Prefer reply_to on messageTextSend / media sends */
const messageReplyOptionsSchema = a.object({
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

export async function messageReply(options: MessageReplyOptions): PromiseResult<WAMessage> {
  const op = "messageReply"
  const parsed = a.safeParse(messageReplyOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, chatId, text, id, mentions, reply_to, linkPreview, linkPreviewHighQuality } = parsed.output

  return wahaRequest<WAMessage>({
    config,
    method: "POST",
    path: wahaPathApi("/reply"),
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
