import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { ChatPictureResponse } from "./chatTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const chatPictureGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  chatId: a.pipe(a.string(), a.minLength(1)),
  refresh: a.optional(a.boolean()),
})

export type ChatPictureGetOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
  /** Refresh picture from server (24h cache by default) */
  refresh?: boolean
}

/** Returns `{ url }` JSON (not binary). */
export async function chatPictureGet(options: ChatPictureGetOptions): PromiseResult<ChatPictureResponse> {
  const op = "chatPictureGet"
  const parsed = a.safeParse(chatPictureGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, chatId, refresh } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<ChatPictureResponse>({
    config,
    method: "GET",
    path: wahaPathSession(sessionR.data, `/chats/${encodeURIComponent(chatId)}/picture`),
    query: { refresh },
  })
}
