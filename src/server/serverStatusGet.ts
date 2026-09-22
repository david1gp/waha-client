import type { ServerStatusGetOptions } from "./serverStatusGetOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { ServerStatusResponse } from "./serverStatusResponse.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathApi } from "../client/wahaPathApi.js"
import { wahaRequest } from "../client/wahaRequest.js"

const serverStatusGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
})

export async function serverStatusGet(options: ServerStatusGetOptions): PromiseResult<ServerStatusResponse> {
  const op = "serverStatusGet"
  const parsed = a.safeParse(serverStatusGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  return wahaRequest<ServerStatusResponse>({
    config: parsed.output.config,
    method: "GET",
    path: wahaPathApi("/server/status"),
  })
}
