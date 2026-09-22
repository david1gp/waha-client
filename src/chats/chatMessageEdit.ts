import type { ChatMessageEditOptions } from "./chatMessageEditOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { EditMessageRequest } from "../messages/editMessageRequest.js"
import type { WAMessage } from "../messages/waMessage.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const chatMessageEditOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  chatId: a.pipe(a.string(), a.minLength(1)),
  messageId: a.pipe(a.string(), a.minLength(1)),
  text: a.pipe(a.string(), a.minLength(1)),
  mentions: a.optional(a.array(a.string())),
  linkPreview: a.optional(a.boolean()),
  linkPreviewHighQuality: a.optional(a.boolean()),
})

export async function chatMessageEdit(options: ChatMessageEditOptions): PromiseResult<WAMessage> {
  const op = "chatMessageEdit"
  const parsed = a.safeParse(chatMessageEditOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, chatId, messageId, text, mentions, linkPreview, linkPreviewHighQuality } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  const body: EditMessageRequest = { text }
  if (mentions !== undefined) body.mentions = mentions
  if (linkPreview !== undefined) body.linkPreview = linkPreview
  if (linkPreviewHighQuality !== undefined) body.linkPreviewHighQuality = linkPreviewHighQuality

  return wahaRequest<WAMessage>({
    config,
    method: "PUT",
    path: wahaPathSession(
      sessionR.data,
      `/chats/${encodeURIComponent(chatId)}/messages/${encodeURIComponent(messageId)}`,
    ),
    body,
  })
}
