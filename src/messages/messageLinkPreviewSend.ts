import type { MessageLinkPreviewSendOptions } from "./messageLinkPreviewSendOptions.js"

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

/** @deprecated Prefer messageTextSend with linkPreview or messageLinkCustomPreviewSend */
const messageLinkPreviewSendOptionsSchema = a.object({
  config: configSchema,
  session: sessionOptionalSchema,
  chatId: chatIdSchema,
  url: a.string(),
  title: a.string(),
  id: a.optional(a.string()),
})

export async function messageLinkPreviewSend(options: MessageLinkPreviewSendOptions): PromiseResult<WAMessage> {
  const op = "messageLinkPreviewSend"
  const parsed = a.safeParse(messageLinkPreviewSendOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, chatId, url, title, id } = parsed.output

  return wahaRequest<WAMessage>({
    config,
    method: "POST",
    path: wahaPathApi("/sendLinkPreview"),
    injectSession: true,
    body: bodyOmitUndefined({ session, chatId, url, title, id }),
  })
}
