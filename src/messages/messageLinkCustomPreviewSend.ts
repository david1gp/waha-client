import type { MessageLinkCustomPreviewSendOptions } from "./messageLinkCustomPreviewSendOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { chatIdSchema } from "../chats/chatIdSchema.js"
import { configSchema } from "../client/configSchema.js"
import { linkPreviewDataSchema } from "./linkPreviewDataSchema.js"
import { sessionOptionalSchema } from "../sessions/sessionOptionalSchema.js"
import type { LinkPreviewData } from "./linkPreviewData.js"
import type { WAMessage } from "./waMessage.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathApi } from "../client/wahaPathApi.js"
import { wahaRequest } from "../client/wahaRequest.js"

const messageLinkCustomPreviewSendOptionsSchema = a.object({
  config: configSchema,
  session: sessionOptionalSchema,
  chatId: chatIdSchema,
  text: a.string(),
  preview: linkPreviewDataSchema,
  linkPreviewHighQuality: a.optional(a.boolean()),
  reply_to: a.optional(a.string()),
})

export async function messageLinkCustomPreviewSend(
  options: MessageLinkCustomPreviewSendOptions,
): PromiseResult<WAMessage> {
  const op = "messageLinkCustomPreviewSend"
  const parsed = a.safeParse(messageLinkCustomPreviewSendOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, chatId, text, preview, linkPreviewHighQuality, reply_to } = parsed.output

  return wahaRequest<WAMessage>({
    config,
    method: "POST",
    path: wahaPathApi("/send/link-custom-preview"),
    injectSession: true,
    body: bodyOmitUndefined({ session, chatId, text, preview, linkPreviewHighQuality, reply_to }),
  })
}
