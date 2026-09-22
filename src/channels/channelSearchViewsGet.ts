import type { ChannelSearchViewsGetOptions } from "./channelSearchViewsGetOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { ChannelView } from "./channelView.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const channelSearchViewsGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
})

export async function channelSearchViewsGet(options: ChannelSearchViewsGetOptions): PromiseResult<ChannelView[]> {
  const op = "channelSearchViewsGet"
  const parsed = a.safeParse(channelSearchViewsGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<ChannelView[]>({
    config,
    method: "GET",
    path: wahaPathSession(sessionR.data, "/channels/search/views"),
  })
}
