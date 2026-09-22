import type { StatusVoiceSendOptions } from "./statusVoiceSendOptions.js"

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

const statusVoiceSendOptionsSchema = a.object({
  config: configSchema,
  session: sessionOptionalSchema,
  file: wahaFileSchema,
  backgroundColor: a.optional(a.string()),
  convert: a.optional(a.boolean()),
  id: a.optional(a.string()),
  contacts: a.optional(a.array(a.string())),
})

export async function statusVoiceSend(options: StatusVoiceSendOptions): PromiseResult<unknown> {
  const op = "statusVoiceSend"
  const parsed = a.safeParse(statusVoiceSendOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, file, backgroundColor, convert, id, contacts } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest({
    config,
    method: "POST",
    path: wahaPathSession(sessionR.data, "/status/voice"),
    body: bodyOmitUndefined({ file, backgroundColor, convert, id, contacts }),
  })
}
