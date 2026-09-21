import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { ReachoutTimelockData } from "./reachoutTimelockData.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const sessionTimelockGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
})

export type SessionTimelockGetOptions = {
  config: WahaClientConfig
  session?: string
}

export async function sessionTimelockGet(options: SessionTimelockGetOptions): PromiseResult<ReachoutTimelockData> {
  const op = "sessionTimelockGet"
  const parsed = a.safeParse(sessionTimelockGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<ReachoutTimelockData>({
    config,
    method: "GET",
    path: wahaPathSession(sessionR.data, "/timelock"),
  })
}
