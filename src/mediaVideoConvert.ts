import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined, configSchema, sessionOptionalSchema } from "./messageSchemas.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const mediaVideoConvertOptionsSchema = a.object({
  config: configSchema,
  session: sessionOptionalSchema,
  url: a.optional(a.string()),
  data: a.optional(a.string()),
})

export type MediaVideoConvertOptions = {
  config: WahaClientConfig
  session?: string
  url?: string
  data?: string
}

/** POST /api/{session}/media/convert/video → mp4 bytes. */
export async function mediaVideoConvert(options: MediaVideoConvertOptions): PromiseResult<Uint8Array> {
  const op = "mediaVideoConvert"
  const parsed = a.safeParse(mediaVideoConvertOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, url, data } = parsed.output
  if ((url == null || url === "") && (data == null || data === "")) {
    return createResultError(op, "Either url or data is required", JSON.stringify(options))
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
