import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { StopResponse } from "./serverTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathApi } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"

const serverStopOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  force: a.optional(a.boolean()),
})

export type ServerStopOptions = {
  config: WahaClientConfig
  force?: boolean
}

export async function serverStop(options: ServerStopOptions): PromiseResult<StopResponse> {
  const op = "serverStop"
  const parsed = a.safeParse(serverStopOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, force } = parsed.output
  return wahaRequest<StopResponse>({
    config,
    method: "POST",
    path: wahaPathApi("/server/stop"),
    body: force !== undefined ? { force } : {},
  })
}
