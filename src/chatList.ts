import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { ChatInfo, ChatSortField, SortOrder } from "./chatTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const chatListOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  limit: a.optional(a.number()),
  offset: a.optional(a.number()),
  sortBy: a.optional(a.picklist(["conversationTimestamp", "id", "name"] as const)),
  sortOrder: a.optional(a.picklist(["asc", "desc"] as const)),
  merge: a.optional(a.boolean()),
})

export type ChatListOptions = {
  config: WahaClientConfig
  session?: string
  limit?: number
  offset?: number
  sortBy?: ChatSortField
  sortOrder?: SortOrder
  merge?: boolean
}

export async function chatList(options: ChatListOptions): PromiseResult<ChatInfo[]> {
  const op = "chatList"
  const parsed = a.safeParse(chatListOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, limit, offset, sortBy, sortOrder, merge } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<ChatInfo[]>({
    config,
    method: "GET",
    path: wahaPathSession(sessionR.data, "/chats"),
    query: { limit, offset, sortBy, sortOrder, merge },
  })
}
