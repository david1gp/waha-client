import type { ServerDebugBrowserTraceGetOptions } from "./serverDebugBrowserTraceGetOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathApi } from "../client/wahaPathApi.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const serverDebugBrowserTraceGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  seconds: a.pipe(a.number(), a.minValue(1)),
  categories: a.optional(a.array(a.string())),
})

export async function serverDebugBrowserTraceGet(
  options: ServerDebugBrowserTraceGetOptions,
): PromiseResult<Uint8Array> {
  const op = "serverDebugBrowserTraceGet"
  const parsed = a.safeParse(serverDebugBrowserTraceGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

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
