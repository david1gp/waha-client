import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { Channel, ChannelRoleFilter } from "./channelTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const channelListOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  role: a.optional(a.picklist(["OWNER", "ADMIN", "SUBSCRIBER"])),
})

export type ChannelListOptions = {
  config: WahaClientConfig
  session?: string
  role?: ChannelRoleFilter
}

export async function channelList(options: ChannelListOptions): PromiseResult<Channel[]> {
  const op = "channelList"
  const parsed = a.safeParse(channelListOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

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
