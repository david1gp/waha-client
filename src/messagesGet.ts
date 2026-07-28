import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { chatIdSchema, configSchema, sessionOptionalSchema } from "./messageSchemas.js"
import type { WAMessage } from "./chattingTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathApi } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

/** @deprecated Prefer GET /api/chats/{id}/messages */
const messagesGetOptionsSchema = a.object({
  config: configSchema,
  session: sessionOptionalSchema,
  chatId: chatIdSchema,
  limit: a.optional(a.number()),
  offset: a.optional(a.number()),
  sortBy: a.optional(a.string()),
  sortOrder: a.optional(a.picklist(["asc", "desc"])),
  downloadMedia: a.optional(a.boolean()),
  merge: a.optional(a.boolean()),
  "filter.timestamp.lte": a.optional(a.number()),
  "filter.timestamp.gte": a.optional(a.number()),
  "filter.fromMe": a.optional(a.boolean()),
  "filter.ack": a.optional(a.string()),
})

export type MessagesGetOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
  limit?: number
  offset?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
  downloadMedia?: boolean
  merge?: boolean
  "filter.timestamp.lte"?: number
  "filter.timestamp.gte"?: number
  "filter.fromMe"?: boolean
  "filter.ack"?: string
}

export async function messagesGet(options: MessagesGetOptions): PromiseResult<WAMessage[]> {
  const op = "messagesGet"
  const parsed = a.safeParse(messagesGetOptionsSchema, options)
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
    "filter.timestamp.lte": filterTimestampLte,
    "filter.timestamp.gte": filterTimestampGte,
    "filter.fromMe": filterFromMe,
    "filter.ack": filterAck,
  } = parsed.output

  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<WAMessage[]>({
    config,
    method: "GET",
    path: wahaPathApi("/messages"),
    query: {
      session: sessionR.data,
      chatId,
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
