import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { Label } from "./labelTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const labelChatListOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  chatId: a.pipe(a.string(), a.minLength(1)),
})

export type LabelChatListOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
}

export async function labelChatList(options: LabelChatListOptions): PromiseResult<Label[]> {
  const op = "labelChatList"
  const parsed = a.safeParse(labelChatListOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, chatId } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<Label[]>({
    config,
    method: "GET",
    path: wahaPathSession(sessionR.data, `/labels/chats/${encodeURIComponent(chatId)}`),
  })
}
