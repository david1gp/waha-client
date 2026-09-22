import type { ChatListOptions } from "./chatListOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { ChatInfo } from "./chatInfo.js"
import type { ChatSortField } from "./chatSortField.js"
import type { SortOrder } from "./sortOrder.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const chatListOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  limit: a.optional(a.number()),
  offset: a.optional(a.number()),
  sortBy: a.optional(a.picklist(["conversationTimestamp", "id", "name"] as const)),
  sortOrder: a.optional(a.picklist(["asc", "desc"] as const)),
  merge: a.optional(a.boolean()),
})

export async function chatList(options: ChatListOptions): PromiseResult<ChatInfo[]> {
  const op = "chatList"
  const parsed = a.safeParse(chatListOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

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
