import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { ChatSummary } from "./chatTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const chatOverviewGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  limit: a.optional(a.number()),
  offset: a.optional(a.number()),
  merge: a.optional(a.boolean()),
  ids: a.optional(a.array(a.string())),
})

export type ChatOverviewGetOptions = {
  config: WahaClientConfig
  session?: string
  limit?: number
  offset?: number
  merge?: boolean
  /** Filter by chat ids (GET query `ids`) */
  ids?: string[]
}

export async function chatOverviewGet(options: ChatOverviewGetOptions): PromiseResult<ChatSummary[]> {
  const op = "chatOverviewGet"
  const parsed = a.safeParse(chatOverviewGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, limit, offset, merge, ids } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<ChatSummary[]>({
    config,
    method: "GET",
    path: wahaPathSession(sessionR.data, "/chats/overview"),
    query: {
      limit,
      offset,
      merge,
      ids,
    },
  })
}
