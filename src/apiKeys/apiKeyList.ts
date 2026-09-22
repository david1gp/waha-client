import type { ApiKeyListOptions } from "./apiKeyListOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { ApiKeyDTO } from "./apiKeyDTO.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathApi } from "../client/wahaPathApi.js"
import { wahaRequest } from "../client/wahaRequest.js"

const apiKeyListOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
})

export async function apiKeyList(options: ApiKeyListOptions): PromiseResult<ApiKeyDTO[]> {
  const op = "apiKeyList"
  const parsed = a.safeParse(apiKeyListOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  return wahaRequest<ApiKeyDTO[]>({
    config: parsed.output.config,
    method: "GET",
    path: wahaPathApi("/keys"),
  })
}
