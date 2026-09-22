import type { ChatMessageUnpinOptions } from "./chatMessageUnpinOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { PinMessageResponse } from "./pinMessageResponse.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const chatMessageUnpinOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  chatId: a.pipe(a.string(), a.minLength(1)),
  messageId: a.pipe(a.string(), a.minLength(1)),
})

export async function chatMessageUnpin(options: ChatMessageUnpinOptions): PromiseResult<PinMessageResponse> {
  const op = "chatMessageUnpin"
  const parsed = a.safeParse(chatMessageUnpinOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

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
