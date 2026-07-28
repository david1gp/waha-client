import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { ApiKeyDTO, ApiKeyRequest } from "./apiKeyTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathApi } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"

const apiKeyCreateOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  body: a.optional(a.record(a.string(), a.unknown())),
})

export type ApiKeyCreateOptions = {
  config: WahaClientConfig
  body?: ApiKeyRequest
}

export async function apiKeyCreate(options: ApiKeyCreateOptions): PromiseResult<ApiKeyDTO> {
  const op = "apiKeyCreate"
  const parsed = a.safeParse(apiKeyCreateOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, body } = parsed.output
  return wahaRequest<ApiKeyDTO>({
    config,
    method: "POST",
    path: wahaPathApi("/keys"),
    body: body ?? {},
  })
}
