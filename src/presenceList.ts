import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { WahaChatPresences } from "./presenceTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const presenceListOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
})

export type PresenceListOptions = {
  config: WahaClientConfig
  session?: string
}

export async function presenceList(options: PresenceListOptions): PromiseResult<WahaChatPresences[]> {
  const op = "presenceList"
  const parsed = a.safeParse(presenceListOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<WahaChatPresences[]>({
    config,
    method: "GET",
    path: wahaPathSession(sessionR.data, "/presence"),
  })
}
