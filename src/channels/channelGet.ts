import type { ChannelGetOptions } from "./channelGetOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { Channel } from "./channel.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const channelGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  id: a.pipe(a.string(), a.minLength(1)),
})

export async function channelGet(options: ChannelGetOptions): PromiseResult<Channel> {
  const op = "channelGet"
  const parsed = a.safeParse(channelGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, id } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<Channel>({
    config,
    method: "GET",
    path: wahaPathSession(sessionR.data, `/channels/${encodeURIComponent(id)}`),
  })
}
