import type { StatusDeleteOptions } from "./statusDeleteOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { configSchema } from "../client/configSchema.js"
import { sessionOptionalSchema } from "../sessions/sessionOptionalSchema.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const statusDeleteOptionsSchema = a.object({
  config: configSchema,
  session: sessionOptionalSchema,
  id: a.pipe(a.string(), a.minLength(1)),
  contacts: a.optional(a.array(a.string())),
})

export async function statusDelete(options: StatusDeleteOptions): PromiseResult<unknown> {
  const op = "statusDelete"
  const parsed = a.safeParse(statusDeleteOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

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
