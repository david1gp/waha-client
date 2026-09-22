import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { ChannelListResult } from "./channelListResult.js"
import type { ChannelSearchByViewOptions } from "./channelSearchByViewOptions.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const channelSearchByViewOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  view: a.optional(a.string()),
  countries: a.optional(a.array(a.string())),
  categories: a.optional(a.array(a.string())),
  limit: a.optional(a.number()),
  startCursor: a.optional(a.string()),
})

export async function channelSearchByView(options: ChannelSearchByViewOptions): PromiseResult<ChannelListResult> {
  const op = "channelSearchByView"
  const parsed = a.safeParse(channelSearchByViewOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

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
