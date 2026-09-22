import type { ChatMessageDeleteOptions } from "./chatMessageDeleteOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const chatMessageDeleteOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  chatId: a.pipe(a.string(), a.minLength(1)),
  messageId: a.pipe(a.string(), a.minLength(1)),
})

export async function chatMessageDelete(options: ChatMessageDeleteOptions): PromiseResult<unknown> {
  const op = "chatMessageDelete"
  const parsed = a.safeParse(chatMessageDeleteOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, chatId, messageId } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest({
    config,
    method: "DELETE",
    path: wahaPathSession(
      sessionR.data,
      `/chats/${encodeURIComponent(chatId)}/messages/${encodeURIComponent(messageId)}`,
    ),
  })
}
