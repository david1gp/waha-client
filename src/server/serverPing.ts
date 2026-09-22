import type { ServerPingOptions } from "./serverPingOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { PingResponse } from "./pingResponse.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaRequest } from "../client/wahaRequest.js"

const serverPingOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
})

export async function serverPing(options: ServerPingOptions): PromiseResult<PingResponse> {
  const op = "serverPing"
  const parsed = a.safeParse(serverPingOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  return wahaRequest<PingResponse>({
    config: parsed.output.config,
    method: "GET",
    path: "/ping",
  })
}
