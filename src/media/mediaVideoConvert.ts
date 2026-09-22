import type { MediaVideoConvertOptions } from "./mediaVideoConvertOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { configSchema } from "../client/configSchema.js"
import { sessionOptionalSchema } from "../sessions/sessionOptionalSchema.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const mediaVideoConvertOptionsSchema = a.object({
  config: configSchema,
  session: sessionOptionalSchema,
  url: a.optional(a.string()),
  data: a.optional(a.string()),
})

export async function mediaVideoConvert(options: MediaVideoConvertOptions): PromiseResult<Uint8Array> {
  const op = "mediaVideoConvert"
  const parsed = a.safeParse(mediaVideoConvertOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, url, data } = parsed.output
  if ((url == null || url === "") && (data == null || data === "")) {
    return createResultError(op, "Either url or data is required")
  }

  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest({
    config,
    method: "POST",
    path: wahaPathSession(sessionR.data, "/media/convert/video"),
    body: bodyOmitUndefined({ url, data }),
    responseType: "bytes",
  })
}
