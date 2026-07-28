import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined, chatIdSchema, configSchema, sessionOptionalSchema } from "./messageSchemas.js"
import type { WAMessage } from "./chattingTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathApi } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"

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

export type MessageTextSendOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
  text: string
  id?: string
  mentions?: string[]
  reply_to?: string
  linkPreview?: boolean
  linkPreviewHighQuality?: boolean
}

export async function messageTextSend(options: MessageTextSendOptions): PromiseResult<WAMessage> {
  const op = "messageTextSend"
  const parsed = a.safeParse(messageTextSendOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

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
