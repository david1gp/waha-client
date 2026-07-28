import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { PinMessageResponse } from "./chatTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const chatMessageUnpinOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  chatId: a.pipe(a.string(), a.minLength(1)),
  messageId: a.pipe(a.string(), a.minLength(1)),
})

export type ChatMessageUnpinOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
  messageId: string
}

export async function chatMessageUnpin(options: ChatMessageUnpinOptions): PromiseResult<PinMessageResponse> {
  const op = "chatMessageUnpin"
  const parsed = a.safeParse(chatMessageUnpinOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, chatId, messageId } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<PinMessageResponse>({
    config,
    method: "POST",
    path: wahaPathSession(
      sessionR.data,
      `/chats/${encodeURIComponent(chatId)}/messages/${encodeURIComponent(messageId)}/unpin`,
    ),
  })
}
