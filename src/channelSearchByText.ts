import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { ChannelListResult } from "./channelTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const channelSearchByTextOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  text: a.pipe(a.string(), a.minLength(1)),
  categories: a.optional(a.array(a.string())),
  limit: a.optional(a.number()),
  startCursor: a.optional(a.string()),
})

export type ChannelSearchByTextOptions = {
  config: WahaClientConfig
  session?: string
  text: string
  categories?: string[]
  limit?: number
  startCursor?: string
}

export async function channelSearchByText(options: ChannelSearchByTextOptions): PromiseResult<ChannelListResult> {
  const op = "channelSearchByText"
  const parsed = a.safeParse(channelSearchByTextOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, text, categories, limit, startCursor } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  const body: Record<string, unknown> = { text }
  if (categories !== undefined) body.categories = categories
  if (limit !== undefined) body.limit = limit
  if (startCursor !== undefined) body.startCursor = startCursor

  return wahaRequest<ChannelListResult>({
    config,
    method: "POST",
    path: wahaPathSession(sessionR.data, "/channels/search/by-text"),
    body,
  })
}
