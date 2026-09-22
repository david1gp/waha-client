import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"
import type { Channel } from "./channel.js"
import type { ChannelListOptions } from "./channelListOptions.js"
import { channelRoleFilterSchema } from "./channelRoleFilter.js"

const channelListOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  role: a.optional(channelRoleFilterSchema),
})

export async function channelList(options: ChannelListOptions): PromiseResult<Channel[]> {
  const op = "channelList"
  const parsed = a.safeParse(channelListOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, role } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<Channel[]>({
    config,
    method: "GET",
    path: wahaPathSession(sessionR.data, "/channels"),
    query: { role },
  })
}
