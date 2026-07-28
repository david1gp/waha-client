import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined, configSchema, sessionOptionalSchema } from "./messageSchemas.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const statusDeleteOptionsSchema = a.object({
  config: configSchema,
  session: sessionOptionalSchema,
  id: a.pipe(a.string(), a.minLength(1)),
  contacts: a.optional(a.array(a.string())),
})

export type StatusDeleteOptions = {
  config: WahaClientConfig
  session?: string
  id: string
  contacts?: string[]
}

export async function statusDelete(options: StatusDeleteOptions): PromiseResult<unknown> {
  const op = "statusDelete"
  const parsed = a.safeParse(statusDeleteOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, id, contacts } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest({
    config,
    method: "POST",
    path: wahaPathSession(sessionR.data, "/status/delete"),
    body: bodyOmitUndefined({ id, contacts }),
  })
}
