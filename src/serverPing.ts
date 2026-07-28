import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { PingResponse } from "./serverTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaRequest } from "./wahaRequest.js"

const serverPingOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
})

export type ServerPingOptions = {
  config: WahaClientConfig
}

export async function serverPing(options: ServerPingOptions): PromiseResult<PingResponse> {
  const op = "serverPing"
  const parsed = a.safeParse(serverPingOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  return wahaRequest<PingResponse>({
    config: parsed.output.config,
    method: "GET",
    path: "/ping",
  })
}
