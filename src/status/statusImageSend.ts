import type { StatusImageSendOptions } from "./statusImageSendOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { configSchema } from "../client/configSchema.js"
import { sessionOptionalSchema } from "../sessions/sessionOptionalSchema.js"
import { wahaFileSchema } from "../media/wahaFileSchema.js"
import type { WahaFile } from "../media/wahaFile.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const statusImageSendOptionsSchema = a.object({
  config: configSchema,
  session: sessionOptionalSchema,
  file: wahaFileSchema,
  caption: a.optional(a.string()),
  id: a.optional(a.string()),
  contacts: a.optional(a.array(a.string())),
})

export async function statusImageSend(options: StatusImageSendOptions): PromiseResult<unknown> {
  const op = "statusImageSend"
  const parsed = a.safeParse(statusImageSendOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

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
