import type { ChannelMessagePreviewGetOptions } from "./channelMessagePreviewGetOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { ChannelMessage } from "./channelMessage.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const channelMessagePreviewGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  id: a.pipe(a.string(), a.minLength(1)),
  downloadMedia: a.optional(a.boolean()),
  limit: a.optional(a.number()),
})

export async function channelMessagePreviewGet(
  options: ChannelMessagePreviewGetOptions,
): PromiseResult<ChannelMessage[]> {
  const op = "channelMessagePreviewGet"
  const parsed = a.safeParse(channelMessagePreviewGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

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
