import type { StatusTextSendOptions } from "./statusTextSendOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { configSchema } from "../client/configSchema.js"
import { sessionOptionalSchema } from "../sessions/sessionOptionalSchema.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const statusTextSendOptionsSchema = a.object({
  config: configSchema,
  session: sessionOptionalSchema,
  text: a.string(),
  backgroundColor: a.optional(a.string()),
  font: a.optional(a.number()),
  linkPreview: a.optional(a.boolean()),
  linkPreviewHighQuality: a.optional(a.boolean()),
  id: a.optional(a.string()),
  contacts: a.optional(a.array(a.string())),
})

export async function statusTextSend(options: StatusTextSendOptions): PromiseResult<unknown> {
  const op = "statusTextSend"
  const parsed = a.safeParse(statusTextSendOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, text, backgroundColor, font, linkPreview, linkPreviewHighQuality, id, contacts } =
    parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest({
    config,
    method: "POST",
    path: wahaPathSession(sessionR.data, "/status/text"),
    body: bodyOmitUndefined({
      text,
      backgroundColor,
      font,
      linkPreview,
      linkPreviewHighQuality,
      id,
      contacts,
    }),
  })
}
