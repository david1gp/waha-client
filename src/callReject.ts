import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { configSchema, sessionOptionalSchema } from "./messageSchemas.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const callRejectOptionsSchema = a.object({
  config: configSchema,
  session: sessionOptionalSchema,
  from: a.pipe(a.string(), a.minLength(1)),
  id: a.pipe(a.string(), a.minLength(1)),
})

export type CallRejectOptions = {
  config: WahaClientConfig
  session?: string
  from: string
  id: string
}

export async function callReject(options: CallRejectOptions): PromiseResult<undefined> {
  const op = "callReject"
  const parsed = a.safeParse(callRejectOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, from, id } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest({
    config,
    method: "POST",
    path: wahaPathSession(sessionR.data, "/calls/reject"),
    body: { from, id },
    responseType: "void",
  })
}
