import type { SessionTimelockGetOptions } from "./sessionTimelockGetOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { ReachoutTimelockData } from "./reachoutTimelockData.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const sessionTimelockGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
})

export async function sessionTimelockGet(options: SessionTimelockGetOptions): PromiseResult<ReachoutTimelockData> {
  const op = "sessionTimelockGet"
  const parsed = a.safeParse(sessionTimelockGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<ReachoutTimelockData>({
    config,
    method: "GET",
    path: wahaPathSession(sessionR.data, "/timelock"),
  })
}
