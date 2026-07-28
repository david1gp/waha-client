import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined, configSchema, sessionOptionalSchema } from "./messageSchemas.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

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

export type StatusTextSendOptions = {
  config: WahaClientConfig
  session?: string
  text: string
  backgroundColor?: string
  font?: number
  linkPreview?: boolean
  linkPreviewHighQuality?: boolean
  id?: string
  contacts?: string[]
}

export async function statusTextSend(options: StatusTextSendOptions): PromiseResult<unknown> {
  const op = "statusTextSend"
  const parsed = a.safeParse(statusTextSendOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

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
