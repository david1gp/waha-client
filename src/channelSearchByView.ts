import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { ChannelListResult } from "./channelTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const channelSearchByViewOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  view: a.optional(a.string()),
  countries: a.optional(a.array(a.string())),
  categories: a.optional(a.array(a.string())),
  limit: a.optional(a.number()),
  startCursor: a.optional(a.string()),
})

export type ChannelSearchByViewOptions = {
  config: WahaClientConfig
  session?: string
  view?: string
  countries?: string[]
  categories?: string[]
  limit?: number
  startCursor?: string
}

export async function channelSearchByView(options: ChannelSearchByViewOptions): PromiseResult<ChannelListResult> {
  const op = "channelSearchByView"
  const parsed = a.safeParse(channelSearchByViewOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, view, countries, categories, limit, startCursor } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  const body: Record<string, unknown> = {}
  if (view !== undefined) body.view = view
  if (countries !== undefined) body.countries = countries
  if (categories !== undefined) body.categories = categories
  if (limit !== undefined) body.limit = limit
  if (startCursor !== undefined) body.startCursor = startCursor

  return wahaRequest<ChannelListResult>({
    config,
    method: "POST",
    path: wahaPathSession(sessionR.data, "/channels/search/by-view"),
    body,
  })
}
