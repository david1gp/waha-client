import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { WAMessage } from "./chattingTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const chatMessageGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  chatId: a.pipe(a.string(), a.minLength(1)),
  messageId: a.pipe(a.string(), a.minLength(1)),
  downloadMedia: a.optional(a.boolean()),
  merge: a.optional(a.boolean()),
})

export type ChatMessageGetOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
  messageId: string
  downloadMedia?: boolean
  merge?: boolean
}

export async function chatMessageGet(options: ChatMessageGetOptions): PromiseResult<WAMessage> {
  const op = "chatMessageGet"
  const parsed = a.safeParse(chatMessageGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, chatId, messageId, downloadMedia, merge } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<WAMessage>({
    config,
    method: "GET",
    path: wahaPathSession(
      sessionR.data,
      `/chats/${encodeURIComponent(chatId)}/messages/${encodeURIComponent(messageId)}`,
    ),
    query: { downloadMedia, merge },
  })
}
