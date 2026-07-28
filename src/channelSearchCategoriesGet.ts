import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { ChannelCategory } from "./channelTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const channelSearchCategoriesGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
})

export type ChannelSearchCategoriesGetOptions = {
  config: WahaClientConfig
  session?: string
}

export async function channelSearchCategoriesGet(
  options: ChannelSearchCategoriesGetOptions,
): PromiseResult<ChannelCategory[]> {
  const op = "channelSearchCategoriesGet"
  const parsed = a.safeParse(channelSearchCategoriesGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<ChannelCategory[]>({
    config,
    method: "GET",
    path: wahaPathSession(sessionR.data, "/channels/search/categories"),
  })
}
