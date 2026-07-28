import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { ChannelView } from "./channelTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const channelSearchViewsGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
})

export type ChannelSearchViewsGetOptions = {
  config: WahaClientConfig
  session?: string
}

export async function channelSearchViewsGet(options: ChannelSearchViewsGetOptions): PromiseResult<ChannelView[]> {
  const op = "channelSearchViewsGet"
  const parsed = a.safeParse(channelSearchViewsGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<ChannelView[]>({
    config,
    method: "GET",
    path: wahaPathSession(sessionR.data, "/channels/search/views"),
  })
}
