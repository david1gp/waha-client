import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathApi } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const screenshotGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
})

export type ScreenshotGetOptions = {
  config: WahaClientConfig
  session?: string
}

/** GET /api/screenshot?session=… → JPEG bytes. */
export async function screenshotGet(options: ScreenshotGetOptions): PromiseResult<Uint8Array> {
  const op = "screenshotGet"
  const parsed = a.safeParse(screenshotGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest({
    config,
    method: "GET",
    path: wahaPathApi("/screenshot"),
    query: { session: sessionR.data },
    responseType: "bytes",
  })
}
