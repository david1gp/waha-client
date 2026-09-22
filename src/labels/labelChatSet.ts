import type { LabelChatSetOptions } from "./labelChatSetOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { LabelID } from "./labelID.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const labelIdSchema = a.object({ id: a.string() })

const labelChatSetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  chatId: a.pipe(a.string(), a.minLength(1)),
  labels: a.array(labelIdSchema),
})

export async function labelChatSet(options: LabelChatSetOptions): PromiseResult<unknown> {
  const op = "labelChatSet"
  const parsed = a.safeParse(labelChatSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

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
