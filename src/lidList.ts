import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { LidToPhoneNumber } from "./contactTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const lidListOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  limit: a.optional(a.number()),
  offset: a.optional(a.number()),
})

export type LidListOptions = {
  config: WahaClientConfig
  session?: string
  limit?: number
  offset?: number
}

/** GET /api/{session}/lids */
export async function lidList(options: LidListOptions): PromiseResult<LidToPhoneNumber[]> {
  const op = "lidList"
  const parsed = a.safeParse(lidListOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, limit, offset } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<LidToPhoneNumber[]>({
    config,
    method: "GET",
    path: wahaPathSession(sessionR.data, "/lids"),
    query: { limit, offset },
  })
}
