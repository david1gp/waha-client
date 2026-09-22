import type { NumberStatusCheckOptions } from "./numberStatusCheckOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { configSchema } from "../client/configSchema.js"
import { sessionOptionalSchema } from "../sessions/sessionOptionalSchema.js"
import type { WANumberExistResult } from "../contacts/waNumberExistResult.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathApi } from "../client/wahaPathApi.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

/** @deprecated Prefer contacts check-exists when available */
const numberStatusCheckOptionsSchema = a.object({
  config: configSchema,
  session: sessionOptionalSchema,
  phone: a.pipe(a.string(), a.minLength(1)),
})

export async function numberStatusCheck(options: NumberStatusCheckOptions): PromiseResult<WANumberExistResult> {
  const op = "numberStatusCheck"
  const parsed = a.safeParse(numberStatusCheckOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

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
