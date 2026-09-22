import type { ServerStopOptions } from "./serverStopOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { StopResponse } from "./stopResponse.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathApi } from "../client/wahaPathApi.js"
import { wahaRequest } from "../client/wahaRequest.js"

const serverStopOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  force: a.optional(a.boolean()),
})

export async function serverStop(options: ServerStopOptions): PromiseResult<StopResponse> {
  const op = "serverStop"
  const parsed = a.safeParse(serverStopOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, force } = parsed.output
  return wahaRequest<StopResponse>({
    config,
    method: "POST",
    path: wahaPathApi("/server/stop"),
    body: force !== undefined ? { force } : {},
  })
}
