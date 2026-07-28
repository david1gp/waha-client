import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { ChatSummary, OverviewBodyRequest } from "./chatTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const chatOverviewPostOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  pagination: a.object({
    limit: a.optional(a.number()),
    offset: a.optional(a.number()),
    merge: a.optional(a.boolean()),
  }),
  filter: a.optional(
    a.object({
      ids: a.optional(a.array(a.string())),
    }),
  ),
})

export type ChatOverviewPostOptions = {
  config: WahaClientConfig
  session?: string
  pagination: OverviewBodyRequest["pagination"]
  filter?: OverviewBodyRequest["filter"]
}

export async function chatOverviewPost(options: ChatOverviewPostOptions): PromiseResult<ChatSummary[]> {
  const op = "chatOverviewPost"
  const parsed = a.safeParse(chatOverviewPostOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, pagination, filter } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  const body: OverviewBodyRequest = { pagination }
  if (filter !== undefined) body.filter = filter

  return wahaRequest<ChatSummary[]>({
    config,
    method: "POST",
    path: wahaPathSession(sessionR.data, "/chats/overview"),
    body,
  })
}
