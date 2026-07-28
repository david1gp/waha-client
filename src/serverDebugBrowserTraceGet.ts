import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathApi } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const serverDebugBrowserTraceGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  seconds: a.pipe(a.number(), a.minValue(1)),
  categories: a.optional(a.array(a.string())),
})

export type ServerDebugBrowserTraceGetOptions = {
  config: WahaClientConfig
  session?: string
  seconds: number
  categories?: string[]
}

export async function serverDebugBrowserTraceGet(
  options: ServerDebugBrowserTraceGetOptions,
): PromiseResult<Uint8Array> {
  const op = "serverDebugBrowserTraceGet"
  const parsed = a.safeParse(serverDebugBrowserTraceGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, seconds, categories } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  const query: Record<string, string | number | boolean | undefined | null> = { seconds }
  if (categories !== undefined && categories.length > 0) {
    // Nest accepts a single value and wraps it; pass first when multiple unsupported by query helper
    query.categories = categories.length === 1 ? categories[0] : categories.join(",")
  }

  return wahaRequest({
    config,
    method: "GET",
    path: wahaPathApi(`/server/debug/browser/trace/${encodeURIComponent(sessionR.data)}`),
    query,
    responseType: "bytes",
  })
}
