import type { MessagesGetOptions } from "./messagesGetOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { chatIdSchema } from "../chats/chatIdSchema.js"
import { configSchema } from "../client/configSchema.js"
import { sessionOptionalSchema } from "../sessions/sessionOptionalSchema.js"
import type { WAMessage } from "./waMessage.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathApi } from "../client/wahaPathApi.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

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

export async function messagesGet(options: MessagesGetOptions): PromiseResult<WAMessage[]> {
  const op = "messagesGet"
  const parsed = a.safeParse(messagesGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

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
