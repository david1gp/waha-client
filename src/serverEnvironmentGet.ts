import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathApi } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"

const serverEnvironmentGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  all: a.optional(a.boolean()),
})

export type ServerEnvironmentGetOptions = {
  config: WahaClientConfig
  /** Include all env vars (default: WAHA_*, WHATSAPP_*, DEBUG only). */
  all?: boolean
}

export async function serverEnvironmentGet(
  options: ServerEnvironmentGetOptions,
): PromiseResult<Record<string, string>> {
  const op = "serverEnvironmentGet"
  const parsed = a.safeParse(serverEnvironmentGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, all } = parsed.output
  return wahaRequest<Record<string, string>>({
    config,
    method: "GET",
    path: wahaPathApi("/server/environment"),
    query: all !== undefined ? { all } : undefined,
  })
}
