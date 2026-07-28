import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { ApiKeyDTO } from "./apiKeyTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathApi } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"

const apiKeyListOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
})

export type ApiKeyListOptions = {
  config: WahaClientConfig
}

export async function apiKeyList(options: ApiKeyListOptions): PromiseResult<ApiKeyDTO[]> {
  const op = "apiKeyList"
  const parsed = a.safeParse(apiKeyListOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  return wahaRequest<ApiKeyDTO[]>({
    config: parsed.output.config,
    method: "GET",
    path: wahaPathApi("/keys"),
  })
}
