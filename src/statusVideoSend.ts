import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined, configSchema, sessionOptionalSchema, wahaFileSchema } from "./messageSchemas.js"
import type { WahaFile } from "./profileTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const statusVideoSendOptionsSchema = a.object({
  config: configSchema,
  session: sessionOptionalSchema,
  file: wahaFileSchema,
  caption: a.optional(a.string()),
  convert: a.optional(a.boolean()),
  id: a.optional(a.string()),
  contacts: a.optional(a.array(a.string())),
})

export type StatusVideoSendOptions = {
  config: WahaClientConfig
  session?: string
  file: WahaFile
  caption?: string
  convert?: boolean
  id?: string
  contacts?: string[]
}

export async function statusVideoSend(options: StatusVideoSendOptions): PromiseResult<unknown> {
  const op = "statusVideoSend"
  const parsed = a.safeParse(statusVideoSendOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, file, caption, convert, id, contacts } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest({
    config,
    method: "POST",
    path: wahaPathSession(sessionR.data, "/status/video"),
    body: bodyOmitUndefined({ file, caption, convert, id, contacts }),
  })
}
