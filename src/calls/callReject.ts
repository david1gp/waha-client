import type { CallRejectOptions } from "./callRejectOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { configSchema } from "../client/configSchema.js"
import { sessionOptionalSchema } from "../sessions/sessionOptionalSchema.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const callRejectOptionsSchema = a.object({
  config: configSchema,
  session: sessionOptionalSchema,
  from: a.pipe(a.string(), a.minLength(1)),
  id: a.pipe(a.string(), a.minLength(1)),
})

export async function callReject(options: CallRejectOptions): PromiseResult<undefined> {
  const op = "callReject"
  const parsed = a.safeParse(callRejectOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

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
