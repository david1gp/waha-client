import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined, configSchema, sessionOptionalSchema, wahaFileSchema } from "./messageSchemas.js"
import type { WahaFile } from "./profileTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const statusImageSendOptionsSchema = a.object({
  config: configSchema,
  session: sessionOptionalSchema,
  file: wahaFileSchema,
  caption: a.optional(a.string()),
  id: a.optional(a.string()),
  contacts: a.optional(a.array(a.string())),
})

export type StatusImageSendOptions = {
  config: WahaClientConfig
  session?: string
  file: WahaFile
  caption?: string
  id?: string
  contacts?: string[]
}

export async function statusImageSend(options: StatusImageSendOptions): PromiseResult<unknown> {
  const op = "statusImageSend"
  const parsed = a.safeParse(statusImageSendOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, file, caption, id, contacts } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest({
    config,
    method: "POST",
    path: wahaPathSession(sessionR.data, "/status/image"),
    body: bodyOmitUndefined({ file, caption, id, contacts }),
  })
}
