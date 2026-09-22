import type { LabelChatListOptions } from "./labelChatListOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { Label } from "./label.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const labelChatListOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  chatId: a.pipe(a.string(), a.minLength(1)),
})

export async function labelChatList(options: LabelChatListOptions): PromiseResult<Label[]> {
  const op = "labelChatList"
  const parsed = a.safeParse(labelChatListOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, chatId } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<Label[]>({
    config,
    method: "GET",
    path: wahaPathSession(sessionR.data, `/labels/chats/${encodeURIComponent(chatId)}`),
  })
}
