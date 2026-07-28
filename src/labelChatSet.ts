import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { LabelID } from "./labelTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const labelIdSchema = a.object({ id: a.string() })

const labelChatSetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  chatId: a.pipe(a.string(), a.minLength(1)),
  labels: a.array(labelIdSchema),
})

export type LabelChatSetOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
  labels: LabelID[]
}

export async function labelChatSet(options: LabelChatSetOptions): PromiseResult<unknown> {
  const op = "labelChatSet"
  const parsed = a.safeParse(labelChatSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, chatId, labels } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest({
    config,
    method: "PUT",
    path: wahaPathSession(sessionR.data, `/labels/chats/${encodeURIComponent(chatId)}`),
    body: { labels },
  })
}
