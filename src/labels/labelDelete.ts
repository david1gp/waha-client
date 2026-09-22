import type { LabelDeleteOptions } from "./labelDeleteOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { LabelDeleteResult } from "./labelDeleteResult.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const labelDeleteOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  labelId: a.pipe(a.string(), a.minLength(1)),
})

export async function labelDelete(options: LabelDeleteOptions): PromiseResult<LabelDeleteResult> {
  const op = "labelDelete"
  const parsed = a.safeParse(labelDeleteOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, labelId } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<LabelDeleteResult>({
    config,
    method: "DELETE",
    path: wahaPathSession(sessionR.data, `/labels/${encodeURIComponent(labelId)}`),
  })
}
