import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { CountResponse } from "./contactTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const lidCountGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
})

export type LidCountGetOptions = {
  config: WahaClientConfig
  session?: string
}

/** GET /api/{session}/lids/count */
export async function lidCountGet(options: LidCountGetOptions): PromiseResult<CountResponse> {
  const op = "lidCountGet"
  const parsed = a.safeParse(lidCountGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<CountResponse>({
    config,
    method: "GET",
    path: wahaPathSession(sessionR.data, "/lids/count"),
  })
}
