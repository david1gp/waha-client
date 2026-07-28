import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { HealthCheckResponse } from "./serverTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaRequest } from "./wahaRequest.js"

const serverHealthOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
})

export type ServerHealthOptions = {
  config: WahaClientConfig
}

export async function serverHealth(options: ServerHealthOptions): PromiseResult<HealthCheckResponse> {
  const op = "serverHealth"
  const parsed = a.safeParse(serverHealthOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  return wahaRequest<HealthCheckResponse>({
    config: parsed.output.config,
    method: "GET",
    path: "/health",
  })
}
