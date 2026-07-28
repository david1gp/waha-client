import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const labelChatsByLabelGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  labelId: a.pipe(a.string(), a.minLength(1)),
})

export type LabelChatsByLabelGetOptions = {
  config: WahaClientConfig
  session?: string
  labelId: string
}

export async function labelChatsByLabelGet(options: LabelChatsByLabelGetOptions): PromiseResult<unknown> {
  const op = "labelChatsByLabelGet"
  const parsed = a.safeParse(labelChatsByLabelGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, labelId } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest({
    config,
    method: "GET",
    path: wahaPathSession(sessionR.data, `/labels/${encodeURIComponent(labelId)}/chats`),
  })
}
