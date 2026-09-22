import type { ServerEnvironmentGetOptions } from "./serverEnvironmentGetOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathApi } from "../client/wahaPathApi.js"
import { wahaRequest } from "../client/wahaRequest.js"

const serverEnvironmentGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  all: a.optional(a.boolean()),
})

export async function serverEnvironmentGet(
  options: ServerEnvironmentGetOptions,
): PromiseResult<Record<string, string>> {
  const op = "serverEnvironmentGet"
  const parsed = a.safeParse(serverEnvironmentGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, all } = parsed.output
  return wahaRequest<Record<string, string>>({
    config,
    method: "GET",
    path: wahaPathApi("/server/environment"),
    query: all !== undefined ? { all } : undefined,
  })
}
