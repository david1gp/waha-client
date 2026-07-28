import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { ChannelMessage } from "./channelTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const channelMessagePreviewGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  id: a.pipe(a.string(), a.minLength(1)),
  downloadMedia: a.optional(a.boolean()),
  limit: a.optional(a.number()),
})

export type ChannelMessagePreviewGetOptions = {
  config: WahaClientConfig
  session?: string
  id: string
  downloadMedia?: boolean
  limit?: number
}

export async function channelMessagePreviewGet(
  options: ChannelMessagePreviewGetOptions,
): PromiseResult<ChannelMessage[]> {
  const op = "channelMessagePreviewGet"
  const parsed = a.safeParse(channelMessagePreviewGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, id, downloadMedia, limit } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<ChannelMessage[]>({
    config,
    method: "GET",
    path: wahaPathSession(sessionR.data, `/channels/${encodeURIComponent(id)}/messages/preview`),
    query: { downloadMedia, limit },
  })
}
