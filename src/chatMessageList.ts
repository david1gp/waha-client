import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { MessageSortField, SortOrder, WaMessageAckName } from "./chatTypes.js"
import type { WAMessage } from "./chattingTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const chatMessageListOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  chatId: a.pipe(a.string(), a.minLength(1)),
  limit: a.optional(a.number()),
  offset: a.optional(a.number()),
  sortBy: a.optional(a.picklist(["timestamp", "messageTimestamp"] as const)),
  sortOrder: a.optional(a.picklist(["asc", "desc"] as const)),
  downloadMedia: a.optional(a.boolean()),
  merge: a.optional(a.boolean()),
  filterTimestampLte: a.optional(a.number()),
  filterTimestampGte: a.optional(a.number()),
  filterFromMe: a.optional(a.boolean()),
  filterAck: a.optional(a.picklist(["ERROR", "PENDING", "SERVER", "DEVICE", "READ", "PLAYED"] as const)),
})

export type ChatMessageListOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
  limit?: number
  offset?: number
  sortBy?: MessageSortField
  sortOrder?: SortOrder
  downloadMedia?: boolean
  merge?: boolean
  filterTimestampLte?: number
  filterTimestampGte?: number
  filterFromMe?: boolean
  filterAck?: WaMessageAckName
}

export async function chatMessageList(options: ChatMessageListOptions): PromiseResult<WAMessage[]> {
  const op = "chatMessageList"
  const parsed = a.safeParse(chatMessageListOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const {
    config,
    session,
    chatId,
    limit,
    offset,
    sortBy,
    sortOrder,
    downloadMedia,
    merge,
    filterTimestampLte,
    filterTimestampGte,
    filterFromMe,
    filterAck,
  } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<WAMessage[]>({
    config,
    method: "GET",
    path: wahaPathSession(sessionR.data, `/chats/${encodeURIComponent(chatId)}/messages`),
    query: {
      limit,
      offset,
      sortBy,
      sortOrder,
      downloadMedia,
      merge,
      "filter.timestamp.lte": filterTimestampLte,
      "filter.timestamp.gte": filterTimestampGte,
      "filter.fromMe": filterFromMe,
      "filter.ack": filterAck,
    },
  })
}
