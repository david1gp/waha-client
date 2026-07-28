import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { PinDuration, PinMessageResponse } from "./chatTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const chatMessagePinOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  chatId: a.pipe(a.string(), a.minLength(1)),
  messageId: a.pipe(a.string(), a.minLength(1)),
  duration: a.picklist([86400, 604800, 2592000] as const),
})

export type ChatMessagePinOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
  messageId: string
  /** Seconds: 86400 (day), 604800 (week), 2592000 (month) */
  duration: PinDuration
}

export async function chatMessagePin(options: ChatMessagePinOptions): PromiseResult<PinMessageResponse> {
  const op = "chatMessagePin"
  const parsed = a.safeParse(chatMessagePinOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, chatId, messageId, duration } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<PinMessageResponse>({
    config,
    method: "POST",
    path: wahaPathSession(
      sessionR.data,
      `/chats/${encodeURIComponent(chatId)}/messages/${encodeURIComponent(messageId)}/pin`,
    ),
    body: { duration },
  })
}
