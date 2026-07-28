import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined, chatIdSchema, configSchema, sessionOptionalSchema } from "./messageSchemas.js"
import type { WAMessage } from "./chattingTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathApi } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"

/** @deprecated Prefer messageTextSend with linkPreview or messageLinkCustomPreviewSend */
const messageLinkPreviewSendOptionsSchema = a.object({
  config: configSchema,
  session: sessionOptionalSchema,
  chatId: chatIdSchema,
  url: a.string(),
  title: a.string(),
  id: a.optional(a.string()),
})

export type MessageLinkPreviewSendOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
  url: string
  title: string
  id?: string
}

export async function messageLinkPreviewSend(options: MessageLinkPreviewSendOptions): PromiseResult<WAMessage> {
  const op = "messageLinkPreviewSend"
  const parsed = a.safeParse(messageLinkPreviewSendOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, chatId, url, title, id } = parsed.output

  return wahaRequest<WAMessage>({
    config,
    method: "POST",
    path: wahaPathApi("/sendLinkPreview"),
    injectSession: true,
    body: bodyOmitUndefined({ session, chatId, url, title, id }),
  })
}
