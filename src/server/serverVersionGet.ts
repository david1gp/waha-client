import type { ServerVersionGetOptions } from "./serverVersionGetOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { WahaEnvironment } from "./wahaEnvironment.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathApi } from "../client/wahaPathApi.js"
import { wahaRequest } from "../client/wahaRequest.js"

const serverVersionGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
})

export async function serverVersionGet(options: ServerVersionGetOptions): PromiseResult<WahaEnvironment> {
  const op = "serverVersionGet"
  const parsed = a.safeParse(serverVersionGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  return wahaRequest<WahaEnvironment>({
    config: parsed.output.config,
    method: "GET",
    path: wahaPathApi("/server/version"),
  })
}
