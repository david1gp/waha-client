import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const channelDeleteOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  id: a.pipe(a.string(), a.minLength(1)),
})

export type ChannelDeleteOptions = {
  config: WahaClientConfig
  session?: string
  id: string
}

export async function channelDelete(options: ChannelDeleteOptions): PromiseResult<unknown> {
  const op = "channelDelete"
  const parsed = a.safeParse(channelDeleteOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, id } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest({
    config,
    method: "DELETE",
    path: wahaPathSession(sessionR.data, `/channels/${encodeURIComponent(id)}`),
  })
}
