import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { Label } from "./labelTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const labelListOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
})

export type LabelListOptions = {
  config: WahaClientConfig
  session?: string
}

export async function labelList(options: LabelListOptions): PromiseResult<Label[]> {
  const op = "labelList"
  const parsed = a.safeParse(labelListOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<Label[]>({
    config,
    method: "GET",
    path: wahaPathSession(sessionR.data, "/labels"),
  })
}
