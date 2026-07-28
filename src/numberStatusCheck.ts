import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { configSchema, sessionOptionalSchema } from "./messageSchemas.js"
import type { WANumberExistResult } from "./chattingTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathApi } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

/** @deprecated Prefer contacts check-exists when available */
const numberStatusCheckOptionsSchema = a.object({
  config: configSchema,
  session: sessionOptionalSchema,
  phone: a.pipe(a.string(), a.minLength(1)),
})

export type NumberStatusCheckOptions = {
  config: WahaClientConfig
  session?: string
  phone: string
}

export async function numberStatusCheck(options: NumberStatusCheckOptions): PromiseResult<WANumberExistResult> {
  const op = "numberStatusCheck"
  const parsed = a.safeParse(numberStatusCheckOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, phone } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<WANumberExistResult>({
    config,
    method: "GET",
    path: wahaPathApi("/checkNumberStatus"),
    query: { session: sessionR.data, phone },
  })
}
