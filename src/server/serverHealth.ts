import type { ServerHealthOptions } from "./serverHealthOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { HealthCheckResponse } from "./healthCheckResponse.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaRequest } from "../client/wahaRequest.js"

const serverHealthOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
})

export async function serverHealth(options: ServerHealthOptions): PromiseResult<HealthCheckResponse> {
  const op = "serverHealth"
  const parsed = a.safeParse(serverHealthOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  return wahaRequest<HealthCheckResponse>({
    config: parsed.output.config,
    method: "GET",
    path: "/health",
  })
}
