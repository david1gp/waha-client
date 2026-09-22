import type { ChatPictureGetOptions } from "./chatPictureGetOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { ChatPictureResponse } from "./chatPictureResponse.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const chatPictureGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  chatId: a.pipe(a.string(), a.minLength(1)),
  refresh: a.optional(a.boolean()),
})

export async function chatPictureGet(options: ChatPictureGetOptions): PromiseResult<ChatPictureResponse> {
  const op = "chatPictureGet"
  const parsed = a.safeParse(chatPictureGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

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
