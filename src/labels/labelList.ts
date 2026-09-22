import type { LabelListOptions } from "./labelListOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { Label } from "./label.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const labelListOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
})

export async function labelList(options: LabelListOptions): PromiseResult<Label[]> {
  const op = "labelList"
  const parsed = a.safeParse(labelListOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<Label[]>({
    config,
    method: "GET",
    path: wahaPathSession(sessionR.data, "/labels"),
  })
}
