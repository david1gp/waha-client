import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import {
  bodyOmitUndefined,
  chatIdSchema,
  configSchema,
  linkPreviewDataSchema,
  sessionOptionalSchema,
} from "./messageSchemas.js"
import type { LinkPreviewData, WAMessage } from "./chattingTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathApi } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"

const messageLinkCustomPreviewSendOptionsSchema = a.object({
  config: configSchema,
  session: sessionOptionalSchema,
  chatId: chatIdSchema,
  text: a.string(),
  preview: linkPreviewDataSchema,
  linkPreviewHighQuality: a.optional(a.boolean()),
  reply_to: a.optional(a.string()),
})

export type MessageLinkCustomPreviewSendOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
  text: string
  preview: LinkPreviewData
  linkPreviewHighQuality?: boolean
  reply_to?: string
}

export async function messageLinkCustomPreviewSend(
  options: MessageLinkCustomPreviewSendOptions,
): PromiseResult<WAMessage> {
  const op = "messageLinkCustomPreviewSend"
  const parsed = a.safeParse(messageLinkCustomPreviewSendOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, chatId, text, preview, linkPreviewHighQuality, reply_to } = parsed.output

  return wahaRequest<WAMessage>({
    config,
    method: "POST",
    path: wahaPathApi("/send/link-custom-preview"),
    injectSession: true,
    body: bodyOmitUndefined({ session, chatId, text, preview, linkPreviewHighQuality, reply_to }),
  })
}
