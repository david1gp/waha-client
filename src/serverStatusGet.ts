import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { ServerStatusResponse } from "./serverTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathApi } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"

const serverStatusGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
})

export type ServerStatusGetOptions = {
  config: WahaClientConfig
}

export async function serverStatusGet(options: ServerStatusGetOptions): PromiseResult<ServerStatusResponse> {
  const op = "serverStatusGet"
  const parsed = a.safeParse(serverStatusGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  return wahaRequest<ServerStatusResponse>({
    config: parsed.output.config,
    method: "GET",
    path: wahaPathApi("/server/status"),
  })
}
