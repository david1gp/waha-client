import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { ReadChatMessagesResponse } from "./chatTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const chatMessageReadOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  chatId: a.pipe(a.string(), a.minLength(1)),
  messages: a.optional(a.number()),
  days: a.optional(a.number()),
})

export type ChatMessageReadOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
  /** How many messages to read (latest first) */
  messages?: number
  /** How many days to read (latest first); server default 7 */
  days?: number
}

export async function chatMessageRead(options: ChatMessageReadOptions): PromiseResult<ReadChatMessagesResponse> {
  const op = "chatMessageRead"
  const parsed = a.safeParse(chatMessageReadOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, chatId, messages, days } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<ReadChatMessagesResponse>({
    config,
    method: "POST",
    path: wahaPathSession(sessionR.data, `/chats/${encodeURIComponent(chatId)}/messages/read`),
    query: { messages, days },
  })
}
