import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { CountResponse } from "./groupTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const groupCountGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
})

export type GroupCountGetOptions = {
  config: WahaClientConfig
  session?: string
}

export async function groupCountGet(options: GroupCountGetOptions): PromiseResult<CountResponse> {
  const op = "groupCountGet"
  const parsed = a.safeParse(groupCountGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<CountResponse>({
    config,
    method: "GET",
    path: wahaPathSession(sessionR.data, "/groups/count"),
  })
}
