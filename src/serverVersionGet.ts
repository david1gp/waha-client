import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { WahaEnvironment } from "./serverTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathApi } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"

const serverVersionGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
})

export type ServerVersionGetOptions = {
  config: WahaClientConfig
}

/** GET /api/server/version (preferred over deprecated GET /api/version). */
export async function serverVersionGet(options: ServerVersionGetOptions): PromiseResult<WahaEnvironment> {
  const op = "serverVersionGet"
  const parsed = a.safeParse(serverVersionGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  return wahaRequest<WahaEnvironment>({
    config: parsed.output.config,
    method: "GET",
    path: wahaPathApi("/server/version"),
  })
}
