import type { ServerDebugCpuGetOptions } from "./serverDebugCpuGetOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathApi } from "../client/wahaPathApi.js"
import { wahaRequest } from "../client/wahaRequest.js"

const serverDebugCpuGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  seconds: a.optional(a.pipe(a.number(), a.minValue(1))),
})

export async function serverDebugCpuGet(options: ServerDebugCpuGetOptions): PromiseResult<Record<string, unknown>> {
  const op = "serverDebugCpuGet"
  const parsed = a.safeParse(serverDebugCpuGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, seconds } = parsed.output
  return wahaRequest<Record<string, unknown>>({
    config,
    method: "GET",
    path: wahaPathApi("/server/debug/cpu"),
    query: seconds !== undefined ? { seconds } : undefined,
  })
}
